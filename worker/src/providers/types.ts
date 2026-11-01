// One interface for the three chat providers. The engine sends a ChatRequest and
// gets back a ChatResult: the text, why it stopped, and token usage in one
// shape, so the ledger never needs to know which provider answered.

import type { Provider } from "../keys/store";

export type { Provider };

// Providers with a chat adapter (the players). OpenRouter keys are stored and
// checked, but its chat calls come with the judges, later.
export type ChatProvider = Exclude<Provider, "openrouter">;

// Injected so tests can answer with canned responses and never call out.
export type FetchLike = (request: Request) => Promise<Response>;

export type Message = { role: "user" | "assistant"; text: string };

// Mapped per provider: Anthropic output_config.effort, OpenAI reasoning.effort,
// Google thinkingConfig.thinkingLevel. Left out, each provider uses its default.
export type Effort = "low" | "medium" | "high";

export interface ChatRequest {
  model: string;
  // The stable part of the prompt (seat briefing, rules, payoffs). Kept first
  // and unchanged between days so the providers can cache it.
  system: string;
  messages: Message[];
  maxOutputTokens: number;
  effort?: Effort;
  // Ask for JSON that matches this schema (moves and beliefs).
  json?: { name: string; schema: Record<string, unknown> };
  // OpenAI only: groups calls that share a prefix, which helps its cache hit.
  cacheKey?: string;
  timeoutMs?: number;
}

// Token counts as the ledger records them.
//   input:       every prompt token, cached ones included
//   cachedInput: prompt tokens read from the provider's cache (billed cheaper)
//   cacheWrite:  prompt tokens written to the cache (Anthropic bills these higher)
//   output:      every generated token, reasoning included
//   reasoning:   the part of output spent thinking; null if the provider doesn't say
export interface Usage {
  input: number;
  cachedInput: number;
  cacheWrite: number;
  output: number;
  reasoning: number | null;
}

// done: finished normally. max_tokens: cut off. refused: the model or the
// provider's filter declined (a result for the paper, not an error).
export type Stop = "done" | "max_tokens" | "refused" | "other";

export interface ChatResult {
  provider: Provider;
  model: string; // what we asked for
  modelReported: string; // what the provider says ran, logged every call
  text: string;
  stop: Stop;
  stopDetail: string; // the provider's own stop reason, e.g. "end_turn", "SAFETY"
  usage: Usage;
  requestId: string | null;
  latencyMs: number;
}

export interface CallOptions {
  fetch?: FetchLike;
  now?: () => number;
}

export const DEFAULT_TIMEOUT_MS = 300_000;
