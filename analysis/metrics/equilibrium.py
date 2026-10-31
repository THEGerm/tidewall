"""The equilibrium values the measures compare against.

Copied from the solver (analysis/solver/equilibria.json, rules draft 3 with
the 31 Oct decisions). A test checks they still agree with the solver's file.
"""

from fractions import Fraction as F

CRIME_RATE = F(4, 15)       # gang commits crime in a district
INSPECTION_RATE = F(1, 4)   # police inspect a district
AUDIT_LINE = F(1, 10)       # below this audit rate, corruption pays (only with the #12 mark off)

# Inspection game payoffs, used for best responses and exploitation value.
CRIME_GAIN = 10
FINE = 30
CRIME_DAMAGE = 15
INSPECTION_COST = 4
BRIBE_PENALTY = 100

# #12, decided 31 Oct (Shazz): the Chief's score counts crime damage, as
# CHIEF_COUNTS_DAMAGE in worker/src/engine/config.ts.
CHIEF_COUNTS_DAMAGE = True

# With that mark on, a bribe the Chief accepts means sure crime in the district
# (the gang knows the answer before moving, and the district can't be
# inspected): -15 to its score, against -4 for the district at the inspection
# equilibrium. So the Chief takes b only when b > 100 a + 11 (solver, bribery).
ACCEPT_MARGIN = CRIME_DAMAGE - CRIME_DAMAGE * CRIME_RATE  # 11


def accept_margin(counts_damage=None):
    """What a bribe must clear on top of 100 a: 11 with the #12 mark, else 0."""
    on = CHIEF_COUNTS_DAMAGE if counts_damage is None else counts_damage
    return ACCEPT_MARGIN if on else 0
