import { describe, expect, it } from "vitest";
import { ProviderError } from "../../src/providers/errors";
import { callGoogle, googleUrl } from "../../src/providers/google";
import { FAKE_KEY, fakeFetch, request, sentBody } from "./helpers";

const ok = {
  candidates: [
    {
      content: { role: "model", parts: [{ text: "thinking it over", thought: true }, { text: "Encroach " }, { text: "on the north quay." }] },
      finishReason: "STOP",
    },
  ],
  usageMetadata: {
    promptTokenCount: 41200,
    cachedContentTokenCount: 30000,
    candidatesTokenCount: 1100,
    thoughtsTokenCount: 3000,
    totalTokenCount: 45300,
  },
  modelVersion: "gemini-pro-2026-09",
  responseId: "resp-g-1",
};

describe("google request", () => {
  it("posts to generateContent with the key in a header, not the URL", async () => {
    const { fetch, seen } = fakeFetch(200, ok);
    await callGoogle(FAKE_KEY, request({ model: "models/gemini-pro" }), { fetch });
    const req = seen[0];
    expect(req.url).toBe("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent");
    expect(req.url).not.toContain(FAKE_KEY);
    expect(req.headers.get("x-goog-api-key")).toBe(FAKE_KEY);
    const body = await sentBody(req);
    expect(body.systemInstruction).toEqual({ parts: [{ text: "You are the Police Chief of Tidewall." }] });
    expect(body.contents.map((c: any) => c.role)).toEqual(["user", "model", "user"]);
    expect(body.contents[1].parts).toEqual([{ text: "Understood." }]);
    expect(body.generationConfig).toEqual({ maxOutputTokens: 3000 });
  });

  it("sends thinking level and a JSON schema", async () => {
    const { fetch, seen } = fakeFetch(200, ok);
    const schema = { type: "object" };
    await callGoogle(FAKE_KEY, request({ effort: "high", json: { name: "moves", schema } }), { fetch });
    const body = await sentBody(seen[0]);
    expect(body.generationConfig).toEqual({
      maxOutputTokens: 3000,
      thinkingConfig: { thinkingLevel: "high" },
      responseMimeType: "application/json",
      responseJsonSchema: schema,
    });
  });

  it("escapes odd characters in the model name", () => {
    expect(googleUrl("a/b")).toBe("https://generativelanguage.googleapis.com/v1beta/models/a%2Fb:generateContent");
  });
});

describe("google answer", () => {
  it("drops thought parts and counts thoughts as output", async () => {
    const { fetch } = fakeFetch(200, ok);
    const r = await callGoogle(FAKE_KEY, request(), { fetch });
    expect(r.text).toBe("Encroach on the north quay.");
    expect(r.stop).toBe("done");
    expect(r.modelReported).toBe("gemini-pro-2026-09");
    expect(r.requestId).toBe("resp-g-1");
    expect(r.usage).toEqual({ input: 41200, cachedInput: 30000, cacheWrite: 0, output: 4100, reasoning: 3000 });
  });

  it("returns a blocked prompt as refused", async () => {
    const { fetch } = fakeFetch(200, { promptFeedback: { blockReason: "SAFETY" }, usageMetadata: { promptTokenCount: 900 } });
    const r = await callGoogle(FAKE_KEY, request(), { fetch });
    expect(r.stop).toBe("refused");
    expect(r.stopDetail).toBe("blocked: SAFETY");
    expect(r.usage.input).toBe(900);
  });

  it("maps safety and length stops", async () => {
    const safety = fakeFetch(200, { ...ok, candidates: [{ content: { parts: [] }, finishReason: "SAFETY" }] });
    expect((await callGoogle(FAKE_KEY, request(), { fetch: safety.fetch })).stop).toBe("refused");
    const cut = fakeFetch(200, { ...ok, candidates: [{ content: { parts: [{ text: "half" }] }, finishReason: "MAX_TOKENS" }] });
    expect((await callGoogle(FAKE_KEY, request(), { fetch: cut.fetch })).stop).toBe("max_tokens");
  });
});

describe("google errors", () => {
  const invalidKey = {
    code: 400,
    message: "API key not valid. Please pass a valid API key.",
    status: "INVALID_ARGUMENT",
    details: [{ "@type": "type.googleapis.com/google.rpc.ErrorInfo", reason: "API_KEY_INVALID" }],
  };
  const cases: [number, Record<string, unknown>, string][] = [
    [400, invalidKey, "bad_key"],
    [403, { code: 403, message: "Permission denied.", status: "PERMISSION_DENIED" }, "bad_key"],
    [400, { code: 400, message: "Please enable billing.", status: "FAILED_PRECONDITION" }, "no_credit"],
    [429, { code: 429, message: "Quota exceeded.", status: "RESOURCE_EXHAUSTED" }, "rate_limited"],
    [404, { code: 404, message: "models/x is not found.", status: "NOT_FOUND" }, "model_unavailable"],
    [400, { code: 400, message: "Invalid JSON payload.", status: "INVALID_ARGUMENT" }, "bad_request"],
    [503, { code: 503, message: "The model is overloaded.", status: "UNAVAILABLE" }, "overloaded"],
    [500, { code: 500, message: "Internal error.", status: "INTERNAL" }, "server"],
  ];
  for (const [status, error, kind] of cases) {
    it(`${status} ${error.status} is ${kind}`, async () => {
      const { fetch } = fakeFetch(status, { error });
      const err = await callGoogle(FAKE_KEY, request(), { fetch }).catch((e) => e);
      expect(err).toBeInstanceOf(ProviderError);
      expect(err.kind).toBe(kind);
    });
  }
});
