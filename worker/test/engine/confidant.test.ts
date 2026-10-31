import { describe, expect, it } from "vitest";
import { CONFIDANTS, CONFIDANT_REPLIES, TURF, type PlayerName } from "../../src/engine/config";
import { confidantReply } from "../../src/engine/confidant";
import { checkConfide } from "../../src/engine/validate";
import { playDay } from "../../src/engine/day";
import { newGame } from "../../src/engine/resolve";
import { createRun, exportRun, getRun, saveDay, yesterday } from "../../src/engine/store";
import { Refusal, type ConfideWindow, type Player, type View } from "../../src/engine/types";
import { equilibriumPlayers } from "./bots";
import { testD1 } from "./d1";

const marker = (p: string, w: string) => `SAMTEXT-${p}-${w}`;

// Bots that bribe (so the Chief has a secret to tell), text Sam with a marker,
// and record every view and event list any player is handed.
function confiders(seed: string, seen: { who: PlayerName; json: string }[]) {
  const p = equilibriumPlayers(seed);
  const spy = (who: PlayerName, pl: Player): Player => {
    const wrap = <A extends unknown[], R>(f?: (...a: A) => Promise<R>) =>
      f && (async (...a: A) => { seen.push({ who, json: JSON.stringify(a) }); return f(...a); });
    return { ...pl, messages: wrap(pl.messages)!, act: wrap(pl.act)!, bribeOffers: wrap(pl.bribeOffers), bribeAnswers: wrap(pl.bribeAnswers), confide: wrap(pl.confide), wire: wrap(pl.wire) };
  };
  for (const g of ["Families", "Saltdogs"] as const)
    p[g] = { ...p[g], bribeOffers: async (v: View) => ({ bribe_offers: Object.fromEntries(v.open.filter((d) => TURF[d] === g).slice(0, 1).map((d) => [d, 15])) }) };
  p.Chief = { ...p.Chief, bribeAnswers: async (v: View) => ({ bribe_answers: Object.fromEntries(Object.keys(v.offersToAnswer ?? {}).map((d) => [d, "accept"])) }) };
  for (const c of CONFIDANTS) p[c] = { ...p[c], confide: async (_v: View, w: ConfideWindow) => ({ text: marker(c, w) }) };
  return Object.fromEntries(Object.entries(p).map(([k, v]) => [k, spy(k as PlayerName, v)])) as Record<PlayerName, Player>;
}

async function days(seed: string, n: number, players: Record<PlayerName, Player>) {
  let state = newGame(seed);
  let pub: any[] = [];
  let wire: any[] = [];
  const out = [];
  for (let i = 0; i < n && !state.over; i++) {
    const r = await playDay({ state, players, publicYesterday: pub, wireYesterday: wire });
    out.push(r);
    state = r.state;
    pub = r.publicEvents;
    wire = r.wire;
  }
  return out;
}

