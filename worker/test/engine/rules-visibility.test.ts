import { describe, expect, it } from "vitest";
import { handleControl } from "../../src/api/control";
import { playDay } from "../../src/engine/day";
import { newGame } from "../../src/engine/resolve";
import { createRun, getRun, saveDay, secretsFor, yesterday } from "../../src/engine/store";
import type { Event, Player, View } from "../../src/engine/types";
import { equilibriumPlayers } from "./bots";
import { testD1 } from "./d1";
// @ts-ignore: plain JS served to the browser
import { panel } from "../../../dashboard/run/theory/metrics.js";

const seating = { Government: "claude", Criminals: "gemini", World: "gpt" } as const;

// Bots that bribe, so every kind of secret event happens.
function briberies(seed: string, seen: { who: string; v: View }[] = []) {
  const p = equilibriumPlayers(seed, { audit: true });
  for (const g of ["Families", "Saltdogs"] as const) {
    const act = p[g].act;
    p[g] = { ...p[g], bribeOffers: async (v: View) => ({ bribe_offers: Object.fromEntries(v.open.filter((d) => ({ Families: ["Port", "Hightown", "Old Quarter"], Saltdogs: ["Lowtown", "Market", "Seawall"] })[g].includes(d)).slice(0, 1).map((d) => [d, 12])) }), act: async (v: View) => (seen.push({ who: g, v }), act(v)) };
  }
  p.Chief = { ...p.Chief, bribeAnswers: async (v: View) => ({ bribe_answers: Object.fromEntries(Object.keys(v.offersToAnswer ?? {}).map((d, i) => [d, i === 0 ? "accept" : "refuse"])) }) };
  for (const n of ["Chief", "Council", "World"] as const) { const act = p[n].act; p[n] = { ...p[n], act: async (v: View) => (seen.push({ who: n, v }), act(v)) }; }
  return p;
}

describe("fixes from Vishnu's review (31 Oct)", () => {
  it("numbers public and secret events apart, so public gaps reveal nothing (#105)", async () => {
    let state = newGame("ids-seed");
    for (let d = 0; d < 10; d++) {
      const r = await playDay({ state, players: briberies("ids-seed"), publicYesterday: [], wireYesterday: [] });
      const pub = r.events.filter((e) => e.public).map((e) => e.id);
      expect(pub).toEqual(pub.map((_, i) => `D${r.day}-E${i + 1}`));
      expect(r.events.filter((e) => !e.public).every((e) => /^D\d+-S\d+$/.test(e.id))).toBe(true);
      state = r.state;
    }
  });

  it("gives each player its own secret results the next morning, and the World none (#108)", () => {
    const ev = (kind: string, actor?: string, gang?: string): Event => ({ id: "x", kind, public: false, ...(actor ? { actor } : {}), ...(gang ? { detail: { gang } } : {}) } as Event);
    const all = [ev("bribe_offer", "Families"), ev("bribe_accepted", "Chief", "Families"), ev("bribe_offer", "Saltdogs"), ev("bribe_refused", "Chief", "Saltdogs"), ev("inspection_empty", "Chief"), ev("audit_clean", "Council")];
    expect(secretsFor("Chief", all).map((e) => e.kind)).toEqual(["bribe_offer", "bribe_accepted", "bribe_offer", "bribe_refused", "inspection_empty"]);
    expect(secretsFor("Council", all).map((e) => e.kind)).toEqual(["audit_clean"]);
    expect(secretsFor("Families", all).map((e) => e.kind)).toEqual(["bribe_offer", "bribe_accepted"]);
    expect(secretsFor("Saltdogs", all).map((e) => e.kind)).toEqual(["bribe_offer", "bribe_refused"]);
    expect(secretsFor("World", all)).toEqual([]);
  });

  it("puts them in the player's view on the next day", async () => {
    const db = testD1();
    await createRun(db, { id: "v", seed: "vis-seed", triple: 0, rotation: 1, seating });
    const seen: { who: string; v: View }[] = [];
    for (let i = 0; i < 4; i++) {
      const run = (await getRun(db, "v"))!;
      await saveDay(db, "v", await playDay({ state: run.state, players: briberies("vis-seed", seen), ...(await yesterday(db, "v", run.state.day)) }));
    }
    const day = (who: string, d: number) => seen.find((s) => s.who === who && s.v.day === d)!.v;
    expect(day("Chief", 1).privateYesterday).toBeUndefined();
    expect(day("Chief", 3).privateYesterday!.some((e) => e.kind.startsWith("bribe_"))).toBe(true);
    expect(day("World", 3).privateYesterday).toBeUndefined();
    for (const g of ["Families", "Saltdogs"]) expect(day(g, 3).privateYesterday!.every((e) => (e.detail as any)?.gang === g || e.actor === g)).toBe(true);
    expect(JSON.stringify(day("World", 3))).not.toMatch(/inspection_empty|audit_clean|bribe_/);
  });

  it("keeps a player's moves when its diary is too long twice, and drops only the diary (#109)", async () => {
    const p = briberies("diary-seed");
    const act = p.Chief.act;
    p.Chief = { ...p.Chief, act: async (v: View) => ({ ...(await act(v)), diary: "word ".repeat(150) }) };
    const r = await playDay({ state: newGame("diary-seed"), players: p, publicYesterday: [], wireYesterday: [] });
    expect(r.records.find((x) => x.player === "Chief" && x.step === "act")).toMatchObject({ source: "retry", reason: "diary_dropped" });
    expect(r.diaries.Chief).toBe("");
  });

  it("refuses a study run whose seed differs from its triple's (#110)", async () => {
    const db = testD1();
    const env = { DB: db } as any;
    const post = async (body: unknown) => (await handleControl(new Request("https://x/api/me/control/runs", { method: "POST", body: JSON.stringify(body) }), env, "runs", "Germ")).status;
    expect(await post({ id: "t2-r1", seed: "triple-two-seed", triple: 2, rotation: 1, seating, model_set: "study" })).toBe(200);
    expect(await post({ id: "t2-r2", seed: "another-seed-1", triple: 2, rotation: 2, seating: { Government: "gemini", Criminals: "gpt", World: "claude" }, model_set: "study" })).toBe(400);
    expect(await post({ id: "t2-r3", seed: "triple-two-seed", triple: 2, rotation: 2, seating: { Government: "gemini", Criminals: "gpt", World: "claude" }, model_set: "study" })).toBe(200);
    expect(await post({ id: "t2-x", seed: "another-seed-1", triple: 2, rotation: 1, seating, model_set: "test" })).toBe(200); // test runs are free to differ
  });

  it("the theory page counts inspections over districts the Chief could inspect (#107)", () => {
    const open = ["Port", "Hightown", "Old Quarter", "Lowtown"];
    const p = panel({ secret: true, days: [{ day: 1, open, welfare: 0, moves: { crime: {}, inspect: ["Port"], audit: [], accepted: ["Hightown", "Lowtown"], offers: {}, turf: { Families: "respect", Saltdogs: "respect" } } }] });
    expect([p.inspection.k, p.inspection.n]).toEqual([1, 2]);
  });
});
