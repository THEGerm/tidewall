// What the public may see of a run (docs/dashboard.md, "Data and API").
// While a run is live: public events, the Wire, scores, open districts, the
// treasury, the prison count, and confidant texts and diaries (both shown
// under a red CONFIDENTIAL label; Germ, 31 Oct).
// Once it ends: everything, as in exportRun. Every public endpoint reads
// through this file, and test/engine/public.test.ts checks that a live run
// never returns a secret event, a message, a forecast or a move.

import { START } from "./config";
import { exportRun, getRun, type RunRow, type Status } from "./store";
import type { Scores } from "./types";

export const isLive = (status: Status) => status !== "over" && status !== "truncated";

const parse = (v: unknown) => (typeof v === "string" ? JSON.parse(v) : v);

export async function listRuns(db: D1Database) {
  const { results } = await db
    .prepare(
      `SELECT r.id, r.model_set, r.triple, r.rotation, r.seating, r.status, r.updated_at,
              (SELECT COUNT(*) FROM days d WHERE d.run_id = r.id) AS days,
              (SELECT SUM(cost_usd) FROM ledger l WHERE l.run_id = r.id) AS cost_usd
       FROM runs r ORDER BY r.model_set, r.triple, r.rotation, r.id`,
    )
    .all<Record<string, any>>();
  return results.map((r) => ({ ...r, seating: parse(r.seating), live: isLive(r.status), cost_usd: r.cost_usd ?? 0 }));
}

// One row per played day: what the run page charts. All of it is public.
export async function runSummary(db: D1Database, id: string) {
  const run = await getRun(db, id);
  if (!run) return null;
  const { results: days } = await db
    .prepare("SELECT day, nature, delta FROM days WHERE run_id = ? ORDER BY day")
    .bind(id)
    .all<Record<string, any>>();
  const { results: ev } = await db
    .prepare("SELECT day, kind, detail FROM events WHERE run_id = ? AND public = 1 AND kind IN ('arrest', 'release', 'turf') ORDER BY day, rowid")
    .bind(id)
    .all<Record<string, any>>();

  const scores: Scores = { Council: 0, Chief: 0, Families: 0, Saltdogs: 0 };
  let treasury = START.treasury;
  let prison = 0;
  const series = days.map((d) => {
    const delta = parse(d.delta) as Scores;
    for (const k of Object.keys(scores) as (keyof Scores)[]) scores[k] += delta[k];
    treasury += delta.Council; // the Council's score is the treasury's change
    const today = ev.filter((e) => e.day === d.day);
    prison += today.filter((e) => e.kind === "arrest").length - today.filter((e) => e.kind === "release").length;
    const turf = parse(today.find((e) => e.kind === "turf")?.detail ?? null);
    return { day: d.day, nature: parse(d.nature), delta, scores: { ...scores }, treasury, prison, turf };
  });

  return { run: publicRun(run, days.length), days: series };
}

function publicRun(run: RunRow, played: number) {
  const live = isLive(run.status);
  return {
    id: run.id,
    model_set: run.model_set,
    triple: run.triple,
    rotation: run.rotation,
    seating: run.seating,
    rules_version: run.rules_version,
    status: run.status,
    live,
    days: played,
    // The seed fixes Nature and the end day, so it waits for the end.
    ...(live ? {} : { seed: run.seed, truncated: run.state.truncated }),
  };
}

// One day. A live run gets the public cut; a finished run gets everything.
export async function dayView(db: D1Database, id: string, day: number) {
  const run = await getRun(db, id);
  if (!run) return null;
  const d = await db.prepare("SELECT * FROM days WHERE run_id = ? AND day = ?").bind(id, day).first<Record<string, any>>();
  if (!d) return null;
  const live = isLive(run.status);
  const rows = async (sql: string) => (await db.prepare(sql).bind(id, day).all<Record<string, any>>()).results;

  const events = await rows(`SELECT * FROM events WHERE run_id = ? AND day = ? ${live ? "AND public = 1" : ""} ORDER BY rowid`);
  const wire = await rows("SELECT headline, text, events FROM wire WHERE run_id = ? AND day = ? ORDER BY seq");
  const confidant = await rows("SELECT player, window, text, reply FROM confidant WHERE run_id = ? AND day = ? ORDER BY player, window = 'after'");
  // Every entry up to this day: the diary as each player holds it that night.
  const diary = await rows("SELECT day, player, text, forgotten_on FROM diaries WHERE run_id = ? AND day <= ? ORDER BY player, day");

  const base = {
    run: { id, status: run.status, live },
    day,
    ended: !!d.ended,
    nature: parse(d.nature),
    open: parse(d.open),
    delta: parse(d.delta),
    events: events.map((e) => ({
      id: e.id, kind: e.kind, public: !!e.public,
      ...(e.district ? { district: e.district } : {}),
      ...(e.actor ? { actor: e.actor } : {}),
      ...(e.detail ? { detail: parse(e.detail) } : {}),
    })),
    wire: wire.map((w) => ({ headline: w.headline, text: w.text, events: parse(w.events) })),
    confidant: { label: "CONFIDENTIAL", texts: confidant },
    // Each player's whole diary up to this day, live (Germ, 31 Oct). An entry
    // deleted later than this day still shows here, as the player still held
    // it. No player sees another's diary; the page is for people watching.
    diary: {
      label: "CONFIDENTIAL",
      entries: diary.map((x) => ({ day: x.day, player: x.player, text: x.text, forgotten_on: x.forgotten_on != null && x.forgotten_on <= day ? x.forgotten_on : null })),
    },
  };
  if (live) return base;

  const messages = await rows("SELECT from_player, to_player, text FROM messages WHERE run_id = ? AND day = ? ORDER BY seq");
  const diaries = await rows("SELECT player, text FROM diaries WHERE run_id = ? AND day = ? ORDER BY player");
  const forecasts = await rows("SELECT player, forecasts FROM forecasts WHERE run_id = ? AND day = ? ORDER BY player");
  const answers = await rows("SELECT player, step, source, reason FROM answers WHERE run_id = ? AND day = ?");
  return {
    ...base,
    moves: parse(d.moves),
    welfare: d.welfare,
    messages: messages.map((m) => ({ from: m.from_player, to: m.to_player, text: m.text })),
    diaries,
    forecasts: forecasts.map((f) => ({ player: f.player, forecasts: parse(f.forecasts) })),
    answers,
  };
}

// The full export, for finished runs only.
export async function publicExport(db: D1Database, id: string) {
  const run = await getRun(db, id);
  if (!run || isLive(run.status)) return null;
  return exportRun(db, id);
}
