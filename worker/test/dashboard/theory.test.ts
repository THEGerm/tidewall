import { describe, expect, it } from "vitest";
// @ts-ignore: plain JS served to the browser, no type declarations
import { against, brierSkill, classify, panel, scoredOn } from "../../../dashboard/run/theory/metrics.js";

// Values printed by analysis/metrics (Python) for the same inputs, so the page
// and the paper compute the same numbers.
describe("game theory panel (D5): the port of analysis/metrics", () => {
  it("matches rates.against", () => {
    const r = against(11, 40, 4 / 15);
    expect(r.low).toBeCloseTo(0.16108016247667337, 12);
    expect(r.high).toBeCloseTo(0.42834955806210573, 12);
    expect(r.z).toBeCloseTo(0.11918282365569942, 12);
    expect(r.consistent).toBe(true);
  });

  it("matches beliefs.brier_skill for one event", () => {
    const pairs = [[0.2, true, "e"], [0.7, false, "e"], [0.4, true, "e"], [0.1, false, "e"]];
    expect(brierSkill(pairs, pairs)).toBeCloseTo(-0.5, 12);
  });

  it("matches turf.classify, ties in the same order", () => {
    const fits = classify([true, true, false, true, false], [true, false, true, false, false]);
    expect(fits.map((f: any) => [f.strategy, f.agreement])).toEqual([
      ["tit-for-tat", 1], ["grim trigger", 0.8], ["win-stay lose-shift", 0.8],
      ["always respect", 0.6], ["forgive one (tit-for-two-tats)", 0.6], ["always encroach", 0.4],
    ]);
  });

  it("never scores a player on an event its own moves decide", () => {
    expect(scoredOn("Families", "p_crime", "Port")).toBe(false);
    expect(scoredOn("Families", "p_crime", "Lowtown")).toBe(true);
    expect(scoredOn("Saltdogs", "p_both_respect", null)).toBe(false);
    expect(scoredOn("Chief", "p_inspect", "Port")).toBe(false);
    expect(scoredOn("Chief", "p_any_bribe_accepted", null)).toBe(false);
    expect(scoredOn("Council", "p_any_audit", null)).toBe(false);
    expect(scoredOn("World", "p_inspect", "Port")).toBe(true);
  });

  it("counts rates over open districts and keeps secrets out of a live run", () => {
    const open = ["Port", "Hightown", "Old Quarter", "Lowtown", "Market", "Seawall"];
    const moves = { crime: { Port: true, Lowtown: true }, inspect: ["Port"], audit: ["Market"], accepted: ["Hightown"],
      offers: { Families: { Hightown: 15 }, Saltdogs: {} }, turf: { Families: "respect", Saltdogs: "encroach" } };
    const days = [{ day: 1, open, moves, welfare: 3 }, { day: 2, open: open.slice(1), moves: { ...moves, crime: {} }, welfare: 9 }];
    const p = panel({ days, secret: true });
    expect([p.crime.k, p.crime.n]).toEqual([2, 11]);
    expect([p.inspection.k, p.audit.k, p.bribes.offered, p.bribes.taken]).toEqual([1, 2, 2, 2]); // Port is closed on day 2
    expect(p.welfare).toMatchObject({ total: 12, best: 24, share: 0.5 });
    const live = panel({ days: days.map((d) => ({ day: d.day, open: d.open, moves: { crime: d.moves.crime, turf: d.moves.turf } })), secret: false });
    expect([live.inspection, live.audit, live.bribes, live.forecasts, live.answers, live.welfare]).toEqual([null, null, null, null, null, null]);
    expect(live.crime.k).toBe(2);
  });
});
