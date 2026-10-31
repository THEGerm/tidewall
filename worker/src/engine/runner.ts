// Plays the next day of a run with model players, then saves the day and
// its ledger in one batch. Checks first, and pauses the run with a reason
// instead of playing a day it can't play properly:
//   - a seat's model isn't pinned yet, or its price isn't set
//   - nobody has a key for a provider the run needs
//   - the study's spending cap is reached
// A lock on the run stops two scheduler ticks playing the same day.
// A day where a seat failed with an error (not a refusal or a bad answer) is
// not saved: its fallback moves would be the system's, not the model's. It is
// played again at the next tick, and after MAX_ATTEMPTS the run pauses.
// Every call is written to the ledger as it returns, and every outcome to the
// Control page's log.

import { PLAYERS, type PlayerName } from "./config";
import { playDay, type DayResult } from "./day";
import { getRun, saveDay, setStatus, yesterday, type RunRow } from "./store";
import type { Player } from "./types";
import { ledgerRow, markDaySaved, nextSeq, responseRow, studySpend } from "../ledger/ledger";
import { log } from "./log";
import { costOf, priceOf } from "../ledger/pricing";
import type { callModel } from "../providers";
import { keyChain, participants } from "../players/keys";
import { modelPlayer, type CallRecord } from "../players/model";
import { EFFORT, isPinned, modelsFor, type Family } from "../players/models";
import { interimPrompts, type Prompts } from "../players/prompts";
import { equilibriumPlayers } from "../players/bots";

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

// Cron ticks run wherever Cloudflare has room, and some places are refused by
// a provider (004-germ day 21: Google and Anthropic both said the location
// was not supported). The next tick usually runs elsewhere.
export const MAX_ATTEMPTS = 3;

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
      if (r.text != null) await responseRow(env.DB, runId, day, seq, r).run();
    };
    const prompts = o.prompts ?? interimPrompts;
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
    const failed = result.records.find((r) => r.source === "fallback" && r.reason === "error");
    if (failed) {
      const why = `${failed.player} could not play (${failed.step}): ${failed.errors?.[0] ?? "error"}`;
      const attempts = (run.day_attempts ?? 0) + 1;
      if (attempts >= MAX_ATTEMPTS) {
        await env.DB.prepare("UPDATE runs SET day_attempts = 0 WHERE id = ?").bind(runId).run();
        await setStatus(env.DB, runId, "paused", why);
        await log(env.DB, `${runId} paused: day ${day} failed ${attempts} times and was not saved. ${why}. Fix it, then press Resume.`, { run: runId, level: "error" });
      } else {
        await env.DB.prepare("UPDATE runs SET day_attempts = ? WHERE id = ?").bind(attempts, runId).run();
        await log(env.DB, `Day ${day} of ${runId} not saved (attempt ${attempts} of ${MAX_ATTEMPTS}): ${why}. It plays again at the next tick; its ${calls} calls stay in the ledger.`, { run: runId, level: "warn" });
      }
      return { played: false, reason: `day ${day} not saved: ${why}` };
    }
    await saveDay(env.DB, runId, result, result.confidant, [markDaySaved(env.DB, runId, day, base)]);
    const seconds = Math.round((Date.now() - started) / 1000);
    const fallbacks = result.records.filter((r) => r.source === "fallback").length;
    await log(env.DB,
      `Day ${day} of ${runId} played: ${calls} calls, $${cost.toFixed(3)}, ${seconds} s, ${fallbacks ? `${fallbacks} fallback${fallbacks > 1 ? "s" : ""}` : "no fallbacks"}.` +
        (result.state.over ? ` The run is over${result.state.truncated ? " (hidden cap)" : ""}.` : ""),
      { run: runId, level: fallbacks ? "warn" : "info" });
    if (run.day_attempts) await env.DB.prepare("UPDATE runs SET day_attempts = 0 WHERE id = ?").bind(runId).run();
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
  const queued = await env.DB.prepare("SELECT id FROM runs WHERE step_queued > 0 AND status = 'running' AND model_set != 'bot' ORDER BY triple, rotation LIMIT 1").first<{ id: string }>();
  if (queued) {
    const out = await playNextDay(env, queued.id, o, "step");
    if (out.played || out.reason !== "another tick is playing this run")
      await env.DB.prepare("UPDATE runs SET step_queued = 0 WHERE id = ?").bind(queued.id).run();
    return out;
  }

  if ((await meta(env.DB, "schedule")) !== "on") return { played: false, reason: "schedule is off" };
  const pace = Number((await meta(env.DB, "pace_minutes")) ?? "10");
  const last = await env.DB.prepare("SELECT MAX(d.created_at) AS at FROM days d JOIN runs r ON r.id = d.run_id WHERE r.model_set != 'bot'").first<{ at: string | null }>();
  if (last?.at && now().getTime() - Date.parse(last.at) < pace * 60_000) return { played: false, reason: "next day not due yet" };

  let current = await env.DB.prepare("SELECT id FROM runs WHERE status = 'running' AND model_set != 'bot' ORDER BY triple, rotation LIMIT 1").first<{ id: string }>();
  if (!current) {
    if (await env.DB.prepare("SELECT id FROM runs WHERE status = 'paused' AND model_set != 'bot' LIMIT 1").first()) return { played: false, reason: "a run is paused" };
    current = await env.DB.prepare("SELECT id FROM runs WHERE status = 'ready' AND model_set != 'bot' ORDER BY triple, rotation LIMIT 1").first<{ id: string }>();
    if (!current) return { played: false, reason: "no run left to play" };
    await setStatus(env.DB, current.id, "running");
    await log(env.DB, `Schedule started ${current.id}.`, { run: current.id });
  }
  return playNextDay(env, current.id, o, "schedule");
}

