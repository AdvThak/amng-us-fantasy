import test from 'node:test';
import assert from 'node:assert/strict';
import { previewTracker, replaceEpisode, videoRef } from './tracker.js';
import { lineupScore, scoreEpisode } from './gameweek.js';
import { defaultRoster, playerId, reconcileRoster } from './crew.js';
import { legacyResult, mergeLegacy } from './legacy.js';
import { sampleGames, sampleBreakdowns } from './demo.js';

const gameHeader = [
  'Game Number',
  'Video Link',
  'Winner',
  'Map Name',
  'Players, Roles and Tasks',
  'Winner Players',
  'Player Teams',
  'Final Teams',
];
const actionHeader = [
  'Game Number',
  'Sequence',
  'Primary Player',
  'Event Type',
  'Secondary Player',
  'Actor Team',
  'Target Team',
  'Opponents',
];
const csv = (rows) =>
  rows
    .map((row) => row.map((cell) => '"' + String(cell ?? '').replaceAll('"', '""') + '"').join(','))
    .join('\n');
const video = 'https://www.youtube.com/watch?v=E9bdMxOpm88';
const game = (number, winner, roster, extra = []) => [
  number,
  video,
  winner,
  'The Skeld',
  roster,
  ...extra,
];
const preview = (rounds, actions) =>
  previewTracker(csv([gameHeader, ...rounds]), csv([actionHeader, ...actions]))[0];
const checked = (rounds, actions) => {
  const draft = preview(rounds, actions);
  assert.deepEqual(draft.errors, []);
  return scoreEpisode(draft.episode);
};
const standard =
  'Simon - Crewmate - (3/5),KSI - Imposter,Guest 1 - Crewmate - (5/5),Tobi - Crewmate - (0/5),Harry - Crewmate - (0/5)';
const played = [1, 1, 'Simon', 'Called Emergency Meeting', ''];

test('canonical video links, times, aliases and guests', () => {
  assert.equal(videoRef('https://youtu.be/E9bdMxOpm88?t=1m3s').url, video + '&t=63s');
  assert.equal(videoRef(video + '&list=playlist#t=3').id, 'E9bdMxOpm88');
  assert.throws(() => videoRef('https://not-youtube.example/watch?v=E9bdMxOpm88'));
  assert.throws(() => videoRef(video + '&t=hello'));
  assert.equal(playerId('KSI'), playerId('JJ'));
  assert.equal(playerId('Guest 1'), 'guest-guest1');
});

test('cap attributed kills, reports and ejections, reject self/team kill points, keep ejected winner', () => {
  const result = checked(
    [game(1, 'Imposter', standard)],
    [
      [1, 5, 'JJ', 'Killed (Killed)', 'KSI'],
      [1, 2, 'JJ', 'Killed (Killed)', 'Tobi'],
      [1, 3, 'JJ', 'Killed (Killed)', 'Harry'],
      [1, 1, 'JJ', 'Killed (Killed)', 'Simon'],
      [1, 4, 'JJ', 'Was Voted Out', ''],
      [1, 6, 'JJ', 'Was Voted Out', ''],
      [1, 7, 'Simon', 'Reported Body Of', 'Tobi'],
      [1, 8, 'Simon', 'Reported Body Of', 'Harry'],
      [1, 9, 'Simon', 'Killed (Killed)', 'Tobi'],
    ],
  );
  assert.equal(result.totals.jj, 3 + 1 + 2 - 2 + 3);
  assert.equal(result.totals.simon, 3 + 1 + 1 + 1);
  assert.equal(result.totals['guest-guest1'], 3 + 1 + 2);
  assert.equal(
    result.entries.filter((e) => e.player === 'jj' && e.label === 'Opponent eliminated').length,
    2,
  );
  for (const [id, total] of Object.entries(result.totals))
    assert.equal(
      result.entries.filter((e) => e.player === id).reduce((n, e) => n + e.points, 0),
      total,
    );
});

