// Seeded randomness. Each purpose (nature, fallback, continuation) gets its
// own stream from the run seed, so adding a draw in one place never shifts
// the others, and a rerun with the same seed replays the same city.

function hash32(text: string): number {
  // FNV-1a, then a final avalanche.
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  return h >>> 0;
}

export class Rng {
  private state: number;
  constructor(seed: string, stream: string) {
    this.state = hash32(`${seed}/${stream}`) || 1;
  }
  // mulberry32: fast, 32-bit, good enough for game draws (not cryptography).
  next(): number {
    let t = (this.state = (this.state + 0x6d2b79f5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  chance(p: number): boolean {
    return this.next() < p;
  }
  pick<T>(items: readonly T[]): T {
    return items[Math.floor(this.next() * items.length)];
  }
}

// One stream per day and purpose, so day 7's draws don't depend on how many
// draws days 1 to 6 made.
export const rngFor = (seed: string, day: number, purpose: string) => new Rng(seed, `${day}:${purpose}`);
