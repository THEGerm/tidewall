"""Every number the solver uses, in one place.

Numbers come from docs/plan.md, rev 3 (29 Oct 2026). Each block cites its
section. Where the plan leaves something open, the value is marked
ASSUMPTION and the matching item in OPEN_QUESTIONS says what to settle.
"""

from fractions import Fraction as F

# "Each day the game continues with probability 0.98" (The game, in one paragraph;
# How long a run lasts).
CONTINUE = F(49, 50)
END_PER_DAY = 1 - CONTINUE  # 2%
CAP_DAYS = 150

# 1. Inspection game (The games inside the city, 1).
DISTRICTS = 6
CRIME_GAIN = 10        # uninspected crime, to the gang
CRIME_DAMAGE = 15      # uninspected crime, to the city
FINE = 30              # inspected crime, to the gang (burned, not paid to the treasury)
INSPECTION_COST = 4    # per inspection, to the police
ARREST_CAP = 5         # arrests a day
PRISON_PLACES = 40
PLAN_CRIME_RATE = F(4, 15)
PLAN_INSPECTION_RATE = F(10, 40)

# 2. Turf war (The games inside the city, 2). Row player's payoff.
TURF_R = 6   # both respect
TURF_T = 10  # encroach on a gang that respects
TURF_S = 0   # respect a gang that encroaches
TURF_P = 2   # both encroach
PLAN_GRIM_THRESHOLD = F(1, 2)

# 3. Bribery (The games inside the city, 3).
BRIBE_PENALTY = 100    # Chief caught: account seized, Chief jailed
AUDIT_COST = 8         # to the Council, per audit
PLAN_AUDIT_LINE = F(1, 10)
# ASSUMPTION (open question 3): one audit checks one district-day, and a bribe
# that isn't caught costs the Council the crime damage of that district-day.
COUNCIL_LOSS_PER_UNCAUGHT_BRIBE = CRIME_DAMAGE
# ASSUMPTION (open question 3): a caught Chief keeps the bribe and pays the
# penalty, as in the plan's rule "takes it if b > a x 100".

# 4. Information game (The games inside the city, 4): Nature's odds per day.
NATURE = {
    "storm": F(10, 100),  # closes the Port
    "fire": F(5, 100),
    "strike": F(3, 100),
    "ship": F(15, 100),   # ship with cargo
}

# Week 0 (Plan, step 3): "measured rates match the solver within noise".
# The noise bands use a run of this many days (the expected length).
WEEK0_DAYS = 50
BAND = F(95, 100)
# ASSUMPTION (open question 3): one audit decision a day.
AUDITS_PER_DAY = 1

OPEN_QUESTIONS = [
    "Police payoff in the inspection game. The 25% inspection rate needs the police side to count the "
    "city's damage of 15 for each uninspected crime. The Police Chief's payoff row (salary + private "
    "account change - penalty if caught taking bribes) has no crime term. With that payoff, if an "
    "inspection costs the Chief 4, the Chief never inspects and the gangs commit crime in every district "
    "(pure equilibrium: Crime, Don't inspect). Does the Chief's payoff include crime damage (or a share "
    "of the Council's), or does the Council set the inspection rate?",
    "The stated 150-day cap. Players are told about it, so the turf war has a known last possible day. "
    "Backward induction from day 150 then leaves 'always encroach' as the only subgame-perfect "
    "equilibrium, however unlikely day 150 is (4.9%). The 0.5 threshold argument holds only without a "
    "known cap. Options: don't announce the cap, raise it, or keep it and say so in the paper and in "
    "hypothesis 4.",
    "Bribery audit game. The plan gives the audit cost (8) and the penalty (100), but not what one audit "
    "covers (one district-day, or the Chief's whole day), what the Council gains from catching a bribe, "
    "whether a caught Chief keeps the bribe, or whether the seized account goes to the treasury. The "
    "solver assumes one audit checks one district-day, one audit decision a day, an uncaught bribe costs "
    "the Council the 15 crime damage, and a caught Chief keeps the bribe. Under that, the Council is "
    "indifferent about auditing when the Chief takes bribes 8/15 of the time.",
    "Bribe terms. The window 100a < b <= 10 leaves the amount to bargaining. Is a bribe per district per "
    "day, and is it paid before or after the Chief plans inspections?",
    "Districts and gangs. The inspection game has 'a gang' choose in each of 6 districts. Which gang acts "
    "in which district (does turf decide it), and can both gangs commit crime in one district on one "
    "day? The daily totals here assume one gang decision per district.",
    "Prison. At equilibrium about 0.4 arrests a day, so the 40 places fill only if a sentence is longer "
    "than about 100 days. What is the sentence length?",
    "Week-0 turf bots. Which equilibrium do the scripted gangs play in the turf war: always encroach "
    "(the one-day equilibrium) or grim trigger (cooperation)? Both are equilibria at 0.98 without a "
    "known cap, and the week-0 check needs one.",
    "Expected length. The plan says 50 days, which is the length without the cap. With the 150-day cap "
    "it is 47.6 days. Wording only.",
]
