'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  crew,
  defaultRoster,
  money,
  players,
  reconcileRoster,
  spend,
  transferPlayer,
  type Roster,
} from '../src/crew.js';
import { demoEpisode } from '../src/demo.js';
import { provisionalId, provisionalLabel, provisionalResult } from '../src/provisional.js';
import { lineupScore, rulebook, rules, scoreEpisode, type Episode } from '../src/gameweek.js';
import { legacyResult, mergeLegacy } from '../src/legacy.js';
import { weights as legacyWeights, type GameEvent } from '../src/scoring.js';
import { replaceEpisode } from '../src/tracker.js';
import { DataLab } from './DataLab';
import { Dialog, Icon, PixelWord, PointsDialog, Room, Sprite } from './Pieces';

const keys = {
  roster: 'cosmic-draft-demo-v2',
  events: 'cosmic-draft-events-v2',
  weeks: 'cosmic-draft-gameweeks-v1',
};
const sections = ['Lobby', 'My squad', 'Market', 'Data Lab'] as const;
type Tab = (typeof sections)[number];
type Popup = 'rules' | 'scores' | { player: string } | null;
type Library = { episodes: Episode[]; current: string };
const emptyLibrary: Library = { episodes: [], current: 'provisional' };

function read<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    throw new Error('Browser storage is unavailable or full. Your previous save is intact.');
  }
}
function readLibrary(): Library {
  const value = read(keys.weeks, emptyLibrary);
  return Array.isArray(value.episodes) && typeof value.current === 'string' ? value : emptyLibrary;
}
function episodeLabel(id: string) {
  return id === 'demo:skeld' ? 'Imported practice' : id === provisionalId ? 'GTA 6 edition · reviewed' : id;
}

