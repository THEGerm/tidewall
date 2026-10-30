# Metrics

The measures in the plan's [What we measure](../../docs/plan.md#what-we-measure) table, as plain Python functions (standard library only). They take simple per-day records, not the engine's log format, so they run on week-0 bot runs, real runs and test data alike. A thin loader for the exported logs comes once the log format is fixed.

## Run the tests

From the repo root:

```bash
python3 -m unittest discover -s analysis/metrics/tests -t .
```

## What's here

| Measure (plan) | Function | Notes |
|---|---|---|
| Crime and inspection rates against 27% and 25%; audit rate against 10% | `rates.against(k, n, target)` | Wilson 95% interval, gap, z-score, whether the target sits inside |
| Refusals by seat and model | `rates.by_group(records, key, flag)` | Any yes/no flag by any grouping |
| Brier score | `beliefs.brier`, `beliefs.brier_skill`, `beliefs.calibration` | Skill is against always forecasting the base rate |
| Best-response rate | `beliefs.best_response_rate` with `gang_should_commit`, `police_should_inspect`, `chief_should_accept` | A belief within `tol` of the indifference point counts either move as a best response |
| Predictability of inspections | `predictability.exploit(log)` | Replays the inspection log against simple learning gangs; mean payoff per district-day above 0 means the pattern can be exploited |
| Cooperation rate, strategy type | `turf.cooperation_rate`, `turf.classify` | Agreement with always respect, always encroach, tit-for-tat, grim trigger, tit-for-two-tats, win-stay lose-shift |
| Cooperation against game age | `turf.age_trend`, `turf.late_drop` | One-sided permutation test on the slope (seeded, so repeatable) |
| Coverage tilt by seat and by model family | `tilt.coverage`, `tilt.tone_by_holder` | Takes Wire items already labelled with a seat and a tone of -1, 0 or +1. The World's family never holds another seat in a run, so tilt is measured by which family holds the seat (issue #11) |

The equilibrium values (4/15, 1/4, 1/10) are in `equilibrium.py`. They're copied from the solver, and a test checks they still match `analysis/solver/equilibria.json` when that file is present.

## Not here yet

- Total payoff against the best possible total: this needs a welfare definition for the city.
- Diary against messages (planned lying): this needs a text-coding method.
- The two-way model (model, seat, cycle): the plan says Germ and Shazz agree the tests before week 1.

## Choices for Germ and Shazz

- Who labels the Wire's tone for the tilt measure: blind human coders or a judge model? A judge from one of the three study providers would bring its own family bias.
- `police_should_inspect` uses the police payoff that gives the 25% equilibrium, the one that counts crime damage. If the Chief's payoff changes (solver open question 1), this changes with it.
