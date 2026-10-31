import { describe, expect, it } from "vitest";
import { PLAYERS, type PlayerName } from "../../src/engine/config";
import { playDay } from "../../src/engine/day";
import { newGame } from "../../src/engine/resolve";
import { Refusal, type Player } from "../../src/engine/types";
import { saveKey } from "../../src/keys/store";
import { ProviderError, type ChatRequest, type ChatResult } from "../../src/providers";
import { keyChain, payingOrder, type KeyCandidate } from "../../src/players/keys";
import { modelPlayer, NoKeyError, type CallRecord } from "../../src/players/model";
import { studyPrompts } from "../../src/players/prompts";
import { testD1 } from "../engine/d1";

const SECRET = btoa(String.fromCharCode(...new Uint8Array(32).map((_, i) => i + 1)));
const usage = { input: 1000, cachedInput: 800, cacheWrite: 0, output: 200, reasoning: null };
const result = (text: string, stop: ChatResult["stop"] = "done"): ChatResult => ({
  provider: "anthropic", model: "m", modelReported: "m-2026", text, stop, stopDetail: stop, usage, requestId: null, latencyMs: 5,
});
const noSleep = <T,>(fn: () => Promise<T>) => fn();
const view = (player: PlayerName, day = 1): any => ({
  player, day, nature: { storm: false, fire: null, strike: false, ship: false }, open: ["Port", "Market"],
  balances: {}, publicYesterday: [], wireYesterday: [], inbox: [],
});

// Fills any of our step schemas with a legal answer: the first enum value,
// nulls for optional bribes, 0.3 for probabilities, and enough list items.
function fill(s: any): any {
  if (s.anyOf) return null;
  if (s.enum) return s.enum[0];
  switch (s.type) {
    case "object": return Object.fromEntries(Object.entries(s.properties).map(([k, v]) => [k, fill(v)]));
    case "array": return s.items.enum ? s.items.enum.slice(0, s.minItems ?? 0) : Array.from({ length: s.minItems ?? 0 }, () => fill(s.items));
    case "number": return 0.3;
    case "integer": return s.minimum ?? 0;
    case "boolean": return false;
    case "string": return "ok";
  }
}
const schemaFiller = async (_p: any, _k: string, req: ChatRequest) => result(JSON.stringify(fill(req.json!.schema)));

const keys = (...emails: string[]) => async (): Promise<KeyCandidate[]> =>
  emails.map((email, i) => ({ email, name: email, key: `key-${email}`, owner: i === 0 }));

describe("paying order", () => {
  it("rotates the owner by day", () => {
    const people = ["Germ", "Shazz", "Richard"];
    expect(payingOrder(people, 1)).toEqual(["Germ", "Shazz", "Richard"]);
    expect(payingOrder(people, 2)).toEqual(["Shazz", "Richard", "Germ"]);
    expect(payingOrder(people, 4)).toEqual(["Germ", "Shazz", "Richard"]);
  });

  it("builds the key chain from stored keys, skipping people without one", async () => {
    const db = testD1();
    await db.prepare("INSERT INTO participants (email, name, turn_order) VALUES ('g@x', 'Germ', 1), ('s@x', 'Shazz', 2)").run();
    await saveKey(db, SECRET, "g@x", "anthropic", "sk-ant-germ-key-0000000000");
    await saveKey(db, SECRET, "s@x", "anthropic", "sk-ant-shazz-key-000000000");
    await saveKey(db, SECRET, "g@x", "openai", "sk-germ-openai-key-0000000");
    const day2 = await keyChain(db, SECRET, "anthropic", 2);
    expect(day2.map((k) => [k.name, k.owner])).toEqual([["Shazz", true], ["Germ", false]]);
    expect(day2[0].key).toBe("sk-ant-shazz-key-000000000");
    const openai = await keyChain(db, SECRET, "openai", 2);
    expect(openai.map((k) => [k.name, k.owner])).toEqual([["Germ", false]]);
  });
});

describe("model player", () => {
  it("moves to the next participant's key when a key is rejected, and records who paid", async () => {
    const calls: CallRecord[] = [];
    const seen: string[] = [];
    const p = modelPlayer({
      name: "Council", provider: "anthropic", model: "claude-opus-5-5", prompts: studyPrompts,
      keys: keys("owner@x", "other@x"), onCall: (r) => { calls.push(r); }, retry: noSleep,
      call: async (_p, key, req) => {
        seen.push(key);
        if (key === "key-owner@x") throw new ProviderError("anthropic", "no_credit", 400, "credit balance too low");
        return schemaFiller(_p, key, req);
      },
    });
    const view = { player: "Council" as PlayerName, day: 3, nature: { storm: false, fire: null, strike: false, ship: false }, open: ["Port", "Market"] as any, balances: {}, publicYesterday: [], wireYesterday: [], inbox: [] };
    const a: any = await p.act(view);
    expect(a.moves.audit).toEqual([]);
    expect(seen).toEqual(["key-owner@x", "key-other@x"]);
    expect(calls.map((c) => [c.payer, c.ok, c.fallbackKey])).toEqual([["owner@x", false, false], ["other@x", true, true]]);
    expect(calls[1].usage?.input).toBe(1000);
  });

  it("doesn't try another key for an error every key would hit", async () => {
    const seen: string[] = [];
    const p = modelPlayer({
      name: "Chief", provider: "anthropic", model: "m", prompts: studyPrompts, keys: keys("a@x", "b@x"), onCall: () => {}, retry: noSleep,
      call: async (_p, key) => { seen.push(key); throw new ProviderError("anthropic", "bad_request", 400, "bad schema"); },
    });
    await expect(p.messages(view("Chief"))).rejects.toThrow(/bad_request/);
    expect(seen).toEqual(["key-a@x"]);
  });

  it("turns a provider refusal into a Refusal, so the engine falls back", async () => {
    const calls: CallRecord[] = [];
    const p = modelPlayer({
      name: "Saltdogs", provider: "openai", model: "m", prompts: studyPrompts, keys: keys("a@x"), onCall: (r) => { calls.push(r); }, retry: noSleep,
      call: async () => result("", "refused"),
    });
    await expect(p.messages(view("Saltdogs"))).rejects.toBeInstanceOf(Refusal);
    expect(calls[0].stop).toBe("refused");
    expect(calls[0].usage).not.toBeNull(); // a refusal still costs tokens
  });

  it("fails clearly when nobody has a key for the provider", async () => {
    const p = modelPlayer({ name: "World", provider: "google", model: "m", prompts: studyPrompts, keys: async () => [], onCall: () => {}, retry: noSleep });
    await expect(p.messages(view("World"))).rejects.toBeInstanceOf(NoKeyError);
  });

  it("five model players play a legal day through the engine", async () => {
    const calls: CallRecord[] = [];
    const players = Object.fromEntries(PLAYERS.map((name) => [name, modelPlayer({
      name, provider: "anthropic", model: "m", prompts: studyPrompts, keys: keys("a@x"), onCall: (r) => { calls.push(r); }, retry: noSleep, call: schemaFiller,
    })])) as Record<PlayerName, Player>;
    const r = await playDay({ state: newGame("models"), players, publicYesterday: [], wireYesterday: [] });
    expect(r.records.every((x) => x.source === "player")).toBe(true);
    expect(r.wire.length).toBeGreaterThanOrEqual(2);
    expect(calls.every((c) => c.ok && c.payer === "a@x")).toBe(true);
    expect(Object.keys(r.forecasts).sort()).toEqual([...PLAYERS].sort());
  });
});
