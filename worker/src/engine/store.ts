// Runs and days in D1. A day is written in one batch, which D1 runs as a
// transaction, so a run never holds half a day. Reading back gives the
// engine everything it needs to play the next day; exportRun gives the
// analysis side the whole run as one JSON object.

import * as C from "./config";
import { PLAYERS, type PlayerName } from "./config";
import { EFFORT, modelsFor } from "../players/models";
import type { DayResult } from "./day";
import { newGame } from "./resolve";
import type { DiaryEntry, Event, GameState, WireItem } from "./types";

export const RULES_VERSION = "draft-3";

export type Status = "ready" | "running" | "paused" | "over" | "truncated";

export interface Seating {
  Government: string;
  Criminals: string;
  World: string;
}

// study and test runs call models; bot runs play the equilibrium bots, free,
// at their own speed (runner.ts playBots).
export type RunSet = "study" | "test" | "bot";

export interface RunRow {
  id: string;
  model_set: RunSet;
  seed: string;
  triple: number;
  rotation: 1 | 2 | 3;
  seating: Seating;
  rules_version: string;
  status: Status;
  state: GameState;
  day_attempts?: number; // unsaved attempts at the current day (runner.ts)
}

export interface ConfidantRow {
  player: PlayerName;
  window: "before" | "after";
  text: string | null;
  reply: string;
}

const now = () => new Date().toISOString();
const json = (v: unknown) => JSON.stringify(v);

export async function createRun(db: D1Database, run: { id: string; seed: string; triple: number; rotation: 1 | 2 | 3; seating: Seating; model_set?: RunSet; fixed_days?: number; bot_turf?: "encroach" }): Promise<RunRow> {
  const modelSet = run.model_set ?? "study";
  const state = newGame(run.seed, run.fixed_days, run.bot_turf);
  const t = now();
  await db
    .prepare("INSERT INTO runs (id, seed, triple, rotation, seating, rules_version, status, state, created_at, updated_at, model_set) VALUES (?, ?, ?, ?, ?, ?, 'ready', ?, ?, ?, ?)")
    .bind(run.id, run.seed, run.triple, run.rotation, json(run.seating), RULES_VERSION, json(state), t, t, modelSet)
    .run();
  return { ...run, model_set: modelSet, rules_version: RULES_VERSION, status: "ready", state };
}

export async function getRun(db: D1Database, id: string): Promise<RunRow | null> {
  const r = await db.prepare("SELECT * FROM runs WHERE id = ?").bind(id).first<Record<string, any>>();
  if (!r) return null;
  return { id: r.id, model_set: r.model_set ?? "study", seed: r.seed, triple: r.triple, rotation: r.rotation, seating: JSON.parse(r.seating), rules_version: r.rules_version, status: r.status, state: JSON.parse(r.state), day_attempts: r.day_attempts ?? 0 };
}

export async function setStatus(db: D1Database, id: string, status: Status, reason: string | null = null) {
  await db.prepare("UPDATE runs SET status = ?, pause_reason = ?, updated_at = ? WHERE id = ?").bind(status, reason, now(), id).run();
}

// The secret events a player may see the morning after (rules section 4,
// #108): the Chief its bribe offers and answers and its empty inspections;
// the Council its clean audits (a caught one is public); each gang its own
// offers and the answers to them. The World sees none.
export function secretsFor(player: PlayerName, events: Event[]): Event[] {
  const gangOf = (e: Event) => (e.detail as { gang?: string } | undefined)?.gang ?? e.actor;
  return events.filter((e) => {
    if (e.public) return false;
    if (player === "Chief") return e.kind.startsWith("bribe_") || e.kind === "inspection_empty";
    if (player === "Council") return e.kind === "audit_clean";
    if (player === "Families" || player === "Saltdogs") return e.kind.startsWith("bribe_") && gangOf(e) === player;
    return false;
  });
}

