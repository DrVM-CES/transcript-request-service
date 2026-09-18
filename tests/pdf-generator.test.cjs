const test = require('node:test');
const assert = require('node:assert/strict');
require('./register-typescript.cjs');
const { getPDFBlob, generateTranscriptRequestPDF } = require('../src/lib/pdf-generator.ts');
const { PDFDocument } = require('pdf-lib');
test('PDF download copies only the supplied Buffer bytes', async () => {
  const backing = Buffer.from([9, 1, 2, 3, 9]);
  const blob = getPDFBlob(backing.subarray(1, 4));
  backing.fill(0);
  assert.deepEqual([...new Uint8Array(await blob.arrayBuffer())], [1, 2, 3]);
  assert.equal(blob.type, 'application/pdf');
});
test('a complete synthetic request generates a readable PDF', async () => {
  const bytes = await generateTranscriptRequestPDF({
    studentFirstName: 'Synthetic', studentLastName: 'Learner', studentEmail: 'test@example.invalid', studentDob: '2000-01-01', studentPartialSsn: '0000', currentEnrollment: false,
    schoolName: 'Synthetic School', schoolCeeb: '000001', schoolAddress: '1 Test Road', schoolCity: 'Test', schoolState: 'CA', schoolZip: '90001',
    schoolPhone: '555-0100', schoolEmail: 'registrar@example.invalid', enrollDate: '2020-01-01', exitDate: '2024-01-01', graduationDate: '2024-01-01',
    destinationSchool: 'Synthetic College', destinationCeeb: '000002', destinationAddress: '2 Test Road', destinationCity: 'Test', destinationState: 'CA', destinationZip: '90001',
    documentType: 'Transcript', consentGiven: true, ferpaDisclosureRead: true, mfcLiabilityRead: true, certifyInformation: true, signatureDate: '2026-01-01', requestTrackingId: 'synthetic-test',
  });
  const pdf = await PDFDocument.load(bytes);
  assert.ok(pdf.getPageCount() >= 1);
});
