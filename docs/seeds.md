# Study seeds (#38)

The 27 study runs are 9 triples. The 3 runs of a triple share one seed and play 3 rotations: 1 to 3 in odd triples, 4 to 6 in even triples. A seed fixes Nature, the end draw and every fallback draw. Control refuses a study run whose seed differs from its triple's (#110). The Create the 27 study runs button on Control derives these seeds in the Worker (`worker/src/engine/study.ts`), and a test checks them against the table below.

## How the seeds were made

- **Source:** drand, a public randomness beacon (mainnet, default chain). Round **6601923**, published 2026-10-31 23:18:30 UTC. Randomness `c3fb557f04a5bed65d293f38fe29b2cb4740fdfb4770a800bad400f398bcc6e8`. Check it at https://api.drand.sh/public/6601923.
- **Rule:** the seed of triple n is the first 16 hex digits of SHA-256 of `<randomness>:tidewall-triple-<n>`. `python3 scripts/seeds.py` prints them.
- **One draw only.** This is the only round drawn for the study. No game was played on these seeds before the study, so no seed was chosen for how its game turns out.
- **Matched bot baselines.** After a triple's 3 study runs have ended, 2 bot runs play its seed: `bot-t<n>-eq` (the equilibrium bots) and `bot-t<n>-enc` (the gangs encroaching). They replay the triple's weather, end day and random draws, and serve as exploratory baselines (pre-registration, data handling). No bot plays a seed before its triple has ended.

## The seeds

| Triple | Seed |
|---|---|
| 1 | 952536846060093f |
| 2 | 8b560aa51d67f665 |
| 3 | 49c993f7232365a2 |
| 4 | 83098f88d44a3041 |
| 5 | 60518830f8e698d0 |
| 6 | 15bb78fde84404ac |
| 7 | abd1ce5a2d3ac70f |
| 8 | 2d5bba29cda9e950 |
| 9 | 43057d6e7ce1d25a |
