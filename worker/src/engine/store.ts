// Runs and days in D1. A day is written in one batch, which D1 runs as a
// transaction, so a run never holds half a day. Reading back gives the
// engine everything it needs to play the next day; exportRun gives the
// analysis side the whole run as one JSON object.

import type { PlayerName } from "./config";
import type { DayResult } from "./day";
import { newGame } from "./resolve";
import type { Event, GameState, WireItem } from "./types";

export const RULES_VERSION = "draft-3";

export type Status = "ready" | "running" | "paused" | "over" | "truncated";

export interface Seating {
  Government: string;
  Criminals: string;
  World: string;
}

export interface RunRow {
  id: string;
  model_set: "study" | "test";
  seed: string;
  triple: number;
  rotation: 1 | 2 | 3;
  seating: Seating;
  rules_version: string;
  status: Status;
  state: GameState;
}

export interface ConfidantRow {
  player: PlayerName;
  window: "before" | "after";
  text: string | null;
  reply: string;
}

const now = () => new Date().toISOString();
const json = (v: unknown) => JSON.stringify(v);

export async function createRun(db: D1Database, run: { id: string; seed: string; triple: number; rotation: 1 | 2 | 3; seating: Seating; model_set?: "study" | "test" }): Promise<RunRow> {
  const modelSet = run.model_set ?? "study";
  const state = newGame(run.seed);
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
  return { id: r.id, model_set: r.model_set ?? "study", seed: r.seed, triple: r.triple, rotation: r.rotation, seating: JSON.parse(r.seating), rules_version: r.rules_version, status: r.status, state: JSON.parse(r.state) };
}

export async function setStatus(db: D1Database, id: string, status: Status, reason: string | null = null) {
  await db.prepare("UPDATE runs SET status = ?, pause_reason = ?, updated_at = ? WHERE id = ?").bind(status, reason, now(), id).run();
}

// What the next day needs from the day before: its public events and Wire.
export async function yesterday(db: D1Database, runId: string, day: number): Promise<{ publicYesterday: Event[]; wireYesterday: WireItem[] }> {
  if (day <= 1) return { publicYesterday: [], wireYesterday: [] };
  const ev = await db.prepare("SELECT * FROM events WHERE run_id = ? AND day = ? AND public = 1 ORDER BY rowid").bind(runId, day - 1).all<Record<string, any>>();
  const wi = await db.prepare("SELECT headline, text, events FROM wire WHERE run_id = ? AND day = ? ORDER BY seq").bind(runId, day - 1).all<Record<string, any>>();
  return {
    publicYesterday: ev.results.map(rowToEvent),
    wireYesterday: wi.results.map((w) => ({ headline: w.headline, text: w.text, events: JSON.parse(w.events) })),
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
  for (const a of r.records)
    q("INSERT INTO answers (run_id, day, player, step, source, reason, errors) VALUES (?, ?, ?, ?, ?, ?, ?)",
      runId, d, a.player, a.step, a.source, a.reason ?? null, a.errors ? json(a.errors) : null);
  r.messages.forEach((m, i) =>
    q("INSERT INTO messages (run_id, day, seq, from_player, to_player, text) VALUES (?, ?, ?, ?, ?, ?)", runId, d, i, m.from, m.to, m.text));
  for (const [p, f] of Object.entries(r.forecasts))
    q("INSERT INTO forecasts (run_id, day, player, forecasts) VALUES (?, ?, ?, ?)", runId, d, p, json(f));
  for (const [p, text] of Object.entries(r.diaries))
    q("INSERT INTO diaries (run_id, day, player, text) VALUES (?, ?, ?, ?)", runId, d, p, text);
  r.wire.forEach((w, i) =>
    q("INSERT INTO wire (run_id, day, seq, headline, text, events) VALUES (?, ?, ?, ?, ?, ?)", runId, d, i, w.headline, w.text, json(w.events)));
  for (const c of confidant)
    q("INSERT INTO confidant (run_id, day, player, window, text, reply) VALUES (?, ?, ?, ?, ?, ?)", runId, d, c.player, c.window, c.text, c.reply);

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
  return {
    run: { ...run, state: undefined },
    days: days.map((x) => ({ day: x.day, nature: parse(x.nature), open: parse(x.open), moves: parse(x.moves), delta: parse(x.delta), welfare: x.welfare, ended: !!x.ended })),
    events: events.map((e) => ({ day: e.day, ...rowToEvent(e) })),
    answers: answers.map((a) => ({ day: a.day, player: a.player, step: a.step, source: a.source, reason: a.reason ?? undefined, errors: a.errors ? parse(a.errors) : undefined })),
    messages: messages.map((m) => ({ day: m.day, from: m.from_player, to: m.to_player, text: m.text })),
    forecasts: forecasts.map((f) => ({ day: f.day, player: f.player, forecasts: parse(f.forecasts) })),
    diaries: diaries.map((x) => ({ day: x.day, player: x.player, text: x.text })),
    wire: wire.map((w) => ({ day: w.day, headline: w.headline, text: w.text, events: parse(w.events) })),
    confidant: confidant.map((c) => ({ day: c.day, player: c.player, window: c.window, text: c.text, reply: c.reply })),
    // Who paid for every call: payer names only, never emails.
    ledger: (await db.prepare(
      `SELECT day, seq, player, step, provider, model, model_reported, payer_name, fallback_key, ok, stop,
              input, cached_input, cache_write, output, reasoning, cost_usd, error, latency_ms, day_saved
       FROM ledger WHERE run_id = ? ORDER BY day, seq`).bind(runId).all<Record<string, unknown>>()).results,
  };
}
