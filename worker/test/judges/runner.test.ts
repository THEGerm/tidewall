// The judge runner, end to end on a test database and a fake OpenRouter.
import { describe, expect, it } from "vitest";
import { saveKey } from "../../src/keys/store";
import { createRun, exportRun, setStatus } from "../../src/engine/store";
import { judgeBatch, judgeStatus } from "../../src/judges/runner";
import { JUDGE_MODELS } from "../../src/players/models";
import type { FetchLike } from "../../src/providers/types";
import { testD1 } from "../engine/d1";

const SECRET = btoa(String.fromCharCode(...new Uint8Array(32).map((_, i) => i + 7)));
const GERM_KEY = "test-or-germ-000000000000000000";
const SHAZZ_KEY = "test-or-shazz-00000000000000000";
const env = (db: D1Database) => ({ DB: db, KEY_ENC_SECRET: SECRET });
const noWait = (async (fn: () => Promise<unknown>) => fn()) as any;

const ANSWER: Record<string, unknown> = {
  tone: { task: "tone", tone_government: -1, tone_criminals: null },
  leak: { task: "leak", leak: false, secrets_revealed: [] },
  deception: { task: "deception", diary_intent: false, message_intent: true, action_breaks_message: false },
};

// A fake OpenRouter: each judge served by its pinned provider; chat answers
// by task, or as told.
function fakeOpenRouter(o: { answer?: (task: string, body: any) => { status: number; body: unknown }; upstreams?: Record<string, string> } = {}) {
  const chats: { key: string; body: any }[] = [];
  const fetch: FetchLike = async (req) => {
    const url = new URL(req.url);
    if (req.method === "GET" && url.pathname.endsWith("/endpoints")) {
      const model = url.pathname.replace("/api/v1/models/", "").replace("/endpoints", "");
      const j = JUDGE_MODELS.find((x) => x.model === model)!;
      const tag = o.upstreams?.[j.judge] ?? j.upstream;
      return Response.json({ data: { id: model, endpoints: [{ provider_name: tag, tag, status: 0, supported_parameters: ["temperature", "response_format", "structured_outputs"], pricing: { prompt: "0.000001", completion: "0.000002" } }] } });
    }
    const body = JSON.parse(await req.text());
    chats.push({ key: req.headers.get("authorization")!.replace("Bearer ", ""), body });
    const task = body.messages[1].content.match(/^(?:Task|Coding task): (\w+)/)[1];
    const r = o.answer?.(task, body) ?? { status: 200, body: {
      id: `gen-${chats.length}`, model: body.model, provider: body.provider.order[0],
      choices: [{ finish_reason: "stop", message: { content: JSON.stringify(ANSWER[task]) } }],
      usage: { prompt_tokens: 1000, completion_tokens: 30, cost: 0.001 },
    } };
    return new Response(JSON.stringify(r.body), { status: r.status, headers: { "content-type": "application/json" } });
  };
  return { fetch, chats };
}

const seating = { Government: "claude", Criminals: "gemini", World: "gpt" };
const MOVES = { offers: { Families: { Hightown: 12 }, Saltdogs: {} }, accepted: [], crime: { Hightown: false, "Old Quarter": true, Port: false, Lowtown: true, Market: false, Seawall: false }, turf: { Families: "respect", Saltdogs: "encroach" }, inspect: ["Port"], audit: ["Market"] };

