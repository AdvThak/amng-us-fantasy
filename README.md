# COSMIC DRAFT 🚀 · Sidemen Among Us Fantasy

An **unofficial**, FPL-inspired, space-pixel fantasy league proof of concept. This is a runnable **Next.js + TypeScript** front-end with a deterministic role-weighted scoring engine and a CSV-based manual data collection prototype.

> All player prices, points and example matches in the demo are **fictional placeholders**, not verified Sidemen gameplay data. Historical community data has not been imported or redistributed. Check permission before reusing anyone else's dataset.

## Quick start

Requires Node.js 22 or newer.

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

## Cloudflare deployment

This client-side MVP uses Next.js static export. The build writes the complete website to `out/`; no server runtime, API keys, database or Next.js adapter is required.

### Cloudflare Workers (recommended)

In the Cloudflare dashboard, open Workers & Pages, create a Worker by importing the GitHub repository `AdvThak/amng-us-fantasy`, and configure:

- Production branch: `main`
- Root directory: repository root
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Node.js version: 22 (set `NODE_VERSION=22` if needed)

The included `wrangler.jsonc` declares the Worker name and static assets directory. Use the same Worker name in the dashboard, or update the configuration to match the chosen name. Cloudflare supplies the deployment URL after a successful build.

Alternatively, deploy manually after authenticating Wrangler:

```bash
npm install
npx wrangler login
npm run deploy
```

To preview the production output locally:

```bash
npm run preview
```

### Cloudflare Pages (alternative)

Create a Pages project from the same GitHub repository. Choose **Next.js (Static HTML Export)**, set production branch to `main`, build command to `npm run build`, output directory to `out`, and `NODE_VERSION=22`. No environment secrets are needed.

Do not use the server-rendered Next.js preset. This prototype stores all state in each browser's localStorage; the Data Lab is not a protected admin area. Server-side features will require a separate backend or a future migration to a server-capable deployment.

References: https://developers.cloudflare.com/workers/static-assets/ and https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/
