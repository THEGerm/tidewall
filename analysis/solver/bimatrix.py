"""Nash equilibria of small two-player games, by support enumeration.

Exact: payoffs and probabilities are Fractions. A[i][j] is the row player's
payoff and B[i][j] the column player's when row plays i and column plays j.
Supports of equal size are tried, which finds every equilibrium of a
nondegenerate game (all of Tidewall's games are nondegenerate).
"""

from fractions import Fraction as F
from itertools import combinations


def _solve(matrix, rhs):
    """Solve a square linear system exactly. None if it is singular."""
    n = len(matrix)
    m = [[F(x) for x in row] + [F(b)] for row, b in zip(matrix, rhs)]
    for col in range(n):
        pivot = next((r for r in range(col, n) if m[r][col] != 0), None)
        if pivot is None:
            return None
        m[col], m[pivot] = m[pivot], m[col]
        for r in range(n):
            if r != col and m[r][col] != 0:
                f = m[r][col] / m[col][col]
                m[r] = [a - f * b for a, b in zip(m[r], m[col])]
    return [m[i][n] / m[i][i] for i in range(n)]


def _indifference(payoff, own, other, n_other):
    """Mix over `other` that makes the owner of `payoff` indifferent over `own`.

    payoff[i][j] is the owner's payoff for own move i against other move j.
    Returns (mix over all n_other moves, owner's value) or None.
    """
    k = len(own)
    # Unknowns: the k probabilities on `other`, then the value v.
    rows = [[payoff[i][j] for j in other] + [-1] for i in own]
    rows.append([1] * k + [0])
    sol = _solve(rows, [0] * k + [1])
    if sol is None:
        return None
    probs, value = sol[:k], sol[k]
    if any(p <= 0 for p in probs):
        return None
    mix = [F(0)] * n_other
    for j, p in zip(other, probs):
        mix[j] = p
    return mix, value


def equilibria(A, B):
    """All equilibria as a list of (row mix, column mix, row value, column value)."""
    A = [[F(x) for x in row] for row in A]
    B = [[F(x) for x in row] for row in B]
    n, m = len(A), len(A[0])
    Bt = [[B[i][j] for i in range(n)] for j in range(m)]  # column player's view
    found = []
    for k in range(1, min(n, m) + 1):
        for I in combinations(range(n), k):
            for J in combinations(range(m), k):
                col = _indifference(A, I, J, m)  # column's mix keeps row indifferent on I
                row = _indifference(Bt, J, I, n)  # row's mix keeps column indifferent on J
                if col is None or row is None:
                    continue
                y, u = col
                x, v = row
                # No profitable move outside the supports.
                if any(sum(A[i][j] * y[j] for j in range(m)) > u for i in range(n)):
                    continue
                if any(sum(B[i][j] * x[i] for i in range(n)) > v for j in range(m)):
                    continue
                found.append((x, y, u, v))
    return found
