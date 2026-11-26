/**
 * Pure, deterministic fantasy scoring. Never award points from unverified events.
 * Event identifiers are stable across imports so replaying a CSV is idempotent.
 * Rules are intentionally configurable; all values are provisional MVP weights.
 */
export const weights = Object.freeze({
  appearance: 3,
  match_played: 1,
  match_win: 4,
  survival: 1,
  body_report: 1,
  crew_correct_vote: 3,
  crew_wrong_vote: -2,
  tasks_complete: 2,
  impostor_kill: 2,
  impostor_correct_vote: 2,
  impostor_ejected: -3,
  impostor_surviving_win: 2,
  last_impostor_win: 3,
  sheriff_correct_kill: 6,
  sheriff_wrong_kill: -4,
  jester_win: 6,
  executioner_win: 5,
  neutral_kill: 2,
  neutral_solo_win: 7,
  protective_save: 4,
});

/** @typedef {{ id: string, video: string, round?: string | number, player: string, type: string, verified: boolean, timestampSeconds?: number, note?: string }} GameEvent */

/**
 * @param {GameEvent[]} events
 * @param {Record<string, number>} rules
 * @returns {Record<string, number>}
 */
export function score(events, rules = weights) {
  /** @type {Map<string, string>} */
  const seen = new Map();
  /** @type {Map<string, number>} */
  const totals = new Map();
  for (const event of events) {
    if (!event.verified) continue;
    if (!event.id || !event.video || !event.player || !Object.hasOwn(rules, event.type)) {
      throw new Error(`Invalid scoring event: ${event.id ?? 'missing ID'}`);
    }
    // Appearance is awarded once per participant per video, even if source IDs differ.
    const key = event.type === 'appearance'
      ? JSON.stringify(['appearance', event.video, event.player])
      : event.id;
    const signature = JSON.stringify([event.video, event.player, event.round ?? null, event.type]);
    if (seen.has(key)) {
      if (event.type !== 'appearance' && seen.get(key) !== signature) {
        throw new Error(`Conflicting event ID: ${event.id}`);
      }
      continue;
    }
    seen.set(key, signature);
    totals.set(event.player, (totals.get(event.player) ?? 0) + rules[event.type]);
  }
  return Object.fromEntries(totals);
}

/** @param {GameEvent[]} events @param {string} player */
export function breakdown(events, player) {
  const credited = [];
  const seen = new Set();
  for (const event of events) {
    if (!event.verified || event.player !== player || !Object.hasOwn(weights, event.type)) continue;
    const key = event.type === 'appearance' ? `appearance:${event.video}:${event.player}` : event.id;
    if (seen.has(key)) continue;
    seen.add(key);
    credited.push({ ...event, points: weights[event.type] });
  }
  return credited;
}
