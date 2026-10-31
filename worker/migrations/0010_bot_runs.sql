-- Bot runs (Germ, 31 Oct): model_set may be 'bot', a run played by the
-- equilibrium bots, free and at its own speed (runner.ts playBots). SQLite
-- can't change a column's CHECK in place, so the column is copied aside,
-- dropped and added again, without rebuilding the table other tables point to.
ALTER TABLE runs ADD COLUMN run_set TEXT;
UPDATE runs SET run_set = model_set;
ALTER TABLE runs DROP COLUMN model_set;
ALTER TABLE runs ADD COLUMN model_set TEXT NOT NULL DEFAULT 'study' CHECK (model_set IN ('study', 'test', 'bot'));
UPDATE runs SET model_set = run_set;
ALTER TABLE runs DROP COLUMN run_set;
UPDATE meta SET value = '0010' WHERE key = 'schema';
