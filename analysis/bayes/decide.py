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
SEATS = ("Criminals", "Government")  # the two seats a model holds besides the World


def _cells(posterior, occupied=None, families=FAMILIES):
    """Linear predictor of tone at each occupied (world, holder, seat) cell, per draw.

    The World's family never holds another seat in its own run, so 6 of the
    9 (world, holder) pairs occur. Two Latin squares (odd triples play
    rotations 1 to 3, even triples the mirror square 4 to 6; Germ, 1 Nov,
    #130) put every pair in both seats: 12 cells. occupied lists the cells
    the data has; None means all 12.
    """
    w_lab, h_lab = labels(posterior, "world_family"), labels(posterior, "holder_family")
    s_lab = labels(posterior, "seat")
    i_lab = labels(posterior, "world_family:holder_family")
    w, h = draws(posterior, "world_family"), draws(posterior, "holder_family")
    st, inter = draws(posterior, "seat"), draws(posterior, "world_family:holder_family")
    allf = sorted(families)  # treatment coding leaves the first level out of the labels
    if occupied is None:
        occupied = [(wf, hf, seat) for wf in allf for hf in allf if wf != hf for seat in SEATS]
    cells, cols = [], []
    for wf, hf, seat in sorted(occupied):
        eta = np.zeros(w.shape[0])
        if wf in w_lab:
            eta = eta + w[:, w_lab.index(wf)]
        if hf in h_lab:
            eta = eta + h[:, h_lab.index(hf)]
        if seat in s_lab:
            eta = eta + st.reshape(st.shape[0], -1)[:, s_lab.index(seat)]
        key = f"{wf}, {hf}"
        if key in i_lab:
            eta = eta + inter[:, i_lab.index(key)]
        cells.append((wf, hf, seat))
        cols.append(eta)
    return cells, np.column_stack(cols)


def _wald(contrast, draws_):
    """Wald chi-square of C mu = 0 from the posterior mean and covariance.
    Degrees of freedom are the rank of C's posterior covariance, so contrasts
    the model can't move (exactly 0 in every draw) add no df."""
    from scipy.stats import chi2

    m = contrast @ draws_.mean(axis=0)
    cov = contrast @ np.cov(draws_, rowvar=False) @ contrast.T
    sv = np.linalg.svd(cov, compute_uv=False) if cov.size else np.array([])
    df = int((sv > 1e-9 * max(sv.max(initial=0.0), 1e-300)).sum()) if sv.size else 0
    if df == 0:
        return 0.0, 0, 1.0
    stat = float(m @ np.linalg.pinv(cov, rcond=1e-9) @ m)
    return stat, df, float(chi2.sf(stat, df))


def h5(posterior, occupied=None, families=FAMILIES):
    """H5, one omnibus test (decision A, 31 Oct): a Wald chi-square on the
    world x holder interaction, from the posterior mean and covariance; its p
    enters Holm. It tests the contrasts of the occupied cell means that the
    additive model (seat + world + holder) can't explain, so it doesn't depend
    on the reference coding.

    With both Latin squares, the cells span rank 7 against 6 for the additive
    model, so the interaction has 1 identifiable df. With one square only,
    each (world, holder) pair always falls in the same seat, the interaction
    is the seat effect, and the test has 0 df: p = 1.

    Also returned, descriptive only: the holder-within-world contrasts
    and each cell's posterior median.
    """
    cells, eta = _cells(posterior, occupied, families)
    fams = sorted(families)
    add = np.array([[1.0, float(c[2] == SEATS[1])] + [float(c[0] == f) for f in fams[1:]] + [float(c[1] == f) for f in fams[1:]]
                    for c in cells])
    u, sv, _ = np.linalg.svd(add)
    rank = int((sv > 1e-9).sum())
    contrast = u[:, rank:].T  # the space orthogonal to the additive model
    stat, df, p = _wald(contrast, eta) if contrast.size else (0.0, 0, 1.0)
    out = {"H5 omnibus": {"estimate": stat, "df": df, "p": p, "clears": p < 0.05, "test": "Wald chi-square, world x holder",
                          **({"note": "not confirmed (interaction not identified in these runs)"} if df == 0 else {})}}
    pairs = sorted({(c[0], c[1]) for c in cells})
    within = []
    for wf in fams:
        mine = sorted(hf for (w_, hf) in pairs if w_ == wf)
        if len(mine) == 2:
            row = [(1.0 if (c[0], c[1]) == (wf, mine[0]) else -1.0 if (c[0], c[1]) == (wf, mine[1]) else 0.0) for c in cells]
            within.append(row)
    if within:
        s2, d2, p2 = _wald(np.array(within), eta)
        out["H5 holder within world (descriptive)"] = {"estimate": s2, "df": d2, "p_descriptive": p2, "measure": True,
                                                        "low": float("nan"), "high": float("nan")}
    for k, c in enumerate(cells):
        x = eta[:, k]
        out[f"H5 cell {c[0]} on {c[1]}, {c[2]} (descriptive)"] = {"estimate": float(np.median(x)), "low": float(np.quantile(x, 0.025)),
                                                                   "high": float(np.quantile(x, 0.975)), "measure": True}
    return out


