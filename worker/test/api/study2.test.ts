// Study 2 (Germ, 2 Nov): the 27-run design on the lightweight models. It must reuse
// the study's seeds and seatings exactly, live under its own IDs and
// model_set, never touch a study row, and wait for the study to finish.
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { describe, expect, it } from "vitest";
import { handleControl } from "../../src/api/control";
import { getRun } from "../../src/engine/store";
import { listRuns, sealed } from "../../src/engine/public";
import { studyPlan } from "../../src/engine/study";
import { ownerOrder } from "../../src/players/keys";
import { MODELS, STUDY2_MODELS, TEST_MODELS, modelsFor } from "../../src/players/models";
import { testD1 } from "../engine/d1";

const call = async (env: any, path: string, body?: unknown) => {
  const res = await handleControl(new Request(`https://x/api/me/control/${path}`, { method: "POST", ...(body ? { body: JSON.stringify(body) } : {}) }), env, path, "Germ");
  return { status: res.status, body: (await res.json()) as any };
};
const CONFIRM = { confirm: "create the 27 study 2 runs" };

describe("Study 2", () => {
  it("plays the study's seeds and seatings under its own IDs", async () => {
    const [s1, s2] = [await studyPlan(), await studyPlan("study2")];
    expect(s2).toHaveLength(27);
    expect(s2[0].id).toBe("study2-t1-r1");
    expect(s2.at(-1)!.id).toBe("study2-t9-r3");
    expect(s2.map(({ id, ...r }) => r)).toEqual(s1.map(({ id, ...r }) => r));
    expect(s2.filter((r) => s1.some((x) => x.id === r.id))).toEqual([]);
  });

  it("uses the lightweight models, its own pinned copy", () => {
    expect(modelsFor("study2")).toBe(STUDY2_MODELS);
    expect(STUDY2_MODELS).toEqual(TEST_MODELS);
    expect(STUDY2_MODELS).not.toBe(TEST_MODELS);
    expect(Object.values(STUDY2_MODELS).map((m) => m.model)).not.toContain(MODELS.claude.model);
  });

  it("waits for the study to finish, is created once, and leaves every study row untouched", async () => {
    const db = testD1();
    const env = { DB: db } as any;
    expect((await call(env, "study", { confirm: "create the 27 study runs" })).body.ok).toBe(true);
    expect((await call(env, "study2", { confirm: "yes" })).status).toBe(400);
    const early = await call(env, "study2", CONFIRM);
    expect(early.status).toBe(409);
    expect(early.body.error).toMatch(/study-t1-r1/);

    await db.prepare("UPDATE runs SET status = 'over' WHERE model_set = 'study'").run();
    const before = (await db.prepare("SELECT * FROM runs WHERE model_set = 'study' ORDER BY id").all()).results;
    const ok = await call(env, "study2", CONFIRM);
    expect(ok.body.ok).toBe(true);
    expect(ok.body.runs).toHaveLength(27);
    expect((await getRun(db, "study2-t2-r4"))!).toMatchObject({ model_set: "study2", status: "ready", triple: 2, rotation: 4 });
    expect((await db.prepare("SELECT * FROM runs WHERE model_set = 'study' ORDER BY id").all()).results).toEqual(before);
    expect((await call(env, "study2", CONFIRM)).status).toBe(409);
  });

  it("seals its triples apart from the study's", async () => {
    const db = testD1();
    const env = { DB: db } as any;
    await call(env, "study", { confirm: "create the 27 study runs" });
    await db.prepare("UPDATE runs SET status = 'over' WHERE model_set = 'study'").run();
    await call(env, "study2", CONFIRM);
    // a finished study run stays open while Study 2's triple 1 plays
    await db.prepare("UPDATE runs SET status = 'over' WHERE id = 'study2-t1-r1'").run();
    expect(await sealed(db, (await getRun(db, "study-t1-r1"))!)).toBe(false);
    expect(await sealed(db, (await getRun(db, "study2-t1-r1"))!)).toBe(true);
    const listed = Object.fromEntries((await listRuns(db)).map((r: any) => [r.id, r.sealed]));
    expect(listed["study-t1-r1"]).toBe(false);
    expect(listed["study2-t1-r1"]).toBe(true);
  });

  it("alternates owners by run, as the study does", () => {
    const ps = ["Germ", "Shazz"];
    const run = (t: number, r: number) => ({ model_set: "study2", triple: t, rotation: r });
    expect([[1, 1], [1, 2], [1, 3], [2, 4]].map(([t, r]) => ownerOrder(ps, 5, run(t, r))[0])).toEqual(["Germ", "Shazz", "Germ", "Shazz"]);
  });

  it("migration 0014 keeps every run and only widens model_set", () => {
    const dir = fileURLToPath(new URL("../../migrations", import.meta.url));
    const files = ["0001", "0002", "0003", "0004", "0005", "0006", "0007", "0008", "0009", "0010", "0011", "0012", "0013"];
    const all: string[] = readdirSync(dir).filter((f: string) => f.endsWith(".sql")).sort();
    const db = new DatabaseSync(":memory:");
    db.exec("PRAGMA foreign_keys = ON");
    for (const f of all.filter((f) => files.includes(f.slice(0, 4)))) db.exec(readFileSync(`${dir}/${f}`, "utf8"));
    db.exec(`INSERT INTO runs (id, seed, triple, rotation, seating, rules_version, status, state, created_at, updated_at, model_set)
             VALUES ('study-t1-r1', 's', 1, 1, '{}', 'draft-4', 'over', '{}', 't', 't', 'study'), ('bot-t1-eq', 's', 0, 1, '{}', 'draft-4', 'over', '{}', 't', 't', 'bot')`);
    expect(() => db.exec("INSERT INTO runs (id, seed, triple, rotation, seating, rules_version, status, state, created_at, updated_at, model_set) VALUES ('x', 's', 1, 1, '{}', 'd', 'ready', '{}', 't', 't', 'study2')")).toThrow(/CHECK/);
    const before = db.prepare("SELECT * FROM runs ORDER BY id").all();
    db.exec(readFileSync(`${dir}/0014_study2.sql`, "utf8"));
    expect(db.prepare("SELECT * FROM runs ORDER BY id").all()).toEqual(before);
    expect((db.prepare("SELECT value FROM meta WHERE key = 'schema'").get() as { value: string }).value).toBe("0014");
    db.exec("INSERT INTO runs (id, seed, triple, rotation, seating, rules_version, status, state, created_at, updated_at, model_set) VALUES ('study2-t1-r1', 's', 1, 1, '{}', 'd', 'ready', '{}', 't', 't', 'study2')");
    expect(() => db.exec("INSERT INTO runs (id, seed, triple, rotation, seating, rules_version, status, state, created_at, updated_at, model_set) VALUES ('y', 's', 1, 1, '{}', 'd', 'ready', '{}', 't', 't', 'cheap')")).toThrow(/CHECK/);
  });
});
