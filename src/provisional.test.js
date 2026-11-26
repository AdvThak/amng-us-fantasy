import test from 'node:test';
import assert from 'node:assert/strict';
import { provisionalResult } from './provisional.js';
test('provisional candidates credit only reported opening-role participation and no inferred win bonuses', () => {
  const result = provisionalResult();
  assert.equal(result.appeared.size, 9);
  assert.equal(result.totals.harry, 2);
  assert.equal(result.totals.simon, 4);
  assert.equal(result.totals.deji, undefined);
  assert.equal(result.totals.tobi, 3);
  assert.equal(result.entries.length, 18);
  assert.equal(result.entries.filter(e => e.label === 'Round played candidate' && e.round === 1).length, 8);
  assert.ok(result.entries.every(e => !/win/i.test(e.label)));
});
