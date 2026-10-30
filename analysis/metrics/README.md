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

## Methods from the 30 Oct review (issue #13)

| Item | Function | Notes |
|---|---|---|
| Log score, clipped forecasts, 10-bin calibration | `beliefs.log_score`, `beliefs.clip`, `beliefs.calibration` | Forecasts clipped to [0.01, 0.99]; beliefs aren't paid for, so extreme ones are cheap to state |
| Logit choice model instead of a tolerance band | `choice.fit_lambda` with `gang_delta`, `police_delta`, `chief_delta` | Maximum-likelihood lambda: 0 means moves ignore beliefs. Fit per model and seat. `best_response_rate` stays as a descriptive number |
| Strategy frequency estimation (Dal Bo and Frechette) | `turf.sfem` | Always respect, always encroach, grim trigger, tit-for-tat, plus a common tremble; EM |
| End-game regression with lagged moves | `turf.endgame_regression` | Logit of cooperation on day, their previous move, own previous move |
| Welfare | `welfare.day_welfare`, `welfare.run_welfare` | Bribes and taxes are transfers; the best feasible day is 12 |
| Within-seat collusion | `collusion.audit_bribe_link` | Audits against the Chief's bribes, same day and day after |
| Multiple comparisons | `multiple.benjamini_hochberg` | q-values across the study's measures |
| Week-0 equivalence test | `week0.binom_tost`, `week0.simulate_bots`, `week0.trials_needed` | Exact TOST. Showing the crime rate within +-0.02 takes about 4,200 district-days (about 700 bot days), so one 50-day run can't; simulate offline |
| Logistic regression | `glm.logit` | IRLS with standard errors; flags separation |

## Not here yet

- The run-level mixed model (run as cluster) and the hurdle model for refusals. Both need a library (statsmodels, or a Bayesian package such as PyMC or bambi), which Germ and Shazz should choose. Everything here stays standard-library.
- Diary against messages (planned lying): needs the judge-ensemble coding in #13.
- Predictability extras (Ljung-Box, Lempel-Ziv): #13 marks them optional.
- The hypothesis rewrite and the two-way model: Germ and Shazz agree the tests before week 1.

## Choices for Germ and Shazz

- Who labels the Wire's tone for the tilt measure: blind human coders or a judge model? A judge from one of the three study providers would bring its own family bias.
- `police_should_inspect` uses the police payoff that gives the 25% equilibrium, the one that counts crime damage. If the Chief's payoff changes (solver open question 1), this changes with it.