// What the next day needs from the days before: yesterday's public events and
// Wire, each player's own secret results from yesterday, and each player's
// kept diary entries (its memory).
export async function yesterday(db: D1Database, runId: string, day: number): Promise<{ publicYesterday: Event[]; wireYesterday: WireItem[]; notebooks: Partial<Record<PlayerName, DiaryEntry[]>>; privateYesterday: Partial<Record<PlayerName, Event[]>> }> {
  if (day <= 1) return { publicYesterday: [], wireYesterday: [], notebooks: {}, privateYesterday: {} };
  const kept = await db.prepare("SELECT day, player, text FROM diaries WHERE run_id = ? AND day < ? AND forgotten_on IS NULL AND text <> '' ORDER BY day").bind(runId, day).all<{ day: number; player: PlayerName; text: string }>();
  const notebooks: Partial<Record<PlayerName, DiaryEntry[]>> = {};
  for (const r of kept.results) (notebooks[r.player] ??= []).push({ day: r.day, text: r.text });
  const all = (await db.prepare("SELECT * FROM events WHERE run_id = ? AND day = ? ORDER BY rowid").bind(runId, day - 1).all<Record<string, any>>()).results.map(rowToEvent);
  const wi = await db.prepare("SELECT headline, text, events FROM wire WHERE run_id = ? AND day = ? ORDER BY seq").bind(runId, day - 1).all<Record<string, any>>();
  return {
    publicYesterday: all.filter((e) => e.public),
    privateYesterday: Object.fromEntries(PLAYERS.map((p) => [p, secretsFor(p, all)]).filter(([, e]) => (e as Event[]).length)),
    wireYesterday: wi.results.map((w) => ({ headline: w.headline, text: w.text, events: JSON.parse(w.events) })),
    notebooks,
  };
}

function rowToEvent(e: Record<string, any>): Event {
  return {
    id: e.id, kind: e.kind, public: !!e.public,
    ...(e.district ? { district: e.district } : {}),
    ...(e.actor ? { actor: e.actor } : {}),
    ...(e.detail ? { detail: JSON.parse(e.detail) } : {}),
  };
}

