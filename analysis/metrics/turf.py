"""The turf war: cooperation rate, which strategy a gang plays, and whether
cooperation drops as the game ages (hypothesis 4).

Moves are booleans: True = respect (cooperate), False = encroach.
"""

import random

# Each strategy: (my history, their history) -> my move today.
STRATEGIES = {
    "always respect": lambda me, them: True,
    "always encroach": lambda me, them: False,
    "tit-for-tat": lambda me, them: them[-1] if them else True,
    "grim trigger": lambda me, them: all(them),
    "forgive one (tit-for-two-tats)": lambda me, them: not (len(them) >= 2 and not them[-1] and not them[-2]),
    "win-stay lose-shift": lambda me, them: True if not me else (me[-1] if them[-1] else not me[-1]),
}


def cooperation_rate(moves):
    return sum(moves) / len(moves) if moves else float("nan")


def classify(mine, theirs):
    """How well each textbook strategy explains one gang's moves.

    mine, theirs: the two gangs' moves, day by day. Returns strategies sorted
    by agreement (share of days the strategy would have made the same move).
    Ties keep the order of STRATEGIES. A short or all-respect run fits
    several strategies equally; read the agreement, not just the name.
    """
    if len(mine) != len(theirs):
        raise ValueError("move lists differ in length")
    fits = []
    for name, rule in STRATEGIES.items():
        same = sum(rule(mine[:t], theirs[:t]) == mine[t] for t in range(len(mine)))
        fits.append({"strategy": name, "agreement": same / len(mine) if mine else float("nan")})
    return sorted(fits, key=lambda f: -f["agreement"])


def _slope(xs, ys):
    mx = sum(xs) / len(xs)
    my = sum(ys) / len(ys)
    sxx = sum((x - mx) ** 2 for x in xs)
    return sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / sxx if sxx else 0.0


def age_trend(moves, permutations=10_000, seed=2026):
    """Does cooperation fall as the game ages?

    Fits cooperation (1/0) against day number and tests the slope with a
    one-sided permutation test: p is the share of shuffled runs whose slope is
    at least as negative. A small p means a drop the random end date doesn't
    justify. Deterministic for a given seed.
    """
    if len(moves) < 3:
        raise ValueError("need at least 3 days")
    days = list(range(1, len(moves) + 1))
    ys = [1.0 if m else 0.0 for m in moves]
    observed = _slope(days, ys)
    rng = random.Random(seed)
    shuffled = ys[:]
    as_low = 0
    for _ in range(permutations):
        rng.shuffle(shuffled)
        as_low += _slope(days, shuffled) <= observed + 1e-12
    return {"slope_per_day": observed, "p_drop": (as_low + 1) / (permutations + 1), "days": len(moves)}


def late_drop(moves, last=10):
    """Cooperation in the last `last` days against the days before."""
    if len(moves) <= last:
        raise ValueError("run shorter than the window")
    early, late = moves[:-last], moves[-last:]
    return {"early": cooperation_rate(early), "late": cooperation_rate(late),
            "drop": cooperation_rate(early) - cooperation_rate(late)}
