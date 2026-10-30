"""Logistic regression by iteratively reweighted least squares, standard
library only. Small models (a handful of covariates) on run-sized data."""

from math import exp, log, sqrt


def _solve(a, b):
    """Solve a x = b for a small dense system (Gaussian elimination, pivoting)."""
    n = len(b)
    m = [row[:] + [b[i]] for i, row in enumerate(a)]
    for col in range(n):
        piv = max(range(col, n), key=lambda r: abs(m[r][col]))
        if abs(m[piv][col]) < 1e-12:
            raise ValueError("singular design: a covariate is constant or duplicated")
        m[col], m[piv] = m[piv], m[col]
        for r in range(n):
            if r != col:
                f = m[r][col] / m[col][col]
                for c in range(col, n + 1):
                    m[r][c] -= f * m[col][c]
    return [m[i][n] / m[i][i] for i in range(n)]


def _inverse(a):
    n = len(a)
    cols = [_solve(a, [1.0 if i == j else 0.0 for i in range(n)]) for j in range(n)]
    return [[cols[j][i] for j in range(n)] for i in range(n)]


def _sigmoid(z):
    if z >= 0:
        return 1 / (1 + exp(-z))
    e = exp(z)
    return e / (1 + e)


def logit(rows, ys, names=None, max_iter=50, tol=1e-10):
    """Fit P(y = 1) = sigmoid(b . x). rows: covariate lists, an intercept
    column included by the caller if wanted. ys: 0/1.

    Returns {"coef": {name: (estimate, standard error)}, "loglik", "n",
    "separated"}. separated is True when the fit ran away (a covariate
    predicts y perfectly); estimates are then not meaningful.
    """
    k = len(rows[0])
    names = names or [f"x{i}" for i in range(k)]
    b = [0.0] * k
    separated = False
    for _ in range(max_iter):
        grad = [0.0] * k
        info = [[0.0] * k for _ in range(k)]
        for x, y in zip(rows, ys):
            p = _sigmoid(sum(bi * xi for bi, xi in zip(b, x)))
            w = p * (1 - p)
            for i in range(k):
                grad[i] += (y - p) * x[i]
                for j in range(k):
                    info[i][j] += w * x[i] * x[j]
        try:
            step = _solve(info, grad)
        except ValueError:
            separated = True
            break
        b = [bi + si for bi, si in zip(b, step)]
        if max(abs(v) for v in b) > 30:
            separated = True
            break
        if max(abs(s) for s in step) < tol:
            break
    ll = 0.0
    for x, y in zip(rows, ys):
        p = min(max(_sigmoid(sum(bi * xi for bi, xi in zip(b, x))), 1e-300), 1 - 1e-16)
        ll += log(p) if y else log(1 - p)
    try:
        cov = _inverse(info)
        se = [sqrt(cov[i][i]) if cov[i][i] > 0 else float("nan") for i in range(k)]
    except ValueError:
        se = [float("nan")] * k
    return {"coef": {n: (bi, si) for n, bi, si in zip(names, b, se)}, "loglik": ll, "n": len(ys), "separated": separated}
