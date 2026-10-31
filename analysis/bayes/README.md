# Bayesian models

The confirmatory mixed models, in Bambi on PyMC (decided 31 Oct 2026). They need packages that the rest of `analysis/` avoids, so they stay outside the CI test job and run once, on a laptop.

```bash
pip install -r analysis/bayes/requirements.txt
python -m analysis.bayes data/runs/study/*.json             # pre-registered sampler: 4 chains, 2,000 draws
python -m analysis.bayes data/runs/test/*.json --quick      # a fast look at test runs
python -m unittest discover -s analysis/bayes/tests -t .    # 12 tests; the model tests skip without Bambi
```

## Models (from #17)

| Hypothesis | Rows (`frames.py`) | Formula (`models.py`) | Rule (`decide.py`) |
|---|---|---|---|
| H2a: police over-inspect | inspectable open district-days | `inspected ~ 0 + family + (1\|run)` | each Government family's log-odds above logit(1/4) |
| H3 (decided 31 Oct): how often and by how much the Chief departs from "never accept unless b > 100a + 11" | offered district-days | `departs ~ 0 + family + (1\|run)` | measured: each family's departure rate with its 95% interval; the size (shortfall) is descriptive, `frames.departures` |
| H3, secondary: answers follow the payoff | offered district-days | `accepted ~ delta + family + (delta\|run)`, delta = b - 100 a_hat - 11 | slope on delta above 0 |
| H4: no end-game drop | gang-days from day 2 | `respect ~ day + after_min + their_prev + own_prev + family + (day\|run)` | a drop counts when the day slope is below 0 |
| H5: tone depends on the holder's family | judge-coded Wire items | `tone ~ seat + world_family * holder_family + (1\|run) + (1\|item) + (1\|judge)`, cumulative logit | any world × holder interaction away from 0 |
| Refusals (exploratory) | player-days | `refusals ~ seat + family + day + (1\|run)`, hurdle Poisson | reported, not tested |

- **Priors.** Normal(0, 2.5) on every intercept and slope (log-odds), and HalfNormal(1) on every random-effect SD.
- **Decision rule.** An effect counts when its 95% equal-tailed credible interval lies past the threshold. p_d, the posterior probability of the predicted sign, is reported, and 1 - p_d goes into Holm across H1 to H6 (`analysis.metrics.multiple.holm`).
- **Fallbacks.** Every model can drop fallback rows with `--without-fallbacks` (rules 7, decided 31 Oct).

**Not here:**
- H1 (bootstrap by triples), H2b (predictability) and H6 (omega-squared and lambda). They aren't mixed models, and they stay in `analysis/metrics` and `analysis/stats`.
- The judge coding for H5 (#13). `frames.tones` checks its rows when it arrives.

## Points for the pre-registration (#38)

- **H3**, as Shazz worded it on 31 Oct: the Chief should never accept a bribe unless b > 100a + 11, and the study measures how often, and by how much, models depart from that. A departure is accepting at delta <= 0 or refusing at delta > 0. The rate is a measurement, so it stays out of Holm unless the pre-registration (#38) sets a threshold for it. The slope on delta is kept as a secondary test.
- **Sampler.** 4 chains, 2,000 draws after 2,000 tuning, `target_accept` 0.95, seed 2026. The convergence check is r-hat at most 1.01, plus no divergences.
