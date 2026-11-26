/** @typedef {'crew'|'imp'|'neutral'} Side */
/** @typedef {{id:string,name:string,role:string,side:Side|null,finalSide?:Side,lover:boolean,tasks:[number,number]|null}} Participant */
/** @typedef {{table:string,row:number,detail:string,url:string|null}} Source */
/** @typedef {{seq:number,actor:string,target:string,type:string,actorSide:Side|null,targetSide:Side|null,opposed:boolean|null,source:Source}} Action */
/** @typedef {{number:number,map:string,winner:string,winnerKind:string,winners:string[],players:Participant[],events:Action[],source:Source,covered:boolean}} Round */
/** @typedef {{id:string,rounds:Round[]}} Episode */
/** @typedef {{player:string,round:number|string,label:string,points:number,source:Source}} Entry */
/** @typedef {{entries:Entry[],totals:Record<string,number>,appeared:Set<string>,names:Record<string,string>}} Result */

export const rules = Object.freeze({
  appearance: 3,
  played: 1,
  crewWin: 5,
  impWin: 3,
  neutralWin: 8,
  kill: 1,
  report: 1,
  half: 1,
  full: 1,
  ejection: -2,
});
export const rulebook = [
  ['Episode appearance', '+3', 'Once per player per video.'],
  ['Round played', '+1', 'Each round with a confirmed result, including a draw.'],
  ['Crewmate win', '+5', 'An ejected or dead crewmate can still win.'],
  ['Impostor win', '+3', 'An ejected or dead impostor can still win.'],
  ['Neutral or Lovers win', '+8', 'One outcome award per confirmed winner.'],
  ['Opponent eliminated', '+1', 'First two credited opposing kills per player per round.'],
  ['Body reported', '+1', 'First report by each crewmate each round.'],
  [
    'Crew tasks',
    '+1 / +2',
    'One for at least half, two total for all. Requires complete crew task counts.',
  ],
  ['Impostor ejected', '−2', 'Once per impostor per round.'],
];
export const exits = new Set(['disconnected', 'rage quit']);
export const kills = new Set([
  'killed (killed)',
  'guess killed (killed)',
  'bombed (killed)',
  'bit (killed)',
  'assassinated (killed)',
  'curse killed (killed)',
  'ignited (killed)',
  'pelican killed (killed)',
  'lightning striked (killed)',
  'executed (killed)',
  'santa present killed (killed)',
  'tinder killed (killed)',
  'spell killed (killed)',
  'veteran killed (killed)',
  'smite (killed)',
  'cannibal killed (killed)',
]);
export function scoreRelevant(type) {
  return kills.has(type) || type === 'reported body of' || type === 'was voted out';
}

/** @param {Episode} episode @returns {Result} */
export function scoreEpisode(episode) {
  const entries = [],
    appeared = new Set(),
    totals = Object.create(null),
    names = Object.create(null);
  function add(player, round, label, points, source) {
    entries.push({ player, round, label, points, source });
    totals[player] = (totals[player] ?? 0) + points;
  }
  for (const round of episode.rounds) {
    if (round.winnerKind === 'void') continue;
    const participants = new Map(round.players.map((p) => [p.id, p]));
    const left = new Set(),
      reported = new Set(),
      ejected = new Set(),
      killCount = new Map();
    for (const p of round.players) {
      names[p.id] = p.name;
      if (!appeared.has(p.id)) {
        appeared.add(p.id);
        add(p.id, round.number, 'Episode appearance', rules.appearance, round.source);
      }
      add(p.id, round.number, 'Round played', rules.played, round.source);
    }
    for (const e of round.events) {
      const p = participants.get(e.actor);
      if (!p || left.has(p.id)) continue;
      if (exits.has(e.type)) {
        left.add(p.id);
        continue;
      }
      const side = e.actorSide ?? p.side;
      const victim = participants.get(e.target);
      const other = e.targetSide ?? victim?.side;
      const allies = p.lover && victim?.lover;
      const neutralPair = side === 'neutral' && other === 'neutral';
      const opposing = !allies && (neutralPair ? e.opposed === true : side !== other && e.opposed !== false);
      if (
        kills.has(e.type) &&
        victim &&
        !left.has(victim.id) &&
        p.id !== victim.id &&
        side &&
        other &&
        opposing
      ) {
        const n = killCount.get(p.id) ?? 0;
        if (n < 2) add(p.id, round.number, 'Opponent eliminated', rules.kill, e.source);
        killCount.set(p.id, n + 1);
      } else if (e.type === 'reported body of' && side === 'crew' && !reported.has(p.id)) {
        reported.add(p.id);
        add(p.id, round.number, 'Body reported', rules.report, e.source);
      } else if (e.type === 'was voted out' && side === 'imp' && !ejected.has(p.id)) {
        ejected.add(p.id);
        add(p.id, round.number, 'Impostor ejected', rules.ejection, e.source);
      }
    }
    for (const p of round.players) {
      if (!left.has(p.id) && round.winners.includes(p.id)) {
        const neutral =
          round.winnerKind === 'neutral' ||
          round.winnerKind === 'lovers' ||
          (p.finalSide ?? p.side) === 'neutral';
        const award = neutral
          ? rules.neutralWin
          : round.winnerKind === 'crew'
            ? rules.crewWin
            : rules.impWin;
        add(
          p.id,
          round.number,
          neutral
            ? 'Neutral / Lovers win'
            : round.winnerKind === 'crew'
              ? 'Crewmate win'
              : 'Impostor win',
          award,
          round.source,
        );
      }
      if (round.covered && p.side === 'crew' && p.tasks) {
        const [done, total] = p.tasks;
        if (done * 2 >= total)
          add(p.id, round.number, 'Half of tasks completed', rules.half, round.source);
        if (done === total) add(p.id, round.number, 'All tasks completed', rules.full, round.source);
      }
    }
  }
  return { entries, totals, appeared, names };
}

/** @param {import('./crew.js').Roster} roster @param {Result} result */
export function lineupScore(roster, result) {
  const skipper =
    [roster.captain, roster.vice].find(
      (id) => roster.starters.includes(id) && result.appeared.has(id),
    ) ?? '';
  const total = roster.starters.reduce((sum, id) => sum + (result.totals[id] ?? 0), 0);
  return { total: total + (result.totals[skipper] ?? 0), skipper };
}
