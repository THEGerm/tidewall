import { describe, expect, it } from "vitest";
import { handlePublic } from "../../src/api/public";
import { playDay } from "../../src/engine/day";
import { createRun, getRun, saveDay, setStatus, yesterday } from "../../src/engine/store";
import type { Player, View } from "../../src/engine/types";
import { equilibriumPlayers } from "./bots";
import { testD1 } from "./d1";

const seating = { Government: "claude", Criminals: "gemini", World: "gpt" };

// Bots that leave a secret in every place a secret can live: messages,
// diaries, bribes (offered and taken) and empty inspections.
function leakyPlayers(seed: string) {
  const p = equilibriumPlayers(seed);
  const say = (from: string): Player["messages"] => async () => ({ messages: [{ to: "Chief", text: `SECRET message from ${from}` }] });
  for (const name of ["Families", "Saltdogs", "Council"] as const) p[name] = { ...p[name], messages: say(name) };
  for (const g of ["Families", "Saltdogs"] as const) {
    const act = p[g].act;
    p[g] = {
      ...p[g],
      bribeOffers: async (v: View) => ({ bribe_offers: Object.fromEntries(v.open.slice(0, 2).map((d) => [d, 15])) }),
      act: async (v: View) => ({ ...(await act(v)), diary: `SECRET diary of ${g}` }),
    };
  }
  p.Chief = {
    ...p.Chief,
    bribeAnswers: async (v: View) => ({ bribe_answers: Object.fromEntries(Object.keys(v.offersToAnswer ?? {}).map((d) => [d, "accept"])) }),
    act: async (v: View) => ({ moves: { inspect: v.open.filter((d) => !(v.acceptedToday ?? []).includes(d)) }, diary: "SECRET diary of the Chief" }),
  };
  return p;
}

async function setup(days: number) {
  const db = testD1();
  await createRun(db, { id: "t1-r1", seed: "public-cut", triple: 1, rotation: 1, seating });
  const players = leakyPlayers("public-cut");
  for (let i = 0; i < days; i++) {
    const run = (await getRun(db, "t1-r1"))!;
    if (run.state.over) break;
    const r = await playDay({ state: run.state, players, ...(await yesterday(db, "t1-r1", run.state.day)) });
    await saveDay(db, "t1-r1", r, [{ player: "Chief", window: "after", text: "Took money today.", reply: "Be careful." }]);
  }
  const env = { DB: db } as any;
  const get = async (path: string) => {
    const res = await handlePublic(new Request(`https://x${path}`), env, new URL(`https://x${path}`));
    return { status: res.status, cache: res.headers.get("Cache-Control"), body: (await res.json()) as any };
  };
  return { db, get };
}

const SECRET_KEYS = ["moves", "messages", "diaries", "forecasts", "answers", "welfare", "seed"];

describe("public API", () => {
  it("never shows a live run's secrets", async () => {
    const { db, get } = await setup(6);
    const hidden = await db.prepare("SELECT COUNT(*) AS n FROM events WHERE public = 0").first<{ n: number }>();
    expect(hidden!.n).toBeGreaterThan(0); // the run really has secrets to keep

    const bodies = [(await get("/api/runs")).body, (await get("/api/runs/t1-r1")).body, (await get("/api/runs/t1-r1/ledger")).body];
    for (let d = 1; d <= 6; d++) {
      const r = await get(`/api/runs/t1-r1/days/${d}`);
      expect(r.status).toBe(200);
      expect(r.cache).toBe("no-store");
      expect(r.body.events.every((e: any) => e.public)).toBe(true);
      for (const k of SECRET_KEYS) expect(r.body).not.toHaveProperty(k);
      bodies.push(r.body);
    }
    const text = JSON.stringify(bodies);
    expect(text).not.toContain("SECRET");
    for (const kind of ["bribe_offer", "bribe_accepted", "bribe_refused", "inspection_empty", "audit_clean"]) expect(text).not.toContain(kind);
    expect((await get("/api/runs/t1-r1")).body.run).not.toHaveProperty("seed");
    expect((await get("/api/runs/t1-r1/export")).status).toBe(404);
  });

  it("shows confidant texts live, under the CONFIDENTIAL label", async () => {
    const { get } = await setup(2);
    const r = (await get("/api/runs/t1-r1/days/1")).body;
    expect(r.confidant.label).toBe("CONFIDENTIAL");
    expect(r.confidant.texts).toEqual([{ player: "Chief", window: "after", text: "Took money today.", reply: "Be careful." }]);
  });

  it("opens everything once the run ends", async () => {
    const { db, get } = await setup(3);
    await setStatus(db, "t1-r1", "over");
    const r = await get("/api/runs/t1-r1/days/1");
    expect(r.cache).toContain("max-age");
    expect(r.body.events.some((e: any) => !e.public)).toBe(true);
    expect(JSON.stringify(r.body.messages)).toContain("SECRET message");
    expect(JSON.stringify(r.body.diaries)).toContain("SECRET diary");
    expect(r.body.moves.accepted.length).toBeGreaterThan(0);
    expect((await get("/api/runs/t1-r1")).body.run.seed).toBe("public-cut");
    const ex = await get("/api/runs/t1-r1/export");
    expect(ex.status).toBe(200);
    expect(ex.body.days).toHaveLength(3);
    expect(Array.isArray(ex.body.ledger)).toBe(true);
    expect(JSON.stringify(ex.body)).not.toContain("payer_email");
  });

  it("charts scores, treasury, prison and turf for every played day", async () => {
    const { get } = await setup(5);
    const { run, days } = (await get("/api/runs/t1-r1")).body;
    expect(run.days).toBe(5);
    expect(days.map((d: any) => d.day)).toEqual([1, 2, 3, 4, 5]);
    const last = days.at(-1);
    const sum = (k: string) => days.reduce((a: number, d: any) => a + d.delta[k], 0);
    expect(last.scores.Families).toBe(sum("Families"));
    expect(last.treasury).toBe(1000 + sum("Council"));
    expect(last.prison).toBeGreaterThanOrEqual(0);
    expect(["respect", "encroach"]).toContain(last.turf.Families);
  });

  it("lists runs with days played, and answers 404 and 405 plainly", async () => {
    const { get } = await setup(2);
    const list = (await get("/api/runs")).body.runs;
    expect(list).toEqual([expect.objectContaining({ id: "t1-r1", days: 2, live: true, model_set: "study", cost_usd: 0 })]);
    expect((await get("/api/runs/nope")).status).toBe(404);
    expect((await get("/api/runs/t1-r1/days/99")).status).toBe(404);
    expect((await get("/api/runs/t1-r1/other")).status).toBe(404);
    const env = { DB: testD1() } as any;
    const res = await handlePublic(new Request("https://x/api/runs", { method: "POST" }), env, new URL("https://x/api/runs"));
    expect(res.status).toBe(405);
  });
});
