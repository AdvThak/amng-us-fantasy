import { parseCsvRecords } from './import.js';
import { playerId } from './crew.js';
import { exits, kills, scoreRelevant } from './gameweek.js';

/** @typedef {import('./gameweek.js').Side} Side */
/** @typedef {import('./gameweek.js').Participant} Participant */
/** @typedef {import('./gameweek.js').Episode} Episode */
/** @typedef {{episode:Episode,errors:string[],notes:string[]}} Preview */

const clean = (value) => (value ?? '').trim();
const lower = (value) => clean(value).toLowerCase().replace(/\s+/g, ' ');
const teamNames = {
  crew: 'crewmate|engineer|scientist|sheriff|mayor|medic|swapper|detective|altruist|tracker|seer|spy|mystic|trapper|haunter|investigator|snitch|medium|security guard|portal maker|deputy|lighter|time master|nice guesser|aurial|noise maker|noisemaker|veteran|oracle|time lord|priest|imitator|bodyguard|astral|transporter|vigilante|jailor|politician|warden',
  imp: 'impostor|imposter|shapeshifter|swooper|janitor|morphling|escapist|traitor|grenadier|blackmailer|miner|bomber|camouflager|bounty hunter|ninja|warlock|eraser|cleaner|godfather|mafioso|venerer|undertaker|hypnotist',
  neutral:
    'jester|werewolf|amnesiac|survivor|glitch|juggernaut|bad lawyer|pursuer|vulture|thief|jackal|arsonist|executioner|plaguebearer|doomsayer|pelican|cannibal|grinch|soul collector|sidekick',
};
const byRole = new Map(
  Object.entries(teamNames).flatMap(([side, names]) => names.split('|').map((name) => [name, side])),
);
const modifiers =
  /\b(giant|flash|chameleon|bloody|invert|sunglasses|mini|bait|anti tp|tie breaker|vip|diseased|shy|operative|aftermath|button barry|heartbeat sensor|lover)\b/g;
const roleKey = (role) => lower(role).replace(modifiers, ' ').replace(/\s+/g, ' ').trim();

/** @returns {Side|null} */
function sideName(value) {
  const side = lower(value);
  if (['crew', 'crewmate'].includes(side)) return 'crew';
  if (['imp', 'imposter', 'impostor'].includes(side)) return 'imp';
  return side === 'neutral' ? 'neutral' : null;
}

export function videoRef(raw) {
  if (clean(raw) === 'demo:skeld') return { id: 'demo:skeld', url: null };
  let link;
  try {
    link = new URL(raw);
  } catch {
    throw new Error('Video Link must be a YouTube round link.');
  }
  const host = link.hostname.toLowerCase().replace(/^(www\.|m\.)/, '');
  const path = link.pathname.split('/');
  const id =
    host === 'youtu.be'
      ? path[1]
      : host === 'youtube.com'
        ? link.pathname === '/watch'
          ? link.searchParams.get('v')
          : ['shorts', 'embed', 'live'].includes(path[1])
            ? path[2]
            : null
        : null;
  if (!['https:', 'http:'].includes(link.protocol) || !/^[a-zA-Z0-9_-]{11}$/.test(id ?? ''))
    throw new Error('Invalid YouTube video ID.');
  const t =
    link.searchParams.get('t') ??
    link.searchParams.get('start') ??
    new URLSearchParams(link.hash.slice(1)).get('t') ??
    '0';
  const clock = /^(\d+)s?$/.exec(t);
  const parts = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(t);
  if (!clock && !parts) throw new Error('Invalid round timestamp.');
  const seconds = clock
    ? Number(clock[1])
    : Number(parts[1] ?? 0) * 3600 + Number(parts[2] ?? 0) * 60 + Number(parts[3] ?? 0);
  if (!Number.isSafeInteger(seconds)) throw new Error('Invalid round timestamp.');
  return { id, url: 'https://www.youtube.com/watch?v=' + id + (seconds ? '&t=' + seconds + 's' : '') };
}

