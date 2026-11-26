import test from 'node:test';
import assert from 'node:assert/strict';
import { crew, players, playerId, defaultRoster, spend, reconcileRoster, transferPlayer } from './crew.js';
import { completeRosters, partialRosters, individualAppearanceEvidence, uncheckedEpisodes, priceRecommendations, vetoedIds } from './market-data.js';

test('research prices and recent evidence match exactly twenty eligible players', () => {
  assert.equal(completeRosters.length, 3);
  assert.equal(uncheckedEpisodes.length, 14);
  const evidence = new Set([...completeRosters, ...partialRosters].flatMap(e => e.ids).concat(individualAppearanceEvidence.map(e => e.id)));
  const priced = new Map(priceRecommendations.map(([id, price]) => [id, price]));
  assert.equal(priced.size, 20);
  assert.equal(crew.filter(p => p.eligible).length, 20);
  assert.equal(new Set(crew.map(p => p.id)).size, crew.length);
  for (const p of crew) {
    assert.equal(p.eligible, evidence.has(p.id) && priced.has(p.id) && !vetoedIds.has(p.id));
    if (p.eligible) {
      assert.equal(p.price, priced.get(p.id));
      assert.ok(p.price >= 6.5 && p.price <= 19 && Number.isInteger(p.price * 2));
    } else assert.equal(p.price, null);
  }
  assert.equal(players.get('guest-viz').price, 15.5);
  assert.equal(players.get('guest-lachlan').price, 9.5);
  assert.equal(players.get('simon').price, 19);
  assert.equal(players.get('lazar').price, 18);
});
test('vetoes retain historical identities but cannot be drafted or captain a saved lineup', () => {
  assert.equal(playerId('KSI'), 'jj');
  assert.equal(playerId('JJ'), 'jj');
  assert.equal(playerId('Ellum'), 'ellum');
  for (const id of ['jj', 'ellum']) {
    assert.equal(players.get(id).eligible, false);
    assert.equal(players.get(id).price, null);
    assert.equal(players.get(id).exclusionReason, 'owner_veto');
  }
  assert.equal(playerId('Chipfat'), 'guest-chip');
  assert.equal(playerId('VizuaLizah'), 'guest-viz');
  const repaired = reconcileRoster({ids:['jj','ellum','simon','vik','ginge'],starters:['jj','ellum','simon','vik'],captain:'jj',vice:'ellum'});
  assert.equal(repaired.ids.length,8);
  assert.equal(repaired.starters.length,5);
  assert.ok(repaired.ids.every(id=>players.get(id).eligible));
  assert.deepEqual(repaired.ids.slice(0,2),['simon','vik']);
  assert.equal(repaired.captain,'simon');
  assert.equal(repaired.vice,'vik');
});
test('new prices preserve budget and create premium versus depth choices', () => {
  assert.equal(defaultRoster.ids.length, 8);
  assert.equal(defaultRoster.starters.length, 5);
  assert.ok(defaultRoster.ids.every(id => players.get(id)?.eligible));
  assert.equal(spend(defaultRoster.ids), 98);
  assert.deepEqual(reconcileRoster(defaultRoster), defaultRoster);
  const ranked = crew.filter(p=>p.eligible).sort((a,b)=>b.price-a.price);
  assert.equal(spend([...ranked.slice(0,5),...ranked.slice(-3)].map(p=>p.id)),105);
  const expensive = ranked.slice(0,8).map(p=>p.id);
  const repaired = reconcileRoster({ids:expensive,starters:expensive.slice(0,5),captain:expensive[0],vice:expensive[1]});
  assert.ok(spend(repaired.ids)<=100);
  assert.equal(repaired.ids.length,8);
  assert.equal(repaired.starters.length,5);
});

test('transfers keep eight players, five starters, budget and captaincy intact', () => {
  const next = transferPlayer(defaultRoster,'simon','ethan');
  assert.equal(next.ids.length,8);
  assert.equal(next.starters.length,5);
  assert.equal(next.captain,'ethan');
  assert.ok(spend(next.ids)<=100);
  assert.throws(()=>transferPlayer(defaultRoster,'guest-louu','lazar'), /budget/);
  assert.throws(()=>transferPlayer(defaultRoster,'simon','jj'));
  assert.throws(()=>transferPlayer(defaultRoster,'simon','vik'));
  assert.deepEqual(reconcileRoster(next),next);
});
