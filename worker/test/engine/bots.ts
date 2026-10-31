// Test-only players. The equilibrium bots live in src/players/bots.ts, where
// bot runs use them too.

import { DISTRICTS, type PlayerName } from "../../src/engine/config";
import { Refusal, type Player } from "../../src/engine/types";
export { equilibriumPlayers } from "../../src/players/bots";

export const refusingPlayer = (name: PlayerName): Player => ({
  name,
  messages: async () => { throw new Refusal("I won't play this role."); },
  bribeOffers: async () => { throw new Refusal("no"); },
  bribeAnswers: async () => { throw new Refusal("no"); },
  act: async () => { throw new Refusal("no"); },
  wire: async () => { throw new Refusal("no"); },
});

export { DISTRICTS };
