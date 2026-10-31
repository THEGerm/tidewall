-- 0007: diaries become each player's memory (Germ, 31 Oct). A player can
-- forget an old entry; it stays here for the analysis, marked with the day it
-- was forgotten, and is no longer shown to the player. The default pace drops
-- to 2 minutes between days (a day takes about a minute to play).

ALTER TABLE diaries ADD COLUMN forgotten_on INTEGER;
UPDATE meta SET value = '2' WHERE key = 'pace_minutes';
UPDATE meta SET value = '0007' WHERE key = 'schema';
