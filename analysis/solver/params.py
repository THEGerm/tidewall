"""Every number the solver uses, in one place.

Numbers come from docs/rules.md, draft 4 (1 Nov 2026). Each block cites its
section. DECIDED marks a value Shazz and Germ settled on 31 Oct 2026
(decisions/shazz.md in the bus); nothing is still waiting on them. The engine's copy is worker/src/engine/config.ts. Where the
rules leave something open, OPEN_QUESTIONS says what to settle.
"""

from fractions import Fraction as F

# 1. The city: 6 districts, each the turf of one gang, which makes the crime
# decision there. A storm closes the Port for the day (3.5).
TURF = {
    "Port": "Families",
    "Hightown": "Families",
    "Old Quarter": "Families",
    "Lowtown": "Saltdogs",
    "Market": "Saltdogs",
    "Seawall": "Saltdogs",
}
DISTRICTS = len(TURF)
STORM_CLOSES = "Port"

# 3.1 Inspection, per district-day.
CRIME_GAIN = 10        # uninspected crime, to the gang
CRIME_DAMAGE = 15      # uninspected crime, to the treasury
FINE = 30              # inspected crime, to the gang (burned)
INSPECTION_COST = 4    # per inspection, from the Chief's account
# DECIDED #12 (31 Oct): the Chief's score also loses the crime damage as a
# performance mark, as CHIEF_COUNTS_DAMAGE in worker/src/engine/config.ts.
# Without it the Chief never inspects and the gangs commit crime everywhere,
# so 4/15 and 1/4 need it. False gives the Chief's stated payoff only (money).
CHIEF_COUNTS_DAMAGE = True
ARREST_CAP = 5         # arrests a day
PRISON_PLACES = 40
SENTENCE_DAYS = 10     # DECIDED (31 Oct): fixed for the study
RULES_CRIME_RATE = F(4, 15)
RULES_INSPECTION_RATE = F(1, 4)

# 3.2 Turf war. Row player's payoff.
TURF_R = 6   # both respect
TURF_T = 10  # encroach on a gang that respects
TURF_S = 0   # respect a gang that encroaches
TURF_P = 2   # both encroach
RULES_GRIM_THRESHOLD = F(1, 2)
RULES_CONTINUE_ABOVE = F(9, 10)  # "section 6 keeps it above 0.9"

# 3.3 Bribery. Offers per open district, before moves; the Chief answers and
# the gang knows the answer before it chooses crime.
BRIBE_MIN = 1
BRIBE_MAX = 20
MAX_AUDITS = 2         # a day, one district each
AUDIT_COST = 8         # per audit, from the treasury
SEIZURE = 100          # from a caught Chief, into the treasury; the Chief keeps the bribe
RULES_AUDIT_LINE = F(1, 10)          # the old line, mark off only; draft 4 retires it (b > 100a + 11 with the mark)
RULES_MAX_AUDIT_RATE = F(1, 3)       # "a can reach 1/3"
RULES_COUNCIL_INDIFFERENT = F(8, 100)  # the Council's indifference: a take rate of 8% of open districts

# 3.5 Nature, drawn at the start of each day. Chances and effects are fixed
# for the study (DECIDED, 31 Oct).
NATURE = {
    "storm": F(10, 100),  # Port closed
    "fire": F(5, 100),    # one district at random: its gang loses FIRE_LOSS
    "strike": F(3, 100),  # treasury loses STRIKE_LOSS
    "ship": F(15, 100),   # Families gain SHIP_GAIN
}
FIRE_LOSS = 20
STRIKE_LOSS = 30
SHIP_GAIN = 15

# 6. Run length. DECIDED #10 and #17 (31 Oct): at least 12 days, then 8% a
# day; the cap stays hidden, so it creates no backward induction (#12).
MIN_DAYS = 12            # guaranteed; no end draw after days 1 to 11
END_CHANCE = F(8, 100)   # after each day from day MIN_DAYS on
HIDDEN_CAP = 60          # never told to players; a run that hits it is truncated
RULES_REACH_CAP_APPROX = F(18, 1000)  # "0.92^48, about 1.8%"

# The superseded rule of plan rev 3, kept as a labelled alternative: an end
# draw after every day from day 1, 2% each, and a 150-day cap players are told.
ALT_MIN_DAYS = 1
ALT_END_CHANCE = F(2, 100)
ALT_CAP = 150

# Week 0: "measured rates match the solver within noise". The bands use the
# expected open district-days of one run at the draft run length.
BAND = F(95, 100)
# Equivalence test (issue #13, analysis/metrics/week0.py): margin, alpha, power.
WEEK0_MARGIN = 0.02
WEEK0_ALPHA = 0.05
WEEK0_POWER = 0.8

OPEN_QUESTIONS = [
    "Week-0 turf bots. Which strategy do the scripted gangs play in the turf war: always encroach "
    "(the one-day equilibrium) or grim trigger (cooperation)? Both are equilibria at a continuation "
    "chance of 0.92, and the week-0 check needs one. The engine's test bots always respect.",
]
