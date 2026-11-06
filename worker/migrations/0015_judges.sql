-- 0015: the offline judges' codes (#112; pre-registration, section 6). One row
-- per item, judge and template. A row is written after every attempt: code
-- holds the validated answer, or stays null with the error, and attempts
-- counts tries, so a rerun skips what is coded and gives up after a few
-- failures. New tables only: nothing the game reads changes.
CREATE TABLE judge_codes (
  run_id            TEXT NOT NULL,
  item              TEXT NOT NULL,              -- e.g. wire:3:1, sam:2:Chief:after, deception:4:Saltdogs
  task              TEXT NOT NULL CHECK (task IN ('tone', 'leak', 'deception')),
  judge             TEXT NOT NULL,              -- deepseek, qwen, glm
  template          TEXT NOT NULL CHECK (template IN ('main', 'alt')),
  model             TEXT NOT NULL,              -- the pinned OpenRouter ID
  upstream          TEXT NOT NULL,              -- the pinned provider
  model_reported    TEXT,
  provider_reported TEXT,
  code              TEXT,                       -- JSON, null until coded
  raw               TEXT,                       -- the judge's answer as given
  error             TEXT,
  attempts          INTEGER NOT NULL DEFAULT 0,
  prompt_sha        TEXT,                       -- sha-256 of the system prompt and the user message
  at                TEXT NOT NULL,
  PRIMARY KEY (run_id, item, judge, template)
);

-- Per run: how many jobs (item x judge x template) there are and how many are
-- settled (coded, or out of attempts), for which judges. A finished run never
-- changes, so a run settled for the current judges is skipped without
-- re-reading its export.
CREATE TABLE judge_runs (
  run_id     TEXT PRIMARY KEY,
  judges     TEXT NOT NULL,                     -- JSON: the pinned judges these counts are for
  items      INTEGER NOT NULL,
  jobs       INTEGER NOT NULL,
  coded      INTEGER NOT NULL,
  failed     INTEGER NOT NULL,
  updated_at TEXT NOT NULL
);

UPDATE meta SET value = '0015' WHERE key = 'schema';
