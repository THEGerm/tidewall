// /api/runs/*: the public, read-only API (docs/dashboard.md, "Data and API").
// Every answer comes from engine/public.ts, which makes the public cut.

import type { Env } from "../index";
import { dayView, listRuns, publicExport, runSummary, sealed } from "../engine/public";
import { runLedger } from "../ledger/ledger";
import { getRun } from "../engine/store";

// Live runs change every tick; finished ones never change.
const json = (body: unknown, status = 200, final = false) =>
  Response.json(body, { status, headers: { "Cache-Control": final ? "public, max-age=3600" : "no-store" } });
const missing = (what: string) => json({ ok: false, error: `no such ${what}` }, 404);

export async function handlePublic(request: Request, env: Env, url: URL): Promise<Response> {
  if (request.method !== "GET") return json({ ok: false, error: "method not allowed" }, 405);
  const path = url.pathname.replace(/\/$/, "");

  if (path === "/api/runs") return json({ ok: true, runs: await listRuns(env.DB) });

  const m = path.match(/^\/api\/runs\/([a-z0-9-]{1,40})(?:\/(ledger|export|days\/(\d{1,5})))?$/);
  if (!m) return json({ ok: false, error: "not found" }, 404);
  const [, id, sub, day] = m;

  if (!sub) {
    const s = await runSummary(env.DB, id);
    return s ? json({ ok: true, ...s }, 200, !s.run.sealed) : missing("run");
  }
  if (day) {
    const v = await dayView(env.DB, id, Number(day));
    return v ? json({ ok: true, ...v }, 200, !v.run.sealed) : missing("day");
  }
  if (sub === "ledger") {
    const run = await getRun(env.DB, id);
    if (!run) return missing("run");
    return json({ ok: true, ledger: await runLedger(env.DB, id) }, 200, !(await sealed(env.DB, run)));
  }
  const out = await publicExport(env.DB, id);
  return out ? json(out, 200, true) : json({ ok: false, error: "the export opens when the run ends" }, 404);
}
