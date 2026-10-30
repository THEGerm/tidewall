// Failures, sorted into the few kinds the engine acts on. Two flags drive it:
//   retryable:  the same call with the same key may work a little later
//   tryNextKey: the next participant's key for this provider may work now
// (plan: "if yours fails (no credit, rate limit), the call goes to the next
// participant who has one"). Overload and server errors don't move to another
// key, since every key reaches the same servers.

import type { Provider } from "./types";

export type ErrorKind =
  | "bad_key" // rejected or not allowed (401, 403)
  | "no_credit" // billing, quota or credit exhausted
  | "rate_limited" // 429
  | "model_unavailable" // model not found, or this key can't use it
  | "overloaded" // provider busy (Anthropic 529, 503)
  | "server" // other 5xx
  | "bad_request" // our request is wrong; fix the code, don't retry
  | "network" // no answer: DNS, reset, timeout
  | "bad_response"; // an answer we couldn't read

const FLAGS: Record<ErrorKind, { retryable: boolean; tryNextKey: boolean }> = {
  bad_key: { retryable: false, tryNextKey: true },
  no_credit: { retryable: false, tryNextKey: true },
  rate_limited: { retryable: true, tryNextKey: true },
  model_unavailable: { retryable: false, tryNextKey: true },
  overloaded: { retryable: true, tryNextKey: false },
  server: { retryable: true, tryNextKey: false },
  bad_request: { retryable: false, tryNextKey: false },
  network: { retryable: true, tryNextKey: false },
  bad_response: { retryable: false, tryNextKey: false },
};

export class ProviderError extends Error {
  readonly retryable: boolean;
  readonly tryNextKey: boolean;

  constructor(
    readonly provider: Provider,
    readonly kind: ErrorKind,
    readonly status: number, // HTTP status, 0 when nothing came back
    detail: string,
    readonly retryAfterSec: number | null = null,
  ) {
    super(`${provider}: ${kind}${status ? ` (${status})` : ""}: ${detail}`);
    this.name = "ProviderError";
    this.retryable = FLAGS[kind].retryable;
    this.tryNextKey = FLAGS[kind].tryNextKey;
  }
}

// Fallback when a provider's error body doesn't say more.
export function kindFromStatus(status: number): ErrorKind {
  if (status === 401 || status === 403) return "bad_key";
  if (status === 402) return "no_credit";
  if (status === 404) return "model_unavailable";
  if (status === 429) return "rate_limited";
  if (status === 529 || status === 503) return "overloaded";
  if (status >= 500) return "server";
  return "bad_request";
}

// Provider messages can echo part of a key ("Incorrect API key provided:
// sk-...abcd"). Strip the key itself and anything shaped like one, and keep
// messages short, so nothing key-like reaches a log.
const KEY_SHAPES = /\b(?:sk-[A-Za-z0-9_*-]{4,}|AIza[A-Za-z0-9_-]{8,})/g;

export function scrub(text: string, key: string): string {
  let out = text;
  if (key.length >= 8) out = out.split(key).join("[key]");
  out = out.replace(KEY_SHAPES, "[key]");
  return out.length > 300 ? `${out.slice(0, 297)}...` : out;
}

export function retryAfter(res: Response): number | null {
  const value = res.headers.get("retry-after");
  if (!value) return null;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds;
  const date = Date.parse(value);
  return Number.isNaN(date) ? null : Math.max(0, Math.round((date - Date.now()) / 1000));
}
