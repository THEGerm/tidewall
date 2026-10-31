-- Better records from the first full test run (004-germ, 31 Oct).

-- A day hit by an infrastructure error (no working key, a provider refusing
-- the Worker's location) is not saved: it is played again at the next tick,
-- up to 3 attempts, then the run pauses. This counts the attempts.
ALTER TABLE runs ADD COLUMN day_attempts INTEGER NOT NULL DEFAULT 0;

-- When each call returned, and the provider's own request ID, for audits.
ALTER TABLE ledger ADD COLUMN at TEXT;
ALTER TABLE ledger ADD COLUMN request_id TEXT;

-- The raw text each model returned, and a hash of the exact prompt it was
-- given (system and step). Secret while the run is live: only the export of a
-- finished run includes it, never the public ledger.
CREATE TABLE responses (
  run_id     TEXT NOT NULL,
  day        INTEGER NOT NULL,
  seq        INTEGER NOT NULL,
  prompt_sha TEXT,
  text       TEXT,
  PRIMARY KEY (run_id, day, seq)
);

UPDATE meta SET value = '0008' WHERE key = 'schema';
