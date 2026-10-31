// Plays the next day of a run with model players, then saves the day and
// its ledger in one batch. Checks first, and pauses the run with a reason
// instead of playing a day it can't play properly:
//   - a seat's model isn't pinned yet, or its price isn't set
//   - nobody has a key for a provider the run needs
//   - the study's spending cap is reached
// A lock on the run stops two scheduler ticks playing the same day.
// Every call is written to the ledger as it returns, and every outcome to the
// Control page's log.

import { PLAYERS, type PlayerName } from "./config";
import { playDay, type DayResult } from "./day";
import { getRun, saveDay, setStatus, yesterday, type RunRow } from "./store";
import type { Player } from "./types";
import { ledgerRow, markDaySaved, nextSeq, studySpend } from "../ledger/ledger";
import { log } from "./log";
import { costOf, priceOf } from "../ledger/pricing";
import type { callModel } from "../providers";
import { keyChain, participants } from "../players/keys";
import { modelPlayer, type CallRecord } from "../players/model";
import { EFFORT, isPinned, modelsFor, type Family } from "../players/models";
import { placeholderPrompts, type Prompts } from "../players/prompts";

export interface RunnerEnv {
  DB: D1Database;
  KEY_ENC_SECRET: string;
}

export interface RunnerOptions {
  call?: typeof callModel; // injected in tests
  retry?: <T>(fn: () => Promise<T>) => Promise<T>;
  prompts?: Prompts;
  now?: () => Date;
  lockMinutes?: number;
}

const SEAT_OF: Record<PlayerName, "Government" | "Criminals" | "World"> = {
  Council: "Government", Chief: "Government", Families: "Criminals", Saltdogs: "Criminals", World: "World",
};

export type StepOutcome =
  | { played: true; day: number; over: boolean; calls: number; costUsd: number; seconds: number; fallbacks: number }
  | { played: false; reason: string };

async function meta(db: D1Database, key: string): Promise<string | null> {
  return (await db.prepare("SELECT value FROM meta WHERE key = ?").bind(key).first<{ value: string }>())?.value ?? null;
}

// Why the run can't play today, or null if it can.
export async function blocker(env: RunnerEnv, run: RunRow, day: number): Promise<string | null> {
  for (const seat of ["Government", "Criminals", "World"] as const) {
    const family = run.seating[seat] as Family;
    const m = modelsFor(run.model_set)[family];
    if (!m) return `unknown model family "${family}" in the ${seat} seat`;
    if (!isPinned(family, run.model_set)) return `${family} model ID not pinned yet (players/models.ts)`;
    if (!priceOf(m.model)) return `no price set for ${m.model} (ledger/pricing.ts)`;
    if ((await keyChain(env.DB, env.KEY_ENC_SECRET, m.provider, day)).length === 0) return `nobody has a ${m.provider} key`;
  }
  const cap = Number((await meta(env.DB, "cap_usd")) ?? "0");
  const spend = await studySpend(env.DB);
  if (spend.unpriced > 0) return `${spend.unpriced} ledger rows have no price`;
  if (spend.usd >= cap) return `spending cap reached: $${spend.usd.toFixed(2)} of $${cap}`;
  return null;
}

