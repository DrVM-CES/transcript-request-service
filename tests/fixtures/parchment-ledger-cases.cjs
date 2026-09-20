const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {createHmac,createHash}=require('node:crypto');
require('../register-typescript.cjs');
const {createClient}=require('@libsql/client');
const {IntLedger,LedgerConflict}=require('../../src/lib/parchment/int-ledger.ts');
const {createIntLedgerHandlers}=require('../../src/lib/parchment/int-ledger-http.ts');
const ddl=fs.readFileSync(path.join(__dirname,'../../db/migrations/20260920_parchment_int_ledger.sql'),'utf8');
const owner='00000000-0000-4000-8000-000000000001',peer='00000000-0000-4000-8000-000000000002',order='00000000-0000-4000-8000-000000000003';
const config={enabled:true,environment:'staging',serviceKey:'s'.repeat(32),mfcAnonKey:'synthetic-anon',senderCode:'1188441',productCode:'3228',webhookSecret:'w'.repeat(32),signatureEncoding:'hex'};
const input={ownerId:owner,mfcOrderId:order,requestDigest:'a'.repeat(64),releaseReference:'reviewed-release-v1',senderCode:config.senderCode,productCode:config.productCode};
async function fixture(url='file:'+path.join(process.env.PARCHMENT_TEST_ROOT,require('node:crypto').randomUUID()+'.db')){const client=createClient({url});await client.executeMultiple(ddl);return {client,ledger:new IntLedger(client)};}
const request=(body,headers={})=>new Request('https://service.example.invalid/api/int/orders',{method:'POST',headers:{'content-type':'application/json','x-mfc-service-key':config.serviceKey,authorization:'Bearer synthetic-learner',...headers},body:JSON.stringify(body)});
const body=()=>({mfcOrderId:order,requestDigest:input.requestDigest,releaseReference:input.releaseReference});
const auth=async(url,options)=>{assert.equal(url,'https://fubdevscyujktpqsvpak.supabase.co/auth/v1/user');assert.equal(options.redirect,'error');assert.equal(options.headers.Authorization,'Bearer synthetic-learner');return Response.json({id:owner});};
const event=(id,status='AVAILABLE',date='2026-09-20T12:00:00Z',documentId='document-1')=>({event:'order.status.updated',eventTime:date,orderLineItem:{externalDocumentId:id,documentId,status,sender:{parchmentId:config.senderCode},message:'PRIVATE_PROVIDER_CONTENT'}});
function hook(value,encoding='hex',change={}){const raw=Buffer.from(JSON.stringify(value));return new Request('https://service.example.invalid/api/int/parchment-status',{method:'POST',headers:{'content-type':'application/json','x-parchment-signature':createHmac('sha256',config.webhookSecret).update(raw).digest(encoding),...change},body:raw});}

test('real additive SQL preserves legacy rows and prepares idempotently without claiming submission',async()=>{const {client,ledger}=await fixture();try{
 await client.executeMultiple("CREATE TABLE transcript_requests(id TEXT PRIMARY KEY,secret TEXT);INSERT INTO transcript_requests VALUES('old','unchanged')");
 const first=await ledger.prepare(input),again=await ledger.prepare(input);assert.equal(again.externalOrderId,first.externalOrderId);assert.equal(again.state,'prepared');assert.equal(again.replayed,true);
 for(const changed of [{requestDigest:'b'.repeat(64)},{releaseReference:'different'},{senderCode:'different'},{productCode:'different'}])await assert.rejects(ledger.prepare({...input,...changed}),LedgerConflict);
 assert.equal(await ledger.readOwned(peer,order),null);assert.equal((await client.execute('SELECT secret FROM transcript_requests')).rows[0].secret,'unchanged');
}finally{client.close();}});

