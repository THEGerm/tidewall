-- Study 2 (Germ, 2 Nov): the same 27-run design on smaller models, kept apart
-- from the study by its own model_set, 'study2', and its own run IDs
-- (study2-t<n>-r<r>). Widens the model_set CHECK the way 0010 did: copy aside,
-- drop, add again, copy back.
ALTER TABLE runs ADD COLUMN run_set TEXT;
UPDATE runs SET run_set = model_set;
ALTER TABLE runs DROP COLUMN model_set;
ALTER TABLE runs ADD COLUMN model_set TEXT NOT NULL DEFAULT 'study' CHECK (model_set IN ('study', 'test', 'bot', 'study2'));
UPDATE runs SET model_set = run_set;
ALTER TABLE runs DROP COLUMN run_set;
UPDATE meta SET value = '0014' WHERE key = 'schema';
