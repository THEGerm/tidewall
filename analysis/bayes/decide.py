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


FAMILIES = ("claude", "gemini", "gpt")


def _cells(posterior, families=FAMILIES):
    """Linear predictor of tone at each occupied (world, holder) cell, per draw.

    The World's family never holds another seat in a run, so 6 of the 9
    cells occur. Cell values are taken at the reference seat; the seat term
    cancels in every contrast below, and so does the reference coding.
    """
    w_lab, h_lab = labels(posterior, "world_family"), labels(posterior, "holder_family")
    allf = sorted(families)  # treatment coding leaves the first level out of the labels
    w, h = draws(posterior, "world_family"), draws(posterior, "holder_family")
    inter = draws(posterior, "world_family:holder_family")
    i_lab = labels(posterior, "world_family:holder_family")
    cells, cols = [], []
    for wf in allf:
        for hf in allf:
            if wf == hf:
                continue
            eta = np.zeros(w.shape[0])
            if wf in w_lab:
                eta = eta + w[:, w_lab.index(wf)]
            if hf in h_lab:
                eta = eta + h[:, h_lab.index(hf)]
            key = f"{wf}, {hf}"
            if key in i_lab:
                eta = eta + inter[:, i_lab.index(key)]
            cells.append((wf, hf))
            cols.append(eta)
    return cells, np.column_stack(cols)


def _wald(contrast, draws_):
    """Wald chi-square of C mu = 0 from the posterior mean and covariance."""
    from scipy.stats import chi2

    m = contrast @ draws_.mean(axis=0)
    cov = contrast @ np.cov(draws_, rowvar=False) @ contrast.T
    stat = float(m @ np.linalg.pinv(cov) @ m)
    df = int(np.linalg.matrix_rank(cov))
    return stat, df, float(chi2.sf(stat, df)) if df else 1.0


def h5(posterior, families=FAMILIES):
    """H5, one omnibus test (decision A, 31 Oct): a Wald chi-square on the
    world x holder interaction, from the posterior mean and covariance; its p
    enters Holm. The test is on the contrasts of the occupied cell means
    that the additive model (world + holder) can't explain, so it doesn't
    depend on the reference coding.

    With 6 occupied cells, the interaction has 6 - 5 = 1 degree of freedom.
    Bambi's 4 interaction terms include 2 for cells that never occur, which
    only their priors inform; the cell contrasts leave those out.

    Also returned, descriptive only: the holder-within-world contrasts (does
    each World's tone differ between the two families it can see?) and each
    cell's posterior median.
    """
    cells, eta = _cells(posterior, families)
    fams = sorted({c[0] for c in cells})
    # Additive design over the occupied cells: intercept, world and holder dummies.
    add = np.array([[1.0] + [float(c[0] == f) for f in fams[1:]] + [float(c[1] == f) for f in fams[1:]] for c in cells])
    u, sv, _ = np.linalg.svd(add)
    rank = int((sv > 1e-9).sum())
    contrast = u[:, rank:].T  # the space orthogonal to the additive model
    stat, df, p = _wald(contrast, eta)
    out = {"H5 omnibus": {"estimate": stat, "df": df, "p": p, "clears": p < 0.05, "test": "Wald chi-square, world x holder"}}
    within = np.array([[1.0 if c == (wf, a) else -1.0 if c == (wf, b) else 0.0 for c in cells]
                       for wf in fams for a, b in [sorted(f for f in fams if f != wf)]])
    s2, d2, p2 = _wald(within, eta)
    out["H5 holder within world (descriptive)"] = {"estimate": s2, "df": d2, "p_descriptive": p2, "measure": True,
                                                    "low": float("nan"), "high": float("nan")}
    for k, c in enumerate(cells):
        x = eta[:, k]
        out[f"H5 cell {c[0]} on {c[1]} (descriptive)"] = {"estimate": float(np.median(x)), "low": float(np.quantile(x, 0.025)),
                                                           "high": float(np.quantile(x, 0.975)), "measure": True}
    return out


def h5_unreliable_judges(alpha_tone):
    """Germ, 31 Oct: if the judges' agreement on tone (Krippendorff's alpha)
    is below 0.70, H5 stays in Holm with p = 1."""
    return {"H5 omnibus": {"estimate": float("nan"), "p": 1.0, "clears": False,
                           "note": f"not confirmed (judge agreement on tone {alpha_tone:.2f} < 0.70)"}}


def unreliable(name, log=None):
    """Decision B: a test whose fit fails every rung stays in Holm at p = 1,
    reported "not confirmed (fit unreliable)". It is never dropped."""
    return {name: {"estimate": float("nan"), "low": float("nan"), "high": float("nan"), "p": 1.0, "clears": False,
                   "note": "not confirmed (fit unreliable)", "fit_log": log or []}}


def confirm(results, alpha=0.05):
    """Holm across the confirmatory decisions, on p = 1 - p_d. Measurements
    (no threshold) pass through untouched."""
    tests = {k: v for k, v in results.items() if "p" in v}
    adj = holm({k: v["p"] for k, v in tests.items()}, alpha) if tests else {}
    return {k: (v | {"holm": adj[k]["adjusted"], "holm_reject": adj[k]["reject"]}) if k in adj else v for k, v in results.items()}
