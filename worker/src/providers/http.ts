// The part every adapter shares: send one request with a timeout, read the
// JSON, and turn any failure into a ProviderError. Each adapter only says how
// to build its request, read a success, and name a failure.

import { ProviderError, retryAfter, scrub, type ErrorKind } from "./errors";
import { DEFAULT_TIMEOUT_MS, type CallOptions, type ChatRequest, type ChatResult, type Provider } from "./types";

export type Outgoing = { url: string; headers: Record<string, string>; body: unknown };
export type Parsed = Omit<ChatResult, "provider" | "model" | "latencyMs">;

export interface Adapter {
  provider: Provider;
  build(key: string, req: ChatRequest): Outgoing;
  // body is the provider's JSON, untyped: adapters read it defensively.
  parse(body: any, res: Response): Parsed;
  failure(status: number, body: any): { kind: ErrorKind; detail: string };
}

export async function call(adapter: Adapter, key: string, req: ChatRequest, opts: CallOptions = {}): Promise<ChatResult> {
  const doFetch = opts.fetch ?? ((r: Request) => fetch(r));
  const now = opts.now ?? Date.now;
  const timeoutMs = req.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const out = adapter.build(key, req);
  const request = new Request(out.url, {
    method: "POST",
    headers: { "content-type": "application/json", ...out.headers },
    body: JSON.stringify(out.body),
    signal: AbortSignal.timeout(timeoutMs),
  });

  const started = now();
  let res: Response;
  try {
    res = await doFetch(request);
  } catch (err) {
    const timedOut = err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
    const detail = timedOut ? `no answer after ${Math.round(timeoutMs / 1000)}s` : "couldn't reach the provider";
    throw new ProviderError(adapter.provider, "network", 0, detail);
  }

  const raw = await res.text().catch(() => "");
  let body: any = null;
  try {
    body = raw ? JSON.parse(raw) : null;
  } catch {
    body = null;
  }
  const latencyMs = now() - started;

  if (!res.ok) {
    const { kind, detail } = adapter.failure(res.status, body);
    throw new ProviderError(adapter.provider, kind, res.status, scrub(detail, key), retryAfter(res));
  }
  if (body === null || typeof body !== "object") {
    throw new ProviderError(adapter.provider, "bad_response", res.status, "the answer wasn't JSON");
  }

  let parsed: Parsed;
  try {
    parsed = adapter.parse(body, res);
  } catch (err) {
    const why = err instanceof Error ? err.message : "unreadable answer";
    throw new ProviderError(adapter.provider, "bad_response", res.status, scrub(why, key));
  }
  return { provider: adapter.provider, model: req.model, latencyMs, ...parsed };
}

// Helpers the adapters share for reading untyped JSON.
export const num = (v: unknown): number => (typeof v === "number" && Number.isFinite(v) ? v : 0);
export const str = (v: unknown, fallback = ""): string => (typeof v === "string" ? v : fallback);
