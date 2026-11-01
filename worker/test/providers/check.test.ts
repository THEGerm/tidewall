// The My keys Test button: the key check, then each pinned model. Every
// answer is canned through an injected fetch; nothing reaches a provider.

import { describe, expect, it } from "vitest";
import { OPENROUTER_KEY_URL, OPENROUTER_MODEL_ENDPOINTS_URL, checkKey, checkModel, testKey } from "../../src/providers/check";
import { callModel } from "../../src/providers/index";
import { MODELS, TEST_MODELS, JUDGE_MODELS, pinnedModels } from "../../src/players/models";
import type { ChatProvider, FetchLike } from "../../src/providers/types";
import { FAKE_KEY, fakeFetch, throwingFetch } from "./helpers";

const MODEL_URL: Record<ChatProvider, string> = {
  anthropic: "https://api.anthropic.com/v1/models/",
  openai: "https://api.openai.com/v1/models/",
  google: "https://generativelanguage.googleapis.com/v1beta/models/",
};

const authHeader = (req: Request) =>
  req.headers.get("x-api-key") ?? req.headers.get("x-goog-api-key") ?? req.headers.get("authorization");

// Answers by URL: the key check one way, each model as listed.
function routed(keyStatus: number, byModel: Record<string, number | "throw">) {
  const seen: Request[] = [];
  const fetch: FetchLike = async (req) => {
    seen.push(req);
    const hit = Object.entries(byModel).find(([m]) => req.url.includes(`/${encodeURIComponent(m)}`));
    const status = hit ? hit[1] : keyStatus;
    if (status === "throw") throw new TypeError("connection reset");
    const echo = { error: { message: `Incorrect API key provided: ${FAKE_KEY}` } };
    return new Response(JSON.stringify(status === 200 ? { id: "x" } : echo), { status });
  };
  return { fetch, seen };
}

describe.each(["anthropic", "openai", "google"] as ChatProvider[])("%s, per-model check", (provider) => {
  const model = "some-model-1";

  it("asks the model's metadata endpoint, key in a header only", async () => {
    const { fetch, seen } = fakeFetch(200, { id: model });
    const r = await checkModel(provider, FAKE_KEY, model, fetch);
    expect(r).toEqual({ model, result: "usable", status: 200, reason: "listed for this key" });
    expect(seen).toHaveLength(1);
    expect(seen[0].method).toBe("GET");
    expect(seen[0].url).toBe(MODEL_URL[provider] + model);
    expect(seen[0].url).not.toContain(FAKE_KEY);
    expect(authHeader(seen[0])).toContain(FAKE_KEY);
    if (provider === "anthropic") expect(seen[0].headers.get("anthropic-version")).toBe("2023-06-01");
    if (provider === "openai") expect(seen[0].headers.get("authorization")).toBe(`Bearer ${FAKE_KEY}`);
    if (provider === "google") expect(seen[0].headers.get("x-goog-api-key")).toBe(FAKE_KEY);
  });

  it.each([
    [404, "not_usable", "not found for this key"],
    [403, "not_usable", "no access"],
    [401, "not_usable", "key rejected"],
    [429, "unknown", "rate limited, try again in a minute"],
    [500, "unknown", "the provider had an error"],
    [503, "unknown", "the provider had an error"],
  ])("answers %i as %s", async (status, result, reason) => {
    const { fetch } = fakeFetch(status, { error: { message: `Incorrect API key provided: ${FAKE_KEY}` } });
    const r = await checkModel(provider, FAKE_KEY, model, fetch);
    expect(r).toEqual({ model, result, status, reason });
    expect(JSON.stringify(r)).not.toContain(FAKE_KEY);
  });

  it("answers a network error as unknown", async () => {
    const r = await checkModel(provider, FAKE_KEY, model, throwingFetch(new TypeError("reset")));
    expect(r).toEqual({ model, result: "unknown", status: 0, reason: "couldn't reach the provider" });
  });

  it("tests the key, then every pinned model once, never echoing the key", async () => {
    const pinned = pinnedModels(provider);
    expect(pinned.length).toBeGreaterThan(0);
    const [first, ...rest] = pinned;
    const { fetch, seen } = routed(200, { [first]: 403, ...Object.fromEntries(rest.map((m) => [m, 200])) });
    const out = await testKey(provider, FAKE_KEY, fetch);
    expect(out.check.ok).toBe(true);
    expect(out.models.map((m) => m.model)).toEqual(pinned);
    expect(out.models[0]).toMatchObject({ result: "not_usable", status: 403, reason: "no access" });
    for (const m of out.models.slice(1)) expect(m.result).toBe("usable");
    expect(seen).toHaveLength(1 + pinned.length);
    for (const req of seen) expect(req.url).not.toContain(FAKE_KEY);
    expect(JSON.stringify(out)).not.toContain(FAKE_KEY);
  });

  it("doesn't ask about models when the key itself fails", async () => {
    const { fetch, seen } = fakeFetch(provider === "google" ? 400 : 401, { error: { message: FAKE_KEY } });
    const out = await testKey(provider, FAKE_KEY, fetch);
    expect(out.check).toMatchObject({ ok: false, detail: "the provider rejected this key" });
    expect(seen).toHaveLength(1);
    expect(out.models.every((m) => m.result === "unknown" && m.reason.startsWith("not checked"))).toBe(true);
    expect(JSON.stringify(out)).not.toContain(FAKE_KEY);
  });
});

