// Section 6: after each day, does the game go on?

import { END_CHANCE, HIDDEN_CAP, MIN_DAYS } from "./config";
import { rngFor } from "./rng";

export function afterDay(seed: string, day: number): { over: boolean; truncated: boolean } {
  if (day >= HIDDEN_CAP) return { over: true, truncated: true };
  if (day < MIN_DAYS) return { over: false, truncated: false };
  return { over: rngFor(seed, day, "continue").chance(END_CHANCE), truncated: false };
}
