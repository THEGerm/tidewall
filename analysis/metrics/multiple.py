"""Multiple comparisons, in two tiers (issue #17):

- confirmatory (H1 to H6): Holm, which controls the family-wise error rate;
- exploratory measures: Benjamini-Hochberg, which controls the false
  discovery rate.
"""


def benjamini_hochberg(pvalues, alpha=0.05):
    """pvalues: {name: p}. Returns {name: {"p", "q", "reject"}}, where q is
    the BH-adjusted p-value and reject means q <= alpha."""
    items = sorted(pvalues.items(), key=lambda kv: kv[1])
    m = len(items)
    q = [0.0] * m
    running = 1.0
    for i in range(m - 1, -1, -1):
        running = min(running, items[i][1] * m / (i + 1))
        q[i] = running
    return {name: {"p": p, "q": q[i], "reject": q[i] <= alpha} for i, (name, p) in enumerate(items)}


def holm(pvalues, alpha=0.05):
    """Holm step-down adjustment. pvalues: {name: p}.

    Returns {name: {"p", "adjusted", "reject"}}, where adjusted is the Holm
    p-value (monotone, capped at 1) and reject means adjusted <= alpha. For
    the Bayesian models, p is 1 - p_d (one-sided) as the pre-registration
    will state.
    """
    items = sorted(pvalues.items(), key=lambda kv: kv[1])
    m = len(items)
    out = {}
    running = 0.0
    for i, (name, p) in enumerate(items):
        running = max(running, min(1.0, (m - i) * p))
        out[name] = {"p": p, "adjusted": running, "reject": running <= alpha}
    return out
