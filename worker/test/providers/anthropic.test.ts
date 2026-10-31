import { describe, expect, it } from "vitest";
import { ANTHROPIC_URL, ANTHROPIC_VERSION, anthropicSchema, callAnthropic } from "../../src/providers/anthropic";
import { actSchema, offersSchema, wireSchema } from "../../src/players/schemas";
import { DISTRICTS } from "../../src/engine/config";
import { ProviderError } from "../../src/providers/errors";
import { FAKE_KEY, fakeFetch, request, sentBody } from "./helpers";

const ok = {
  id: "msg_01",
  type: "message",
  role: "assistant",
  model: "claude-opus-5-5",
  content: [
    { type: "thinking", thinking: "", signature: "sig" },
    { type: "text", text: '{"move":' },
    { type: "text", text: '"inspect"}' },
  ],
  stop_reason: "end_turn",
  stop_details: null,
  usage: { input_tokens: 1200, cache_read_input_tokens: 71000, cache_creation_input_tokens: 2000, output_tokens: 900 },
};

describe("anthropic request", () => {
  it("posts to the Messages API with the key in a header and cache breakpoints", async () => {
    const { fetch, seen } = fakeFetch(200, ok);
    await callAnthropic(FAKE_KEY, request(), { fetch });
    const req = seen[0];
    expect(req.url).toBe(ANTHROPIC_URL);
    expect(req.method).toBe("POST");
    expect(req.headers.get("x-api-key")).toBe(FAKE_KEY);
    expect(req.headers.get("anthropic-version")).toBe(ANTHROPIC_VERSION);
    const body = await sentBody(req);
    expect(body.model).toBe("test-model");
    expect(body.max_tokens).toBe(3000);
    expect(body.system).toEqual([
      { type: "text", text: "You are the Police Chief of Tidewall.", cache_control: { type: "ephemeral" } },
    ]);
    expect(body.messages[0]).toEqual({ role: "user", content: "Day 1 briefing." });
    expect(body.messages[1]).toEqual({ role: "assistant", content: "Understood." });
    expect(body.messages[2].content[0].cache_control).toEqual({ type: "ephemeral" });
    expect(body).not.toHaveProperty("temperature");
    expect(body).not.toHaveProperty("output_config");
    expect(body).not.toHaveProperty("thinking");
  });

  it("sends effort and a JSON schema in output_config", async () => {
    const { fetch, seen } = fakeFetch(200, ok);
    const schema = { type: "object", properties: { move: { type: "string" } }, required: ["move"] };
    await callAnthropic(FAKE_KEY, request({ effort: "low", json: { name: "moves", schema } }), { fetch });
    const body = await sentBody(seen[0]);
    expect(body.output_config).toEqual({ effort: "low", format: { type: "json_schema", schema } });
  });
});

describe("anthropic answer", () => {
  it("joins text blocks, skips thinking, and totals input with cached tokens", async () => {
    const { fetch } = fakeFetch(200, ok, { "request-id": "req_abc" });
    const r = await callAnthropic(FAKE_KEY, request(), { fetch });
    expect(r.text).toBe('{"move":"inspect"}');
    expect(r.stop).toBe("done");
    expect(r.modelReported).toBe("claude-opus-5-5");
    expect(r.requestId).toBe("req_abc");
    expect(r.usage).toEqual({ input: 74200, cachedInput: 71000, cacheWrite: 2000, output: 900, reasoning: null });
  });

  it("returns a refusal as a result, with its category", async () => {
    const body = { ...ok, content: [], stop_reason: "refusal", stop_details: { type: "refusal", category: "cyber" } };
    const { fetch } = fakeFetch(200, body);
    const r = await callAnthropic(FAKE_KEY, request(), { fetch });
    expect(r.stop).toBe("refused");
    expect(r.stopDetail).toBe("refusal: cyber");
    expect(r.text).toBe("");
  });

  it("marks a cut-off answer", async () => {
    const { fetch } = fakeFetch(200, { ...ok, stop_reason: "max_tokens" });
    expect((await callAnthropic(FAKE_KEY, request(), { fetch })).stop).toBe("max_tokens");
  });
});

describe("anthropic errors", () => {
  const cases: [number, string, string, string][] = [
    [401, "authentication_error", "invalid x-api-key", "bad_key"],
    [403, "permission_error", "not allowed", "bad_key"],
    [402, "billing_error", "payment required", "no_credit"],
    [400, "invalid_request_error", "Your credit balance is too low to access the Anthropic API.", "no_credit"],
    [429, "rate_limit_error", "slow down", "rate_limited"],
    [529, "overloaded_error", "Overloaded", "overloaded"],
    [404, "not_found_error", "model: nope", "model_unavailable"],
    [400, "invalid_request_error", "max_tokens: too large", "bad_request"],
    [500, "api_error", "Internal server error", "server"],
  ];
  for (const [status, type, message, kind] of cases) {
    it(`${status} ${type} is ${kind}`, async () => {
      const { fetch } = fakeFetch(status, { type: "error", error: { type, message } });
      const err = await callAnthropic(FAKE_KEY, request(), { fetch }).catch((e) => e);
      expect(err).toBeInstanceOf(ProviderError);
      expect(err.kind).toBe(kind);
      expect(err.status).toBe(status);
    });
  }

  it("passes Retry-After on to the caller", async () => {
    const { fetch } = fakeFetch(429, { type: "error", error: { type: "rate_limit_error", message: "x" } }, { "retry-after": "12" });
    const err = await callAnthropic(FAKE_KEY, request(), { fetch }).catch((e) => e);
    expect(err.retryAfterSec).toBe(12);
    expect(err.retryable).toBe(true);
    expect(err.tryNextKey).toBe(true);
  });
});

describe("anthropicSchema", () => {
  // Rules Anthropic's structured output rejected in the first test run (31 Oct).
  const banned = (x: unknown): string[] => {
    if (Array.isArray(x)) return x.flatMap(banned);
    if (typeof x !== "object" || x === null) return [];
    const o = x as Record<string, unknown>;
    const here = Object.keys(o).filter((k) => ["minimum", "maximum", "maxItems", "uniqueItems"].includes(k) || (k === "minItems" && (o[k] as number) > 1));
    return [...here, ...Object.entries(o).flatMap(([k, v]) => (k === "properties" ? Object.values(v as object).flatMap(banned) : banned(v)))];
  };
  const view = (player: any) => ({ player, day: 1, nature: { storm: false, fire: null, strike: false, ship: false }, open: [...DISTRICTS], balances: {}, publicYesterday: [], wireYesterday: [], inbox: [], acceptedToday: [] }) as any;

  it("leaves no rejected rule in any schema the players send", () => {
    for (const s of [actSchema(view("World")), actSchema(view("Chief")), actSchema(view("Council")), actSchema(view("Families")), offersSchema(view("Saltdogs")), wireSchema(["D1-E1", "D1-E2"])]) {
      expect(banned(s).length).toBeGreaterThan(0); // the originals do carry them
      expect(banned(anthropicSchema(s))).toEqual([]);
    }
  });

  it("keeps the rule in the description, and keeps property names", () => {
    const out = anthropicSchema({ type: "object", properties: { maximum: { type: "number", minimum: 0, maximum: 1, description: "a probability" } }, required: ["maximum"] }) as any;
    expect(out.properties.maximum).toEqual({ type: "number", description: "a probability; minimum 0, maximum 1" });
    expect(anthropicSchema({ type: "array", minItems: 1, items: { type: "string" } })).toEqual({ type: "array", minItems: 1, items: { type: "string" } });
  });
});
