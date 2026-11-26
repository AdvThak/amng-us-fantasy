/** @typedef {import('./scoring.js').GameEvent} GameEvent */
const header = ['id', 'video', 'round', 'player', 'type', 'verified', 'timestampSeconds', 'note'];

/** @param {string} text */
export function parseCsvRecords(text) {
  let recordNumber = 1;
  /** @type {{cells:string[],row:number}[]} */
  const rows = [];
  let cell = '';
  /** @type {string[]} */
  let row = [];
  let inside = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inside && text[i + 1] === '"') { cell += '"'; i++; }
      else inside = !inside;
    } else if (ch === ',' && !inside) {
      row.push(cell); cell = '';
    } else if ((ch === '\n' || ch === '\r') && !inside) {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      if (row.some(v => v.trim())) rows.push({cells:row,row:recordNumber});
      recordNumber++;
      row = []; cell = '';
    } else cell += ch;
  }
  if (inside) throw new Error('CSV has an unmatched quote');
  row.push(cell);
  if (row.some(v => v.trim())) rows.push({cells:row,row:recordNumber});
  return rows;
}

/** @param {string} text */
export function parseCsv(text) {
  return parseCsvRecords(text).map(record => record.cells);
}

/** @param {string} text */
export function importEventsCsv(text) {
  const rows = parseCsv(text);
  if (!rows.length) return [];
  const columns = rows[0].map(s => s.trim().replace(/^\uFEFF/, ''));
  for (const name of ['id', 'video', 'player', 'type', 'verified']) {
    if (!columns.includes(name)) throw new Error(`Missing CSV column: ${name}`);
  }
  /** @type {GameEvent[]} */
  const events = [];
  for (let i = 1; i < rows.length; i++) {
    const raw = Object.fromEntries(columns.map((column, index) => [column, (rows[i][index] ?? '').trim()]));
    const verified = raw.verified.toLowerCase();
    if (!['true', 'false', '1', '0'].includes(verified)) throw new Error(`Row ${i + 1}: verified must be true or false`);
    if (!raw.id || !raw.video || !raw.player || !raw.type) throw new Error(`Row ${i + 1}: missing required field`);
    const timestamp = raw.timestampSeconds ? Number(raw.timestampSeconds) : undefined;
    if (timestamp !== undefined && (!Number.isFinite(timestamp) || timestamp < 0)) throw new Error(`Row ${i + 1}: invalid timestamp`);
    events.push({ id: raw.id, video: raw.video, player: raw.player, type: raw.type, verified: verified === 'true' || verified === '1', round: raw.round || undefined, timestampSeconds: timestamp, note: raw.note || undefined });
  }
  return events;
}

/** @param {GameEvent[]} events */
export function exportEventsCsv(events) {
  const escape = (/** @type {unknown} */ value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  return [header.join(','), ...events.map(e => header.map(k => escape(e[k])).join(','))].join('\n');
}
