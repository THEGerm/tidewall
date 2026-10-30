// /api/me/control/*: the Control page's actions (dashboard plan, page 5).
// Behind Cloudflare Access and the participant check in me.ts.

import type { Env } from "../index";
import { createRun, getRun, setStatus, type Seating } from "../engine/store";
import { blocker, playNextDay } from "../engine/runner";
import { runLedger, studySpend } from "../ledger/ledger";

const json = (body: unknown, status = 200) => Response.json(body, { status });

export async function handleControl(request: Request, env: Env, path: string): Promise<Response> {
  const meta = async (k: string) => (await env.DB.prepare("SELECT value FROM meta WHERE key = ?").bind(k).first<{ value: string }>())?.value ?? null;

  if (path === "status" && request.method === "GET") {
    const { results: runs } = await env.DB.prepare("SELECT id, model_set, triple, rotation, seating, status, pause_reason, json_extract(state, '$.day') AS day FROM runs ORDER BY triple, rotation").all();
    return json({ ok: true, schedule: await meta("schedule"), cap_usd: Number(await meta("cap_usd")), spend: await studySpend(env.DB), runs });
  }

  if (path === "schedule" && request.method === "POST") {
    const body = (await request.json().catch(() => null)) as { on?: unknown; cap_usd?: unknown } | null;
    if (typeof body?.on === "boolean") await env.DB.prepare("UPDATE meta SET value = ? WHERE key = 'schedule'").bind(body.on ? "on" : "off").run();
    if (typeof body?.cap_usd === "number" && body.cap_usd >= 0) await env.DB.prepare("UPDATE meta SET value = ? WHERE key = 'cap_usd'").bind(String(body.cap_usd)).run();
    return json({ ok: true, schedule: await meta("schedule"), cap_usd: Number(await meta("cap_usd")) });
  }

  if (path === "runs" && request.method === "POST") {
    const b = (await request.json().catch(() => null)) as { id?: string; seed?: string; triple?: number; rotation?: number; seating?: Seating; model_set?: string } | null;
    const ok = b && /^[a-z0-9-]{1,40}$/.test(b.id ?? "") && typeof b.seed === "string" && b.seed.length >= 8
      && Number.isInteger(b.triple) && [1, 2, 3].includes(b.rotation as number) && b.seating
      && ["Government", "Criminals", "World"].every((s) => ["claude", "gemini", "gpt"].includes((b.seating as any)[s]))
      && (b.model_set === undefined || b.model_set === "study" || b.model_set === "test");
    if (!ok) return json({ ok: false, error: "need id, seed (8+ chars), triple, rotation 1 to 3, seating of claude/gemini/gpt, and model_set study or test" }, 400);
    if (await getRun(env.DB, b!.id!)) return json({ ok: false, error: "run exists" }, 409);
    const run = await createRun(env.DB, b as any);
    return json({ ok: true, run: { id: run.id, status: run.status } });
  }

  const m = path.match(/^runs\/([a-z0-9-]+)\/(step|pause|resume|check|ledger)$/);
  if (m) {
    const [, id, action] = m;
    const run = await getRun(env.DB, id);
    if (!run) return json({ ok: false, error: "no such run" }, 404);
    if (action === "ledger" && request.method === "GET") return json({ ok: true, ledger: await runLedger(env.DB, id) });
    if (action === "check" && request.method === "GET") return json({ ok: true, blocker: await blocker(env, run, run.state.day) });
    if (request.method !== "POST") return json({ ok: false, error: "method not allowed" }, 405);
    if (action === "pause") { await setStatus(env.DB, id, "paused", "paused by a participant"); return json({ ok: true }); }
    if (action === "resume") {
      if (run.status !== "paused" && run.status !== "ready") return json({ ok: false, error: `run is ${run.status}` }, 409);
      await setStatus(env.DB, id, "running");
      return json({ ok: true });
    }
    if (action === "step") {
      if (run.status === "ready") await setStatus(env.DB, id, "running");
      return json({ ok: true, outcome: await playNextDay(env, id) });
    }
  }
  return json({ ok: false, error: "not found" }, 404);
}
