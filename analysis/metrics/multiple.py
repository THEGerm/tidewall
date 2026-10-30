"""Benjamini-Hochberg false discovery rate across the study's measures."""


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
