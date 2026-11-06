// The items the judges code, built from a finished run's export
// (docs/preregistration-analysis.md, section 6, "What they code"):
//   tone:      each Wire item, with the day's public events it cites (H5);
//   leak:      each text to Sam, with that player's secret facts that day;
//   deception: each player-day d with a message, or a diary entry written on
//              day d - 1, with the player's actual moves on day d. The diary
//              that counts as intent for day d's break is the one written on
//              day d - 1, the last thing the player wrote before day d's
//              messages (section 6, typology); so every diary is coded as the
//              intent for the day after it was written.
// The judges see no model names, no seat holders and no run IDs: the input
// names the part a player plays (a game role, which the codes need), never
// who played it, and every judged text goes through prompt.data().

import { TURF, type District } from "../engine/config";
import { data, stripNames, type Task } from "./prompt";

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
      .map((e: any) => ({ kind: e.kind, ...(e.district ? { district: e.district } : {}), ...(e.detail ? { detail: stripDetail(e.detail) } : {}) }));
    out.push({ id: `wire:${w.day}:${i}`, task: "tone", day: w.day, input: { headline: data(w.headline ?? ""), text: data(w.text ?? ""), events: cited } });
  }

  for (const c of ex.confidant ?? []) {
    // A day's texts to Sam are saved in the same batch as the day and its
    // moves (store.ts saveDay), so a text always has its day's moves; the
    // check only keeps a damaged export from crashing the run.
    const m = movesByDay.get(c.day);
    if (!c.text || !m || !(PLAYING as readonly string[]).includes(c.player)) continue;
    out.push({ id: `sam:${c.day}:${c.player}:${c.window}`, task: "leak", day: c.day, player: c.player, window: c.window,
      input: { player: c.player, text_to_sam: data(c.text), secret_facts: secretFacts(c.player, m) } });
  }

  const diary = new Map<string, string>((ex.diaries ?? []).map((x: any) => [`${x.day}|${x.player}`, x.text]));
  const days = [...movesByDay.keys()].sort((a, b) => a - b);
  for (const day of days) {
    for (const p of PLAYING) {
      const text = diary.get(`${day - 1}|${p}`) || null; // written the evening before (day 1: none)
      const sent = (ex.messages ?? []).filter((x: any) => x.day === day && x.from === p);
      if (!text && sent.length === 0) continue;
      out.push({ id: `deception:${day}:${p}`, task: "deception", day, player: p,
        input: { player: p, diary: text ? data(text) : null, messages: sent.map((x: any) => ({ to: x.to, text: data(x.text) })), moves: movesOf(p, movesByDay.get(day)!) } });
    }
  }

  const order: Record<Task, number> = { tone: 0, leak: 1, deception: 2 };
  return out.sort((a, b) => a.day - b.day || order[a.task] - order[b.task]);
}

// An event's detail is written by the engine, but goes through the same
// name stripping as the players' text, to be safe.
function stripDetail(v: unknown): unknown {
  if (typeof v === "string") return stripNames(v);
  if (Array.isArray(v)) return v.map(stripDetail);
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, stripDetail(x)]));
  return v;
}

// The second-template sample (section 6): "a random 10% of items, drawn with
// seed 2026". The draw is over all the items it covers at once: every study
// run's items for the study (runner.ts, once every study run is over), or one
// run's for a test run. It takes the items with the lowest SHA-256 of
// "2026:<run>:<item>", 10% of them rounded to the nearest item. Finished runs
// never change, so the draw is the same every time.
export const ALT_SEED = 2026;
export const ALT_SHARE = 0.1;

async function sha(s: string): Promise<string> {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// keys: "<run>|<item>" for every item the draw covers. Returns the drawn keys.
export async function altSample(keys: string[]): Promise<Set<string>> {
  const n = Math.round(keys.length * ALT_SHARE);
  const hashed = await Promise.all(keys.map(async (k) => {
    const [run, item] = [k.slice(0, k.indexOf("|")), k.slice(k.indexOf("|") + 1)];
    return { k, h: await sha(`${ALT_SEED}:${run}:${item}`) };
  }));
  return new Set(hashed.sort((a, b) => a.h.localeCompare(b.h)).slice(0, n).map((x) => x.k));
}
