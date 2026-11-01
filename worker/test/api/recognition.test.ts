// The recognition check (Zhou, Huang et al. 2025, arXiv 2509.18052): every
// study model reads every seat's prompt once; answers saved, calls in the ledger.
import { describe, expect, it, vi } from "vitest";

vi.mock("../../src/providers", () => ({
  callModel: vi.fn(async (provider: string, _key: string, req: any) => ({
    provider, model: req.model, modelReported: req.model, text: `a game, says ${req.model}`, stop: "done", stopDetail: "end_turn",
    usage: { input: 1000, cachedInput: 0, cacheWrite: 0, output: 50, reasoning: 0 }, requestId: "r1", latencyMs: 5,
  })),
}));

import { saveKey } from "../../src/keys/store";
import { QUESTIONS, recognitionCheck } from "../../src/engine/recognition";
import { testD1 } from "../engine/d1";

const SECRET = btoa(String.fromCharCode(...new Uint8Array(32).map((_, i) => i + 7)));

describe("recognition check", () => {
  it("asks each study model both questions for each seat and saves the answers", async () => {
    const db = testD1();
    await db.prepare("INSERT INTO participants (email, name, turn_order) VALUES ('g@x', 'Germ', 1), ('s@x', 'Shazz', 2)").run();
    for (const p of ["anthropic", "google", "openai"] as const) await saveKey(db, SECRET, "g@x", p, `test-key-${p}-0000000000000000`);
    const answers = await recognitionCheck(db, SECRET);
    expect(answers).toHaveLength(30);
    expect(answers.filter((a) => a.question === "play")).toHaveLength(15);
    expect(answers.every((a) => a.text && !a.error)).toBe(true);
    const saved = JSON.parse((await db.prepare("SELECT value FROM meta WHERE key = 'recognition_check'").first<{ value: string }>())!.value);
    expect(saved.questions).toEqual(QUESTIONS);
    expect((await db.prepare("SELECT COUNT(*) AS n FROM ledger WHERE run_id = 'recognition-check'").first<{ n: number }>())!.n).toBe(30);
  });
});
