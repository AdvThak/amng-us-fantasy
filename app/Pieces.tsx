'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { players } from '../src/crew.js';
import type { Entry, Result } from '../src/gameweek.js';

export function Sprite({ id, className = '' }: { id: string; className?: string }) {
  const index = id === 'brand' ? 12 : (players.get(id)?.sprite ?? 13);
  return (
    <span
      aria-hidden="true"
      className={'sprite ' + className}
      style={{ '--sprite-x': (100 * index) / 13 + '%' } as CSSProperties}
    />
  );
}

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-';
export function PixelWord({ text }: { text: string }) {
  return (
    <span className="pixel-word">
      <span className="sr-only">{text}</span>
      <span className="pixel-letters" aria-hidden="true">
        {[...text.toUpperCase()].map((c, i) => {
          const index = alphabet.indexOf(c);
          return (
            <i
              key={i}
              className={index < 0 ? 'word-gap' : undefined}
              style={
                index < 0
                  ? undefined
                  : { backgroundPositionX: (100 * index) / (alphabet.length - 1) + '%' }
              }
            />
          );
        })}
      </span>
    </span>
  );
}

export function Icon({ index }: { index: number }) {
  return (
    <span
      aria-hidden="true"
      className="pixel-icon"
      style={{ '--icon-x': (100 * index) / 8 + '%' } as CSSProperties}
    />
  );
}

export function Dialog({
  title,
  dismiss,
  children,
}: {
  title: string;
  dismiss: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!ref.current?.open) ref.current?.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby="dialog-title"
      onCancel={dismiss}
      onClick={(e) => {
        if (e.target === ref.current) dismiss();
      }}
    >
      <div className="dialog-inner">
        <header>
          <h2 id="dialog-title">{title}</h2>
          <button className="close-button" onClick={dismiss} aria-label="Close dialog">
            ×
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}

function SourceLine({ entry }: { entry: Entry }) {
  const src = entry.source;
  return (
    <details className="source-line">
      <summary>
        <span>{entry.label}</span>
        <strong>
          {entry.points > 0 ? '+' : ''}
          {entry.points}
        </strong>
      </summary>
      <div>
        <b>
          {src.table} · row {src.row}
        </b>
        <p>{src.detail}</p>
        {src.url && (
          <a href={src.url} target="_blank" rel="noreferrer">
            Watch {src.table === 'Legacy event' ? 'evidence' : 'round start'} ↗
          </a>
        )}
      </div>
    </details>
  );
}
export function PointsDialog({
  id,
  result,
  episode,
  dismiss,
}: {
  id: string;
  result: Result;
  episode: string;
  dismiss: () => void;
}) {
  const person = players.get(id),
    entries = result.entries.filter((e) => e.player === id);
  const groups = new Map<string | number, Entry[]>();
  for (const entry of entries) groups.set(entry.round, [...(groups.get(entry.round) ?? []), entry]);
  return (
    <Dialog title={person?.name ?? result.names[id] ?? id} dismiss={dismiss}>
      <div className="player-record">
        <Sprite id={id} />
        <div>
          <span>{episode}</span>
          <strong>
            {result.totals[id] ?? 0} <small>pts</small>
          </strong>
        </div>
      </div>
      {entries.length ? (
        <>
          <p className="help">Select an award to inspect its CSV record.</p>
          {[...groups].map(([round, rows]) => (
            <section className="round-ledger" key={round}>
              <h3>Game {round}</h3>
              {rows.map((entry, i) => (
                <SourceLine key={i} entry={entry} />
              ))}
            </section>
          ))}
        </>
      ) : (
        <p className="empty">No scored appearance in this episode.</p>
      )}
    </Dialog>
  );
}

export function Room({
  starters,
  bench,
  captain,
  vice,
  open,
}: {
  starters: string[];
  bench: string[];
  captain: string;
  vice: string;
  open: (id: string) => void;
}) {
  return (
    <section className="room-panel" aria-label="Cafeteria lineup">
      <div className="room-caption">
        <span>
          <i className="status-light" /> The Skeld <span className="slash">/</span> Cafeteria
        </span>
        <span>{starters.length} / 5 starters</span>
      </div>
      <div className="room-scene">
        {Array.from({ length: 5 }, (_, i) => {
          const id = starters[i],
            player = players.get(id);
          return player ? (
            <button
              key={i}
              className={'station seat-' + i}
              onClick={() => open(id)}
              aria-label={'View ' + player.name + ' points'}
            >
              <span className="suit-pad">
                <Sprite id={id} />
                {(id === captain || id === vice) && (
                  <b className={'role-pin ' + (id === captain ? 'captain' : '')}>
                    {id === captain ? 'C' : 'V'}
                  </b>
                )}
              </span>
              <span className="nameplate">{player.tag}</span>
            </button>
          ) : (
            <span key={i} className={'station vacant seat-' + i} aria-label="Open starting seat">
              +
            </span>
          );
        })}
      </div>
      <div className="bench-rail">
        <strong>Bench</strong>
        <div>
          {Array.from({ length: Math.max(3, bench.length) }, (_, i) => {
            const id = bench[i];
            return id ? (
              <button key={i} onClick={() => open(id)}>
                <Sprite id={id} />
                {players.get(id)?.tag}
              </button>
            ) : (
              <span className="spare-seat" key={i}>
                Open seat
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function downloadText(name: string, data: string) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([data], { type: 'text/csv;charset=utf-8' }));
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}
