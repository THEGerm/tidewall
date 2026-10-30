// Plays the next day of a run with model players, then saves the day and
// its ledger in one batch. Checks first, and pauses the run with a reason
// instead of playing a day it can't play properly:
//   - a seat's model isn't pinned yet, or its price isn't set
//   - nobody has a key for a provider the run needs
//   - the study's spending cap is reached
// A lock on the run stops two scheduler ticks playing the same day.

import { PLAYERS, type PlayerName } from "./config";
import { playDay, type DayResult } from "./day";
import { getRun, saveDay, setStatus, yesterday, type RunRow } from "./store";
import type { Player } from "./types";
import { ledgerStatements, studySpend } from "../ledger/ledger";
import { priceOf } from "../ledger/pricing";
import type { callModel } from "../providers";
import { keyChain, participants } from "../players/keys";
import { modelPlayer, type CallRecord } from "../players/model";
import { MODELS, isPinned, type Family } from "../players/models";
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
  | { played: true; day: number; over: boolean; calls: number }
  | { played: false; reason: string };

async function meta(db: D1Database, key: string): Promise<string | null> {
  return (await db.prepare("SELECT value FROM meta WHERE key = ?").bind(key).first<{ value: string }>())?.value ?? null;
}

// Why the run can't play today, or null if it can.
export async function blocker(env: RunnerEnv, run: RunRow, day: number): Promise<string | null> {
  for (const seat of ["Government", "Criminals", "World"] as const) {
    const family = run.seating[seat] as Family;
    const m = MODELS[family];
    if (!m) return `unknown model family "${family}" in the ${seat} seat`;
    if (!isPinned(family)) return `${family} model ID not pinned yet (players/models.ts)`;
    if (!priceOf(m.model)) return `no price set for ${m.model} (ledger/pricing.ts)`;
    if ((await keyChain(env.DB, env.KEY_ENC_SECRET, m.provider, day)).length === 0) return `nobody has a ${m.provider} key`;
  }
  const cap = Number((await meta(env.DB, "cap_usd")) ?? "0");
  const spend = await studySpend(env.DB);
  if (spend.unpriced > 0) return `${spend.unpriced} ledger rows have no price`;
  if (spend.usd >= cap) return `spending cap reached: $${spend.usd.toFixed(2)} of $${cap}`;
  return null;
}

export async function playNextDay(env: RunnerEnv, runId: string, o: RunnerOptions = {}): Promise<StepOutcome> {
  const now = o.now ?? (() => new Date());
  const run = await getRun(env.DB, runId);
  if (!run) return { played: false, reason: `no run ${runId}` };
  if (run.status !== "running") return { played: false, reason: `run is ${run.status}` };

  // Take the lock, or give way to a tick that already holds it.
  const until = new Date(now().getTime() + (o.lockMinutes ?? 14) * 60_000).toISOString();
  const lock = await env.DB.prepare("UPDATE runs SET lock_until = ? WHERE id = ? AND (lock_until IS NULL OR lock_until < ?)")
    .bind(until, runId, now().toISOString()).run();
  if (!lock.meta?.changes) return { played: false, reason: "another tick is playing this run" };

  try {
    const day = run.state.day;
    const why = await blocker(env, run, day);
    if (why) {
      await setStatus(env.DB, runId, "paused", why);
      return { played: false, reason: why };
    }

    const calls: CallRecord[] = [];
    const prompts = o.prompts ?? placeholderPrompts;
    const players = Object.fromEntries(PLAYERS.map((name) => {
      const m = MODELS[run.seating[SEAT_OF[name]] as Family];
      return [name, modelPlayer({
        name, provider: m.provider, model: m.model, prompts,
        keys: (d) => keyChain(env.DB, env.KEY_ENC_SECRET, m.provider, d),
        onCall: (r) => { calls.push(r); },
        ...(o.call ? { call: o.call } : {}),
        ...(o.retry ? { retry: o.retry } : {}),
      })];
    })) as Record<PlayerName, Player>;

    const y = await yesterday(env.DB, runId, day);
    const result: DayResult = await playDay({ state: run.state, players, ...y });
    const names = Object.fromEntries((await participants(env.DB)).map((p) => [p.email, p.name]));
    await saveDay(env.DB, runId, result, [], ledgerStatements(env.DB, runId, day, calls, names));
    return { played: true, day, over: result.state.over, calls: calls.length };
  } finally {
    await env.DB.prepare("UPDATE runs SET lock_until = NULL WHERE id = ?").bind(runId).run();
  }
}

// One scheduler tick: if the schedule is on, play one day of the running run,
// or start the next ready run (by triple, then rotation) when none is running.
export async function tick(env: RunnerEnv, o: RunnerOptions = {}): Promise<StepOutcome> {
  if ((await meta(env.DB, "schedule")) !== "on") return { played: false, reason: "schedule is off" };
  let current = await env.DB.prepare("SELECT id FROM runs WHERE status = 'running' ORDER BY triple, rotation LIMIT 1").first<{ id: string }>();
  if (!current) {
    if (await env.DB.prepare("SELECT id FROM runs WHERE status = 'paused' LIMIT 1").first()) return { played: false, reason: "a run is paused" };
    current = await env.DB.prepare("SELECT id FROM runs WHERE status = 'ready' ORDER BY triple, rotation LIMIT 1").first<{ id: string }>();
    if (!current) return { played: false, reason: "no run left to play" };
    await setStatus(env.DB, current.id, "running");
  }
  return playNextDay(env, current.id, o);
}