test('committed claim survives actual database reopen and cannot automatically resend',async()=>{const dir=fs.mkdtempSync(path.join(process.env.PARCHMENT_TEST_ROOT,'parchment-ledger-')),url='file:'+path.join(dir,'ledger.db');let {client,ledger}=await fixture(url);try{
 const first=await ledger.prepare(input);assert.equal(await ledger.claim(peer,order,input.requestDigest),null);assert.equal(await ledger.claim(owner,order,'b'.repeat(64)),null);
 const claim=await ledger.claim(owner,order,input.requestDigest);assert.ok(claim);client.close();client=createClient({url});ledger=new IntLedger(client);
 assert.equal((await ledger.readOwned(owner,order)).state,'unknown');assert.equal(await ledger.claim(owner,order,input.requestDigest),null);
 assert.equal((await ledger.prepare(input)).state,'unknown');await assert.rejects(ledger.recordAccepted(first.externalOrderId,'wrong-claim'),LedgerConflict);
 assert.deepEqual(await ledger.recordAccepted(first.externalOrderId,claim.claimId),{state:'accepted',deliveryVerified:false});assert.equal((await ledger.recordAccepted(first.externalOrderId,claim.claimId)).deliveryVerified,false);
}finally{client.close();}});

test('two real SQLite processes racing the same prepare/claim cannot create two deliveries',async()=>{const dir=fs.mkdtempSync(path.join(process.env.PARCHMENT_TEST_ROOT,'parchment-race-')),url='file:'+path.join(dir,'ledger.db');const {client,ledger}=await fixture(url);try{
 const race=mode=>new Promise((resolve,reject)=>{const child=require('node:child_process').spawn(process.execPath,[path.join(__dirname,'parchment-ledger-racer.cjs'),mode],{env:{...process.env,PARCHMENT_RACE_URL:url},stdio:['ignore','pipe','pipe']});let out='';child.stdout.on('data',x=>out+=x);child.on('error',reject);child.on('close',code=>{try{assert.equal(code,0);resolve(JSON.parse(out));}catch(error){reject(error);}});});
 const outcomes=await Promise.all([race('prepare'),race('prepare')]);assert.ok(outcomes.some(x=>x.ok));
 const a=await ledger.prepare(input);for(const result of outcomes.filter(x=>x.ok))assert.equal(result.result.externalOrderId,a.externalOrderId);
 const claims=await Promise.all([race('claim'),race('claim')]);
 assert.equal(claims.filter(x=>x.ok&&x.result).length,1);assert.equal(await ledger.claim(owner,order,input.requestDigest),null);
 assert.equal((await client.execute('SELECT count(*) n FROM parchment_int_orders')).rows[0].n,1);
}finally{client.close();}});

test('disabled/default/production and unconfigured signature routes perform no auth or database access',async()=>{for(const settings of [{},{...config,enabled:false},{...config,environment:'production'},{...config,senderCode:'other'}]){
 const handlers=createIntLedgerHandlers(settings,async()=>{throw Error('DB forbidden');},async()=>{throw Error('network forbidden');});
 assert.equal((await handlers.prepare(request(body()))).status,503);assert.equal((await handlers.webhook(hook(event(order)))).status,503);
 }for(const signatureEncoding of [undefined,'guess']){const handler=createIntLedgerHandlers({...config,signatureEncoding},async()=>{throw Error('DB forbidden');});assert.equal((await handler.webhook(hook(event(order)))).status,503);}});

