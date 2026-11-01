-- 0012: OpenRouter as a fourth provider (for the offline judges). SQLite can't
-- change a CHECK constraint in place, so provider_keys is rebuilt: a new table
-- with the wider CHECK, every row copied across unchanged (still encrypted;
-- nothing is decrypted), the old table dropped and the new one renamed.
-- No other table references provider_keys, so the drop breaks no foreign key.
CREATE TABLE provider_keys_new (
  email      TEXT NOT NULL REFERENCES participants(email),
  provider   TEXT NOT NULL CHECK (provider IN ('anthropic', 'google', 'openai', 'openrouter')),
  ciphertext TEXT NOT NULL,  -- AES-GCM, base64
  iv         TEXT NOT NULL,  -- base64, 12 bytes
  last4      TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (email, provider)
);

INSERT INTO provider_keys_new (email, provider, ciphertext, iv, last4, updated_at)
  SELECT email, provider, ciphertext, iv, last4, updated_at FROM provider_keys;

DROP TABLE provider_keys;
ALTER TABLE provider_keys_new RENAME TO provider_keys;

UPDATE meta SET value = '0012' WHERE key = 'schema';