export default function Home() {
  const [tab, setTab] = useState<Tab>('Lobby'),
    [popup, setPopup] = useState<Popup>(null);
  const [roster, setRoster] = useState<Roster>(defaultRoster),
    [library, setLibrary] = useState<Library>(emptyLibrary);
  const [legacy, setLegacy] = useState<GameEvent[]>([]),
    [ready, setReady] = useState(false);
  const [notice, setNotice] = useState(''),
    [query, setQuery] = useState(''),
    [replaceId, setReplaceId] = useState(''),
    [sort, setSort] = useState<'points' | 'price'>('points');
  useEffect(() => {
    function restore() {
      const savedRoster = read(keys.roster, defaultRoster);
      const repaired = reconcileRoster(savedRoster);
      setRoster(repaired);
      if (JSON.stringify(savedRoster) !== JSON.stringify(repaired)) {
        try { write(keys.roster, repaired); } catch { /* Keep the repaired roster in memory. */ }
        setNotice('Your squad was repaired to eight eligible players and five starters within £100m.');
      }
      const saved = read<GameEvent[]>(keys.events, []);
      const old = Array.isArray(saved)
        ? saved.filter(
            (e) =>
              e &&
              typeof e.id === 'string' &&
              typeof e.video === 'string' &&
              typeof e.player === 'string' &&
              typeof e.type === 'string' &&
              typeof e.verified === 'boolean',
          )
        : [];
      setLegacy(old);
      const data = readLibrary();
      if (!localStorage.getItem(keys.weeks) && old.length)
        setLibrary({ ...data, current: 'legacy:' + old[0].video });
      else setLibrary(data);
    }
    try {
      restore();
    } catch {
      setNotice('Local saves are unavailable in this browser.');
    }
    setReady(true);
    const sync = (e: StorageEvent) => {
      if (!e.key || Object.values(keys).includes(e.key)) restore();
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 5500);
    return () => clearTimeout(timer);
  }, [notice]);

  const weeks = useMemo(
    () => [
      ...(library.episodes.some(e => e.id === provisionalId)
        ? [] : [{ key: 'provisional', label: provisionalLabel }]),
      ...library.episodes.map((e) => ({ key: 'episode:' + e.id, label: episodeLabel(e.id) })),
      { key: 'demo', label: 'Fictional practice episode' },
      ...[...new Set(legacy.map((e) => e.video))].map((id) => ({
        key: 'legacy:' + id,
        label: 'Legacy · ' + id,
      })),
    ],
    [library.episodes, legacy],
  );
  const active = weeks.find((w) => w.key === library.current) ?? weeks[0];
  const oldMode = active.key.startsWith('legacy:');
  const provisional = active.key === 'provisional';
  const episode = active.key.startsWith('episode:')
    ? (library.episodes.find((e) => 'episode:' + e.id === active.key) ?? demoEpisode)
    : demoEpisode;
  const result = useMemo(
    () => provisional ? provisionalResult() : oldMode ? legacyResult(legacy, active.key.slice(7)) : scoreEpisode(episode),
    [provisional, oldMode, legacy, active.key, episode],
  );
  const points = (id: string) => result.totals[id] ?? 0;
  const name = (id: string) => players.get(id)?.name ?? result.names[id] ?? id;
  const openPlayer = (id: string) => setPopup({ player: id });
  const ranked = [...result.appeared].sort(
    (a, b) => points(b) - points(a) || name(a).localeCompare(name(b)),
  );
  const available = 100 - spend(roster.ids),
    bench = roster.ids.filter((id) => !roster.starters.includes(id));
  const { total, skipper } = lineupScore(roster, result);
  const demo = !provisional && !oldMode && episode.id === demoEpisode.id;
  const outgoing = roster.ids.includes(replaceId) ? replaceId : roster.ids[0];
  const market = crew
    .filter((p) => p.eligible && p.price !== null)
    .filter((p) => (p.name + ' ' + p.tag).toLowerCase().includes(query.trim().toLowerCase()))
    .sort(
      (a, b) =>
        (sort === 'points' ? points(b.id) - points(a.id) : (b.price ?? 0) - (a.price ?? 0)) ||
        a.name.localeCompare(b.name),
    );

  function go(to: Tab) {
    setTab(to);
    setNotice('');
    window.scrollTo({ top: 0 });
  }
  function choose(key: string) {
    const next = { ...readLibrary(), current: key };
    try {
      write(keys.weeks, next);
      setLibrary(next);
    } catch (e) {
      setNotice((e as Error).message);
    }
  }
  function saveRoster(value: Roster) {
    const next = reconcileRoster(value);
    try {
      write(keys.roster, next);
      setRoster(next);
    } catch (e) {
      setNotice((e as Error).message);
    }
  }
  function recruit(id: string) {
    try {
      saveRoster(transferPlayer(roster, outgoing, id));
      setReplaceId(id);
    } catch (e) {
      setNotice((e as Error).message);
    }
  }
  function move(id: string) {
    const starting = roster.starters.includes(id);
    const replacement = starting ? bench[0] : roster.starters[roster.starters.length - 1];
    if (!replacement) return;
    const starters = roster.starters.map(x => x === (starting ? id : replacement) ? (starting ? replacement : id) : x);
    saveRoster({ ...roster, starters });
  }
  function assign(id: string, flag: 'captain' | 'vice') {
    if (flag === 'vice' && roster.starters.length < 2) {
      setNotice('Pick a second starter to appoint a vice-captain.');
      return;
    }
    if (flag === 'vice' && id === roster.captain)
      saveRoster({ ...roster, captain: roster.vice, vice: id });
    else if (flag === 'captain' && id === roster.vice)
      saveRoster({ ...roster, captain: id, vice: roster.captain });
    else saveRoster({ ...roster, [flag]: id });
  }
  const rows = (ids: string[]) => (
    <ol className="score-list">
      {ids.map((id, i) => (
        <li key={id}>
          <button onClick={() => openPlayer(id)}>
            <span className="rank">{String(i + 1).padStart(2, '0')}</span>
            <Sprite id={id} />
            <strong>{name(id)}</strong>
            <span className="row-points">
              {points(id)} <small>pts</small>
            </span>
            <span aria-hidden="true">›</span>
          </button>
        </li>
      ))}
    </ol>
  );
  const manageRows = (ids: string[]) =>
    ids.map((id) => {
      const p = players.get(id)!;
      const starting = roster.starters.includes(id);
      return (
        <div className="manage-row" key={id}>
          <button className="identity" onClick={() => openPlayer(id)}>
            <Sprite id={id} />
            <span>
              <b>{p.name}</b>
              <small>
                {money(p.price)} · {points(id)} pts
              </small>
            </span>
          </button>
          <div className="row-controls">
            {starting && (
              <>
                <button
                  className="flag-btn"
                  aria-label={'Make ' + p.name + ' captain'}
                  aria-pressed={id === roster.captain}
                  onClick={() => assign(id, 'captain')}
                >
                  C
                </button>
                <button
                  className="flag-btn"
                  aria-label={'Make ' + p.name + ' vice-captain'}
                  aria-pressed={id === roster.vice}
                  onClick={() => assign(id, 'vice')}
                >
                  V
                </button>
              </>
            )}
            <button className="small-button" onClick={() => move(id)}>
              {starting ? 'Bench' : 'Start'}
            </button>
            <button className="remove-btn" aria-label={'Transfer out ' + p.name} onClick={() => { setReplaceId(id); go('Market'); }}>
              ×
            </button>
          </div>
        </div>
      );
    });
  const guide = oldMode
    ? [
        ['Match win', legacyWeights.match_win],
        ['Impostor kill', legacyWeights.impostor_kill],
        ['Correct crew vote', legacyWeights.crew_correct_vote],
      ]
    : [
        ['Crewmate win', rules.crewWin],
        ['Impostor win', rules.impWin],
        ['Neutral or Lovers win', rules.neutralWin],
      ];
  const ruleRows = oldMode
    ? Object.entries(legacyWeights).map(([key, value]) => [
        key.replaceAll('_', ' '),
        (value > 0 ? '+' : '') + value,
        '',
      ])
    : rulebook;
  const title = {
    Lobby: 'Crew lobby',
    'My squad': 'My squad',
    Market: 'Player market',
    'Data Lab': 'Data Lab',
  }[tab];
  const description = {
    Lobby: 'Select a crewmate to inspect their points.',
    'My squad': 'Choose your five starters, captain and vice-captain.',
    Market: 'Keep eight players within £100m using one-for-one transfers.',
    'Data Lab': 'Review episode records and keep the results on this browser.',
  }[tab];
  return (
    <>
      <a href="#main" className="skip">
        Skip to content
      </a>
      <header className="site-header">
        <div className="shell header-inner">
          <button className="brand" onClick={() => go('Lobby')} aria-label="Cosmic Draft lobby">
            <span className="brand-mark">
              <Sprite id="brand" />
            </span>
            <span>
              <b>
                <PixelWord text="Cosmic Draft" />
              </b>
              <small>Sidemen Among Us fantasy</small>
            </span>
          </button>
          <nav aria-label="Main sections">
            {sections.map((item, i) => (
              <button
                key={item}
                aria-current={tab === item ? 'page' : undefined}
                onClick={() => go(item)}
              >
                <Icon index={i} />
                {item}
              </button>
            ))}
          </nav>
          <button className="rules-button" onClick={() => setPopup('rules')}>
            <span aria-hidden="true">?</span> How to play
          </button>
        </div>
      </header>
      <main id="main" className="shell">
        <div className="page-title">
          <div>
            <h1>
              <PixelWord text={title} />
            </h1>
            <p>{description}</p>
          </div>
          <label className="week-select">
            Gameweek
            <select value={active.key} disabled={!ready} onChange={(e) => choose(e.target.value)}>
              {weeks.map((w) => (
                <option key={w.key} value={w.key}>
                  {w.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {provisional && <p className="feedback" role="note">Provisional GTA 6 recap only: no confirmed round results. Unreported players and actions are unknown, not zero performance. Squad and captain totals reflect candidates only. <a href="https://www.youtube.com/watch?v=vunYsm7gV9s" target="_blank" rel="noreferrer">Watch episode ↗</a></p>}
        {tab === 'Lobby' && (
          <>
            <div className="lobby-grid">
              <Room
                starters={roster.starters}
                bench={bench}
                captain={roster.captain}
                vice={roster.vice}
                open={openPlayer}
              />
              <section className="score-panel">
                <div className="score-title">
                  <h2>Squad score</h2>
                  <Icon index={5} />
                </div>
                <div className="score-value">
                  <PixelWord text={String(total)} />
                  <small>pts</small>
                </div>
                <p className="score-caption">
                  {provisional ? 'Provisional candidate points' : demo
                    ? 'Fictional practice points'
                    : oldMode
                      ? 'Legacy event points'
                      : 'Reviewed episode points'}
                </p>
                <dl className="score-facts">
                  <div className="squad-meter">
                    <dt>Squad</dt>
                    <dd>{roster.ids.length} / 8</dd>
                  </div>
                  <div className="seats-meter" aria-hidden="true">
                    {Array.from({ length: 8 }, (_, i) => (
                      <i key={i} className={i < roster.ids.length ? 'occupied' : undefined} />
                    ))}
                  </div>
                  <div>
                    <dt>Budget left</dt>
                    <dd>{money(available)}</dd>
                  </div>
                  <div>
                    <dt>Double points</dt>
                    <dd>{skipper ? players.get(skipper)?.tag + ' ×2' : 'Unassigned'}</dd>
                  </div>
                </dl>
                <button className="button primary" onClick={() => go('My squad')}>
                  Edit squad <span>→</span>
                </button>
              </section>
            </div>
            <div className="lobby-bottom">
              <section className="panel manifest">
                <div className="panel-heading">
                  <h2>{provisional ? 'Provisional candidates' : 'Episode leaders'}</h2>
                  <button className="link-button" onClick={() => setPopup('scores')}>
                    All scores →
                  </button>
                </div>
                {ranked.length ? (
                  rows(ranked.slice(0, 4))
                ) : (
                  <p className="empty">No scored appearances in this episode.</p>
                )}
              </section>
              <section className="panel quick-rules">
                <div className="panel-heading">
                  <h2>{oldMode ? 'Legacy points guide' : 'Points guide'}</h2>
                  <Icon index={3} />
                </div>
                <dl>
                  {guide.map(([label, value], i) => (
                    <div key={label}>
                      <dt>
                        <i className={'pip ' + ['crew-pip', 'imp-pip', 'neutral-pip'][i]} />
                        {label}
                      </dt>
                      <dd>+{value}</dd>
                    </div>
                  ))}
                </dl>
                <button className="link-button" onClick={() => setPopup('rules')}>
                  Read all scoring rules →
                </button>
              </section>
            </div>
          </>
        )}
        {tab === 'My squad' && (
          <>
            <div className="budget-bar">
              <span>
                Squad <b>{roster.ids.length}/8</b>
              </span>
              <span>
                Budget left <b>{money(available)}</b>
              </span>
              <span>
                Squad score <b>{total} pts</b>
              </span>
              <button className="link-button" onClick={() => go('Market')}>
                Open market →
              </button>
            </div>
            <div className="squad-layout">
              <section className="panel">
                <div className="panel-heading">
                  <h2>Starting five</h2>
                  <span>{roster.starters.length} / 5</span>
                </div>
                {manageRows(roster.starters)}
                {roster.starters.length < 5 && (
                  <p className="empty">
                    Open starting seat. Start a reserve or recruit from the market.
                  </p>
                )}
              </section>
              <section className="panel">
                <div className="panel-heading">
                  <h2>Reserve bench</h2>
                  <span>{bench.length} seated</span>
                </div>
                {manageRows(bench)}
                {!bench.length && <p className="empty">Your reserve seats are empty.</p>}
              </section>
            </div>
            <p className="footnote">
              C earns double points. V takes over if the captain misses the whole episode. Starting a reserve swaps with the last starter; benching a starter swaps with the first reserve.
            </p>
          </>
        )}
        {tab === 'Market' && (
          <section className="panel market-panel">
            <div className="market-tools">
              <label>
                Find a player
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Name or alias"
                />
              </label>
              <label>
                Sort by
                <select value={sort} onChange={(e) => setSort(e.target.value as 'points' | 'price')}>
                  <option value="points">Episode points</option>
                  <option value="price">Draft price</option>
                </select>
              </label>
              <label>
                Transfer out
                <select value={outgoing} onChange={(e) => setReplaceId(e.target.value)}>
                  {roster.ids.map(id => <option key={id} value={id}>{name(id)} · {money(players.get(id)?.price ?? null)}</option>)}
                </select>
              </label>
              <span>
                Transfer budget <b>{money(available + (players.get(outgoing)?.price ?? 0))}</b>
              </span>
            </div>
            <table className="market-table">
              <thead>
                <tr>
                  <th>Player</th>
                  <th>GW pts</th>
                  <th>Price</th>
                  <th>
                    <span className="sr-only">Squad action</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {market.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <button className="identity" onClick={() => openPlayer(p.id)}>
                        <Sprite id={p.id} />
                        <span>
                          <b>{p.name}</b>
                          <small>{p.tag} · Skill {p.communitySkill ?? 'unrated'} · {p.priceUncertainty} uncertainty</small>
                        </span>
                      </button>
                    </td>
                    <td>{provisional && !result.appeared.has(p.id) ? '—' : points(p.id)}</td>
                    <td>{money(p.price)}</td>
                    <td>
                      <button
                        className={'small-button ' + (roster.ids.includes(p.id) ? '' : 'sign')}
                        aria-label={(roster.ids.includes(p.id) ? 'Already in squad: ' : 'Transfer in ') + p.name}
                        disabled={roster.ids.includes(p.id) || (p.price ?? Infinity) > available + (players.get(outgoing)?.price ?? 0)}
                        onClick={() => recruit(p.id)}
                      >
                        {roster.ids.includes(p.id) ? 'In squad' : 'Transfer in'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!market.length && <p className="empty">No players match “{query}”.</p>}
            <p className="footnote">
              Research-recommended prices reflect community skill rankings, appearance evidence and archived performance proxies. The 20-player market excludes vetoed players. Full-year cast coverage and fantasy scoring backtests remain incomplete. Points shown are from the selected gameweek.
            </p>
          </section>
        )}
        {tab === 'Data Lab' && (
          <DataLab
            episodes={library.episodes}
            legacy={legacy}
            open={(key) => {
              choose(key);
              go('Lobby');
            }}
            save={(draft) => {
              const next = {
                episodes: replaceEpisode(readLibrary().episodes, draft),
                current: 'episode:' + draft.episode.id,
              };
              write(keys.weeks, next);
              setLibrary(next);
            }}
            saveLegacy={(csv, video) => {
              const records = mergeLegacy(read<GameEvent[]>(keys.events, legacy), csv);
              write(keys.events, records);
              setLegacy(records);
              choose('legacy:' + video);
            }}
          />
        )}
      </main>
      <footer className="shell site-footer">
        <span>
          <i className="status-light" /> Cosmic Draft
        </span>
        <span>Unofficial Sidemen Among Us fantasy</span>
      </footer>
      {notice && (
        <div role="status" className="toast">
          {notice}
          <button onClick={() => setNotice('')} aria-label="Dismiss message">
            ×
          </button>
        </div>
      )}
      {popup === 'rules' && (
        <Dialog title={oldMode ? 'Legacy scoring' : 'How points work'} dismiss={() => setPopup(null)}>
          <p className="help">
            One MoreSidemen video is one gameweek. Your five starters score. The captain’s episode points
            count twice, including a zero or negative total.
          </p>
          <dl className="rulebook">
            {ruleRows.map(([label, value, note]) => (
              <div key={label}>
                <dt>
                  {label}
                  <small>{note}</small>
                </dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          {!oldMode && (
            <p className="help">
              A draw keeps round and action points. A void round gives none. Disconnected players keep
              points earned before leaving. Task bonuses require recorded counts for every eligible
              crewmate. Neutral and Lovers weights are provisional.
            </p>
          )}
        </Dialog>
      )}
      {popup === 'scores' && (
        <Dialog title="Episode scores" dismiss={() => setPopup(null)}>
          <p className="help">{active.label}</p>
          {ranked.length ? rows(ranked) : <p className="empty">No scored appearances.</p>}
        </Dialog>
      )}
      {popup && typeof popup === 'object' && (
        <PointsDialog
          id={popup.player}
          result={result}
          episode={active.label}
          dismiss={() => setPopup(null)}
        />
      )}
    </>
  );
}
