// The shapes of rules.md sections 4, 5 and 8.

import type { District, Gang, PlayerName } from "./config";

export type Turf = "respect" | "encroach";

export interface Nature {
  storm: boolean;
  fire: District | null;
  strike: boolean;
  ship: boolean;
}

export interface Forecasts {
  p_crime: Partial<Record<District, number>>;
  p_inspect: Partial<Record<District, number>>;
  p_both_respect: number;
  p_any_bribe_accepted: number;
  p_any_audit: number;
}

export interface Message {
  to: PlayerName;
  text: string;
}
export interface MessagesAnswer {
  messages: Message[];
}
export interface ConfideAnswer {
  text: string | null;
}
export type ConfideWindow = "before" | "after";
export interface ConfidantExchange {
  window: ConfideWindow;
  text: string | null;
  reply: string;
}
export interface OffersAnswer {
  bribe_offers: Partial<Record<District, number | null>>;
}
export interface AnswersAnswer {
  bribe_answers: Partial<Record<District, "accept" | "refuse">>;
}
export interface GangAct {
  forecasts?: Forecasts;
  moves: { crime: Partial<Record<District, boolean>>; turf: Turf };
  diary?: string;
  forget?: number[];
}
export interface ChiefAct {
  forecasts?: Forecasts;
  moves: { inspect: District[] };
  diary?: string;
  forget?: number[];
}
export interface CouncilAct {
  forecasts?: Forecasts;
  moves: { audit: District[] };
  diary?: string;
  forget?: number[];
}
export interface WorldAct {
  forecasts?: Forecasts;
}
export type ActAnswer = GangAct | ChiefAct | CouncilAct | WorldAct;

export interface WireItem {
  headline: string;
  text: string;
  events: string[];
}
export interface WireAnswer {
  wire: WireItem[];
  diary?: string;
  forget?: number[];
}
export interface DiaryEntry {
  day: number;
  text: string;
}

export interface Balances {
  treasury: number;
  chief: number;
  Families: number;
  Saltdogs: number;
}
export type Scores = Record<"Council" | "Chief" | Gang, number>;

export interface Event {
  id: string;
  kind:
    | "storm" | "fire" | "strike" | "ship"
    | "crime" | "arrest" | "fine_no_place"
    | "inspection_empty" | "bribe_offer" | "bribe_accepted" | "bribe_refused"
    | "audit_clean" | "audit_caught" | "turf" | "release";
  public: boolean;
  district?: District;
  actor?: PlayerName;
  detail?: Record<string, unknown>;
}

// What happened to each player's answer at each step: used, or a fallback.
export interface StepRecord {
  player: PlayerName;
  step: "messages" | "offers" | "confide_before" | "answers" | "confide_after" | "act" | "wire";
  source: "player" | "retry" | "fallback";
  reason?: "refused" | "invalid" | "error";
  errors?: string[];
}

export interface DayMoves {
  offers: Record<Gang, Partial<Record<District, number>>>;
  accepted: District[];
  crime: Partial<Record<District, boolean>>;
  turf: Record<Gang, Turf>;
  inspect: District[];
  audit: District[];
}

export interface GameState {
  seed: string;
  day: number; // the day about to be played, from 1
  balances: Balances;
  scores: Scores;
  prison: { gang: Gang; releaseDay: number }[];
  previous: DayMoves | null; // yesterday's moves, for fallbacks
  over: boolean;
  truncated: boolean;
  fixedDays?: number; // bot runs of a set length: no end draw, no hidden cap
  botTurf?: "encroach"; // a bot run whose gangs encroach (default: respect)
}

export interface View {
  player: PlayerName;
  day: number;
  nature: Nature;
  open: District[];
  balances: Partial<Balances>;
  publicYesterday: Event[];
  wireYesterday: WireItem[];
  inbox: Message[];
  // Step-specific facts the player is allowed to see.
  ownOffersAccepted?: District[]; // gangs, step 5
  offersToAnswer?: Partial<Record<District, number>>; // Chief, step 4
  acceptedToday?: District[]; // Chief, step 5
  confidantToday?: ConfidantExchange[]; // this player's own texts to Sam today, never anyone else's
  notebook?: DiaryEntry[]; // this player's own diary entries it has kept, oldest first
  score?: number; // this player's own score so far (not for the World)
  retryErrors?: string[]; // set on the one retry: what was wrong last time
}

export interface Player {
  name: PlayerName;
  messages(view: View): Promise<MessagesAnswer>;
  bribeOffers?(view: View): Promise<OffersAnswer>;
  confide?(view: View, window: ConfideWindow): Promise<ConfideAnswer>; // steps 3.2 and 4.2; the reply is the engine's
  bribeAnswers?(view: View): Promise<AnswersAnswer>;
  act(view: View): Promise<ActAnswer>;
  wire?(events: Event[], retryErrors?: string[], view?: View): Promise<WireAnswer>;
}

export class Refusal extends Error {
  constructor(detail: string) {
    super(detail);
    this.name = "Refusal";
  }
}
