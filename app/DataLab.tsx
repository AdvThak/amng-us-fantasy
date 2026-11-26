'use client';

import { useRef, useState } from 'react';
import { previewTracker, type Preview } from '../src/tracker.js';
import { type Episode } from '../src/gameweek.js';
import { mergeLegacy } from '../src/legacy.js';
import { exportEventsCsv } from '../src/import.js';
import { type GameEvent } from '../src/scoring.js';
import { sampleGames, sampleBreakdowns } from '../src/demo.js';
import { downloadText } from './Pieces';

type Props = {
  episodes: Episode[];
  legacy: GameEvent[];
  save: (draft: Preview) => void;
  saveLegacy: (csv: string, video: string) => void;
  open: (key: string) => void;
};
const episodeName = (record: Episode) => (record.id === 'demo:skeld' ? 'Practice episode' : record.id);

export function DataLab({ episodes, legacy, save, saveLegacy, open }: Props) {
  const [games, setGames] = useState<File>(),
    [events, setEvents] = useState<File>();
  const [previews, setPreviews] = useState<Preview[]>([]),
    [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState('');
  const legacyRef = useRef<HTMLInputElement>(null);
  const draft = previews[index];
  async function preview() {
    if (!games || !events) return;
    setBusy(true);
    setMessage('');
    setPreviews([]);
    try {
      const [a, b] = await Promise.all([games.text(), events.text()]);
      const found = previewTracker(a, b);
      setPreviews(found);
      setIndex(0);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Could not read the files.');
    } finally {
      setBusy(false);
    }
  }
  function confirm() {
    if (!draft) return;
    try {
      save(draft);
      setMessage('Saved ' + episodeName(draft.episode) + ' on this browser.');
      setPreviews(previews.filter((p) => p !== draft));
      setIndex(0);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Could not save the episode.');
    }
  }
  async function oldFile(file?: File) {
    if (!file) return;
    try {
      const contents = await file.text(),
        rows = mergeLegacy([], contents);
      if (!rows.length) throw new Error('Legacy CSV has no events.');
      saveLegacy(contents, rows[0].video);
      setMessage('Imported ' + rows.length + ' legacy event rows.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Could not import the legacy CSV.');
    }
    if (legacyRef.current) legacyRef.current.value = '';
  }
  return (
    <div className="lab-layout">
      <section className="panel import-panel">
        <h2>Import a gameweek</h2>
        <p>
          Export the <b>Games</b> and <b>Game Breakdowns</b> tabs as CSV files. Include every round of
          the episode.
        </p>
        <div className="file-grid">
          <label>
            Games CSV
            <input
              type="file"
              accept=".csv,text/csv"
              disabled={busy}
              onChange={(e) => {
                setGames(e.target.files?.[0]);
                setPreviews([]);
                setMessage('');
              }}
            />
          </label>
          <label>
            Game Breakdowns CSV
            <input
              type="file"
              accept=".csv,text/csv"
              disabled={busy}
              onChange={(e) => {
                setEvents(e.target.files?.[0]);
                setPreviews([]);
                setMessage('');
              }}
            />
          </label>
        </div>
        <button className="button primary" disabled={!games || !events || busy} onClick={preview}>
          {busy ? 'Reading files…' : 'Preview import'}
        </button>
        {draft && (
          <div className="import-preview">
            <h3>Review episode</h3>
            <label className="field">
              Episode
              <select value={index} onChange={(e) => setIndex(Number(e.target.value))}>
                {previews.map((p, i) => (
                  <option value={i} key={p.episode.id}>
                    {episodeName(p.episode)}
                  </option>
                ))}
              </select>
            </label>
            <p>
              {draft.episode.rounds.length} rounds parsed.{' '}
              {episodes.some((e) => e.id === draft.episode.id) &&
                'Confirming replaces every previously saved round of this episode.'}
            </p>
            {draft.episode.rounds.length > 0 && (
              <details>
                <summary>Inspect rounds and records</summary>
                <ul>
                  {draft.episode.rounds.map((r) => (
                    <li key={r.number}>
                      Game {r.number} · {r.winner} · {r.players.length} players · {r.events.length}{' '}
                      events
                    </li>
                  ))}
                </ul>
              </details>
            )}
            {draft.errors.length > 0 && (
              <div className="issues">
                <strong>Needs a CSV correction</strong>
                <ul>
                  {draft.errors.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            {draft.notes.length > 0 && (
              <details>
                <summary>Coverage notes ({draft.notes.length})</summary>
                <ul>
                  {draft.notes.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </details>
            )}
            <button
              className="button primary"
              disabled={!!draft.errors.length || !draft.episode.rounds.length}
              onClick={confirm}
            >
              Confirm complete episode
            </button>
          </div>
        )}
        {message && (
          <p className="feedback" role="status">
            {message}
          </p>
        )}
        <details className="lab-details">
          <summary>Try the fictional practice files</summary>
          <p>Download both CSVs to try the review flow.</p>
          <button
            className="link-button"
            onClick={() => downloadText('games-practice.csv', sampleGames)}
          >
            ↓ Games CSV
          </button>{' '}
          <button
            className="link-button"
            onClick={() => downloadText('breakdowns-practice.csv', sampleBreakdowns)}
          >
            ↓ Game Breakdowns CSV
          </button>
        </details>
        <details className="lab-details">
          <summary>Legacy event CSVs</summary>
          <p>
            The original eight-column files use the original scoring weights. {legacy.length} saved event
            rows.
          </p>
          <input
            type="file"
            ref={legacyRef}
            aria-label="Legacy event CSV"
            accept=".csv,text/csv"
            onChange={(e) => oldFile(e.target.files?.[0])}
          />
          <button
            className="link-button"
            disabled={!legacy.length}
            onClick={() => downloadText('cosmic-draft-legacy.csv', exportEventsCsv(legacy))}
          >
            ↓ Export legacy events
          </button>
        </details>
      </section>
      <aside className="lab-side">
        <section className="panel">
          <h2>On this browser</h2>
          {episodes.length ? (
            <ul className="saved-list">
              {episodes.map((ep) => (
                <li key={ep.id}>
                  <button onClick={() => open('episode:' + ep.id)}>
                    {episodeName(ep)} <span>{ep.rounds.length} games →</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>Reviewed episodes will appear here after your first import.</p>
          )}
        </section>
        <section className="panel">
          <h2>Check a result</h2>
          <p>Look up the game number in Kesh’s sheet. The round index links to the original video.</p>
          <a
            href="https://docs.google.com/spreadsheets/d/1g3Esmr1-Z5jt5_mqOv9-f9fvyFezgT_2Z-8G7w5ChSU/edit"
            target="_blank"
            rel="noreferrer"
          >
            Kesh’s tracker ↗
          </a>
          <a href="https://www.sdmn-stats.uk/games" target="_blank" rel="noreferrer">
            SDMN round index ↗
          </a>
        </section>
      </aside>
    </div>
  );
}
