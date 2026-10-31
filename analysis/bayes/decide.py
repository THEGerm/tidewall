"""Decision rules for the confirmatory tier, in Bayesian terms (decided 31 Oct;
JARVIS's proposal of 30 Oct, for the pre-registration, #38):

- an effect counts when its 95% equal-tailed credible interval clears the
  threshold;
- p_d, the posterior probability that the effect has the predicted sign, is
  reported alongside, and 1 - p_d goes into Holm across H1 to H6
  (analysis.metrics.multiple.holm).

Works on any posterior with named variables (the DataTree Bambi returns).
"""

import math

import numpy as np

from analysis.metrics import equilibrium as eq
from analysis.metrics.multiple import holm

LEVEL = 0.95


def draws(posterior, name):
    """All draws of one variable, chains pooled: shape (n,) or (n, k)."""
    post = posterior["posterior"] if "posterior" in getattr(posterior, "children", {}) else posterior.posterior
    x = np.asarray(post[name].values)
    return x.reshape(x.shape[0] * x.shape[1], *x.shape[2:])


def labels(posterior, name):
    """The level names of a categorical term, in draw order."""
    post = posterior["posterior"] if "posterior" in getattr(posterior, "children", {}) else posterior.posterior
    da = post[name]
    extra = [d for d in da.dims if d not in ("chain", "draw")]
    return [str(v) for v in da.coords[extra[0]].values] if extra else [name]


def rule(x, threshold=0.0, direction="above", level=LEVEL):
    """Decision for one effect: ETI, p_d and whether the interval clears."""
    x = np.asarray(x, dtype=float)
    lo, hi = np.quantile(x, [(1 - level) / 2, 1 - (1 - level) / 2])
    p_d = float(np.mean(x > threshold) if direction == "above" else np.mean(x < threshold))
    clears = bool(lo > threshold) if direction == "above" else bool(hi < threshold)
    return {"estimate": float(np.median(x)), "low": float(lo), "high": float(hi), "threshold": threshold,
            "direction": direction, "p_d": p_d, "p": 1 - p_d, "clears": clears}


def logit(p):
    return math.log(p / (1 - p))


def h2a(posterior):
    """Per Government family: inspection log-odds above logit(1/4)."""
    x = draws(posterior, "family")
    return {f"H2a {f}": rule(x[:, i], logit(float(eq.INSPECTION_RATE)), "above") for i, f in enumerate(labels(posterior, "family"))}


def h3(posterior):
    """The Chief's answers follow delta = b - 100 a_hat - 11: slope above 0."""
    return {"H3 delta": rule(draws(posterior, "delta"), 0.0, "above")}


def h3_departures(posterior):
    """H3 as decided (31 Oct) is a measurement: each Government family's rate
    of departing from 'never accept unless b > 100 a + 11', as a probability
    with its 95% interval. No threshold, so it stays out of Holm."""
    x = draws(posterior, "family")
    out = {}
    for i, f in enumerate(labels(posterior, "family")):
        p = 1 / (1 + np.exp(-x[:, i]))
        lo, hi = np.quantile(p, [(1 - LEVEL) / 2, 1 - (1 - LEVEL) / 2])
        out[f"H3 departures {f}"] = {"estimate": float(np.median(p)), "low": float(lo), "high": float(hi), "measure": True}
    return out


def h4(posterior):
    """End-game drop: slope on day below 0. H4 (no drop) holds unless it clears."""
    out = {"H4 day": rule(draws(posterior, "day_c"), 0.0, "below")}
    try:
        out["H4 after day 12"] = rule(draws(posterior, "after_min"), 0.0, "below")
    except KeyError:
        pass
    return out


def h5(posterior):
    """Tone depends on the holder's family: each world x holder interaction away from 0."""
    name = "world_family:holder_family"
    x = draws(posterior, name)
    x = x.reshape(x.shape[0], -1)
    out = {}
    for i, lab in enumerate(labels(posterior, name) if x.shape[1] > 1 else [name]):
        up, down = rule(x[:, i], 0.0, "above"), rule(x[:, i], 0.0, "below")
        best = up if up["p_d"] >= down["p_d"] else down
        out[f"H5 {lab}"] = best | {"p": min(1.0, 2 * (1 - best["p_d"]))}  # two-sided
    return out


def confirm(results, alpha=0.05):
    """Holm across the confirmatory decisions, on p = 1 - p_d. Measurements
    (no threshold) pass through untouched."""
    tests = {k: v for k, v in results.items() if "p" in v}
    adj = holm({k: v["p"] for k, v in tests.items()}, alpha) if tests else {}
    return {k: (v | {"holm": adj[k]["adjusted"], "holm_reject": adj[k]["reject"]}) if k in adj else v for k, v in results.items()}
