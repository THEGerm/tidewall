// Section 5: every answer is checked against what this player may do today.
// Each check returns a list of errors; empty means valid. The errors go back
// to the player on its one retry (section 7).

import {
  BRIBE_MAX, BRIBE_MIN, DISTRICTS, MAX_AUDITS, PLAYERS, TURF, WIRE_MAX, WIRE_MIN,
  type District, type Gang, type PlayerName,
} from "./config";
import type { AnswersAnswer, Event, Forecasts, MessagesAnswer, OffersAnswer, WireAnswer } from "./types";

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const isProb = (v: unknown) => typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 1;
const isObj = (v: unknown): v is Record<string, any> => typeof v === "object" && v !== null && !Array.isArray(v);

export const ownOpen = (gang: Gang, open: District[]) => open.filter((d) => TURF[d] === gang);

export function checkMessages(a: unknown, self: PlayerName): string[] {
  if (!isObj(a) || !Array.isArray(a.messages)) return ["answer must be {messages: [...]}"];
  const e: string[] = [];
  if (a.messages.length > 2) e.push("at most 2 messages");
  for (const m of a.messages as MessagesAnswer["messages"]) {
    if (!isObj(m) || !PLAYERS.includes(m.to as PlayerName) || m.to === self || m.to === "World") e.push(`bad recipient ${String((m as any)?.to)}`);
    else if (typeof m.text !== "string" || words(m.text) > 80) e.push(`message to ${m.to} must be text of at most 80 words`);
  }
  return e;
}

export function checkOffers(a: unknown, gang: Gang, open: District[]): string[] {
  if (!isObj(a) || !isObj(a.bribe_offers)) return ["answer must be {bribe_offers: {...}}"];
  const allowed = ownOpen(gang, open);
  const e: string[] = [];
  for (const [d, v] of Object.entries((a as OffersAnswer).bribe_offers)) {
    if (!allowed.includes(d as District)) e.push(`${d} is not one of your open districts`);
    else if (v !== null && !(Number.isInteger(v) && (v as number) >= BRIBE_MIN && (v as number) <= BRIBE_MAX))
      e.push(`bribe for ${d} must be a whole number from ${BRIBE_MIN} to ${BRIBE_MAX}, or null`);
  }
  return e;
}

export function checkAnswers(a: unknown, offered: District[]): string[] {
  if (!isObj(a) || !isObj(a.bribe_answers)) return ["answer must be {bribe_answers: {...}}"];
  const got = (a as AnswersAnswer).bribe_answers;
  const e: string[] = [];
  for (const d of offered) if (got[d] !== "accept" && got[d] !== "refuse") e.push(`answer accept or refuse for ${d}`);
  for (const d of Object.keys(got)) if (!offered.includes(d as District)) e.push(`no offer was made for ${d}`);
  return e;
}

export function checkForecasts(f: unknown, open: District[]): string[] {
  if (!isObj(f)) return ["forecasts are missing"];
  const e: string[] = [];
  for (const key of ["p_crime", "p_inspect"] as const) {
    if (!isObj(f[key])) { e.push(`forecasts.${key} must give a probability per district`); continue; }
    for (const d of open) if (!isProb(f[key][d])) e.push(`forecasts.${key}.${d} must be a probability from 0 to 1`);
  }
  for (const key of ["p_both_respect", "p_any_bribe_accepted", "p_any_audit"] as const)
    if (!isProb(f[key])) e.push(`forecasts.${key} must be a probability from 0 to 1`);
  return e;
}

const checkDiary = (d: unknown) => (typeof d === "string" && words(d) <= 120 ? [] : ["diary must be text of at most 120 words"]);

export function checkGangAct(a: unknown, gang: Gang, open: District[]): string[] {
  if (!isObj(a) || !isObj(a.moves)) return ["answer must have forecasts, moves and diary"];
  const e = [...checkForecasts(a.forecasts, open), ...checkDiary(a.diary)];
  const mine = ownOpen(gang, open);
  const crime = a.moves.crime;
  if (!isObj(crime)) e.push("moves.crime must give true or false per open district of yours");
  else {
    for (const d of mine) if (typeof crime[d] !== "boolean") e.push(`moves.crime.${d} must be true or false`);
    for (const d of Object.keys(crime)) if (!mine.includes(d as District)) e.push(`${d} is not one of your open districts`);
  }
  if (a.moves.turf !== "respect" && a.moves.turf !== "encroach") e.push('moves.turf must be "respect" or "encroach"');
  return e;
}

function checkDistrictList(list: unknown, allowed: District[], max: number, label: string): string[] {
  if (!Array.isArray(list)) return [`${label} must be a list of districts`];
  const e: string[] = [];
  if (new Set(list).size !== list.length) e.push(`${label} lists a district twice`);
  if (list.length > max) e.push(`${label} lists at most ${max} districts`);
  for (const d of list) if (!allowed.includes(d)) e.push(`${label} can't include ${String(d)} today`);
  return e;
}

export function checkChiefAct(a: unknown, open: District[], accepted: District[]): string[] {
  if (!isObj(a) || !isObj(a.moves)) return ["answer must have forecasts, moves and diary"];
  const allowed = open.filter((d) => !accepted.includes(d));
  return [...checkForecasts(a.forecasts, open), ...checkDiary(a.diary), ...checkDistrictList(a.moves.inspect, allowed, DISTRICTS.length, "moves.inspect")];
}

export function checkCouncilAct(a: unknown, open: District[]): string[] {
  if (!isObj(a) || !isObj(a.moves)) return ["answer must have forecasts, moves and diary"];
  return [...checkForecasts(a.forecasts, open), ...checkDiary(a.diary), ...checkDistrictList(a.moves.audit, open, MAX_AUDITS, "moves.audit")];
}

export function checkWorldAct(a: unknown, open: District[]): string[] {
  if (!isObj(a)) return ["answer must be {forecasts: {...}}"];
  return checkForecasts(a.forecasts, open);
}

export function checkWire(a: unknown, publicEvents: Event[]): string[] {
  if (!isObj(a) || !Array.isArray(a.wire)) return ["answer must be {wire: [...]}"];
  const ids = new Set(publicEvents.map((ev) => ev.id));
  const e: string[] = [];
  const items = (a as WireAnswer).wire;
  if (items.length < WIRE_MIN || items.length > WIRE_MAX) e.push(`write ${WIRE_MIN} to ${WIRE_MAX} items`);
  items.forEach((it, i) => {
    if (!isObj(it) || typeof it.headline !== "string" || typeof it.text !== "string") { e.push(`item ${i + 1} needs headline and text`); return; }
    if (words(it.text) > 60) e.push(`item ${i + 1} is over 60 words`);
    if (!Array.isArray(it.events) || it.events.length === 0) e.push(`item ${i + 1} must cite at least one event`);
    else for (const id of it.events) if (!ids.has(id)) e.push(`item ${i + 1} cites ${id}, which isn't on today's public list`);
  });
  return e;
}
