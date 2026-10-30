// The token ledger: one row per model call, saved in the same batch as the
// day it belongs to. Payer names are public run data; emails stay private.

import type { CallRecord } from "../players/model";
import { costOf } from "./pricing";

export function ledgerStatements(db: D1Database, runId: string, day: number, calls: CallRecord[], names: Record<string, string>): D1PreparedStatement[] {
  return calls.map((c, seq) =>
    db
      .prepare(
        `INSERT INTO ledger (run_id, day, seq, player, step, provider, model, model_reported, payer_name, payer_email,
           fallback_key, ok, stop, input, cached_input, cache_write, output, reasoning, cost_usd, error, latency_ms)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        runId, day, seq, c.player, c.step, c.provider, c.model, c.modelReported,
        c.payer ? (names[c.payer] ?? "unknown") : null, c.payer,
        c.fallbackKey ? 1 : 0, c.ok ? 1 : 0, c.stop,
        c.usage?.input ?? null, c.usage?.cachedInput ?? null, c.usage?.cacheWrite ?? null, c.usage?.output ?? null, c.usage?.reasoning ?? null,
        c.usage ? costOf(c.model, c.usage) : null, c.error, c.latencyMs,
      ),
  );
}

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
