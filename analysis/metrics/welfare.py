"""Welfare: how much value the city loses to conflict (plan, What we measure:
"total payoff against the best possible total"). Formula from issue #13.

Bribes and taxes move money between players, so they cancel out. Per day:

  W = turf payoffs of both gangs
      + 10 x uninspected crimes (the gang's gain)
      - 15 x uninspected crimes (the city's damage)
      - 30 x inspected crimes (fines, burned)
      - 4 x inspections - 8 x audits

The best feasible day is 12: no crime, no inspections or audits, and both
gangs respect each other's turf (6 + 6).
"""

from . import equilibrium as eq

TURF_BOTH_RESPECT = 6
BEST_DAY = 2 * TURF_BOTH_RESPECT
AUDIT_COST = 8


def day_welfare(turf_total, uninspected_crimes, inspected_crimes, inspections, audits):
    return (
        turf_total
        + (eq.CRIME_GAIN - eq.CRIME_DAMAGE) * uninspected_crimes
        - eq.FINE * inspected_crimes
        - eq.INSPECTION_COST * inspections
        - AUDIT_COST * audits
    )


def run_welfare(days):
    """days: list of dicts with the day_welfare arguments.

    Returns the total, the best feasible total, the share achieved (can be
    negative) and the loss per day.
    """
    total = sum(day_welfare(**d) for d in days)
    best = BEST_DAY * len(days)
    return {"total": total, "best": best, "share": total / best if best else float("nan"),
            "loss_per_day": (best - total) / len(days) if days else float("nan")}
