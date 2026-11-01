// /api/me/control/*: the Control page's actions (dashboard plan, page 5).
// Behind Cloudflare Access and the participant check in me.ts.

import type { Env } from "../index";
import { createRun, createRunStatement, getRun, setStatus, type Seating } from "../engine/store";
import { blocker } from "../engine/runner";
import { DRAND_ROUND, studyPlan } from "../engine/study";
import { log, recentLog } from "../engine/log";
import { runLedger, studySpend } from "../ledger/ledger";
import { EFFORT, MODELS, TEST_MODELS } from "../players/models";

const json = (body: unknown, status = 200) => Response.json(body, { status });

export async function handleControl(request: Request, env: Env, path: string, who: string): Promise<Response> {
  const meta = async (k: string) => (await env.DB.prepare("SELECT value FROM meta WHERE key = ?").bind(k).first<{ value: string }>())?.value ?? null;

  if (path === "status" && request.method === "GET") {
    const { results: runs } = await env.DB.prepare(
      `SELECT id, model_set, triple, rotation, seating, status, pause_reason, step_queued,
              json_extract(state, '$.day') AS day, (lock_until > ?) AS playing
       FROM runs ORDER BY id`).bind(new Date().toISOString()).all(); // by run name (#113)
    const pace = Number((await meta("pace_minutes")) ?? 10);
    const last = (await env.DB.prepare("SELECT MAX(created_at) AS at FROM days").first<{ at: string | null }>())?.at ?? null;
    return json({
      ok: true, schedule: await meta("schedule"), pace_minutes: pace, last_day_at: last,
      next_due: last ? new Date(Date.parse(last) + pace * 60_000).toISOString() : null,
      cap_usd: Number(await meta("cap_usd")), spend: await studySpend(env.DB),
      models: { study: MODELS, test: TEST_MODELS }, effort: EFFORT, runs, log: await recentLog(env.DB, 15),
    });
  }

  if (path === "schedule" && request.method === "POST") {
    const body = (await request.json().catch(() => null)) as { on?: unknown; cap_usd?: unknown; pace_minutes?: unknown } | null;
    if (body?.pace_minutes !== undefined) {
      if (![2, 5, 10].includes(body.pace_minutes as number)) return json({ ok: false, error: "pace is 2, 5 or 10 minutes" }, 400);
      await env.DB.prepare("UPDATE meta SET value = ? WHERE key = 'pace_minutes'").bind(String(body.pace_minutes)).run();
      await log(env.DB, `${who} set the pace to a day every ${body.pace_minutes} minutes.`);
    }
    if (typeof body?.on === "boolean") {
      await env.DB.prepare("UPDATE meta SET value = ? WHERE key = 'schedule'").bind(body.on ? "on" : "off").run();
      await log(env.DB, body.on
        ? `${who} turned the schedule on: a day every ${(await meta("pace_minutes")) ?? 10} minutes, checked each minute.`
        : `${who} turned the schedule off. A day already playing finishes.`);
    }
    if (typeof body?.cap_usd === "number" && body.cap_usd >= 0) {
      await env.DB.prepare("UPDATE meta SET value = ? WHERE key = 'cap_usd'").bind(String(body.cap_usd)).run();
      await log(env.DB, `${who} set the spending cap to $${body.cap_usd}.`);
    }
    return json({ ok: true, schedule: await meta("schedule"), cap_usd: Number(await meta("cap_usd")), pace_minutes: Number(await meta("pace_minutes")) });
  }

  if (path === "runs" && request.method === "POST") {
    const b = (await request.json().catch(() => null)) as { id?: string; seed?: string; triple?: number; rotation?: number; seating?: Seating; model_set?: string; fixed_days?: number; bot_turf?: string } | null;
    const ok = b && /^[a-z0-9-]{1,40}$/.test(b.id ?? "") && typeof b.seed === "string" && b.seed.length >= 8
      && Number.isInteger(b.triple) && [1, 2, 3].includes(b.rotation as number) && b.seating
      && ["Government", "Criminals", "World"].every((s) => ["claude", "gemini", "gpt"].includes((b.seating as any)[s]))
      && (b.model_set === undefined || b.model_set === "study" || b.model_set === "test" || b.model_set === "bot")
      // a set length is for bot runs only (the 10,000-day engine check)
      && (b.fixed_days === undefined || (b.model_set === "bot" && Number.isInteger(b.fixed_days) && b.fixed_days >= 1 && b.fixed_days <= 10_000))
      && (b.bot_turf === undefined || (b.model_set === "bot" && b.bot_turf === "encroach"));
    if (!ok) {
      const why = !/^[a-z0-9-]{1,40}$/.test(b?.id ?? "") ? "Run ID: use lowercase letters, numbers and hyphens only (up to 40)"
        : !(typeof b?.seed === "string" && b.seed.length >= 8) ? "Seed: at least 8 characters"
        : "need triple, rotation 1 to 3, seating of claude/gemini/gpt, model_set study, test or bot, and fixed_days (1 to 10,000) or bot_turf (encroach) only on a bot run";
      return json({ ok: false, error: why }, 400);
    }
    if (await getRun(env.DB, b!.id!)) return json({ ok: false, error: "run exists" }, 409);
    // The 3 study runs of a triple share one seed (#17, #110).
    if ((b!.model_set ?? "study") === "study" && b!.triple! > 0) {
      const other = await env.DB.prepare("SELECT id, seed FROM runs WHERE model_set = 'study' AND triple = ? AND seed != ? LIMIT 1")
        .bind(b!.triple, b!.seed).first<{ id: string; seed: string }>();
      if (other) return json({ ok: false, error: `Seed: triple ${b!.triple} already uses seed ${other.seed} (run ${other.id}). The 3 runs of a triple share one seed.` }, 400);
    }
    const run = await createRun(env.DB, b as any);
    if (run.model_set === "bot") {
      // Bots start at once and play at their own speed, schedule or not.
      await setStatus(env.DB, run.id, "running");
      await log(env.DB, `${who} created ${run.id}: bots${b!.bot_turf ? ", gangs encroaching" : ""}${b!.fixed_days ? `, ${b!.fixed_days.toLocaleString("en")} days` : ""}. They start at the next tick and play without waiting.`, { run: run.id });
      return json({ ok: true, run: { id: run.id, status: "running" } });
    }
    await log(env.DB, `${who} created ${run.id} (${run.model_set} models, triple ${b!.triple}, rotation ${b!.rotation}).`, { run: run.id });
    return json({ ok: true, run: { id: run.id, status: run.status } });
  }

  // The 27 study runs at once (#38), from the published seeds. They are
  // created ready; with the schedule on, the scheduler plays them one after
  // another in triple and rotation order. Refused if any study run exists, and
  // only with the typed confirmation, so a stray click can't start the study.
  if (path === "study" && request.method === "POST") {
    const b = (await request.json().catch(() => null)) as { confirm?: string } | null;
    if (b?.confirm !== "create the 27 study runs") return json({ ok: false, error: 'type "create the 27 study runs" to confirm' }, 400);
    const existing = await env.DB.prepare("SELECT id FROM runs WHERE model_set = 'study' AND triple > 0 LIMIT 1").first<{ id: string }>();
    if (existing) return json({ ok: false, error: `study runs already exist (${existing.id})` }, 409);
    const plan = await studyPlan();
    // One batch: all 27 or none (Vishnu's review of #127).
    await env.DB.batch(plan.map((r) => createRunStatement(env.DB, { ...r, model_set: "study" }).stmt));
    await log(env.DB, `${who} created the 27 study runs (9 triples, seeds from drand round ${DRAND_ROUND}). With the schedule on, they play in order from ${plan[0].id}.`);
    return json({ ok: true, runs: plan.map((r) => ({ id: r.id, seed: r.seed, triple: r.triple, rotation: r.rotation })) });
  }

  const m = path.match(/^runs\/([a-z0-9-]+)\/(step|pause|resume|check|ledger|end)$/);
  if (m) {
    const [, id, action] = m;
    const run = await getRun(env.DB, id);
    if (!run) return json({ ok: false, error: "no such run" }, 404);
    if (action === "ledger" && request.method === "GET") return json({ ok: true, ledger: await runLedger(env.DB, id) });
    if (action === "check" && request.method === "GET") return json({ ok: true, blocker: await blocker(env, run, run.state.day) });
    if (request.method !== "POST") return json({ ok: false, error: "method not allowed" }, 405);
    // End: the run is over for good. It moves to the archive, its secrets open,
    // and the export workflow saves it to data/runs/ within the hour.
    if (action === "end") {
      if (run.status === "over" || run.status === "truncated") return json({ ok: false, error: `${id} is already over.` }, 409);
      await setStatus(env.DB, id, "over", `ended by ${who} after ${run.state.day - 1} days`);
      await env.DB.prepare("UPDATE runs SET step_queued = 0 WHERE id = ?").bind(id).run();
      await log(env.DB, `${who} ended ${id} after ${run.state.day - 1} days. It is in the archive now.`, { run: id });
      return json({ ok: true, message: `${id} ended after ${run.state.day - 1} days. It is in the archive on the home page.` });
    }
    if (action === "pause") {
      await setStatus(env.DB, id, "paused", `paused by ${who}`);
      await log(env.DB, `${who} paused ${id}. A day already playing finishes.`, { run: id });
      return json({ ok: true, message: `${id} paused.` });
    }
    if (action === "resume") {
      if (run.status !== "paused" && run.status !== "ready") return json({ ok: false, error: `run is ${run.status}` }, 409);
      await setStatus(env.DB, id, "running");
      await log(env.DB, `${who} resumed ${id}.`, { run: id });
      return json({ ok: true, message: `${id} resumed.` });
    }
    // Step only queues a day: the next minute's tick plays it, so closing the
    // page can't cut a day short.
    if (action === "step") {
      if (run.status === "paused") return json({ ok: false, error: `${id} is paused (${(await env.DB.prepare("SELECT pause_reason AS r FROM runs WHERE id = ?").bind(id).first<{ r: string }>())?.r ?? "no reason"}). Press Resume first.` }, 409);
      if (run.status === "over" || run.status === "truncated") return json({ ok: false, error: `${id} is over.` }, 409);
      if (run.status === "ready") await setStatus(env.DB, id, "running");
      await env.DB.prepare("UPDATE runs SET step_queued = 1 WHERE id = ?").bind(id).run();
      await log(env.DB, `${who} queued day ${run.state.day} of ${id}. It starts within a minute.`, { run: id });
      return json({ ok: true, message: `Day ${run.state.day} of ${id} queued. It starts within a minute; you can close this page.` });
    }
  }
  return json({ ok: false, error: "not found" }, 404);
}
