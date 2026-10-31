// Anthropic Messages API (POST /v1/messages), raw fetch like check.ts.
//
// - The system prompt and the newest user message carry cache breakpoints, so
//   the briefing and the conversation so far are read from cache next time.
// - No temperature, top_p or top_k: the current models reject them.
// - Thinking is left at the model's default (adaptive on current models);
//   effort goes in output_config.
// - A refusal arrives as HTTP 200 with stop_reason "refusal". It comes back as
//   a result with stop "refused", not an error: refusals are data (plan, Risks).
//   No server-side fallback is requested, since that would swap the model
//   mid-study.
// - Structured output rejects some JSON Schema rules (numeric minimum and
//   maximum, minItems above 1, found in the first test run, 31 Oct). They are
//   moved into the description, so the model still reads them; the engine
//   checks every answer against the real rules anyway (rules section 5).

import { kindFromStatus, type ErrorKind } from "./errors";
import { call, num, str, type Adapter } from "./http";
import { relaxSchema } from "./schema";
import type { CallOptions, ChatRequest, ChatResult, Stop } from "./types";

export const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
export const ANTHROPIC_VERSION = "2026-10-21";

const ephemeral = { type: "ephemeral" } as const;

const DROP = ["minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum", "multipleOf", "minLength", "maxLength", "maxItems", "uniqueItems"];

// A copy of the schema with the rules Anthropic rejects turned into words.
export const anthropicSchema = (schema: unknown) => relaxSchema(schema, DROP, 1);

function build(key: string, req: ChatRequest) {
  const last = req.messages.length - 1;
  const messages = req.messages.map((m, i) =>
    i === last && m.role === "user"
      ? { role: m.role, content: [{ type: "text", text: m.text, cache_control: ephemeral }] }
      : { role: m.role, content: m.text },
  );
  const outputConfig: Record<string, unknown> = {};
  if (req.effort) outputConfig.effort = req.effort;
  if (req.json) outputConfig.format = { type: "json_schema", schema: anthropicSchema(req.json.schema) };

  return {
    url: ANTHROPIC_URL,
    headers: { "x-api-key": key, "anthropic-version": ANTHROPIC_VERSION },
    body: {
      model: req.model,
      max_tokens: req.maxOutputTokens,
      system: [{ type: "text", text: req.system, cache_control: ephemeral }],
      messages,
      ...(Object.keys(outputConfig).length ? { output_config: outputConfig } : {}),
    },
  };
}

const STOPS: Record<string, Stop> = {
  end_turn: "done",
  stop_sequence: "done",
  max_tokens: "max_tokens",
  refusal: "refused",
};

function parse(body: any, res: Response) {
  if (!Array.isArray(body.content)) throw new Error("no content in the answer");
  // Thinking blocks come back empty by default; only text blocks are the reply.
  const text = body.content
    .filter((b: any) => b?.type === "text")
    .map((b: any) => str(b.text))
    .join("");
  const reason = str(body.stop_reason, "unknown");
  const category = str(body.stop_details?.category);
  const u = body.usage ?? {};
  const cachedInput = num(u.cache_read_input_tokens);
  const cacheWrite = num(u.cache_creation_input_tokens);
  return {
    modelReported: str(body.model),
    text,
    stop: STOPS[reason] ?? "other",
    stopDetail: category ? `${reason}: ${category}` : reason,
    usage: {
      // input_tokens counts only the uncached part; the ledger wants the total.
      input: num(u.input_tokens) + cachedInput + cacheWrite,
      cachedInput,
      cacheWrite,
      output: num(u.output_tokens),
      reasoning: null, // counted inside output_tokens, not reported apart
    },
    requestId: res.headers.get("request-id") ?? (str(body.id) || null),
  };
}

const KINDS: Record<string, ErrorKind> = {
  authentication_error: "bad_key",
  permission_error: "bad_key",
  billing_error: "no_credit",
  rate_limit_error: "rate_limited",
  overloaded_error: "overloaded",
  not_found_error: "model_unavailable",
  request_too_large: "bad_request",
  api_error: "server",
};

function failure(status: number, body: any) {
  const type = str(body?.error?.type);
  const message = str(body?.error?.message, `HTTP ${status}`);
  // A low balance has come back as a 400 invalid_request_error in the past.
  if (/credit balance/i.test(message)) return { kind: "no_credit" as const, detail: message };
  return { kind: KINDS[type] ?? kindFromStatus(status), detail: type ? `${type}: ${message}` : message };
}

export const anthropic: Adapter = { provider: "anthropic", build, parse, failure };

export const callAnthropic = (key: string, req: ChatRequest, opts?: CallOptions): Promise<ChatResult> =>
  call(anthropic, key, req, opts);
