import test from 'node:test';
import assert from 'node:assert/strict';
import { provisionalResult } from './provisional.js';
test('provisional candidates never fabricate played or win points', () => {
  const result = provisionalResult();
  assert.equal(result.appeared.size, 9);
  assert.equal(result.totals.harry, 1);
  assert.equal(result.totals.simon, 3);
  assert.equal(result.totals.deji, undefined);
  assert.equal(result.entries.length, 10);
  assert.ok(result.entries.every(e => e.round === 'unconfirmed'));
});
