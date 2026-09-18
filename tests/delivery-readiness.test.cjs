const test = require('node:test');
const assert = require('node:assert/strict');
require('./register-typescript.cjs');
const { isDeliveryConfigured, checkServiceReadiness } = require('../src/lib/delivery-readiness.ts');

const valid = { host: 'partner.test', username: 'test', password: 'test-only', port: 22, path: '/incoming' };
test('complete transport configuration is accepted', () => assert.equal(isDeliveryConfigured(valid), true));
for (const field of ['host', 'username', 'password']) {
  test(`missing ${field} cannot report configured`, () => {
    assert.equal(isDeliveryConfigured({ ...valid, [field]: ' ' }), false);
  });
}
for (const port of [0, -1, 65536, 22.5, NaN]) {
  test(`invalid port ${port} rejected`, () => assert.equal(isDeliveryConfigured({ ...valid, port }), false));
}
for (const path of ['relative', '/../incoming', '/incoming\n']) {
  test(`unsafe remote path ${JSON.stringify(path)} rejected`, () => assert.equal(isDeliveryConfigured({ ...valid, path }), false));
}
test('database failure is unavailable without leaking exception details', async () => {
  const result = await checkServiceReadiness(async () => { throw new Error('secret-url-and-token'); }, true);
  assert.equal(result.statusCode, 503);
  assert.equal(result.body.checks.database, 'unavailable');
  assert.ok(!JSON.stringify(result).includes('secret-url-and-token'));
});
test('missing delivery configuration makes service unavailable even with healthy database', async () => {
  const result = await checkServiceReadiness(async () => {}, false);
  assert.equal(result.statusCode, 503);
  assert.equal(result.body.checks.sftpConfiguration, 'unavailable');
});
test('ready means database and config only, never claims tested partner connectivity', async () => {
  let calls = 0;
  const result = await checkServiceReadiness(async () => { calls++; }, true);
  assert.equal(result.statusCode, 200);
  assert.equal(result.body.checks.sftpConnectivity, 'not_checked');
  assert.equal(calls, 1);
});