export async function playNextDay(env: RunnerEnv, runId: string, o: RunnerOptions = {}, why: "step" | "schedule" = "step"): Promise<StepOutcome> {
  const now = o.now ?? (() => new Date());
  const run = await getRun(env.DB, runId);
  if (!run) return { played: false, reason: `no run ${runId}` };
  if (run.status !== "running") return { played: false, reason: `run is ${run.status}` };

  // Take the lock, or give way to a tick that already holds it.
  const until = new Date(now().getTime() + (o.lockMinutes ?? 14) * 60_000).toISOString();
  const lock = await env.DB.prepare("UPDATE runs SET lock_until = ? WHERE id = ? AND (lock_until IS NULL OR lock_until < ?)")
    .bind(until, runId, now().toISOString()).run();
  if (!lock.meta?.changes) return { played: false, reason: "another tick is playing this run" };

  const day = run.state.day;
  const started = Date.now();
  let calls = 0;
  let cost = 0;
  try {
    const blocked = await blocker(env, run, day);
    if (blocked) {
      await setStatus(env.DB, runId, "paused", blocked);
      await log(env.DB, `${runId} paused before day ${day}: ${blocked}.`, { run: runId, level: "warn" });
      return { played: false, reason: blocked };
    }
    await log(env.DB, `Playing day ${day} of ${runId} (${why === "step" ? "Step" : "schedule"}).`, { run: runId });

    const names = Object.fromEntries((await participants(env.DB)).map((p) => [p.email, p.name]));
    const base = await nextSeq(env.DB, runId, day);
    const record = async (r: CallRecord) => {
      const seq = base + calls++;
      cost += (r.usage && costOf(r.model, r.usage)) || 0;
      await ledgerRow(env.DB, runId, day, seq, r, names).run();
    };
    const prompts = o.prompts ?? placeholderPrompts;
    const players = Object.fromEntries(PLAYERS.map((name) => {
      const m = modelsFor(run.model_set)[run.seating[SEAT_OF[name]] as Family];
      return [name, modelPlayer({
        name, provider: m.provider, model: m.model, prompts, effort: EFFORT,
        keys: (d) => keyChain(env.DB, env.KEY_ENC_SECRET, m.provider, d),
        onCall: record,
        ...(o.call ? { call: o.call } : {}),
        ...(o.retry ? { retry: o.retry } : {}),
      })];
    })) as Record<PlayerName, Player>;

    const y = await yesterday(env.DB, runId, day);
    const result: DayResult = await playDay({ state: run.state, players, ...y });
    await saveDay(env.DB, runId, result, result.confidant, [markDaySaved(env.DB, runId, day, base)]);
    const seconds = Math.round((Date.now() - started) / 1000);
    const fallbacks = result.records.filter((r) => r.source === "fallback").length;
    await log(env.DB,
      `Day ${day} of ${runId} played: ${calls} calls, $${cost.toFixed(3)}, ${seconds} s, ${fallbacks ? `${fallbacks} fallback${fallbacks > 1 ? "s" : ""}` : "no fallbacks"}.` +
        (result.state.over ? ` The run is over${result.state.truncated ? " (hidden cap)" : ""}.` : ""),
      { run: runId, level: fallbacks ? "warn" : "info" });
    // A seat that failed with an error (not a refusal or a bad answer) would
    // fall back again tomorrow: pause the run so a person looks.
    const failed = result.records.find((r) => r.source === "fallback" && r.reason === "error");
    if (failed && !result.state.over) {
      const why = `${failed.player} could not play (${failed.step}): ${failed.errors?.[0] ?? "error"}`;
      await setStatus(env.DB, runId, "paused", why);
      await log(env.DB, `${runId} paused after day ${day}. ${why}. Fix it, then press Resume.`, { run: runId, level: "error" });
    }
    return { played: true, day, over: result.state.over, calls, costUsd: cost, seconds, fallbacks };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await log(env.DB, `Day ${day} of ${runId} failed: ${msg}. ${calls} calls were made and are in the ledger; the day will be played again.`, { run: runId, level: "error" }).catch(() => {});
    return { played: false, reason: `day ${day} failed: ${msg}` };
  } finally {
    await env.DB.prepare("UPDATE runs SET lock_until = NULL WHERE id = ?").bind(runId).run();
  }
}

// One scheduler tick, every minute:
//   1. a Step queued from the Control page plays first, schedule or not;
//   2. with the schedule on, the running run (or the next ready one) plays a
//      day once pace_minutes have passed since the last day was saved.
export async function tick(env: RunnerEnv, o: RunnerOptions = {}): Promise<StepOutcome> {
  const now = o.now ?? (() => new Date());
  const queued = await env.DB.prepare("SELECT id FROM runs WHERE step_queued > 0 AND status = 'running' ORDER BY triple, rotation LIMIT 1").first<{ id: string }>();
  if (queued) {
    const out = await playNextDay(env, queued.id, o, "step");
    if (out.played || out.reason !== "another tick is playing this run")
      await env.DB.prepare("UPDATE runs SET step_queued = 0 WHERE id = ?").bind(queued.id).run();
    return out;
  }

  if ((await meta(env.DB, "schedule")) !== "on") return { played: false, reason: "schedule is off" };
  const pace = Number((await meta(env.DB, "pace_minutes")) ?? "10");
  const last = await env.DB.prepare("SELECT MAX(created_at) AS at FROM days").first<{ at: string | null }>();
  if (last?.at && now().getTime() - Date.parse(last.at) < pace * 60_000) return { played: false, reason: "next day not due yet" };

  let current = await env.DB.prepare("SELECT id FROM runs WHERE status = 'running' ORDER BY triple, rotation LIMIT 1").first<{ id: string }>();
  if (!current) {
    if (await env.DB.prepare("SELECT id FROM runs WHERE status = 'paused' LIMIT 1").first()) return { played: false, reason: "a run is paused" };
    current = await env.DB.prepare("SELECT id FROM runs WHERE status = 'ready' ORDER BY triple, rotation LIMIT 1").first<{ id: string }>();
    if (!current) return { played: false, reason: "no run left to play" };
    await setStatus(env.DB, current.id, "running");
    await log(env.DB, `Schedule started ${current.id}.`, { run: current.id });
  }
  return playNextDay(env, current.id, o, "schedule");
}
