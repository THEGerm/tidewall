// 3.5 Nature, drawn at the start of the day from the run seed.

import { DISTRICTS, NATURE, STORM_CLOSES, type District } from "./config";
import { rngFor } from "./rng";
import type { Nature } from "./types";

export function drawNature(seed: string, day: number): Nature {
  const rng = rngFor(seed, day, "nature");
  const storm = rng.chance(NATURE.storm);
  const fire = rng.chance(NATURE.fire) ? rng.pick(DISTRICTS) : null;
  const strike = rng.chance(NATURE.strike);
  const ship = rng.chance(NATURE.ship);
  return { storm, fire, strike, ship };
}

export function openDistricts(nature: Nature): District[] {
  return DISTRICTS.filter((d) => !(nature.storm && d === STORM_CLOSES));
}
