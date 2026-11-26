# Market data — 27 November 2026

Scope: original MoreSidemen Among Us gameplay videos published 27 November 2025–27 November 2026 inclusive. Compilations and IRL videos are excluded. TheTVDB lists 14 gameplay releases in 2026 plus three in December 2025. Dates and abbreviated titles are used for episode reconciliation, not as proof of cast.

## Sources

- [Original tracker by thekesh12](https://docs.google.com/spreadsheets/d/1g3Esmr1-Z5jt5_mqOv9-f9fvyFezgT_2Z-8G7w5ChSU/edit) ([creator's Reddit post](https://www.reddit.com/r/Sidemen/comments/1flz5hp/moresidemen_among_us_stats_this_took_me_months_to/)). Spreadsheet not directly accessible in this research session. Do not redistribute full tabs without checking permission.
- [Sidemen Wiki — Among Us](https://sidemen.fandom.com/wiki/Among_Us): historical episode appearances and four listed recent casts. Community content CC-BY-SA unless otherwise noted. The source's latest-appearance table is incomplete and its Dec 9 roster repeats Calfreezy; deduplicated. Its February 17 date differs from the February 16 official upload; use the upload date. The four roster lists are factual records, attributed here; no wiki prose copied.
- [SDMN Stats — Player statistics](https://www.sdmn-stats.uk/players): small subset of archived aggregate numeric facts (rounds and wins), not a bulk dataset copy. Snapshot may predate the recent episode list; counts are NOT current-year totals. Small sample and data quality issues exist. Unknown counts are null.
- [TheTVDB 2026 episode list](https://www.thetvdb.com/series/sidemen-among-us/seasons/official/2026): candidate coverage checklist. This catalog is community-maintained and may miss uploads or use alternate titles.
- [May 9 reaction transcript](https://www.cockatoo.com/content/miniminter-reacts-to-sidemen-among-us-15-man-special-ultra-chaos-mode) and [Nov 2 recap](https://trari.com/en/story/moresidemen-25182/): partial positive appearance evidence only, not complete rosters.

## Coverage

4 of 17 candidate episodes have a complete published roster; 2 others have partial evidence, 11 remain unreviewed. The 13 incomplete episodes are listed in `src/market-data.js`. Missing records are not proof that a guest was absent. No full round-level dataset has been redistributed or auto-published; existing Data Lab CSV import is the supported path for reviewed results. Market includes 19 confirmed players (7 original Sidemen and 12 guests). Historical players remain resolvable for scoring and existing squads but are not offered for new recruitment until verified.

## Pricing

All catalog entries have a provisional positive price (floor £4.5m, cap £18m, increments £0.5m). Formula: 4.5 + 7 × min(1, career episode count / 123) + 2.5 × (appearances in the four complete rosters / 4) + 10 × (smoothed career round win rate − 0.45). Win-rate prior: 9 wins in 20 rounds. Partial cast evidence qualifies a player, but does not count toward the rate. This is a transparent reliability/skill heuristic, not a statistically optimized or role-normalized fantasy price. It is intentionally conservative for guests with small or missing samples. Recalibrate on verified full-window round-level fantasy scoring, including out-of-sample backtesting; use expected points per eligible video rather than career wins when available. Prices do not affect episode scoring. An existing over-budget roster is reconciled by the existing budget enforcement on load.

No Gemini, YouTube Data API, runtime scraper or API key is required. No source biography text or full proprietary dataset copied. Review source terms and obtain permission before mirroring complete sheets.
