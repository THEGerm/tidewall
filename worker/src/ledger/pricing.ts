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
  // Gemini and GPT: set with the pinned model IDs (players/models.ts).
};

export function priceOf(model: string): Price | null {
  return PRICES[model] ?? null;
}

export interface TokenUsage {
  input: number; // all prompt tokens, cached included
  cachedInput: number;
  cacheWrite: number;
  output: number;
}

export function costOf(model: string, u: TokenUsage): number | null {
  const p = priceOf(model);
  if (!p) return null;
  const fresh = Math.max(0, u.input - u.cachedInput - u.cacheWrite);
  return (fresh * p.input + u.cachedInput * p.cachedInput + u.cacheWrite * p.cacheWrite + u.output * p.output) / 1e6;
}
