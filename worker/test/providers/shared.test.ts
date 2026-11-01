// Behaviour every adapter shares: network failures, unreadable answers,
// keeping keys out of error messages, dispatch, and retries.

import { describe, expect, it } from "vitest";
import { ProviderError, scrub } from "../../src/providers/errors";
import { callModel, withRetry } from "../../src/providers/index";
import type { ChatProvider } from "../../src/providers/types";
import { FAKE_KEY, fakeFetch, request, throwingFetch } from "./helpers";

const PROVIDERS: ChatProvider[] = ["anthropic", "google", "openai"];

describe.each(PROVIDERS)("%s, shared behaviour", (provider) => {
  it("turns a failed fetch into a network error", async () => {
    const err = await callModel(provider, FAKE_KEY, request(), { fetch: throwingFetch(new TypeError("reset")) }).catch((e) => e);
    expect(err).toBeInstanceOf(ProviderError);
    expect(err.kind).toBe("network");
    expect(err.status).toBe(0);
    expect(err.retryable).toBe(true);
    expect(err.tryNextKey).toBe(false);
  });

  it("names a timeout", async () => {
    const timeout = Object.assign(new Error("timed out"), { name: "TimeoutError" });
    const err = await callModel(provider, FAKE_KEY, request({ timeoutMs: 5000 }), { fetch: throwingFetch(timeout) }).catch((e) => e);
    expect(err.kind).toBe("network");
    expect(err.message).toContain("5s");
  });

  it("rejects a 200 that isn't JSON, or isn't an answer", async () => {
    const html = fakeFetch(200, "<html>gateway</html>");
    expect((await callModel(provider, FAKE_KEY, request(), { fetch: html.fetch }).catch((e) => e)).kind).toBe("bad_response");
    const empty = fakeFetch(200, {});
    expect((await callModel(provider, FAKE_KEY, request(), { fetch: empty.fetch }).catch((e) => e)).kind).toBe("bad_response");
  });

  it("classifies an error with a non-JSON body by status", async () => {
    const { fetch } = fakeFetch(502, "Bad Gateway");
    const err = await callModel(provider, FAKE_KEY, request(), { fetch }).catch((e) => e);
    expect(err.kind).toBe("server");
    expect(err.status).toBe(502);
  });

  it("never puts the key in an error, even when the provider echoes it", async () => {
    const echo = `Incorrect API key provided: ${FAKE_KEY}. Also sk-proj-abcd****wxyz and AIzaSyA1234567890abcdef.`;
    const body = { type: "error", error: { type: "authentication_error", code: "invalid_api_key", message: echo, status: "UNAUTHENTICATED" } };
    const { fetch } = fakeFetch(401, body);
    const err = await callModel(provider, FAKE_KEY, request(), { fetch }).catch((e) => e);
    expect(err.kind).toBe("bad_key");
    const everything = `${err.message} ${JSON.stringify(err)} ${String(err.stack)}`;
    expect(everything).not.toContain(FAKE_KEY);
    expect(everything).not.toContain("sk-proj-abcd");
    expect(everything).not.toContain("AIzaSyA1234567890");
  });

  it("reports latency and the requested model", async () => {
    const answers: Record<ChatProvider, unknown> = {
      anthropic: { model: "m", content: [{ type: "text", text: "hi" }], stop_reason: "end_turn", usage: {} },
      google: { candidates: [{ content: { parts: [{ text: "hi" }] }, finishReason: "STOP" }], usageMetadata: {} },
      openai: { status: "completed", model: "m", output: [{ type: "message", content: [{ type: "output_text", text: "hi" }] }], usage: {} },
    };
    const { fetch } = fakeFetch(200, answers[provider]);
    let t = 1000;
    const r = await callModel(provider, FAKE_KEY, request(), { fetch, now: () => (t += 250) });
    expect(r.provider).toBe(provider);
    expect(r.model).toBe("test-model");
    expect(r.text).toBe("hi");
    expect(r.latencyMs).toBe(250);
    expect(r.usage).toMatchObject({ input: 0, cachedInput: 0, output: 0 });
  });
});

describe("scrub", () => {
  it("removes the key, key-shaped strings, and caps the length", () => {
    expect(scrub(`bad key ${FAKE_KEY}`, FAKE_KEY)).toBe("bad key [key]");
    expect(scrub("key sk-ant-api03-AbC_dEf-123", "x")).toBe("key [key]");
    expect(scrub("x".repeat(500), "k").length).toBe(300);
  });
});

describe("withRetry", () => {
  const sleep = async () => {};

  it("retries retryable errors with backoff, then succeeds", async () => {
    const waits: number[] = [];
    let n = 0;
    const result = await withRetry(
      async () => {
        if (++n < 3) throw new ProviderError("anthropic", "overloaded", 529, "busy");
        return "ok";
      },
      { attempts: 3, baseDelayMs: 100, sleep: async (ms) => void waits.push(ms) },
    );
    expect(result).toBe("ok");
    expect(waits).toEqual([100, 200]);
  });

  it("uses Retry-After when given, capped", async () => {
    const waits: number[] = [];
    let n = 0;
    await withRetry(
      async () => {
        if (++n === 1) throw new ProviderError("openai", "rate_limited", 429, "slow", 900);
        return 1;
      },
      { maxDelayMs: 30_000, sleep: async (ms) => void waits.push(ms) },
    );
    expect(waits).toEqual([30_000]);
  });

  it("throws at once on errors that won't fix themselves", async () => {
    let n = 0;
    const err = await withRetry(
      async () => {
        n++;
        throw new ProviderError("google", "bad_key", 401, "no");
      },
      { sleep },
    ).catch((e) => e);
    expect(err.kind).toBe("bad_key");
    expect(n).toBe(1);
  });

  it("gives up after the last attempt", async () => {
    let n = 0;
    const err = await withRetry(
      async () => {
        n++;
        throw new ProviderError("google", "server", 500, "boom");
      },
      { attempts: 2, sleep },
    ).catch((e) => e);
    expect(err.kind).toBe("server");
    expect(n).toBe(2);
  });
});
