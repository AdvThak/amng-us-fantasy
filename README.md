# COSMIC DRAFT 🚀 · Sidemen Among Us Fantasy

An **unofficial**, FPL-inspired, space-pixel fantasy league proof of concept. This is a runnable **Next.js + TypeScript** front-end with a deterministic role-weighted scoring engine and a CSV-based manual data collection prototype.

> All player prices, points and example matches in the demo are **fictional placeholders**, not verified Sidemen gameplay data. Historical community data has not been imported or redistributed. Check permission before reusing anyone else's dataset.

## Quick start

Requires Node.js 20.9+.

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

```bash
npm test
npm run typecheck
npm run build
```

## Built
- Space-pixel responsive UI (no image assets required)
- Interactive roster builder: 8 players, 5 starters, £100m budget, captains and vice captain
- Demo player market with fictional price and performance values
- Manual admin prototype for adding **verified** scoring events and CSV import/export
- Deterministic, deduplicated, configurable role-weighted scoring module + unit tests
- Client-side localStorage persistence for demo teams/events

## Not built yet
- Real player prices or validated historical data
- Authentication, protected administrator routes, real server/database storage
- Server-enforced transfer deadlines, gameweek locks and league leaderboards
- Official video data ingestion or automated publishing

**No Gemini API, no YouTube Data API.** Episode URLs can be registered manually later.

## Importing events

Use the **Data Lab** tab to load `examples/events.csv` or add single events. Supported columns:

`id,video,round,player,type,verified,timestampSeconds,note`

`verified` must be `true`/`false` or `1`/`0`. Only verified events are scored. Participant IDs must match the canonical IDs in the demo for totals to appear on their cards. CSV importing merges by stable event ID, replacing earlier versions; full server-side audit history is future work.

Do **not** treat the local admin panel as production access control; it runs entirely in the browser.

## Architecture

- `app/page.tsx`: fantasy UI / local demo state
- `app/globals.css`: space-pixel visual system
- `src/scoring.js`: deterministic scoring engine
- `src/import.js`: strict CSV parser and importer/exporter
- `src/*.test.js`: Node built-in unit tests
- `docs/PRD.md`: MVP scope

## Publishing to GitHub

The connected GitHub integration in this environment can commit to existing repos but **cannot create new repositories**. Create an empty repository named `sidemen-among-us-fantasy` at https://github.com/new. To push the zip contents yourself:

```bash
git init
git branch -M main
git add .
git commit -m "feat: launch space-pixel fantasy MVP prototype"
git remote add origin https://github.com/YOUR_USERNAME/sidemen-among-us-fantasy.git
git push -u origin main
```

Or enable access to that newly created repo and ask ChatGPT to commit it.
