const test = require('node:test');
const assert = require('node:assert/strict');
require('./register-typescript.cjs');
for (const route of ['debug', 'test', 'schools/test']) {
  test(`public ${route} diagnostic is unavailable without disclosing configuration`, async () => {
    process.env.DATABASE_URL = 'secret-database-url';
    const handlers = require(`../src/app/api/${route}/route.ts`);
    for (const method of ['GET', 'POST']) {
      if (!handlers[method]) continue;
      const response = await handlers[method]();
      assert.equal(response.status, 404);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      assert.deepEqual(await response.json(), { error: 'Not found' });
    }
  });
}
