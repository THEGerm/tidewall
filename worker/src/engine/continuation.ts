// Section 6: after each day, does the game go on?

import { END_CHANCE, HIDDEN_CAP, MIN_DAYS } from "./config";
import { rngFor } from "./rng";

export function afterDay(seed: string, day: number, fixedDays?: number): { over: boolean; truncated: boolean } {
  // A run of a set length (the 10,000-day bot run) ends on that day and no other.
  if (fixedDays) return { over: day >= fixedDays, truncated: false };
  if (day >= HIDDEN_CAP) return { over: true, truncated: true };
  if (day < MIN_DAYS) return { over: false, truncated: false };
  return { over: rngFor(seed, day, "continue").chance(END_CHANCE), truncated: false };
}
