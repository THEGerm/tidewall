# Data

Finished runs, one JSON file per run, saved here by the **Export finished runs** workflow (`.github/workflows/export-runs.yml`) within an hour of a run ending:

- `runs/study/<id>.json`: the 27 study runs
- `runs/test/<id>.json`: test runs on the cheap models, kept out of the analysis

Each file is the run's public export (`GET /api/runs/<id>/export`, finished runs only):

- the run: seating, seed, rules version, model set
- every day's Nature, open districts, moves, score changes and welfare
- every event, public and secret
- where each answer came from (the player, its retry, or a fallback, with the reason)
- messages, forecasts, diaries, the Wire, and the confidant texts
- the ledger: every model call with the model the provider reported, tokens, cost, latency and who paid

What is not here: the prompts as sent (they are rebuilt from the code at the run's commit and the views in the log), and anything personal. Payers appear by name only; keys and emails never leave the database. The workflow refuses to save a file that contains an email address.
