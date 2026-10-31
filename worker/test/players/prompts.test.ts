import { describe, expect, it } from "vitest";
import { CHIEF_COUNTS_DAMAGE, END_CHANCE, MIN_DAYS, PLAYERS, type PlayerName } from "../../src/engine/config";
import type { Event, View } from "../../src/engine/types";
import { DEFAULT_OPTIONS, eventLine, makePrompts, studyPrompts as P } from "../../src/players/prompts";

const view = (player: PlayerName, extra: Partial<View> = {}): View => ({
  player,
  day: 3,
  nature: { storm: true, fire: null, strike: false, ship: false },
  open: ["Hightown", "Old Quarter", "Lowtown", "Market", "Seawall"],
  balances: player === "Council" ? { treasury: 990 } : player === "Chief" ? { chief: 12 } : player === "World" ? {} : { [player]: 180 },
  publicYesterday: [{ id: "E7", kind: "crime", public: true, district: "Market", detail: { gang: "Saltdogs", damage: 15 } }],
  wireYesterday: [{ headline: "Market hit", text: "Crime in Market.", events: ["E7"] }],
  inbox: [],
  notebook: [{ day: 1, text: "Quiet day." }],
  score: player === "World" ? undefined : 4,
  ...extra,
});

describe("system prompts", () => {
  it("give every seat the rules, the turf table and its own role", () => {
    for (const p of PLAYERS) {
      const s = P.system(p);
      expect(s).toContain("| You respect | you 6, they 6 | you 0, they 10 |");
      expect(s).toContain("| You encroach | you 10, they 0 | you 2, they 2 |");
      expect(s).toContain(`# Your seat: ${{ Council: "the Council", Chief: "the Police Chief", Families: "the Families", Saltdogs: "the Saltdogs", World: "the World" }[p]}`);
      expect(s).toContain("p_any_audit");
    }
    expect(P.system("Families")).toContain("Your turf is Port, Hightown and Old Quarter.");
    expect(P.system("Saltdogs")).toContain("Your turf is Lowtown, Market and Seawall.");
  });

  it("hold no day facts and never change within a run, so providers can cache them", () => {
    for (const p of PLAYERS) {
      expect(P.system(p)).not.toMatch(/Day \d/);
      expect(P.system(p)).toBe(makePrompts().system(p));
    }
  });

  it("say exactly what rules section 6 lets players know about the length", () => {
    const s = P.system("Council");
    expect(s).toContain(`The game lasts at least ${MIN_DAYS} days. From then on, each day there's an ${Math.round(END_CHANCE * 100)}% chance it's the last.`);
    expect(s).not.toMatch(/stop the game early|organisers/i);
    expect(s).not.toMatch(/at the latest/);
    expect(makePrompts({ announceCap: true }).system("Council")).toMatch(/It ends after day 60 at the latest\./);
  });

  it("give no example numbers for forecasts or bribes, so nothing anchors them", () => {
    for (const p of PLAYERS) {
      const s = P.system(p);
      const forecasts = s.slice(s.indexOf("## Forecasts"), s.indexOf("## Answers"));
      expect(forecasts).not.toMatch(/0\.\d|\d+%/);
      expect(s).not.toMatch(/"p_crime"\s*:/);
    }
  });

  it("avoid textbook names", () => {
    for (const p of PLAYERS) expect(P.system(p)).not.toMatch(/prisoner|dilemma|equilibri|nash|tit.for.tat|game theory/i);
  });

  it("switch the Chief's crime penalty (#12) with the engine's default", () => {
    expect(DEFAULT_OPTIONS.chiefCountsDamage).toBe(CHIEF_COUNTS_DAMAGE);
    expect(P.system("Chief")).toContain("minus 15 for every uninspected crime");
    const off = makePrompts({ chiefCountsDamage: false });
    expect(off.system("Chief")).not.toMatch(/uninspected crime|performance mark|Chief's score also loses/);
    expect(off.system("Chief")).toContain("Your score is the change in your account.");
  });

  it("switch Sam off entirely", () => {
    expect(P.system("Council")).toContain("## Sam");
    const off = makePrompts({ confidant: false });
    for (const p of PLAYERS) expect(off.system(p)).not.toMatch(/Sam/);
  });

  it("keep the World to the events", () => {
    expect(P.system("World")).toContain("no added causes, links between events, motives, quotes, names or suspects");
    expect(P.system("World")).not.toContain("## Sam\n\nThe World");
  });
});

describe("step prompts", () => {
  it("put the diary first, then the day, and the step's instruction last", () => {
    const s = P.step("messages", view("Council", { inbox: [{ to: "Council", text: "Audit Market.", from: "Families" } as any] }));
    const order = ["Your diary, the entries you've kept:\n- Day 1: Quiet day.", "# Day 3", "Nature today: storm (the Port is closed)", "Balance: Treasury 990", "Your score so far: 4", "- E7: crime in Market", "- Market hit: Crime in Market.", "- from Families: Audit Market.", "Step 2, messages"];
    let at = -1;
    for (const part of order) {
      const i = s.indexOf(part);
      expect(i, part).toBeGreaterThan(at);
      at = i;
    }
  });

  it("list only the gang's own open districts for offers", () => {
    const s = P.step("offers", view("Families"));
    expect(s).toContain("For each of your open districts (Hightown and Old Quarter)");
    expect(s).toContain("whole number from 1 to 20, or null");
  });

  it("show the Chief its offers and leave accepted districts out of the inspection list", () => {
    expect(P.step("answers", view("Chief", { offersToAnswer: { Hightown: 6, Lowtown: 3 } }))).toContain("Offers to you today: Hightown 6, Lowtown 3.");
    const act = P.step("act", view("Chief", { acceptedToday: ["Hightown"] }));
    expect(act).toContain("Bribes you accepted today: Hightown.");
    expect(act).toContain("from: Old Quarter, Lowtown, Market and Seawall.");
  });

  it("tell a gang which of its bribes went through, and show its texts with Sam", () => {
    const s = P.step("act", view("Saltdogs", {
      ownOffersAccepted: ["Market"],
      confidantToday: [{ window: "before", text: "Paying off the Chief.", reply: "I hear you." }, { window: "after", text: null, reply: "Okay. I'm listening." }],
    }));
    expect(s).toContain("Your bribes the Chief accepted today: Market.");
    expect(s).toContain("- Before the bribe answers. You: Paying off the Chief. Sam: I hear you.");
    expect(s).toContain("- After the bribe answers. You: (no text) Sam: Okay. I'm listening.");
    expect(s).toContain("(Lowtown, Market and Seawall)");
  });

  it("show a player its own secret results from yesterday, after the public ones", () => {
    const s = P.step("messages", view("Chief", { privateYesterday: [{ id: "S2", kind: "inspection_empty", public: false, district: "Lowtown", actor: "Chief" }] }));
    expect(s).toContain("What only you learned yesterday:\n- S2: your inspection in Lowtown found no crime");
    expect(s.indexOf("What only you learned yesterday")).toBeGreaterThan(s.indexOf("Yesterday's public events"));
    expect(P.step("messages", view("Council", { privateYesterday: [{ id: "S1", kind: "audit_clean", public: false, district: "Market", actor: "Council" }] }))).toContain("- S1: your audit in Market found no bribe");
    expect(P.step("messages", view("Families"))).not.toContain("What only you learned");
  });

  it("keep the after-window text to Sam apart from the moves", () => {
    expect(P.step("confide_after", view("Families"))).toContain("This is only a text to Sam; your moves come in the next step.");
  });

  it("ask the World for forecasts only at step 5", () => {
    const s = P.step("act", view("World"));
    expect(s).toContain("Step 5. Give your forecasts for today.");
    expect(s).not.toMatch(/score so far|Balance:/);
  });

  it("repeat the validation errors on the retry", () => {
    expect(P.step("act", view("Council", { retryErrors: ["audit: at most 2"] }))).toMatch(/Your last answer was rejected: audit: at most 2\. Fix this and answer again\.$/);
  });
});

describe("the Wire prompt", () => {
  const es: Event[] = [
    { id: "E1", kind: "fire", public: true, district: "Lowtown", detail: { loss: 20, gang: "Saltdogs" } },
    { id: "E2", kind: "arrest", public: true, district: "Market", detail: { gang: "Saltdogs", fine: 30 } },
    { id: "E3", kind: "turf", public: true, detail: { Families: "respect", Saltdogs: "encroach" } },
  ];

  it("lists the events by ID and forbids anything added", () => {
    const s = P.wire(es, view("World"));
    expect(s).toContain("- E1: fire in Lowtown; Saltdogs lost 20");
    expect(s).toContain("- E3: turf war; Families respect, Saltdogs encroach");
    expect(s).toContain("no added causes, links between events, motives, quotes, names or suspects");
    expect(s.indexOf("Your diary, the entries you've kept:")).toBe(0);
    expect(s).toContain("# Day 3, evening");
  });

  it("works without a view", () => {
    expect(P.wire([])).toContain("Today's public events:\n- none");
  });
});

describe("event lines", () => {
  it("cover every event kind a player can see, in plain words", () => {
    const kinds: Event[] = [
      { id: "E1", kind: "storm", public: true, district: "Port" },
      { id: "E2", kind: "strike", public: true, detail: { loss: 30 } },
      { id: "E3", kind: "ship", public: true, district: "Port", detail: { gain: 15 } },
      { id: "E4", kind: "crime", public: true, district: "Seawall", detail: { gang: "Saltdogs", damage: 15 } },
      { id: "E5", kind: "fine_no_place", public: true, district: "Port", detail: { gang: "Families", fine: 30 } },
      { id: "E6", kind: "audit_caught", public: true, district: "Market", detail: { seized: 100 } },
      { id: "E7", kind: "release", public: true, detail: { gang: "Families" } },
      { id: "S1", kind: "bribe_offer", public: false, district: "Port", actor: "Families", detail: { amount: 6 } },
      { id: "S2", kind: "bribe_accepted", public: false, district: "Port", actor: "Chief", detail: { amount: 6, gang: "Families" } },
      { id: "S3", kind: "bribe_refused", public: false, district: "Market", actor: "Chief", detail: { amount: 3, gang: "Saltdogs" } },
    ];
    expect(kinds.map(eventLine)).toEqual([
      "E1: storm in Port",
      "E2: strike; the treasury lost 30",
      "E3: ship with cargo in Port; the Families gained 15",
      "E4: crime in Seawall, not inspected; damage 15",
      "E5: arrest in Port; Families fined 30, no prison place free",
      "E6: audit in Market found a bribe the Chief accepted; 100 seized into the treasury",
      "E7: a Families member released from prison",
      "S1: bribe offer in Port, 6 from Families",
      "S2: bribe in Port, 6 from Families, accepted",
      "S3: bribe in Market, 3 from Saltdogs, refused",
    ]);
  });
});

// The rendered prompts, kept in prompts/ so a change shows in review and the
// prompts freeze with the rules. Regenerate with: npx vitest run -u
describe("rendered prompts", () => {
  for (const p of PLAYERS) {
    it(`${p}`, async () => {
      const steps = p === "World" ? (["act"] as const)
        : p === "Chief" ? (["messages", "confide_before", "answers", "confide_after", "act"] as const)
        : p === "Council" ? (["messages", "confide_before", "confide_after", "act"] as const)
        : (["messages", "offers", "confide_before", "confide_after", "act"] as const);
      const v = view(p, p === "Chief" ? { offersToAnswer: { Hightown: 6 }, acceptedToday: ["Hightown"] } : (p === "Families" ? { ownOffersAccepted: ["Hightown"] } : {}));
      const block = (title: string, body: string) => `## ${title}\n\n\`\`\`text\n${body}\n\`\`\``;
      const parts = [`<!-- Generated by worker/test/players/prompts.test.ts from worker/src/players/prompts.ts. Do not edit; in worker/, run: npx vitest run -u -->`, `# Prompts: ${p}`, block("System prompt", P.system(p))];
      for (const s of steps) parts.push(block(`Step "${s}" (example day)`, P.step(s, v)));
      if (p === "World") parts.push(block("The Wire (example evening)", P.wire(view("World").publicYesterday, view("World"))));
      await expect(parts.join("\n\n") + "\n").toMatchFileSnapshot(`../../../prompts/rendered/${p}.md`);
    });
  }
});
