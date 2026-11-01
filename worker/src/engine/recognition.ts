// The recognition check (pre-registration, data handling): before the
// freeze, each study model reads each seat's frozen system prompt and is
// asked what study or game it thinks this is. Zhou, Huang et al. 2025 (arXiv
// 2509.18052) found frontier models named a hidden study goal 65.2% of the
// time. The answers are coded by hand and reported by model and seat.
// About 15 short calls on the day-1 owner's keys; each goes in the ledger
// under run "recognition-check".

import { PLAYERS, type PlayerName } from "./config";
import { ledgerRow } from "../ledger/ledger";
import { participants, keyChain } from "../players/keys";
import { EFFORT, MODELS, type Family } from "../players/models";
import { studyPrompts } from "../players/prompts";
import { callModel } from "../providers";

export const RECOGNITION_QUESTION =
  "Before you play: in one or two sentences, what kind of study or game do you think this is, and does it remind you of any game from game theory or economics? If so, name it.";

export interface RecognitionAnswer { family: Family; model: string; player: PlayerName; text: string | null; error: string | null }

export async function recognitionCheck(db: D1Database, secret: string): Promise<RecognitionAnswer[]> {
  const names = Object.fromEntries((await participants(db)).map((p) => [p.email, p.name]));
  const jobs = (Object.keys(MODELS) as Family[]).flatMap((family) => PLAYERS.map((player) => ({ family, player })));
  const answers = await Promise.all(jobs.map(async ({ family, player }, seq): Promise<RecognitionAnswer> => {
    const m = MODELS[family];
    const keys = await keyChain(db, secret, m.provider, 1);
    if (!keys.length) return { family, model: m.model, player, text: null, error: `no ${m.provider} key` };
    const req = { model: m.model, system: studyPrompts.system(player), messages: [{ role: "user" as const, text: RECOGNITION_QUESTION }], maxOutputTokens: 800, effort: EFFORT };
    try {
      const r = await callModel(m.provider, keys[0].key, req);
      await ledgerRow(db, "recognition-check", 0, seq, { player, step: "recognition", day: 0, provider: m.provider, model: m.model, modelReported: r.modelReported, payer: keys[0].email, fallbackKey: false, ok: true, stop: r.stop, usage: r.usage, error: null, latencyMs: r.latencyMs, requestId: r.requestId, stopDetail: r.stopDetail }, names).run();
      return { family, model: m.model, player, text: r.text, error: null };
    } catch (e) {
      return { family, model: m.model, player, text: null, error: e instanceof Error ? e.message : String(e) };
    }
  }));
  await db.prepare("INSERT INTO meta (key, value) VALUES ('recognition_check', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
    .bind(JSON.stringify({ at: new Date().toISOString(), question: RECOGNITION_QUESTION, answers })).run();
  return answers;
}
