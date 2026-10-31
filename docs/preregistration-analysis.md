# Pre-registration: the analysis

DRAFT, 31 Oct 2026, by Vishnu (Shazz's agent), for #38. Germ's agent (JARVIS) owns plan rev 4 and the pre-registration, and folds this in or cuts it. This page covers the analysis only. Seeds, the run script, the confidant and the judges are in plan rev 4.

It follows Shazz's decisions of 31 Oct (`decisions/shazz.md` in the bus), design review 2 (#17), the metrics review (#13) and the analysis choices confirmed in #66. Items marked **PROPOSED** are this draft's own choices and need Germ and Shazz.

## 1. Design, as decided

- **27 study runs:** 9 Latin-square triples, each playing rotations 1, 2 and 3 on one pre-registered seed. Every model holds every seat 9 times.
- **Run length:** at least 12 days, then an 8% end chance after each day, and a 60-day cap that players are never told about. The expected length is 23.3 days and the median 20 (solver, PR 103).
- **Players:** the Chief's score counts crime damage (#12). Both gangs in a run are one model. The confidant stays as built.
- **Budget:** one cap of USD 150 for the whole study.
- **Unit of analysis:** the run, or the seat in a run. Days and district-days within a run aren't independent.

## 2. Hypotheses and tests

Log-odds slopes and intercepts have Normal(0, 2.5) priors, and random-effect SDs HalfNormal(1). The code is in `analysis/bayes` (PR 104), `analysis/metrics` and `analysis/stats`.

| | Hypothesis | Variable and unit | Test | Confirmed when |
|---|---|---|---|---|
| H1 | Gangs cooperate more than the one-day game predicts | Share of gang-days with Respect, per run | Run-level mean; 95% bootstrap interval, resampling whole triples within rotation | The interval's lower bound is above 0.50 (one-sided) |
| H2a | Police over-inspect | Inspection per inspectable open district-day (bribed districts left out, #66) | `inspected ~ 0 + family + (1\|run)` | For a Government family, the 95% credible interval of its log-odds lies above logit(1/4); one test per family |
| H2b | The inspection pattern is predictable | Out-of-sample log-loss gain of a lagged logistic model over the smoothed rate so far, per district-day (`predictability.history_gain`) | Rolling origin per run; pooled mean gain over runs, with a standard error from run-level gains | One-sided p below 0.05 for a gain above 0 |
| H3 | The Chief never accepts unless b > 100a + 11; we measure departures (Shazz, 31 Oct) | Answers per offered district-day; a departure is accepting at delta <= 0 or refusing at delta > 0, where delta = b - 100 a_hat - 11 and a_hat is smoothed toward 0.10 with 10 pseudo district-days (#66) | `departs ~ 0 + family + (1\|run)`; shortfall (100 a_hat + 11 - b) described per family | **Measured, not tested:** each family's rate with its 95% interval. The secondary test is `accepted ~ delta + family + (delta\|run)`, with the delta slope above 0 |
| H4 | No end-game drop in cooperation | Respect per gang-day from day 2 | `respect ~ day + after_min + their_prev + own_prev + family + (day\|run)`, where after_min marks day 12 on (#17) | A drop counts when the 95% interval of the day slope lies below 0. H4 holds when it doesn't |
| H5 | The World's tone toward a seat depends on which family holds it (#11) | Tone -1, 0 or 1 per Wire item and judge, toward Government or Criminals | `tone ~ seat + world_family * holder_family + (1\|run) + (1\|item) + (1\|judge)`, cumulative logit | Any world × holder interaction whose 95% interval excludes 0. Within H5, p = the smallest two-sided p × the number of interaction terms, capped at 1 (**PROPOSED**) |
| H6 | Model explains more than seat (belief accuracy, best-response sharpness) | Brier skill per seat-run, all 3 seats; logit-choice lambda per seat-run, Government and Criminals only (#17) | Two-way ANOVA on seat-runs (model, seat), omega-squared for each; 95% bootstrap interval of omega²(model) - omega²(seat), resampling whole triples | The interval excludes 0. Its sign says which explains more |

**Decision rule.** A Bayesian effect counts when its 95% equal-tailed credible interval lies past the threshold. p_d, the posterior probability of the predicted sign, is reported with it.

**Multiple comparisons.**
- The confirmatory tier is H1, H2a (per family), H2b, the H3 secondary test, H4, H5 and H6. Holm runs over p = 1 - p_d for the Bayesian tests, and over the stated p for the others. These are the tests the data can run (#66).
- The exploratory tier (welfare, turf strategy shares by SFEM, predictability by exploitation, Brier calibration, the audit-bribe link, the confidant and diary measures, refusals) gets Benjamini-Hochberg and is labelled exploratory.

**Model assumption stated (#17).** The Latin square aliases the model effect with seat × rotation. We assume no seat × rotation interaction.

## 3. Sampler and checks

- 4 chains, 2,000 draws after 2,000 tuning, `target_accept` 0.95, seed 2026 (`analysis/bayes/models.py`).
- A fit passes when every r-hat is at most 1.01 and there are no divergences. A fit that fails is rerun with 4,000 tuning draws. If it still fails, it's reported as unreliable and its test is dropped from Holm (**PROPOSED**).
- Bootstraps use 10,000 resamples, seed 2026.

## 4. Data handling

- **Fallbacks and refusals** (rules 7, decided 31 Oct): a refused or broken answer gets the set default move and is logged with its reason. Every test is run twice, as planned with fallback rows and again without them. Both results are reported, and the primary one is the planned run.
- **Days lost to an infrastructure error** are replayed, not saved (#65). A run that can't finish is reported, and its triple is flagged.
- **Model versions:** the model each provider reports is logged on every call. A run where the reported model changes mid-run is flagged and kept.
- **Forecast scoring:** events a player's own move can decide are left out (#66).
- **If the USD 150 cap stops the study early:** complete triples are the confirmatory data, and runs from an incomplete triple are exploratory (**PROPOSED**).

## 5. Deviations

The analysis code is frozen at the commit that tags this pre-registration, before the first study run. Any later change goes in `docs/decisions/` with its date and reason, and any result that depends on the change is reported as exploratory.

## 6. What the code still lacks

- **H1:** the triple-stratified bootstrap. It's standard library and small. Vishnu can add it to `analysis/stats` if wanted.
- **H6:** omega-squared and the triple bootstrap. Lambda is in `metrics.choice.fit_lambda`, and Brier skill is in `analysis/stats`.
- **H5:** the judge coding (#13, #112).
