// The token ledger: one row per model call, saved in the same batch as the
// day it belongs to. Payer names are public run data; emails stay private.

import type { CallRecord } from "../players/model";
import { costOf } from "./pricing";
import { debts, participants } from "../players/keys";

// One row per call, written as soon as the call returns, so a day that fails
// halfway still records every call it paid for. day_saved stays 0 until the
// day itself is saved (markDaySaved).
export function ledgerRow(db: D1Database, runId: string, day: number, seq: number, c: CallRecord, names: Record<string, string>): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO ledger (run_id, day, seq, player, step, provider, model, model_reported, payer_name, payer_email,
         fallback_key, ok, stop, input, cached_input, cache_write, output, reasoning, cost_usd, error, latency_ms, day_saved, at, request_id, stop_detail, payback)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)`,
    )
    .bind(
      runId, day, seq, c.player, c.step, c.provider, c.model, c.modelReported,
      c.payer ? (names[c.payer] ?? "unknown") : null, c.payer,
      c.fallbackKey ? 1 : 0, c.ok ? 1 : 0, c.stop,
      c.usage?.input ?? null, c.usage?.cachedInput ?? null, c.usage?.cacheWrite ?? null, c.usage?.output ?? null, c.usage?.reasoning ?? null,
      c.usage ? costOf(c.model, c.usage) : null, c.error, c.latencyMs, new Date().toISOString(), c.requestId ?? null, c.stopDetail ?? null, c.payback ? 1 : 0,
    );
}

// The next free seq for a run's day: a day played again after a failure
// numbers its calls after the failed attempt's.
// The raw answer behind a ledger row, kept apart from the public ledger.
export const responseRow = (db: D1Database, runId: string, day: number, seq: number, c: CallRecord) =>
  db.prepare("INSERT INTO responses (run_id, day, seq, prompt_sha, text) VALUES (?, ?, ?, ?, ?)").bind(runId, day, seq, c.promptSha ?? null, c.text ?? null);

export async function nextSeq(db: D1Database, runId: string, day: number): Promise<number> {
  const r = await db.prepare("SELECT COALESCE(MAX(seq) + 1, 0) AS n FROM ledger WHERE run_id = ? AND day = ?").bind(runId, day).first<{ n: number }>();
  return r?.n ?? 0;
}

export const markDaySaved = (db: D1Database, runId: string, day: number, fromSeq: number) =>
  db.prepare("UPDATE ledger SET day_saved = 1 WHERE run_id = ? AND day = ? AND seq >= ?").bind(runId, day, fromSeq);

export async function studySpend(db: D1Database): Promise<{ usd: number; unpriced: number }> {
  const r = await db
    .prepare("SELECT COALESCE(SUM(cost_usd), 0) AS usd, SUM(CASE WHEN cost_usd IS NULL AND input IS NOT NULL THEN 1 ELSE 0 END) AS unpriced FROM ledger")
    .first<{ usd: number; unpriced: number | null }>();
  return { usd: r?.usd ?? 0, unpriced: r?.unpriced ?? 0 };
}

// Public per-run ledger: tokens and cost per day, provider and payer name.
export async function runLedger(db: D1Database, runId: string) {
  const { results } = await db
    .prepare(
      `SELECT day, provider, payer_name, SUM(fallback_key) AS fallback_calls, COUNT(*) AS calls,
              SUM(input) AS input, SUM(cached_input) AS cached_input, SUM(cache_write) AS cache_write,
              SUM(output) AS output, SUM(cost_usd) AS cost_usd
       FROM ledger WHERE run_id = ? GROUP BY day, provider, payer_name ORDER BY day, provider, payer_name`,
    )
    .bind(runId)
    .all<Record<string, number | string | null>>();
  return results;
}

// The signed-in ledger page: every run by day, provider, model and payer
// name, with failed and fallback-key calls counted, plus totals per payer
// and per run. Payer emails stay in the table and never leave it.
export async function fullLedger(db: D1Database) {
  const sums = `COUNT(*) AS calls, SUM(1 - ok) AS failed, SUM(fallback_key) AS fallback_calls, SUM(payback) AS payback_calls,
    SUM(input) AS input, SUM(cached_input) AS cached_input, SUM(cache_write) AS cache_write,
    SUM(output) AS output, SUM(cost_usd) AS cost_usd,
    SUM(CASE WHEN cost_usd IS NULL AND input IS NOT NULL THEN 1 ELSE 0 END) AS unpriced`;
  const q = async (sql: string) => (await db.prepare(sql).all<Record<string, number | string | null>>()).results;
  const [rows, byPayer, byRun] = await Promise.all([
    q(`SELECT run_id, day, provider, model, payer_name, ${sums} FROM ledger
       GROUP BY run_id, day, provider, model, payer_name ORDER BY run_id, day, provider, payer_name`),
    q(`SELECT payer_name, provider, ${sums} FROM ledger GROUP BY payer_name, provider ORDER BY payer_name, provider`),
    q(`SELECT run_id, ${sums} FROM ledger GROUP BY run_id ORDER BY run_id`),
  ]);
  // Open debts by name (#117); emails stay private.
  const people = await participants(db);
  const name = Object.fromEntries(people.map((p) => [p.email, p.name]));
  const balances = (await debts(db, people)).map((d) => ({ debtor: name[d.debtor] ?? "unknown", creditor: name[d.creditor] ?? "unknown", usd: d.usd }));
  return { rows, byPayer, byRun, balances, study: await studySpend(db) };
}