// Bot runs (Germ, 31 Oct): the equilibrium bots, no model calls, no pace.
// Every scheduler tick plays running bot runs back to back until its time is
// up; the next tick carries on. They never wait on, or hold up, a model run.
// Each day's bots draw from the run's seed and the day, so a bot run replays
// exactly. Logged at the start, every 1,000 days and at the end.
export async function playBots(env: RunnerEnv, o: { budgetMs?: number; now?: () => number } = {}): Promise<{ days: number; runs: string[] }> {
  const now = o.now ?? (() => Date.now());
  const stop = now() + (o.budgetMs ?? 20_000);
  let days = 0;
  const runs: string[] = [];
  const bots = (await env.DB.prepare("SELECT id FROM runs WHERE model_set = 'bot' AND status = 'running' ORDER BY created_at").all<{ id: string }>()).results;
  for (const { id } of bots) {
    const lock = await env.DB.prepare("UPDATE runs SET lock_until = ? WHERE id = ? AND (lock_until IS NULL OR lock_until < ?)")
      .bind(new Date(stop + 60_000).toISOString(), id, new Date().toISOString()).run();
    if (!lock.meta?.changes) continue; // another tick has it
    runs.push(id);
    try {
      while (now() < stop) {
        const run = (await getRun(env.DB, id))!;
        if (run.status !== "running") break;
        const day = run.state.day;
        if (day === 1) await log(env.DB, `Bots started ${id}${run.state.fixedDays ? ` (${run.state.fixedDays.toLocaleString("en")} days)` : ""}.`, { run: id });
        const result = await playDay({ state: run.state, players: equilibriumPlayers(`${run.seed}:${day}`, { audit: true, turf: run.state.botTurf ?? "respect" }), publicYesterday: [], wireYesterday: [] });
        await saveDay(env.DB, id, result);
        days++;
        if (result.state.over) { await log(env.DB, `Bots finished ${id} after ${day.toLocaleString("en")} days.`, { run: id }); break; }
        if (day % 1000 === 0) await log(env.DB, `Bots on ${id}: ${day.toLocaleString("en")} days played.`, { run: id });
      }
    } catch (err) {
      await log(env.DB, `Bots on ${id} stopped: ${err instanceof Error ? err.message : String(err)}. The next tick tries again.`, { run: id, level: "error" }).catch(() => {});
    } finally {
      await env.DB.prepare("UPDATE runs SET lock_until = NULL WHERE id = ?").bind(id).run();
    }
    if (now() >= stop) break;
  }
  return { days, runs };
}
