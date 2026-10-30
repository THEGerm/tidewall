"""Binomial noise bands for the week-0 check."""

import math
from fractions import Fraction as F


def binomial_band(p, n, level=F(95, 100)):
    """Central band of counts for Binomial(n, p): (low, high), exact.

    At least `level` of runs land in low..high. Tails are cut at (1 - level) / 2.
    """
    p = F(p)
    tail = (1 - F(level)) / 2
    cdf, low, high = F(0), None, None
    for k in range(n + 1):
        cdf += math.comb(n, k) * p**k * (1 - p) ** (n - k)
        if low is None and cdf > tail:
            low = k
        if high is None and cdf >= 1 - tail:
            high = k
            break
    return low, high


def rate_band(p, n, level=F(95, 100)):
    """The same band as rates: (low, high) as Fractions of n."""
    low, high = binomial_band(p, n, level)
    return F(low, n), F(high, n)


def binomial_tail(p, n, above):
    """P(X > above) for X ~ Binomial(n, p), exact."""
    p = F(p)
    return sum(math.comb(n, k) * p**k * (1 - p) ** (n - k) for k in range(above + 1, n + 1))
