// Equilibrium bots: they mix exactly as the solver says (crime 4/15 per own
// open district, inspection 1/4 per open district), offer no bribes and
// refuse any. Options (Germ, 31 Oct): the Council audits each open district
// at the 10% line, at most 2 a day; the gangs respect (the cooperative
// equilibrium of the repeated game) or encroach (the one-shot equilibrium).
// The Council draws after the gangs and the Chief, so turning audits on
// leaves a seed's crimes and inspections as they were. The tests use the
// defaults: no audits, respect. They call no model and cost
// nothing. Used by bot runs (Germ, 31 Oct: "bot" and "10k bots") to check the
// engine against the solver, and by the tests. Vishnu's week-0 bots (#41) may
// replace or extend them.

import { EQ_AUDIT_PER_DISTRICT, EQ_CRIME, EQ_INSPECT, MAX_AUDITS, TURF, type District, type Gang, type PlayerName } from "../engine/config";
import { Rng } from "../engine/rng";
import type { Event, Forecasts, Player, View } from "../engine/types";

const flat = (open: District[]): Forecasts => ({
  p_crime: Object.fromEntries(open.map((d) => [d, EQ_CRIME])),
  p_inspect: Object.fromEntries(open.map((d) => [d, EQ_INSPECT])),
  p_both_respect: 0.5,
  p_any_bribe_accepted: 0.1,
  p_any_audit: 0.3,
});

export interface BotOptions {
  audit?: boolean;
  turf?: "respect" | "encroach";
}

export function equilibriumPlayers(seed: string, o: BotOptions = {}): Record<PlayerName, Player> {
  const rng = new Rng(seed, "bots");
  const gang = (g: Gang): Player => ({
    name: g,
    messages: async () => ({ messages: [] }),
    bribeOffers: async () => ({ bribe_offers: {} }),
    act: async (v: View) => ({
      forecasts: flat(v.open),
      moves: {
        crime: Object.fromEntries(v.open.filter((d) => TURF[d] === g).map((d) => [d, rng.chance(EQ_CRIME)])),
        turf: o.turf ?? "respect",
      },
      diary: "",
    }),
  });
  return {
    Families: gang("Families"),
    Saltdogs: gang("Saltdogs"),
    Chief: {
      name: "Chief",
      messages: async () => ({ messages: [] }),
      bribeAnswers: async (v: View) => ({ bribe_answers: Object.fromEntries(Object.keys(v.offersToAnswer ?? {}).map((d) => [d, "refuse"])) }),
      act: async (v: View) => ({ forecasts: flat(v.open), moves: { inspect: v.open.filter((d) => !(v.acceptedToday ?? []).includes(d) && rng.chance(EQ_INSPECT)) }, diary: "" }),
    },
    Council: {
      name: "Council",
      messages: async () => ({ messages: [] }),
      act: async (v: View) => ({ forecasts: flat(v.open), moves: { audit: o.audit ? v.open.filter(() => rng.chance(EQ_AUDIT_PER_DISTRICT)).slice(0, MAX_AUDITS) : [] }, diary: "" }),
    },
    World: {
      name: "World",
      messages: async () => ({ messages: [] }),
      act: async (v: View) => ({ forecasts: flat(v.open) }),
      wire: async (events: Event[]) => ({
        wire: [events[0], events[events.length - 1]].map((e) => ({ headline: e.kind, text: "Reported.", events: [e.id] })),
      }),
    },
  };
}
