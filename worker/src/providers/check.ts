// Checks a provider key, free of charge, in two parts:
//  1. Is the key valid? Ask the provider to list its models (or, for
//     OpenRouter, to describe the key). It proves the key works; it can't show
//     remaining credit.
//  2. Can it use each pinned model (players/models.ts: study, test and judge
//     sets)? Ask the provider's metadata endpoint about each model ID.
//
// What "usable" means: the provider lists this model for this key. A metadata
// endpoint may not reflect every project-level restriction: an OpenAI project
// can block a model for generation while GET /v1/models/{id} still answers 200,
// and Google or Anthropic may apply limits that only show on a real call. So a
// "usable" here is a good sign, not a promise; the definitive signal remains
// the ledger's model_unavailable errors on real calls.
//
// The key only ever travels in a header, never in a URL, and no answer from
// the provider is echoed back: results carry a status and a fixed reason.

import type { Provider } from "../keys/store";
import { pinnedModels } from "../players/models";
import type { FetchLike } from "./types";

export type CheckResult = { ok: boolean; status: number; detail: string };

// usable: the provider lists the model for this key. not_usable: the provider
// said no (404, 403 and the like). unknown: no clear answer (network, 429, 5xx).
export type ModelResult = "usable" | "not_usable" | "unknown";
export type ModelCheck = { model: string; result: ModelResult; status: number; reason: string };

// OpenRouter endpoints. Both must be confirmed against OpenRouter's API docs
// before the judges rely on them: GET /api/v1/key describes the key it is
// called with (200 for a valid key, 401 otherwise), and
// GET /api/v1/models/{author}/{slug}/endpoints lists who serves a model. The
// second is public, so for OpenRouter "usable" means "OpenRouter lists
// endpoints for this model", not anything about this key.
export const OPENROUTER_KEY_URL = "https://openrouter.ai/api/v1/key";
export const OPENROUTER_MODEL_ENDPOINTS_URL = (id: string) =>
  `https://openrouter.ai/api/v1/models/${id.split("/").map(encodeURIComponent).join("/")}/endpoints`;

const TIMEOUT_MS = 15_000;
const ANTHROPIC_VERSION = "2023-06-01";

function headers(provider: Provider, key: string): Record<string, string> {
  switch (provider) {
    case "anthropic":
      return { "x-api-key": key, "anthropic-version": ANTHROPIC_VERSION };
    case "openai":
    case "openrouter":
      return { Authorization: `Bearer ${key}` };
    case "google":
      return { "x-goog-api-key": key };
  }
}

function keyUrl(provider: Provider): string {
  switch (provider) {
    case "anthropic":
      return "https://api.anthropic.com/v1/models?limit=1";
    case "openai":
      return "https://api.openai.com/v1/models";
    case "google":
      return "https://generativelanguage.googleapis.com/v1beta/models?pageSize=1";
    case "openrouter":
      return OPENROUTER_KEY_URL;
  }
}

function modelUrl(provider: Provider, model: string): string {
  const id = encodeURIComponent(model);
  switch (provider) {
    case "anthropic":
      return `https://api.anthropic.com/v1/models/${id}`;
    case "openai":
      return `https://api.openai.com/v1/models/${id}`;
    case "google":
      return `https://generativelanguage.googleapis.com/v1beta/models/${id}`;
    case "openrouter":
      return OPENROUTER_MODEL_ENDPOINTS_URL(model);
  }
}

const defaultFetch: FetchLike = (r) => fetch(r);
const get = (url: string, h: Record<string, string>) => new Request(url, { headers: h, signal: AbortSignal.timeout(TIMEOUT_MS) });

export async function checkKey(provider: Provider, key: string, doFetch: FetchLike = defaultFetch): Promise<CheckResult> {
  let res: Response;
  try {
    res = await doFetch(get(keyUrl(provider), headers(provider, key)));
  } catch {
    return { ok: false, status: 0, detail: "couldn't reach the provider" };
  }
  if (res.ok) return { ok: true, status: res.status, detail: "the provider accepted this key" };
  // Google answers 400 (API_KEY_INVALID) for a bad key; the others answer 401.
  if (res.status === 401 || res.status === 403 || (provider === "google" && res.status === 400)) {
    return { ok: false, status: res.status, detail: "the provider rejected this key" };
  }
  if (res.status === 429) return { ok: false, status: 429, detail: "rate limited, try again in a minute" };
  return { ok: false, status: res.status, detail: `the provider answered ${res.status}` };
}

const NOT_USABLE: Record<number, string> = {
  400: "the provider refused the request",
  401: "key rejected",
  402: "no credit",
  403: "no access",
  404: "not found for this key",
};

export async function checkModel(provider: Provider, key: string, model: string, doFetch: FetchLike = defaultFetch): Promise<ModelCheck> {
  // OpenRouter's model endpoint is public: it gets no key at all.
  const h = provider === "openrouter" ? {} : headers(provider, key);
  let res: Response;
  try {
    res = await doFetch(get(modelUrl(provider, model), h));
  } catch {
    return { model, result: "unknown", status: 0, reason: "couldn't reach the provider" };
  }
  if (res.ok) {
    if (provider === "openrouter") {
      const body: any = await res.json().catch(() => null);
      const endpoints = body?.data?.endpoints;
      if (Array.isArray(endpoints) && endpoints.length === 0) {
        return { model, result: "not_usable", status: res.status, reason: "no provider serves it right now" };
      }
    }
    return { model, result: "usable", status: res.status, reason: "listed for this key" };
  }
  if (res.status === 429) return { model, result: "unknown", status: 429, reason: "rate limited, try again in a minute" };
  if (res.status >= 500) return { model, result: "unknown", status: res.status, reason: "the provider had an error" };
  return { model, result: "not_usable", status: res.status, reason: NOT_USABLE[res.status] ?? `the provider answered ${res.status}` };
}

// The Test button: the key check, then each pinned model one by one (a
// handful at most, so there is no burst). If the key itself fails, the models
// aren't asked about: every answer would only repeat that failure.
export async function testKey(
  provider: Provider,
  key: string,
  doFetch: FetchLike = defaultFetch,
): Promise<{ check: CheckResult; models: ModelCheck[] }> {
  const check = await checkKey(provider, key, doFetch);
  const models: ModelCheck[] = [];
  for (const model of pinnedModels(provider)) {
    models.push(
      check.ok
        ? await checkModel(provider, key, model, doFetch)
        : { model, result: "unknown", status: 0, reason: "not checked: the key itself failed" },
    );
  }
  return { check, models };
}
