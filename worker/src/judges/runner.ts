// The judge runner (#112; decided 1 Nov: in the Worker, started from Control).
//
// One batch codes up to BATCH_CALLS items x judges for one run, or for every
// finished, unsealed study run in play order, and returns its progress; the
// Control page asks for batches until nothing is left. Each batch:
//   1. refuses a live or sealed run (and bot runs), and works only alone (a lock);
//   2. preflight: each pinned judge must be on OpenRouter's live list with its
//      pinned provider, which must take temperature and report a price; the
//      spending cap must have room;
//   3. builds the run's items from its export (judges/items.ts), skips every
//      item a judge has already coded, and calls the rest with the frozen
//      prompt and schema, temperature 0, on the run's OpenRouter keys in the
//      normal order (players/keys.ts keyChain: the study run's owner first);
//   4. logs every call in the ledger (provider openrouter, day 0, player
//      judge-<name>), so judging counts against the cap, and saves each
//      answer to judge_codes.
// Nothing here touches play: it reads finished runs and writes only the
// ledger and its own tables.

import { getRun, exportRun, type RunRow } from "../engine/store";
import { isLive, sealed } from "../engine/public";
import { log } from "../engine/log";
import { ledgerRow, nextSeq, studySpend } from "../ledger/ledger";
import { keyChain, participants, type KeyCandidate } from "../players/keys";
import { JUDGE_MODELS, type Judge } from "../players/models";
import type { CallRecord } from "../players/model";
import { ProviderError, withRetry, type ChatRequest, type ChatResult, type FetchLike } from "../providers";
import { callOpenRouter, modelEndpoints, pinned, type JsonMode } from "../providers/openrouter";
import { altSample, itemsOf, type Item } from "./items";
import { judgesSignature, MAX_ATTEMPTS, MAX_OUTPUT_TOKENS, TEMPERATURE } from "./export";
import { readCode, schemaFor, SYSTEM, userMessage, type Template } from "./prompt";

export const BATCH_CALLS = 48; // 3 rounds of CONCURRENCY
export const CONCURRENCY = 16;
// No new call starts after this, so a batch answers in about a minute.
export const START_WINDOW_MS = 45_000;
const CALL_TIMEOUT_MS = 90_000;
// Longer than the worst batch (Germ's review of #141): calls start for 45 s;
// the last one may try 2 keys, each up to 3 times at 90 s with 2 s and 4 s
// between, about 9.3 minutes, plus the saves. A lock that outlived its batch
// would let a second batch take the same ledger seqs.
export const LOCK_MS = 20 * 60_000;

export interface RunnerEnv { DB: D1Database; KEY_ENC_SECRET: string }
export interface RunnerOptions { fetch?: FetchLike; maxCalls?: number; now?: () => Date; retry?: typeof withRetry }

export interface Ready { judge: Judge; jsonMode: JsonMode; price: { prompt: number; completion: number } }
export interface Progress { run: string; items: number; jobs: number; coded: number; failed: number; pending: number }

// The study sets: the study, and Study 2 (Germ, 2 Nov: the same 27-run
// design on lightweight models). Each is judged as a whole, on its own.
export type StudySet = "study" | "study2";
const STUDY_SETS: readonly string[] = ["study", "study2"];
const isStudy = (run: { model_set: string; triple: number }) => STUDY_SETS.includes(run.model_set) && run.triple > 0;
const setName = (set: string) => (set === "study2" ? "Study 2" : "study");

// A study set's runs not over yet. Judging a set waits for the whole set
// (Germ, 2 Nov): judge calls count against the cap it plays under, and the
// second-template draw covers every item of the set at once.
async function studyLeft(db: D1Database, set: string): Promise<number> {
  const r = await db.prepare("SELECT COUNT(*) AS n FROM runs WHERE model_set = ? AND triple > 0 AND status NOT IN ('over', 'truncated')").bind(set).first<{ n: number }>();
  return r?.n ?? 0;
}
const notYet = (set: string, left: number) => `${setName(set)} runs are judged once the whole ${setName(set)} is over (${left} ${setName(set)} run${left === 1 ? "" : "s"} still to finish)`;

