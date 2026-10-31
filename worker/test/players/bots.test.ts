import { describe, expect, it } from "vitest";
import { EQ_CRIME, EQ_INSPECT } from "../../src/engine/config";
import { afterDay } from "../../src/engine/continuation";
import { recentLog } from "../../src/engine/log";
import { playBots, tick } from "../../src/engine/runner";
import { createRun, exportRun, getRun, setStatus } from "../../src/engine/store";
import { testD1 } from "../engine/d1";

const seating = { Government: "claude", Criminals: "gemini", World: "gpt" } as const;
const env = () => ({ DB: testD1(), KEY_ENC_SECRET: "x".repeat(32) });

describe("bot runs (Germ, 31 Oct)", () => {
  it("a fixed-length run ends on its day and no other, past the hidden cap", () => {
    expect(afterDay("any", 9_999, 10_000)).toEqual({ over: false, truncated: false });
    expect(afterDay("any", 10_000, 10_000)).toEqual({ over: true, truncated: false });
    expect(afterDay("any", 60, 10_000).over).toBe(false);
  });

  it("plays a set-length bot run to the end at its own speed, keeping days and events only", async () => {
    const e = env();
    await createRun(e.DB, { id: "b", seed: "bot-seed-1", triple: 0, rotation: 1, seating, model_set: "bot", fixed_days: 300 });
    await setStatus(e.DB, "b", "running");
    let total = 0;
    for (let i = 0; i < 20 && (await getRun(e.DB, "b"))!.status === "running"; i++) total += (await playBots(e, { budgetMs: 60_000 })).days;
    expect(total).toBe(300);
    expect((await getRun(e.DB, "b"))!.status).toBe("over");
    const ex = await exportRun(e.DB, "b");
    expect(ex.days).toHaveLength(300);
    expect([ex.answers.length, ex.forecasts.length, ex.diaries.length, ex.wire.length, ex.ledger.length]).toEqual([0, 0, 0, 0, 0]);
    expect(ex.run).toMatchObject({ end_reason: "end draw after day 300", models: { all: expect.stringContaining("bots") } });
    // the bots mix at the solver's rates (loose bounds: 300 days)
    let open = 0, crime = 0, insp = 0;
    for (const d of ex.days) { open += d.open.length; insp += d.moves.inspect.length; crime += Object.values(d.moves.crime).filter(Boolean).length; }
    expect(Math.abs(crime / open - EQ_CRIME)).toBeLessThan(0.04);
    expect(Math.abs(insp / open - EQ_INSPECT)).toBeLessThan(0.04);
    expect((await recentLog(e.DB)).map((l) => l.text)).toEqual(expect.arrayContaining(["Bots started b (300 days).", "Bots finished b after 300 days."]));
  });

  it("stops when its time is up and carries on at the next tick, replaying exactly", async () => {
    const a = env(), b = env();
    for (const x of [a, b]) {
      await createRun(x.DB, { id: "b", seed: "bot-seed-2", triple: 0, rotation: 1, seating, model_set: "bot", fixed_days: 40 });
      await setStatus(x.DB, "b", "running");
    }
    let t = 0;
    const clock = () => (t += 10); // each check of the clock moves it on
    const first = await playBots(a, { budgetMs: 100, now: clock });
    expect(first.days).toBeGreaterThan(0);
    expect(first.days).toBeLessThan(40);
    while ((await getRun(a.DB, "b"))!.status === "running") await playBots(a, { budgetMs: 60_000 });
    await playBots(b, { budgetMs: 60_000 });
    const [x, y] = [await exportRun(a.DB, "b"), await exportRun(b.DB, "b")];
    expect(x.days.map((d) => d.moves)).toEqual(y.days.map((d) => d.moves));
  });

  it("audits at the 10% line, encroaches on request, and keeps a seed's crimes and inspections", async () => {
    const e = env();
    await createRun(e.DB, { id: "r", seed: "bot-seed-4", triple: 0, rotation: 1, seating, model_set: "bot", fixed_days: 400 });
    await createRun(e.DB, { id: "x", seed: "bot-seed-4", triple: 0, rotation: 1, seating, model_set: "bot", fixed_days: 400, bot_turf: "encroach" });
    for (const id of ["r", "x"]) await setStatus(e.DB, id, "running");
    while ((await getRun(e.DB, "x"))!.status === "running") await playBots(e, { budgetMs: 60_000 });
    const [r, x] = [await exportRun(e.DB, "r"), await exportRun(e.DB, "x")];
    let open = 0, audits = 0;
    for (const d of r.days) { open += d.open.length; audits += d.moves.audit.length; expect(d.moves.audit.length).toBeLessThanOrEqual(2); }
    expect(Math.abs(audits / open - 0.1)).toBeLessThan(0.03);
    expect(r.days.every((d) => d.moves.turf.Families === "respect" && d.moves.turf.Saltdogs === "respect")).toBe(true);
    expect(x.days.every((d) => d.moves.turf.Families === "encroach" && d.moves.turf.Saltdogs === "encroach")).toBe(true);
    // same seed: the same crimes and inspections, whatever the turf move
    expect(x.days.map((d) => [d.moves.crime, d.moves.inspect])).toEqual(r.days.map((d) => [d.moves.crime, d.moves.inspect]));
  });

  it("never enters the model schedule: no pace wait, no 'a run is paused', no model calls", async () => {
    const e = env();
    await createRun(e.DB, { id: "b", seed: "bot-seed-3", triple: 0, rotation: 1, seating, model_set: "bot", fixed_days: 5 });
    await setStatus(e.DB, "b", "paused");
    await e.DB.prepare("UPDATE meta SET value = 'on' WHERE key = 'schedule'").run();
    expect(await tick(e)).toEqual({ played: false, reason: "no run left to play" });
  });
});