// Saves one played day and the run's new state, all or nothing. Refuses a
// day out of order, so a retried request can't write a day twice.
export async function saveDay(db: D1Database, runId: string, r: DayResult, confidant: ConfidantRow[] = r.confidant ?? [], extra: D1PreparedStatement[] = []): Promise<void> {
  const run = await getRun(db, runId);
  if (!run) throw new Error(`no run ${runId}`);
  if (run.state.day !== r.day || run.status === "over" || run.status === "truncated") {
    throw new Error(`run ${runId} expects day ${run.state.day} (status ${run.status}), got day ${r.day}`);
  }
  const t = now();
  const d = r.day;
  const s: D1PreparedStatement[] = [];
  const q = (sql: string, ...v: unknown[]) => s.push(db.prepare(sql).bind(...v));

  q("INSERT INTO days (run_id, day, nature, open, moves, delta, welfare, ended, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    runId, d, json(r.nature), json(r.open), json(r.moves), json(r.delta), r.welfare, r.state.over ? 1 : 0, t);
  for (const e of r.events)
    q("INSERT INTO events (run_id, day, id, kind, public, district, actor, detail) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      runId, d, e.id, e.kind, e.public ? 1 : 0, e.district ?? null, e.actor ?? null, e.detail ? json(e.detail) : null);
  // A bot run keeps only the days and events: bots give no answers worth
  // keeping, flat forecasts and empty diaries, so a 10,000-day run stays small.
  const lean = run.model_set === "bot";
  if (!lean) {
  for (const a of r.records)
    q("INSERT INTO answers (run_id, day, player, step, source, reason, errors) VALUES (?, ?, ?, ?, ?, ?, ?)",
      runId, d, a.player, a.step, a.source, a.reason ?? null, a.errors ? json(a.errors) : null);
  r.messages.forEach((m, i) =>
    q("INSERT INTO messages (run_id, day, seq, from_player, to_player, text) VALUES (?, ?, ?, ?, ?, ?)", runId, d, i, m.from, m.to, m.text));
  for (const [p, f] of Object.entries(r.forecasts))
    q("INSERT INTO forecasts (run_id, day, player, forecasts) VALUES (?, ?, ?, ?)", runId, d, p, json(f));
  for (const [p, text] of Object.entries(r.diaries))
    q("INSERT INTO diaries (run_id, day, player, text) VALUES (?, ?, ?, ?)", runId, d, p, text);
  for (const [p, days] of Object.entries(r.forgotten ?? {}))
    for (const fd of days ?? []) q("UPDATE diaries SET forgotten_on = ? WHERE run_id = ? AND player = ? AND day = ? AND forgotten_on IS NULL", d, runId, p, fd);
  r.wire.forEach((w, i) =>
    q("INSERT INTO wire (run_id, day, seq, headline, text, events) VALUES (?, ?, ?, ?, ?, ?)", runId, d, i, w.headline, w.text, json(w.events)));
  for (const c of confidant)
    q("INSERT INTO confidant (run_id, day, player, window, text, reply) VALUES (?, ?, ?, ?, ?, ?)", runId, d, c.player, c.window, c.text, c.reply);
  }

  s.push(...extra);
  const status: Status = r.state.over ? (r.state.truncated ? "truncated" : "over") : "running";
  q("UPDATE runs SET state = ?, status = ?, pause_reason = NULL, updated_at = ? WHERE id = ?", json(r.state), status, t, runId);
  await db.batch(s);
}

// The whole run as one object, for data/runs/ and the analysis loader.
export async function exportRun(db: D1Database, runId: string) {
  const run = await getRun(db, runId);
  if (!run) throw new Error(`no run ${runId}`);
  const all = async (table: string) =>
    (await db.prepare(`SELECT * FROM ${table} WHERE run_id = ? ORDER BY day, rowid`).bind(runId).all<Record<string, any>>()).results;
  const [days, events, answers, messages, forecasts, diaries, wire, confidant] = await Promise.all(
    ["days", "events", "answers", "messages", "forecasts", "diaries", "wire", "confidant"].map(all),
  );
  const parse = (v: unknown) => (typeof v === "string" ? JSON.parse(v) : v);
  const ledger = (await db.prepare(
    `SELECT day, seq, player, step, provider, model, model_reported, payer_name, fallback_key, ok, stop, stop_detail,
            input, cached_input, cache_write, output, reasoning, cost_usd, error, latency_ms, day_saved, at, request_id
     FROM ledger WHERE run_id = ? ORDER BY day, seq`).bind(runId).all<Record<string, any>>()).results;
  // Each answer's calls: a player makes one answer per step per day, so the
  // saved ledger rows with the same day, player and step are its calls (#67).
  const callsOf = new Map<string, number[]>();
  for (const l of ledger) if (l.day_saved) {
    const k = `${l.day}|${l.player}|${l.step}`;
    callsOf.set(k, [...(callsOf.get(k) ?? []), l.seq]);
  }
  // Why the run ended (#67): the end draw, the hidden cap, or a person's End.
  const raw = await db.prepare("SELECT pause_reason, created_at, updated_at FROM runs WHERE id = ?").bind(runId).first<Record<string, any>>();
  const last = days.at(-1);
  const ended =
    run.status === "running" || run.status === "paused" || run.status === "ready" ? null
      : run.state.truncated ? `hidden cap: day ${last?.day} was the last allowed`
      : last?.ended ? `end draw after day ${last.day}`
      : raw?.pause_reason ?? "stopped";
  const crimes = new Map<number, number>();
  for (const e of events) if (e.kind === "crime") crimes.set(e.day, (crimes.get(e.day) ?? 0) + 1);
  const pace = await db.prepare("SELECT value FROM meta WHERE key = 'pace_minutes'").first<{ value: string }>();
  const models = modelsFor(run.model_set);
  return {
    run: {
      ...run, state: undefined, day_attempts: undefined,
      end_reason: ended,
      truncated: !!run.state.truncated,
      created_at: raw?.created_at ?? null,
      updated_at: raw?.updated_at ?? null,
      pace_minutes: pace ? Number(pace.value) : null,
      // The model each seat played, as pinned in the code when exported.
      models: run.model_set === "bot"
        ? { all: `equilibrium bots (src/players/bots.ts), no model calls; Council audits at the 10% line; gangs ${run.state.botTurf ?? "respect"}` }
        : Object.fromEntries(Object.entries(run.seating).map(([seat, family]) => [seat, { family, ...models[family as keyof typeof models], effort: EFFORT }])),
    },
    // The game's parameters, so the analysis need not hard-code them (#67).
    game: {
      districts: C.DISTRICTS, turf: C.TURF, start: C.START, chief_salary: C.CHIEF_SALARY,
      crime_gain: C.CRIME_GAIN, crime_damage: C.CRIME_DAMAGE, fine: C.FINE, inspection_cost: C.INSPECTION_COST,
      chief_counts_damage: C.CHIEF_COUNTS_DAMAGE, arrest_cap: C.ARREST_CAP, prison_places: C.PRISON_PLACES, sentence_days: C.SENTENCE_DAYS,
      turf_payoffs: { R: C.TURF_R, T: C.TURF_T, S: C.TURF_S, P: C.TURF_P },
      bribe_min: C.BRIBE_MIN, bribe_max: C.BRIBE_MAX, max_audits: C.MAX_AUDITS, audit_cost: C.AUDIT_COST, seizure: C.SEIZURE,
      nature: C.NATURE, fire_loss: C.FIRE_LOSS, strike_loss: C.STRIKE_LOSS, ship_gain: C.SHIP_GAIN, storm_closes: C.STORM_CLOSES,
      min_days: C.MIN_DAYS, end_chance: C.END_CHANCE, hidden_cap: C.HIDDEN_CAP,
      equilibrium: { crime: C.EQ_CRIME, inspect: C.EQ_INSPECT, respect: C.EQ_RESPECT, audit_per_district: C.EQ_AUDIT_PER_DISTRICT },
      confidant_max_words: C.CONFIDANT_MAX_WORDS, diary_max_words: C.DIARY_MAX_WORDS, wire_min: C.WIRE_MIN, wire_max: C.WIRE_MAX,
    },
    days: days.map((x) => ({
      day: x.day, nature: parse(x.nature), open: parse(x.open), moves: parse(x.moves), delta: parse(x.delta), welfare: x.welfare, ended: !!x.ended,
      // The Chief's performance penalty inside delta.Chief, apart from money (#67)
      chief_penalty: C.CHIEF_COUNTS_DAMAGE ? C.CRIME_DAMAGE * (crimes.get(x.day) ?? 0) : 0,
    })),
    events: events.map((e) => ({ day: e.day, ...rowToEvent(e) })),
    answers: answers.map((a) => ({ day: a.day, player: a.player, step: a.step, source: a.source, reason: a.reason ?? undefined, errors: a.errors ? parse(a.errors) : undefined, calls: callsOf.get(`${a.day}|${a.player}|${a.step}`) ?? [] })),
    messages: messages.map((m) => ({ day: m.day, from: m.from_player, to: m.to_player, text: m.text })),
    forecasts: forecasts.map((f) => ({ day: f.day, player: f.player, forecasts: parse(f.forecasts) })),
    diaries: diaries.map((x) => ({ day: x.day, player: x.player, text: x.text, forgotten_on: x.forgotten_on ?? null })),
    wire: wire.map((w) => ({ day: w.day, headline: w.headline, text: w.text, events: parse(w.events) })),
    confidant: confidant.map((c) => ({ day: c.day, player: c.player, window: c.window, text: c.text, reply: c.reply })),
    // Who paid for every call: payer names only, never emails.
    ledger,
    // The raw answer behind each call, with the hash of its prompt. Only a
    // finished run is exported (public.ts), so nothing here leaks a live game.
    responses: (await db.prepare("SELECT day, seq, prompt_sha, text FROM responses WHERE run_id = ? ORDER BY day, seq").bind(runId).all<Record<string, unknown>>()).results,
  };
}
