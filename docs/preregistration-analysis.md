# Pre-registration: the analysis

For #38. Written by Vishnu (Shazz's agent) at JARVIS's request of 31 Oct. Plan rev 4 (`docs/plan.md`) is Germ's side's and links here. The theory and the predictions are in [preregistration-theory.md](preregistration-theory.md).

Sources:
- Shazz's decisions of 31 Oct (`decisions/shazz.md` in the bus)
- design review 2 (#17)
- the metrics review (#13)
- the analysis choices confirmed in #66

Items marked **PROPOSED** are choices made in this file. Germ and Shazz confirm or change them before the freeze.

## 1. Design, as decided

- **27 study runs:** 9 Latin-square triples. Each triple plays rotations 1, 2 and 3 on one seed. Every model holds every seat 9 times.
- **Run length:**
  - at least 12 days, then an 8% chance of ending after each day;
  - a 60-day cap that players are never told;
  - expected length 23.3 days, median 20 (solver, `analysis/solver/equilibria.json`, `end_rule`).
- **Players:**
  - the Chief's score counts crime damage (#12);
  - both gangs in a run are one model;
  - the confidant stays as built.
- **Budget:** one cap of USD 150 for the whole study.
- **Unit of analysis:** the run, or the seat in a run. Days and district-days within a run are not independent.

## 2. Hypotheses, tests and the code that computes them

Bayesian models have these priors:
- Normal(0, 2.5) on every intercept and slope, on the log-odds scale;
- HalfNormal(1) on every random-effect SD.

**H1. Gangs cooperate more than the one-day game predicts.**
- Variable: the share of gang-days with Respect, one number per run.
- Test: the mean over runs, with a bootstrap that resamples whole triples.
- Confirmed when: the one-sided 95% lower bound (5th percentile) is above 0.50.
- Code: `analysis.bayes.run_level.respect_shares`, then `run_level.h1`.

**H2a. Police over-inspect.**
- Variable: inspection per inspectable open district-day. Districts with an accepted bribe are left out (#66).
- Test: `inspected ~ 0 + family + (1|run)`, one test per Government family.
- Confirmed when: the 95% credible interval of the family's log-odds lies above logit(1/4).
- Code: `analysis.bayes.models.h2a_inspection`, then `decide.h2a`.

**H2b. The inspection pattern is predictable.**
- Variable: the out-of-sample log-loss gain per district-day, comparing a lagged logistic model with the smoothed rate so far. One number per run (#17).
- Test: the mean of the run-level gains, with a t interval across runs.
- Confirmed when: the one-sided p for a gain above 0 is below 0.05.
- Code: `analysis.bayes.run_level.history_gains` (it calls `analysis.metrics.predictability.history_gain`), then `run_level.h2b`.

**H3. The Chief never accepts a bribe unless b > 100a + 11. We measure how often, and by how much, models depart from that (Shazz, 31 Oct).**
- Variable: one answer per offered district-day.
  - delta = b - 100 a_hat - 11.
  - a_hat is the Council's audit rate so far, smoothed toward 0.10 with 10 pseudo district-days (#66).
  - A departure is accepting at delta <= 0, or refusing at delta > 0.
- Test, how often: `departs ~ 0 + family + (1|run)`, which gives each family's departure rate with its 95% interval.
- Test, by how much: the shortfall (100 a_hat + 11 - b) for each bribe accepted below the rule, its median and largest, per family.
- Secondary test: `accepted ~ delta + family + (delta|run)`.
- Confirmed when:
  - the departure rate and shortfall are a measurement, not a test, so they stay out of Holm;
  - the secondary test counts when the 95% interval of the slope on delta lies above 0.
- Code: `models.h3_departures`, then `decide.h3_departures`; `frames.departures`; `models.h3_bribes`, then `decide.h3`.

**H4. No end-game drop in cooperation.**
- Variable: Respect per gang-day, from day 2.
- Test: `respect ~ day + after_min + their_prev + own_prev + family + (day|run)`. after_min marks day 12 onward (#17).
- Confirmed when: H4 holds unless the 95% interval of the day slope lies below 0. A drop is reported as H4 rejected.
- Code: `models.h4_turf`, then `decide.h4`.

**H5. The World's tone toward a seat depends on which family holds it (#11).**
- Variable: tone -1, 0 or 1 toward Government or Criminals, one per Wire item per judge.
- Test: `tone ~ seat + world_family * holder_family + (1|run) + (1|item) + (1|judge)`, cumulative logit.
- Confirmed when: any world × holder interaction's 95% interval excludes 0. The H5 p is the smallest two-sided p × the number of interaction terms, capped at 1 (**PROPOSED**).
- Code: `models.h5_tone`, then `decide.h5`.
- **Status:** it can't run while the judges are skipped (JARVIS, 31 Oct, #112). If the judges don't come back before the freeze, H5 is dropped from the confirmatory tier and Holm covers the rest.

**H6. Model explains more than seat, for belief accuracy and best-response sharpness.**
- Variable, one number per seat-run:
  - Brier skill, all 3 seats;
  - the logit-choice lambda, Government and Criminals only (#17).
- Test: an additive two-way ANOVA (model, seat) gives omega-squared for each. The difference omega²(model) - omega²(seat) gets a 95% interval from a bootstrap that resamples whole triples. It runs once for Brier skill and once for lambda.
- Confirmed when: the interval excludes 0. Its sign says which explains more.
- Code: `run_level.brier_skill_rows` and `run_level.lambda_rows`, then `run_level.h6`.

**Decision rule for the Bayesian tests.** An effect counts when its 95% equal-tailed credible interval lies past the threshold. p_d, the posterior probability of the predicted sign, is reported with it.

**Multiple comparisons.**
- **Confirmatory tier:** H1, H2a (one test per family), H2b, the H3 secondary test, H4, H5 (if it runs) and H6 (two tests).
  - Holm runs over p = 1 - p_d for the Bayesian tests, and over the stated p for the others (`analysis.bayes.decide.confirm`, `analysis.metrics.multiple.holm`).
  - These are the tests the data can run (#66).
- **Exploratory tier:** welfare, turf strategy shares (SFEM), the exploitation test, calibration, the audit and bribe link, the confidant and diary measures, and refusals.
  - It gets Benjamini-Hochberg (`analysis.metrics.multiple.benjamini_hochberg`) and is labelled exploratory.

**Assumption stated (#17).** The Latin square aliases the model effect with seat × rotation. We assume there is no seat × rotation interaction.

## 3. Sampler and checks

- **Sampler:** 4 chains, 2,000 draws after 2,000 tuning, `target_accept` 0.95, seed 2026 (`analysis.bayes.models.fit`).
- **Packages:** pinned in `analysis/bayes/requirements.txt` (bambi 0.21.0, pymc 6.3.2, arviz 1.3.0).
- **A fit passes** when every r-hat is at most 1.01 and there are no divergences.
  - A fit that fails is rerun with 4,000 tuning draws.
  - If it still fails, it is reported as unreliable and its test leaves Holm (**PROPOSED**).
- **Bootstraps:** 10,000 resamples, seed 2026 (`run_level.RESAMPLES`, `run_level.SEED`).

## 4. Data handling

- **Fallbacks and refusals** (rules 7, decided 31 Oct). A refused or broken answer gets the set default move and is logged with its reason. Every test runs twice: once as planned, with fallback rows, and once without them (`--without-fallbacks`). Both results are reported; the planned run is the primary one.
- **Days lost to an infrastructure error** are replayed, not saved (#65). A run that can't finish is reported, and its triple is flagged.
- **Model versions.** The model each provider reports is logged on every call. A run where it changes mid-run is flagged and kept.
- **Forecast scoring.** Events a player's own move can decide are left out (#66).
- **If the USD 150 cap stops the study early,** complete triples are the confirmatory data. Runs from an incomplete triple are exploratory (**PROPOSED**).

## 5. Deviations

- The analysis code freezes at the commit that tags this pre-registration, before the first study run.
- Any later change goes in `docs/decisions/`, with its date and reason.
- Any result that depends on such a change is reported as exploratory.

## 6. Code status

Every hypothesis above has its function:
- H2a, H3, H4 and H5 are in `analysis/bayes/models.py` and `decide.py`.
- H1, H2b and H6 are in `analysis/bayes/run_level.py`, standard library, tested in CI.

H5 waits on judge coding (#112).
