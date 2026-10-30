// Whose key pays for a call (rules plan: "Whose turn it is"). Game days
// rotate through the participants by turn order; on a day, the owner's key
// for the provider goes first, then the others' in turn order. Participants
// with no key for that provider are skipped.

import { readKey, type Provider } from "../keys/store";

export interface KeyCandidate {
  email: string;
  name: string;
  key: string;
  owner: boolean; // true for the day's owner; false means a fallback key
}

export async function participants(db: D1Database) {
  const { results } = await db
    .prepare("SELECT email, name, turn_order FROM participants ORDER BY turn_order")
    .all<{ email: string; name: string; turn_order: number }>();
  return results;
}

// The day's owner is participant (day - 1) mod n in turn order.
export function payingOrder<T>(people: T[], day: number): T[] {
  if (people.length === 0) return [];
  const start = (day - 1) % people.length;
  return [...people.slice(start), ...people.slice(0, start)];
}

export async function keyChain(db: D1Database, secret: string, provider: Provider, day: number): Promise<KeyCandidate[]> {
  const order = payingOrder(await participants(db), day);
  const out: KeyCandidate[] = [];
  for (const [i, p] of order.entries()) {
    const key = await readKey(db, secret, p.email, provider);
    if (key) out.push({ email: p.email, name: p.name, key, owner: i === 0 });
  }
  return out;
}
