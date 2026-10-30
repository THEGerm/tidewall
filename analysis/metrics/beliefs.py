"""Belief accuracy (Brier score) and whether moves follow stated beliefs.

The plan: "A player can be wrong about the world and still rational, or right
about the world and still not act on it." brier() measures the first,
best_response_rate() the second.
"""

from . import equilibrium as eq


def brier(pairs):
    """Mean Brier score of (forecast, outcome) pairs; 0 is perfect, 0.25 is a coin.

    forecast: probability in [0, 1]. outcome: bool (or 0/1).
    """
    pairs = list(pairs)
    if not pairs:
        raise ValueError("no forecasts")
    for p, _ in pairs:
        if not 0 <= p <= 1:
            raise ValueError(f"forecast {p} is not a probability")
    return sum((p - float(o)) ** 2 for p, o in pairs) / len(pairs)


def brier_skill(pairs):
    """Brier skill against always forecasting the observed base rate.

    1 is perfect, 0 is no better than the base rate, below 0 is worse.
    """
    pairs = list(pairs)
    base = sum(float(o) for _, o in pairs) / len(pairs)
    reference = brier((base, o) for _, o in pairs)
    return float("nan") if reference == 0 else 1 - brier(pairs) / reference


def calibration(pairs, bins=5):
    """Forecasts grouped into equal-width bins: mean forecast against observed rate."""
    groups = [[] for _ in range(bins)]
    for p, o in pairs:
        groups[min(int(p * bins), bins - 1)].append((p, float(o)))
    out = []
    for i, g in enumerate(groups):
        if g:
            out.append({
                "bin": (i / bins, (i + 1) / bins),
                "n": len(g),
                "forecast": sum(p for p, _ in g) / len(g),
                "observed": sum(o for _, o in g) / len(g),
            })
    return out


# Best responses to a stated belief. Each returns True (do it), False (don't)
# or None when the belief sits within `tol` of the indifference point, where
# either move is a best response.

def _side(value, threshold, tol):
    if abs(value - threshold) <= tol:
        return None
    return value > threshold


def gang_should_commit(p_inspect, tol=0.0):
    """Crime pays when 10 (1 - p) - 30 p > 0, i.e. p < 1/4."""
    side = _side(p_inspect, float(eq.INSPECTION_RATE), tol)
    return None if side is None else not side


def police_should_inspect(p_crime, tol=0.0):
    """Inspecting pays when 15 q > 4, i.e. q > 4/15.

    This uses the police payoff that gives the plan's 25% equilibrium (crime
    damage counted). See the solver's open question 1.
    """
    return _side(p_crime, float(eq.CRIME_RATE), tol)


def chief_should_accept(bribe, p_audit, tol=0.0):
    """The Chief takes a bribe b when b > 100 x a (plan, Bribery)."""
    return _side(bribe - eq.BRIBE_PENALTY * p_audit, 0.0, tol)


def best_response_rate(decisions, tol=0.0):
    """Share of decisions that were a best response to the player's own belief.

    decisions: iterable of (should, did) where should is True, False or None
    (indifferent: any move counts) and did is the move made (bool).
    Returns {"rate", "n", "indifferent"}.
    """
    n = hits = indifferent = 0
    for should, did in decisions:
        n += 1
        if should is None:
            indifferent += 1
            hits += 1
        elif bool(should) == bool(did):
            hits += 1
    return {"rate": hits / n if n else float("nan"), "n": n, "indifferent": indifferent}
