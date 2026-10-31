// The three study models. Exact snapshot IDs are pinned here before week 1
// (#17: "pinned model versions"); a run refuses to start with an unpinned one.

import type { Provider } from "../keys/store";

export type Family = "claude" | "gemini" | "gpt";

export const MODELS: Record<Family, { provider: Provider; model: string }> = {
  claude: { provider: "anthropic", model: "claude-opus-5-5" },
  // Gemini 4 Argon, chosen by Germ 30 Oct: Google's flagship and only Gemini 4
  // model. Stable ID; no dated version is listed, so calls log the reported model.
  gemini: { provider: "google", model: "gemini-4-argon" },
  // GPT-6.1 Sol, chosen by Germ 30 Oct: OpenAI's flagship workhorse, the tier that
  // matches Opus 5.5. No dated snapshot is listed, so every call logs the model
  // the provider reports (ledger.model_reported) to catch silent updates.
  gpt: { provider: "openai", model: "gpt-6.1-sol" },
};

// Same reasoning effort for every model (Germ, 30 Oct), so differences come from
// the models, not from one of them thinking harder.
export const EFFORT = "medium" as const;

// Cheap models for test runs (Germ, 30 Oct). They exercise the whole pipeline
// for a fraction of the cost; their runs are marked model_set = 'test' and
// stay out of the analysis. Used by test run 001-germ.
export const CHEAP_TEST_MODELS: Record<Family, { provider: Provider; model: string }> = {
  claude: { provider: "anthropic", model: "claude-haiku-5-5" },
  // Gemini 3.1 Flash-Lite (Germ, 31 Oct): half the output price of 3 Flash
  // Preview, which spent 90% of its output on thinking in the first test run.
  // 2.5 Flash-Lite was tried first and is "no longer available to new users".
  gemini: { provider: "google", model: "gemini-3.1-flash-lite" },
  gpt: { provider: "openai", model: "gpt-6-luna" }, // Germ, 30 Oct: current, same generation as Sol
};

// Test runs play the study models for now (Germ, 31 Oct): test run 002-germ
// checks the study models' cost and behaviour end to end. Its runs stay
// model_set = 'test', so they stay out of the analysis. To go back to the
// cheap models, set this to CHEAP_TEST_MODELS.
export const TEST_MODELS: Record<Family, { provider: Provider; model: string }> = MODELS;

export type ModelSet = "study" | "test";
export const modelsFor = (set: ModelSet) => (set === "test" ? TEST_MODELS : MODELS);

export const isPinned = (f: Family, set: ModelSet = "study") => !modelsFor(set)[f].model.startsWith("PIN-");
