// The 27 study runs (#38): 9 triples, each playing rotations 1, 2 and 3 on one
// seed. The seeds come from drand round 6601923 by the rule in docs/seeds.md;
// the Worker derives them itself, and a test checks them against that table.

import type { Seating } from "./store";

export const DRAND_ROUND = 6601923;
export const DRAND_RANDOMNESS = "c3fb557f04a5bed65d293f38fe29b2cb4740fdfb4770a800bad400f398bcc6e8";
export const TRIPLES = 9;

// Rotation 1: Claude govern, Gemini crime, GPT world, and so on (plan, "The rotation").
export const SEATINGS: Record<1 | 2 | 3, Seating> = {
  1: { Government: "claude", Criminals: "gemini", World: "gpt" },
  2: { Government: "gemini", Criminals: "gpt", World: "claude" },
  3: { Government: "gpt", Criminals: "claude", World: "gemini" },
};

// Seed of triple n: the first 16 hex digits of SHA-256("<randomness>:tidewall-triple-<n>").
export async function studySeed(triple: number): Promise<string> {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${DRAND_RANDOMNESS}:tidewall-triple-${triple}`));
  return Array.from(new Uint8Array(d), (b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
}

export interface StudyRun { id: string; seed: string; triple: number; rotation: 1 | 2 | 3; seating: Seating }

// The 27 runs in playing order: triple 1 rotations 1 to 3, then triple 2, and so on.
// The scheduler plays ready runs in this order (runner.ts, ORDER BY triple, rotation).
export async function studyPlan(): Promise<StudyRun[]> {
  const out: StudyRun[] = [];
  for (let t = 1; t <= TRIPLES; t++) {
    const seed = await studySeed(t);
    for (const r of [1, 2, 3] as const) out.push({ id: `study-t${t}-r${r}`, seed, triple: t, rotation: r, seating: SEATINGS[r] });
  }
  return out;
}
