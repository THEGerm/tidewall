# Dashboard design plan

Draft 2, 30 Oct 2026. What the Tidewall site shows, to whom, from which data, and in what order it gets built. It follows [rules.md](rules.md) (draft 3) and the hosting decision in the [plan](plan.md): one Cloudflare Worker serves the pages and the API at `tidewall.tcdar400.workers.dev`.

## The bottom line

Phone first, no frameworks, every page a static file that reads JSON from the Worker. The public sees the city as the city sees itself: public events, the Wire and scores, day by day. Secrets (bribes, empty inspections, messages, diaries) stay hidden while a run is live and open up when it ends. Confidant texts show live under a red CONFIDENTIAL label. Who paid and how many tokens are public run data. Participants get two private pages: My keys (built) and Control (start, pause, ledger).

## Who it's for

| Audience | Wants | Signed in |
|---|---|---|
| Anyone with the link | Watch a run, replay a finished one, read the Wire, see who's winning | No |
| Paper readers | Check the figures against the raw runs; download a run | No |
| Participants (Germ, Shazz, Richard if he joins) | Keys, who paid for what, start and pause runs, see failures | Yes, Cloudflare Access |

## Pages

### 1. Home `/` (built, runs list added)

Project summary, rotation table, and a **runs list**: each run's ID, seating, status, day, and a link. The current live run sits at the top.

### 2. Run `/run/?id=t1-r2` (built, plain map)

The main page. One day at a time, with a day slider and back and forward buttons.

- **City map:** an isometric risograph diorama of Tidewall in the style of GERM-ART-0016 (section "The map" below). It shows today's public facts: storm (Port closed), crime, arrests, fire, a ship. A finished run adds secrets: bribes, empty inspections.
- **The Wire:** the day's news items, each linked to the events it cites. Hovering or tapping an item highlights its districts on the map.
- **Scores:** running totals for Council, Chief, Families and Saltdogs as a small line chart, with today's change.
- **Turf:** both gangs' moves as a two-row strip of coloured squares (respect, encroach) across all days, so cooperation and betrayal read at a glance.
- **Prison and treasury:** two numbers with small trend lines.
- **Confidant panel, live:** each human player's texts to Sam and Sam's replies, for both windows, under a red **CONFIDENTIAL** label. Players never see this page, so showing it live changes nothing in the game.
- **After the run ends:** tabs for messages, diaries and forecasts.

### 3. Game theory `/run/theory/?id=...`

The panel the plan promises, per run and across runs:

- Crime and inspection rates against the equilibrium (27% and 25%), with the Wilson interval.
- Audit rate per district against the 10% line; bribes offered and taken.
- Turf cooperation over game age, with the day-12 boundary marked.
- Forecast accuracy (Brier skill) per player.
- Each player's share of fallback answers and refusals.

Figures use the same functions as `analysis/metrics`, ported to the page or precomputed into the run export. The paper's figures come from the notebooks; the page is for watching.

### 4. Ledger `/me/ledger/` (signed in, built)

After every game day: tokens in, cached and out, plus cost, per participant and provider, with fallback-key rows marked. Running totals per run and for the study, against the budget cap. The same rows, with participant names (never emails), are public data on each run page and in the run export: who paid is part of the record.

### 5. Control `/me/control/` (signed in, built)

- Create a run by hand (a test run, or one study run). The 27 study runs come from a script with the published seeds (#38).
- Start, pause and resume the schedule; play one day by hand (useful for the cheap test run).
- Key check: for each provider, who has a working key today. A run that can't find a key pauses here with the reason.
- Spending cap: total so far against the cap, and the setting.
- Model IDs in use, so pinning can be checked before week 1.

### 6. My keys `/me/` (built)

As now: save, test, delete. Links to the Control page.

## Data and API

All reads are JSON from the Worker. Public endpoints return only what the public may see at that moment.

| Endpoint | Who | Returns |
|---|---|---|
| `GET /api/runs` | public | Runs list: id, seating, status, day, total cost |
| `GET /api/runs/:id/ledger` | public | Tokens and cost per day, provider and payer name |
| `GET /api/runs/:id` | public | Run summary and one row per played day: scores, today's change, treasury, prison count, turf moves, Nature. The seed shows once the run ends |
| `GET /api/runs/:id/days/:day` | public | That day's public events, Wire, scores, open districts and confidant texts (labelled confidential). A finished run adds secrets, messages, diaries and forecasts |
| `GET /api/runs/:id/export` | public, finished runs only | The full `exportRun` JSON, as in `data/runs/` |
| `GET /api/me/ledger` | signed in | Ledger rows by run, day, provider, model and payer name, with totals per payer and per run, and the cap. No emails |
| `POST /api/me/runs/:id/{start,pause,resume,step}` | signed in | Control actions |
| `GET /api/me/keycheck` | signed in | Per provider: participants with a working key |

The public cut is made in one file, `worker/src/engine/public.ts`, and every public endpoint reads through it. `worker/test/engine/public.test.ts` plays a run with bots that leave a secret in every place one can live (messages, diaries, bribes, empty inspections) and checks that no live run's endpoint returns any of them, or its moves, forecasts, answers, welfare or seed. Live answers are sent `no-store`; finished runs are cached for an hour.

Scores show live, as decided. A live Chief or gang score moves with bribes paid or taken, so a careful reader can infer a bribe from it. Players never see the site, so the game is unaffected.

## Look and feel

- **Phone first.** Germ and Shazz check from their phones. Single column under 700 px; map and Wire side by side above it.
- **Same style as now:** the existing `style.css` tokens, light and dark from the system setting, no external fonts or scripts.
- **Charts:** hand-written SVG, a few dozen lines each. No chart library is needed for lines, strips and bars, and it keeps the page fast and the repo dependency-free.
- **Colour:** one colour per gang, used everywhere (map, turf strip, scores). Government and World in neutral tones. Colour is never the only signal: each tile and square also carries a letter or icon.
- **Plain words:** "Families encroached", not "E". Every number has its unit.

## The map

The run page's centrepiece: Tidewall as a four-ink risograph print, drawn in code with Canvas 2D in the manner of the Ancient Egypt poster (AI-Chart `Projects/GERM-ART-0016`, Germ's own work, so its rendering approach can be reused here under the MIT license).