test('unrecorded tasks disable the bonus for the entire round, zero is a recorded count', () => {
  const partial = standard.replace('Tobi - Crewmate - (0/5)', 'Tobi - Crewmate');
  assert.equal(checked([game(1, 'Draw', partial)], [played]).totals.simon, 4);
  assert.equal(checked([game(1, 'Draw', standard)], [played]).totals.simon, 5);
  assert.match(
    preview([game(1, 'Crewmate', standard.replace('3/5', '6/5'))], [played]).errors[0],
    /task count/,
  );
});

test('one appearance across games, draws retain actions, voids earn no participation', () => {
  const result = checked(
    [game(1, 'Draw', standard), game(2, 'Crewmate', standard), game(3, 'Void', '')],
    [played, [2, 1, 'JJ', 'Was Voted Out', '']],
  );
  assert.equal(
    result.entries.filter((e) => e.player === 'simon' && e.label === 'Episode appearance').length,
    1,
  );
  assert.equal(result.totals.simon, 3 + 2 + 2 + 5);
  assert.ok(result.entries.every((e) => e.round !== 3));
});

test('disconnects preserve earned actions and stop victory and later action awards', () => {
  const result = checked(
    [game(1, 'Imposter', standard)],
    [
      [1, 1, 'JJ', 'Killed (Killed)', 'Simon'],
      [1, 2, 'JJ', 'Disconnected', ''],
      [1, 3, 'JJ', 'Killed (Killed)', 'Tobi'],
    ],
  );
  assert.equal(result.totals.jj, 5);
});

test('Lovers and named neutral winners receive one outcome award with attributed beneficiaries', () => {
  const lovers = 'Simon - Crewmate Lover,JJ - Imposter Lover,Tobi - Jester';
  const result = checked(
    [game(1, 'Lovers', lovers)],
    [played, [1, 2, 'JJ', 'Killed (Killed)', 'Simon']],
  );
  assert.deepEqual({ ...result.totals }, { simon: 12, jj: 12, tobi: 4 });
  assert.equal(checked([game(1, 'Jester', lovers)], [played]).totals.tobi, 12);
  const ambiguous = 'Simon - Crewmate,JJ - Jester,Tobi - Mini Jester';
  assert.match(preview([game(1, 'Jester', ambiguous)], [played]).errors[0], /Winner Players/);
  assert.equal(checked([game(1, 'Jester', ambiguous, ['JJ'])], [played]).totals.jj, 12);
  assert.match(preview([game(1, 'Crewmate', standard, ['JJ'])], [played]).errors[0], /winning side/);
});

test('unknown roles and changing allegiances require source annotations', () => {
  const roster = 'Simon - Thief,JJ - Imposter,Tobi - Crewmate';
  assert.match(
    preview([game(1, 'Crewmate', roster.replace('Thief', 'Unlisted'))], [played]).errors[0],
    /Player Teams/,
  );
  const events = [
    [1, 1, 'Simon', 'Stole Role Of', 'JJ'],
    [1, 2, 'Simon', 'Killed (Killed)', 'Tobi'],
  ];
  assert.ok(preview([game(1, 'Imposter', roster)], events).errors.length);
  const changed = checked(
    [game(1, 'Imposter', roster, ['Simon', '', 'Simon=imp'])],
    [events[0], [...events[1], 'imp']],
  );
  assert.equal(changed.totals.simon, 3 + 1 + 1 + 3);
});

test('pair source rows, accept original duplicate column headings, deduplicate repeated events', () => {
  const games = '\uFEFF' + csv([gameHeader, [], game(1, 'Crewmate', standard)]) + '\r\n';
  const actions = csv([
    ['Game Number', 'Game Number', 'Sequence', 'Primary Player', 'Event Type', 'Secondary Player'],
    [],
    ['', 1, 1, 'JJ', 'Killed (Killed)', 'Simon'],
    ['', 1, 1, 'JJ', 'Killed (Killed)', 'Simon'],
  ]);
  const [draft] = previewTracker(games, actions);
  assert.deepEqual(draft.errors, []);
  const [round] = draft.episode.rounds;
  assert.equal(round.source.row, 3);
  assert.equal(round.events.length, 1);
  assert.equal(round.events[0].source.row, 3);
  assert.equal(round.events[0].source.url, video);
  assert.throws(
    () => previewTracker(games, actions.replace('"","1","1"', '"2","1","1"')),
    /conflicting game numbers/,
  );
});

