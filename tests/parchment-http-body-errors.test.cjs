const test=require('node:test'),assert=require('node:assert/strict');
require('./register-typescript.cjs');
const {createIntLedgerHandlers}=require('../src/lib/parchment/int-ledger-http.ts');
const config={enabled:true,environment:'staging',serviceKey:'s'.repeat(32),mfcAnonKey:'synthetic',senderCode:'1188441',productCode:'3228',webhookSecret:'w'.repeat(32),signatureEncoding:'hex'};
const owner='00000000-0000-4000-8000-000000000001';
function request(body,headers={}){return new Request('https://service.example.invalid/api/int/orders',{method:'POST',body,duplex:'half',headers:{'content-type':'application/json','x-mfc-service-key':config.serviceKey,authorization:'Bearer synthetic',...headers}});}
function handlers(fetcher=async()=>Response.json({id:owner})){return createIntLedgerHandlers(config,async()=>{assert.fail('invalid body must not open database');},fetcher);}
for(const name of ['prepare','status','webhook'])test(name+' rejects incoming body errors without retryable status or database access',async()=>{
 const limit=name==='webhook'?128_000:4096;
 const cases=[
  [()=>request(null),400],
  [()=>request('{}',{'content-type':'text/plain'}),415],
  [()=>{const r=request('{}');r.headers.delete('content-type');return r;},415],
  [()=>request('{}',{'content-length':'not-a-number'}),400],
  [()=>request('{}',{'content-length':String(limit+1)}),413],
  [()=>request('x'.repeat(limit+1)),413],
  [()=>request(new ReadableStream({start(c){c.error(new Error('PRIVATE stream detail'));}})),400],
 ];
 for(const [make,status] of cases){const result=await handlers()[name](make());assert.equal(result.status,status);assert.deepEqual(await result.json(),{error:'invalid_request'});assert.equal(result.headers.get('cache-control'),'no-store');}
 if(name!=='webhook')for(const body of ['{broken',new Uint8Array([0xff])])assert.equal((await handlers()[name](request(body))).status,400);
});
test('upstream malformed bodies and outages remain 503, independent of client error classification',async()=>{
 const failures=[()=>new Response(null,{headers:{'content-type':'application/json'}}),()=>new Response('{}'),()=>new Response('{}',{headers:{'content-type':'application/json','content-length':'invalid'}}),()=>new Response('x'.repeat(32_769),{headers:{'content-type':'application/json'}}),()=>new Response('{PRIVATE malformed',{headers:{'content-type':'application/json'}}),()=>new Response('PRIVATE outage',{status:500}),()=>new Response(new ReadableStream({start(c){c.error(Error('PRIVATE stream'));}}),{headers:{'content-type':'application/json'}})];
 for(const failure of failures)for(const name of ['prepare','status']){const result=await handlers(async()=>failure())[name](request('{}'));assert.equal(result.status,503);assert.deepEqual(await result.json(),{error:'temporarily_unavailable'});}
 for(const status of [401,403])assert.equal((await handlers(async()=>new Response(null,{status})).prepare(request('{}'))).status,401);
});
