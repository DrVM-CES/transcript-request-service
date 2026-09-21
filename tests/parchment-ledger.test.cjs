const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{spawnSync}=require('node:child_process');
test('actual isolated libsql ledger and HTTP regression cases; child exit releases native DB handles before cleanup',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'parchment-ledger-proof-'));
 try{
  const child=spawnSync(process.execPath,['--test',path.join(__dirname,'fixtures/parchment-ledger-cases.cjs')],{encoding:'utf8',timeout:60_000,maxBuffer:1_000_000,env:{PATH:process.env.PATH,SystemRoot:process.env.SystemRoot,TEMP:root,TMP:root,PARCHMENT_TEST_ROOT:root}});
  assert.equal(child.error,undefined);assert.equal(child.status,0,child.stdout+'\n'+child.stderr);
  assert.match(child.stdout,/pass 13/);assert.match(child.stdout,/fail 0/);assert.match(child.stdout,/skipped 0/);
 }finally{
  assert.ok(path.resolve(root).startsWith(path.resolve(os.tmpdir())+path.sep));
  fs.rmSync(root,{recursive:true,force:true});assert.equal(fs.existsSync(root),false);
 }
});
