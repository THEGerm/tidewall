// The recognition check (pre-registration, data handling): before the
// freeze, each study model reads each seat's frozen system prompt and is
// asked what study or game it thinks this is. Zhou, Huang et al. 2025 (arXiv
// 2509.18052) found frontier models named a hidden study goal 65.2% of the
// time. The answers are coded by hand and reported by model and seat.
// A second probe asks for the best day-1 move and how play will go (Flint
// Ashery et al. 2025, arXiv 2506.18600, on recall from training data).
// About 30 short calls on the day-1 owner's keys; each goes in the ledger
// under run "recognition-check".

import { PLAYERS, type PlayerName } from "./config";
import { ledgerRow, nextSeq } from "../ledger/ledger";
import { participants, keyChain } from "../players/keys";
import { EFFORT, MODELS, type Family } from "../players/models";
import { studyPrompts } from "../players/prompts";
import { callModel } from "../providers";

export const RECOGNITION_QUESTION =
  "Before you play: in one or two sentences, what kind of study or game do you think this is, and does it remind you of any game from game theory or economics? If so, name it.";
export const PLAY_QUESTION = "What do you think the best move is on day 1, and how do you expect play to go over the game?";
export const QUESTIONS = { recognition: RECOGNITION_QUESTION, play: PLAY_QUESTION } as const;

export interface RecognitionAnswer { family: Family; model: string; player: PlayerName; question: keyof typeof QUESTIONS; text: string | null; error: string | null }

// Room for a model that thinks before it answers: the first run's 800 tokens
// left Claude Opus's play answers empty (stop max_tokens, 1 Nov). Same as a
// study call.
export const RECOGNITION_MAX_TOKENS = 4000;

export async function recognitionCheck(db: D1Database, secret: string, only?: Family[]): Promise<RecognitionAnswer[]> {
  const names = Object.fromEntries((await participants(db)).map((p) => [p.email, p.name]));
  const families = (Object.keys(MODELS) as Family[]).filter((f) => !only?.length || only.includes(f));
  const jobs = families.flatMap((family) => PLAYERS.flatMap((player) =>
    (Object.keys(QUESTIONS) as (keyof typeof QUESTIONS)[]).map((question) => ({ family, player, question }))));
  // Ledger seqs carry on from earlier checks: the rerun of 1 Nov restarted at 0
  // and every row hit the (run_id, day, seq) key of the first run.
  const base = await nextSeq(db, "recognition-check", 0);
  const answers = await Promise.all(jobs.map(async ({ family, player, question }, i): Promise<RecognitionAnswer> => {
    const seq = base + i;
    const m = MODELS[family];
    const keys = await keyChain(db, secret, m.provider, 1);
    if (!keys.length) return { family, model: m.model, player, question, text: null, error: `no ${m.provider} key` };
    const req = { model: m.model, system: studyPrompts.system(player), messages: [{ role: "user" as const, text: QUESTIONS[question] }], maxOutputTokens: RECOGNITION_MAX_TOKENS, effort: EFFORT };
    let r;
    try {
      r = await callModel(m.provider, keys[0].key, req);
    } catch (e) {
      return { family, model: m.model, player, question, text: null, error: e instanceof Error ? e.message : String(e) };
    }
    // A ledger failure keeps the answer, which was paid for.
    try {
      await ledgerRow(db, "recognition-check", 0, seq, { player, step: `recognition_${question}`, day: 0, provider: m.provider, model: m.model, modelReported: r.modelReported, payer: keys[0].email, fallbackKey: false, ok: true, stop: r.stop, usage: r.usage, error: null, latencyMs: r.latencyMs, requestId: r.requestId, stopDetail: r.stopDetail }, names).run();
      return { family, model: m.model, player, question, text: r.text, error: null };
    } catch (e) {
      return { family, model: m.model, player, question, text: r.text, error: `ledger: ${e instanceof Error ? e.message : String(e)}` };
    }
  }));
  // Each run keeps its own record (recognition_check:<time>), so a rerun never
  // overwrites an earlier one. The first run, of 1 Nov, is under recognition_check.
  const at = new Date().toISOString();
  await db.prepare("INSERT INTO meta (key, value) VALUES (?, ?)")
    .bind(`recognition_check:${at}`, JSON.stringify({ at, families, questions: QUESTIONS, maxOutputTokens: RECOGNITION_MAX_TOKENS, answers })).run();
  return answers;
}
