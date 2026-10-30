"""The equilibrium values the measures compare against.

Copied from the solver (analysis/solver/equilibria.json, plan rev 3). A test
checks they still agree whenever the solver's file is present.
"""

from fractions import Fraction as F

CRIME_RATE = F(4, 15)       # gang commits crime in a district
INSPECTION_RATE = F(1, 4)   # police inspect a district
AUDIT_LINE = F(1, 10)       # below this audit rate, corruption pays

# Inspection game payoffs, used for best responses and exploitation value.
CRIME_GAIN = 10
FINE = 30
CRIME_DAMAGE = 15
INSPECTION_COST = 4
BRIBE_PENALTY = 100
