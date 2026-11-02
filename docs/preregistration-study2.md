# Pre-registration addendum: Study 2, the lightweight models

2 Nov 2026. Germ and Shazz.

Study 2 replays the study with each provider's lightweight model in place of its flagship. Claude Haiku 5.5, Gemini 3.1 Flash-Lite and GPT-6 Luna are their makers' lightweight tiers, built for speed and low cost; the study played the flagships, Claude Opus 5.5, Gemini 4 Argon and GPT-6.1 Sol. "Study 2" is the project's internal name; the paper speaks of lightweight and flagship models. Everything in it is exploratory. H1 to H6, the Holm family of 11 entries and every decision rule in [preregistration-analysis.md](preregistration-analysis.md) stay as frozen.

## What we knew when we wrote this

We wrote this addendum while the main study was running, after 9 of 27 study runs had finished. In those 9 runs every gang respected turf on every day, and crime ran at 0 to 3%. Those early results prompted Study 2. That is why Study 2 is exploratory: its questions were chosen after seeing study data.

No Study 2 run has played.

## Design

Study 2 copies the study's design and changes the 3 models.

| Study model | Study 2 model | Model ID |
|---|---|---|
| Claude Opus 5.5 | Claude Haiku 5.5 | `claude-haiku-5-5` |
| Gemini 4 Argon | Gemini 3.1 Flash-Lite | `gemini-3.1-flash-lite` |
| GPT-6.1 Sol | GPT-6 Luna | `gpt-6-luna` |

Each model takes the study's reasoning effort, medium, where it accepts one.

Everything else is the study's:
- the engine and the rules (draft 4);
- the prompts;
- the 9 triple seeds from drand round 6601923 ([seeds.md](seeds.md));
- the two Latin squares and their seatings: odd triples play rotations 1 to 3, even triples rotations 4 to 6;
- the pace and the run length rule.

**Runs.** 27 runs, `study2-t1-r1` to `study2-t9-r3`, with model_set `study2`. They are created only after every study run has finished. They export to `data/runs/study2/`. Study 2 data is never pooled with the study's.

**No bot runs.** The study's matched baselines, `bot-t<n>-eq` and `bot-t<n>-enc`, play the same seeds. They serve both studies.

**Twins.** A seed fixes Nature, the end day and every random draw. So each Study 2 run has a twin in the study that plays identical days: same triple, same rotation, same seats.

## Questions

**Main question.** Within each family, does the gap from theory change with capability?

**Recall against reasoning.** Lightweight models probably know less textbook game theory. Before the first Study 2 run, the study's recognition check (both questions, every seat's prompt) runs on the 3 lightweight models and is coded and reported as for the study, so this is measured, not assumed. If they also respect turf and avoid crime, the restraint needs no sophistication. If they play nearer the equilibrium, the flagships' restraint is learned.

**The confidant.** In the study, Gemini and GPT mostly stayed silent with Sam. Study 2 reports texts to Sam by model.

## Analysis

**Same measures, same tests.** Study 2 reports every measure in the study's pre-registration and runs H1 to H6 on its own 27 runs, with the same code, priors, sampler, fit ladder and bootstraps. Every result is labelled exploratory. None enters the study's Holm family.

**Paired comparison, pre-specified.** For each of 7 measures, take the per-run difference, Study 2 minus study, between twins:
1. crime rate;
2. inspection rate;
3. audit rate;
4. turf respect share;
5. Brier skill;
6. logit lambda;
7. accepted-bribe count.

Each difference is summarised by family and by seat, with a bootstrap interval: 10,000 resamples, seed 2026, as in the study. Benjamini-Hochberg runs across the 7 measures.

## Comparing the two studies

**The benchmark.** Every model is ranked on one benchmark: Brier skill, the forecast measure H6 already uses. It says how much better a model's forecasts are than the base rate: 0 is the base rate, and higher is better. A model is scored only on events its own moves don't decide. It is the one measure every model has in every seat, since all 3 seats give the same 16 forecasts a day. It is a proper scoring rule, so a model can't raise it by shading its forecasts.

**How a model is tested.** A model's score in a study is its mean Brier skill over its 27 seat-runs: 9 in each seat. The Latin squares give every model the same seats the same number of times, so no model is helped by the seat it held. The 95% interval resamples whole triples (10,000 resamples, seed 2026), as the study's run-level tests do.

**How the models are ranked.** Within each study, the 3 models are ranked by score. With 3 models and 9 triples, a rank can be fragile, so the table also gives each model's share of resamples in which it ranks first.

**How the studies are compared.** For each family, the change is the Study 2 score minus the study score. The two studies share their seeds, so each resample draws the same triples from both, and the comparison is paired.

**The figure.** A slope chart of the one relationship tested: the change from each provider's lightweight model (left column) to its flagship (right column). Brier skill on one axis, one line per provider, with each point's 95% interval. A line that crosses another is a change of rank. The only labels are the short model names at the line ends; the caption gives the full names, and the table the values and ranks. The figure says lightweight and flagship, never Study 2. The code is `analysis/compare_studies.py`, written and tested on made-up data before any Study 2 run. It runs with:

```
python -m analysis.compare_studies data/runs/study/*.json data/runs/study2/*.json --figure paper/figures/study-comparison.svg --table paper/figures/study-comparison.md
```

The figure and its table go in the paper as they come out. Every other measure in this addendum is reported in tables, not ranked.

## Validity

The study's rules apply unchanged:
- a refused or broken answer gets one retry, then the rules' fallback move (rules section 7; for turf, yesterday's move);
- days lost to an infrastructure error are replayed;
- a seat-run where fewer than 50% of the lambda decisions are the player's own leaves the lambda test;
- every test also runs without fallback days.

Lightweight models may break format more often. Study 2 reports the fallback rate and the refusal rate by model.

**Judges.** If the judges run on the study, they run on Study 2 after its last run ends, under the same frozen protocol (preregistration-analysis.md, section 6).

## Cost

Test runs on these models cost about US$0.02 to 0.025 a game day. The study models cost about US$0.19. Study 2 plays the study's days, so we expect it to cost roughly a tenth of the study. That figure is an estimate. A spending cap is set before the first Study 2 run.

## Freeze

This addendum is committed to main before the first Study 2 run. That commit is the Study 2 freeze. Any later change goes in `docs/decisions/`, with its date and reason.