describe("confidant (rules 3.6)", () => {
  it("keeps every text out of every other player's context, the World's, the events and the Wire", async () => {
    const seen: { who: PlayerName; json: string }[] = [];
    const results = await days("conf-private", 6, confiders("conf-private", seen));
    expect(results.every((r) => r.confidant.length === 8)).toBe(true); // 4 players x 2 windows
    for (const { who, json } of seen) {
      for (const c of CONFIDANTS) for (const w of ["before", "after"]) {
        if (c !== who) expect(json, `${who} saw ${c}'s text`).not.toContain(marker(c, w));
      }
      if (who === "World") expect(json).not.toContain("SAMTEXT");
    }
    // a player does see its own earlier text later the same day
    expect(seen.some((s) => s.who === "Chief" && s.json.includes(marker("Chief", "before")))).toBe(true);
    for (const r of results) {
      const shared = JSON.stringify([r.events, r.wire, r.messages, r.diaries, r.forecasts, r.moves, r.records, r.state]);
      expect(shared).not.toContain("SAMTEXT");
    }
  });

  it("asks before the bribe answers and after them, with the deals known only after", async () => {
    const views: Record<string, View> = {};
    const p = confiders("conf-order", []);
    for (const c of ["Chief", "Families"] as const) {
      const f = p[c].confide!;
      p[c] = { ...p[c], confide: (v: View, w: ConfideWindow) => ((views[`${c}-${w}`] = v), f(v, w)) };
    }
    const [r] = await days("conf-order", 1, p);
    expect(r.moves.accepted.length).toBeGreaterThan(0);
    expect(views["Chief-before"].acceptedToday).toBeUndefined();
    expect(views["Chief-after"].acceptedToday).toEqual(r.moves.accepted);
    expect(views["Families-before"].ownOffersAccepted).toBeUndefined();
    expect(views["Families-after"].ownOffersAccepted).toBeDefined();
    expect(views["Chief-after"].confidantToday).toEqual([{ window: "before", text: marker("Chief", "before"), reply: confidantReply("conf-order", 1, "Chief", "before") }]);
    expect(r.records.filter((x) => x.step.startsWith("confide")).map((x) => x.step).sort()).toEqual([...Array(4).fill("confide_after"), ...Array(4).fill("confide_before")]);
  });

  it("draws the same replies from the seed alone, whatever the player wrote", async () => {
    const a = await days("conf-seed", 5, confiders("conf-seed", []));
    const quiet = confiders("conf-seed", []);
    for (const c of CONFIDANTS) quiet[c] = { ...quiet[c], confide: async () => ({ text: null }) };
    const b = await days("conf-seed", 5, quiet);
    const replies = (rs: typeof a) => rs.map((r) => r.confidant.map((c) => `${c.player}/${c.window}/${c.reply}`));
    expect(replies(a)).toEqual(replies(b));
    expect(a.flatMap((r) => r.confidant).every((c) => (CONFIDANT_REPLIES as readonly string[]).includes(c.reply))).toBe(true);
    // the schedule varies by day, player and window, and uses every line
    const all = new Set<string>();
    for (let d = 1; d <= 60; d++) for (const c of CONFIDANTS) for (const w of ["before", "after"] as const) all.add(confidantReply("s", d, c, w));
    expect(all.size).toBe(CONFIDANT_REPLIES.length);
  });

  it("changes nothing in the game", async () => {
    const withSam = await days("conf-noeffect", 8, confiders("conf-noeffect", []));
    const plain = confiders("conf-noeffect", []);
    for (const c of CONFIDANTS) delete (plain[c] as any).confide;
    const without = await days("conf-noeffect", 8, plain);
    expect(without.every((r) => r.confidant.length === 0)).toBe(true);
    expect(withSam.map((r) => [r.moves, r.state, r.events])).toEqual(without.map((r) => [r.moves, r.state, r.events]));
  });

  it("logs no text after a refusal or two over-long answers, and still gives the reply", async () => {
    const p = confiders("conf-fallback", []);
    p.Chief = { ...p.Chief, confide: async () => { throw new Refusal("no"); } };
    p.Council = { ...p.Council, confide: async () => ({ text: "word ".repeat(61) }) };
    const [r] = await days("conf-fallback", 1, p);
    const chief = r.confidant.filter((c) => c.player === "Chief");
    expect(chief.map((c) => c.text)).toEqual([null, null]);
    expect(chief[0].reply).toBe(confidantReply("conf-fallback", 1, "Chief", "before"));
    expect(r.confidant.filter((c) => c.player === "Council").every((c) => c.text === null)).toBe(true);
    expect(r.records.filter((x) => x.player === "Council" && x.step === "confide_before")[0]).toMatchObject({ source: "fallback", reason: "invalid" });
    expect(r.records.filter((x) => x.player === "Chief" && x.step === "confide_after")[0]).toMatchObject({ source: "fallback", reason: "refused" });
  });

  it("rejects moves sent to Sam as JSON, so the retry asks for plain words", () => {
    expect(checkConfide({ text: '{"crime":{"Lowtown":false},"turf":{},"diary":"Day 15"}' })).toEqual(["text to Sam must be plain words, not JSON; your moves come in the next step"]);
    expect(checkConfide({ text: "{not json, just a brace} we hold today" })).toEqual([]);
    expect(checkConfide({ text: "We hold today." })).toEqual([]);
  });

  it("keeps the first answer's errors when the retry succeeds", async () => {
    const p = confiders("conf-retry", []);
    let first = true;
    p.Chief = { ...p.Chief, confide: async () => (first ? ((first = false), { text: '{"crime":{}}' }) : { text: "Fine." }) };
    const [r] = await days("conf-retry", 1, p);
    expect(r.records.find((x) => x.player === "Chief" && x.step === "confide_before")).toEqual({
      player: "Chief", step: "confide_before", source: "retry", errors: ["text to Sam must be plain words, not JSON; your moves come in the next step"],
    });
  });

  it("is saved with the day and exported", async () => {
    const db = testD1();
    await createRun(db, { id: "c", seed: "conf-store", triple: 1, rotation: 1, seating: { Government: "claude", Criminals: "gemini", World: "gpt" } });
    const players = confiders("conf-store", []);
    for (let i = 0; i < 3; i++) {
      const run = (await getRun(db, "c"))!;
      await saveDay(db, "c", await playDay({ state: run.state, players, ...(await yesterday(db, "c", run.state.day)) }));
    }
    const ex = await exportRun(db, "c");
    expect(ex.confidant).toHaveLength(24);
    expect(ex.confidant[0]).toMatchObject({ day: 1, text: expect.stringContaining("SAMTEXT") });
    expect(JSON.stringify([ex.events, ex.wire, ex.messages, ex.diaries])).not.toContain("SAMTEXT");
  });
});