function sheet(csv, required, name) {
  const [header, ...body] = parseCsvRecords(csv);
  const names = (header?.cells ?? []).map((s) => lower(s.replace(/^\uFEFF/, '')).replace(/\.\d+$/, ''));
  for (const col of required)
    if (!names.includes(col)) throw new Error(name + ' CSV is missing "' + col + '".');
  return body.map(({ cells, row }) => ({
    row,
    fields: (col) => names.flatMap((n, j) => (n === col ? [clean(cells[j])] : [])).filter(Boolean),
    get: (col) =>
      clean(cells[names.indexOf(col)]) ||
      names.flatMap((n, j) => (n === col ? [clean(cells[j])] : [])).find(Boolean) ||
      '',
  }));
}
function integer(raw, label) {
  if (!/^\d+$/.test(raw) || !Number.isSafeInteger(Number(raw)) || Number(raw) < 1)
    throw new Error('Invalid ' + label + ' "' + raw + '".');
  return Number(raw);
}
function teams(raw) {
  const sides = new Map();
  for (const pair of raw.split('|').filter(Boolean)) {
    const [name, value] = pair.split('=');
    const side = sideName(value);
    if (!side || !clean(name) || sides.has(playerId(name)))
      throw new Error('Use Name=crew|Name=imp|Name=neutral in Player Teams.');
    sides.set(playerId(name), side);
  }
  return sides;
}
/** @returns {Participant[]} */
function roster(raw, override) {
  const result = [],
    seen = new Set();
  for (const item of raw
    .split(/[,\n]+/)
    .map(clean)
    .filter(Boolean)) {
    const match = /^(.+?)\s+-\s+(.+?)(?:\s*-\s*\((\d+)\s*\/\s*(\d+)\))?$/.exec(item);
    if (!match) throw new Error('Unreadable player / role "' + item + '".');
    const [, name, role, done, total] = match;
    if (/\([^)]*\/[^)]*\)/.test(role)) throw new Error('Invalid task count for ' + name + '.');
    const id = playerId(name);
    if (!id || seen.has(id)) throw new Error('Duplicate or missing participant "' + name + '".');
    seen.add(id);
    const side =
      override.get(id) ??
      (/\bimpost[eo]r\b/i.test(role)
        ? 'imp'
        : /\bcrewmate\b/i.test(role)
          ? 'crew'
          : byRole.get(roleKey(role))) ??
      null;
    if (total !== undefined && (+total <= 0 || +done > +total || !Number.isSafeInteger(+total)))
      throw new Error('Invalid task count for ' + name + '.');
    result.push({
      id,
      name,
      role,
      side,
      lover: /\blovers?\b/i.test(role),
      tasks: done === undefined ? null : [+done, +total],
    });
  }
  if (!result.length) throw new Error('Missing round roster.');
  for (const id of override.keys())
    if (!seen.has(id)) throw new Error('Player Teams names someone outside the round.');
  return result;
}
function outcome(winner, participants, explicit) {
  const label = lower(winner);
  if (!label || /^(unknown|pending|na|n\/a|tbd)$/.test(label))
    throw new Error('Round result needs review.');
  if (['void', 'aborted', 'cancelled', 'canceled', 'remake'].includes(label))
    return { winnerKind: 'void', winners: [] };
  const unresolved = participants.filter((p) => !p.side);
  if (unresolved.length)
    throw new Error(
      'Set Player Teams for ' + unresolved.map((p) => p.name + ' (' + p.role + ')').join(', ') + '.',
    );
  if (['draw', 'tie', 'no winner'].includes(label)) return { winnerKind: 'draw', winners: [] };
  const kind = sideName(label) ?? (/^lovers?$/.test(label) ? 'lovers' : 'neutral');
  const conditional = participants.filter(
    (p) =>
      p.side === 'neutral' &&
      /^(survivor|guardian angel|bad lawyer|lawyer|pursuer)$/.test(roleKey(p.role)),
  );
  if (!explicit && conditional.length && ['crew', 'imp'].includes(kind)) {
    throw new Error(
      'Check possible co-winners (' +
        conditional.map((p) => p.name).join(', ') +
        ') and enter Winner Players.',
    );
  }
  let winners;
  if (explicit) {
    winners = [...new Set(explicit.split(/[|,]/).map(clean).filter(Boolean).map(playerId))];
    if (winners.some((id) => !participants.some((p) => p.id === id)))
      throw new Error('Winner Players names someone outside the round.');
  } else if (kind === 'lovers') {
    winners = participants.filter((p) => p.lover).map((p) => p.id);
    if (winners.length !== 2) throw new Error('Identify the winning pair in Winner Players.');
  } else if (kind === 'neutral') {
    winners = participants
      .filter((p) => p.side === 'neutral' && roleKey(p.role) === label)
      .map((p) => p.id);
    if (winners.length !== 1)
      throw new Error('Identify the confirmed neutral winner(s) in Winner Players.');
  } else {
    winners = participants.filter((p) => (p.finalSide ?? p.side) === kind).map((p) => p.id);
  }
  if (!winners.length) throw new Error('Missing winning participants.');
  if (
    (kind === 'crew' || kind === 'imp') &&
    participants.some(
      (p) =>
        winners.includes(p.id) &&
        (p.finalSide ?? p.side) !== kind &&
        (p.finalSide ?? p.side) !== 'neutral',
    )
  ) {
    throw new Error('Winner Players conflicts with the winning side. Check Final Teams.');
  }
  return { winnerKind: kind, winners };
}

