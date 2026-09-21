const test = require('node:test');
const assert = require('node:assert/strict');
require('./register-typescript.cjs');
const { createClient } = require('@libsql/client');
const { drizzle } = require('drizzle-orm/libsql');
const { getTableConfig } = require('drizzle-orm/sqlite-core');
const { transcriptRequests } = require('../src/db/schema.ts');
const { checkServiceReadiness } = require('../src/lib/delivery-readiness.ts');
test('schema readiness rejects empty and unmigrated databases without reading records', async () => {
  const client = createClient({ url: ':memory:' });
  try {
    const db = drizzle(client);
    const probe = () => db.select().from(transcriptRequests).limit(0);
    assert.equal((await checkServiceReadiness(probe, true)).statusCode, 503);
    const columns = getTableConfig(transcriptRequests).columns;
    const base = columns.filter(c => !['student_signature', 'signature_date', 'mfc_liability_agreed'].includes(c.name));
    await client.execute(`CREATE TABLE transcript_requests (${base.map(c => `"${c.name}" ${c.getSQLType()}`).join(', ')})`);
    assert.equal((await checkServiceReadiness(probe, true)).statusCode, 503);
    for (const column of columns.filter(c => !base.includes(c))) {
      await client.execute(`ALTER TABLE transcript_requests ADD COLUMN "${column.name}" ${column.getSQLType()}`);
    }
    assert.equal((await checkServiceReadiness(probe, true)).statusCode, 200);
    assert.deepEqual(await probe(), []);
  } finally { client.close(); }
});
