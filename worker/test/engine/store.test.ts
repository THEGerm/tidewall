import { describe, expect, it } from "vitest";
import { playDay } from "../../src/engine/day";
import { createRun, exportRun, getRun, saveDay, yesterday } from "../../src/engine/store";
import { equilibriumPlayers } from "./bots";
import { testD1 } from "./d1";

const seating = { Government: "claude-opus-5-5", Criminals: "gemini", World: "gpt" };

async function playAndSave(db: D1Database, runId: string, days: number) {
  const players = equilibriumPlayers(runId);
  for (let i = 0; i < days; i++) {
    const run = (await getRun(db, runId))!;
    if (run.state.over) break;
    const y = await yesterday(db, runId, run.state.day);
    const r = await playDay({ state: run.state, players, ...y });
    await saveDay(db, runId, r, [{ player: "Chief", window: "after", text: "Long day.", reply: "Do what you think is best." }]);
  }
}

describe("storage", () => {
  it("creates a run ready at day 1", async () => {
    const db = testD1();
    const run = await createRun(db, { id: "t1-r1", seed: "seed-1", triple: 1, rotation: 1, seating });
    expect(run.state.day).toBe(1);
    expect((await getRun(db, "t1-r1"))?.status).toBe("ready");
  });

  it("saves days, reloads state, and plays a run to its end", async () => {
    const db = testD1();
    await createRun(db, { id: "r", seed: "store-run", triple: 1, rotation: 1, seating });
    await playAndSave(db, "r", 80);
    const run = (await getRun(db, "r"))!;
    expect(["over", "truncated"]).toContain(run.status);
    const out = await exportRun(db, "r");
    expect(out.days.length).toBe(run.state.day);
    expect(out.days.length).toBeGreaterThanOrEqual(12);
    expect(out.days.at(-1)!.ended).toBe(true);
    expect(out.days.slice(0, -1).every((d) => !d.ended)).toBe(true);
    expect(out.answers.every((a) => a.source === "player")).toBe(true);
    expect(out.confidant).toHaveLength(out.days.length);
  });

  it("replays the same as an in-memory run (state survives the round trip)", async () => {
    const db = testD1();
    await createRun(db, { id: "a", seed: "same", triple: 1, rotation: 1, seating });
    await playAndSave(db, "a", 12);
    const stored = await exportRun(db, "a");

    const players = equilibriumPlayers("a");
    let state = (await createRun(testD1(), { id: "b", seed: "same", triple: 1, rotation: 1, seating })).state;
    let pub: any[] = [];
    let wire: any[] = [];
    const moves = [];
    for (let i = 0; i < 12 && !state.over; i++) {
      const r = await playDay({ state, players, publicYesterday: pub, wireYesterday: wire });
      moves.push(r.moves);
      state = r.state;
      pub = r.publicEvents;
      wire = r.wire;
    }
    expect(JSON.stringify(stored.days.map((d) => d.moves))).toBe(JSON.stringify(moves));
  });

  it("gives the next day only yesterday's public events", async () => {
    const db = testD1();
    await createRun(db, { id: "p", seed: "pub", triple: 1, rotation: 1, seating });
    await playAndSave(db, "p", 3);
    const y = await yesterday(db, "p", 3);
    expect(y.publicYesterday.length).toBeGreaterThan(0);
    expect(y.publicYesterday.every((e) => e.public && e.id.startsWith("D2-"))).toBe(true);
    expect(y.wireYesterday.length).toBeGreaterThanOrEqual(2);
  });

  it("refuses a day out of order and keeps the run unchanged", async () => {
    const db = testD1();
    await createRun(db, { id: "o", seed: "order", triple: 1, rotation: 1, seating });
    const run = (await getRun(db, "o"))!;
    const r = await playDay({ state: run.state, players: equilibriumPlayers("o"), publicYesterday: [], wireYesterday: [] });
    await saveDay(db, "o", r);
    await expect(saveDay(db, "o", r)).rejects.toThrow(/expects day 2/);
    expect((await exportRun(db, "o")).days).toHaveLength(1);
  });

  it("writes a day all or nothing", async () => {
    const db = testD1();
    await createRun(db, { id: "x", seed: "atomic", triple: 1, rotation: 1, seating });
    const run = (await getRun(db, "x"))!;
    const r = await playDay({ state: run.state, players: equilibriumPlayers("x"), publicYesterday: [], wireYesterday: [] });
    const bad = { ...r, events: [...r.events, r.events[0]] }; // duplicate event id breaks the batch
    await expect(saveDay(db, "x", bad)).rejects.toThrow();
    expect((await exportRun(db, "x")).days).toHaveLength(0);
    expect((await getRun(db, "x"))!.state.day).toBe(1);
  });
});