# The Holm entries each confirmatory test contributes. A test that can't be
# decided (fit unreliable, skipped, judges below the alpha line) still
# contributes all of them, at p = 1, so the family size never depends on the
# data (Germ, 1 Nov). Measurements (H3 departures, cell means) never enter Holm.
ENTRIES = {
    "H1": ["H1"],
    "H2a": [f"H2a {f}" for f in FAMILIES],
    "H2b": ["H2b"],
    "H3": ["H3 delta"],
    "H4": ["H4 day", "H4 after day 12"],
    "H5": ["H5 omnibus"],
    "H6 Brier skill": ["H6 Brier skill"],
    "H6 lambda": ["H6 lambda"],
}
MEASUREMENTS = {"H3 departures"}


def holm_size():
    """The confirmatory family size: 11 entries (H2a 3, H4 2, H6 2, the rest 1)."""
    return sum(len(v) for v in ENTRIES.values())


def not_decided(test, note, log=None):
    """Every Holm entry of `test` at p = 1, with `note` as the verdict.
    A measurement returns its entries marked as measurements, outside Holm."""
    if test in MEASUREMENTS:
        return {f"{test} {f}": {"estimate": float("nan"), "low": float("nan"), "high": float("nan"), "measure": True, "note": note}
                for f in FAMILIES}
    return {k: {"estimate": float("nan"), "low": float("nan"), "high": float("nan"), "p": 1.0, "clears": False,
                "note": note, **({"fit_log": log} if log else {})} for k in ENTRIES[test]}


def unreliable(test, log=None):
    """Decision B: a test whose fit fails every rung stays in Holm at p = 1,
    with all its entries, reported "not confirmed (fit unreliable)"."""
    return not_decided(test, "not confirmed (fit unreliable)", log)


def h5_unreliable_judges(alpha_tone):
    """Germ, 31 Oct: if the judges' agreement on tone (Krippendorff's alpha)
    is below 0.70, H5 stays in Holm with p = 1."""
    out = not_decided("H5", "not confirmed (judge agreement too low)")
    out["H5 omnibus"]["alpha_tone"] = alpha_tone
    return out


def skipped(test, reason):
    """Germ, 1 Nov: a test the data can't run (no offers, too few triples, no
    judge codes) enters Holm at p = 1 with all its entries; it is never dropped."""
    return not_decided(test, f"not confirmed (skipped: {reason})")


def confirm(results, alpha=0.05):
    """Holm across the confirmatory decisions, on p = 1 - p_d. Measurements
    (no threshold) pass through untouched."""
    tests = {k: v for k, v in results.items() if "p" in v and not v.get("measure")}
    adj = holm({k: v["p"] for k, v in tests.items()}, alpha) if tests else {}
    return {k: (v | {"holm": adj[k]["adjusted"], "holm_reject": adj[k]["reject"]}) if k in adj else v for k, v in results.items()}
