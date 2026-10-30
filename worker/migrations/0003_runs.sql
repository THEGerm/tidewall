-- 0003: runs and everything a day produces (docs/rules.md draft 3).
-- One row per run, one per day, and one per logged item. JSON columns hold
-- shapes defined in worker/src/engine/types.ts.

CREATE TABLE runs (
  id            TEXT PRIMARY KEY,           -- e.g. "t1-r2" (triple 1, rotation 2)
  seed          TEXT NOT NULL,
  triple        INTEGER NOT NULL,
  rotation      INTEGER NOT NULL CHECK (rotation IN (1, 2, 3)),
  seating       TEXT NOT NULL,              -- {"Government": model, "Criminals": model, "World": model}
  rules_version TEXT NOT NULL,
  status        TEXT NOT NULL CHECK (status IN ('ready', 'running', 'paused', 'over', 'truncated')),
  state         TEXT NOT NULL,              -- GameState for the next day to play
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

CREATE TABLE days (
  run_id     TEXT NOT NULL REFERENCES runs(id),
  day        INTEGER NOT NULL,
  nature     TEXT NOT NULL,
  open       TEXT NOT NULL,
  moves      TEXT NOT NULL,
  delta      TEXT NOT NULL,
  welfare    REAL NOT NULL,
  ended      INTEGER NOT NULL,              -- 1 if the game ended after this day
  created_at TEXT NOT NULL,
  PRIMARY KEY (run_id, day)
);

CREATE TABLE events (
  run_id   TEXT NOT NULL,
  day      INTEGER NOT NULL,
  id       TEXT NOT NULL,
  kind     TEXT NOT NULL,
  public   INTEGER NOT NULL,
  district TEXT,
  actor    TEXT,
  detail   TEXT,
  PRIMARY KEY (run_id, id)
);
CREATE INDEX events_day ON events (run_id, day);

-- Where each answer came from: the player, its retry, or a fallback.
CREATE TABLE answers (
  run_id TEXT NOT NULL,
  day    INTEGER NOT NULL,
  player TEXT NOT NULL,
  step   TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('player', 'retry', 'fallback')),
  reason TEXT,
  errors TEXT,
  PRIMARY KEY (run_id, day, player, step)
);

CREATE TABLE messages (
  run_id      TEXT NOT NULL,
  day         INTEGER NOT NULL,
  seq         INTEGER NOT NULL,
  from_player TEXT NOT NULL,
  to_player   TEXT NOT NULL,
  text        TEXT NOT NULL,
  PRIMARY KEY (run_id, day, seq)
);

CREATE TABLE forecasts (
  run_id    TEXT NOT NULL,
  day       INTEGER NOT NULL,
  player    TEXT NOT NULL,
  forecasts TEXT NOT NULL,
  PRIMARY KEY (run_id, day, player)
);

CREATE TABLE diaries (
  run_id TEXT NOT NULL,
  day    INTEGER NOT NULL,
  player TEXT NOT NULL,
  text   TEXT NOT NULL,
  PRIMARY KEY (run_id, day, player)
);

CREATE TABLE wire (
  run_id   TEXT NOT NULL,
  day      INTEGER NOT NULL,
  seq      INTEGER NOT NULL,
  headline TEXT NOT NULL,
  text     TEXT NOT NULL,
  events   TEXT NOT NULL,
  PRIMARY KEY (run_id, day, seq)
);

-- Confidant texts (rules section 3.6): private, for analysis only.
CREATE TABLE confidant (
  run_id TEXT NOT NULL,
  day    INTEGER NOT NULL,
  player TEXT NOT NULL,
  window TEXT NOT NULL CHECK (window IN ('before', 'after')),
  text   TEXT,
  reply  TEXT NOT NULL,
  PRIMARY KEY (run_id, day, player, window)
);

UPDATE meta SET value = '0003' WHERE key = 'schema';
