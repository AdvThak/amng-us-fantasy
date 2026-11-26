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
aliases.set('chipfat', 'guest-chip');
aliases.set('vizualizah', 'guest-viz');
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
  ids: ["simon","vik","josh","deji","guest-dannyaarons","guest-georgeclarkey","guest-chip","guest-louu"],
  starters: ["simon","vik","josh","deji","guest-dannyaarons"],
  captain: 'simon',
  vice: 'vik',
};
/** @typedef {typeof defaultRoster} Roster */
/** @param {number | null} n */
export const money = (n) => n === null ? 'Not draftable' : '£' + n.toFixed(1) + 'm';
export const spend = (ids) => ids.reduce((sum, id) => sum + (players.get(id)?.price ?? 0), 0);

/** Preserve saved picks whenever a full, affordable squad can still be completed.
 * @param {Roster} value @returns {Roster}
 */
export function reconcileRoster(value) {
  if (!value || !Array.isArray(value.ids) || !Array.isArray(value.starters)) value = defaultRoster;
  const candidates = crew.filter(p => p.eligible && p.price !== null)
    .sort((a,b) => (a.price ?? Infinity) - (b.price ?? Infinity) || a.id.localeCompare(b.id));
  const ids = [];
  const cheapest = (selected) => candidates.filter(p => !selected.includes(p.id))
    .slice(0, 8 - selected.length).map(p => p.id);
  for (const id of value.ids) {
    if (!candidates.some(p => p.id === id) || ids.includes(id) || ids.length === 8) continue;
    const next = [...ids, id];
    const fill = cheapest(next);
    if (next.length + fill.length === 8 && spend([...next, ...fill]) <= 100) ids.push(id);
  }
  ids.push(...cheapest(ids));
  if (ids.length !== 8 || spend(ids) > 100) throw new Error('Market cannot supply eight affordable players.');
  const starters = [...new Set(value.starters)].filter(id => ids.includes(id)).slice(0, 5);
  starters.push(...ids.filter(id => !starters.includes(id)).slice(0, 5 - starters.length));
  const captain = starters.includes(value.captain) ? value.captain : starters[0];
  const vice = starters.includes(value.vice) && value.vice !== captain
    ? value.vice : starters.find(id => id !== captain) ?? '';
  return { ids, starters, captain, vice };
}

/** @param {Roster} roster @param {string} outgoing @param {string} incoming @returns {Roster} */
export function transferPlayer(roster, outgoing, incoming) {
  const p = players.get(incoming);
  if (!roster.ids.includes(outgoing) || roster.ids.includes(incoming) || !p?.eligible || p.price === null)
    throw new Error('Choose an owned player and an eligible replacement.');
  const swap = (id) => id === outgoing ? incoming : id;
  const ids = roster.ids.map(swap);
  if (ids.length !== 8 || spend(ids) > 100) throw new Error('Transfer exceeds your £100m budget.');
  return { ids, starters: roster.starters.map(swap), captain: swap(roster.captain), vice: swap(roster.vice) };
}