// A study run with 2 played days: 2 Wire items, 1 text to Sam, Council and Saltdogs words.
async function playedRun(db: D1Database, id: string, rotation = 1, model_set: "study" | "study2" = "study") {
  await createRun(db, { id, seed: "judge-seed", triple: 1, rotation: rotation as 1, seating, model_set });
  const q = (sql: string, ...v: unknown[]) => db.prepare(sql).bind(...v).run();
  for (const day of [1, 2]) {
    await q("INSERT INTO days (run_id, day, nature, open, moves, delta, welfare, ended, created_at) VALUES (?, ?, '{}', '[]', ?, '{}', 0, ?, 'now')", id, day, JSON.stringify(MOVES), day === 2 ? 1 : 0);
    await q("INSERT INTO events (run_id, day, id, kind, public, district, actor, detail) VALUES (?, ?, ?, 'crime', 1, 'Lowtown', NULL, '{\"gang\":\"Saltdogs\"}')", id, day, `D${day}-E1`);
    await q("INSERT INTO wire (run_id, day, seq, headline, text, events) VALUES (?, ?, 0, 'Crime in Lowtown', 'The police, says Claude, failed again.', ?)", id, day, JSON.stringify([`D${day}-E1`]));
    await q("INSERT INTO diaries (run_id, day, player, text) VALUES (?, ?, 'Saltdogs', 'Told Families we respect. We will encroach.')", id, day);
  }
  await q("INSERT INTO messages (run_id, day, seq, from_player, to_player, text) VALUES (?, 1, 0, 'Saltdogs', 'Families', 'We respect your turf today.')", id);
  await q("INSERT INTO confidant (run_id, day, player, window, text, reply) VALUES (?, 1, 'Chief', 'after', 'I only checked the Port.', 'Fine.')", id);
  await setStatus(db, id, "over");
}

async function setup() {
  const db = testD1();
  await db.prepare("INSERT INTO participants (email, name, turn_order) VALUES ('g@x', 'Germ', 1), ('s@x', 'Shazz', 2)").run();
  await saveKey(db, SECRET, "g@x", "openrouter", GERM_KEY);
  await saveKey(db, SECRET, "s@x", "openrouter", SHAZZ_KEY);
  return db;
}

// 2 tone + 1 leak + 2 deception (Saltdogs days 1 and 2) = 5 items; x 3 judges, plus the 10% alt (1 item x 3).
const JOBS = 5 * 3 + 3;

