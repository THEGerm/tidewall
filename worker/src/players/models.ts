// The three study models. Exact snapshot IDs are pinned here before week 1
// (#17: "pinned model versions"); a run refuses to start with an unpinned one.

import type { Provider } from "../keys/store";

export type Family = "claude" | "gemini" | "gpt";

export const MODELS: Record<Family, { provider: Provider; model: string }> = {
  claude: { provider: "anthropic", model: "claude-opus-5-5" },
  gemini: { provider: "google", model: "PIN-BEFORE-WEEK-1" },
  // GPT-6.1 Sol, chosen by Germ 30 Oct: OpenAI's flagship workhorse, the tier that
  // matches Opus 5.5. No dated snapshot is listed, so every call logs the model
  // the provider reports (ledger.model_reported) to catch silent updates.
  gpt: { provider: "openai", model: "gpt-6.1-sol" },
};

// Same reasoning effort for every model (Germ, 30 Oct), so differences come from
// the models, not from one of them thinking harder.
export const EFFORT = "medium" as const;

export const isPinned = (f: Family) => !MODELS[f].model.startsWith("PIN-");
