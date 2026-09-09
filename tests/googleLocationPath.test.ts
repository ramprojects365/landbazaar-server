import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildPropertyPayload } from '../src/controllers/propertyController.js';

test('buildPropertyPayload keeps googleLocationPath from request body', () => {
  const url = 'https://maps.google.com/?q=17.1234,78.5678';

  const payload = buildPropertyPayload({ googleLocationPath: url });

  assert.equal(payload.googleLocationPath, url);
});
