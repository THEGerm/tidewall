// Prices per million tokens, used to cost every call in the ledger. Check and
// date each row before week 1: a price left null makes its calls cost null,
// and the spending cap then can't see them (the runner refuses to start).

export interface Price {
  input: number; // uncached input
  cachedInput: number; // cache reads
  cacheWrite: number; // cache writes
  output: number; // output, reasoning included
  checked: string; // date the price was checked
}

export const PRICES: Record<string, Price | null> = {
  // Anthropic list price, checked 30 Oct 2026 (Claude API skill table). Cache
  // writes are billed at 1.25 x input for the 5-minute cache.
  "claude-opus-5-5": { input: 4, cachedInput: 0.2, cacheWrite: 5, output: 20, checked: "2026-10-30" },
  // OpenAI model page, checked 30 Oct 2026. Prompts over 272K input tokens
  // cost more; Tidewall prompts stay far below that.
  "gpt-6.1-sol": { input: 2, cachedInput: 0.1, cacheWrite: 2.5, output: 10, checked: "2026-10-30" },
  // Google pricing page, Standard tier, checked 30 Oct 2026. Implicit caching
  // only: no cache-write charge. Prices double on 1 Dec 2026 (PRICE_CHANGES).
  "gemini-4-argon": { input: 2, cachedInput: 0.1, cacheWrite: 0, output: 10, checked: "2026-10-30" },

  // Test-run models (Germ, 30 Oct).
  // Claude Haiku 5.5, Claude pricing page, checked 30 Oct 2026, prompts up to 100K
  // tokens: $0.10 in, $0.125 for 5-minute cache writes, $0.01 cache hits, $0.50 out.
  "claude-haiku-5-5": { input: 0.1, cachedInput: 0.01, cacheWrite: 0.125, output: 0.5, checked: "2026-10-30" },
  // Gemini 3 Flash Preview, Google pricing page, Standard tier, checked 30 Oct
  // 2026. Implicit caching: no write charge.
  "gemini-3-flash-preview": { input: 0.5, cachedInput: 0.05, cacheWrite: 0, output: 3, checked: "2026-10-30" },
  // GPT-6 Luna, OpenAI pricing page, checked 30 Oct 2026, short context (up to
  // 272K input): $0.10 in, $0.01 cached input, $0.125 for 30-minute cache writes, $0.50 out.
  "gpt-6-luna": { input: 0.1, cachedInput: 0.01, cacheWrite: 0.125, output: 0.5, checked: "2026-10-30" },
};

// Announced price changes: from that date (UTC), the new price applies.
export const PRICE_CHANGES: Record<string, { from: string; price: Price }[]> = {
  "gemini-4-argon": [{ from: "2026-12-01", price: { input: 4, cachedInput: 0.2, cacheWrite: 0, output: 20, checked: "2026-10-30" } }],
};

export function priceOf(model: string, at: Date = new Date()): Price | null {
  const day = at.toISOString().slice(0, 10);
  const changed = (PRICE_CHANGES[model] ?? []).filter((c) => c.from <= day).sort((a, b) => a.from.localeCompare(b.from)).at(-1);
  return changed?.price ?? PRICES[model] ?? null;
}

export interface TokenUsage {
  input: number; // all prompt tokens, cached included
  cachedInput: number;
  cacheWrite: number;
  output: number;
}

export function costOf(model: string, u: TokenUsage, at: Date = new Date()): number | null {
  const p = priceOf(model, at);
  if (!p) return null;
  const fresh = Math.max(0, u.input - u.cachedInput - u.cacheWrite);
  return (fresh * p.input + u.cachedInput * p.cachedInput + u.cacheWrite * p.cacheWrite + u.output * p.output) / 1e6;
}
