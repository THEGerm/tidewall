// Entry point for model calls: callModel picks the adapter for a provider.
// Choosing whose key to use (turn order, fallback) is the key store's job;
// this layer only reports, through ProviderError.tryNextKey, when another
// participant's key is worth trying.

import { anthropic } from "./anthropic";
import { ProviderError } from "./errors";
import { google } from "./google";
import { call, type Adapter } from "./http";
import { openai } from "./openai";
import type { CallOptions, ChatProvider, ChatRequest, ChatResult, Provider } from "./types";

export { ProviderError } from "./errors";
export type { ErrorKind } from "./errors";
export type * from "./types";

const ADAPTERS: Record<ChatProvider, Adapter> = { anthropic, google, openai };

export function callModel(provider: Provider, key: string, req: ChatRequest, opts?: CallOptions): Promise<ChatResult> {
  if (provider === "openrouter") {
    // No OpenRouter chat adapter yet (it comes with the judges).
    return Promise.reject(new ProviderError(provider, "bad_request", 0, "no chat adapter for this provider yet"));
  }
  return call(ADAPTERS[provider], key, req, opts);
}

export interface RetryOptions {
  attempts?: number; // total tries, first one included
  baseDelayMs?: number; // doubled after each failure
  maxDelayMs?: number;
  sleep?: (ms: number) => Promise<void>;
}

// Retries the same call, with the same key, on errors marked retryable
// (rate limit, overload, server, network), honouring Retry-After when the
// provider sends it. Anything else is thrown at once for the caller to handle.
export async function withRetry<T>(fn: () => Promise<T>, opts: RetryOptions = {}): Promise<T> {
  const attempts = opts.attempts ?? 3;
  const base = opts.baseDelayMs ?? 2_000;
  const max = opts.maxDelayMs ?? 60_000;
  const sleep = opts.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (!(err instanceof ProviderError) || !err.retryable || attempt >= attempts) throw err;
      const wait = err.retryAfterSec !== null ? err.retryAfterSec * 1000 : base * 2 ** (attempt - 1);
      await sleep(Math.min(wait, max));
    }
  }
}