test('actual HTTP intake requires MFC service authentication AND verified learner, rejects client owner fields',async()=>{const {client,ledger}=await fixture();let authCalls=0;const handlers=createIntLedgerHandlers(config,async()=>ledger,async(...args)=>{authCalls++;return auth(...args);});try{
 assert.equal((await handlers.prepare(request(body(),{'x-mfc-service-key':'wrong'}))).status,401);assert.equal(authCalls,0);
 assert.equal((await handlers.prepare(request(body(),{authorization:'fake'}))).status,401);assert.equal(authCalls,0);
 assert.equal((await handlers.prepare(request({...body(),ownerId:peer}))).status,400);
 const result=await handlers.prepare(request(body()));assert.equal(result.status,200);assert.equal((await result.json()).submitted,false);
 assert.equal((await client.execute('SELECT owner_id FROM parchment_int_orders')).rows[0].owner_id,owner);
 const peerHandlers=createIntLedgerHandlers(config,async()=>ledger,async()=>Response.json({id:peer}));assert.equal((await peerHandlers.status(request({mfcOrderId:order}))).status,404);
 for(const response of [()=>Response.json({id:owner},{status:401}),()=>Response.json({id:'not-uuid'}),()=>Response.json({user:{id:owner}})]){const denied=createIntLedgerHandlers(config,async()=>{throw Error('DB forbidden');},response);assert.equal((await denied.prepare(request(body()))).status,401);}
 assert.equal((await handlers.prepare(request({...body(),requestDigest:'b'.repeat(64)}))).status,409);
}finally{client.close();}});

test('raw HMAC authentication happens before order lookup; stored receipt is minimal and duplicate-safe',async()=>{const {client,ledger}=await fixture();try{
 const p=await ledger.prepare(input);await ledger.claim(owner,order,input.requestDigest);
 const handlers=createIntLedgerHandlers(config,async()=>ledger,auth);
 const bad=createIntLedgerHandlers(config,async()=>{throw Error('lookup forbidden');},auth);
 assert.equal((await bad.webhook(hook(event(p.externalOrderId),'hex',{'x-parchment-signature':'0'.repeat(64)}))).status,401);
 const response=await handlers.webhook(hook(event(p.externalOrderId)));assert.equal(response.status,200);assert.deepEqual(await response.json(),{received:true,deliveryVerified:false,reconciliationRequired:true});
 assert.equal((await handlers.webhook(hook(event(p.externalOrderId)))).status,200);
 const receipts=(await client.execute('SELECT * FROM parchment_int_receipts')).rows;assert.equal(receipts.length,1);assert.ok(!JSON.stringify(receipts).includes('PRIVATE_PROVIDER_CONTENT'));
 assert.equal((await handlers.webhook(hook(event(p.externalOrderId,'DELIVERED','2026-09-20T13:00:00Z')))).status,200);
 assert.equal((await handlers.webhook(hook(event(p.externalOrderId,'ERROR','2026-09-19T13:00:00Z')))).status,200);
 assert.equal((await ledger.readOwned(owner,order)).state,'unknown');assert.equal((await ledger.readOwned(owner,order)).reconciliationRequired,true);
 assert.equal((await client.execute('SELECT count(*) n FROM parchment_int_receipts')).rows[0].n,3);
 assert.equal((await handlers.webhook(hook(event(p.externalOrderId,'COMPLETE','2026-09-20T14:00:00Z','different-document')))).status,409);
 assert.equal((await handlers.webhook(hook(event('unknown-order')))).status,409);
 const foreign=event(p.externalOrderId);foreign.orderLineItem.sender.parchmentId='foreign';assert.equal((await handlers.webhook(hook(foreign))).status,409);
}finally{client.close();}});

test('explicit base64 mode works, prefixed/mismatched encoding is denied and prepared orders cannot receive status',async()=>{const {client,ledger}=await fixture();try{const p=await ledger.prepare(input);const h=createIntLedgerHandlers({...config,signatureEncoding:'base64'},async()=>ledger,auth);
 assert.equal((await h.webhook(hook(event(p.externalOrderId),'base64'))).status,409);await ledger.claim(owner,order,input.requestDigest);
 assert.equal((await h.webhook(hook(event(p.externalOrderId),'hex'))).status,401);assert.equal((await h.webhook(hook(event(p.externalOrderId),'base64'))).status,200);
}finally{client.close();}});

