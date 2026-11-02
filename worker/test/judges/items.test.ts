// Items from a real export (data/runs/test/012-smoke-test.json): what each
// judge sees, and that it never sees who played.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { altSample, itemsOf, movesOf, secretFacts } from "../../src/judges/items";

const ex = JSON.parse(readFileSync(join(fileURLToPath(new URL(".", import.meta.url)), "../../../data/runs/test/012-smoke-test.json"), "utf8"));

describe("judge items", () => {
  const items = itemsOf(ex);

  it("makes one tone item per Wire item, one leak item per text to Sam, one deception item per player-day with words", () => {
    expect(items.filter((i) => i.task === "tone")).toHaveLength(ex.wire.length);
    expect(items.filter((i) => i.task === "leak")).toHaveLength(ex.confidant.filter((c: any) => c.text).length);
    const deception = items.filter((i) => i.task === "deception");
    expect(deception.length).toBeGreaterThan(0);
    expect(deception.every((i) => i.player !== "World")).toBe(true);
    expect(new Set(items.map((i) => i.id)).size).toBe(items.length);
  });

  it("never shows a model, a provider, a seat holder or the run ID", () => {
    const sent = JSON.stringify(items.map((i) => i.input));
    expect(sent).not.toMatch(/claude|gemini|gpt|anthropic|openai|google|smoke-test|012/i);
  });

  it("fences every judged text and gives the cited public events", () => {
    const tone = items.find((i) => i.task === "tone")!;
    expect(tone.input.headline).toMatch(/^<<<DATA\n[\s\S]*\nDATA>>>$/);
    expect(tone.input.events).toEqual([{ kind: "arrest", district: "Lowtown", detail: { gang: "Saltdogs", fine: 30 } }]);
    const leak = items.find((i) => i.task === "leak")!;
    expect(leak.input.text_to_sam).toMatch(/^<<<DATA/);
  });

  it("lists a player's own moves and secrets only", () => {
    const m = { offers: { Families: { Hightown: 12 }, Saltdogs: { Market: 5 } }, accepted: ["Market"], crime: { Hightown: true, "Old Quarter": false, Market: true }, turf: { Families: "encroach", Saltdogs: "respect" }, inspect: ["Port"], audit: ["Market"] };
    expect(movesOf("Families", m)).toEqual({ bribe_offers: [{ district: "Hightown", amount: 12 }], bribes_accepted: [], bribes_refused: ["Hightown"], crime: { Hightown: true, "Old Quarter": false }, turf: "encroach" });
    expect(movesOf("Council", m)).toEqual({ audit: ["Market"] });
    expect(secretFacts("Chief", m).map((f) => f.kind)).toEqual(["bribe_offered", "bribe_refused", "bribe_offered", "bribe_accepted", "inspection"]);
    expect(secretFacts("Saltdogs", m)).toEqual([
      { kind: "bribe_offered", district: "Market", amount: 5 }, { kind: "bribe_accepted", district: "Market", amount: 5 },
      { kind: "crime", district: "Market", committed: true }, { kind: "turf_move", move: "respect" },
    ]);
  });

  it("draws the second-template 10% by seed 2026, the same every time", async () => {
    const a = await altSample("012-smoke-test", items);
    expect(a.size).toBe(Math.ceil(items.length * 0.1));
    expect([...(await altSample("012-smoke-test", items))]).toEqual([...a]);
    expect([...(await altSample("another-run", items))]).not.toEqual([...a]);
  });
});
