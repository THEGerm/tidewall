-- 0004: the token ledger (who paid for every call) and the scheduler's state.

CREATE TABLE ledger (
  run_id         TEXT NOT NULL,
  day            INTEGER NOT NULL,
  seq            INTEGER NOT NULL,
  player         TEXT NOT NULL,
  step           TEXT NOT NULL,
  provider       TEXT NOT NULL,
  model          TEXT NOT NULL,
  model_reported TEXT,
  payer_name     TEXT,              -- public run data (Germ, 30 Oct)
  payer_email    TEXT,              -- never leaves the signed-in API
  fallback_key   INTEGER NOT NULL,  -- 1 when someone other than the day's owner paid
  ok             INTEGER NOT NULL,
  stop           TEXT,
  input          INTEGER,
  cached_input   INTEGER,
  cache_write    INTEGER,
  output         INTEGER,
  reasoning      INTEGER,
  cost_usd       REAL,              -- null when the model's price isn't set
  error          TEXT,
  latency_ms     INTEGER,
  PRIMARY KEY (run_id, day, seq)
);

ALTER TABLE runs ADD COLUMN pause_reason TEXT;
ALTER TABLE runs ADD COLUMN lock_until TEXT;

INSERT INTO meta (key, value) VALUES ('schedule', 'off'), ('cap_usd', '880');
UPDATE meta SET value = '0004' WHERE key = 'schema';
