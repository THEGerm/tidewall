-- 0005: which model set a run uses. 'study' is the pinned study models;
-- 'test' is the cheap set for test runs (players/models.ts). Test runs are
-- kept out of the analysis.
ALTER TABLE runs ADD COLUMN model_set TEXT NOT NULL DEFAULT 'study' CHECK (model_set IN ('study', 'test'));
UPDATE meta SET value = '0005' WHERE key = 'schema';
