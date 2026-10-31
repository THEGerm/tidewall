// A Player backed by a model (rules section 8). Each step is one call: the
// stable system prompt, then today's briefing for that step, answered as
// schema-checked JSON. Keys follow the day's paying order; a key that fails
// in a way another key could fix moves on to the next participant's.
// Every call, successful or not, is reported through onCall for the ledger.

import type { PlayerName } from "../engine/config";
import { Refusal, type Event, type Player, type View } from "../engine/types";
import { ProviderError, callModel, withRetry, type ChatRequest, type ChatResult, type Provider, type Usage } from "../providers";
import type { KeyCandidate } from "./keys";
import type { Prompts } from "./prompts";
import { actSchema, answersSchema, confideSchema, messagesSchema, offersSchema, wireSchema } from "./schemas";

export interface CallRecord {
  player: PlayerName;
  step: string;
  day: number;
  provider: Provider;
  model: string;
  modelReported: string | null;
  payer: string | null; // participant email; null when no key was tried
  fallbackKey: boolean; // paid by someone other than the day's owner
  ok: boolean;
  stop: string | null;
  usage: Usage | null;
  error: string | null;
  latencyMs: number | null;
}

export interface ModelPlayerOptions {
  name: PlayerName;
  provider: Provider;
  model: string;
  prompts: Prompts;
  keys: (day: number) => Promise<KeyCandidate[]>;
  onCall: (r: CallRecord) => void | Promise<void>;
  maxOutputTokens?: number;
  effort?: "low" | "medium" | "high";
  call?: typeof callModel; // injected in tests
  retry?: typeof withRetry; // injected in tests (no sleeping)
}

export class NoKeyError extends Error {
  constructor(provider: Provider, last?: string) {
    super(`no participant has a working ${provider} key${last ? ` (last error: ${last})` : ""}`);
    this.name = "NoKeyError";
  }
}

export function modelPlayer(o: ModelPlayerOptions): Player {
  const call = o.call ?? callModel;
  const retry = o.retry ?? withRetry;

  async function ask(step: string, day: number, user: string, schemaName: string, schema: Record<string, unknown>): Promise<unknown> {
    const req: ChatRequest = {
      model: o.model,
      system: o.prompts.system(o.name),
      messages: [{ role: "user", text: user }],
      maxOutputTokens: o.maxOutputTokens ?? 4000,
      ...(o.effort ? { effort: o.effort } : {}),
      json: { name: schemaName, schema },
      cacheKey: `tidewall-${o.name}`,
    };
    const keys = await o.keys(day);
    if (keys.length === 0) {
      await o.onCall({ player: o.name, step, day, provider: o.provider, model: o.model, modelReported: null, payer: null, fallbackKey: false, ok: false, stop: null, usage: null, error: "no key", latencyMs: null });
      throw new NoKeyError(o.provider);
    }
    let lastError: unknown;
    for (const k of keys) {
      let result: ChatResult;
      try {
        result = await retry(() => call(o.provider, k.key, req));
      } catch (err) {
        lastError = err;
        await o.onCall({ player: o.name, step, day, provider: o.provider, model: o.model, modelReported: null, payer: k.email, fallbackKey: !k.owner, ok: false, stop: null, usage: null, error: err instanceof Error ? err.message : String(err), latencyMs: null });
        if (err instanceof ProviderError && err.tryNextKey) continue;
        throw err;
      }
      await o.onCall({ player: o.name, step, day, provider: o.provider, model: o.model, modelReported: result.modelReported, payer: k.email, fallbackKey: !k.owner, ok: true, stop: result.stop, usage: result.usage, error: null, latencyMs: result.latencyMs });
      if (result.stop === "refused") throw new Refusal(result.stopDetail);
      try {
        return JSON.parse(result.text);
      } catch {
        return { _unparsed: result.text.slice(0, 500) }; // the engine's check rejects it and retries
      }
    }
    // Every key failed. A missing model is the model's fault, not the keys': say so.
    if (lastError instanceof ProviderError && lastError.kind === "model_unavailable") throw lastError;
    if (lastError instanceof ProviderError && lastError.tryNextKey) throw new NoKeyError(o.provider, lastError.message);
    throw lastError;
  }

  const user = (step: Parameters<Prompts["step"]>[0], v: View) => o.prompts.step(step, v);

  const player: Player = {
    name: o.name,
    messages: (v) => ask("messages", v.day, user("messages", v), "messages", messagesSchema(o.name)) as any,
    act: (v) => ask("act", v.day, user("act", v), "act", actSchema(v)) as any,
  };
  if (o.name !== "World") player.confide = (v, window) => ask(`confide_${window}`, v.day, user(`confide_${window}`, v), "confidant_text", confideSchema()) as any;
  if (o.name === "Families" || o.name === "Saltdogs") player.bribeOffers = (v) => ask("offers", v.day, user("offers", v), "bribe_offers", offersSchema(v)) as any;
  if (o.name === "Chief") player.bribeAnswers = (v) => ask("answers", v.day, user("answers", v), "bribe_answers", answersSchema(v)) as any;
  if (o.name === "World") {
    let day = 0;
    const act = player.act;
    player.act = (v) => { day = v.day; return act(v); };
    player.wire = (events: Event[], retryErrors?: string[]) =>
      ask("wire", day, o.prompts.wire(events) + (retryErrors ? `\nYour last answer was rejected: ${retryErrors.join("; ")}.` : ""), "wire", wireSchema(events.map((e) => e.id))) as any;
  }
  return player;
}
