import { describe, expect, it } from "vitest";
import { ProviderError } from "../../src/providers/errors";
import { OPENAI_URL, callOpenAI } from "../../src/providers/openai";
import { FAKE_KEY, fakeFetch, request, sentBody } from "./helpers";

const ok = {
  id: "resp_01",
  object: "response",
  status: "completed",
  model: "gpt-flagship-2026-09-01",
  output: [
    { type: "reasoning", id: "rs_1", summary: [] },
    { type: "message", role: "assistant", content: [{ type: "output_text", text: "Raid the docks.", annotations: [] }] },
  ],
  usage: {
    input_tokens: 52700,
    input_tokens_details: { cached_tokens: 40000 },
    output_tokens: 6900,
    output_tokens_details: { reasoning_tokens: 5000 },
    total_tokens: 59600,
  },
};

describe("openai request", () => {
  it("posts to the Responses API with store off and the history as input", async () => {
    const { fetch, seen } = fakeFetch(200, ok);
    await callOpenAI(FAKE_KEY, request(), { fetch });
    const req = seen[0];
    expect(req.url).toBe(OPENAI_URL);
    expect(req.headers.get("authorization")).toBe(`Bearer ${FAKE_KEY}`);
    const body = await sentBody(req);
    expect(body).toMatchObject({
      model: "test-model",
      instructions: "You are the Police Chief of Tidewall.",
      max_output_tokens: 3000,
      store: false,
    });
    expect(body.input).toEqual([
      { role: "user", content: "Day 1 briefing." },
      { role: "assistant", content: "Understood." },
      { role: "user", content: "Day 2 briefing." },
    ]);
    expect(body).not.toHaveProperty("temperature");
    expect(body).not.toHaveProperty("reasoning");
    expect(body).not.toHaveProperty("text");
  });

  it("sends effort, a strict JSON schema and the cache key", async () => {
    const { fetch, seen } = fakeFetch(200, ok);
    const schema = { type: "object", properties: {}, additionalProperties: false };
    await callOpenAI(FAKE_KEY, request({ effort: "high", json: { name: "moves", schema }, cacheKey: "week1-chief" }), { fetch });
    const body = await sentBody(seen[0]);
    expect(body.reasoning).toEqual({ effort: "high" });
    expect(body.text).toEqual({ format: { type: "json_schema", name: "moves", schema, strict: true } });
    expect(body.prompt_cache_key).toBe("week1-chief");
  });
});

describe("openai answer", () => {
  it("reads the message text and keeps reasoning inside output", async () => {
    const { fetch } = fakeFetch(200, ok, { "x-request-id": "req_xyz" });
    const r = await callOpenAI(FAKE_KEY, request(), { fetch });
    expect(r.text).toBe("Raid the docks.");
    expect(r.stop).toBe("done");
    expect(r.modelReported).toBe("gpt-flagship-2026-09-01");
    expect(r.requestId).toBe("req_xyz");
    expect(r.usage).toEqual({ input: 52700, cachedInput: 40000, cacheWrite: 0, output: 6900, reasoning: 5000 });
  });

  it("returns a refusal part as a refused result", async () => {
    const body = { ...ok, output: [{ type: "message", content: [{ type: "refusal", refusal: "I can't play a gang." }] }] };
    const { fetch } = fakeFetch(200, body);
    const r = await callOpenAI(FAKE_KEY, request(), { fetch });
    expect(r.stop).toBe("refused");
    expect(r.stopDetail).toContain("I can't play a gang.");
  });

  it("maps incomplete answers", async () => {
    const cut = fakeFetch(200, { ...ok, status: "incomplete", incomplete_details: { reason: "max_output_tokens" } });
    expect((await callOpenAI(FAKE_KEY, request(), { fetch: cut.fetch })).stop).toBe("max_tokens");
    const filtered = fakeFetch(200, { ...ok, status: "incomplete", incomplete_details: { reason: "content_filter" } });
    expect((await callOpenAI(FAKE_KEY, request(), { fetch: filtered.fetch })).stop).toBe("refused");
  });
});

describe("openai errors", () => {
  const cases: [number, Record<string, string>, string][] = [
    [401, { message: "Incorrect API key provided.", type: "invalid_request_error", code: "invalid_api_key" }, "bad_key"],
    [429, { message: "You exceeded your current quota.", type: "insufficient_quota", code: "insufficient_quota" }, "no_credit"],
    [429, { message: "Rate limit reached.", type: "requests", code: "rate_limit_exceeded" }, "rate_limited"],
    [404, { message: "The model does not exist or you do not have access to it.", type: "invalid_request_error", code: "model_not_found" }, "model_unavailable"],
    [400, { message: "Unsupported parameter.", type: "invalid_request_error", code: "unsupported_parameter" }, "bad_request"],
    [503, { message: "Service unavailable.", type: "server_error", code: "" }, "overloaded"],
    [500, { message: "Server error.", type: "server_error", code: "" }, "server"],
  ];
  for (const [status, error, kind] of cases) {
    it(`${status} ${error.code || error.type} is ${kind}`, async () => {
      const { fetch } = fakeFetch(status, { error });
      const err = await callOpenAI(FAKE_KEY, request(), { fetch }).catch((e) => e);
      expect(err).toBeInstanceOf(ProviderError);
      expect(err.kind).toBe(kind);
    });
  }
});
