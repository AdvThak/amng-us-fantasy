// Prices belong to the fictional draft market. Sprite indexes are stable across screens.
export const crew = [
  ['simon', 'Miniminter', 'Simon', 18.5],
  ['vik', 'Vikkstar123', 'Vik', 16.5],
  ['harry', 'W2S', 'Harry', 14.5],
  ['josh', 'Zerkaa', 'Josh', 12.5],
  ['ethan', 'Behzinga', 'Ethan', 11],
  ['jj', 'KSI', 'JJ', 10],
  ['tobi', 'TBJZL', 'Tobi', 8.5],
  ['randolph', 'Randolph', 'Randy', 7],
  ['lazar', 'LazarBeam', 'Lazar', 13],
  ['deji', 'Deji', 'Deji', 8],
  ['ginge', 'AngryGinge', 'Ginge', 9],
  ['ellum', 'Ellum', 'Ellum', 6],
].map(([id, name, tag, price], sprite) => ({
  id: String(id),
  name: String(name),
  tag: String(tag),
  price: Number(price),
  sprite,
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
export function playerId(name) {
  const key = normal(name);
  if (!key) return '';
  return aliases.get(key) ?? 'guest-' + key;
}

export const defaultRoster = {
  ids: crew.slice(0, 8).map((p) => p.id),
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
