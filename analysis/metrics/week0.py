"""Week-0 check: do the scripted bots reproduce the solver's rates?

"Within noise" as an equivalence test (issue #13): the engine passes if the
measured rate is shown to lie within a margin of the solver's value (two
one-sided exact binomial tests). Run it on bot days simulated offline, which
cost nothing, rather than on one 50-day run, which is far too short for a
tight margin.
"""

import random
from math import exp, lgamma, log
from statistics import NormalDist

from . import equilibrium as eq


def _log_pmf(k, n, p):
    if p <= 0:
        return 0.0 if k == 0 else float("-inf")
    if p >= 1:
        return 0.0 if k == n else float("-inf")
    return lgamma(n + 1) - lgamma(k + 1) - lgamma(n - k + 1) + k * log(p) + (n - k) * log(1 - p)


def binom_cdf(k, n, p):
    """P(X <= k) for X ~ Binomial(n, p), summed in logs (fine for n in the
    tens of thousands)."""
    if k < 0:
        return 0.0
    if k >= n:
        return 1.0
    logs = [_log_pmf(i, n, p) for i in range(k + 1)]
    top = max(logs)
    return min(1.0, exp(top) * sum(exp(v - top) for v in logs))


def binom_tost(k, n, target, margin):
    """Exact two one-sided tests for |rate - target| < margin.

    Returns the TOST p-value (the larger of the two one-sided p-values). A
    p-value below alpha shows equivalence within the margin.
    """
    low, high = target - margin, target + margin
    p_low = 1 - binom_cdf(k - 1, n, low) if low > 0 else 0.0   # H0: rate <= low
    p_high = binom_cdf(k, n, high) if high < 1 else 0.0          # H0: rate >= high
    return max(p_low, p_high)


def trials_needed(target, margin, alpha=0.05, power=0.8):
    """Trials (district-days, or days) for TOST to show equivalence with the
    given power when the true rate equals the target. Normal approximation."""
    z = NormalDist().inv_cdf
    need = (z(1 - alpha) + z(1 - (1 - power) / 2)) ** 2 * target * (1 - target) / margin**2
    return int(need) + 1


def simulate_bots(days, districts=6, seed=0):
    """Equilibrium bots on the inspection game: each district-day the gang
    commits crime with 4/15 and the police inspect with 1/4, independently.
    Returns counts for the crime and inspection rates."""
    rng = random.Random(seed)
    crimes = inspections = 0
    n = days * districts
    for _ in range(n):
        crimes += rng.random() < float(eq.CRIME_RATE)
        inspections += rng.random() < float(eq.INSPECTION_RATE)
    return {"district_days": n, "crimes": crimes, "inspections": inspections}
