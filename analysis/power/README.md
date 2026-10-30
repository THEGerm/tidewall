# Power

How likely is the study to detect a real difference between models, under the run design in plan rev 3 and under the proposal in [#10](https://github.com/THEGerm/tidewall/issues/10)? Standard library only.

```bash
python3 -m analysis.power --sims 2000              # the grid below, about 6 s
python3 -m unittest discover -s analysis/power/tests -t .
```

## The model

The measure is gang cooperation in the turf war. Both gangs in a run are one model, so the **run** is the independent unit.

- logit P(respect on a day) = base + model effect + run effect. Base cooperation is 60%. The run effect is Normal(0, run_sd), one draw per run.
- Each day ends the run with the daily end chance, up to the cap. Both gangs' days count.
- The test is a one-way ANOVA across the 3 models on the runs' cooperation rates, at alpha 0.05. Power is the share of 2,000 simulated studies with p < 0.05.

The effect sizes are assumptions, so the result is a grid. `spread` is the logit gap between the most and least cooperative model, with the third model in the middle:

| spread | Cooperation, least to most cooperative model |
|---|---|
| 0.5 | 54% to 66% |
| 1.0 | 48% to 71% |
| 1.5 | 41% to 76% |

## Results (seed 2026, 2,000 studies per cell)

| run_sd | spread | Rev 3: 9 runs, 2% end, cap 150 | #10: 27 runs, 5% end, cap 60 |
|---|---|---|---|
| 0.3 | 0 (no effect) | 0.04 | 0.04 |
| 0.3 | 0.5 | 0.14 | 0.28 |
| 0.3 | 1.0 | 0.44 | 0.78 |
| 0.3 | 1.5 | 0.75 | 0.97 |
| 0.6 | 0 (no effect) | 0.05 | 0.05 |
| 0.6 | 0.5 | 0.09 | 0.18 |
| 0.6 | 1.0 | 0.22 | 0.55 |
| 0.6 | 1.5 | 0.42 | 0.89 |

Read it as: with 9 runs, a 23-point gap between models (spread 1.0) is found 22% to 44% of the time. With 27 shorter runs it's found 55% to 78% of the time. The no-effect rows show the false-positive rate stays near 5%.

## What it leaves out

- **One measure, one test.** The study runs about 15 measures with Benjamini-Hochberg (#13), which lowers power for each one. Hypothesis 6 (model against seat) needs measures taken in every seat, plus a two-way model.
- **ANOVA on run rates, not the mixed model.** The ANOVA stands in for the run-level mixed model in #13. Runs of unequal length make it slightly conservative (4% false positives in some cells).
- **Variance guesses.** The run-to-run noise (run_sd) is a guess. Week 0 and the cheap test run give a first estimate, and the grid should be rerun then.
- **Cost.** Not modelled here. #10 puts the larger design at about 20% more game days.
