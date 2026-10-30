// Section 7: a legal move for a player whose answer failed. Yesterday's move
// where it still applies; otherwise a seeded equilibrium draw.

import { EQ_AUDIT_PER_DISTRICT, EQ_CRIME, EQ_INSPECT, EQ_RESPECT, MAX_AUDITS, type District, type Gang } from "./config";
import { rngFor } from "./rng";
import type { DayMoves, Turf } from "./types";
import { ownOpen } from "./validate";

export function fallbackCrime(seed: string, day: number, gang: Gang, open: District[], prev: DayMoves | null) {
  const rng = rngFor(seed, day, `fallback:crime:${gang}`);
  const out: Partial<Record<District, boolean>> = {};
  for (const d of ownOpen(gang, open)) out[d] = prev && d in prev.crime ? !!prev.crime[d] : rng.chance(EQ_CRIME);
  return out;
}

export function fallbackTurf(seed: string, day: number, gang: Gang, prev: DayMoves | null): Turf {
  if (prev) return prev.turf[gang];
  return rngFor(seed, day, `fallback:turf:${gang}`).chance(EQ_RESPECT) ? "respect" : "encroach";
}

export function fallbackInspect(seed: string, day: number, open: District[], accepted: District[], prev: DayMoves | null): District[] {
  const rng = rngFor(seed, day, "fallback:inspect");
  const allowed = open.filter((d) => !accepted.includes(d));
  // The Chief had a choice in a district yesterday if it was open (it has a
  // crime entry) and not bribed.
  const hadChoice = (d: District) => prev !== null && d in prev.crime && !prev.accepted.includes(d);
  return allowed.filter((d) => (hadChoice(d) ? prev!.inspect.includes(d) : rng.chance(EQ_INSPECT)));
}

export function fallbackAudit(seed: string, day: number, open: District[], prev: DayMoves | null): District[] {
  if (prev) return prev.audit.filter((d) => open.includes(d)).slice(0, MAX_AUDITS);
  const rng = rngFor(seed, day, "fallback:audit");
  return open.filter(() => rng.chance(EQ_AUDIT_PER_DISTRICT)).slice(0, MAX_AUDITS);
}
