-- Two Latin squares (Germ, 1 Nov): odd triples play rotations 1 to 3, even
-- triples the mirror square, rotations 4 to 6, so the World x holder
-- interaction is no longer the seat effect. Widens the rotation CHECK the way
-- 0010 widened model_set: copy aside, drop, add again, copy back.
ALTER TABLE runs ADD COLUMN rotation_old INTEGER;
UPDATE runs SET rotation_old = rotation;
ALTER TABLE runs DROP COLUMN rotation;
ALTER TABLE runs ADD COLUMN rotation INTEGER NOT NULL DEFAULT 1 CHECK (rotation BETWEEN 1 AND 6);
UPDATE runs SET rotation = rotation_old;
ALTER TABLE runs DROP COLUMN rotation_old;
UPDATE meta SET value = '0013' WHERE key = 'schema';
