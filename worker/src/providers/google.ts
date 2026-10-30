// Google Gemini API (POST /v1beta/models/{model}:generateContent).
//
// - The key goes in the x-goog-api-key header, never in the URL, so it can't
//   end up in a logged address.
// - Caching is implicit on current Gemini models; cachedContentTokenCount
//   reports the hits. promptTokenCount already includes them.
// - Thinking tokens are billed as output but reported apart (thoughtsTokenCount),
//   so output here is candidates + thoughts.
// - A blocked prompt (promptFeedback.blockReason) or a safety stop comes back as
//   stop "refused", not an error.

import { kindFromStatus, type ErrorKind } from "./errors";
import { call, num, str, type Adapter } from "./http";
import type { CallOptions, ChatRequest, ChatResult, Stop } from "./types";

export const GOOGLE_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export const googleUrl = (model: string) =>
  `${GOOGLE_BASE}/${encodeURIComponent(model.replace(/^models\//, ""))}:generateContent`;

function build(key: string, req: ChatRequest) {
  const generationConfig: Record<string, unknown> = { maxOutputTokens: req.maxOutputTokens };
  if (req.effort) generationConfig.thinkingConfig = { thinkingLevel: req.effort };
  if (req.json) {
    generationConfig.responseMimeType = "application/json";
    generationConfig.responseJsonSchema = req.json.schema;
  }
  return {
    url: googleUrl(req.model),
    headers: { "x-goog-api-key": key },
    body: {
      systemInstruction: { parts: [{ text: req.system }] },
      contents: req.messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.text }] })),
      generationConfig,
    },
  };
}

const REFUSED = new Set(["SAFETY", "RECITATION", "BLOCKLIST", "PROHIBITED_CONTENT", "SPII", "IMAGE_SAFETY"]);

function parse(body: any, res: Response) {
  const candidate = Array.isArray(body.candidates) ? body.candidates[0] : undefined;
  const blocked = str(body.promptFeedback?.blockReason);
  if (!candidate && !blocked) throw new Error("no candidates in the answer");

  const parts: any[] = Array.isArray(candidate?.content?.parts) ? candidate.content.parts : [];
  // Thought parts (thought: true) are the model's reasoning summary, not its reply.
  const text = parts
    .filter((p) => !p?.thought)
    .map((p) => str(p?.text))
    .join("");

  const reason = blocked ? `blocked: ${blocked}` : str(candidate?.finishReason, "unknown");
  let stop: Stop = "other";
  if (blocked || REFUSED.has(reason)) stop = "refused";
  else if (reason === "STOP") stop = "done";
  else if (reason === "MAX_TOKENS") stop = "max_tokens";

  const u = body.usageMetadata ?? {};
  const thoughts = num(u.thoughtsTokenCount);
  return {
    modelReported: str(body.modelVersion),
    text,
    stop,
    stopDetail: reason,
    usage: {
      input: num(u.promptTokenCount),
      cachedInput: num(u.cachedContentTokenCount),
      cacheWrite: 0, // implicit caching has no write charge
      output: num(u.candidatesTokenCount) + thoughts,
      reasoning: thoughts,
    },
    requestId: str(body.responseId) || res.headers.get("x-request-id") || null,
  };
}

const KINDS: Record<string, ErrorKind> = {
  UNAUTHENTICATED: "bad_key",
  PERMISSION_DENIED: "bad_key",
  // Billing not set up, or the free tier isn't offered where the call came from.
  FAILED_PRECONDITION: "no_credit",
  RESOURCE_EXHAUSTED: "rate_limited",
  NOT_FOUND: "model_unavailable",
  UNAVAILABLE: "overloaded",
  INTERNAL: "server",
  DEADLINE_EXCEEDED: "server",
};

function failure(status: number, body: any) {
  const err = body?.error ?? {};
  const state = str(err.status);
  const message = str(err.message, `HTTP ${status}`);
  const reasons: string[] = Array.isArray(err.details) ? err.details.map((d: any) => str(d?.reason)) : [];
  // A bad key is a 400 INVALID_ARGUMENT with reason API_KEY_INVALID.
  if (reasons.includes("API_KEY_INVALID") || /API key not valid/i.test(message)) {
    return { kind: "bad_key" as const, detail: message };
  }
  return { kind: KINDS[state] ?? kindFromStatus(status), detail: state ? `${state}: ${message}` : message };
}

export const google: Adapter = { provider: "google", build, parse, failure };

export const callGoogle = (key: string, req: ChatRequest, opts?: CallOptions): Promise<ChatResult> =>
  call(google, key, req, opts);