/** Parse both original tracker exports, retaining source records and their round start links.
 *  @returns {Preview[]} */
export function previewTracker(gamesCsv, eventsCsv) {
  const games = sheet(
    gamesCsv,
    ['game number', 'video link', 'winner', 'players, roles and tasks'],
    'Games',
  );
  const events = sheet(
    eventsCsv,
    ['game number', 'sequence', 'primary player', 'event type', 'secondary player'],
    'Game Breakdowns',
  );
  if (!games.length) throw new Error('Games CSV has no rounds.');
  const byVideo = new Map(),
    byGame = new Map();
  for (const row of games) {
    const src = 'Games row ' + row.row + ': ';
    let number, video;
    try {
      number = integer(row.get('game number'), 'game number');
      video = videoRef(row.get('video link'));
    } catch (error) {
      throw new Error(src + error.message);
    }
    let draft = byVideo.get(video.id);
    if (!draft) {
      draft = { episode: { id: video.id, rounds: [] }, errors: [], notes: [] };
      byVideo.set(video.id, draft);
    }
    const raw = row.get('players, roles and tasks'),
      winner = row.get('winner'),
      map = row.get('map name');
    const signature = JSON.stringify([
      video.id,
      video.url,
      winner,
      map,
      raw,
      row.get('player teams'),
      row.get('final teams'),
      row.get('winner players'),
    ]);
    const prior = byGame.get(number);
    if (prior) {
      if (signature !== prior.signature) {
        const message = src + 'conflicting records for game ' + number + '.';
        draft.errors.push(message);
        if (draft !== prior.draft) prior.draft.errors.push(message);
      }
      continue;
    }
    const record = {
      draft,
      signature,
      round: null,
      sequences: new Map(),
      explicit: row.get('winner players'),
    };
    byGame.set(number, record);
    try {
      const voided = /^(void|aborted|cancelled|canceled|remake)$/i.test(winner);
      const participants = voided && !raw ? [] : roster(raw, teams(row.get('player teams')));
      const final = teams(row.get('final teams'));
      for (const [id, side] of final) {
        const p = participants.find((p) => p.id === id);
        if (!p) throw new Error('Final Teams names someone outside the round.');
        p.finalSide = side;
      }
      const result = outcome(winner, participants, record.explicit);
      const taskCrew = participants.filter((p) => p.side === 'crew');
      const round = {
        number,
        map,
        winner,
        ...result,
        players: participants,
        events: [],
        covered: taskCrew.length > 0 && taskCrew.every((p) => p.tasks !== null),
        source: {
          table: 'Games',
          row: row.row,
          detail: [
            winner,
            map,
            raw,
            row.get('winner players') && 'Winners: ' + row.get('winner players'),
            row.get('player teams'),
            row.get('final teams'),
          ]
            .filter(Boolean)
            .join(' · '),
          url: video.url,
        },
      };
      record.round = round;
      draft.episode.rounds.push(round);
    } catch (error) {
      draft.errors.push(src + error.message);
    }
  }
  for (const row of events) {
    const src = 'Game Breakdowns row ' + row.row + ': ';
    const numbers = row.fields('game number');
    if (!numbers.length || new Set(numbers.map(Number)).size !== 1)
      throw new Error(src + 'missing or conflicting game numbers.');
    const record = byGame.get(integer(numbers[0], 'game number'));
    if (!record) throw new Error(src + 'game ' + numbers[0] + ' is missing from Games CSV.');
    const { round, draft } = record;
    if (!round || round.winnerKind === 'void') continue;
    try {
      const seq = integer(row.get('sequence'), 'sequence'),
        type = lower(row.get('event type'));
      if (!type) throw new Error('Missing event type.');
      const name = row.get('primary player'),
        target = row.get('secondary player');
      const actor = playerId(name),
        victim = playerId(target);
      const actorSide = sideName(row.get('actor team')),
        targetSide = sideName(row.get('target team'));
      if ((row.get('actor team') && !actorSide) || (row.get('target team') && !targetSide))
        throw new Error('Invalid Actor Team or Target Team.');
      const opposed = lower(row.get('opponents'));
      if (opposed && !['true', 'false'].includes(opposed))
        throw new Error('Opponents must be true or false.');
      const signature = JSON.stringify([type, actor, victim, actorSide, targetSide, opposed]);
      if (record.sequences.has(seq)) {
        if (record.sequences.get(seq) !== signature)
          throw new Error('Conflicting sequence ' + seq + ' in game ' + round.number + '.');
        continue;
      }
      if ((scoreRelevant(type) || exits.has(type)) && !round.players.some((p) => p.id === actor))
        throw new Error('Missing or unknown primary player "' + name + '".');
      if (
        (kills.has(type) || type === 'reported body of') &&
        !round.players.some((p) => p.id === victim)
      )
        throw new Error('Missing or unknown secondary player "' + target + '".');
      record.sequences.set(seq, signature);
      round.events.push({
        seq,
        actor,
        target: victim,
        type,
        actorSide,
        targetSide,
        opposed: opposed ? opposed === 'true' : null,
        source: {
          table: 'Game Breakdowns',
          row: row.row,
          detail: [
            'Game ' + round.number + ', sequence ' + seq,
            name,
            row.get('event type'),
            target,
            actorSide,
            targetSide,
            opposed && 'Opponents: ' + opposed,
          ]
            .filter(Boolean)
            .join(' · '),
          url: round.source.url,
        },
      });
    } catch (error) {
      draft.errors.push(src + error.message);
    }
  }
  for (const { draft, round, explicit } of byGame.values()) {
    if (!round || round.winnerKind === 'void') continue;
    if (!round.events.length) draft.errors.push('Game ' + round.number + ' is missing its breakdown.');
    round.events.sort((a, b) => a.seq - b.seq);
    if (round.events.some((e, i) => e.seq !== i + 1))
      draft.errors.push(
        'Game ' + round.number + ' is missing a breakdown sequence. Include the complete game log.',
      );
    const changed = new Set();
    for (const e of round.events) {
      if (['stole role of', 'changed role', 'converted', 'recruited'].includes(e.type)) {
        changed.add(e.actor);
        changed.add(e.target);
        if (!explicit && round.winnerKind !== 'draw')
          draft.errors.push(
            'Game ' + round.number + ' has a role change. Enter confirmed Winner Players.',
          );
      } else if (
        scoreRelevant(e.type) &&
        ((changed.has(e.actor) && !e.actorSide) ||
          (kills.has(e.type) && changed.has(e.target) && !e.targetSide))
      ) {
        draft.errors.push(
          'Game Breakdowns row ' + e.source.row + ': enter the changed Actor Team or Target Team.',
        );
      }
    }
    const people = new Map(round.players.map((p) => [p.id, p]));
    for (const e of round.events) {
      if (!kills.has(e.type) || e.actor === e.target || e.opposed !== null) continue;
      const actor = people.get(e.actor),
        target = people.get(e.target);
      if (
        (e.actorSide ?? actor?.side) === 'neutral' &&
        (e.targetSide ?? target?.side) === 'neutral' &&
        !(actor?.lover && target?.lover)
      ) {
        draft.errors.push(
          'Game Breakdowns row ' +
            e.source.row +
            ': set Opponents to true or false for this neutral pairing.',
        );
      }
    }
    if (changed.size) round.covered = false;
    if (!round.covered) draft.notes.push('Game ' + round.number + ' · crew task bonus unavailable.');
  }
  for (const draft of byVideo.values()) {
    draft.episode.rounds.sort((a, b) => a.number - b.number);
    draft.errors = [...new Set(draft.errors)];
  }
  return [...byVideo.values()];
}

/** @param {Episode[]} existing @param {Preview} preview @returns {Episode[]} */
export function replaceEpisode(existing, preview) {
  if (preview.errors.length || !preview.episode.rounds.length)
    throw new Error('Resolve the preview before confirming.');
  return [...existing.filter((e) => e.id !== preview.episode.id), preview.episode];
}
