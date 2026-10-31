// Section 2: one day, step by step. Asks each player through the Player
// interface, checks every answer, gives one retry with the errors, and falls
// back to a legal move when a player refuses or fails twice (section 7).

import { CONFIDANTS, GANGS, PLAYERS, TURF, type District, type Gang, type PlayerName } from "./config";
import { confidantReply } from "./confidant";
import { afterDay } from "./continuation";
import { fallbackAudit, fallbackCrime, fallbackInspect, fallbackTurf } from "./fallback";
import { drawNature, openDistricts } from "./nature";
import { resolveDay } from "./resolve";
import {
  Refusal,
  type ActAnswer, type AnswersAnswer, type ChiefAct, type ConfidantExchange, type ConfideAnswer, type ConfideWindow, type DiaryEntry, type CouncilAct, type DayMoves, type Event, type Forecasts,
  type GameState, type GangAct, type Message, type MessagesAnswer, type OffersAnswer, type Player,
  type Scores, type StepRecord, type View, type WireAnswer, type WireItem,
} from "./types";
import {
  checkAnswers, checkChiefAct, checkConfide, checkCouncilAct, checkGangAct, checkMessages, checkOffers, checkWire, checkWorldAct, ownOpen,
} from "./validate";

export interface DayInput {
  state: GameState;
  players: Record<PlayerName, Player>;
  publicYesterday: Event[];
  privateYesterday?: Partial<Record<PlayerName, Event[]>>;
  wireYesterday: WireItem[];
  notebooks?: Partial<Record<PlayerName, DiaryEntry[]>>; // each player's kept diary entries, from earlier days
}

export interface DayResult {
  state: GameState; // the next day's state (day + 1, or over)
  day: number;
  nature: ReturnType<typeof drawNature>;
  open: District[];
  moves: DayMoves;
  events: Event[];
  publicEvents: Event[];
  wire: WireItem[];
  messages: (Message & { from: PlayerName })[];
  forecasts: Partial<Record<PlayerName, Forecasts>>;
  diaries: Partial<Record<PlayerName, string>>;
  forgotten: Partial<Record<PlayerName, number[]>>; // diary days each player deleted today
  delta: Scores;
  welfare: number;
  records: StepRecord[];
  confidant: { player: PlayerName; window: ConfideWindow; text: string | null; reply: string }[];
}

type Step = StepRecord["step"];

async function ask<T>(
  records: StepRecord[],
  player: PlayerName,
  step: Step,
  call: (retryErrors?: string[]) => Promise<unknown>,
  check: (answer: unknown) => string[],
  salvage?: (answer: unknown) => unknown,
): Promise<T | null> {
  let errors: string[] = [];
  let last: unknown;
  let firstErrors: string[] = [];
  for (const attempt of [1, 2] as const) {
    let answer: unknown;
    try {
      answer = await call(attempt === 2 ? errors : undefined);
    } catch (err) {
      records.push({ player, step, source: "fallback", reason: err instanceof Refusal ? "refused" : "error", errors: [String((err as Error)?.message ?? err)] });
      return null;
    }
    last = answer;
    errors = check(answer);
    if (attempt === 1) firstErrors = errors;
    if (errors.length === 0) {
      // A retry keeps what was wrong with the first answer (004-germ: the
      // reasons were lost).
      records.push(attempt === 1 ? { player, step, source: "player" } : { player, step, source: "retry", errors: firstErrors });
      return answer as T;
    }
  }
  // Moves that are fine but come with a diary that is still too long (or a
  // bad "forget") are kept, without the diary entry (#109).
  const kept = salvage?.(last);
  if (kept !== undefined && check(kept).length === 0) {
    records.push({ player, step, source: "retry", reason: "diary_dropped", errors });
    return kept as T;
  }
  records.push({ player, step, source: "fallback", reason: "invalid", errors });
  return null;
}

// The same answer with its diary entry emptied and no deletions.
const dropDiary = (a: unknown) => (a && typeof a === "object" ? { ...(a as object), diary: "", forget: [] } : undefined);

