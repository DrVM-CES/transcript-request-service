require('../register-typescript.cjs');
const {createClient}=require('@libsql/client'),{IntLedger}=require('../../src/lib/parchment/int-ledger.ts');
const client=createClient({url:process.env.PARCHMENT_RACE_URL}),ledger=new IntLedger(client);
const input={ownerId:'00000000-0000-4000-8000-000000000001',mfcOrderId:'00000000-0000-4000-8000-000000000003',requestDigest:'a'.repeat(64),releaseReference:'reviewed-release-v1',senderCode:'1188441',productCode:'3228'};
(async()=>{try{const result=process.argv[2]==='prepare'?await ledger.prepare(input):await ledger.claim(input.ownerId,input.mfcOrderId,input.requestDigest);process.stdout.write(JSON.stringify({ok:true,result}));}catch(error){if(error.code!=='SQLITE_BUSY')throw error;process.stdout.write(JSON.stringify({ok:false,busy:true}));}finally{client.close();}})().catch(()=>{process.exitCode=1;});
