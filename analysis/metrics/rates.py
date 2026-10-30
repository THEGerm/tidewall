"""Rates against a target, with an interval, and rates by group."""

from collections import defaultdict
from math import sqrt

Z95 = 1.959963984540054


def wilson(successes, n, z=Z95):
    """Wilson score interval for a binomial rate. Returns (low, high)."""
    if n == 0:
        return (0.0, 1.0)
    p = successes / n
    denom = 1 + z * z / n
    centre = (p + z * z / (2 * n)) / denom
    half = z * sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / denom
    return (max(0.0, centre - half), min(1.0, centre + half))


def against(successes, n, target):
    """A measured rate next to its equilibrium target.

    Returns rate, its 95% interval, the gap (rate - target), a z-score under
    the target, and whether the target sits inside the interval.
    """
    target = float(target)
    rate = successes / n if n else float("nan")
    low, high = wilson(successes, n)
    se = sqrt(target * (1 - target) / n) if n and 0 < target < 1 else float("nan")
    return {
        "rate": rate,
        "n": n,
        "low": low,
        "high": high,
        "target": target,
        "gap": rate - target,
        "z": (rate - target) / se if se == se and se > 0 else float("nan"),
        "consistent": low <= target <= high,
    }


def by_group(records, key, flag):
    """Rate of a yes/no flag per group, e.g. refusals by (model, seat).

    records: iterable of dicts. key: function record -> group. flag: function
    record -> bool. Returns {group: {"yes": k, "n": n, "rate": k/n}}.
    """
    yes = defaultdict(int)
    n = defaultdict(int)
    for r in records:
        g = key(r)
        n[g] += 1
        yes[g] += bool(flag(r))
    return {g: {"yes": yes[g], "n": n[g], "rate": yes[g] / n[g]} for g in sorted(n, key=repr)}
