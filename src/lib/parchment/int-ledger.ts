import { randomUUID } from 'node:crypto';
import type { Client, Transaction } from '@libsql/client';

export interface PreparedOrder {
  ownerId: string; mfcOrderId: string; requestDigest: string;
  releaseReference: string; senderCode: string; productCode: string;
}
export interface VerifiedReceipt {
  externalOrderId: string; documentId: string; eventTime: string;
  providerStatus: string; payloadDigest: string;
}
export class LedgerConflict extends Error { constructor(){super('Transcript state conflict');} }
export class IntLedger {
  constructor(private readonly client: Client) {}
  private async write<T>(operation:(tx:Transaction)=>Promise<T>):Promise<T> {
    const tx=await this.client.transaction('write');
    try {const value=await operation(tx);await tx.commit();return value;}
    catch(error){await tx.rollback().catch(()=>undefined);throw error;}
    finally{tx.close();}
  }
  async prepare(input:PreparedOrder) {
    return this.write(async tx=>{
      const existing=(await tx.execute({sql:'SELECT * FROM parchment_int_orders WHERE owner_id=? AND mfc_order_id=?',args:[input.ownerId,input.mfcOrderId]})).rows[0];
      if(existing){
        if(existing.request_digest!==input.requestDigest||existing.release_reference!==input.releaseReference||existing.sender_code!==input.senderCode||existing.product_code!==input.productCode)throw new LedgerConflict();
        return {externalOrderId:String(existing.external_order_id),state:String(existing.dispatch_state),replayed:true};
      }
      const id=randomUUID();
      await tx.execute({sql:'INSERT INTO parchment_int_orders(external_order_id,owner_id,mfc_order_id,request_digest,release_reference,sender_code,product_code,created_at) VALUES(?,?,?,?,?,?,?,?)',args:[id,input.ownerId,input.mfcOrderId,input.requestDigest,input.releaseReference,input.senderCode,input.productCode,new Date().toISOString()]});
      return {externalOrderId:id,state:'prepared',replayed:false};
    });
  }
  async readOwned(ownerId:string,mfcOrderId:string) {
    const row=(await this.client.execute({sql:'SELECT external_order_id,dispatch_state,reconciliation_required FROM parchment_int_orders WHERE owner_id=? AND mfc_order_id=?',args:[ownerId,mfcOrderId]})).rows[0];
    return row?{externalOrderId:String(row.external_order_id),state:String(row.dispatch_state),reconciliationRequired:row.reconciliation_required===1}:null;
  }
  /** Internal worker seam only. Commit uncertainty BEFORE any provider I/O.
   * No public route calls this, and an unknown claim is never automatically reclaimed. */
  async claim(ownerId:string,mfcOrderId:string,requestDigest:string) {
    return this.write(async tx=>{
      const id=randomUUID();
      const result=await tx.execute({sql:"UPDATE parchment_int_orders SET dispatch_state='unknown',claim_id=?,claimed_at=?,reconciliation_required=1 WHERE owner_id=? AND mfc_order_id=? AND request_digest=? AND dispatch_state='prepared' AND claim_id IS NULL RETURNING external_order_id",args:[id,new Date().toISOString(),ownerId,mfcOrderId,requestDigest]});
      return result.rows[0]?{claimId:id,externalOrderId:String(result.rows[0].external_order_id)}:null;
    });
  }
  async recordAccepted(externalOrderId:string,claimId:string) {
    return this.write(async tx=>{
      const row=(await tx.execute({sql:'SELECT dispatch_state,claim_id FROM parchment_int_orders WHERE external_order_id=?',args:[externalOrderId]})).rows[0];
      if(!row||row.claim_id!==claimId||!['unknown','accepted'].includes(String(row.dispatch_state)))throw new LedgerConflict();
      if(row.dispatch_state==='unknown')await tx.execute({sql:"UPDATE parchment_int_orders SET dispatch_state='accepted',accepted_at=? WHERE external_order_id=? AND claim_id=?",args:[new Date().toISOString(),externalOrderId,claimId]});
      return {state:'accepted',deliveryVerified:false};
    });
  }
  async correlation(externalOrderId:string) {
    const row=(await this.client.execute({sql:'SELECT sender_code,document_id,dispatch_state FROM parchment_int_orders WHERE external_order_id=?',args:[externalOrderId]})).rows[0];
    return row?{senderCode:String(row.sender_code),documentId:row.document_id===null?undefined:String(row.document_id),state:String(row.dispatch_state)}:null;
  }
  /** A signed provider report is evidence requiring reconciliation, not authority
   * to overwrite the order's outcome. No timestamp-based ordering is assumed. */
  async receipt(input:VerifiedReceipt) {
    return this.write(async tx=>{
      const row=(await tx.execute({sql:'SELECT dispatch_state,document_id FROM parchment_int_orders WHERE external_order_id=?',args:[input.externalOrderId]})).rows[0];
      if(!row||row.dispatch_state==='prepared'||(row.document_id!==null&&row.document_id!==input.documentId))throw new LedgerConflict();
      const previous=(await tx.execute({sql:'SELECT * FROM parchment_int_receipts WHERE payload_digest=?',args:[input.payloadDigest]})).rows[0];
      if(previous){
        if(previous.external_order_id!==input.externalOrderId||previous.document_id!==input.documentId||previous.event_time!==input.eventTime||previous.provider_status!==input.providerStatus)throw new LedgerConflict();
        return {replayed:true};
      }
      await tx.execute({sql:'INSERT INTO parchment_int_receipts(payload_digest,external_order_id,document_id,event_time,provider_status,received_at) VALUES(?,?,?,?,?,?)',args:[input.payloadDigest,input.externalOrderId,input.documentId,input.eventTime,input.providerStatus,new Date().toISOString()]});
      await tx.execute({sql:'UPDATE parchment_int_orders SET document_id=?,reconciliation_required=1 WHERE external_order_id=?',args:[input.documentId,input.externalOrderId]});
      return {replayed:false};
    });
  }
}
