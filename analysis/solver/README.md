# Solver

Solves the 4 games in [plan rev 3](../../docs/plan.md) from their payoff numbers, checks every equilibrium the plan quotes, and writes [`equilibria.json`](equilibria.json) for the engine tests to read. Python 3 standard library only. Arithmetic is exact (fractions), so 4/15 is 4/15.

## Run it

From the repo root:

```bash
python3 -m analysis.solver           # print the report, rewrite equilibria.json
python3 -m analysis.solver --check   # fail if equilibria.json is out of date
python3 -m unittest discover -s analysis/solver/tests -t .
```

Both commands exit 1 if any number the plan quotes doesn't come out of the solver.

## Files

| File | Holds |
|---|---|
| `params.py` | Every number, citing the plan section it comes from. Assumptions are marked, and the open questions live here |
| `bimatrix.py` | Exact Nash equilibria of small two-player games, by support enumeration |
| `games.py` | The 4 games, the end rule and the week-0 noise bands |
| `stats.py` | Exact binomial bands and tails |
| `equilibria.json` | The output. Each fraction is `{"exact": "4/15", "value": 0.266667}` |

## What it finds

| Game | Result | Plan says |
|---|---|---|
| Inspection, one district | crime 4/15, inspect 1/4 | 27%, 25%: matches |
| Inspection, 6 districts a day | 1.6 crimes, 1.5 inspections, 0.4 arrests, damage 18 | |
| Arrest cap of 5 | binds with probability (1/15)^6, about 1 in 11 million | binds only if over-policed: matches |
| Turf war, one day | both encroach | matches |
| Turf war, repeated | grim trigger holds above 1/2; tit-for-tat is a Nash equilibrium above 2/3, never subgame perfect here | 0.5: matches |
| Bribery | skipping inspection is worth 10; corruption pays below an audit rate of 1/10 | 10%: matches |
| Audit game (assumptions) | at the top bribe, Council audits 1/10, Chief takes 8/15 | not in the plan |
| Information | the World has no payoff, so every reporting rule is an equilibrium for it | matches |
| End rule | 50 days without the cap, 47.6 with it; median 35; day 150 reached 4.9% of the time | 50 days, under 5%: matches |

Week 0 ("measured rates match the solver within noise"): over 50 days x 6 districts, at 95%, the crime rate should land in 21.7% to 31.7% and the inspection rate in 20.3% to 30.0%. With one audit decision a day, the audit rate lands in 2% to 18%. The turf bots play pure strategies, so their cooperation has no noise.

## Open questions

Things the plan leaves open, or that don't add up. These are for Germ and Shazz; the solver doesn't change the plan.

1. Police payoff in the inspection game. The 25% inspection rate needs the police side to count the city's damage of 15 for each uninspected crime. The Police Chief's payoff row (salary + private account change - penalty if caught taking bribes) has no crime term. With that payoff, if an inspection costs the Chief 4, the Chief never inspects and the gangs commit crime in every district (pure equilibrium: Crime, Don't inspect). Does the Chief's payoff include crime damage (or a share of the Council's), or does the Council set the inspection rate?
2. The stated 150-day cap. Players are told about it, so the turf war has a known last possible day. Backward induction from day 150 then leaves 'always encroach' as the only subgame-perfect equilibrium, however unlikely day 150 is (4.9%). The 0.5 threshold argument holds only without a known cap. Options: don't announce the cap, raise it, or keep it and say so in the paper and in hypothesis 4.
3. Bribery audit game. The plan gives the audit cost (8) and the penalty (100), but not what one audit covers (one district-day, or the Chief's whole day), what the Council gains from catching a bribe, whether a caught Chief keeps the bribe, or whether the seized account goes to the treasury. The solver assumes one audit checks one district-day, one audit decision a day, an uncaught bribe costs the Council the 15 crime damage, and a caught Chief keeps the bribe. Under that, the Council is indifferent about auditing when the Chief takes bribes 8/15 of the time.
4. Bribe terms. The window 100a < b <= 10 leaves the amount to bargaining. Is a bribe per district per day, and is it paid before or after the Chief plans inspections?
5. Districts and gangs. The inspection game has 'a gang' choose in each of 6 districts. Which gang acts in which district (does turf decide it), and can both gangs commit crime in one district on one day? The daily totals here assume one gang decision per district.
6. Prison. At equilibrium about 0.4 arrests a day, so the 40 places fill only if a sentence is longer than about 100 days. What is the sentence length?
7. Week-0 turf bots. Which equilibrium do the scripted gangs play in the turf war: always encroach (the one-day equilibrium) or grim trigger (cooperation)? Both are equilibria at 0.98 without a known cap, and the week-0 check needs one.
8. Expected length. The plan says 50 days, which is the length without the cap. With the 150-day cap it is 47.6 days. Wording only.
