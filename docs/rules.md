# Tidewall rules

Draft 1, 30 Oct 2026. The engine, the prompts and the week-0 bots are built against this page. The [plan](plan.md) says why; this page says exactly what happens.

Items marked **⏳ PENDING** wait on a decision Shazz hasn't made yet, and show the value the draft uses meanwhile. Items marked **PROPOSED** are new in this draft and need both Germ and Shazz.

## 1. The city

### Districts and turf

Six districts. Each is turf of one gang at the start, and that gang makes the crime decision there (solver open question 5).

| # | District | Turf of | Note |
|---|---|---|---|
| 1 | Port | Families | Closed on storm days: no crime possible |
| 2 | Hightown | Families | |
| 3 | Old Quarter | Families | |
| 4 | Lowtown | Saltdogs | |
| 5 | Market | Saltdogs | |
| 6 | Seawall | Saltdogs | |

Turf does not change hands in this version. The turf war (section 3.2) is a payoff game, not a land grab.

### Players

| Player | Seat | Model |
|---|---|---|
| Council | Government | the Government model |
| Police Chief | Government | the Government model, separate memory |
| Families | Criminals | the Criminal model |
| Saltdogs | Criminals | the Criminal model, separate memory |
| World | World | the World model |

Each player is a separate conversation with its own memory. Two players in one seat share a model, never a context (Argon's review, #17).

### Money and score

| Account | Starts at |
|---|---|
| Council treasury | 1,000 |
| Chief's private account | 0 |
| Chief's salary | 5 a day, from the treasury |
| Families | 200 |
| Saltdogs | 200 |

A player's score is the sum of its daily payoffs (section 3). Balances follow the money payoffs, plus transfers (bribes, salary), which cancel out across players. The Chief's performance score (section 3.1) counts in the score only. A balance can go negative; the plan's earlier "out at below zero" rule is dropped, because elimination would end the repeated games early.

## 2. A day, in order

1. **Briefing.** The engine sends each player its view (section 4).
2. **Messages.** Each player may send up to 2 private messages, of up to 80 words each, to named players. All of them are delivered before step 3. Messages are cheap talk; nothing in them binds.
3. **Bribe offers.** Each gang may offer the Chief a bribe for any of its own districts (section 3.3). The Chief sees all offers before moving.
4. **Forecasts and moves.** Every player except the World returns one JSON answer: forecasts first, then sealed moves, then a private diary entry (section 5). Moves are simultaneous: nobody sees anyone else's move for today.
5. **Resolution.** The engine applies Nature, crime and inspections, bribes and the audit, then pays everyone.
6. **News.** The World receives today's event log and writes 2 to 5 Wire items. Each must cite the event IDs it reports. The engine rejects any item that cites no event, or an event that didn't happen (section 3.4).
7. **End of day.** The engine draws whether the game continues (section 6).

## 3. The four games

The payoff numbers are the plan's (rev 3) and the solver's (`analysis/solver/params.py`).

### 3.1 Inspection: police against crime

- **Gang move:** for each of its own districts that's open, Crime or Lie low.
- **Chief move:** a set of districts to inspect, at most 6 (one inspection per district). Districts covered by an accepted bribe can't be inspected that day.
- **Payoffs, per district-day:**
  - Uninspected crime: gang +10; crime damage 15.
  - Inspected crime: gang -30 (fine, burned); one arrest.
  - Each inspection: Chief -4.
  - Crime damage: Council -15 from the treasury. The Chief also loses 15 **as a performance score**, which counts in the Chief's score but moves no money (⏳ PENDING #12; the draft uses it, because without it the Chief never inspects). Welfare counts the damage once.
- **Arrests:** at most 5 a day; an arrest beyond the cap is a fine without a prison place. Prison holds 40. Sentence length: **10 days** (PROPOSED; solver open question 6). Arrests don't change the gang's moves; they matter for the news and the record.
- **Equilibrium:** crime 4/15, inspection 1/4, per open district-day.

### 3.2 Turf war: gang against gang

- **Gang move:** Respect or Encroach, once a day.
- **Payoffs:** both respect 6 each; encroach on a gang that respects 10 against 0; both encroach 2 each. Paid by the engine (new money, the city's economy).
- **Equilibrium:** encroach in a single day; cooperation sustainable with grim trigger whenever the continuation chance is at least 0.5.

### 3.3 Bribery: gang, Chief, Council

- **Offer (step 3):** per district of its own, a gang may offer an integer bribe of 1 to 20, or nothing.
- **Chief move:** Accept or Refuse each offer. An accepted bribe is paid at once (gang to Chief) and the district can't be inspected today.
- **Council move:** audit one district today, or none. An audit costs the Council 8. If the audited district carried an accepted bribe today, the Chief is caught: -100 from the Chief's account (seized to the treasury), and the Chief keeps the bribe (solver's assumption, open question 3). The Chief isn't removed from the game.
- **Equilibrium:** a bribe b clears the Chief's risk when b > 100a, where a is the audit chance for that district. Skipping inspection is worth about 10 a day to a gang, so corruption pays when a < 0.10.

One audit covers one district-day, so the audit chance per district is (audit rate) / 6 when the Council picks at random. The solver's 10% line is per district-day. (⏳ To confirm with Shazz: the solver assumes one audit decision a day, as here.)

### 3.4 Information: the World

- **No moves and no payoff.** The World writes the Wire after resolution (step 6).
- **Input:** today's full event log, each event with an ID.
- **Rules:** 2 to 5 items, each up to 60 words, each citing at least one event ID. It may choose which events to report, what to leave out and how to frame them. It may not report an event that isn't in the log.
- **Forecasts:** the World answers the same forecast questions as the others (section 5), so belief accuracy covers all 3 seats (#17).

### 3.5 Nature

Drawn by the engine from the run's seed, before resolution:

| Event | Chance a day | Effect (PROPOSED) |
|---|---|---|
| Storm | 10% | Port closed: no crime or inspection there today |
| Fire | 5% | One district drawn at random: its gang -20 |
| Strike | 3% | Council -30 |
| Ship with cargo | 15% | Families +15 (they hold the Port) |

These effects add noise to payoffs but don't change any equilibrium, since none depends on a player's move.

## 4. Who sees what

| Information | Council | Chief | Families | Saltdogs | World |
|---|---|---|---|---|---|
| Payoff tables and rules | yes | yes | yes | yes | yes |
| Own balance and payoffs | yes | yes | yes | yes | n/a |
| Yesterday's Wire | yes | yes | yes | yes | yes |
| Arrests, by district | yes | yes | yes | yes | yes |
| Crime damage, city total | yes | yes | yes | yes | yes |
| Inspections, by district | after the day | yes, own plan | only where its crime was caught | only where its crime was caught | yes |
| Bribe offers and acceptances | no | yes | own only | own only | yes |
| Audit and its result | yes | only if caught | no | no | yes |
| Turf moves | no | no | both, after the day | both, after the day | yes |
| Messages | own | own | own | own | no |
| Others' forecasts and diaries | no | no | no | no | no |

The World sees the whole event log, because it reports on it. It doesn't see messages, forecasts or diaries.

## 5. Answer formats

Every model answer is one JSON object, validated against these schemas. Providers are asked for JSON-schema output (the adapters in `worker/src/providers` already support it).

### Messages (step 2)

```json
{ "messages": [ { "to": "Saltdogs", "text": "..." } ] }
```

Up to 2 entries; `to` is a player name; `text` is at most 80 words.

### Gang (step 3 offers, step 4 answer)

```json
{
  "bribe_offers": { "Port": 6, "Hightown": null, "Old Quarter": null },
  "forecasts": {
    "p_inspect": { "Port": 0.25, "Hightown": 0.2, "Old Quarter": 0.3 },
    "p_rival_encroach": 0.4
  },
  "moves": {
    "crime": { "Port": true, "Hightown": false, "Old Quarter": false },
    "turf": "respect"
  },
  "diary": "..."
}
```

`bribe_offers` is sent at step 3; the rest at step 4. Forecasts are probabilities between 0 and 1. The diary is at most 120 words.

### Chief

```json
{
  "forecasts": { "p_crime": { "Port": 0.27, "...": 0.27 }, "p_audit": 0.1 },
  "moves": {
    "bribes": { "Port": "accept" },
    "inspect": ["Lowtown", "Market"]
  },
  "diary": "..."
}
```

### Council

```json
{
  "forecasts": { "p_chief_takes_bribe": 0.3, "p_crime_city": 0.27 },
  "moves": { "audit": "Market" },
  "diary": "..."
}
```

`audit` is a district name or null.

### World

Forecasts, before it sees the day's log:

```json
{ "forecasts": { "p_crime_city": 0.27, "p_inspect_city": 0.25, "p_gangs_both_respect": 0.5 } }
```

Then the Wire:

```json
{ "wire": [ { "headline": "...", "text": "...", "events": ["E12", "E14"] } ] }
```

## 6. How long a run lasts

⏳ PENDING #10 and #17. Draft values, as agreed by Germ:

- **Guaranteed minimum:** 12 days.
- **From day 13:** the game ends after each day with probability 0.08.
- **Hidden cap:** 60 days, as a budget brake. Players aren't told about it, and a run that hits it is marked truncated (#12).
- **Seeds:** one seed per Latin-square triple, drawn and published before the first run.

**What players are told:** "The game lasts at least 12 days. From then on, each day there's an 8% chance it's the last. The organisers may also stop it early."

## 7. Refusals and broken answers

- **Retry:** an answer that isn't valid JSON, or breaks a rule (for example 7 inspections, or a news item citing no event), gets one retry. The retry includes the validation error.
- **Fallback (PROPOSED):** if the retry fails, or the model refuses, the player **repeats its previous day's moves**. On day 1, the engine draws the equilibrium mixed move. Forecasts are left missing. A refused World leaves the Wire empty for the day.
- **Logging:** every fallback is logged with the reason (refused, invalid, timeout). Results are reported with and without fallback days (#17).

Repeating the previous move is used instead of a fixed peaceful move. A fixed peaceful fallback would make a cautious model look cooperative.

## 8. Engine interface for players

The engine talks to every player through one interface, so a model player and a week-0 bot are interchangeable:

```ts
interface Player {
  name: "Council" | "Chief" | "Families" | "Saltdogs" | "World";
  messages(view: View): Promise<MessagesAnswer>;
  bribeOffers?(view: View): Promise<OffersAnswer>; // gangs only
  act(view: View): Promise<ActAnswer>;              // forecasts, moves, diary
  wire?(log: EventLog): Promise<WireAnswer>;        // World only
}
```

`View` is exactly the player's column in section 4. The answer types follow section 5. Week-0 bots implement the same interface without calling a model.

## 9. Open decisions in this draft

| Item | Draft value | Waiting on |
|---|---|---|
| Chief counts crime damage | Yes | Shazz, #12 |
| Hidden cap, not announced | Yes, 60 days | Shazz, #12 and #17 |
| Run length | 12-day minimum, then 8% | Shazz, #10 and #17 |
| Fallback on refusal | Repeat the previous move | Germ and Shazz |
| Sentence length | 10 days | Germ and Shazz |
| Nature's payoff effects | Section 3.5 table | Germ and Shazz |
| Extra actions from plan rev 1 (laws, taxes, curfews, raids, recruiting) | Left out of this version: they have no payoffs in the solved games | Germ and Shazz |
| Bribe range | 1 to 20 | Germ and Shazz |
