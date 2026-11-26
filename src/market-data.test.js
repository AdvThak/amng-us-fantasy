import test from 'node:test';
import assert from 'node:assert/strict';
import { crew, players, playerId, defaultRoster, spend } from './crew.js';
import { completeRosters, partialRosters, uncheckedEpisodes, marketPrice } from './market-data.js';
test('market coverage is explicit and all evidenced players are draftable', () => {
  assert.equal(completeRosters.length, 4);
  assert.equal(uncheckedEpisodes.length, 13);
  assert.equal(crew.filter((p) => p.eligible).length, 19);
  for (const e of [...completeRosters, ...partialRosters]) {
    assert.equal(new Set(e.ids).size, e.ids.length);
    for (const id of e.ids) assert.equal(players.get(id)?.eligible, true);
  }
  assert.equal(players.get('ellum').eligible, false);
});
test('prices are bounded, half-million increments, and default roster stays within budget', () => {
  assert.equal(new Set(crew.map(p => p.id)).size, crew.length);
  for (const p of crew) {
    assert.ok(Number.isFinite(p.price) && p.price >= 4.5 && p.price <= 18);
    assert.equal(p.price * 2, Math.round(p.price * 2));
  }
  assert.equal(defaultRoster.ids.length, 8);
  assert.ok(defaultRoster.ids.every(id => players.get(id)?.eligible));
  assert.ok(spend(defaultRoster.ids) <= 100);
  assert.ok(marketPrice(50, 100, 70, 3, 4) > marketPrice(50, 100, 20, 3, 4));
  assert.ok(marketPrice(100, 100, 45, 4, 4) > marketPrice(10, 100, 45, 1, 4));
  assert.equal(playerId('Danny Aarons'), 'guest-dannyaarons');
  assert.equal(playerId('Lou'), 'guest-louu');
  assert.equal(playerId('TheBurntChip'), 'guest-chip');
});
