const test = require('node:test');
const assert = require('node:assert/strict');
require('./register-typescript.cjs');
const { readBoundedJson, MAX_REQUEST_BYTES } = require('../src/lib/request-body.ts');
const { getDeliveryPolicy, publicSubmissionsEnabled } = require('../src/lib/delivery-policy.ts');
const { extractMFCUser, verifyMFCClient, getMFCUserClient } = require('../src/lib/mfc-auth.ts');

test('chunked body cannot bypass the byte cap with absent or false Content-Length', async () => {
  for (const length of [undefined, '1']) {
    let cancelled = false;
    const body = new ReadableStream({ pull(controller) { controller.enqueue(new Uint8Array(32)); }, cancel() { cancelled = true; } });
    const headers = { 'content-type': 'application/json', ...(length ? { 'content-length': length } : {}) };
    await assert.rejects(readBoundedJson(new Request('http://localhost', { method: 'POST', headers, body, duplex: 'half' }), 40), { status: 413 });
    assert.equal(cancelled, true);
  }
});
test('invalid JSON, nonobject payloads and wrong media types are rejected', async () => {
  for (const value of ['null', '[]', '{']) {
    await assert.rejects(readBoundedJson(new Request('http://localhost', { method: 'POST', headers: { 'content-type': 'application/json' }, body: value })), { status: 400 });
  }
  await assert.rejects(readBoundedJson(new Request('http://localhost', { method: 'POST', body: '{}' })), { status: 415 });
});
test('delivery configuration fails closed and staging requires an operator-owned sink', () => {
  assert.equal(getDeliveryPolicy({}).mode, 'disabled');
  assert.equal(getDeliveryPolicy({ TRANSCRIPT_DELIVERY_MODE: 'live', TRANSCRIPT_ENVIRONMENT: 'staging' }).mode, 'disabled');
  assert.equal(publicSubmissionsEnabled({ TRANSCRIPT_PUBLIC_SUBMISSIONS_ENABLED: 'true' }), false);
  assert.equal(getDeliveryPolicy({ TRANSCRIPT_DELIVERY_MODE: 'staging', TRANSCRIPT_ENVIRONMENT: 'staging', TRANSCRIPT_STAGING_EMAIL_SINK: 'one@test.invalid,two@test.invalid' }).mode, 'disabled');
});
test('URL, referrer and stored hints never establish verified MFC membership', async () => {
  const request = new Request('https://test.invalid/request?source=mfc&username=attacker', { headers: { referer: 'https://myfuturecapacity.com' } });
  assert.equal(extractMFCUser(request).isMFCClient, false);
  assert.equal(await verifyMFCClient('attacker'), false);
  global.window = { location: { search: '' } };
  global.sessionStorage = { getItem: () => JSON.stringify({ username: 'attacker', isMFCClient: true }) };
  assert.equal(getMFCUserClient().isMFCClient, false);
  delete global.window; delete global.sessionStorage;
});

test('signature rejects invalid PNG and oversized decoded dimensions', () => {
  const { isBoundedPngSignature } = require('../src/lib/request-body.ts');
  assert.equal(isBoundedPngSignature('data:image/png;base64,AAAA'), false);
  const bytes = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lLsAAAAASUVORK5CYII=', 'base64');
  assert.equal(isBoundedPngSignature('data:image/png;base64,' + bytes.toString('base64')), true);
  bytes.writeUInt32BE(100000, 16);
  assert.equal(isBoundedPngSignature('data:image/png;base64,' + bytes.toString('base64')), false);
});
