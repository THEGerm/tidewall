# Pre-registration addendum: Study 2, the cheap models

2 Nov 2026. Germ and Shazz.

Study 2 replays the study with each provider's cheap model in place of its study model. Everything in it is exploratory. H1 to H6, the Holm family of 11 entries and every decision rule in [preregistration-analysis.md](preregistration-analysis.md) stay as frozen.

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

**Recall against reasoning.** Smaller models probably know less textbook game theory. Before the first Study 2 run, the study's recognition check (both questions, every seat's prompt) runs on the 3 cheap models and is coded and reported as for the study, so this is measured, not assumed. If they also respect turf and avoid crime, the restraint needs no sophistication. If they play nearer the equilibrium, the frontier models' restraint is learned.

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

## Validity

The study's rules apply unchanged:
- a refused or broken answer gets one retry, then the rules' fallback move (rules section 7; for turf, yesterday's move);
- days lost to an infrastructure error are replayed;
- a seat-run where fewer than 50% of the lambda decisions are the player's own leaves the lambda test;
- every test also runs without fallback days.

Cheap models may break format more often. Study 2 reports the fallback rate and the refusal rate by model.

**Judges.** If the judges run on the study, they run on Study 2 after its last run ends, under the same frozen protocol (preregistration-analysis.md, section 6).

## Cost

Cheap test runs cost about US$0.02 to 0.025 a game day. The study models cost about US$0.19. Study 2 plays the study's days, so we expect it to cost roughly a tenth of the study. That figure is an estimate. A spending cap is set before the first Study 2 run.

## Freeze

This addendum is committed to main before the first Study 2 run. That commit is the Study 2 freeze. Any later change goes in `docs/decisions/`, with its date and reason.
