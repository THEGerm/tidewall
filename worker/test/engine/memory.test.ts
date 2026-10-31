import { describe, expect, it } from "vitest";
import { PLAYERS, type PlayerName } from "../../src/engine/config";
import { playDay } from "../../src/engine/day";
import { createRun, getRun, saveDay, yesterday } from "../../src/engine/store";
import type { Event, Player, View } from "../../src/engine/types";
import { checkWire } from "../../src/engine/validate";
import { equilibriumPlayers } from "./bots";
import { testD1 } from "./d1";

// Bots that write a marked diary entry each day, record every view they get,
// and forget whatever the test asks them to.
function writers(seen: { who: PlayerName; v: View }[], forget: Partial<Record<PlayerName, number[]>> = {}) {
  const p = equilibriumPlayers("memory");
  for (const name of ["Council", "Chief", "Families", "Saltdogs"] as const) {
    const act = p[name].act;
    p[name] = { ...p[name], act: async (v: View) => { seen.push({ who: name, v }); return { ...(await act(v)), diary: `NOTE-${name}-day${v.day}`, forget: v.day === 3 ? forget[name] ?? [] : [] }; } };
  }
  const wire = p.World.wire!;
  p.World = { ...p.World, wire: async (events: Event[], errs?: string[], v?: View) => { if (v) seen.push({ who: "World", v }); return { ...(await wire(events, errs)), diary: `NOTE-World-day${v?.day}`, forget: v?.day === 3 ? forget.World ?? [] : [] }; } };
  return p as Record<PlayerName, Player>;
}

async function play(days: number, players: Record<PlayerName, Player>) {
  const db = testD1();
  await createRun(db, { id: "m", seed: "memory", triple: 1, rotation: 1, seating: { Government: "claude", Criminals: "gemini", World: "gpt" } });
  for (let i = 0; i < days; i++) {
    const run = (await getRun(db, "m"))!;
    await saveDay(db, "m", await playDay({ state: run.state, players, ...(await yesterday(db, "m", run.state.day)) }));
  }
  return db;
}

describe("diaries as memory (Germ, 31 Oct)", () => {
  it("gives each player its own kept entries each morning, and nobody else's", async () => {
    const seen: { who: PlayerName; v: View }[] = [];
    await play(3, writers(seen));
    const day3 = seen.filter((s) => s.v.day === 3);
    for (const who of PLAYERS) {
      const v = day3.find((s) => s.who === who)!.v;
      expect(v.notebook!.map((e) => e.text)).toEqual([`NOTE-${who}-day1`, `NOTE-${who}-day2`]);
      for (const other of PLAYERS) if (other !== who) expect(JSON.stringify(v)).not.toContain(`NOTE-${other}`);
    }
  });

  it("shows each player its own score, and none to the World", async () => {
    const seen: { who: PlayerName; v: View }[] = [];
    await play(2, writers(seen));
    expect(seen.find((s) => s.who === "Chief" && s.v.day === 2)!.v.score).toEqual(expect.any(Number));
    expect(seen.find((s) => s.who === "World")!.v.score).toBeUndefined();
  });

  it("forgets an entry from the next morning on, but keeps it in the record", async () => {
    const seen: { who: PlayerName; v: View }[] = [];
    const db = await play(4, writers(seen, { Families: [1], World: [2] }));
    const fam4 = seen.find((s) => s.who === "Families" && s.v.day === 4)!.v.notebook!.map((e) => e.day);
    expect(fam4).toEqual([2, 3]);
    const world4 = seen.find((s) => s.who === "World" && s.v.day === 4)!.v.notebook!.map((e) => e.day);
    expect(world4).toEqual([1, 3]);
    const row = await db.prepare("SELECT text, forgotten_on FROM diaries WHERE player = 'Families' AND day = 1").first<{ text: string; forgotten_on: number }>();
    expect(row).toEqual({ text: "NOTE-Families-day1", forgotten_on: 3 });
  });

  it("rejects forgetting a day the player has no entry for", () => {
    const events: Event[] = [{ id: "D1-E1", kind: "turf", public: true }, { id: "D1-E2", kind: "storm", public: true }];
    const wire = [{ headline: "a", text: "b", events: ["D1-E1"] }, { headline: "c", text: "d", events: ["D1-E2"] }];
    expect(checkWire({ wire, diary: "ok", forget: [5] }, events, [1, 2])).toEqual(["forget: you have no kept diary entry for day 5"]);
    expect(checkWire({ wire, diary: "ok", forget: [2] }, events, [1, 2])).toEqual([]);
  });
});
