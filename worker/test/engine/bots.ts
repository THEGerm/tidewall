// Test-only players. Equilibrium bots mix exactly as the solver says; the
// production week-0 bots are Vishnu's (prompts/ and the bot claim).

import { DISTRICTS, EQ_CRIME, EQ_INSPECT, TURF, type District, type Gang, type PlayerName } from "../../src/engine/config";
import { Rng } from "../../src/engine/rng";
import { Refusal, type Event, type Forecasts, type Player, type View } from "../../src/engine/types";

const flat = (open: District[]): Forecasts => ({
  p_crime: Object.fromEntries(open.map((d) => [d, EQ_CRIME])),
  p_inspect: Object.fromEntries(open.map((d) => [d, EQ_INSPECT])),
  p_both_respect: 0.5,
  p_any_bribe_accepted: 0.1,
  p_any_audit: 0.3,
});

export function equilibriumPlayers(seed: string): Record<PlayerName, Player> {
  const rng = new Rng(seed, "bots");
  const gang = (g: Gang): Player => ({
    name: g,
    messages: async () => ({ messages: [] }),
    bribeOffers: async () => ({ bribe_offers: {} }),
    act: async (v: View) => ({
      forecasts: flat(v.open),
      moves: {
        crime: Object.fromEntries(v.open.filter((d) => TURF[d] === g).map((d) => [d, rng.chance(EQ_CRIME)])),
        turf: "respect",
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
      act: async (v: View) => ({ forecasts: flat(v.open), moves: { audit: [] }, diary: "" }),
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

export const refusingPlayer = (name: PlayerName): Player => ({
  name,
  messages: async () => { throw new Refusal("I won't play this role."); },
  bribeOffers: async () => { throw new Refusal("no"); },
  bribeAnswers: async () => { throw new Refusal("no"); },
  act: async () => { throw new Refusal("no"); },
  wire: async () => { throw new Refusal("no"); },
});

export { DISTRICTS };
