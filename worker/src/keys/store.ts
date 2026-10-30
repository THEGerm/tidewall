// Provider keys per participant. Reads return status only (saved, last 4
// characters, date); the plaintext never goes back to a browser.

import { decrypt, encrypt } from "./crypto";

export const PROVIDERS = ["anthropic", "google", "openai"] as const;
export type Provider = (typeof PROVIDERS)[number];

export const isProvider = (p: string): p is Provider => (PROVIDERS as readonly string[]).includes(p);

export async function keyStatus(db: D1Database, email: string) {
  const { results } = await db
    .prepare("SELECT provider, last4, updated_at FROM provider_keys WHERE email = ?")
    .bind(email)
    .all<{ provider: Provider; last4: string; updated_at: string }>();
  const status: Record<string, { saved: boolean; last4?: string; updated_at?: string }> = {};
  for (const p of PROVIDERS) status[p] = { saved: false };
  for (const r of results) status[r.provider] = { saved: true, last4: r.last4, updated_at: r.updated_at };
  return status;
}

export async function saveKey(db: D1Database, secret: string, email: string, provider: Provider, key: string) {
  const { ciphertext, iv } = await encrypt(secret, key);
  await db
    .prepare(
      `INSERT INTO provider_keys (email, provider, ciphertext, iv, last4, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT (email, provider) DO UPDATE SET
         ciphertext = excluded.ciphertext, iv = excluded.iv,
         last4 = excluded.last4, updated_at = excluded.updated_at`,
    )
    .bind(email, provider, ciphertext, iv, key.slice(-4), new Date().toISOString())
    .run();
}

export async function deleteKey(db: D1Database, email: string, provider: Provider) {
  await db.prepare("DELETE FROM provider_keys WHERE email = ? AND provider = ?").bind(email, provider).run();
}

// Only the Worker calls this, to use or check a key; nothing returns it to a browser.
export async function readKey(db: D1Database, secret: string, email: string, provider: Provider) {
  const row = await db
    .prepare("SELECT ciphertext, iv FROM provider_keys WHERE email = ? AND provider = ?")
    .bind(email, provider)
    .first<{ ciphertext: string; iv: string }>();
  return row ? decrypt(secret, row.ciphertext, row.iv) : null;
}
