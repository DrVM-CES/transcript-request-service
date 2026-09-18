const test = require('node:test');
const assert = require('node:assert/strict');
require('./register-typescript.cjs');
let writes = 0;
let providerFailure = false, databaseFailure = false;
const sent = [];
function replace(path, exports) { const id = require.resolve(path); require.cache[id] = { id, filename: id, loaded: true, exports }; }
replace('../src/db/index.ts', { db: {
  insert: () => ({ values: async () => { if (databaseFailure) throw new Error('SENSITIVE_MARKER database details'); writes++; } }),
  update: () => ({ set: () => ({ where: async () => { writes++; } }) }),
} });
replace('../src/lib/pdf-generator-professional.ts', { generateTranscriptRequestPDF: async () => Buffer.from('synthetic') });
replace('resend', { Resend: class { emails = { send: async message => { if (providerFailure) throw new Error('SENSITIVE_MARKER provider details'); sent.push(message); return { data: { id: 'synthetic' } }; } }; } });
process.env.RESEND_API_KEY = 'test-only';
process.env.MFC_API_KEY = 'test-service-key';
const publicPost = require('../src/app/api/submit-request/route.ts').POST;
const externalPost = require('../src/app/api/external/submit/route.ts').POST;
const valid = { studentFirstName: 'Test', studentLastName: 'Learner', studentEmail: 'attacker@example.invalid', studentDob: '2000-01-01', schoolName: 'Test School', schoolEmail: 'attacker-school@example.invalid', destinationSchool: 'Test College', destinationCeeb: '000001', ferpaDisclosureRead: true, mfcLiabilityRead: true, consentGiven: true, certifyInformation: true, studentSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lLsAAAAASUVORK5CYII=', signatureDate: '2026-01-01' };
const request = value => new Request('http://localhost/api', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(value) });
test('public gate rejects before reading the body or performing database/email work', async () => {
  delete process.env.TRANSCRIPT_PUBLIC_SUBMISSIONS_ENABLED;
  let reads = 0;
  const response = await publicPost({ get body() { reads++; throw new Error('must not read'); } });
  assert.equal(response.status, 503); assert.equal(reads, 0); assert.equal(writes, 0); assert.equal(sent.length, 0);
});
test('external handler keeps API-key auth and rejects disabled delivery before writes', async () => {
  assert.equal((await externalPost(request({ apiKey: 'wrong' }))).status, 401);
  assert.equal((await externalPost(request({ apiKey: 'test-service-key' }))).status, 503);
  assert.equal(writes, 0); assert.equal(sent.length, 0);
});
test('enabled public and external handlers reject oversized input before writes', async () => {
  Object.assign(process.env, { TRANSCRIPT_PUBLIC_SUBMISSIONS_ENABLED: 'true', TRANSCRIPT_ENVIRONMENT: 'staging', TRANSCRIPT_DELIVERY_MODE: 'staging', TRANSCRIPT_STAGING_EMAIL_SINK: 'sink@example.invalid' });
  for (const handler of [publicPost, externalPost]) {
    assert.equal((await handler(request({ apiKey: 'test-service-key', payload: 'x'.repeat(600000) }))).status, 413);
  }
  assert.equal((await publicPost(request({ ...valid, studentSignature: 'data:image/png;base64,' + 'A'.repeat(270000) }))).status, 400);
  assert.equal(writes, 0); assert.equal(sent.length, 0);
});
test('caller fields cannot override staging sink or authorize live delivery', async () => {
  const response = await publicPost(request({ ...valid, TRANSCRIPT_DELIVERY_MODE: 'live', TRANSCRIPT_STAGING_EMAIL_SINK: 'attacker@example.invalid', isMFCClient: true }));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).status, 'pending');
  assert.equal(sent.length, 2);
  assert.ok(sent.every(message => message.to === 'sink@example.invalid'));
});


test('actual submission and email failure paths never log sensitive input or provider/database errors', async () => {
  const lines = [];
  const original = { log: console.log, warn: console.warn, error: console.error };
  for (const method of Object.keys(original)) console[method] = (...args) => lines.push(require('node:util').inspect(args));
  try {
    providerFailure = true;
    const result = await publicPost(request({ ...valid, studentFirstName: 'SENSITIVE_MARKER', studentEmail: 'SENSITIVE_MARKER@example.invalid' }));
    assert.equal(result.status, 200);
    databaseFailure = true;
    assert.equal((await publicPost(request({ ...valid, studentFirstName: 'SENSITIVE_MARKER' }))).status, 500);
    assert.equal((await externalPost(request({ ...valid, apiKey: 'test-service-key', ferpaDisclosureShown: true, studentFirstName: 'SENSITIVE_MARKER' }))).status, 500);
    assert.ok(lines.length > 0);
    assert.ok(lines.every(line => !line.includes('SENSITIVE_MARKER') && !line.includes('@example.invalid')));
    assert.match(lines.join(' '), /EMAIL_DELIVERY_FAILED/);
  } finally {
    Object.assign(console, original);
    providerFailure = false; databaseFailure = false;
  }
});
