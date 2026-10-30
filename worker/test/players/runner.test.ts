import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createRun, getRun } from "../../src/engine/store";
import { playNextDay, tick, type RunnerEnv } from "../../src/engine/runner";
import { runLedger, studySpend } from "../../src/ledger/ledger";
import { PRICES, costOf } from "../../src/ledger/pricing";
import { saveKey } from "../../src/keys/store";
import { MODELS } from "../../src/players/models";
import type { ChatRequest, ChatResult } from "../../src/providers";
import { testD1 } from "../engine/d1";

const SECRET = btoa(String.fromCharCode(...new Uint8Array(32).map((_, i) => i + 7)));
const usage = { input: 1000, cachedInput: 800, cacheWrite: 0, output: 200, reasoning: null };

function fill(s: any): any {
  if (s.anyOf) return null;
  if (s.enum) return s.enum[0];
  switch (s.type) {
    case "object": return Object.fromEntries(Object.entries(s.properties).map(([k, v]) => [k, fill(v)]));
    case "array": return s.items.enum ? s.items.enum.slice(0, s.minItems ?? 0) : [];
    case "number": return 0.3;
    case "integer": return s.minimum ?? 0;
    case "boolean": return false;
    case "string": return "ok";
  }
}
const fake = async (_p: any, _k: string, req: ChatRequest): Promise<ChatResult> => (efforts.push(req.effort), {
  provider: "anthropic", model: req.model, modelReported: req.model, text: JSON.stringify(fill(req.json!.schema)),
  stop: "done", stopDetail: "end_turn", usage, requestId: null, latencyMs: 3,
});
const opts = { call: fake as any, retry: <T,>(f: () => Promise<T>) => f() };
const seating = { Government: "claude", Criminals: "gemini", World: "gpt" };

const saved = { gemini: MODELS.gemini.model, gpt: MODELS.gpt.model };
const efforts: (string | undefined)[] = [];
beforeEach(() => {
  MODELS.gemini.model = "gemini-test";
  MODELS.gpt.model = "gpt-test";
  PRICES["gemini-test"] = { input: 1, cachedInput: 0.1, cacheWrite: 1, output: 4, checked: "test" };
  PRICES["gpt-test"] = { input: 2, cachedInput: 0.2, cacheWrite: 2, output: 8, checked: "test" };
});
afterEach(() => {
  MODELS.gemini.model = saved.gemini;
  MODELS.gpt.model = saved.gpt;
  delete PRICES["gemini-test"];
  delete PRICES["gpt-test"];
});

async function setup(keys: ("anthropic" | "google" | "openai")[] = ["anthropic", "google", "openai"]): Promise<RunnerEnv> {
  const db = testD1();
  await db.prepare("INSERT INTO participants (email, name, turn_order) VALUES ('g@x', 'Germ', 1), ('s@x', 'Shazz', 2)").run();
  for (const p of keys) await saveKey(db, SECRET, p === "google" ? "s@x" : "g@x", p, `test-key-${p}-0000000000000000`);
  return { DB: db, KEY_ENC_SECRET: SECRET };
}
const on = (env: RunnerEnv) => env.DB.prepare("UPDATE meta SET value = 'on' WHERE key = 'schedule'").run();

describe("pricing", () => {
  it("has GPT-6.1 Sol pinned and priced", () => {
    expect(saved.gpt).toBe("gpt-6.1-sol");
    expect(PRICES["gpt-6.1-sol"]).toMatchObject({ input: 2, cachedInput: 0.1, cacheWrite: 2.5, output: 10 });
  });

  it("has Gemini 4 Argon pinned, priced, and doubling on 1 Dec 2026", () => {
    expect(saved.gemini).toBe("gemini-4-argon");
    expect(costOf("gemini-4-argon", usage, new Date("2026-11-15T12:00:00Z"))).toBeCloseTo((200 * 2 + 800 * 0.1 + 200 * 10) / 1e6, 10);
    expect(costOf("gemini-4-argon", usage, new Date("2026-12-01T00:00:00Z"))).toBeCloseTo((200 * 4 + 800 * 0.2 + 200 * 20) / 1e6, 10);
  });

  it("costs fresh, cached and output tokens separately", () => {
    expect(costOf("claude-opus-5-5", usage)).toBeCloseTo((200 * 4 + 800 * 0.2 + 200 * 20) / 1e6, 10);
    expect(costOf("unknown-model", usage)).toBeNull();
  });
});

