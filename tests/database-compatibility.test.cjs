const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { randomUUID } = require('node:crypto');
require('./register-typescript.cjs');
const { createClient } = require('@libsql/client');
const { drizzle } = require('drizzle-orm/libsql');
const { eq } = require('drizzle-orm');
const { getTableConfig } = require('drizzle-orm/sqlite-core');
const { transcriptRequests } = require('../src/db/schema.ts');

test('actual libsql schema preserves request CRUD, consent, timestamps and legacy signature migration', async () => {
  // Never import app db/index or execute the migration script: both may read hosted credentials.
  const client = createClient({ url: ':memory:' });
  try {
    const db = drizzle(client);
    const signatureNames = ['mfc_liability_agreed', 'student_signature', 'signature_date'];
    const columns = getTableConfig(transcriptRequests).columns.filter(c => !signatureNames.includes(c.name));
    const ddl = columns.map(c => {
      let value = `"${c.name}" ${c.getSQLType()}${c.primary ? ' PRIMARY KEY' : ''}${c.notNull ? ' NOT NULL' : ''}`;
      if (c.default !== undefined) {
        assert.ok(['string', 'boolean', 'number'].includes(typeof c.default), 'review new nonliteral defaults');
        value += ` DEFAULT ${typeof c.default === 'string' ? "'" + c.default.replace(/'/g, "''") + "'" : Number(c.default)}`;
      }
      return value;
    });
    await client.execute(`CREATE TABLE transcript_requests (${ddl.join(', ')})`);
    // Read only the committed SQL literals; never run dotenv, production URLs or CLI migrations.
    const migration = readFileSync(require.resolve('../scripts/add-signature-fields-migration.js'), 'utf8');
    const statements = [...migration.matchAll(/client\.execute\(`\s*(ALTER TABLE transcript_requests[\s\S]*?)`\)/g)].map(m => m[1]);
    assert.equal(statements.length, 3);
    for (const statement of statements) await client.execute(statement);
    const signatureColumns = (await client.execute('PRAGMA table_info(transcript_requests)')).rows.filter(c => signatureNames.includes(c.name));
    assert.equal(signatureColumns.length, 3);
    assert.ok(signatureColumns.every(c => c.notnull === 0), 'legacy signature fields stay nullable');

    const now = new Date('2026-01-02T03:04:05Z');
    const id = randomUUID();
    const base = { studentFirstName: 'Synthetic', studentLastName: 'Learner', studentEmail: 'learner@example.invalid', studentDob: '2000-01-01', schoolName: 'School', destinationSchool: 'College', destinationCeeb: '000001', consentGiven: true, consentTimestamp: now, ferpaDisclosureShown: true, requestXml: '<synthetic />', createdAt: now, updatedAt: now };
    await db.insert(transcriptRequests).values({ ...base, id, mfcLiabilityAgreed: null, studentSignature: null, signatureDate: null });
    const [saved] = await db.select().from(transcriptRequests).where(eq(transcriptRequests.id, id));
    assert.equal(saved.id, id);
    assert.equal(saved.consentGiven, true);
    assert.equal(saved.ferpaDisclosureShown, true);
    assert.equal(saved.currentEnrollment, true);
    assert.equal(saved.documentType, 'Transcript - Final');
    assert.equal(saved.releaseAuthorizedMethod, 'ElectronicSignature');
    assert.equal(saved.status, 'submitted');
    for (const field of ['createdAt', 'updatedAt', 'consentTimestamp']) assert.equal(saved[field].getTime(), now.getTime());
    for (const field of ['mfcLiabilityAgreed', 'studentSignature', 'signatureDate']) assert.equal(saved[field], null);
    const raw = (await client.execute({ sql: 'SELECT consent_given, consent_timestamp FROM transcript_requests WHERE id = ?', args: [id] })).rows[0];
    assert.equal(raw.consent_given, 1);
    assert.equal(raw.consent_timestamp, now.getTime() / 1000);

    const otherId = randomUUID();
    await db.insert(transcriptRequests).values({ ...base, id: otherId, consentGiven: false, ferpaDisclosureShown: false });
    const updatedAt = new Date('2026-01-02T04:05:06Z');
    await db.update(transcriptRequests).set({ status: 'pending', statusMessage: 'Synthetic review', updatedAt, mfcLiabilityAgreed: true, studentSignature: 'synthetic-signature', signatureDate: '2026-01-02' }).where(eq(transcriptRequests.id, id));
    const [updated] = await db.select().from(transcriptRequests).where(eq(transcriptRequests.id, id));
    assert.equal(updated.status, 'pending');
    assert.equal(updated.updatedAt.getTime(), updatedAt.getTime());
    assert.equal(updated.mfcLiabilityAgreed, true);
    assert.equal(updated.studentSignature, 'synthetic-signature');
    assert.equal(updated.signatureDate, '2026-01-02');
    const [other] = await db.select().from(transcriptRequests).where(eq(transcriptRequests.id, otherId));
    assert.equal(other.status, 'submitted', 'update remains scoped to the requested UUID');
    assert.equal(other.consentGiven, false);
    assert.equal(other.ferpaDisclosureShown, false);
    assert.equal(other.mfcLiabilityAgreed, false);
    assert.deepEqual(await db.select().from(transcriptRequests).where(eq(transcriptRequests.id, "' OR 1=1 --")), []);
    assert.deepEqual(await db.select().from(transcriptRequests).limit(0), []);
  } finally { client.close(); }
});
