// OpenRouter chat completions (POST /api/v1/chat/completions), for the
// offline judges only; the players never call it.
//
// - Each judge is pinned to one upstream provider: provider.order holds only
//   that provider, allow_fallbacks is false, and require_parameters is true,
//   so a provider that can't honour temperature 0 or the JSON format is never
//   used. Without that provider, the call fails (404) instead of moving on.
// - temperature 0 (pre-registration, section 6).
// - JSON: the frozen schema as strict structured output where the pinned
//   endpoint supports it, plain JSON mode otherwise. The runner checks every
//   answer against the schema either way (judges/prompt.ts, readCode).
// - OpenRouter reports what each call cost (usage.cost, in US dollars); the
//   ledger takes that, so judge calls count against the spending cap.

import { kindFromStatus, ProviderError } from "./errors";
import { call, num, str, type Adapter } from "./http";
import type { CallOptions, ChatRequest, ChatResult, FetchLike, Stop } from "./types";
import { OPENROUTER_MODEL_ENDPOINTS_URL } from "./check";

export const OPENROUTER_CHAT_URL = "https://openrouter.ai/api/v1/chat/completions";

export type JsonMode = "schema" | "object" | "none";

export interface JudgeCall {
  upstream: string; // the one provider allowed to serve it, e.g. "deepseek"
  temperature: number;
  jsonMode: JsonMode;
}

function adapter(o: JudgeCall): Adapter {
  return {
    provider: "openrouter",
    build(key: string, req: ChatRequest) {
      const body: Record<string, unknown> = {
        model: req.model,
        messages: [{ role: "system", content: req.system }, ...req.messages.map((m) => ({ role: m.role, content: m.text }))],
        temperature: o.temperature,
        max_tokens: req.maxOutputTokens,
        provider: { order: [o.upstream], allow_fallbacks: false, require_parameters: true },
        usage: { include: true },
      };
      if (req.json && o.jsonMode === "schema") body.response_format = { type: "json_schema", json_schema: { name: req.json.name, strict: true, schema: req.json.schema } };
      else if (req.json && o.jsonMode === "object") body.response_format = { type: "json_object" };
      return { url: OPENROUTER_CHAT_URL, headers: { Authorization: `Bearer ${key}`, "X-Title": "Tidewall judges" }, body };
    },
    parse(body: any, res: Response) {
      const choice = Array.isArray(body.choices) ? body.choices[0] : null;
      if (!choice) throw new Error(body?.error?.message ? `error in the answer: ${str(body.error.message)}` : "no choices in the answer");
      const finish = str(choice.finish_reason);
      const refusal = str(choice.message?.refusal);
      const text = str(choice.message?.content);
      let stop: Stop = "other";
      if (refusal && !text) stop = "refused";
      else if (finish === "content_filter") stop = "refused";
      else if (finish === "length") stop = "max_tokens";
      else if (finish === "stop") stop = "done";
      const u = body.usage ?? {};
      const cached = num(u.prompt_tokens_details?.cached_tokens);
      return {
        modelReported: str(body.model),
        providerReported: str(body.provider) || null,
        text,
        stop,
        stopDetail: [finish, str(choice.native_finish_reason)].filter(Boolean).join(" / ") || "unknown",
        usage: {
          input: num(u.prompt_tokens),
          cachedInput: cached,
          cacheWrite: num(u.prompt_tokens_details?.cache_write_tokens),
          output: num(u.completion_tokens),
          reasoning: u.completion_tokens_details ? num(u.completion_tokens_details.reasoning_tokens) : null,
        },
        costUsd: typeof u.cost === "number" && Number.isFinite(u.cost) ? u.cost : null,
        requestId: str(body.id) || res.headers.get("x-request-id"),
      };
    },
    failure(status: number, body: any) {
      const message = str(body?.error?.message, `HTTP ${status}`);
      // 402: out of credit. 404: no endpoint for this model and provider
      // (with allow_fallbacks false, the pinned provider is down or gone).
      if (status === 402) return { kind: "no_credit" as const, detail: message };
      if (status === 404) return { kind: "model_unavailable" as const, detail: message };
      return { kind: kindFromStatus(status), detail: message };
    },
  };
}

export const callOpenRouter = (key: string, req: ChatRequest, o: JudgeCall, opts?: CallOptions): Promise<ChatResult> =>
  call(adapter(o), key, req, opts);

// Who serves a model on OpenRouter right now (public; no key). The judges'
// preflight reads it before any call: the pinned provider must be listed,
// up, and support what the call sends.
export interface Endpoint {
  provider: string; // display name, e.g. "DeepSeek"
  tag: string; // routing slug, e.g. "deepseek"
  status: number | null; // 0 is up
  parameters: string[];
  price: { prompt: number; completion: number } | null; // dollars per token
}

export async function modelEndpoints(model: string, doFetch: FetchLike = (r) => fetch(r)): Promise<Endpoint[]> {
  let res: Response;
  try {
    res = await doFetch(new Request(OPENROUTER_MODEL_ENDPOINTS_URL(model), { signal: AbortSignal.timeout(15_000) }));
  } catch {
    throw new ProviderError("openrouter", "network", 0, `couldn't reach OpenRouter to look up ${model}`);
  }
  const body: any = await res.json().catch(() => null);
  if (!res.ok) throw new ProviderError("openrouter", res.status === 404 ? "model_unavailable" : kindFromStatus(res.status), res.status, `${model}: ${str(body?.error?.message, `HTTP ${res.status}`)}`);
  const list = body?.data?.endpoints;
  if (!Array.isArray(list)) throw new ProviderError("openrouter", "bad_response", res.status, `${model}: no endpoint list in the answer`);
  return list.map((e: any) => {
    const prompt = Number(e?.pricing?.prompt), completion = Number(e?.pricing?.completion);
    return {
      provider: str(e?.provider_name),
      tag: str(e?.tag) || str(e?.provider_name).toLowerCase(),
      status: typeof e?.status === "number" ? e.status : null,
      parameters: Array.isArray(e?.supported_parameters) ? e.supported_parameters.map(String) : [],
      price: Number.isFinite(prompt) && Number.isFinite(completion) ? { prompt, completion } : null,
    };
  });
}

// The endpoint a pin names: its tag ("deepseek", "deepinfra/fp8") or, failing
// that, its provider's name in any case.
export const pinned = (endpoints: Endpoint[], upstream: string) =>
  endpoints.find((e) => e.tag === upstream) ?? endpoints.find((e) => e.provider.toLowerCase() === upstream.toLowerCase()) ?? null;
