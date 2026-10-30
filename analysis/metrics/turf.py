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


def endgame_regression(mine, theirs):
    """Logistic regression of a gang's cooperation on the day, controlling
    for the other gang's previous move and its own (issue #13).

    A negative, significant "day" coefficient is an end-game drop that the
    history of play doesn't explain. Day 1 is dropped (no previous move).
    """
    from .glm import logit

    if len(mine) != len(theirs) or len(mine) < 4:
        raise ValueError("need two equal move lists of at least 4 days")
    rows = [[1.0, float(t + 1), float(theirs[t - 1]), float(mine[t - 1])] for t in range(1, len(mine))]
    ys = [1 if mine[t] else 0 for t in range(1, len(mine))]
    return logit(rows, ys, names=["intercept", "day", "their_previous", "own_previous"])


# Strategy frequency estimation (Dal Bo and Frechette 2011): the strategies
# the review names, each followed with a common tremble.
SFEM_STRATEGIES = ("always respect", "always encroach", "grim trigger", "tit-for-tat")


def sfem(runs, strategies=SFEM_STRATEGIES, iterations=500, tol=1e-10):
    """Share of gangs playing each strategy, and the tremble rate.

    runs: list of (mine, theirs) move lists, one per gang per run. Each gang
    is assumed to follow one strategy for the whole run, making the
    prescribed move with probability 1 - tremble. Fitted by EM, which has
    closed-form updates here.

    Returns {"shares": {strategy: share}, "tremble", "loglik"}. Strategies
    that prescribe the same moves on the data (grim and tit-for-tat against a
    gang that always respects) can't be told apart; their shares split.
    """
    from math import exp, log

    if not runs:
        raise ValueError("no runs")
    # matches[i][k]: days on which gang i's move matched strategy k.
    matches, lengths = [], []
    for mine, theirs in runs:
        if len(mine) != len(theirs) or not mine:
            raise ValueError("each run needs two equal, non-empty move lists")
        lengths.append(len(mine))
        row = []
        for name in strategies:
            rule = STRATEGIES[name]
            row.append(sum(rule(mine[:t], theirs[:t]) == mine[t] for t in range(len(mine))))
        matches.append(row)

    k = len(strategies)
    shares = [1 / k] * k
    hit = 0.9
    prev = None
    for _ in range(iterations):
        # E-step in logs, to survive long runs.
        resp, ll = [], 0.0
        for row, n in zip(matches, lengths):
            logs = [log(shares[j]) + row[j] * log(hit) + (n - row[j]) * log(1 - hit) if shares[j] > 0 else float("-inf") for j in range(k)]
            top = max(logs)
            weights = [exp(v - top) for v in logs]
            total = sum(weights)
            resp.append([w / total for w in weights])
            ll += top + log(total)
        shares = [sum(r[j] for r in resp) / len(resp) for j in range(k)]
        num = sum(r[j] * row[j] for r, row in zip(resp, matches) for j in range(k))
        den = sum(r[j] * n for r, n in zip(resp, lengths) for j in range(k))
        hit = min(max(num / den, 0.5 + 1e-9), 1 - 1e-9)
        if prev is not None and abs(ll - prev) < tol:
            break
        prev = ll
    return {"shares": dict(zip(strategies, shares)), "tremble": 1 - hit, "loglik": ll}
