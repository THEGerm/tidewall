# Dashboard design plan

Draft 1, 30 Oct 2026. What the Tidewall site shows, to whom, from which data, and in what order it gets built. It follows [rules.md](rules.md) (draft 3) and the hosting decision in the [plan](plan.md): one Cloudflare Worker serves the pages and the API at `tidewall.tcdar400.workers.dev`.

## The bottom line

Phone first, no frameworks, every page a static file that reads JSON from the Worker. The public sees the city as the city sees itself: public events, the Wire and scores, day by day. Secrets (bribes, empty inspections, messages, diaries, confidant texts) stay hidden while a run is live and open up when it ends. Participants get two private pages: My keys (built) and Control (start, pause, ledger).

## Who it's for

| Audience | Wants | Signed in |
|---|---|---|
| Anyone with the link | Watch a run, replay a finished one, read the Wire, see who's winning | No |
| Paper readers | Check the figures against the raw runs; download a run | No |
| Participants (Germ, Shazz, Richard if he joins) | Keys, who paid for what, start and pause runs, see failures | Yes, Cloudflare Access |

## Pages

### 1. Home `/` (built, to update)

Project summary, rotation table, and a **runs list**: each run's ID, seating, status, day, and a link. The current live run sits at the top.

### 2. Run `/run/?id=t1-r2`

The main page. One day at a time, with a day slider and back and forward buttons.

- **City map:** the 6 districts as a simple SVG grid, coloured by gang turf. Each tile shows today's public facts: storm (closed), crime, arrest, fire. A finished run adds secrets: bribes, empty inspections.
- **The Wire:** the day's news items, each linked to the events it cites. Hovering or tapping an item highlights its districts on the map.
- **Scores:** running totals for Council, Chief, Families and Saltdogs as a small line chart, with today's change.
- **Turf:** both gangs' moves as a two-row strip of coloured squares (respect, encroach) across all days, so cooperation and betrayal read at a glance.
- **Prison and treasury:** two numbers with small trend lines.
- **After the run ends:** tabs for messages, diaries, the confidant texts (before and after the bribe answers), and forecasts. This is where the "texts home" become readable.

### 3. Game theory `/run/theory/?id=...`

The panel the plan promises, per run and across runs:

- Crime and inspection rates against the equilibrium (27% and 25%), with the Wilson interval.
- Audit rate per district against the 10% line; bribes offered and taken.
- Turf cooperation over game age, with the day-12 boundary marked.
- Forecast accuracy (Brier skill) per player.
- Each player's share of fallback answers and refusals.

Figures use the same functions as `analysis/metrics`, ported to the page or precomputed into the run export. The paper's figures come from the notebooks; the page is for watching.

### 4. Ledger `/me/ledger/` (signed in)

After every game day: tokens in, cached and out, plus cost, per participant and provider, with fallback-key rows marked. Running totals per run and for the study, against the budget cap. The public run page shows a summary row (total cost per run) without who paid.

### 5. Control `/me/control/` (signed in)

- Create the 27 runs from the triple seeds and seating (once).
- Start, pause and resume the schedule; play one day by hand (useful for the cheap test run).
- Key check: for each provider, who has a working key today. A run that can't find a key pauses here with the reason.
- Spending cap: total so far against the cap, and the setting.
- Model IDs in use, so pinning can be checked before week 1.

### 6. My keys `/me/` (built)

As now: save, test, delete. Add a link to the ledger and control pages.

## Data and API

All reads are JSON from the Worker. Public endpoints return only what the public may see at that moment.

| Endpoint | Who | Returns |
|---|---|---|
| `GET /api/runs` | public | Runs list: id, seating, status, day, total cost |
| `GET /api/runs/:id` | public | Run summary and per-day scores |
| `GET /api/runs/:id/days/:day` | public | That day's public events, Wire, scores, open districts. A finished run adds secrets, messages, diaries, forecasts and confidant texts |
| `GET /api/runs/:id/export` | public, finished runs only | The full `exportRun` JSON, as in `data/runs/` |
| `GET /api/me/ledger` | signed in | Ledger rows and totals |
| `POST /api/me/runs/:id/{start,pause,resume,step}` | signed in | Control actions |
| `GET /api/me/keycheck` | signed in | Per provider: participants with a working key |

The public cut is made in one function on the Worker, next to `yesterday()` in `store.ts`, and tested the same way: a test checks that no live run's endpoint ever returns a secret event, a message, a diary or a confidant text.

## Look and feel

- **Phone first.** Germ and Shazz check from their phones. Single column under 700 px; map and Wire side by side above it.
- **Same style as now:** the existing `style.css` tokens, light and dark from the system setting, no external fonts or scripts.
- **Charts:** hand-written SVG, a few dozen lines each. No chart library is needed for lines, strips and bars, and it keeps the page fast and the repo dependency-free.
- **Colour:** one colour per gang, used everywhere (map, turf strip, scores). Government and World in neutral tones. Colour is never the only signal: each tile and square also carries a letter or icon.
- **Plain words:** "Families encroached", not "E". Every number has its unit.

## Build order

| Step | What | Depends on |
|---|---|---|
| D1 | Public API and its secrecy test; runs list on Home | Storage (done) |
| D2 | Run page: map, Wire, scores, turf strip, day slider | D1 |
| D3 | Ledger table and the ledger page | Ledger PR (engine) |
| D4 | Control page: create runs, start, pause, step, key check, cap | Scheduler PR (engine) |
| D5 | Game theory panel | Metrics in the run export |
| D6 | Finished-run tabs: messages, diaries, confidant, forecasts | D2 |

D1 to D2 can run on week-0 bot data, so the run page can be checked before any model is paid for.

## Open decisions

| Item | Draft | Who |
|---|---|---|
| Secrets visible to the public after a run ends | Yes: the data goes public in the repo anyway | Germ and Shazz |
| Who paid, shown publicly | No: public sees total cost per run only | Germ and Shazz |
| Confidant texts on the public replay | Yes, after the run ends | Germ and Shazz |
| Live view lag | None: a day appears when it's saved | Germ |
