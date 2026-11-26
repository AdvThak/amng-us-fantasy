import { playerId, players } from './crew.js';
import { importEventsCsv } from './import.js';
import { breakdown, score, weights } from './scoring.js';
import { videoRef } from './tracker.js';

/** @typedef {import('./scoring.js').GameEvent} GameEvent */
/** @param {GameEvent[]} existing @param {string} csv */
export function mergeLegacy(existing, csv) {
  const imported = importEventsCsv(csv),
    batch = new Map();
  for (const e of imported) {
    if (!Object.hasOwn(weights, e.type)) throw new Error('Unknown legacy event: ' + e.type);
    if (batch.has(e.id) && JSON.stringify(batch.get(e.id)) !== JSON.stringify(e))
      throw new Error('Conflicting event ID in CSV: ' + e.id);
    batch.set(e.id, e);
  }
  const merged = new Map(existing.map((e) => [e.id, e]));
  for (const e of batch.values()) merged.set(e.id, e);
  const values = [...merged.values()];
  score(values);
  return values;
}

/** @param {GameEvent[]} events @param {string} video @returns {import('./gameweek.js').Result} */
export function legacyResult(events, video) {
  const rows = events
    .filter((e) => e.video === video)
    .map((e) => ({ ...e, player: players.has(e.player) ? e.player : playerId(e.player) }));
  const totals = score(rows),
    names = Object.create(null),
    entries = [];
  for (const id of Object.keys(totals)) {
    names[id] = players.get(id)?.name ?? events.find((e) => playerId(e.player) === id)?.player ?? id;
    for (const e of breakdown(rows, id)) {
      let url = null;
      try {
        const ref = videoRef(/^[\w-]{11}$/.test(video) ? 'https://youtu.be/' + video : video);
        if (ref.url)
          url =
            e.timestampSeconds === undefined
              ? ref.url
              : 'https://www.youtube.com/watch?v=' +
                ref.id +
                '&t=' +
                Math.floor(e.timestampSeconds) +
                's';
      } catch {
        /* Earlier CSVs allow free-form video identifiers. */
      }
      entries.push({
        player: id,
        round: e.round ?? '–',
        label: e.type.replaceAll('_', ' '),
        points: e.points,
        source: {
          table: 'Legacy event',
          row: events.findIndex((o) => o.id === e.id) + 2,
          detail: [e.id, e.note].filter(Boolean).join(' · '),
          url,
        },
      });
    }
  }
  return { totals, entries, names, appeared: new Set(Object.keys(totals)) };
}
