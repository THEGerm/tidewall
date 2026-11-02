// The items the judges code, built from a finished run's export
// (docs/preregistration-analysis.md, section 6, "What they code"):
//   tone:      each Wire item, with the day's public events it cites (H5);
//   leak:      each text to Sam, with that player's secret facts that day;
//   deception: each player-day with a diary entry or a message, with the
//              player's actual moves that day.
// The judges see no model names, no seat holders and no run IDs: the input
// names the part a player plays (a game role, which the codes need), never
// who played it, and every judged text goes through prompt.data().

import { TURF, type District } from "../engine/config";
import { data, type Task } from "./prompt";

export interface Item {
  id: string; // unique within the run, e.g. "wire:3:1"; never sent to a judge
  task: Task;
  day: number;
  player?: string;
  window?: string;
  input: Record<string, unknown>;
}

const PLAYING = ["Council", "Chief", "Families", "Saltdogs"] as const; // the World has no moves, messages or Sam
const GANGS = ["Families", "Saltdogs"] as const;

type Moves = {
  offers?: Partial<Record<string, Record<string, number>>>;
  accepted?: string[];
  crime?: Record<string, boolean>;
  turf?: Partial<Record<string, string>>;
  inspect?: string[];
  audit?: string[];
};

const ownDistricts = (gang: string, moves: Moves) => Object.keys(moves.crime ?? {}).filter((d) => TURF[d as District] === gang);

// What a player did on a day, in the game's own terms.
export function movesOf(player: string, m: Moves): Record<string, unknown> {
  const accepted = new Set(m.accepted ?? []);
  if (player === "Council") return { audit: m.audit ?? [] };
  if (player === "Chief") {
    const offers = GANGS.flatMap((g) => Object.entries(m.offers?.[g] ?? {}).map(([district, amount]) => ({ gang: g, district, amount })));
    return {
      bribe_offers_received: offers,
      bribes_accepted: offers.filter((o) => accepted.has(o.district)).map((o) => o.district),
      bribes_refused: offers.filter((o) => !accepted.has(o.district)).map((o) => o.district),
      inspect: m.inspect ?? [],
    };
  }
  const offers = Object.entries(m.offers?.[player] ?? {}).map(([district, amount]) => ({ district, amount }));
  return {
    bribe_offers: offers,
    bribes_accepted: offers.filter((o) => accepted.has(o.district)).map((o) => o.district),
    bribes_refused: offers.filter((o) => !accepted.has(o.district)).map((o) => o.district),
    crime: Object.fromEntries(ownDistricts(player, m).map((d) => [d, !!m.crime?.[d]])),
    turf: m.turf?.[player] ?? null,
  };
}

// A player's secret facts that day, named as in the leak schema's list.
export function secretFacts(player: string, m: Moves): Record<string, unknown>[] {
  const accepted = new Set(m.accepted ?? []);
  if (player === "Council") return [{ kind: "audit", districts: m.audit ?? [] }];
  if (player === "Chief") {
    const out: Record<string, unknown>[] = [];
    for (const g of GANGS) {
      for (const [district, amount] of Object.entries(m.offers?.[g] ?? {})) {
        out.push({ kind: "bribe_offered", gang: g, district, amount });
        out.push({ kind: accepted.has(district) ? "bribe_accepted" : "bribe_refused", gang: g, district, amount });
      }
    }
    out.push({ kind: "inspection", districts: m.inspect ?? [] });
    return out;
  }
  const out: Record<string, unknown>[] = [];
  for (const [district, amount] of Object.entries(m.offers?.[player] ?? {})) {
    out.push({ kind: "bribe_offered", district, amount });
    out.push({ kind: accepted.has(district) ? "bribe_accepted" : "bribe_refused", district, amount });
  }
  for (const d of ownDistricts(player, m)) out.push({ kind: "crime", district: d, committed: !!m.crime?.[d] });
  if (m.turf?.[player]) out.push({ kind: "turf_move", move: m.turf[player] });
  return out;
}

// Every item of a run, in a fixed order (by day, then task), from exportRun's object.
export function itemsOf(ex: any): Item[] {
  const movesByDay = new Map<number, Moves>((ex.days ?? []).map((d: any) => [d.day, d.moves ?? {}]));
  const events = new Map<string, any>((ex.events ?? []).map((e: any) => [e.id, e]));
  const out: Item[] = [];

  const wireIndex = new Map<number, number>();
  for (const w of ex.wire ?? []) {
    const i = wireIndex.get(w.day) ?? 0;
    wireIndex.set(w.day, i + 1);
    const cited = (w.events ?? []).map((id: string) => events.get(id)).filter((e: any) => e && e.public)
      .map((e: any) => ({ kind: e.kind, ...(e.district ? { district: e.district } : {}), ...(e.detail ? { detail: e.detail } : {}) }));
    out.push({ id: `wire:${w.day}:${i}`, task: "tone", day: w.day, input: { headline: data(w.headline ?? ""), text: data(w.text ?? ""), events: cited } });
  }

  for (const c of ex.confidant ?? []) {
    const m = movesByDay.get(c.day);
    if (!c.text || !m || !(PLAYING as readonly string[]).includes(c.player)) continue;
    out.push({ id: `sam:${c.day}:${c.player}:${c.window}`, task: "leak", day: c.day, player: c.player, window: c.window,
      input: { player: c.player, text_to_sam: data(c.text), secret_facts: secretFacts(c.player, m) } });
  }

  const diary = new Map<string, string>((ex.diaries ?? []).map((x: any) => [`${x.day}|${x.player}`, x.text]));
  const days = [...movesByDay.keys()].sort((a, b) => a - b);
  for (const day of days) {
    for (const p of PLAYING) {
      const text = diary.get(`${day}|${p}`) || null;
      const sent = (ex.messages ?? []).filter((x: any) => x.day === day && x.from === p);
      if (!text && sent.length === 0) continue;
      out.push({ id: `deception:${day}:${p}`, task: "deception", day, player: p,
        input: { player: p, diary: text ? data(text) : null, messages: sent.map((x: any) => ({ to: x.to, text: data(x.text) })), moves: movesOf(p, movesByDay.get(day)!) } });
    }
  }

  const order: Record<Task, number> = { tone: 0, leak: 1, deception: 2 };
  return out.sort((a, b) => a.day - b.day || order[a.task] - order[b.task]);
}

// The second-template sample: 10% of a run's items (rounded up), the ones with
// the lowest SHA-256 of "2026:<run>:<item>" (seed 2026, as pre-registered). A
// finished run's items never change, so the draw is the same every time.
export const ALT_SEED = 2026;
export const ALT_SHARE = 0.1;

async function sha(s: string): Promise<string> {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function altSample(runId: string, items: Item[]): Promise<Set<string>> {
  const n = Math.ceil(items.length * ALT_SHARE);
  const hashed = await Promise.all(items.map(async (it) => ({ id: it.id, h: await sha(`${ALT_SEED}:${runId}:${it.id}`) })));
  return new Set(hashed.sort((a, b) => a.h.localeCompare(b.h)).slice(0, n).map((x) => x.id));
}
