// The three study models. Exact snapshot IDs are pinned here before week 1
// (#17: "pinned model versions"); a run refuses to start with an unpinned one.

import type { Provider } from "../keys/store";

export type Family = "claude" | "gemini" | "gpt";

export const MODELS: Record<Family, { provider: Provider; model: string }> = {
  claude: { provider: "anthropic", model: "claude-opus-5-5" },
  gemini: { provider: "google", model: "PIN-BEFORE-WEEK-1" },
  gpt: { provider: "openai", model: "PIN-BEFORE-WEEK-1" },
};

export const isPinned = (f: Family) => !MODELS[f].model.startsWith("PIN-");
