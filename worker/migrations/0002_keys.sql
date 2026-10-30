-- 0002: participants and their encrypted provider keys.
-- Participant rows (emails) are entered straight into the database, never committed.
CREATE TABLE participants (
  email      TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  turn_order INTEGER NOT NULL UNIQUE
);

CREATE TABLE provider_keys (
  email      TEXT NOT NULL REFERENCES participants(email),
  provider   TEXT NOT NULL CHECK (provider IN ('anthropic', 'google', 'openai')),
  ciphertext TEXT NOT NULL,  -- AES-GCM, base64
  iv         TEXT NOT NULL,  -- base64, 12 bytes
  last4      TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (email, provider)
);

UPDATE meta SET value = '0002' WHERE key = 'schema';
