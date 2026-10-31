-- Fallback payback (#117): a call paid by a participant who owes the day's
-- owner for earlier fallback calls. A payback call is not a fallback.
ALTER TABLE ledger ADD COLUMN payback INTEGER NOT NULL DEFAULT 0;
UPDATE meta SET value = '0011' WHERE key = 'schema';
