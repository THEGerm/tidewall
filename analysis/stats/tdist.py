"""Student's t distribution, standard library only (reuses the incomplete beta
in analysis/power/fdist.py)."""

from math import isfinite, sqrt

from analysis.power.fdist import betainc


def t_two_sided_p(t, df):
    """P(|T| >= |t|) for T with df degrees of freedom."""
    if not isfinite(t):
        return 0.0
    if df <= 0:
        return float("nan")
    return betainc(df / 2, 0.5, df / (df + t * t))


def t_quantile(q, df):
    """The q quantile of T (0.5 < q < 1), by bisection on the two-sided tail."""
    if not 0.5 < q < 1:
        raise ValueError("q must be in (0.5, 1)")
    target = 2 * (1 - q)
    lo, hi = 0.0, 1.0
    while t_two_sided_p(hi, df) > target:
        hi *= 2
    for _ in range(200):
        mid = (lo + hi) / 2
        if t_two_sided_p(mid, df) > target:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2


def mean_interval(xs, level=0.95):
    """Mean of xs with a t-based interval. Returns mean, sd, n, low, high, se."""
    xs = [x for x in xs if x == x]
    n = len(xs)
    nan = float("nan")
    if n == 0:
        return {"mean": nan, "sd": nan, "n": 0, "se": nan, "low": nan, "high": nan}
    m = sum(xs) / n
    if n < 2:
        return {"mean": m, "sd": nan, "n": 1, "se": nan, "low": nan, "high": nan}
    sd = sqrt(sum((x - m) ** 2 for x in xs) / (n - 1))
    se = sd / sqrt(n)
    h = t_quantile(1 - (1 - level) / 2, n - 1) * se
    return {"mean": m, "sd": sd, "n": n, "se": se, "low": m - h, "high": m + h}


def welch(xs, ys, level=0.95):
    """Welch's two-sample t comparison of means: difference xs - ys, its
    interval, t, df and two-sided p. NaN when either side has under 2 values
    or both have no spread."""
    a, b = mean_interval(xs), mean_interval(ys)
    nan = float("nan")
    out = {"diff": a["mean"] - b["mean"], "n_x": a["n"], "n_y": b["n"],
           "se": nan, "df": nan, "t": nan, "p": nan, "low": nan, "high": nan}
    if a["n"] < 2 or b["n"] < 2:
        return out
    va, vb = a["se"] ** 2, b["se"] ** 2
    se = sqrt(va + vb)
    if se == 0:
        return out
    df = (va + vb) ** 2 / (va ** 2 / (a["n"] - 1) + vb ** 2 / (b["n"] - 1))
    t = out["diff"] / se
    h = t_quantile(1 - (1 - level) / 2, df) * se
    out.update(se=se, df=df, t=t, p=t_two_sided_p(t, df), low=out["diff"] - h, high=out["diff"] + h)
    return out