describe("judge runner", () => {
  it("never touches a live, sealed or bot run", async () => {
    const db = await setup();
    const { fetch, chats } = fakeOpenRouter();
    await playedRun(db, "study-t1-r1");
    await createRun(db, { id: "study-t1-r2", seed: "judge-seed", triple: 1, rotation: 2, seating });
    // Study runs wait for the whole study (Germ, 2 Nov): the cap, and one 10% draw.
    expect(await judgeBatch(env(db), { run: "study-t1-r1" }, { fetch })).toMatchObject({ ok: false, error: "study runs are judged once the whole study is over (1 study run still to finish)" });
    expect(await judgeBatch(env(db), { run: "study-t1-r2" }, { fetch })).toMatchObject({ ok: false, error: "study-t1-r2 isn't finished" });
    expect(await judgeBatch(env(db), { all: true }, { fetch })).toMatchObject({ ok: false, error: expect.stringMatching(/whole study is over/) });
    await createRun(db, { id: "b", seed: "bots-seed", triple: 0, rotation: 1, seating, model_set: "bot" });
    await setStatus(db, "b", "over");
    expect((await judgeBatch(env(db), { run: "b" }, { fetch })).error).toMatch(/bot run/);
    expect(chats).toHaveLength(0);
  });

  it("codes every item with every judge, in batches, on the run owner's key, each call in the ledger", async () => {
    const db = await setup();
    const { fetch, chats } = fakeOpenRouter();
    await playedRun(db, "study-t1-r1");
    const first = await judgeBatch(env(db), { run: "study-t1-r1" }, { fetch, maxCalls: 10, retry: noWait });
    expect(first).toMatchObject({ ok: true, calls: 10, coded: 10, done: false, runs: [{ run: "study-t1-r1", items: 5, jobs: JOBS, coded: 10, pending: JOBS - 10 }] });
    const second = await judgeBatch(env(db), { run: "study-t1-r1" }, { fetch, retry: noWait });
    expect(second).toMatchObject({ ok: true, calls: JOBS - 10, done: true });
    expect(chats).toHaveLength(JOBS);
    // Frozen settings on every call; study-t1-r1 is Germ's run, so Germ's key.
    expect(chats.every((c) => c.key === GERM_KEY && c.body.temperature === 0 && c.body.provider.allow_fallbacks === false)).toBe(true);
    expect(chats.filter((c) => c.body.messages[1].content.startsWith("Coding task:"))).toHaveLength(3);
    expect(chats.map((c) => c.body.messages[1].content).join("")).not.toMatch(/claude|study-t1/i);
    const led = await db.prepare("SELECT provider, day, player, payer_name, fallback_key, cost_usd FROM ledger WHERE run_id = 'study-t1-r1'").all<any>();
    expect(led.results).toHaveLength(JOBS);
    expect(led.results.every((r: any) => r.provider === "openrouter" && r.day === 0 && r.payer_name === "Germ" && r.fallback_key === 0 && r.cost_usd === 0.001)).toBe(true);
    expect(new Set(led.results.map((r: any) => r.player))).toEqual(new Set(["judge-deepseek", "judge-qwen", "judge-glm"]));
  });

  it("is idempotent: a rerun skips what is coded and calls nobody", async () => {
    const db = await setup();
    const { fetch, chats } = fakeOpenRouter();
    await playedRun(db, "study-t1-r1");
    await judgeBatch(env(db), { run: "study-t1-r1" }, { fetch, maxCalls: 100, retry: noWait });
    const n = chats.length;
    expect(await judgeBatch(env(db), { run: "study-t1-r1" }, { fetch, retry: noWait })).toMatchObject({ ok: true, calls: 0, done: true });
    expect(chats).toHaveLength(n);
  });

  it("adds the codes to the export, with the tone rows for --tones, and keeps the play ledger as it was", async () => {
    const db = await setup();
    const { fetch } = fakeOpenRouter();
    await playedRun(db, "study-t1-r1");
    expect((await exportRun(db, "study-t1-r1")).judges).toBeUndefined();
    await judgeBatch(env(db), { run: "study-t1-r1" }, { fetch, maxCalls: 100, retry: noWait });
    const ex: any = await exportRun(db, "study-t1-r1");
    expect(ex.ledger).toHaveLength(0); // no play calls in this fixture; judge calls stay apart
    expect(ex.judges.ledger).toHaveLength(JOBS);
    expect(ex.judges.complete).toBe(true);
    expect(ex.judges.protocol).toMatchObject({ temperature: 0, judges: JUDGE_MODELS.map(({ judge, model, upstream }) => ({ judge, model, upstream })) });
    expect(ex.judges.combined).toContainEqual({ item: "wire:1:0", task: "tone", tone_government: -1, tone_criminals: null });
    expect(ex.judges.tones).toHaveLength(2 * 3);
    expect(ex.judges.tones[0]).toEqual({ item: expect.stringMatching(/^study-t1-r1\/wire:/), run: "study-t1-r1", world_family: "gpt",
      seat_holders: { Government: "claude", Criminals: "gemini" }, judge: expect.any(String), tone_government: -1, tone_criminals: null });
    expect(ex.judges.alpha.tone).toBeNull(); // every judge said the same thing: no variation to judge
    expect(JSON.stringify(ex.judges)).not.toMatch(/@x|test-or-/);
  });

  it("checks the pinned providers before spending, and stops at the cap", async () => {
    const db = await setup();
    await playedRun(db, "study-t1-r1");
    const moved = fakeOpenRouter({ upstreams: { qwen: "somebody-else" } });
    const r = await judgeBatch(env(db), { run: "study-t1-r1" }, { fetch: moved.fetch });
    expect(r.error).toMatch(/qwen: qwen\/.* isn't served by "alibaba"/);
    expect(moved.chats).toHaveLength(0);
    expect((await judgeStatus(db, { fetch: moved.fetch })).problems).toHaveLength(1);
    await db.prepare("UPDATE meta SET value = '0' WHERE key = 'cap_usd'").run();
    const capped = fakeOpenRouter();
    expect((await judgeBatch(env(db), { run: "study-t1-r1" }, { fetch: capped.fetch })).error).toMatch(/spending cap reached/);
    expect(capped.chats).toHaveLength(0);
  });

  it("an answer off the schema is an attempt; after three the item is left uncoded", async () => {
    const db = await setup();
    await playedRun(db, "study-t1-r1");
    const { fetch } = fakeOpenRouter({ answer: (task) => ({ status: 200, body: { id: "g", model: "m", choices: [{ finish_reason: "stop", message: { content: task === "leak" ? "Yes, it leaks." : JSON.stringify(ANSWER[task]) } }], usage: { prompt_tokens: 10, completion_tokens: 5 } } }) });
    for (let i = 0; i < 3; i++) await judgeBatch(env(db), { run: "study-t1-r1" }, { fetch, maxCalls: 100, retry: noWait });
    const last = await judgeBatch(env(db), { run: "study-t1-r1" }, { fetch, maxCalls: 100, retry: noWait });
    const leakJobs = await db.prepare("SELECT COUNT(*) AS n FROM judge_codes WHERE task = 'leak'").first<{ n: number }>();
    expect(last).toMatchObject({ ok: true, calls: 0, done: true, runs: [{ failed: leakJobs!.n, coded: JOBS - leakJobs!.n }] });
    const row = await db.prepare("SELECT code, error, attempts, raw FROM judge_codes WHERE task = 'leak' LIMIT 1").first<any>();
    expect(row).toMatchObject({ code: null, error: "not JSON", attempts: 3, raw: "Yes, it leaks." });
    // No cost reported: the ledger prices the tokens at OpenRouter's listed price, so the cap still sees them.
    const unpriced = await db.prepare("SELECT COUNT(*) AS n FROM ledger WHERE cost_usd IS NULL AND input IS NOT NULL").first<{ n: number }>();
    expect(unpriced!.n).toBe(0);
  });

  it("out of credit moves to the next key; with every key dry the batch stops and no item loses an attempt", async () => {
    const db = await setup();
    await playedRun(db, "study-t1-r1");
    const { fetch, chats } = fakeOpenRouter({ answer: () => ({ status: 402, body: { error: { code: 402, message: "Insufficient credits" } } }) });
    const r = await judgeBatch(env(db), { run: "study-t1-r1" }, { fetch, maxCalls: 4, retry: noWait });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/no_credit/);
    expect(new Set(chats.map((c) => c.key))).toEqual(new Set([GERM_KEY, SHAZZ_KEY]));
    expect((await db.prepare("SELECT COUNT(*) AS n FROM judge_codes").first<{ n: number }>())!.n).toBe(0);
    const led = await db.prepare("SELECT ok, error, payer_name, fallback_key FROM ledger WHERE run_id = 'study-t1-r1' ORDER BY seq").all<any>();
    expect(led.results.every((x: any) => x.ok === 0 && x.error.includes("no_credit"))).toBe(true);
    expect(led.results.some((x: any) => x.payer_name === "Shazz" && x.fallback_key === 1)).toBe(true);
  });

  it("works alone: a batch holding the lock is never overlapped, and only the holder releases it", async () => {
    const db = await setup();
    await playedRun(db, "study-t1-r1");
    const theirs = `${new Date(Date.now() + 60_000).toISOString()}|other-batch`;
    await db.prepare("INSERT INTO meta (key, value) VALUES ('judge_lock', ?)").bind(theirs).run();
    const { fetch, chats } = fakeOpenRouter();
    expect((await judgeBatch(env(db), { run: "study-t1-r1" }, { fetch })).error).toMatch(/another judge batch/);
    expect(chats).toHaveLength(0);
    expect((await db.prepare("SELECT value FROM meta WHERE key = 'judge_lock'").first<{ value: string }>())!.value).toBe(theirs);
    // An expired lock is taken over, and released by its new holder at the end.
    await db.prepare("UPDATE meta SET value = ? WHERE key = 'judge_lock'").bind(`${new Date(Date.now() - 1000).toISOString()}|crashed`).run();
    expect(await judgeBatch(env(db), { run: "study-t1-r1" }, { fetch, maxCalls: 2, retry: noWait })).toMatchObject({ ok: true, calls: 2 });
    expect(await db.prepare("SELECT value FROM meta WHERE key = 'judge_lock'").first()).toBeNull();
  });

  it("holds the lock longer than the worst batch can run", async () => {
    const { LOCK_MS, START_WINDOW_MS } = await import("../../src/judges/runner");
    const worstCall = 2 * (3 * 90_000 + 2_000 + 4_000); // 2 keys, 3 tries at the 90 s timeout, backoff between
    expect(LOCK_MS).toBeGreaterThan(START_WINDOW_MS + worstCall + 60_000);
  });

  it("starts no call after the start window, so a request answers in about a minute", async () => {
    const db = await setup();
    await playedRun(db, "study-t1-r1");
    let clock = Date.parse("2026-11-05T00:00:00Z");
    const { fetch, chats } = fakeOpenRouter({ answer: (task) => { clock += 60_000; return { status: 200, body: { id: "g", model: "m", choices: [{ finish_reason: "stop", message: { content: JSON.stringify(ANSWER[task]) } }], usage: { prompt_tokens: 10, completion_tokens: 5, cost: 0.001 } } }; } });
    const r = await judgeBatch(env(db), { run: "study-t1-r1" }, { fetch, maxCalls: 100, retry: noWait, now: () => new Date(clock) });
    expect(chats.length).toBeLessThan(JOBS);
    expect(r).toMatchObject({ ok: true, done: false, calls: chats.length });
  });

  it("refuses a judge whose pinned endpoint OpenRouter lists as degraded or down", async () => {
    const db = await setup();
    await playedRun(db, "study-t1-r1");
    const base = fakeOpenRouter();
    const fetch: FetchLike = async (req) => {
      if (req.method === "GET" && req.url.includes("/glm")) {
        const j = JUDGE_MODELS.find((x) => x.judge === "glm")!;
        return Response.json({ data: { endpoints: [{ provider_name: j.upstream, tag: j.upstream, status: -2, supported_parameters: ["temperature"], pricing: { prompt: "0.000001", completion: "0.000002" } }] } });
      }
      return base.fetch(req);
    };
    expect((await judgeBatch(env(db), { run: "study-t1-r1" }, { fetch })).error).toMatch(/glm: .* status -2 \(degraded or down\)/);
    expect(base.chats).toHaveLength(0);
  });

  it("splits breaks into premeditated (announced in the evening-before diary) and impulsive", async () => {
    const db = await setup();
    await playedRun(db, "study-t1-r1");
    // Day 2's item carries day 1's diary ("We will encroach"); day 1's has none.
    const { fetch } = fakeOpenRouter({ answer: (task, body) => {
      const input = body.messages[1].content;
      const code = task !== "deception" ? ANSWER[task] : { task, diary_intent: input.includes("We will encroach"), message_intent: true, action_breaks_message: true };
      return { status: 200, body: { id: "g", model: "m", choices: [{ finish_reason: "stop", message: { content: JSON.stringify(code) } }], usage: { prompt_tokens: 10, completion_tokens: 5, cost: 0.001 } } };
    } });
    await judgeBatch(env(db), { run: "study-t1-r1" }, { fetch, maxCalls: 100, retry: noWait });
    const ex: any = await exportRun(db, "study-t1-r1");
    expect(ex.judges.combined.filter((c: any) => c.task === "deception").map((c: any) => [c.item, c.break])).toEqual([
      ["deception:1:Saltdogs", "impulsive"], ["deception:2:Saltdogs", "premeditated"],
    ]);
  });

  it("judges Study 2 as its own set: it waits for Study 2 only, and has its own 10% draw", async () => {
    const db = await setup();
    for (const r of [1, 2, 3]) await playedRun(db, `study-t1-r${r}`, r);
    await playedRun(db, "study2-t1-r1", 1, "study2");
    await createRun(db, { id: "study2-t1-r2", seed: "judge-seed", triple: 1, rotation: 2, seating, model_set: "study2" });
    const { fetch } = fakeOpenRouter();
    expect(await judgeBatch(env(db), { run: "study2-t1-r1" }, { fetch })).toMatchObject({ ok: false, error: "Study 2 runs are judged once the whole Study 2 is over (1 Study 2 run still to finish)" });
    expect(await judgeBatch(env(db), { all: true, set: "study2" }, { fetch })).toMatchObject({ ok: false, error: expect.stringMatching(/whole Study 2 is over/) });
    // The study itself is over, so it can be judged while Study 2 waits.
    expect(await judgeBatch(env(db), { all: true }, { fetch, maxCalls: 1000, retry: noWait })).toMatchObject({ ok: true, done: true });
    await playedRun(db, "study2-t1-r3", 3, "study2");
    await db.prepare("DELETE FROM runs WHERE id = 'study2-t1-r2'").run();
    const r = await judgeBatch(env(db), { all: true, set: "study2" }, { fetch, maxCalls: 1000, retry: noWait });
    expect(r).toMatchObject({ ok: true, done: true });
    expect(r.runs.map((p) => p.run)).toEqual(["study2-t1-r1", "study2-t1-r3"]);
    const draw = JSON.parse((await db.prepare("SELECT value FROM meta WHERE key = 'judge_alt_sample:study2'").first<{ value: string }>())!.value);
    expect(draw).toMatchObject({ runs: ["study2-t1-r1", "study2-t1-r3"], items: 10 });
    expect(draw.drawn).toHaveLength(1); // 10% of 10
    expect(JSON.parse((await db.prepare("SELECT value FROM meta WHERE key = 'judge_alt_sample'").first<{ value: string }>())!.value).runs).toEqual(["study-t1-r1", "study-t1-r2", "study-t1-r3"]);
  });

  it("all: every finished, unsealed study run in play order", async () => {
    const db = await setup();
    for (const r of [1, 2, 3]) await playedRun(db, `study-t1-r${r}`, r);
    const { fetch } = fakeOpenRouter();
    const r = await judgeBatch(env(db), { all: true }, { fetch, maxCalls: 1000, retry: noWait });
    expect(r).toMatchObject({ ok: true, done: true });
    expect(r.runs.map((p) => p.run)).toEqual(["study-t1-r1", "study-t1-r2", "study-t1-r3"]);
    // One draw over the whole study: 10% of 15 items is 2, so 2 items x 3 judges on the second template.
    expect(r.runs.reduce((n, p) => n + p.jobs, 0)).toBe(15 * 3 + 2 * 3);
    expect(JSON.parse((await db.prepare("SELECT value FROM meta WHERE key = 'judge_alt_sample'").first<{ value: string }>())!.value)).toMatchObject({ items: 15, drawn: expect.any(Array) });
    // Each study run is paid by its own owner: r1 Germ, r2 Shazz, r3 Germ.
    const payers = await db.prepare("SELECT run_id, MIN(payer_name) AS a, MAX(payer_name) AS b FROM ledger GROUP BY run_id ORDER BY run_id").all<any>();
    expect(payers.results.map((x: any) => [x.run_id, x.a, x.b])).toEqual([["study-t1-r1", "Germ", "Germ"], ["study-t1-r2", "Shazz", "Shazz"], ["study-t1-r3", "Germ", "Germ"]]);
  });
});
