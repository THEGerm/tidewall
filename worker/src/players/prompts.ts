// PLACEHOLDER prompts so the plumbing can be tested end to end. The real
// seat briefings, payoff blocks and step instructions are Vishnu's (prompts/,
// see the work split); they replace these functions without changing the
// player code. Keep the system prompt stable between days so providers can
// cache it.

import type { PlayerName } from "../engine/config";
import type { Event, View } from "../engine/types";

export interface Prompts {
  system(player: PlayerName): string;
  step(step: "messages" | "offers" | "answers" | "act", view: View): string;
  wire(events: Event[]): string;
}

export const placeholderPrompts: Prompts = {
  system: (p) => `PLACEHOLDER. You are ${p} in Tidewall, a closed island city. Rules: docs/rules.md (draft 3). Answer only with JSON that matches the schema.`,
  step: (step, v) => [
    `Day ${v.day}. Step: ${step}.`,
    `Open districts: ${v.open.join(", ")}. Nature: ${JSON.stringify(v.nature)}.`,
    `Your balance: ${JSON.stringify(v.balances)}.`,
    `Yesterday, public: ${JSON.stringify(v.publicYesterday)}.`,
    `Yesterday's Wire: ${JSON.stringify(v.wireYesterday)}.`,
    `Messages to you: ${JSON.stringify(v.inbox)}.`,
    v.offersToAnswer ? `Bribe offers to answer: ${JSON.stringify(v.offersToAnswer)}.` : "",
    v.acceptedToday ? `Bribes you accepted today: ${JSON.stringify(v.acceptedToday)}.` : "",
    v.ownOffersAccepted ? `Your accepted bribes today: ${JSON.stringify(v.ownOffersAccepted)}.` : "",
    "The game lasts at least 12 days. From then on, each day there's an 8% chance it's the last.",
    "Your forecasts are scored after the game. They have no payoff.",
    v.retryErrors ? `Your last answer was rejected: ${v.retryErrors.join("; ")}. Fix these and answer again.` : "",
  ].filter(Boolean).join("\n"),
  wire: (events) => `Today's public events: ${JSON.stringify(events)}. Write 2 to 5 Wire items, each citing event IDs from this list only.`,
};
