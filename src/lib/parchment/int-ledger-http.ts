import { createHash, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { IntLedger, LedgerConflict } from './int-ledger';
import { authenticateParchmentNotification, verifyParchmentStatusNotification } from './status-notification';

const AUTH_URL='https://fubdevscyujktpqsvpak.supabase.co/auth/v1/user';
const uuid=z.string().uuid().transform(value=>value.toLowerCase());
const prepareInput=z.object({mfcOrderId:uuid,requestDigest:z.string().regex(/^[0-9a-f]{64}$/),releaseReference:z.string().min(1).max(256)}).strict();
const lookupInput=z.object({mfcOrderId:uuid}).strict();
export interface IntLedgerConfig {
  enabled?:boolean; environment?:string; serviceKey?:string; mfcAnonKey?:string;
  senderCode?:string; productCode?:string; webhookSecret?:string;
  signatureEncoding?:'hex'|'base64';
}
function reply(status:number,errorOrValue:Record<string,unknown>){return Response.json(errorOrValue,{status,headers:{'Cache-Control':'no-store'}});}
function equalSecret(a:string,b:string){const x=createHash('sha256').update(a).digest(),y=createHash('sha256').update(b).digest();return timingSafeEqual(x,y);}
class ClientBodyError extends Error { constructor(readonly status:400|413|415){super('invalid_request');} }
async function rawBody(request:Request,limit:number,signal:AbortSignal,origin:'client'|'upstream'){
  const reject=(status:400|413|415):never=>{if(origin==='client')throw new ClientBodyError(status);throw new Error('invalid upstream response');};
  const declared=request.headers.get('content-length');
  if(request.headers.get('content-type')?.split(';')[0].trim().toLowerCase()!=='application/json')reject(415);
  if(declared!==null&&!/^\d+$/.test(declared))reject(400);
  if(declared!==null&&Number(declared)>limit)reject(413);
  if(!request.body)reject(400);
  const reader=request.body!.getReader();const parts:Uint8Array[]=[];let size=0;
  const abort=()=>{void reader.cancel().catch(()=>undefined);};signal.addEventListener('abort',abort,{once:true});
  try{while(true){if(signal.aborted)throw new Error('deadline');const next=await reader.read().catch(()=>{if(signal.aborted)throw new Error('deadline');return reject(400);});if(next.done)break;size+=next.value.length;if(size>limit)reject(413);parts.push(next.value);}if(signal.aborted)throw new Error('deadline');return Buffer.concat(parts);}
  finally{signal.removeEventListener('abort',abort);await reader.cancel().catch(()=>undefined);reader.releaseLock();}
}
/** Service key authenticates the MFC server, never learner ownership. Ownership
 * comes only from the fixed staging Auth verifier's user result. Browser hints,
 * request owner IDs and JWT claims decoded without verification are not used. */
async function owner(request:Request,config:IntLedgerConfig,signal:AbortSignal,fetcher:typeof fetch){
  const key=request.headers.get('x-mfc-service-key')||'';
  if(!config.serviceKey||config.serviceKey.length<32||!key||key.length>1024||!equalSecret(key,config.serviceKey)||!config.mfcAnonKey)return null;
  const authorization=request.headers.get('authorization')||'';
  if(!/^Bearer [^\s]+$/.test(authorization)||authorization.length>16_384)return null;
  const response=await fetcher(AUTH_URL,{method:'GET',redirect:'error',signal,headers:{Authorization:authorization,apikey:config.mfcAnonKey}});
  if(response.status===401||response.status===403)return null;
  if(!response.ok)throw new Error('authentication unavailable');
  const bytes=await rawBody(new Request(AUTH_URL,{method:'POST',body:response.body,duplex:'half',headers:response.headers} as RequestInit),32_768,signal,'upstream');
  const value=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
  const verified=uuid.safeParse(value?.id);
  return verified.success?verified.data:null;
}

/** No dispatch path is exposed. All routes are default-off, staging-only. */
export function createIntLedgerHandlers(config:IntLedgerConfig,ledger:()=>Promise<IntLedger>,fetcher:typeof fetch=fetch){
  const settings={...config};
  const enabled=()=>settings.enabled===true&&settings.environment==='staging'&&settings.senderCode==='1188441'&&settings.productCode==='3228';
  async function bounded(action:(signal:AbortSignal)=>Promise<Response>){
    const controller=new AbortController();let timer:ReturnType<typeof setTimeout>|undefined;
    try{return await Promise.race([action(controller.signal),new Promise<Response>(resolve=>{timer=setTimeout(()=>{controller.abort();resolve(reply(503,{error:'temporarily_unavailable'}));},10_000);})]);}
    catch(error){if(error instanceof ClientBodyError)return reply(error.status,{error:'invalid_request'});return reply(error instanceof LedgerConflict?409:503,{error:error instanceof LedgerConflict?'state_conflict':'temporarily_unavailable'});}
    finally{if(timer)clearTimeout(timer);controller.abort();}
  }
  const intake=(kind:'prepare'|'status')=>async(request:Request)=>{
    if(!enabled())return reply(503,{error:'integration_disabled'});
    if(request.method!=='POST')return reply(405,{error:'method_not_allowed'});
    return bounded(async signal=>{
      const ownerId=await owner(request,settings,signal,fetcher);if(!ownerId)return reply(401,{error:'unauthorized'});
      const raw=await rawBody(request,4096,signal,'client');let value:unknown;try{value=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(raw));}catch{return reply(400,{error:'invalid_request'});}
      const input=(kind==='prepare'?prepareInput:lookupInput).safeParse(value);if(!input.success)return reply(400,{error:'invalid_request'});
      if(signal.aborted)throw new Error('deadline');const db=await ledger();if(signal.aborted)throw new Error('deadline');
      if(kind==='status'){const result=await db.readOwned(ownerId,input.data.mfcOrderId);return result?reply(200,{...result,deliveryVerified:false}):reply(404,{error:'not_found'});}
      const prepared=prepareInput.parse(input.data);
      const result=await db.prepare({...prepared,ownerId,senderCode:settings.senderCode!,productCode:settings.productCode!});
      return reply(200,{...result,submitted:false,deliveryVerified:false});
    });
  };
  return {prepare:intake('prepare'),status:intake('status'),webhook:async(request:Request)=>{
    if(!enabled()||!settings.webhookSecret||settings.webhookSecret.length<32||!['hex','base64'].includes(settings.signatureEncoding||''))return reply(503,{error:'integration_disabled'});
    if(request.method!=='POST')return reply(405,{error:'method_not_allowed'});
    return bounded(async signal=>{
      const rawPayload=await rawBody(request,128_000,signal,'client');
      const verification={rawPayload,signature:request.headers.get('x-parchment-signature')||'',secret:settings.webhookSecret!,signatureEncoding:settings.signatureEncoding!};
      const authenticated=authenticateParchmentNotification(verification);if(!authenticated)return reply(401,{error:'unauthorized'});
      if(signal.aborted)throw new Error('deadline');const db=await ledger();if(signal.aborted)throw new Error('deadline');
      const correlation=await db.correlation(authenticated.orderLineItem.externalDocumentId);
      if(!correlation||correlation.state==='prepared'||correlation.senderCode!==settings.senderCode)return reply(409,{error:'reconciliation_required'});
      const verified=verifyParchmentStatusNotification({...verification,expectedExternalOrderId:authenticated.orderLineItem.externalDocumentId,expectedSenderCode:correlation.senderCode,expectedDocumentId:correlation.documentId});
      if(!verified)return reply(409,{error:'reconciliation_required'});
      if(signal.aborted)throw new Error('deadline');
      await db.receipt({...verified,payloadDigest:createHash('sha256').update(rawPayload).digest('hex')});
      return reply(200,{received:true,deliveryVerified:false,reconciliationRequired:true});
    });
  }};
}
