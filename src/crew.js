import { careerRows, marketRecord } from './market-data.js';

// Preserve the original 12 sprite indices. New players use the generic sprite (13).
export const crew = careerRows.map((row, index) => ({
  ...marketRecord(row),
  sprite: index < 12 ? index : 13,
}));
export const players = new Map(crew.map((p) => [p.id, p]));
const normal = (name) =>
  String(name)
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/[\s_.-]+/g, '');
const aliases = new Map(crew.flatMap((p) => [p.id, p.name, p.tag].map((n) => [normal(n), p.id])));
aliases.set('vikk', 'vik');
aliases.set('vikkstar', 'vik');
aliases.set('wroetoshaw', 'harry');
aliases.set('theangryginge', 'ginge');
aliases.set('couraged', 'guest-courage');
aliases.set('burntchip', 'guest-chip');
aliases.set('theburntchip', 'guest-chip');
aliases.set('lou', 'guest-louu');
aliases.set('burntpeanut', 'guest-theburntpeanut');
aliases.set('alfiebuttle', 'guest-ab');
aliases.set('georgeclarke', 'guest-georgeclarkey');
aliases.set('dannyaarons', 'guest-dannyaarons');
export function playerId(name) {
  const key = normal(name);
  if (!key) return '';
  return aliases.get(key) ?? 'guest-' + key;
}

export const defaultRoster = {
  ids: ['simon', 'vik', 'harry', 'josh', 'ethan', 'jj', 'tobi', 'guest-ab'],
  starters: crew.slice(0, 5).map((p) => p.id),
  captain: 'simon',
  vice: 'vik',
};
/** @typedef {typeof defaultRoster} Roster */
export const money = (n) => '£' + n.toFixed(1) + 'm';
export const spend = (ids) => ids.reduce((sum, id) => sum + (players.get(id)?.price ?? 0), 0);

/** Also repairs captaincy when an existing saved player is sold or benched. */
/** @param {Roster} value @returns {Roster} */
export function reconcileRoster(value) {
  if (!value || !Array.isArray(value.ids) || !Array.isArray(value.starters)) return defaultRoster;
  const ids = [];
  for (const id of value.ids) {
    if (players.has(id) && !ids.includes(id) && ids.length < 8 && spend([...ids, id]) <= 100)
      ids.push(id);
  }
  const starters = [...new Set(value.starters)].filter((id) => ids.includes(id)).slice(0, 5);
  const captain = starters.includes(value.captain) ? value.captain : (starters[0] ?? '');
  const vice =
    starters.includes(value.vice) && value.vice !== captain
      ? value.vice
      : (starters.find((id) => id !== captain) ?? '');
  return { ids, starters, captain, vice };
}
