// The 27 study runs (#38): seeds match docs/seeds.md, one click creates them in
// playing order, and it can't happen twice or by accident.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { handleControl } from "../../src/api/control";
import { getRun } from "../../src/engine/store";
import { SEATINGS, studyPlan, studySeed } from "../../src/engine/study";
import { testD1 } from "../engine/d1";

const call = async (env: any, body?: unknown): Promise<{ status: number; body: any }> => {
  const res = await handleControl(new Request("https://x/api/me/control/study", { method: "POST", ...(body ? { body: JSON.stringify(body) } : {}) }), env, "study", "Germ");
  return { status: res.status, body: (await res.json()) as any };
};

describe("study runs", () => {
  it("derive the 9 seeds published in docs/seeds.md", async () => {
    const doc = readFileSync(fileURLToPath(new URL("../../../docs/seeds.md", import.meta.url)), "utf8");
    const table = Object.fromEntries([...doc.matchAll(/^\| (\d) \| ([0-9a-f]{16}) \|$/gm)].map((m) => [Number(m[1]), m[2]]));
    expect(Object.keys(table)).toHaveLength(9);
    for (let t = 1; t <= 9; t++) expect(await studySeed(t)).toBe(table[t]);
  });

  it("plan 27 runs: each triple shares a seed and plays rotations 1 to 3 in order", async () => {
    const plan = await studyPlan();
    expect(plan).toHaveLength(27);
    expect(plan.map((r) => r.id).slice(0, 4)).toEqual(["study-t1-r1", "study-t1-r2", "study-t1-r3", "study-t2-r1"]);
    for (let t = 1; t <= 9; t++) {
      const runs = plan.filter((r) => r.triple === t);
      expect(new Set(runs.map((r) => r.seed)).size).toBe(1);
      expect(runs.map((r) => r.seating)).toEqual([SEATINGS[1], SEATINGS[2], SEATINGS[3]]);
    }
    // every model holds every seat 9 times
    for (const seat of ["Government", "Criminals", "World"] as const)
      for (const m of ["claude", "gemini", "gpt"]) expect(plan.filter((r) => r.seating[seat] === m)).toHaveLength(9);
  });

  it("are created once, ready, with the typed confirmation only", async () => {
    const db = testD1();
    const env = { DB: db } as any;
    expect((await call(env, {})).status).toBe(400);
    expect((await call(env, { confirm: "yes" })).status).toBe(400);
    const ok = await call(env, { confirm: "create the 27 study runs" });
    expect(ok.body.ok).toBe(true);
    expect(ok.body.runs).toHaveLength(27);
    const first = (await getRun(db, "study-t1-r1"))!;
    expect(first).toMatchObject({ model_set: "study", status: "ready", triple: 1, rotation: 1 });
    expect(first.state.seed).toBe(await studySeed(1));
    expect((await call(env, { confirm: "create the 27 study runs" })).status).toBe(409);
  });
});

describe("triple sealing (Germ, 1 Nov)", () => {
  it("keep a finished study run's secrets closed until its whole triple is over", async () => {
    const { listRuns, publicExport } = await import("../../src/engine/public");
    const db = testD1();
    await call({ DB: db }, { confirm: "create the 27 study runs" });
    await db.prepare("UPDATE runs SET status = 'over' WHERE id = 'study-t1-r1'").run();
    expect(await publicExport(db, "study-t1-r1")).toBeNull();
    // finished, so not live, but sealed: public outcomes show, secrets wait (Germ, 1 Nov)
    expect((await listRuns(db) as any[]).find((r) => r.id === "study-t1-r1")).toMatchObject({ status: "over", live: false, sealed: true });
    const { runSummary } = await import("../../src/engine/public");
    const sum = (await runSummary(db, "study-t1-r1"))!;
    expect(sum.run).toMatchObject({ live: false, sealed: true });
    expect(sum.run).not.toHaveProperty("seed");
    await db.prepare("UPDATE runs SET status = 'over' WHERE id IN ('study-t1-r2', 'study-t1-r3')").run();
    expect(await publicExport(db, "study-t1-r1")).not.toBeNull();
    expect((await listRuns(db) as any[]).find((r) => r.id === "study-t1-r1")).toMatchObject({ live: false, sealed: false });
    // test runs open as soon as they end
    const { createRun } = await import("../../src/engine/store");
    await createRun(db, { id: "t1", seed: "test-seed-1", triple: 0, rotation: 1, seating: SEATINGS[1], model_set: "test" });
    await db.prepare("UPDATE runs SET status = 'over' WHERE id = 't1'").run();
    expect(await publicExport(db, "t1")).not.toBeNull();
  });
});

describe("study creation is atomic (Vishnu's review)", () => {
  it("creates none of the 27 if one insert fails", async () => {
    const { createRun } = await import("../../src/engine/store");
    const db = testD1();
    await createRun(db, { id: "study-t5-r2", seed: "clash-seed-1", triple: 0, rotation: 1, seating: SEATINGS[1], model_set: "test" });
    await expect(call({ DB: db }, { confirm: "create the 27 study runs" })).rejects.toThrow();
    expect(await db.prepare("SELECT COUNT(*) AS n FROM runs WHERE model_set = 'study'").first<{ n: number }>()).toEqual({ n: 0 });
  });
});
