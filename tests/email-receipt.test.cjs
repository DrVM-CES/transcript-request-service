const test = require('node:test');
const assert = require('node:assert/strict');
require('./register-typescript.cjs');
const messages = [];
const resendPath = require.resolve('resend');
require.cache[resendPath] = { id: resendPath, filename: resendPath, loaded: true, exports: { Resend: class {
  emails = { send: async message => { messages.push(message); return { data: { id: 'synthetic' } }; } };
} } };
process.env.RESEND_API_KEY = 'test-only';
process.env.TRANSCRIPT_ENVIRONMENT = 'staging';
process.env.TRANSCRIPT_DELIVERY_MODE = 'staging';
process.env.TRANSCRIPT_STAGING_EMAIL_SINK = 'sink@example.invalid';
const { sendTranscriptRequestConfirmation, sendSchoolNotification } = require('../src/lib/email-service.ts');
test('receipt emails do not claim provider submission or delivery before transport occurs', async () => {
  const data = { studentName: '<img src=x onerror=alert(1)>', studentEmail: 'student@example.invalid', requestId: 'synthetic', schoolName: 'Test', destinationSchool: 'Test College', documentType: 'Transcript', submittedDate: '2026-01-01' };
  await sendTranscriptRequestConfirmation(data, Buffer.from('synthetic PDF'));
  await sendSchoolNotification('registrar@example.invalid', data);
  assert.equal(messages.length, 2);
  for (const { html, to } of messages) {
    assert.equal(to, 'sink@example.invalid');
    assert.doesNotMatch(html, /<img src=x/);
    assert.match(html, /&lt;img src=x/);
    assert.doesNotMatch(html, /1-3 business days|will be processed and transmitted|sent electronically via Parchment|is being processed/);
    assert.match(html, /does not confirm/);
  }
  assert.match(messages[0].html, /awaiting processing/);
});
