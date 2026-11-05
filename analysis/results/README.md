# Confirmatory results

Output of `python -m analysis.bayes`, run on 5 Nov 2026 on main at `7c54503`, with the pinned packages in `analysis/bayes/requirements.txt` (bambi 0.21.0, pymc 6.3.2, arviz 1.3.0): 4 chains, 2,000 draws after 2,000 tuning, seed 2026, 10,000 bootstrap resamples.

| File | Command | Status |
|---|---|---|
| `confirmatory-study.txt` | `python -m analysis.bayes data/runs/study/*.json` | Confirmatory: the study's Holm family of 11 |
| `confirmatory-study2.txt` | `python -m analysis.bayes data/runs/study2/*.json` | Exploratory (docs/preregistration-study2.md), outside the study's Holm family |
| `confirmatory-study2-nofb.txt` | the same with `--without-fallbacks` | Exploratory: rules 7 check, leaving out what Study 2's 75 fallbacks decided |

H5 is skipped (p = 1 in Holm) in all three until the judges' tone codes exist (#141); rerun with `--tones` then. In the study, H4 is skipped because every gang respected every day, so the model's `their_prev` term is constant; by H4's rule it holds.