describe("scheduler", () => {
  it("does nothing while the schedule is off", async () => {
    const env = await setup();
    await createRun(env.DB, { id: "t1-r1", seed: "seed-one-1", triple: 1, rotation: 1, seating });
    expect(await tick(env, opts)).toEqual({ played: false, reason: "schedule is off" });
  });

  it("starts the first ready run, plays a day, and records the ledger", async () => {
    const env = await setup();
    await createRun(env.DB, { id: "t1-r1", seed: "seed-one-1", triple: 1, rotation: 1, seating });
    await on(env);
    const out = await tick(env, opts);
    expect(out).toMatchObject({ played: true, day: 1 });
    const run = (await getRun(env.DB, "t1-r1"))!;
    expect(run.status).toBe("running");
    expect(run.state.day).toBe(2);
    const rows = await runLedger(env.DB, "t1-r1");
    expect(new Set(rows.map((r) => r.provider))).toEqual(new Set(["anthropic", "google", "openai"]));
    expect(rows.find((r) => r.provider === "google")!.payer_name).toBe("Shazz");
    expect(rows.find((r) => r.provider === "anthropic")!.payer_name).toBe("Germ");
    expect((await studySpend(env.DB)).usd).toBeGreaterThan(0);
    expect(efforts.length).toBeGreaterThan(0);
    expect(efforts.every((e) => e === "medium")).toBe(true);
  });

  it("pauses with a reason when nobody has a key for a provider", async () => {
    const env = await setup(["anthropic", "openai"]);
    await createRun(env.DB, { id: "r", seed: "seed-nokey", triple: 1, rotation: 1, seating });
    await on(env);
    expect(await tick(env, opts)).toEqual({ played: false, reason: "nobody has a google key" });
    expect((await getRun(env.DB, "r"))!.status).toBe("paused");
    expect(await tick(env, opts)).toEqual({ played: false, reason: "a run is paused" });
  });

  it("pauses when a model isn't pinned", async () => {
    const env = await setup();
    MODELS.gpt.model = "PIN-BEFORE-WEEK-1";
    await createRun(env.DB, { id: "r", seed: "seed-unpin", triple: 1, rotation: 1, seating });
    await on(env);
    const out = await tick(env, opts);
    expect(out.played).toBe(false);
    expect((out as any).reason).toMatch(/gpt model ID not pinned/);
  });

  it("pauses at the spending cap", async () => {
    const env = await setup();
    await env.DB.prepare("UPDATE meta SET value = '0' WHERE key = 'cap_usd'").run();
    await createRun(env.DB, { id: "r", seed: "seed-cap-0", triple: 1, rotation: 1, seating });
    await on(env);
    expect((await tick(env, opts) as any).reason).toMatch(/spending cap reached/);
  });

  it("won't play a day another tick is already playing", async () => {
    const env = await setup();
    await createRun(env.DB, { id: "r", seed: "seed-locked", triple: 1, rotation: 1, seating });
    await env.DB.prepare("UPDATE runs SET status = 'running', lock_until = ? WHERE id = 'r'").bind(new Date(Date.now() + 600_000).toISOString()).run();
    expect(await playNextDay(env, "r", opts)).toEqual({ played: false, reason: "another tick is playing this run" });
  });

  it("plays a run to its end, then moves to the next run", async () => {
    const env = await setup();
    await createRun(env.DB, { id: "t1-r1", seed: "seed-first", triple: 1, rotation: 1, seating });
    await createRun(env.DB, { id: "t1-r2", seed: "seed-first", triple: 1, rotation: 2, seating: { Government: "gemini", Criminals: "gpt", World: "claude" } });
    await on(env);
    let ticks = 0;
    while ((await getRun(env.DB, "t1-r1"))!.status === "ready" || (await getRun(env.DB, "t1-r1"))!.status === "running") {
      await tick(env, opts);
      if (++ticks > 70) throw new Error("run never ended");
    }
    expect(["over", "truncated"]).toContain((await getRun(env.DB, "t1-r1"))!.status);
    expect((await tick(env, opts) as any).day).toBe(1);
    expect((await getRun(env.DB, "t1-r2"))!.status).toBe("running");
  });
});
