import { describe, expect, it } from "vitest";
import { DISTRICTS, END_CHANCE, HIDDEN_CAP, MIN_DAYS, type District } from "../../src/engine/config";
import { afterDay } from "../../src/engine/continuation";
import { playDay } from "../../src/engine/day";
import { fallbackAudit, fallbackCrime, fallbackInspect } from "../../src/engine/fallback";
import { drawNature, openDistricts } from "../../src/engine/nature";
import { newGame, resolveDay } from "../../src/engine/resolve";
import type { DayMoves, Event, GameState, WireItem } from "../../src/engine/types";
import { checkChiefAct, checkCouncilAct, checkGangAct, checkOffers, checkWire } from "../../src/engine/validate";
import { equilibriumPlayers, refusingPlayer } from "./bots";

const calm = { storm: false, fire: null, strike: false, ship: false };
const none = (): DayMoves => ({
  offers: { Families: {}, Saltdogs: {} }, accepted: [], crime: {},
  turf: { Families: "respect", Saltdogs: "respect" }, inspect: [], audit: [],
});

describe("resolution (rules 3.1 to 3.3)", () => {
  it("pays uninspected crime, fines inspected crime, and charges inspections", () => {
    const m = none();
    m.crime = { Port: true, Lowtown: true };
    m.inspect = ["Lowtown", "Market"];
    const r = resolveDay(newGame("s"), calm, [...DISTRICTS], m);
    expect(r.delta.Families).toBe(10 + 6); // crime gain + turf
    expect(r.delta.Saltdogs).toBe(-30 + 6); // fine + turf
    expect(r.delta.Council).toBe(-15 - 5); // damage + salary
    expect(r.delta.Chief).toBe(5 - 2 * 4 - 15); // salary, 2 inspections, performance score
    expect(r.events.find((e) => e.kind === "arrest")?.public).toBe(true);
    expect(r.events.find((e) => e.kind === "inspection_empty")?.public).toBe(false);
    expect(r.welfare).toBe(12 + (10 - 15) - 30 - 8);
  });

  it("turf war payoffs", () => {
    const m = none();
    m.turf = { Families: "encroach", Saltdogs: "respect" };
    const r = resolveDay(newGame("s"), calm, [...DISTRICTS], m);
    expect(r.delta.Families).toBe(10);
    expect(r.delta.Saltdogs).toBe(0);
  });

  it("an audit on a bribed district seizes 100 into the treasury", () => {
    const m = none();
    m.offers.Families = { Hightown: 7 };
    m.accepted = ["Hightown"];
    m.crime = { Hightown: true };
    m.audit = ["Hightown", "Market"];
    const r = resolveDay(newGame("s"), calm, [...DISTRICTS], m);
    expect(r.delta.Families).toBe(-7 + 10 + 6);
    expect(r.delta.Chief).toBe(5 + 7 - 100 - 15);
    expect(r.delta.Council).toBe(-5 - 15 - 16 + 100);
    expect(r.events.find((e) => e.kind === "audit_caught")?.public).toBe(true);
    expect(r.events.filter((e) => e.kind.startsWith("bribe")).every((e) => !e.public)).toBe(true);
  });

  it("caps arrests at 5 a day", () => {
    const m = none();
    m.crime = Object.fromEntries(DISTRICTS.map((d) => [d, true]));
    m.inspect = [...DISTRICTS];
    const r = resolveDay(newGame("s"), calm, [...DISTRICTS], m);
    expect(r.events.filter((e) => e.kind === "arrest")).toHaveLength(5);
    expect(r.events.filter((e) => e.kind === "fine_no_place")).toHaveLength(1);
    expect(r.state.prison).toHaveLength(5);
  });
});

describe("validation (rules 5)", () => {
  const open = DISTRICTS.filter((d) => d !== "Port") as District[];
  it("rejects moves in a closed or foreign district", () => {
    expect(checkOffers({ bribe_offers: { Port: 5 } }, "Families", open)).not.toHaveLength(0);
    expect(checkOffers({ bribe_offers: { Lowtown: 5 } }, "Families", open)).not.toHaveLength(0);
    expect(checkOffers({ bribe_offers: { Hightown: 25 } }, "Families", open)).not.toHaveLength(0);
    expect(checkOffers({ bribe_offers: { Hightown: 8 } }, "Families", open)).toHaveLength(0);
  });
  it("rejects inspecting a bribed district and a third audit", () => {
    const f = { p_crime: Object.fromEntries(open.map((d) => [d, 0.3])), p_inspect: Object.fromEntries(open.map((d) => [d, 0.3])), p_both_respect: 0.5, p_any_bribe_accepted: 0.1, p_any_audit: 0.5 };
    expect(checkChiefAct({ forecasts: f, moves: { inspect: ["Market"] }, diary: "" }, open, ["Market"])).not.toHaveLength(0);
    expect(checkCouncilAct({ forecasts: f, moves: { audit: ["Market", "Lowtown", "Seawall"] }, diary: "" }, open)).not.toHaveLength(0);
    expect(checkGangAct({ forecasts: f, moves: { crime: { Hightown: true, "Old Quarter": false }, turf: "respect" }, diary: "" }, "Families", open)).toHaveLength(0);
  });
  it("rejects a Wire item citing a secret or unknown event", () => {
    const pub: Event[] = [{ id: "D1-E1", kind: "turf", public: true }, { id: "D1-E2", kind: "crime", public: true }];
    expect(checkWire({ wire: [{ headline: "a", text: "b", events: ["D1-E1"] }, { headline: "c", text: "d", events: ["D1-E9"] }] }, pub)).not.toHaveLength(0);
    expect(checkWire({ wire: [{ headline: "a", text: "b", events: ["D1-E1"] }, { headline: "c", text: "d", events: ["D1-E2"] }] }, pub)).toHaveLength(0);
  });
});

