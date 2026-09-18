const test = require('node:test');
const assert = require('node:assert/strict');
require('./register-typescript.cjs');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const id = require.resolve('../src/components/TranscriptRequestForm.tsx');
require.cache[id] = { id, filename: id, loaded: true, exports: { TranscriptRequestForm: () => React.createElement('form', { 'data-test': 'enabled-form' }) } };
const page = require('../src/app/request/page.tsx');
test('request page stays dynamic and checks deployment flags on each render', () => {
  assert.equal(page.dynamic, 'force-dynamic');
  delete process.env.TRANSCRIPT_PUBLIC_SUBMISSIONS_ENABLED;
  assert.match(renderToStaticMarkup(page.default()), /not available yet/);
  Object.assign(process.env, { TRANSCRIPT_PUBLIC_SUBMISSIONS_ENABLED: 'true', TRANSCRIPT_ENVIRONMENT: 'staging', TRANSCRIPT_DELIVERY_MODE: 'staging', TRANSCRIPT_STAGING_EMAIL_SINK: 'sink@example.invalid' });
  const html = renderToStaticMarkup(page.default());
  assert.match(html, /enabled-form/);
  assert.doesNotMatch(html, /FERPA compliant|All information is secure/);
});