describe("pinned models", () => {
  it("lists the study and test models of a provider, each once", () => {
    for (const provider of ["anthropic", "openai", "google"] as const) {
      const expected = [...Object.values(MODELS), ...Object.values(TEST_MODELS)]
        .filter((m) => m.provider === provider)
        .map((m) => m.model);
      const got = pinnedModels(provider);
      expect(new Set(got)).toEqual(new Set(expected));
      expect(new Set(got).size).toBe(got.length);
    }
    expect(pinnedModels("anthropic")).toEqual(["claude-opus-5-5", "claude-haiku-5-5"]);
  });

  it("has no judge models pinned yet", () => {
    expect(JUDGE_MODELS).toEqual([]);
    expect(pinnedModels("openrouter")).toEqual([]);
  });
});

describe("openrouter", () => {
  it("has no chat adapter yet: a call fails without reaching anyone", async () => {
    const { fetch, seen } = fakeFetch(200, {});
    const err = await callModel("openrouter", FAKE_KEY, { model: "m", system: "s", messages: [], maxOutputTokens: 10 }, { fetch }).catch((e) => e);
    expect(err).toMatchObject({ kind: "bad_request", tryNextKey: false });
    expect(seen).toHaveLength(0);
  });

  it("checks the key with a Bearer header at the key endpoint", async () => {
    const { fetch, seen } = fakeFetch(200, { data: { label: "x" } });
    expect(await checkKey("openrouter", FAKE_KEY, fetch)).toEqual({ ok: true, status: 200, detail: "the provider accepted this key" });
    expect(seen[0].url).toBe(OPENROUTER_KEY_URL);
    expect(seen[0].headers.get("authorization")).toBe(`Bearer ${FAKE_KEY}`);
    const bad = fakeFetch(401, { error: { message: "No auth credentials found" } });
    expect(await checkKey("openrouter", FAKE_KEY, bad.fetch)).toMatchObject({ ok: false, status: 401, detail: "the provider rejected this key" });
  });

  it("says there are no pinned models yet, and asks only about the key", async () => {
    const { fetch, seen } = fakeFetch(200, { data: {} });
    const out = await testKey("openrouter", FAKE_KEY, fetch);
    expect(out).toEqual({ check: { ok: true, status: 200, detail: "the provider accepted this key" }, models: [] });
    expect(seen).toHaveLength(1);
  });

  it("asks the public endpoints listing about a judge model, without the key", async () => {
    const model = "some-lab/some-model-v1";
    const { fetch, seen } = fakeFetch(200, { data: { id: model, endpoints: [{ provider_name: "x" }] } });
    expect(await checkModel("openrouter", FAKE_KEY, model, fetch)).toMatchObject({ result: "usable", status: 200 });
    expect(seen[0].url).toBe(OPENROUTER_MODEL_ENDPOINTS_URL(model));
    expect(seen[0].url).toContain("/some-lab/some-model-v1/");
    expect(seen[0].headers.get("authorization")).toBeNull();
    const none = fakeFetch(200, { data: { id: model, endpoints: [] } });
    expect(await checkModel("openrouter", FAKE_KEY, model, none.fetch)).toMatchObject({ result: "not_usable", reason: "no provider serves it right now" });
    const missing = fakeFetch(404, { error: { message: "Model not found" } });
    expect(await checkModel("openrouter", FAKE_KEY, model, missing.fetch)).toMatchObject({ result: "not_usable", status: 404 });
  });
});
