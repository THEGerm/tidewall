// A fake fetch: records each request and answers with a canned response.
// No test reaches a real provider, and no real key exists anywhere in them.

import type { ChatRequest, FetchLike } from "../../src/providers/types";

export const FAKE_KEY = "test-key-not-real-0123456789abcdef";

export function fakeFetch(status: number, body: unknown, headers: Record<string, string> = {}) {
  const seen: Request[] = [];
  const fetch: FetchLike = async (req) => {
    seen.push(req);
    const text = typeof body === "string" ? body : JSON.stringify(body);
    return new Response(text, { status, headers: { "content-type": "application/json", ...headers } });
  };
  return { fetch, seen };
}

export const throwingFetch = (err: Error): FetchLike => async () => {
  throw err;
};

export const request = (extra: Partial<ChatRequest> = {}): ChatRequest => ({
  model: "test-model",
  system: "You are the Police Chief of Tidewall.",
  messages: [
    { role: "user", text: "Day 1 briefing." },
    { role: "assistant", text: "Understood." },
    { role: "user", text: "Day 2 briefing." },
  ],
  maxOutputTokens: 3000,
  ...extra,
});

export const sentBody = async (req: Request) => JSON.parse(await req.clone().text());
