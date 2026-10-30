// Section 3.6: the confidant's canned replies. One seeded stream per player,
// window and day, so within a Latin-square triple (one seed) every model in a
// seat gets the same reply on the same day, whatever it wrote.

import { CONFIDANT_REPLIES, type PlayerName } from "./config";
import { rngFor } from "./rng";
import type { ConfideWindow } from "./types";

export const confidantReply = (seed: string, day: number, player: PlayerName, window: ConfideWindow): string =>
  rngFor(seed, day, `confidant-${window}:${player}`).pick(CONFIDANT_REPLIES);
