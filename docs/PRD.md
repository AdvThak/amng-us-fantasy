# Sidemen Among Us Fantasy — MVP PRD

## Goal
Users draft 8 Among Us participants for £100m, choose 5 starters, a captain and vice-captain, and earn role-weighted fantasy points from **verified** events in each eligible video.

## Data collection — explicit exclusions
- Historical community spreadsheets, after reuse permission and source verification.
- Manual video registration and admin entry for new matches.
- Auditable CSV/JSON imports, participant aliasing, event corrections and source timestamp links.
- **Do not build Gemini or YouTube Data API integrations at this stage.**

## Initial rules (provisional)
- 8-player squads, 5 starters, 3 reserves; £100m budget.
- Captain's score doubled. Vice-captain substitutes only when captain is absent.
- One free transfer per gameweek; additional transfers cost four points.
- All scoring coefficients configurable, with clear special-role overrides.
- One eligible video = one gameweek; event points per match, appearance points once per video.
- Lock lineup by a preannounced deadline; not by detection of a video upload.

## MVP milestones
1. Source agreement, participant registry, and CSV importer.
2. Manual admin review, evidence timestamps, and immutable event audit trail.
3. Scoring engine, historical backtest and provisional prices.
4. Authentication, server-validated lineups, transfer locks and persistent gameweeks.
5. Global/private leaderboards, results, and corrections.

## Demo implementation status
The Skeld cafeteria, squad builder and market use a shared gameweek scoring ledger. Data Lab previews the Games and Game Breakdowns CSVs, records locally reviewed episodes and reads earlier event files under legacy rules. The README documents score weights, sample coverage and source corrections. Draft prices and the practice episode are fictional. Accounts, shared standings and server-enforced deadlines remain future milestones.
