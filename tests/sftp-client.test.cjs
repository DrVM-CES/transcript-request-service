const test = require('node:test');
const assert = require('node:assert/strict');
require('./register-typescript.cjs');
let created = 0, uploads = 0, fail = false;
class FakeClient {
  constructor() { created++; }
  async connect() { if (fail) throw new Error('secret-connection-detail'); }
  async put() { uploads++; }
  async end() {}
}
const clientPath = require.resolve('ssh2-sftp-client');
require.cache[clientPath] = { id: clientPath, filename: clientPath, loaded: true, exports: FakeClient };
for (const key of ['PARCHMENT_SFTP_HOST', 'PARCHMENT_SFTP_USERNAME', 'PARCHMENT_SFTP_PASSWORD', 'PARCHMENT_SFTP_PORT']) delete process.env[key];
const { ParchmentSFTPClient, uploadTranscriptXML } = require('../src/lib/sftp-client.ts');
test('missing configuration never creates a client or simulates success', async () => {
  assert.deepEqual(await uploadTranscriptXML('<private/>', 'test'), { success: false, error: 'SFTP_NOT_CONFIGURED' });
  assert.equal(created, 0);
  assert.equal(uploads, 0);
});
test('only a completed upload reports success; errors are sanitized', async () => {
  Object.assign(process.env, { PARCHMENT_SFTP_HOST: 'partner.test', PARCHMENT_SFTP_USERNAME: 'test', PARCHMENT_SFTP_PASSWORD: 'test-only' });
  const client = new ParchmentSFTPClient();
  assert.equal((await client.uploadXML('<synthetic/>', 'test')).success, true);
  assert.equal(uploads, 1);
  fail = true;
  assert.deepEqual(await client.uploadXML('<synthetic/>', 'test-failure'), { success: false, error: 'SFTP_UPLOAD_FAILED' });
  assert.equal(uploads, 1);
});
