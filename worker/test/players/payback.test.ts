// Fallback payback (#117): debts from fallback calls, repaid through the
// debtor's Anthropic key on the creditor's days.
import { describe, expect, it } from "vitest";
import { testD1 } from "../engine/d1";
import { saveKey } from "../../src/keys/store";
import { debts, held, keyChain, ownerOrder, PAYBACK_MIN_USD } from "../../src/players/keys";

const SECRET = btoa(String.fromCharCode(...new Uint8Array(32).map((_, i) => i + 7)));
let at = 0;
const row = (db: D1Database, day: number, payer: string, cost: number, o: { fallback?: boolean; payback?: boolean; provider?: string; error?: string } = {}) =>
  db.prepare(`INSERT INTO ledger (run_id, day, seq, player, step, provider, model, payer_email, fallback_key, payback, ok, cost_usd, day_saved, at, error)
              VALUES ('r', ?, ?, 'Chief', 'act', ?, 'm', ?, ?, ?, ?, ?, 1, ?, ?)`)
    .bind(day, at, o.provider ?? "google", payer, o.fallback ? 1 : 0, o.payback ? 1 : 0, o.error ? 0 : 1, cost, `2026-10-31T00:00:${String(at++).padStart(2, "0")}Z`, o.error ?? null).run();

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
    await row(db, 2, "g@x", 2.09, { fallback: true }); // day 2 is Shazz's, Germ covered
    expect(await debts(db)).toEqual([{ debtor: "s@x", creditor: "g@x", usd: 2.09 }]);
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
    await row(db, 2, "g@x", 2.09, { fallback: true });
    expect((await keyChain(db, SECRET, "anthropic", 3)).map((k) => k.email)).toEqual(["g@x"]);
  });

  it("ignores the hold since 2 Nov: a debtor repays on the creditor's run whatever the hold says", async () => {
    const db = await setup();
    await row(db, 2, "g@x", 2.09, { fallback: true }); // Shazz owes Germ
    await db.prepare("INSERT INTO meta (key, value) VALUES ('payback_hold', ?)").bind(JSON.stringify([{ provider: "anthropic", creditor: "g@x", until: "2999-01-01" }])).run();
    expect((await keyChain(db, SECRET, "anthropic", 3))[0]).toMatchObject({ email: "s@x", payback: true });
    // held() still reads the row; nothing calls it
    expect(await held(db, "anthropic", "g@x")).toBe(true);
  });

  it("a dry debtor doesn't repay through Google or OpenAI; the owner's key pays (Germ, 2 Nov)", async () => {
    const db = await setup();
    for (const e of ["g@x", "s@x"]) await saveKey(db, SECRET, e, "google", `test-key-google-${e}-0000000000000`);
    await row(db, 2, "g@x", 2.5, { fallback: true }); // Shazz owes Germ
    await row(db, 2, "s@x", 0, { provider: "anthropic", error: "anthropic: no_credit (402): payment required" });
    expect((await keyChain(db, SECRET, "anthropic", 3))[0]).toMatchObject({ email: "g@x", owner: true });
    expect((await keyChain(db, SECRET, "google", 3))[0]).toMatchObject({ email: "g@x", owner: true });
  });

  it("repays only while the debt is above $2", async () => {
    const db = await setup();
    await row(db, 2, "g@x", PAYBACK_MIN_USD + 0.5, { fallback: true });
    expect((await keyChain(db, SECRET, "anthropic", 3))[0]).toMatchObject({ email: "s@x", payback: true });
    await row(db, 3, "s@x", 0.6, { payback: true, provider: "anthropic" }); // 1.90 left
    expect((await debts(db))[0].usd).toBeCloseTo(1.9);
    expect((await keyChain(db, SECRET, "anthropic", 3))[0]).toMatchObject({ email: "g@x", owner: true });
  });
});

describe("study runs: one owner per run (Germ, 2 Nov)", () => {
  const study = (triple: number, rotation: number) => ({ model_set: "study", triple, rotation });
  it("alternates owners by run in play order, whatever the day", () => {
    const ps = ["Germ", "Shazz"];
    const order = [[1, 1], [1, 2], [1, 3], [2, 4], [2, 5], [2, 6], [3, 1]].map(([t, r]) => ownerOrder(ps, 7, study(t, r))[0]);
    expect(order).toEqual(["Germ", "Shazz", "Germ", "Shazz", "Germ", "Shazz", "Germ"]);
    expect([1, 2, 3].map((d) => ownerOrder(ps, d, study(1, 2))[0])).toEqual(["Shazz", "Shazz", "Shazz"]);
    // test runs and the smoke test keep the daily rotation
    expect([1, 2].map((d) => ownerOrder(ps, d, { model_set: "test", triple: 0, rotation: 1 })[0])).toEqual(["Germ", "Shazz"]);
    expect([1, 2].map((d) => ownerOrder(ps, d, study(0, 1))[0])).toEqual(["Germ", "Shazz"]);
  });

  it("run 2's fallbacks become Shazz's debt, repaid through his Claude key on run 3", async () => {
    const db = await setup();
    await saveKey(db, SECRET, "g@x", "google", "test-key-google-g-0000000000000000");
    const ins = (id: string, t: number, r: number) => db.prepare(`INSERT INTO runs (id, seed, triple, rotation, seating, rules_version, status, state, created_at, updated_at, model_set)
      VALUES (?, 's', ?, ?, '{}', 'draft-4', 'ready', '{}', 'x', 'x', 'study')`).bind(id, t, r).run();
    await ins("study-t1-r2", 1, 2);
    await ins("study-t1-r3", 1, 3);
    // day 1 of run 2 (Shazz's): Germ's Google key covered 3 dollars
    await db.prepare(`INSERT INTO ledger (run_id, day, seq, player, step, provider, model, payer_email, fallback_key, payback, ok, cost_usd, day_saved, at)
      VALUES ('study-t1-r2', 1, 0, 'Chief', 'act', 'google', 'm', 'g@x', 1, 0, 1, 3, 1, '2026-11-02T00:00:00Z')`).run();
    expect(await debts(db)).toEqual([{ debtor: "s@x", creditor: "g@x", usd: 3 }]);
    const r3 = await keyChain(db, SECRET, "anthropic", 1, study(1, 3));
    expect(r3.map((k) => [k.email, !!k.payback])).toEqual([["s@x", true], ["g@x", false]]);
    // Shazz's own run: his key first, no payback
    expect((await keyChain(db, SECRET, "anthropic", 1, study(1, 2)))[0]).toMatchObject({ email: "s@x", owner: true });
  });
});
