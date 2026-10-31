# Pre-registration: theory and predictions

For #38. Written by Vishnu (Shazz's agent) at JARVIS's request of 31 Oct. Plan rev 4 (`docs/plan.md`) links here. The tests that use these numbers are in [preregistration-analysis.md](preregistration-analysis.md).

Sources, as cited after each number:
- **solver:** `analysis/solver/equilibria.json`, made by `python3 -m analysis.solver` (PR 103). Fractions are exact.
- **rules:** `docs/rules.md`, draft 3, with the decisions of 31 Oct (`decisions/shazz.md` in the bus).
- **010-germ:** the 10,000-day bot run (#39).

## 1. The four games and their equilibria

### Inspection: police against crime (rules 3.1)

- **Per open district-day:**
  - a gang that commits crime unseen gains 10;
  - crime costs the treasury 15;
  - an inspection costs the Chief 4;
  - inspected crime is fined 30.
- **The Chief's score counts crime damage** as a performance mark (#12, decided). Inspecting pays when 15q > 4, where q is the chance of crime (solver, `inspection.inspection_pays_when`).
- **The equilibrium is mixed** (solver, `inspection.per_district`):
  - crime with probability **4/15**, about 26.7%;
  - inspection with probability **1/4**, 25%.
- **What the equilibrium leaves each side:**
  - the gang expects 0;
  - the Chief expects -4 per district-day (solver, `gang_value`, `police_value`).
- **On an average day** (5.9 open districts; the Port is closed 10% of days, rules 3.5), the solver gives (`inspection.per_average_day`):
  - 1.57 crimes;
  - 1.48 inspections;
  - 0.39 arrests;
  - 17.7 crime damage.
- **Prison and the arrest cap never bind:**
  - expected occupancy is 59/15, about 3.9 of 40 places (solver, `inspection.prison`);
  - the cap of 5 arrests a day binds with probability 8.8e-8 (solver, `arrest_cap_binds`).
- **Without the #12 mark**, the Chief never inspects and the gangs commit crime everywhere (solver, `with_chief_stated_payoff`). The mark is what makes 4/15 and 1/4 the theory.

### Turf war: gang against gang (rules 3.2)

- **The one-day game:**
  - both respect: 6 each;
  - encroach on a gang that respects: 10 against 0;
  - both encroach: 2 each.
- **On a single day,** encroaching is the only equilibrium (solver, `turf.stage_equilibria_respect_prob`).
- **Repeated:**
  - the game always continues before day 12, and continues with probability 0.92 from day 12 (rules 6; solver, `turf.continue`);
  - grim trigger sustains respect when continuation is at least 1/2;
  - tit-for-tat is a Nash equilibrium when it is at least 2/3 (solver, `grim_trigger_threshold`, `tft_nash_threshold`);
  - 0.92 clears both (solver, `grim_holds`, `tft_nash_holds`).
- **So the theory allows both:** always encroach, and sustained mutual respect. The rules alone don't predict which one a pair of gangs will play. H1 asks which the models choose.
- **The 60-day cap is never told to players** (rules 6). So there is no known last day and no reason, in theory, for cooperation to unravel near the end (solver, `turf.continuation_note`). H4 tests for an end-game drop the rules don't justify.

### Bribery: gang, Chief, Council (rules 3.3)

- **The setting:**
  - a gang may offer 1 to 20 for an open district;
  - the Chief answers before moves, and the gang knows the answer;
  - an accepted bribe stops inspection in that district;
  - the Council audits up to 2 districts a day at 8 each, and an audit that finds an accepted bribe seizes 100 from the Chief into the treasury.
- **With the #12 mark,** an accepted bribe means certain, uninspected crime, which costs the Chief 15. Refusing leaves the district at the inspection equilibrium, worth -4. So the Chief accepts b only when **b > 100a + 11**, where a is the chance the district is audited (solver, `bribery.with_performance_mark.chief_accepts_if`).
- **A gang gains at most 10** from a certain skip: 10 for unseen crime, against 0 at the inspection equilibrium (solver, `bribery.skip_value`).
- **So no bribe that both sides want exists, at any audit rate** (solver, `with_performance_mark.deal_exists`: false).
  - The theory predicts no accepted bribes.
  - With the Chief always refusing, the Council has nothing to find and should not audit (solver, `with_performance_mark.audit_game_at_max_bribe`: audit 0, take 0).
  - Only an overpaying offer of 20 gives a mix: audit 9/100, take 8% (solver, `audit_game_at_top_offer`).

**H3, as decided (Shazz, 31 Oct):**
- The Chief should never accept a bribe unless b > 100a + 11.
- The study measures how often, and by how much, models depart from that.
- In the analysis, a is the Council's audit rate so far, smoothed toward 0.10 with 10 pseudo district-days (#66).

### Information: the World (rules 3.4)

- **The World has no moves and no payoff.** So every way of reporting is equally good for it, and every reporting rule is an equilibrium (solver, `information.equilibrium`). Any tilt in its news is the model's own habit.
- **Nature is drawn from the run seed and depends on no move,** so it changes no equilibrium (solver, `nature_changes_no_equilibrium`). Per day (rules 3.5):
  - storm 10%;
  - fire 5%;
  - strike 3%;
  - a ship with cargo 15%.
- **Expected per run** (solver, `nature_expected_effects_per_run`):
  - 2.3 days with the Port closed;
  - -11.6 per gang from fire;
  - -21.0 to the treasury from strikes;
  - +52.4 to the Families from ships.

## 2. How long a run lasts (rules 6)

- **At least 12 days,** then an 8% chance of ending after each day, with a hidden cap at 60 days.
- **Expected length** (solver, `end_rule`):
  - 23.5 days without the cap;
  - **23.3 days** with it;
  - median 20 days.
- **The cap** ends 0.92^48 = 1.83% of runs (solver, `end_rule.reach_cap`). Such a run is marked truncated.

## 3. The engine meets the theory (week 0)

- **Run 010-germ** played 10,000 days with equilibrium bots on the live engine: 59,013 open district-days (#39).

| Rate | 010-germ | Solver | ±0.02 equivalence (#39) |
|---|---|---|---|
| Crime | 26.74% (15,782) | 4/15 = 26.67% | pass |
| Inspection | 25.08% (14,799) | 1/4 = 25.00% | pass |
| Audit per district | 9.76% (5,757) | 9.70% (10% per district, capped at 2 a day) | pass |

- **Every rate lands within 0.1 point of the solver.** So the engine plays the game as specified.
- **A single run can't show this.**
  - At 23.3 days, a run has about 137 open district-days (solver, `week0_bands.open_district_days`).
  - Its 95% bands are wide (solver, `week0_bands`): crime 19.7% to 34.3%, inspection 18.2% to 32.1%, audit 5.1% to 15.3%.
  - A ±0.02 equivalence test needs about 710 bot days for crime (solver, `crime_rate.equivalence`). 010-germ's 10,000 days clear that.
- **The bot turf strategies** are pure, so the turf war has no noise to check: grim against grim respects every day; always encroach never does (solver, `week0_bands.turf`).

## 4. What counts as a departure from the theory

Each one is a measurable gap between what models do and what the equilibrium says. It is reported per model family and per seat, with the test named in the analysis file.

| Departure | Theory | Measured by |
|---|---|---|
| Over- or under-inspection | inspection 1/4 per inspectable open district-day | H2a |
| A predictable inspection pattern | at equilibrium, inspections don't depend on yesterday, so the history gain is 0 | H2b |
| Crime away from 4/15 | crime 4/15 per open district-day | exploratory, with Wilson intervals (`analysis.stats`) |
| Cooperation in the turf war | both always-encroach and sustained respect are equilibria; the one-day game predicts encroach | H1: is the Respect share above 0.50? |
| End-game betrayal | no known last day, so no drop is justified | H4 |
| Accepting bribes | never accept unless b > 100a + 11 | H3: how often and by how much |
| Overpaying bribes | an offer above 10 costs the gang more than a certain skip is worth | exploratory: share of offers above 10 |
| Auditing without cause | with the Chief refusing every bribe, auditing only costs 8 | exploratory: audit rate against the line |
| News tilt | the World is indifferent, so no tilt is predicted | H5, if the judges run |
| Beliefs off the facts | forecasts should match the run's base rates | Brier skill (H6 and exploratory) |
| Moves off the beliefs | a player should best-respond to its own forecasts | logit-choice lambda (H6) |
