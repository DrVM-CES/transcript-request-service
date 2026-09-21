const test = require('node:test');
const assert = require('node:assert/strict');
require('./register-typescript.cjs');
const { generateTranscriptRequestXML } = require('../src/lib/pesc-xml-generator.ts');
const data = { studentFirstName: 'Synthetic', studentLastName: 'Learner', studentEmail: 'learner@example.invalid', studentDob: '2000-01-01', schoolName: 'Test School', destinationSchool: 'Test College', destinationCeeb: '000001' };
const compactV4 = /^[0-9a-f]{12}4[0-9a-f]{3}[89ab][0-9a-f]{15}$/;
test('PESC generated IDs keep compact UUID v4 format and document correspondence', () => {
  const first = generateTranscriptRequestXML(data);
  const second = generateTranscriptRequestXML(data);
  const tracking = first.xml.match(/<RequestTrackingID>([^<]+)<\/RequestTrackingID>/)?.[1];
  assert.match(first.documentId, compactV4);
  assert.match(tracking, compactV4);
  assert.ok(first.xml.includes(`<DocumentID>${first.documentId}</DocumentID>`));
  assert.notEqual(first.documentId, second.documentId);
  assert.notEqual(first.documentId, tracking);
});
test('PESC preserves an existing request tracking ID across document generation', () => {
  const requestTrackingId = '550e8400-e29b-41d4-a716-446655440000';
  const result = generateTranscriptRequestXML({ ...data, requestTrackingId });
  assert.ok(result.xml.includes(`<RequestTrackingID>${requestTrackingId}</RequestTrackingID>`));
  assert.match(result.documentId, compactV4);
});
