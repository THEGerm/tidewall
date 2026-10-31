# Analysis

Python, run on a laptop against exported logs. Standard library only; the choice of a modelling library (statsmodels or a Bayesian package) is Germ and Shazz's.

- `solver/`: solves the 4 games and prints the equilibria the engine is tested against. `python3 -m analysis.solver` from the repo root; see [solver/README.md](solver/README.md)
- `power/`: power of the model-against-seat test for different run designs (issue #10)
- `metrics/`: the plan's measures as plain functions; see [metrics/README.md](metrics/README.md)
- `data.py`: loads a run export (`/api/runs/:id/export`, a path or a dict) and flattens it into tidy tables: district-days, player-days, forecasts (with the scoring rule applied), turf moves, calls (the ledger) and answers. Days with a fallback stay in, flagged
- `stats/`: the measures per run and pooled by (family, seat): rates against the equilibrium with Wilson intervals, bribes, Brier score and skill per player, turf cooperation and strategy, welfare, fallbacks, refusals and cost. `stats.compare` compares families within a seat with the run as the cluster (a t interval over runs). It is provisional until the mixed model is chosen
- `outliers.py`: robust flags (median and MAD, modified z above 3.5) at run, day and call level, plus rule flags for patterns the test runs showed: JSON sent as a text to Sam, a deleted diary, a move that never changes, ledger errors (location, key, schema), abnormal stop reasons, engine welfare that disagrees with the formula
- `worksheets/`: writes everything above as CSVs for the paper, with a README data dictionary
- `notebooks/`: the paper's figures

## Run it

From the repo root:

```bash
python3 -m unittest discover -s analysis -t .
python3 -m analysis.worksheets data/runs/test/*.json --out analysis/worksheets/out
```

The worksheet folder is rebuilt from the exports and never committed (`analysis/worksheets/out/` is in `.gitignore`). Its README lists every file and column, its unit and the measure or hypothesis it serves.

## Choices made here, for Germ and Shazz to confirm

- **Scoring rule.** A forecast is left out when the player's own move can settle it: a gang's own crime districts and both-respect, the Chief's inspections, the Council's audits, and any-bribe-accepted for the Chief and both gangs (a gang that offers nothing settles it). rules.md names the first three only.
- **Denominators.** Crime per open district-day; inspection per open district-day without an accepted bribe (those can't be inspected); audit per open district-day, against the 10% line.
- **Brier skill** is against each event type's base rate in the run (rules 5, for H6). When a base rate sits near 0 or 1 the reference score is tiny and the skill swings far below 0.
- **H3's a_hat** is smoothed toward 0.10 with 10 pseudo district-days; rules.md doesn't give the weight.
- **Multiple comparisons.** The confirmatory tests the data can run today (H2 per Government family, H4 per gang per run) get Holm together; the family comparisons get Benjamini-Hochberg.
