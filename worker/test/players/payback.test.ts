// Fallback payback (#117): debts from fallback calls, repaid through the
// debtor's Anthropic key on the creditor's days.
import { describe, expect, it } from "vitest";
import { testD1 } from "../engine/d1";
import { saveKey } from "../../src/keys/store";
import { debts, keyChain } from "../../src/players/keys";

const SECRET = btoa(String.fromCharCode(...new Uint8Array(32).map((_, i) => i + 7)));
let at = 0;
const row = (db: D1Database, day: number, payer: string, cost: number, o: { fallback?: boolean; payback?: boolean; provider?: string } = {}) =>
  db.prepare(`INSERT INTO ledger (run_id, day, seq, player, step, provider, model, payer_email, fallback_key, payback, ok, cost_usd, day_saved, at)
              VALUES ('r', ?, ?, 'Chief', 'act', ?, 'm', ?, ?, ?, 1, ?, 1, ?)`)
    .bind(day, at, o.provider ?? "google", payer, o.fallback ? 1 : 0, o.payback ? 1 : 0, cost, `2026-10-31T00:00:${String(at++).padStart(2, "0")}Z`).run();

async function setup() {
  const db = testD1();
  await db.prepare("INSERT INTO participants (email, name, turn_order) VALUES ('g@x', 'Germ', 1), ('s@x', 'Shazz', 2)").run();
  for (const e of ["g@x", "s@x"]) await saveKey(db, SECRET, e, "anthropic", `test-key-anthropic-${e}-000000000000`);
  return db;
}

describe("fallback payback", () => {
  it("has no debts and the normal order with no fallbacks", async () => {
    const db = await setup();
    expect(await debts(db)).toEqual([]);
    const chain = await keyChain(db, SECRET, "anthropic", 1); // day 1 is Germ's
    expect(chain.map((k) => [k.email, k.owner, !!k.payback])).toEqual([["g@x", true, false], ["s@x", false, false]]);
  });

  it("puts the debtor's Anthropic key first on the creditor's day", async () => {
    const db = await setup();
    await row(db, 2, "g@x", 0.09, { fallback: true }); // day 2 is Shazz's, Germ covered
    expect(await debts(db)).toEqual([{ debtor: "s@x", creditor: "g@x", usd: 0.09 }]);
    const germDay = await keyChain(db, SECRET, "anthropic", 3);
    expect(germDay.map((k) => [k.email, k.owner, !!k.payback])).toEqual([["s@x", false, true], ["g@x", true, false]]);
    // Shazz's own days and other providers keep the normal order.
    expect((await keyChain(db, SECRET, "anthropic", 2))[0]).toMatchObject({ email: "s@x", owner: true });
    await saveKey(db, SECRET, "g@x", "google", "test-key-google-000000000000000000");
    expect((await keyChain(db, SECRET, "google", 3))[0]).toMatchObject({ email: "g@x", owner: true });
  });

  it("reduces the debt by payback calls and forgives overshoot", async () => {
    const db = await setup();
    await row(db, 2, "g@x", 0.09, { fallback: true });
    await row(db, 3, "s@x", 0.05, { payback: true, provider: "anthropic" });
    expect((await debts(db))[0].usd).toBeCloseTo(0.04);
    await row(db, 3, "s@x", 0.2, { payback: true, provider: "anthropic" });
    expect(await debts(db)).toEqual([]); // not "Germ owes Shazz 0.16"
    expect((await keyChain(db, SECRET, "anthropic", 3))[0]).toMatchObject({ email: "g@x", owner: true });
  });

  it("nets fallbacks both ways", async () => {
    const db = await setup();
    await row(db, 2, "g@x", 0.09, { fallback: true });
    await row(db, 1, "s@x", 0.05, { fallback: true }); // Shazz covered on Germ's day
    expect((await debts(db))[0]).toMatchObject({ debtor: "s@x", creditor: "g@x" });
    expect((await debts(db))[0].usd).toBeCloseTo(0.04);
  });

  it("skips payback when the debtor has no Anthropic key", async () => {
    const db = testD1();
    await db.prepare("INSERT INTO participants (email, name, turn_order) VALUES ('g@x', 'Germ', 1), ('s@x', 'Shazz', 2)").run();
    await saveKey(db, SECRET, "g@x", "anthropic", "test-key-anthropic-g-000000000000000");
    await row(db, 2, "g@x", 0.09, { fallback: true });
    expect((await keyChain(db, SECRET, "anthropic", 3)).map((k) => k.email)).toEqual(["g@x"]);
  });
});
