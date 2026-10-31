// Whose key pays for a call (rules plan: "Whose turn it is"). Game days
// rotate through the participants by turn order; on a day, the owner's key
// for the provider goes first, then the others' in turn order. Participants
// with no key for that provider are skipped.
//
// Fallback payback (#117): a fallback call puts the day's owner in debt to
// the payer. While someone owes the day's owner, the day's Anthropic calls go
// to the debtor's Anthropic key first, then to the owner's.

import { readKey, type Provider } from "../keys/store";

export interface KeyCandidate {
  email: string;
  name: string;
  key: string;
  owner: boolean; // true for the day's owner; false means a fallback key
  payback?: boolean; // paid by a debtor repaying the day's owner (#117)
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

export interface Debt { debtor: string; creditor: string; usd: number } // emails

// Who owes whom, from the ledger in call order. A fallback call on A's day
// paid by B adds its cost to A's debt to B (or cancels B's debt to A). A
// payback call by A on B's day reduces A's debt to B, never below zero:
// overshoot is forgiven, so a payback never creates a debt the other way.
export async function debts(db: D1Database, people?: { email: string }[]): Promise<Debt[]> {
  const ps = people ?? (await participants(db));
  if (ps.length < 2) return [];
  const { results } = await db
    .prepare(`SELECT day, payer_email, fallback_key, payback, cost_usd FROM ledger
              WHERE (fallback_key = 1 OR payback = 1) AND cost_usd > 0 AND payer_email IS NOT NULL ORDER BY at, rowid`)
    .all<{ day: number; payer_email: string; fallback_key: number; payback: number; cost_usd: number }>();
  const net = new Map<string, number>(); // "a|b" with a < b: positive means a owes b
  const add = (debtor: string, creditor: string, usd: number, clamp: boolean) => {
    const [a, b, sign] = debtor < creditor ? [debtor, creditor, 1] : [creditor, debtor, -1];
    const k = `${a}|${b}`, old = net.get(k) ?? 0;
    let v = old + sign * usd;
    if (clamp && Math.sign(v) !== Math.sign(old)) v = 0;
    net.set(k, v);
  };
  for (const r of results) {
    const owner = payingOrder(ps, r.day)[0].email;
    if (owner === r.payer_email) continue;
    if (r.payback) {
      const k = r.payer_email < owner ? `${r.payer_email}|${owner}` : `${owner}|${r.payer_email}`;
      const v = net.get(k) ?? 0;
      if ((r.payer_email < owner ? v : -v) > 0) add(r.payer_email, owner, -r.cost_usd, true);
    } else add(owner, r.payer_email, r.cost_usd, false);
  }
  const out: Debt[] = [];
  for (const [k, v] of net) {
    const [a, b] = k.split("|");
    if (Math.abs(v) >= 0.005) out.push(v > 0 ? { debtor: a, creditor: b, usd: v } : { debtor: b, creditor: a, usd: -v });
  }
  return out.sort((x, y) => y.usd - x.usd);
}

export async function keyChain(db: D1Database, secret: string, provider: Provider, day: number): Promise<KeyCandidate[]> {
  const people = await participants(db);
  const order = payingOrder(people, day);
  const out: KeyCandidate[] = [];
  if (provider === "anthropic" && order.length > 1) {
    const owes = (await debts(db, people)).filter((d) => d.creditor === order[0].email);
    for (const d of owes) {
      const p = order.find((x) => x.email === d.debtor);
      const key = p && (await readKey(db, secret, p.email, provider));
      if (p && key) { out.push({ email: p.email, name: p.name, key, owner: false, payback: true }); break; }
    }
  }
  for (const [i, p] of order.entries()) {
    if (out.some((k) => k.email === p.email)) continue;
    const key = await readKey(db, secret, p.email, provider);
    if (key) out.push({ email: p.email, name: p.name, key, owner: i === 0 });
  }
  return out;
}
