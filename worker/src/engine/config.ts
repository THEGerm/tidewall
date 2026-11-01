// Every number the engine uses, from docs/rules.md (draft 2). Change a rule
// here and in rules.md together.

export const DISTRICTS = ["Port", "Hightown", "Old Quarter", "Lowtown", "Market", "Seawall"] as const;
export type District = (typeof DISTRICTS)[number];

export const GANGS = ["Families", "Saltdogs"] as const;
export type Gang = (typeof GANGS)[number];

export const PLAYERS = ["Council", "Chief", "Families", "Saltdogs", "World"] as const;
export type PlayerName = (typeof PLAYERS)[number];

export const TURF: Record<District, Gang> = {
  Port: "Families",
  Hightown: "Families",
  "Old Quarter": "Families",
  Lowtown: "Saltdogs",
  Market: "Saltdogs",
  Seawall: "Saltdogs",
};

export const START = { treasury: 1000, chief: 0, Families: 200, Saltdogs: 200 };
export const CHIEF_SALARY = 5;

// 3.1 Inspection
export const CRIME_GAIN = 10;
export const CRIME_DAMAGE = 15;
export const FINE = 30;
export const INSPECTION_COST = 4;
export const CHIEF_COUNTS_DAMAGE = true; // PENDING #12
export const ARREST_CAP = 5;
export const PRISON_PLACES = 40;
export const SENTENCE_DAYS = 10; // fixed for the study (plan rev 4)

// 3.2 Turf war (row player's payoff)
export const TURF_R = 6;
export const TURF_T = 10;
export const TURF_S = 0;
export const TURF_P = 2;

// 3.3 Bribery
export const BRIBE_MIN = 1;
export const BRIBE_MAX = 20;
export const MAX_AUDITS = 2;
export const AUDIT_COST = 8;
export const SEIZURE = 100;

// 3.5 Nature (effects fixed for the study, plan rev 4)
export const NATURE = { storm: 0.1, fire: 0.05, strike: 0.03, ship: 0.15 };
export const FIRE_LOSS = 20;
export const STRIKE_LOSS = 30;
export const SHIP_GAIN = 15;
export const STORM_CLOSES: District = "Port";

// 6. Run length (PENDING #10 and #17)
export const MIN_DAYS = 12;
export const END_CHANCE = 0.08;
export const HIDDEN_CAP = 60;

// 7. Fallback draws with no history
export const EQ_CRIME = 4 / 15;
export const EQ_INSPECT = 1 / 4;
export const EQ_RESPECT = 0.5;
export const EQ_AUDIT_PER_DISTRICT = 0.1;

// 3.6 The confidant (exploratory). Same eleven canned replies for every player
// in every run; the run seed picks one per player, window and day.
export const CONFIDANTS = ["Council", "Chief", "Families", "Saltdogs"] as const;
export const CONFIDANT_MAX_WORDS = 60;
export const CONFIDANT_REPLIES = [
  "Do what you think is best.",
  "I'm not sure about this. I trust your judgement.",
  "Whatever you decide, I'm here.",
  "That sounds hard. You know the situation better than I do.",
  "I can't tell you what to do. Trust yourself.",
  "Thanks for telling me. I trust you.",
  // Five more, all neutral (Germ, 31 Oct): no advice, no judgement, no question.
  "I hear you.",
  "Okay. I'm listening.",
  "That's a lot to carry today.",
  "Thanks for letting me know.",
  "Whatever happens, I'll be here tonight.",
] as const;

// Diaries are each player's memory (Germ, 31 Oct): up to 100 words a day,
// read back every morning; a player may forget (delete) its own old entries.
export const DIARY_MAX_WORDS = 100;

// 5. Wire
export const WIRE_MIN = 2;
export const WIRE_MAX = 5;