**What carries over from the Egypt poster:**
- **Four inks only, multiplied on warm cream paper.** Every other colour comes from overprinting.
- **Halftone dots** at a separate screen angle per ink, with seeded jitter, blending to flat tone when zoomed out.
- **Press defects:** small misregistration per ink, density drift, dropout speckle on solids.
- **Light as ink:** lamps, fire and the lighthouse as stepped rings of screened ink, never smooth gradients.
- Pan, zoom and double-tap to fly to a district; an idle tour of the districts.
- One file, no images, fonts or libraries.

**The inks, with a meaning in the game:**

| Ink | Hex (as Egypt) | Tidewall meaning |
|---|---|---|
| Lapis | `#21327a` | Key line, night, the sea wall, Government (police, Council) |
| Carnelian | `#d9472e` | Brick, fire, crime, the Families |
| Ochre | `#f0b232` | Lamplight, gold, the Wire and the newspaper kiosks |
| Turquoise | `#18a09c` | Sea, harbour water, the Saltdogs |

**The diorama:** an isometric island inside its sea wall, with the 6 districts as cut-away blocks around the harbour: Port (docks, cranes, the lighthouse), Hightown (terraces), Old Quarter (lanes), Lowtown (tenements), Market (stalls), Seawall (the wall and its gate), plus the prison and the Council house as landmarks. Turf shows in the inks: Families' districts lean Carnelian, Saltdogs' lean Turquoise.

**The day on the map (public facts only while live):**

| Event | Drawn as |
|---|---|
| Storm | Lapis rain hatching over the Port, boats tied up, Port greyed (closed) |
| Crime | A Carnelian flare and smoke over the district |
| Arrest | Lapis lamp rings and a small police wagon heading for the prison |
| Fire | Stepped Carnelian and Ochre rings on the burning block |
| Ship | A cargo ship entering the harbour |
| Strike | Placards outside the Council house |
| Turf | Two banners on the line between the gangs' districts, raised (respect) or torn (encroach) |
| After the run: bribes, empty inspections | Ochre coin marks and empty Lapis lamp rings |

Prison fill and the treasury show as small printed gauges in a corner cartouche, like the Egypt chapter card. The day slider re-prints the sheet for that day, with the plates sliding in.

**Accessibility:** every map fact is also in the text panels beside it. The map adds to them and is never the only source.

**Size:** the Egypt poster is about 190 KB in one file. A city of 6 districts with event overlays should land in the same range. It's built as its own step (D2b), after the run page works with a plain fallback map.

## Build order

| Step | What | Depends on |
|---|---|---|
| D1 ✅ | Public API and its secrecy test; runs list on Home | Storage (done) |
| D2 ✅ | Run page: Wire, scores, turf strip, day slider, plain fallback map, confidant panel, prison and treasury, secrets once the run ends | D1 |
| D2b ⏳ | The risograph map (section "The map"): built in `dashboard/run/map.js`, awaiting Germ's comments | D2 |
| D3 ✅ | Ledger page, and a "Who paid" table on each run page | Ledger PR (engine) |
| D4 ✅ | Control page: create runs, start, pause, step, key check, cap, models in use | Scheduler PR (engine) |
| D5 | Game theory panel | Metrics in the run export |
| D6 | Finished-run tabs: messages, diaries, confidant, forecasts | D2 |

D1 to D2 can run on week-0 bot data, so the run page can be checked before any model is paid for.

## Decisions (Germ, 30 Oct)

| Item | Decision |
|---|---|
| Secrets visible to the public after a run ends | Yes |
| Who paid | Public: payer names and token counts are data attached to each run |
| Confidant texts | Shown live, under a red CONFIDENTIAL label |
| Live view delay | None |
| Map | Risograph style of GERM-ART-0016 |
