// OpenAI Responses API (POST /v1/responses).
//
// - store: false, so OpenAI keeps no copy of the conversation for later
//   retrieval; the engine sends the history it wants each time.
// - Caching is automatic for long prompts; cacheKey, when given, is sent as
//   prompt_cache_key to keep one player's calls on the same cache.
// - No temperature: the current reasoning models reject it.
// - input_tokens already includes cached tokens, and output_tokens includes
//   reasoning, which is reported apart as well.

import { kindFromStatus } from "./errors";
import { call, num, str, type Adapter } from "./http";
import type { CallOptions, ChatRequest, ChatResult, Stop } from "./types";
import { relaxSchema } from "./schema";

// Strict structured output rejects uniqueItems (found with GPT-6.1 Sol, 31 Oct).
export const openaiSchema = (schema: unknown) => relaxSchema(schema, ["uniqueItems"]);

export const OPENAI_URL = "https://api.openai.com/v1/responses";

function build(key: string, req: ChatRequest) {
  const body: Record<string, unknown> = {
    model: req.model,
    instructions: req.system,
    input: req.messages.map((m) => ({ role: m.role, content: m.text })),
    max_output_tokens: req.maxOutputTokens,
    store: false,
  };
  if (req.effort) body.reasoning = { effort: req.effort };
  if (req.json) body.text = { format: { type: "json_schema", name: req.json.name, schema: openaiSchema(req.json.schema), strict: true } };
  if (req.cacheKey) body.prompt_cache_key = req.cacheKey;
  return { url: OPENAI_URL, headers: { Authorization: `Bearer ${key}` }, body };
}

function parse(body: any, res: Response) {
  if (!Array.isArray(body.output)) throw new Error("no output in the answer");
  let text = "";
  let refusal = "";
  for (const item of body.output) {
    if (item?.type !== "message" || !Array.isArray(item.content)) continue; // skip reasoning items
    for (const part of item.content) {
      if (part?.type === "output_text") text += str(part.text);
      if (part?.type === "refusal") refusal += str(part.refusal);
    }
  }

  const status = str(body.status, "unknown");
  const incomplete = str(body.incomplete_details?.reason);
  let stop: Stop = "other";
  let stopDetail = incomplete ? `${status}: ${incomplete}` : status;
  if (refusal && !text) {
    stop = "refused";
    stopDetail = `refusal: ${refusal.slice(0, 200)}`;
  } else if (incomplete === "content_filter") stop = "refused";
  else if (incomplete === "max_output_tokens") stop = "max_tokens";
  else if (status === "completed") stop = "done";

  const u = body.usage ?? {};
  return {
    modelReported: str(body.model),
    text,
    stop,
    stopDetail,
    usage: {
      input: num(u.input_tokens),
      cachedInput: num(u.input_tokens_details?.cached_tokens),
      cacheWrite: 0, // OpenAI doesn't bill cache writes
      output: num(u.output_tokens),
      reasoning: num(u.output_tokens_details?.reasoning_tokens),
    },
    requestId: res.headers.get("x-request-id") ?? (str(body.id) || null),
  };
}

function failure(status: number, body: any) {
  const code = str(body?.error?.code);
  const type = str(body?.error?.type);
  const message = str(body?.error?.message, `HTTP ${status}`);
  // 429 means two different things at OpenAI: out of money, or too fast.
  if (code === "insufficient_quota" || type === "insufficient_quota") return { kind: "no_credit" as const, detail: message };
  if (code === "invalid_api_key") return { kind: "bad_key" as const, detail: message };
  if (code === "model_not_found") return { kind: "model_unavailable" as const, detail: message };
  return { kind: kindFromStatus(status), detail: code ? `${code}: ${message}` : message };
}

export const openai: Adapter = { provider: "openai", build, parse, failure };

export const callOpenAI = (key: string, req: ChatRequest, opts?: CallOptions): Promise<ChatResult> =>
  call(openai, key, req, opts);
