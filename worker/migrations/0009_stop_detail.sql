-- The provider's own stop reason (for example end_turn, SAFETY), next to the
-- normalised stop (#67).
ALTER TABLE ledger ADD COLUMN stop_detail TEXT;
UPDATE meta SET value = '0009' WHERE key = 'schema';
