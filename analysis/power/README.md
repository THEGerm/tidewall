# Power

How likely the study is to detect a real model effect, for the run designs in [issue #10](https://github.com/THEGerm/tidewall/issues/10). Standard library only.

```bash
python3 -m analysis.power.simulate        # 2,000 studies per cell, about 30 s
python3 -m unittest discover -s analysis/power/tests -t .
```

## Set-up

- **Design:** a replicated 3 x 3 Latin square, with runs as rows, seats as columns and models as treatments.
- **Data:** each seat makes a yes/no decision 6 times a day (for example one per district).
- **True log-odds** for run r, seat s and model m: model effect + seat effect + run-to-run noise with standard deviation tau.
- **Model effects:** (-spread, 0, +spread).
- **Analysis:** the empirical log-odds of each seat-run, then an ANOVA with run, seat and model. Power is the share of 1,000 simulated studies where the model F-test gives p < 0.05.

## Result (30 Oct 2026, 1,000 studies per cell)

| Design | no effect, any tau | spread 0.25, tau 0.3 | 0.25, 0.6 | 0.25, 1.0 | spread 0.5, tau 0.3 | 0.5, 0.6 | 0.5, 1.0 |
|---|---|---|---|---|---|---|---|
| 9 runs x 50 days | 0.05 | 0.75 | 0.25 | 0.11 | 1.00 | 0.80 | 0.36 |
| 27 runs x 20 days | 0.04 | 1.00 | 0.70 | 0.31 | 1.00 | 1.00 | 0.88 |

A spread of 0.25 is about ±6 percentage points around 50%, and 0.5 is about ±12.

**Reading it:** run-to-run noise (tau), not the number of decisions, sets the power. Longer runs barely help once a seat-run has a few hundred decisions; more runs do. With 27 short runs, an effect of ±12 points is found in at least 88% of studies at every tau tried. With 9 long runs, it drops to 36% if runs vary a lot (tau 1.0). Smaller effects (±6 points) need 27 runs and modest run-to-run noise.

**Limits:** tau is unknown until week 1 gives real data. Run length is held at the expected value, not drawn at random. The analysis is a fixed-effects ANOVA on seat-run log-odds, not the planned mixed model; that is a simplification, though both rest on the same between-run variance.
