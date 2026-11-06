// The judges' part of a run's export: every judge's code for every item, the
// combined codes, the agreement, and the tone rows in the format
// `python -m analysis.bayes ... --tones` reads (analysis/bayes/judges.py,
// tone_rows). No emails and no keys: only codes, model IDs and providers.

import { JUDGE_MODELS } from "../players/models";
import { summarize } from "./agree";
import { ALT_SEED, ALT_SHARE } from "./items";
import { ALT_SYSTEM, JUDGE_SYSTEM } from "./prompt";

export const TEMPERATURE = 0;
export const MAX_ATTEMPTS = 3; // tries per item and judge before it is left uncoded
export const MAX_OUTPUT_TOKENS = 4000; // as a study call: room for a judge that thinks before it answers

// The pins the counts in judge_runs refer to.
export const judgesSignature = () => JSON.stringify(JUDGE_MODELS.map((j) => [j.judge, j.model, j.upstream]));

async function sha(s: string): Promise<string> {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function judgesSection(db: D1Database, runId: string, seating: { Government: string; Criminals: string; World: string }) {
  const { results } = await db
    .prepare(`SELECT item, task, judge, template, model, upstream, model_reported, provider_reported, code, raw, error, attempts, prompt_sha, at
              FROM judge_codes WHERE run_id = ? ORDER BY item, judge, template`)
    .bind(runId)
    .all<Record<string, any>>();
  if (!results.length) return null;
  const counts = await db.prepare("SELECT judges, items, jobs, coded, failed, updated_at FROM judge_runs WHERE run_id = ?").bind(runId).first<Record<string, any>>();
  // Only codes from the judges pinned now count; a code from an earlier pin is kept in the table but left out.
  const current = (r: Record<string, any>) => JUDGE_MODELS.some((j) => j.judge === r.judge && j.model === r.model && j.upstream === r.upstream);
  const codes = results.filter(current).map((r): Record<string, any> & { item: string; task: string; judge: string; template: string; code: any } => ({ ...r, item: r.item, task: r.task, judge: r.judge, template: r.template, code: r.code ? JSON.parse(r.code) : null }));
  const summary = summarize(codes, JUDGE_MODELS.map((j) => j.judge));
  const tones = codes
    .filter((c) => c.template === "main" && c.code?.task === "tone")
    .map((c) => ({
      item: `${runId}/${c.item}`, run: runId, world_family: seating.World,
      seat_holders: { Government: seating.Government, Criminals: seating.Criminals },
      judge: c.judge, tone_government: c.code.tone_government, tone_criminals: c.code.tone_criminals,
    }));
  return {
    protocol: {
      judges: JUDGE_MODELS.map(({ judge, model, upstream }) => ({ judge, model, upstream })),
      temperature: TEMPERATURE, max_attempts: MAX_ATTEMPTS, max_output_tokens: MAX_OUTPUT_TOKENS,
      second_template: { share: ALT_SHARE, seed: ALT_SEED },
      system_sha: await sha(JUDGE_SYSTEM), alt_system_sha: await sha(ALT_SYSTEM),
    },
    complete: !!counts && counts.judges === judgesSignature() && counts.coded + counts.failed >= counts.jobs,
    counts: counts ? { items: counts.items, jobs: counts.jobs, coded: counts.coded, failed: counts.failed, updated_at: counts.updated_at } : null,
    alpha: summary.alpha,
    template_alpha: summary.template_alpha,
    combined: summary.combined,
    codes,
    tones,
  };
}