test('conflicts block confirmation, corrections replace an episode and reimport is idempotent', () => {
  const first = preview(
    [game(1, 'Crewmate', standard), game(2, 'Imposter', standard)],
    [played, [2, 1, 'Simon', 'Called Emergency Meeting', '']],
  );
  const stored = replaceEpisode([], first);
  const fixed = preview([game(1, 'Draw', standard)], [played]);
  const next = replaceEpisode(stored, fixed);
  assert.equal(next.length, 1);
  assert.equal(next[0].rounds.length, 1);
  assert.equal(stored[0].rounds.length, 2);
  assert.deepEqual(replaceEpisode(next, fixed), next);
  const conflict = preview([game(1, 'Crewmate', standard)], [played, [1, 1, 'JJ', 'Was Voted Out', '']]);
  assert.match(conflict.errors[0], /Conflicting sequence/);
  assert.throws(() => replaceEpisode(stored, conflict));
  assert.ok(
    preview([game(1, 'Crewmate', standard)], []).errors.some((s) => s.includes('missing its breakdown')),
  );
  assert.ok(
    preview([game(1, 'Crewmate', standard)], [played, [1, 3, 'JJ', 'Was Voted Out', '']]).errors.some(
      (s) => s.includes('missing a breakdown sequence'),
    ),
  );
});

test('captain appearance and points are independent, only starters score', () => {
  const roster = { ...defaultRoster, starters: ['simon', 'vik'], captain: 'simon', vice: 'vik' };
  const base = { totals: { simon: 0, vik: 7, harry: 99 }, appeared: new Set(['simon', 'vik', 'harry']) };
  assert.deepEqual(lineupScore(roster, base), { total: 7, skipper: 'simon' });
  assert.equal(lineupScore(roster, { ...base, totals: { simon: -2, vik: 7 } }).total, 3);
  assert.deepEqual(lineupScore(roster, { ...base, appeared: new Set(['vik', 'harry']) }), {
    total: 14,
    skipper: 'vik',
  });
  assert.deepEqual(reconcileRoster(defaultRoster), defaultRoster);
});

test('practice data and original event files use their respective point schedules', () => {
  const [practice] = previewTracker(sampleGames, sampleBreakdowns);
  assert.deepEqual(practice.errors, []);
  assert.equal(scoreEpisode(practice.episode).totals.simon, 17);
  const csvData =
    'id,video,round,player,type,verified\na,old,1,simon,match_win,true\nb,old,1,vik,match_win,false';
  const old = mergeLegacy([], csvData);
  assert.equal(legacyResult(old, 'old').totals.simon, 4);
  assert.ok(!legacyResult(old, 'old').appeared.has('vik'));
  assert.deepEqual(mergeLegacy(old, csvData), old);
});

test('opponent annotations resolve neutral pairs and cannot turn friendly fire into points', () => {
  const roles = 'Simon - Arsonist,JJ - Jester,Tobi - Crewmate,Harry - Crewmate';
  const elimination = [1, 1, 'Simon', 'Killed (Killed)', 'JJ'];
  assert.match(preview([game(1, 'Draw', roles)], [elimination]).errors[0], /Opponents/);
  const result = checked([game(1, 'Draw', roles)], [
    [...elimination, '', '', 'true'],
    [1, 2, 'Harry', 'Killed (Killed)', 'Tobi', '', '', 'true'],
  ]);
  assert.equal(result.totals.simon, 5);
  assert.equal(result.totals.harry, 4);
});

test('a contingent neutral co-win requires the recorded beneficiaries', () => {
  const roles = 'Simon - Survivor,JJ - Imposter,Harry - Crewmate';
  const round = game(1, 'Crewmate', roles);
  assert.match(preview([round], [played]).errors[0], /co-winners/);
  const result = checked([game(1, 'Crewmate', roles, ['Simon|Harry'])], [played]);
  assert.equal(result.totals.simon, 12);
  assert.equal(result.totals.harry, 9);
});
