"""Logit choice model: do moves follow the expected payoff the player's own
belief implies? Replaces the tolerance band in beliefs.best_response_rate
(issue #13).

P(take the action) = 1 / (1 + exp(-lambda x delta)), where delta is the
action's expected payoff minus the alternative's, worked out from the stated
belief. lambda = 0 means moves ignore beliefs; large lambda means near-exact
best responses; negative means moves run against beliefs. Fit lambda per
model and seat.
"""

from . import equilibrium as eq
from .glm import logit


def gang_delta(p_inspect):
    """Crime minus lying low, given the stated chance of inspection: 10 - 40 p."""
    return eq.CRIME_GAIN * (1 - p_inspect) - eq.FINE * p_inspect


def police_delta(p_crime):
    """Inspect minus don't, given the stated chance of crime: 15 q - 4.
    Assumes the police side counts crime damage (issue #12)."""
    return eq.CRIME_DAMAGE * p_crime - eq.INSPECTION_COST


def chief_delta(bribe, p_audit, counts_damage=None):
    """Accept minus refuse: b - 100 a - m, with m = 11 under the #12 mark
    (the default) and 0 without it. See beliefs.chief_should_accept."""
    return bribe - eq.BRIBE_PENALTY * p_audit - eq.accept_margin(counts_damage)


def fit_lambda(pairs):
    """Maximum-likelihood lambda from (delta, took_action) pairs.

    No intercept: at delta = 0 both moves are equally good, so the model
    says 50/50. Returns {"lambda", "se", "loglik", "n", "separated"}.
    """
    pairs = list(pairs)
    if not pairs:
        raise ValueError("no decisions")
    fit = logit([[float(d)] for d, _ in pairs], [1 if a else 0 for _, a in pairs], names=["lambda"])
    lam, se = fit["coef"]["lambda"]
    return {"lambda": lam, "se": se, "loglik": fit["loglik"], "n": fit["n"], "separated": fit["separated"]}
