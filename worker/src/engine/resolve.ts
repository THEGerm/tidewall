// Section 2, step 6: apply the day's moves and Nature, pay everyone, and log
// what happened. Pure: same state, nature and moves give the same result.

import {
  ARREST_CAP, AUDIT_COST, START, CHIEF_COUNTS_DAMAGE, CHIEF_SALARY, CRIME_DAMAGE, CRIME_GAIN, FINE, FIRE_LOSS,
  GANGS, INSPECTION_COST, PRISON_PLACES, SEIZURE, SENTENCE_DAYS, SHIP_GAIN, STRIKE_LOSS, TURF,
  TURF_P, TURF_R, TURF_S, TURF_T, type District, type Gang,
} from "./config";
import type { Balances, DayMoves, Event, GameState, Nature, Scores } from "./types";

export interface Resolution {
  state: GameState; // balances, scores, prison and previous updated; day and over unchanged
  events: Event[];
  delta: Scores; // today's score per scoring player
  welfare: number; // rules.md / analysis/metrics/welfare.py
}

const turfPay = (me: string, them: string) =>
  me === "respect" ? (them === "respect" ? TURF_R : TURF_S) : them === "respect" ? TURF_T : TURF_P;

export function resolveDay(state: GameState, nature: Nature, open: District[], moves: DayMoves): Resolution {
  const day = state.day;
  const b: Balances = { ...state.balances };
  const performance = { chief: 0 };
  const events: Event[] = [];
  let n = 0;
  const log = (e: Omit<Event, "id">) => events.push({ id: `D${day}-E${++n}`, ...e });
  let prison = state.prison.filter((p) => p.releaseDay > day);
  for (const p of state.prison) if (p.releaseDay <= day) log({ kind: "release", public: true, detail: { gang: p.gang } });

  // Nature
  if (nature.storm) log({ kind: "storm", public: true, district: "Port" });
  if (nature.fire) {
    b[TURF[nature.fire]] -= FIRE_LOSS;
    log({ kind: "fire", public: true, district: nature.fire, detail: { loss: FIRE_LOSS, gang: TURF[nature.fire] } });
  }
  if (nature.strike) {
    b.treasury -= STRIKE_LOSS;
    log({ kind: "strike", public: true, detail: { loss: STRIKE_LOSS } });
  }
  if (nature.ship) {
    b.Families += SHIP_GAIN;
    log({ kind: "ship", public: true, district: "Port", detail: { gain: SHIP_GAIN } });
  }

  // Salary
  b.treasury -= CHIEF_SALARY;
  b.chief += CHIEF_SALARY;

  // Bribes (secret)
  for (const gang of GANGS) {
    for (const [d, amount] of Object.entries(moves.offers[gang]) as [District, number][]) {
      log({ kind: "bribe_offer", public: false, district: d, actor: gang, detail: { amount } });
      if (moves.accepted.includes(d)) {
        b[gang] -= amount;
        b.chief += amount;
        log({ kind: "bribe_accepted", public: false, district: d, actor: "Chief", detail: { amount, gang } });
      } else log({ kind: "bribe_refused", public: false, district: d, actor: "Chief", detail: { amount, gang } });
    }
  }

  // Crime and inspections
  let arrests = 0;
  let uninspected = 0;
  let inspectedCrimes = 0;
  for (const d of open) {
    const gang = TURF[d];
    const crime = !!moves.crime[d];
    const inspected = moves.inspect.includes(d);
    if (inspected) b.chief -= INSPECTION_COST;
    if (crime && inspected) {
      inspectedCrimes++;
      b[gang] -= FINE;
      if (arrests < ARREST_CAP && prison.length < PRISON_PLACES) {
        arrests++;
        prison = [...prison, { gang, releaseDay: day + SENTENCE_DAYS }];
        log({ kind: "arrest", public: true, district: d, detail: { gang, fine: FINE } });
      } else log({ kind: "fine_no_place", public: true, district: d, detail: { gang, fine: FINE } });
    } else if (crime) {
      uninspected++;
      b[gang] += CRIME_GAIN;
      b.treasury -= CRIME_DAMAGE;
      if (CHIEF_COUNTS_DAMAGE) performance.chief -= CRIME_DAMAGE;
      log({ kind: "crime", public: true, district: d, detail: { gang, damage: CRIME_DAMAGE } });
    } else if (inspected) log({ kind: "inspection_empty", public: false, district: d, actor: "Chief" });
  }

  // Turf
  const [f, s] = [moves.turf.Families, moves.turf.Saltdogs];
  b.Families += turfPay(f, s);
  b.Saltdogs += turfPay(s, f);
  log({ kind: "turf", public: true, detail: { Families: f, Saltdogs: s } });

  // Audits
  for (const d of moves.audit) {
    b.treasury -= AUDIT_COST;
    if (moves.accepted.includes(d)) {
      b.chief -= SEIZURE;
      b.treasury += SEIZURE;
      log({ kind: "audit_caught", public: true, district: d, actor: "Council", detail: { seized: SEIZURE } });
    } else log({ kind: "audit_clean", public: false, district: d, actor: "Council" });
  }

  const delta: Scores = {
    Council: b.treasury - state.balances.treasury,
    Chief: b.chief - state.balances.chief + performance.chief,
    Families: b.Families - state.balances.Families,
    Saltdogs: b.Saltdogs - state.balances.Saltdogs,
  };
  const scores: Scores = { ...state.scores };
  for (const k of Object.keys(delta) as (keyof Scores)[]) scores[k] += delta[k];

  const welfare =
    turfPay(f, s) + turfPay(s, f) + (CRIME_GAIN - CRIME_DAMAGE) * uninspected - FINE * inspectedCrimes
    - INSPECTION_COST * moves.inspect.length - AUDIT_COST * moves.audit.length;

  return { state: { ...state, balances: b, scores, prison, previous: moves }, events, delta, welfare };
}

export const newGame = (seed: string, fixedDays?: number, botTurf?: "encroach"): GameState => ({
  seed,
  day: 1,
  balances: { treasury: START.treasury, chief: START.chief, Families: START.Families, Saltdogs: START.Saltdogs },
  scores: { Council: 0, Chief: 0, Families: 0, Saltdogs: 0 },
  prison: [],
  previous: null,
  over: false,
  truncated: false,
  ...(fixedDays ? { fixedDays } : {}),
  ...(botTurf ? { botTurf } : {}),
});

export const gangOf = (d: District): Gang => TURF[d];
