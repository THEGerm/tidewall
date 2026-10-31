# Solver

Solves the 4 games in [the rules](../../docs/rules.md) (draft 3) from their payoff numbers, checks every number the rules quote, and writes [`equilibria.json`](equilibria.json) for the engine tests to read. Python 3 standard library only. Arithmetic is exact (fractions), so 4/15 is 4/15.

## Run it

From the repo root:

```bash
python3 -m analysis.solver           # print the report, rewrite equilibria.json
python3 -m analysis.solver --check   # fail if equilibria.json is out of date
python3 -m unittest discover -s analysis -t .   # all analysis tests
```

Both commands exit 1 if any number the rules quote doesn't come out of the solver. The checks sit under `plan_checks` in the JSON; the key keeps its old name.

## Files

| File | Holds |
|---|---|
| `params.py` | Every number, citing the rules section it comes from. DECIDED (31 Oct) and PROPOSED values are marked, and the open questions live here |
| `bimatrix.py` | Exact Nash equilibria of small two-player games, by support enumeration |
| `games.py` | The 4 games, prison, Nature, the run length and the week-0 noise bands. It takes `trials_needed` from `analysis/metrics/week0.py` |
| `stats.py` | Exact binomial bands and tails |
| `equilibria.json` | The output. Each fraction is `{"exact": "4/15", "value": 0.266667}` |

## What it finds

The Chief counts crime damage as a performance mark (rules 3.1, decided 31 Oct, #12). `CHIEF_COUNTS_DAMAGE` in `params.py` switches it, with the engine's default (on).

| Game | Result | Rules say |
|---|---|---|
| Inspection, one open district | crime 4/15, inspect 1/4; inspection pays when 15q > 4 | 4/15, 1/4: matches |
| Inspection, Chief's money only (#12 off) | crime always, never inspect | "without it the Chief never inspects": matches |
| Inspection, average day (Port closed 10% of days, 5.9 open districts) | 1.57 crimes, 1.48 inspections, 0.39 arrests, damage 17.7 | |
| Arrest cap of 5 | binds with probability (1/15)^6, about 1 in 11 million | |
| Prison (sentence 10, 40 places) | expected occupancy 3.9 (59/15); full with probability under 1e-32 | nothing binds |
| Turf war, one day | both encroach | matches |
| Turf war, repeated | continuation 0.92 from day 12 (certain before). Grim trigger holds above 1/2; tit-for-tat is a Nash equilibrium above 2/3, never subgame perfect here | above 0.9: matches |
| Bribery, #12 off | Chief takes b when b > 100a; corruption pays below a = 1/10; at b = 10, Council audits 1/10, Chief takes 8% | matches |
| Bribery, #12 on (default) | Chief takes b only when b > 100a + 11; a gang gains at most 10; **no deal for any a** | **differs**: see open question 1 |
| Audit game | Council indifferent when 8% of audited district-days carry a taken bribe (8 / 100); 2 audits reach a = 1/3 (2/5 when the Port is closed) | 8%, 1/3: matches |
| Information | the World has no payoff, so every reporting rule is an equilibrium for it | matches |
| Nature, per run | 2.33 storms, 1.16 fires (-11.6 per gang), 0.70 strikes (-21.0 treasury), 3.49 ships (+52.4 Families) | no equilibrium changes: matches |
| Run length | 23.5 days without the cap, 23.29 with it; median 20; day 60 reached 1.83% | 0.92^48, about 1.8%: matches |

The run-length rule: no end draw after days 1 to 11; after each day from day 12 on, the game ends with probability 0.08; day 60 always ends it. So P(L >= n) = 0.92^(n - 12) from day 12, and P(reach day 60) = 0.92^48 exactly, as the rules say. The cap costs 0.21 days on average. Players aren't told the cap, so it creates no backward induction. `end_rule.alternative_plan_rev3` keeps the old rule (2% a day, 150-day cap told to players): 47.6 days, median 35, cap 4.9%.

The bribery numbers: a district with a taken bribe can't be inspected, and the gang knows before it moves, so crime there is sure. With the mark on, that costs the Chief 15. Refusing leaves the district at the inspection equilibrium, worth -4 to the Chief. So the Chief needs b - 100a - 15 > -4. The `bribery` keys keep the rules' case (mark off); `bribery.with_performance_mark` holds the default case.

The Council's 8% assumes an offer in every open district-day. Otherwise it is 8% of all open district-days, not of offered ones: the Council can't see offers.

Week 0 ("measured rates match the solver within noise"): one run of 23.3 days has 137 open district-days. At 95%, the crime rate should land in 19.7% to 34.3%, the inspection rate in 18.2% to 32.1%, and the per-district audit rate in 5.1% to 15.3%. To show equivalence within 0.02 at 80% power (`analysis/metrics/week0.py`), the bots need 710 days for crime, 681 for inspection and 327 for audits. The audit target is the rules' 1/10 line; with the mark on, the equilibrium has no bribes and no audits. The turf bots play pure strategies, so their cooperation has no noise.

## Open questions

Things the rules leave open, or that don't add up. These are for Germ and Shazz; the solver doesn't change the rules. Draft 3 answered the old questions on audits, bribe terms, turf and prison.

1. Bribery with the Chief's performance mark (#12, and H3). With the mark on, an accepted bribe means sure crime in that district (the gang knows the answer before moving, and the district can't be inspected), so the Chief's score loses 15. Refusing leaves the district at the inspection equilibrium, where the Chief's expected payoff is -4. So the Chief accepts b only when b - 100a - 15 > -4, that is b > 100a + 11, not b > 100a as rules 3.3 says. A gang gains at most 10 from a sure skip. So no bribe that both sides want exists for any audit rate: with the mark on, there is no corruption in equilibrium, and the 'corruption pays below a = 0.10' line holds only with the mark off. But with the mark off, the Chief never inspects, so a gang gains nothing from a bribe either. Options: keep the mark and say bribes are off-equilibrium (H3 then measures a departure from 'never take', not a threshold), or change the numbers so a deal window exists.
2. Week-0 turf bots. Which strategy do the scripted gangs play in the turf war: always encroach (the one-day equilibrium) or grim trigger (cooperation)? Both are equilibria at a continuation chance of 0.92, and the week-0 check needs one. The engine's test bots always respect.
Decided on 31 Oct (Shazz and Germ), with what follows from each:
- **The #12 mark is on.** Without it the Chief never inspects, so the 4/15 and 1/4 the engine compares against need it.
- **The cap stays hidden.** It ends 1.8% of runs and creates no backward induction. If players ever learned of it, always encroach would become the only subgame-perfect turf equilibrium.
- **Run length: at least 12 days, then 8%.** Runs last 23.3 days on average, with a median of 20. The week-0 bands for one run are wide (crime 19.7% to 34.3%), so an equivalence test within 0.02 at 80% power needs about 710 bot days, which run offline for free.
