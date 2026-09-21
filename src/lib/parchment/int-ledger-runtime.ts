import { createIntLedgerHandlers } from './int-ledger-http';
import { IntLedger } from './int-ledger';

let ledger:Promise<IntLedger>|undefined;
function openLedger(){
  if(!process.env.PARCHMENT_INT_DATABASE_URL)throw new Error('Missing INT database');
  return ledger??=(async()=>{
    const {createClient}=await import('@libsql/client');
    return new IntLedger(createClient({url:process.env.PARCHMENT_INT_DATABASE_URL!,authToken:process.env.PARCHMENT_INT_DATABASE_AUTH_TOKEN}));
  })();
}
/** Never load .env files, fall back to legacy DB, run DDL or enable transport. */
export function intLedgerHandlers(){
  return createIntLedgerHandlers({
    enabled:process.env.PARCHMENT_INT_LEDGER_ENABLED==='true',environment:process.env.TRANSCRIPT_ENVIRONMENT,
    serviceKey:process.env.PARCHMENT_INT_MFC_SERVICE_KEY,mfcAnonKey:process.env.PARCHMENT_INT_MFC_ANON_KEY,
    senderCode:process.env.PARCHMENT_INT_SENDER_CODE,productCode:process.env.PARCHMENT_INT_PRODUCT_CODE,
    webhookSecret:process.env.PARCHMENT_INT_WEBHOOK_SECRET,
    signatureEncoding:process.env.PARCHMENT_INT_SIGNATURE_ENCODING as 'hex'|'base64'|undefined,
  },openLedger);
}