export async function playDay({ state, players, publicYesterday, wireYesterday, notebooks = {}, privateYesterday = {} }: DayInput): Promise<DayResult> {
  const { seed, day } = state;
  const nature = drawNature(seed, day);
  const open = openDistricts(nature);
  const records: StepRecord[] = [];
  const base = (player: PlayerName): View => ({
    player, day, nature, open,
    balances: player === "Council" ? { treasury: state.balances.treasury }
      : player === "Chief" ? { chief: state.balances.chief }
      : player === "World" ? {}
      : { [player]: state.balances[player as Gang] },
    publicYesterday, wireYesterday, inbox: [],
    ...(privateYesterday[player]?.length ? { privateYesterday: privateYesterday[player] } : {}),
    // Memory: the player's own kept diary, and its own score so far.
    notebook: notebooks[player] ?? [],
    ...(player === "World" ? {} : { score: state.scores[player as keyof GameState["scores"]] }),
  });
  const kept = (p: PlayerName) => (notebooks[p] ?? []).map((e) => e.day);

  // Step 2: messages
  const sent: (Message & { from: PlayerName })[] = [];
  await Promise.all(PLAYERS.filter((p) => p !== "World").map(async (p) => {
    const a = await ask<MessagesAnswer>(records, p, "messages", (errs) => players[p].messages({ ...base(p), retryErrors: errs } as View), (x) => checkMessages(x, p));
    for (const m of a?.messages ?? []) sent.push({ ...m, from: p });
  }));
  const inbox = (p: PlayerName) => sent.filter((m) => m.to === p);

  // Step 3: bribe offers
  const offers = { Families: {}, Saltdogs: {} } as Record<Gang, Partial<Record<District, number>>>;
  await Promise.all(GANGS.map(async (g) => {
    if (!players[g].bribeOffers || ownOpen(g, open).length === 0) return;
    const a = await ask<OffersAnswer>(records, g, "offers", (errs) => players[g].bribeOffers!({ ...base(g), inbox: inbox(g), retryErrors: errs } as View), (x) => checkOffers(x, g, open));
    for (const [d, v] of Object.entries(a?.bribe_offers ?? {})) if (typeof v === "number") offers[g][d as District] = v;
  }));
  // Steps 3.2 and 4.2: texting the confidant. Each player sees only its own
  // texts and Sam's replies; nothing here reaches another player, the World,
  // the event log or the Wire, and nothing changes the game.
  const sam: Partial<Record<PlayerName, ConfidantExchange[]>> = {};
  const own = (p: PlayerName) => (sam[p] ? { confidantToday: [...sam[p]!] } : {});
  const confide = (window: ConfideWindow, extra: (p: PlayerName) => Partial<View>) =>
    Promise.all(CONFIDANTS.filter((p) => players[p].confide).map(async (p) => {
      const a = await ask<ConfideAnswer>(records, p, `confide_${window}`,
        (errs) => players[p].confide!({ ...base(p), inbox: inbox(p), ...own(p), ...extra(p), retryErrors: errs } as View, window),
        checkConfide);
      (sam[p] ??= []).push({ window, text: a?.text ?? null, reply: confidantReply(seed, day, p, window) }); // fallback: no text
    }));
  await confide("before", () => ({}));

  const allOffers = { ...offers.Families, ...offers.Saltdogs };
  const offered = Object.keys(allOffers) as District[];

  // Step 4: bribe answers (skipped when nothing was offered)
  let accepted: District[] = [];
  if (offered.length && players.Chief.bribeAnswers) {
    const a = await ask<AnswersAnswer>(records, "Chief", "answers",
      (errs) => players.Chief.bribeAnswers!({ ...base("Chief"), inbox: inbox("Chief"), ...own("Chief"), offersToAnswer: allOffers, retryErrors: errs } as View),
      (x) => checkAnswers(x, offered));
    accepted = a ? offered.filter((d) => a.bribe_answers[d] === "accept") : []; // fallback: refuse all
  }

  await confide("after", (p) =>
    p === "Chief" ? { acceptedToday: accepted } : p === "Families" || p === "Saltdogs" ? { ownOffersAccepted: accepted.filter((d) => TURF[d] === p) } : {});

  // Step 5: forecasts, moves, diaries
  const prev = state.previous;
  const forecasts: DayResult["forecasts"] = {};
  const diaries: DayResult["diaries"] = {};
  const forgotten: DayResult["forgotten"] = {};
  const keep = (p: PlayerName, a: ActAnswer | null) => {
    if (a && "forecasts" in a && a.forecasts) forecasts[p] = a.forecasts;
    if (a && "diary" in a && typeof a.diary === "string") diaries[p] = a.diary;
    if (a && "forget" in a && Array.isArray(a.forget) && a.forget.length) forgotten[p] = a.forget as number[];
  };
  const crime: Partial<Record<District, boolean>> = {};
  const turf = {} as DayMoves["turf"];
  let inspect: District[] = [];
  let audit: District[] = [];
  await Promise.all([
    ...GANGS.map(async (g) => {
      const mine = ownOpen(g, open);
      const a = await ask<GangAct>(records, g, "act",
        (errs) => players[g].act({ ...base(g), inbox: inbox(g), ...own(g), ownOffersAccepted: accepted.filter((d) => TURF[d] === g), retryErrors: errs } as View),
        (x) => checkGangAct(x, g, open, kept(g)), dropDiary);
      keep(g, a);
      Object.assign(crime, a ? Object.fromEntries(mine.map((d) => [d, a.moves.crime[d]])) : fallbackCrime(seed, day, g, open, prev));
      turf[g] = a ? a.moves.turf : fallbackTurf(seed, day, g, prev);
    }),
    (async () => {
      const a = await ask<ChiefAct>(records, "Chief", "act",
        (errs) => players.Chief.act({ ...base("Chief"), inbox: inbox("Chief"), ...own("Chief"), acceptedToday: accepted, retryErrors: errs } as View),
        (x) => checkChiefAct(x, open, accepted, kept("Chief")), dropDiary);
      keep("Chief", a);
      inspect = a ? a.moves.inspect : fallbackInspect(seed, day, open, accepted, prev);
    })(),
    (async () => {
      const a = await ask<CouncilAct>(records, "Council", "act",
        (errs) => players.Council.act({ ...base("Council"), inbox: inbox("Council"), ...own("Council"), retryErrors: errs } as View),
        (x) => checkCouncilAct(x, open, kept("Council")), dropDiary);
      keep("Council", a);
      audit = a ? a.moves.audit : fallbackAudit(seed, day, open, prev);
    })(),
    (async () => {
      const a = await ask<ActAnswer>(records, "World", "act",
        (errs) => players.World.act({ ...base("World"), retryErrors: errs } as View),
        (x) => checkWorldAct(x, open));
      keep("World", a);
    })(),
  ]);

  // Step 6: resolution
  const moves: DayMoves = { offers, accepted, crime, turf, inspect, audit };
  const r = resolveDay(state, nature, open, moves);
  const publicEvents = r.events.filter((e) => e.public);

  // Step 7: the Wire, from public events only
  let wire: WireItem[] = [];
  if (players.World.wire) {
    const a = await ask<WireAnswer>(records, "World", "wire", (errs) => players.World.wire!(publicEvents, errs, base("World")), (x) => checkWire(x, publicEvents, kept("World")), dropDiary);
    wire = a?.wire ?? [];
    if (typeof a?.diary === "string") diaries.World = a.diary;
    if (a?.forget?.length) forgotten.World = a.forget;
  }

  // Step 8: does the game go on?
  const end = afterDay(seed, day, state.fixedDays);
  const next: GameState = { ...r.state, day: end.over ? day : day + 1, over: end.over, truncated: end.truncated };

  return { state: next, day, nature, open, moves, events: r.events, publicEvents, wire, messages: sent, forecasts, diaries, forgotten, delta: r.delta, welfare: r.welfare, records,
    confidant: CONFIDANTS.flatMap((p) => (sam[p] ?? []).map((c) => ({ player: p, ...c }))) };
}
