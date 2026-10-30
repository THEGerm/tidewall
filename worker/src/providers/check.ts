// Checks that a provider key works by listing the provider's models.
// Listing models is free at all three providers, so a check costs nothing.
// It proves the key is valid; it can't show remaining credit.

import type { Provider } from "../keys/store";

export type CheckResult = { ok: boolean; status: number; detail: string };

function request(provider: Provider, key: string): Request {
  switch (provider) {
    case "anthropic":
      return new Request("https://api.anthropic.com/v1/models?limit=1", {
        headers: { "x-api-key": key, "anthropic-version": "2023-06-01" },
      });
    case "openai":
      return new Request("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${key}` },
      });
    case "google":
      return new Request("https://generativelanguage.googleapis.com/v1beta/models?pageSize=1", {
        headers: { "x-goog-api-key": key },
      });
  }
}

export async function checkKey(provider: Provider, key: string): Promise<CheckResult> {
  let res: Response;
  try {
    res = await fetch(request(provider, key));
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
