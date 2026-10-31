import { describe, expect, it } from "vitest";
import { handleControl } from "../../src/api/control";
import { recentLog } from "../../src/engine/log";
import { listRuns } from "../../src/engine/public";
import { playDay } from "../../src/engine/day";
import { createRun, getRun, saveDay, yesterday } from "../../src/engine/store";
import { equilibriumPlayers } from "../engine/bots";
import { testD1 } from "../engine/d1";

async function setup(days: number) {
  const db = testD1();
  await createRun(db, { id: "r1", seed: "control-seed", triple: 0, rotation: 1, seating: { Government: "claude", Criminals: "gemini", World: "gpt" }, model_set: "test" });
  await db.prepare("UPDATE runs SET status = 'running'").run();
  const players = equilibriumPlayers("control-seed");
  for (let i = 0; i < days; i++) {
    const run = (await getRun(db, "r1"))!;
    await saveDay(db, "r1", await playDay({ state: run.state, players, ...(await yesterday(db, "r1", run.state.day)) }));
  }
  const env = { DB: db } as any;
  const call = async (path: string, method = "POST", body?: unknown) => {
    const res = await handleControl(new Request("https://x/api/me/control/" + path, { method, ...(body ? { body: JSON.stringify(body) } : {}) }), env, path, "Germ");
    return { status: res.status, body: (await res.json()) as any };
  };
  return { db, call };
}

describe("Control API", () => {
  it("creates bot runs that start at once, and a 10,000-day one with no end draw", async () => {
    const { db, call } = await setup(0);
    const seating = { Government: "claude", Criminals: "gemini", World: "gpt" };
    const base = { seed: "bot-seed-99", triple: 0, rotation: 1, seating };
    expect((await call("runs", "POST", { ...base, id: "b1", model_set: "bot" })).body).toMatchObject({ ok: true, run: { status: "running" } });
    expect((await call("runs", "POST", { ...base, id: "b2", model_set: "bot", fixed_days: 10000 })).body).toMatchObject({ ok: true });
    expect((await getRun(db, "b2"))!.state.fixedDays).toBe(10000);
    expect((await getRun(db, "b1"))!.state.fixedDays).toBeUndefined();
    // a set length is for bots only, and 10,000 at most
    expect((await call("runs", "POST", { ...base, id: "t9", model_set: "test", fixed_days: 50 })).status).toBe(400);
    expect((await call("runs", "POST", { ...base, id: "b3", model_set: "bot", fixed_days: 10001 })).status).toBe(400);
    expect((await recentLog(db)).at(-1)!.text).toContain("10,000 days");
  });

  it("pause then resume carries on from the next day, nothing restarts", async () => {
    const { db, call } = await setup(3);
    expect((await call("runs/r1/pause")).status).toBe(200);
    expect((await getRun(db, "r1"))!.status).toBe("paused");
    expect((await call("runs/r1/resume")).status).toBe(200);
    const run = (await getRun(db, "r1"))!;
    expect(run.status).toBe("running");
    expect(run.state.day).toBe(4); // next day to play, as before the pause
    const days = await db.prepare("SELECT COUNT(*) AS n FROM days WHERE run_id = 'r1'").first<{ n: number }>();
    expect(days!.n).toBe(3);
  });

  it("ends a run for good: archived, logged, and it can't be ended or stepped again", async () => {
    const { db, call } = await setup(2);
    const out = await call("runs/r1/end");
    expect(out.body.message).toContain("ended after 2 days");
    expect((await getRun(db, "r1"))!.status).toBe("over");
    expect((await listRuns(db))[0]).toMatchObject({ id: "r1", live: false });
    expect((await recentLog(db)).at(-1)!.text).toBe("Germ ended r1 after 2 days. It is in the archive now.");
    expect((await call("runs/r1/end")).status).toBe(409);
    expect((await call("runs/r1/step")).status).toBe(409);
  });

  it("accepts a pace of 2, 5 or 10 minutes only", async () => {
    const { call } = await setup(0);
    expect((await call("schedule", "POST", { pace_minutes: 2 })).body.pace_minutes).toBe(2);
    expect((await call("schedule", "POST", { pace_minutes: 3 })).status).toBe(400);
  });
});
