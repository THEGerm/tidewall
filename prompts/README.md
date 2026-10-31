# Prompts

Every prompt a model sees, versioned with the code. A prompt change after cycle 1 breaks the comparison, so the prompts freeze with the rules.

- **Source:** [`worker/src/players/prompts.ts`](../worker/src/players/prompts.ts), written from [docs/rules.md](../docs/rules.md). Each seat gets one system prompt that never changes during a run: the rules, the payoffs, its role and every answer it gives. Each step then adds the day's briefing and that step's instruction.
- **Rendered:** [`rendered/`](rendered/) has one file per seat, holding its system prompt and every step's prompt on an example day. A test writes these files and fails if they're out of date, so any prompt change shows up in review. To regenerate, run `npx vitest run -u` in `worker/`.

## Switches for open decisions

| Switch | Default | Decision |
|---|---|---|
| `chiefCountsDamage` | `CHIEF_COUNTS_DAMAGE` in `engine/config.ts` (true) | #12: the Chief's score counts uninspected crime |
| `announceCap` | false (cap hidden) | #12 and #17: whether players are told the hidden cap |
| `confidant` | true | rules 3.6: the texts to Sam |

The run length comes from `MIN_DAYS` and `END_CHANCE` in `engine/config.ts` (#10, #17), so the engine and the prompts always say the same thing.

## Wording rules

- Use city words, never textbook names: no "prisoner's dilemma", "equilibrium" or "game theory".
- Give no example numbers in the forecast or bribe instructions, so nothing anchors an answer.
- Say nothing that pushes a player toward or away from any move.
- The World may frame events but may not add causes, links, motives, quotes, names or suspects.
