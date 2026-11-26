import { playerId } from './crew.js';
import { rules } from './gameweek.js';
export const provisionalId = 'vunYsm7gV9s';
export const provisionalLabel = 'GTA 6 edition · 21 Nov 2026 (provisional)';
const reported = [["Simon","Lucia"],["LazarBeam","Jason"],["Josh","Cop"],["Vik","RC Bandito"],["Ethan","Wanted impostor"],["Harry","Wanted impostor"],["Crayator","Alien"],["Louu","Dealer"],["Tobi","Unknown"]];
/** Secondary-source candidates only. Never passed into the confirmed tracker importer.
 * @returns {import('./gameweek.js').Result}
 */
export function provisionalResult() {
  const entries = [], totals = Object.create(null), names = Object.create(null), appeared = new Set();
  for (const [index, [name, role]] of reported.entries()) {
    const player = playerId(name);
    names[player] = name;
    appeared.add(player);
    const source = { table: 'Provisional Scores', row: index + 2,
      detail: 'Secondary recap only; reported role: ' + role + '. Full roster, role alignments and action sequence unverified.',
      url: 'https://trari.com/en/v/moresidemen-804492/' };
    entries.push({ player, round: 'unconfirmed', label: 'Appearance candidate', points: rules.appearance, source });
    totals[player] = rules.appearance;
    // The video summary reports a completed first round with a crew victory.
    // Only participants with a previously recorded opening role get a played candidate.
    // Tobi is named in the episode but his round-one participation is not established.
    if (role !== 'Unknown') {
      entries.push({ player, round: 1, label: 'Round played candidate', points: rules.played,
        source: { table: 'Games draft', row: 2, detail: 'First-round crew victory reported by Watchcatalog; participation inferred from the opening-role recap. Not independently verified.', url: 'https://watchcatalog.co/m/yt/vunYsm7gV9s' } });
      totals[player] += rules.played;
    }
    if (name === 'Harry') {
      entries.push({ player, round: 'unconfirmed', label: 'Reported impostor ejection candidate', points: rules.ejection, source });
      totals[player] += rules.ejection;
    }
  }
  return { entries, totals, names, appeared };
}
