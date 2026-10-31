-- 0006: the Control page's log, queued steps, and ledger rows written per call.
-- The scheduler now ticks every minute: a queued Step plays at the next tick,
-- and the schedule plays a day once pace_minutes have passed since the last.

CREATE TABLE log (
  id     INTEGER PRIMARY KEY AUTOINCREMENT,
  at     TEXT NOT NULL,
  run_id TEXT,
  level  TEXT NOT NULL CHECK (level IN ('info', 'warn', 'error')),
  text   TEXT NOT NULL
);

ALTER TABLE runs ADD COLUMN step_queued INTEGER NOT NULL DEFAULT 0;

-- 1 once the day the call belongs to was saved; 0 for a call made during a day
-- that failed (paid for, but its day was played again).
ALTER TABLE ledger ADD COLUMN day_saved INTEGER NOT NULL DEFAULT 1;

INSERT INTO meta (key, value) VALUES ('pace_minutes', '10');
UPDATE meta SET value = '0006' WHERE key = 'schema';
