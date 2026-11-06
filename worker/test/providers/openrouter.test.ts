// The judges' OpenRouter calls: pinned provider, no fallbacks, temperature 0, cost.
import { describe, expect, it } from "vitest";
import { callOpenRouter, modelEndpoints, pinned, OPENROUTER_CHAT_URL } from "../../src/providers/openrouter";
import { FAKE_KEY, fakeFetch, sentBody } from "./helpers";

const req = { model: "deepseek/deepseek-v3.2", system: "frozen", messages: [{ role: "user" as const, text: "Task: tone" }], maxOutputTokens: 2000, json: { name: "tidewall_tone", schema: { type: "object" } } };
const ok = {
  id: "gen-1", model: "deepseek/deepseek-v3.2", provider: "DeepSeek",
  choices: [{ finish_reason: "stop", native_finish_reason: "stop", message: { role: "assistant", content: '{"task":"tone","tone_government":0,"tone_criminals":null}' } }],
  usage: { prompt_tokens: 900, completion_tokens: 20, prompt_tokens_details: { cached_tokens: 100 }, completion_tokens_details: { reasoning_tokens: 0 }, cost: 0.00031 },
};

describe("OpenRouter for the judges", () => {
  it("pins one provider with no fallbacks, at temperature 0, with the schema", async () => {
    const { fetch, seen } = fakeFetch(200, ok);
    const r = await callOpenRouter(FAKE_KEY, req, { upstream: "deepseek", temperature: 0, jsonMode: "schema" }, { fetch });
    expect(seen[0].url).toBe(OPENROUTER_CHAT_URL);
    expect(seen[0].headers.get("authorization")).toBe(`Bearer ${FAKE_KEY}`);
    const body = await sentBody(seen[0]);
    expect(body.temperature).toBe(0);
    expect(body.provider).toEqual({ order: ["deepseek"], allow_fallbacks: false, require_parameters: true });
    expect(body.messages[0]).toEqual({ role: "system", content: "frozen" });
    expect(body.response_format).toEqual({ type: "json_schema", json_schema: { name: "tidewall_tone", strict: true, schema: { type: "object" } } });
    expect(r).toMatchObject({ provider: "openrouter", stop: "done", costUsd: 0.00031, providerReported: "DeepSeek", requestId: "gen-1",
      usage: { input: 900, cachedInput: 100, cacheWrite: 0, output: 20, reasoning: 0 } });
    expect(JSON.parse(r.text).task).toBe("tone");
  });

  it("falls back to JSON mode where the provider has no structured output", async () => {
    const { fetch, seen } = fakeFetch(200, ok);
    await callOpenRouter(FAKE_KEY, req, { upstream: "deepseek", temperature: 0, jsonMode: "object" }, { fetch });
    expect((await sentBody(seen[0])).response_format).toEqual({ type: "json_object" });
  });

  it("names failures: no credit, provider gone, rate limit", async () => {
    for (const [status, kind] of [[402, "no_credit"], [404, "model_unavailable"], [429, "rate_limited"], [401, "bad_key"]] as const) {
      const { fetch } = fakeFetch(status, { error: { code: status, message: `nope ${FAKE_KEY}` } });
      const err = await callOpenRouter(FAKE_KEY, req, { upstream: "deepseek", temperature: 0, jsonMode: "schema" }, { fetch }).catch((e) => e);
      expect(err.kind).toBe(kind);
      expect(err.message).not.toContain(FAKE_KEY);
    }
  });

  it("reads a model's live endpoints and finds the pinned one", async () => {
    const { fetch, seen } = fakeFetch(200, { data: { id: "deepseek/deepseek-v3.2", endpoints: [
      { provider_name: "DeepInfra", tag: "deepinfra/fp8", status: 0, supported_parameters: ["temperature"], pricing: { prompt: "0.0000003", completion: "0.0000005" } },
      { provider_name: "DeepSeek", tag: "deepseek", status: 0, supported_parameters: ["temperature", "response_format"], pricing: { prompt: "0.00000028", completion: "0.00000042" } },
    ] } });
    const eps = await modelEndpoints("deepseek/deepseek-v3.2", fetch);
    expect(seen[0].url).toBe("https://openrouter.ai/api/v1/models/deepseek/deepseek-v3.2/endpoints");
    expect(seen[0].headers.get("authorization")).toBeNull();
    expect(pinned(eps, "deepseek")).toMatchObject({ provider: "DeepSeek", price: { prompt: 0.00000028, completion: 0.00000042 } });
    expect(pinned(eps, "DeepInfra")?.tag).toBe("deepinfra/fp8");
    expect(pinned(eps, "alibaba")).toBeNull();
  });
});