test('actual receipt transaction failure rolls back document binding and is never acknowledged',async()=>{const {client,ledger}=await fixture();try{
 const p=await ledger.prepare(input);await ledger.claim(owner,order,input.requestDigest);
 await client.execute("CREATE TRIGGER reject_receipt_update BEFORE UPDATE OF document_id ON parchment_int_orders BEGIN SELECT RAISE(ABORT,'synthetic failure');END");
 const handlers=createIntLedgerHandlers(config,async()=>ledger,auth);const response=await handlers.webhook(hook(event(p.externalOrderId)));assert.equal(response.status,503);assert.ok(!JSON.stringify(await response.json()).includes('synthetic'));
 assert.equal((await client.execute('SELECT count(*) n FROM parchment_int_receipts')).rows[0].n,0);assert.equal((await ledger.correlation(p.externalOrderId)).documentId,undefined);
 await client.execute('DROP TRIGGER reject_receipt_update');assert.equal((await handlers.webhook(hook(event(p.externalOrderId)))).status,200);
}finally{client.close();}});

test('actual deferred foreign-key commit failure cannot produce webhook success',async()=>{const {client,ledger}=await fixture();try{
 const p=await ledger.prepare(input);await ledger.claim(owner,order,input.requestDigest);
 await client.executeMultiple("PRAGMA foreign_keys=ON;CREATE TABLE commit_parent(id TEXT PRIMARY KEY);CREATE TABLE commit_child(id TEXT REFERENCES commit_parent(id) DEFERRABLE INITIALLY DEFERRED);CREATE TRIGGER fail_commit AFTER INSERT ON parchment_int_receipts BEGIN INSERT INTO commit_child VALUES('missing');END;");
 const h=createIntLedgerHandlers(config,async()=>ledger,auth);assert.equal((await h.webhook(hook(event(p.externalOrderId)))).status,503);
 assert.equal((await client.execute('SELECT count(*) n FROM parchment_int_receipts')).rows[0].n,0);
}finally{client.close();}});

test('actual Next route wrappers remain disabled without opening database',async()=>{const previous=process.env.PARCHMENT_INT_LEDGER_ENABLED;delete process.env.PARCHMENT_INT_LEDGER_ENABLED;try{
 for(const name of ['orders','order-status','parchment-status']){const {POST}=require('../../src/app/api/int/'+name+'/route.ts');assert.equal((await POST(request(body()))).status,503);}
}finally{if(previous!==undefined)process.env.PARCHMENT_INT_LEDGER_ENABLED=previous;}});

test('a failed claim COMMIT returns no dispatch authority and preserves prepared state',async()=>{const {client,ledger}=await fixture();try{
 await ledger.prepare(input);
 await client.executeMultiple("PRAGMA foreign_keys=ON;CREATE TABLE claim_parent(id TEXT PRIMARY KEY);CREATE TABLE claim_child(id TEXT REFERENCES claim_parent(id) DEFERRABLE INITIALLY DEFERRED);CREATE TRIGGER fail_claim_commit AFTER UPDATE OF claim_id ON parchment_int_orders BEGIN INSERT INTO claim_child VALUES('missing');END;");
 await assert.rejects(ledger.claim(owner,order,input.requestDigest));
 const row=(await client.execute('SELECT dispatch_state,claim_id FROM parchment_int_orders')).rows[0];assert.equal(row.dispatch_state,'prepared');assert.equal(row.claim_id,null);
}finally{client.close();}});

test('late Auth result after deadline cannot initialize the ledger or write an order',async t=>{
 t.mock.timers.enable({apis:['setTimeout']});let release,opened=0;
 const handler=createIntLedgerHandlers(config,async()=>{opened++;throw Error('late DB forbidden');},()=>new Promise(resolve=>{release=resolve;}));
 const pending=handler.prepare(request(body()));await new Promise(resolve=>setImmediate(resolve));t.mock.timers.tick(10_000);
 assert.equal((await pending).status,503);release(Response.json({id:owner}));await new Promise(resolve=>setImmediate(resolve));assert.equal(opened,0);
});
