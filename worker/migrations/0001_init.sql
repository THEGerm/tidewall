-- 0001: a single key-value table, so /api/health can prove the database answers.
-- Players, keys and the token ledger arrive in later migrations.
CREATE TABLE meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
INSERT INTO meta (key, value) VALUES ('schema', '0001');
