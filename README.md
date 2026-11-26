# Cosmic Draft · Sidemen Among Us fantasy

Draft eight players for £100m and seat five starters around the Skeld cafeteria table. Select a suit to see each award, its CSV record and the round's video link. The opening practice episode and the draft prices are fictional. Reviewed imports and squads are saved in the importing browser.

## Run locally

Use Node.js 22 or newer. Run `npm install`, then `npm run dev`. Open `http://localhost:3000`. Run `npm test`, `npm run typecheck` and `npm run build` before publishing.

## Import an episode

1. Open Kesh's tracker and export the **Games** and **Game Breakdowns** tabs individually as CSV. The site accepts either both full tabs or matching subsets. Include every game of any episode you intend to confirm.
2. Open **Data Lab**, select the two files and choose **Preview import**. Select a video, check its games and inspect any coverage notes. Correct errors in the source files and preview again.
3. Choose **Confirm complete episode**. Confirming a correction replaces the entire previous version of that video in one browser save. Switch gameweeks using the selector on any screen. The lobby shows your selected lineup's score for that episode.

Games uses `Game Number`, `Video Link`, `Winner` and `Players, Roles and Tasks`. The optional `Map Name` appears with the source evidence. Game Breakdowns uses `Game Number`, `Sequence`, `Primary Player`, `Event Type` and `Secondary Player`. The importer accepts the tracker's duplicate headings, quoted multiline rosters and timestamped YouTube links. A breakdown sequence gives the action order. The video link opens the recorded start of the round.

### Resolving tracker ambiguities

Use these optional columns when the source supports the correction. Put full names or known aliases in these fields. Keep unresolved episodes in preview.

| Tab | Column | Value |
| --- | --- | --- |
| Games | Player Teams | Starting alignments such as `Simon=crew\|JJ=imp\|Harry=neutral` |
| Games | Final Teams | Confirmed ending alignments for a changed role, using the same format |
| Games | Winner Players | All confirmed beneficiaries, separated by a vertical bar, including co-winners |
| Game Breakdowns | Actor Team / Target Team | The alignment at this action when a participant has changed role |
| Game Breakdowns | Opponents | `true` or `false` for an otherwise ambiguous neutral pairing |

A conflict at the same game and sequence prevents confirmation. A repeated identical record earns points once. Guests appear in results under their names. Only priced players can be drafted. The Data Lab includes two fictional practice CSV downloads and accepts the earlier eight-column events under **Legacy event CSVs**. Legacy results retain the original event weights.

## Gameweek scoring

| Award | Points |
| --- | ---: |
| Episode appearance | +3 once |
| Non-void round played | +1 |
| Crewmate / impostor / confirmed neutral or Lovers victory | +5 / +3 / +8 |
| Attributed opposing elimination | +1 each, first two per player per round |
| Crewmate body report | +1 for the player's first report per round |
| Crewmate tasks | +1 for at least half, another +1 for all |
| Impostor voted out | −2 once per round |

For example, a crewmate who wins, reports twice and completes 7/7 tasks earns 9 round points. Appearance is a separate once-per-video award. Task points require valid counts for every eligible crewmate in the round. Kills and reports use explicit action records. Self-kills, friendly fire and unattributed collateral earn zero. Death or ejection preserves a side victory. Disconnected players keep earned actions, draws retain recorded actions and void rounds are excluded. Only five starters contribute to a squad total. The captain doubles their full episode total, including zero or negative points. An absent captain passes the multiplier to the vice-captain.

A balance check on 100 archived rounds with only base roles gave 3.54 points per crewmate appearance and 3.50 per impostor appearance before episode and captain bonuses. Nineteen rounds had complete task counts. Neutral and Lovers weights are provisional. Career totals are a cross-check for the underlying records. Use the episode records to calculate weekly points. [Archived breakdowns](https://github.com/Kochou11/Sidemen-amongus/blob/374e004a03744731b62dc2d3b801486e0e0ebad3/Data/MoreSidemen_Among_Us.json) · [Kesh's tracker](https://docs.google.com/spreadsheets/d/1g3Esmr1-Z5jt5_mqOv9-f9fvyFezgT_2Z-8G7w5ChSU/edit) · [SDMN round index](https://www.sdmn-stats.uk/games)

The repository ships original practice data. Check reuse permission before redistributing a community dataset. Local CSV confirmation records the importer's review. Shared standings, accounts and server-enforced deadlines are future work.

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

Do not use the server-rendered Next.js preset. This prototype stores all state in each browser's localStorage; reviewed CSVs are local to the importing browser. Server-side features will require a separate backend or a future migration to a server-capable deployment.

References: https://developers.cloudflare.com/workers/static-assets/ and https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/