// Why a run can't be judged, or null if it can.
export async function cannotJudge(db: D1Database, run: RunRow): Promise<string | null> {
  if (run.model_set === "bot") return `${run.id} is a bot run: no text to judge`;
  if (isLive(run.status)) return `${run.id} isn't finished`;
  if (isStudy(run)) {
    const left = await studyLeft(db, run.model_set);
    if (left) return notYet(run.model_set, left);
  }
  if (await sealed(db, run)) return `${run.id} is sealed until its triple ends`;
  return null;
}

// Checks every pinned judge against OpenRouter's live list, without spending.
export async function preflight(db: D1Database, o: RunnerOptions = {}): Promise<{ ready: Ready[]; problems: string[] }> {
  const problems: string[] = [];
  const ready: Ready[] = [];
  if (JUDGE_MODELS.length !== 3) problems.push(`${JUDGE_MODELS.length} judges pinned; the protocol has 3`);
  for (const j of JUDGE_MODELS) {
    try {
      const eps = await modelEndpoints(j.model, o.fetch);
      const e = pinned(eps, j.upstream);
      if (!e) {
        problems.push(`${j.judge}: ${j.model} isn't served by "${j.upstream}" on OpenRouter now (served by: ${eps.map((x) => x.tag).join(", ") || "nobody"})`);
        continue;
      }
      // OpenRouter's endpoint status: 0 when up, below 0 when degraded or down.
      if (e.status !== null && e.status < 0) { problems.push(`${j.judge}: OpenRouter lists ${j.model} on ${j.upstream} with status ${e.status} (degraded or down)`); continue; }
      if (!e.parameters.includes("temperature")) { problems.push(`${j.judge}: ${j.upstream} doesn't take temperature for ${j.model}`); continue; }
      if (!e.price) { problems.push(`${j.judge}: OpenRouter lists no price for ${j.model} on ${j.upstream}`); continue; }
      const jsonMode: JsonMode = e.parameters.includes("structured_outputs") ? "schema" : e.parameters.includes("response_format") ? "object" : "none";
      ready.push({ judge: j, jsonMode, price: e.price });
    } catch (err) {
      problems.push(`${j.judge}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  const cap = Number((await db.prepare("SELECT value FROM meta WHERE key = 'cap_usd'").first<{ value: string }>())?.value ?? "0");
  const spend = await studySpend(db);
  if (spend.usd >= cap) problems.push(`spending cap reached: $${spend.usd.toFixed(2)} of $${cap}`);
  if (!(await db.prepare("SELECT 1 FROM provider_keys WHERE provider = 'openrouter' LIMIT 1").first())) problems.push("no participant has saved an OpenRouter key");
  return { ready, problems };
}

async function sha256(s: string): Promise<string> {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

interface Job { item: Item; ready: Ready; template: Template }

// The second-template draw for a study set: 10% of all its runs' items
// together, drawn once the set is over and kept in meta, so later batches
// don't re-read 27 exports.
async function studyAltSample(db: D1Database, set: string): Promise<Set<string>> {
  const { results } = await db.prepare("SELECT id FROM runs WHERE model_set = ? AND triple > 0 ORDER BY triple, rotation").bind(set).all<{ id: string }>();
  const ids = results.map((r) => r.id);
  const key = set === "study" ? "judge_alt_sample" : `judge_alt_sample:${set}`;
  const kept = await db.prepare("SELECT value FROM meta WHERE key = ?").bind(key).first<{ value: string }>();
  if (kept) {
    const k = JSON.parse(kept.value) as { runs: string[]; drawn: string[] };
    if (JSON.stringify(k.runs) === JSON.stringify(ids)) return new Set(k.drawn);
  }
  const keys: string[] = [];
  for (const id of ids) for (const it of itemsOf(await exportRun(db, id))) keys.push(`${id}|${it.id}`);
  const drawn = await altSample(keys);
  await db.prepare("INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value")
    .bind(key, JSON.stringify({ runs: ids, items: keys.length, drawn: [...drawn].sort() })).run();
  return drawn;
}

// The run's jobs, and which are still to do: not coded by the judge pinned
// now, and not yet out of attempts.
async function jobsOf(db: D1Database, run: RunRow, ready: Ready[]) {
  const ex = await exportRun(db, run.id);
  const items = itemsOf(ex);
  // A test run's own 10%; a study run's share of the study's 10%.
  const alt = isStudy(run) ? await studyAltSample(db, run.model_set) : await altSample(items.map((it) => `${run.id}|${it.id}`));
  const jobs: Job[] = items.flatMap((item) => ready.flatMap((r) => [
    { item, ready: r, template: "main" as Template },
    ...(alt.has(`${run.id}|${item.id}`) ? [{ item, ready: r, template: "alt" as Template }] : []),
  ]));
  const { results } = await db
    .prepare("SELECT item, judge, template, model, upstream, code IS NOT NULL AS coded, attempts FROM judge_codes WHERE run_id = ?")
    .bind(run.id)
    .all<{ item: string; judge: string; template: string; model: string; upstream: string; coded: number; attempts: number }>();
  const seen = new Map(results.map((r) => [`${r.item}|${r.judge}|${r.template}`, r]));
  const state = (j: Job) => {
    const r = seen.get(`${j.item.id}|${j.ready.judge.judge}|${j.template}`);
    if (!r || r.model !== j.ready.judge.model || r.upstream !== j.ready.judge.upstream) return "pending";
    return r.coded ? "coded" : r.attempts >= MAX_ATTEMPTS ? "failed" : "pending";
  };
  return { items, jobs, state };
}

async function saveCounts(db: D1Database, runId: string, p: Omit<Progress, "run" | "pending">, at: string) {
  await db.prepare(`INSERT INTO judge_runs (run_id, judges, items, jobs, coded, failed, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT (run_id) DO UPDATE SET judges = excluded.judges, items = excluded.items, jobs = excluded.jobs,
                      coded = excluded.coded, failed = excluded.failed, updated_at = excluded.updated_at`)
    .bind(runId, judgesSignature(), p.items, p.jobs, p.coded, p.failed, at).run();
}

// One answer saved. An answer from the judge pinned now never overwrites a
// code it already gave; a new pin starts its attempts again.
const saveCode = (db: D1Database, runId: string, job: Job, r: { result?: ChatResult; code?: unknown; raw?: string | null; error?: string | null; promptSha: string; at: string }) =>
  db.prepare(`INSERT INTO judge_codes (run_id, item, task, judge, template, model, upstream, model_reported, provider_reported, code, raw, error, attempts, prompt_sha, at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
              ON CONFLICT (run_id, item, judge, template) DO UPDATE SET
                task = excluded.task, model_reported = excluded.model_reported, provider_reported = excluded.provider_reported,
                code = excluded.code, raw = excluded.raw, error = excluded.error, prompt_sha = excluded.prompt_sha, at = excluded.at,
                attempts = CASE WHEN judge_codes.model = excluded.model AND judge_codes.upstream = excluded.upstream THEN judge_codes.attempts + 1 ELSE 1 END,
                model = excluded.model, upstream = excluded.upstream
              WHERE judge_codes.code IS NULL OR judge_codes.model <> excluded.model OR judge_codes.upstream <> excluded.upstream`)
    .bind(runId, job.item.id, job.item.task, job.ready.judge.judge, job.template, job.ready.judge.model, job.ready.judge.upstream,
      r.result?.modelReported ?? null, r.result?.providerReported ?? null, r.code === undefined ? null : JSON.stringify(r.code),
      r.raw ?? null, r.error ?? null, r.promptSha, r.at)
    .run();

async function pool<T>(items: T[], n: number, fn: (x: T) => Promise<void>) {
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (i < items.length) await fn(items[i++]);
  }));
}

export interface BatchResult {
  ok: boolean;
  error?: string;
  calls: number; // judge answers asked for in this batch
  coded: number;
  failed: number;
  done: boolean; // nothing left to do for the runs asked about
  runs: Progress[];
}

// One batch. target: one run by ID (a finished study, Study 2 or test run),
// or every run of a study set (the study unless set says "study2").
export async function judgeBatch(env: RunnerEnv, target: { run: string } | { all: true; set?: StudySet }, o: RunnerOptions = {}): Promise<BatchResult> {
  const db = env.DB;
  const now = o.now ?? (() => new Date());
  const fail = (error: string): BatchResult => ({ ok: false, error, calls: 0, coded: 0, failed: 0, done: false, runs: [] });

  // The runs, in play order.
  let runs: RunRow[] = [];
  if ("run" in target) {
    const run = await getRun(db, target.run);
    if (!run) return fail(`no run ${target.run}`);
    const why = await cannotJudge(db, run);
    if (why) return fail(why);
    runs = [run];
  } else {
    const set = target.set ?? "study";
    const left = await studyLeft(db, set);
    if (left) return fail(notYet(set, left));
    const { results } = await db.prepare("SELECT id FROM runs WHERE model_set = ? AND triple > 0 ORDER BY triple, rotation").bind(set).all<{ id: string }>();
    for (const { id } of results) {
      const run = await getRun(db, id);
      if (run && !(await cannotJudge(db, run))) runs.push(run);
    }
    if (!runs.length) return { ok: true, calls: 0, coded: 0, failed: 0, done: true, runs: [] };
  }

  // One batch at a time: two at once would ask for the same items twice and
  // take the same ledger seqs. The lock holds "<until>|<holder>": it can be
  // taken over only once it has expired, and only its holder releases it.
  const t = now();
  const holder = `${new Date(t.getTime() + LOCK_MS).toISOString()}|${crypto.randomUUID()}`;
  const lock = await db.prepare(`INSERT INTO meta (key, value) VALUES ('judge_lock', ?)
                                 ON CONFLICT (key) DO UPDATE SET value = excluded.value WHERE substr(meta.value, 1, 24) < ?`)
    .bind(holder, t.toISOString()).run();
  if (!lock.meta.changes) return fail("another judge batch is running; try again in a minute");

  try {
    const { ready, problems } = await preflight(db, o);
    if (problems.length) return fail(`can't judge: ${problems.join("; ")}`);

    const names = Object.fromEntries((await participants(db)).map((p) => [p.email, p.name]));
    const retry = o.retry ?? withRetry;
    let budget = o.maxCalls ?? BATCH_CALLS;
    let calls = 0, coded = 0, failed = 0;
    let stop: string | null = null; // a failure no other item would get past (credit, key, provider down)
    const progress: Progress[] = [];
    const sig = judgesSignature();

    for (const run of runs) {
      const saved = await db.prepare("SELECT judges, items, jobs, coded, failed FROM judge_runs WHERE run_id = ?").bind(run.id).first<Record<string, any>>();
      if (saved && saved.judges === sig && saved.coded + saved.failed >= saved.jobs) {
        progress.push({ run: run.id, items: saved.items, jobs: saved.jobs, coded: saved.coded, failed: saved.failed, pending: 0 });
        continue;
      }
      const { items, jobs, state } = await jobsOf(db, run, ready);
      const todo = budget > 0 && !stop ? jobs.filter((j) => state(j) === "pending").slice(0, budget) : [];
      budget -= todo.length;

      if (todo.length) {
        const runRef = { model_set: run.model_set, triple: run.triple, rotation: run.rotation };
        const keys: KeyCandidate[] = await keyChain(db, env.KEY_ENC_SECRET, "openrouter", 0, runRef);
        if (!keys.length) return fail("no participant has a working OpenRouter key");
        let seq = await nextSeq(db, run.id, 0);
        const at = () => now().toISOString();
        // A paid call is always recorded: if its seq is taken, the row goes
        // in at the next free one.
        const ledger = async (rec: CallRecord) => {
          try {
            await ledgerRow(db, run.id, 0, seq++, rec, names).run();
          } catch {
            seq = Math.max(seq, await nextSeq(db, run.id, 0));
            await ledgerRow(db, run.id, 0, seq++, rec, names).run();
          }
        };

        await pool(todo, CONCURRENCY, async (job) => {
          if (stop || now().getTime() - t.getTime() > START_WINDOW_MS) return;
          const { judge, jsonMode, price } = job.ready;
          const task = job.item.task;
          const user = userMessage(task, job.item.input, job.template);
          const req: ChatRequest = {
            model: judge.model, system: SYSTEM[job.template], messages: [{ role: "user", text: user }],
            maxOutputTokens: MAX_OUTPUT_TOKENS, json: { name: `tidewall_${task}`, schema: schemaFor(task, job.template) }, timeoutMs: CALL_TIMEOUT_MS,
          };
          const promptSha = await sha256(`${req.system}\n\n${user}`);
          const step = `judge_${task}${job.template === "alt" ? "_alt" : ""}`;
          const record = (k: KeyCandidate, x: Partial<CallRecord>): CallRecord => ({
            player: `judge-${judge.judge}` as CallRecord["player"], step, day: 0, provider: "openrouter", model: judge.model,
            modelReported: null, payer: k.email, fallbackKey: !k.owner, ok: false, stop: null, usage: null, error: null, latencyMs: null, ...x,
          });
          calls++;
          let lastError: unknown = null;
          for (const k of keys) {
            let result: ChatResult;
            try {
              result = await retry(() => callOpenRouter(k.key, req, { upstream: judge.upstream, temperature: TEMPERATURE, jsonMode }, { fetch: o.fetch }));
            } catch (err) {
              lastError = err;
              await ledger(record(k, { error: err instanceof Error ? err.message : String(err) }));
              if (err instanceof ProviderError && err.tryNextKey && err.kind !== "model_unavailable") continue;
              break;
            }
            // Never a call without a cost: OpenRouter's own figure, else its listed price.
            const cost = result.costUsd ?? result.usage.input * price.prompt + result.usage.output * price.completion;
            await ledger(record(k, {
              modelReported: result.modelReported, ok: true, stop: result.stop, usage: result.usage, latencyMs: result.latencyMs,
              requestId: result.requestId, stopDetail: result.stopDetail, costUsd: cost,
            }));
            const read = result.stop === "refused" ? { error: `refused: ${result.stopDetail}` }
              : result.stop === "max_tokens" ? { error: "cut off at the token limit" }
              : readCode(task, result.text);
            if ("code" in read) coded++;
            else failed++;
            await saveCode(db, run.id, job, { result, code: "code" in read ? read.code : undefined, raw: result.text, error: "error" in read ? read.error : null, promptSha, at: at() });
            return;
          }
          // No answer at all. A failure in the request or the answer counts as
          // an attempt at this item; one in the keys, the credit or the
          // provider stops the batch and costs the item nothing.
          const e = lastError;
          const itemFault = e instanceof ProviderError && (e.kind === "bad_request" || e.kind === "bad_response");
          if (itemFault) {
            failed++;
            await saveCode(db, run.id, job, { error: e.message, promptSha, at: at() });
          } else {
            calls--;
            stop = e instanceof Error ? e.message : String(e);
          }
        });
      }

      // Counts for the run, from the table.
      const after = await jobsOf(db, run, ready);
      const c = { items: items.length, jobs: jobs.length, coded: after.jobs.filter((j) => after.state(j) === "coded").length, failed: after.jobs.filter((j) => after.state(j) === "failed").length };
      await saveCounts(db, run.id, c, now().toISOString());
      progress.push({ run: run.id, ...c, pending: c.jobs - c.coded - c.failed });
      if (budget <= 0 || stop) break;
    }

    const pending = progress.reduce((s, p) => s + p.pending, 0);
    const done = !stop && pending === 0 && progress.length === runs.length;
    if (calls) await log(db, `Judges: ${coded} codes saved, ${failed} failed, in ${calls} calls (${progress.map((p) => `${p.run} ${p.coded + p.failed}/${p.jobs}`).join(", ")}).`);
    return { ok: !stop, ...(stop ? { error: `stopped: ${stop}` } : {}), calls, coded, failed, done, runs: progress };
  } finally {
    await db.prepare("DELETE FROM meta WHERE key = 'judge_lock' AND value = ?").bind(holder).run();
  }
}

// What Control shows without spending: the preflight and each run's counts.
export async function judgeStatus(db: D1Database, o: RunnerOptions = {}) {
  const { ready, problems } = await preflight(db, o);
  const { results } = await db.prepare("SELECT run_id, judges, items, jobs, coded, failed, updated_at FROM judge_runs ORDER BY run_id").all<Record<string, any>>();
  const sig = judgesSignature();
  return {
    judges: JUDGE_MODELS.map((j) => ({ ...j, ...(ready.find((r) => r.judge.judge === j.judge) ? { json: ready.find((r) => r.judge.judge === j.judge)!.jsonMode, price: ready.find((r) => r.judge.judge === j.judge)!.price } : {}) })),
    problems,
    runs: results.map((r) => ({ run: r.run_id, items: r.items, jobs: r.jobs, coded: r.coded, failed: r.failed, current: r.judges === sig, updated_at: r.updated_at })),
  };
}