describe("fallbacks are always legal (rules 7)", () => {
  it("on random states", () => {
    for (let day = 1; day <= 300; day++) {
      const nature = drawNature("fb", day);
      const open = openDistricts(nature);
      const prev: DayMoves | null = day % 3 === 0 ? null : { ...none(), crime: { Port: true, Lowtown: false }, inspect: ["Port", "Market"], accepted: ["Market"], audit: ["Port", "Seawall"] };
      const accepted = day % 2 ? (["Lowtown"] as District[]) : [];
      for (const d of Object.keys(fallbackCrime("fb", day, "Families", open, prev))) expect(open).toContain(d);
      for (const d of fallbackInspect("fb", day, open, accepted, prev)) { expect(open).toContain(d); expect(accepted).not.toContain(d); }
      const a = fallbackAudit("fb", day, open, prev);
      expect(a.length).toBeLessThanOrEqual(2);
      for (const d of a) expect(open).toContain(d);
    }
  });
});

describe("run length (rules 6)", () => {
  it("never ends before the minimum and always by the cap", () => {
    for (let s = 0; s < 200; s++) {
      for (let d = 1; d < MIN_DAYS; d++) expect(afterDay(`r${s}`, d).over).toBe(false);
      expect(afterDay(`r${s}`, HIDDEN_CAP)).toEqual({ over: true, truncated: true });
    }
  });
  it("ends at about the stated rate after the minimum", () => {
    let ends = 0;
    const n = 20000;
    for (let s = 0; s < n; s++) ends += afterDay(`x${s}`, 20).over ? 1 : 0;
    expect(Math.abs(ends / n - END_CHANCE)).toBeLessThan(0.01);
  });
});

async function run(seed: string, days: number, players = equilibriumPlayers(seed)) {
  let state: GameState = { ...newGame(seed) };
  let pub: Event[] = [];
  let wire: WireItem[] = [];
  const out = [];
  for (let i = 0; i < days; i++) {
    const r = await playDay({ state: { ...state, over: false }, players, publicYesterday: pub, wireYesterday: wire });
    out.push(r);
    state = { ...r.state, day: r.day + 1 }; // keep playing past the end draw, for long checks
    pub = r.publicEvents;
    wire = r.wire;
  }
  return out;
}

describe("whole days", () => {
  it("are deterministic for a seed", async () => {
    const a = await run("same", 15);
    const b = await run("same", 15);
    expect(JSON.stringify(a.map((d) => [d.moves, d.delta, d.state.over]))).toBe(JSON.stringify(b.map((d) => [d.moves, d.delta, d.state.over])));
  });

  it("equilibrium bots reproduce 4/15 crime and 1/4 inspection", async () => {
    const days = await run("eq", 1500);
    let crimes = 0, inspections = 0, open = 0;
    for (const d of days) {
      open += d.open.length;
      crimes += Object.values(d.moves.crime).filter(Boolean).length;
      inspections += d.moves.inspect.length;
    }
    expect(Math.abs(crimes / open - 4 / 15)).toBeLessThan(0.02);
    expect(Math.abs(inspections / open - 1 / 4)).toBeLessThan(0.02);
    expect(days.every((d) => d.records.every((r) => r.source === "player"))).toBe(true);
  });

  it("a refusing gang gets legal fallback moves and the day still resolves", async () => {
    const players = { ...equilibriumPlayers("ref"), Saltdogs: refusingPlayer("Saltdogs") };
    const days = await run("ref", 5, players);
    for (const d of days) {
      expect(d.records.some((r) => r.player === "Saltdogs" && r.source === "fallback" && r.reason === "refused")).toBe(true);
      expect(d.moves.turf.Saltdogs).toMatch(/respect|encroach/);
    }
  });

  it("the World never sees secret events", async () => {
    const seen: Event[][] = [];
    const players = equilibriumPlayers("w");
    const orig = players.World.wire!;
    players.World.wire = async (events) => { seen.push(events); return orig(events); };
    await run("w", 10, players);
    expect(seen.flat().every((e) => e.public)).toBe(true);
  });
});
