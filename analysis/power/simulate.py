"""Power of the model-against-seat analysis: 9 long runs against 27 short ones.

Issue #10. Each run seats the 3 models in the 3 seats by the Latin-square
rotation, so the study is a replicated 3 x 3 Latin square: rows are runs,
columns are seats, treatments are models. One measure is a yes/no decision
made k times a day by each seat (for example an aggressive move).

Data model, on the log-odds scale, for run r, seat s, model m:
    logit p = model_m + seat_s + e_rs,   e_rs ~ Normal(0, tau)
tau is how much the same model in the same seat varies from run to run
(history, luck); it is the quantity that sets the power, and nobody knows it
yet. Each seat-run then makes days x k Bernoulli(p) decisions.

Analysis: the empirical log-odds of each seat-run, then a fixed-effects
ANOVA with run, seat and model. With runs in multiples of 3 the design is
balanced and the three effects are orthogonal, so the sums of squares come
from plain means. The F-test on model (2 and 2R - 4 degrees of freedom) is
the test whose power we report. Seat power is the same by symmetry.

Run from the repo root:
    python3 -m analysis.power.simulate
"""

import math
import random
import sys

from .fdist import f_sf

ALPHA = 0.05


def model_of(run, seat):
    """Latin-square rotation: week w = run mod 3 shifts models one seat along."""
    return (seat + run) % 3


def simulate_once(rng, runs, days, k, effects, tau):
    """One study. Returns the p-value of the model F-test."""
    y = [[0.0] * 3 for _ in range(runs)]
    n = days * k
    for r in range(runs):
        for s in range(3):
            m = model_of(r, s)
            eta = effects[m] + rng.gauss(0, tau)
            p = 1 / (1 + math.exp(-eta))
            yes = sum(rng.random() < p for _ in range(n))
            y[r][s] = math.log((yes + 0.5) / (n - yes + 0.5))  # empirical logit
    grand = sum(map(sum, y)) / (3 * runs)
    run_means = [sum(row) / 3 for row in y]
    seat_means = [sum(y[r][s] for r in range(runs)) / runs for s in range(3)]
    model_sum = [0.0] * 3
    for r in range(runs):
        for s in range(3):
            model_sum[model_of(r, s)] += y[r][s]
    model_means = [t / runs for t in model_sum]
    ss_total = sum((v - grand) ** 2 for row in y for v in row)
    ss_run = 3 * sum((v - grand) ** 2 for v in run_means)
    ss_seat = runs * sum((v - grand) ** 2 for v in seat_means)
    ss_model = runs * sum((v - grand) ** 2 for v in model_means)
    df_res = 2 * runs - 4
    ss_res = max(ss_total - ss_run - ss_seat - ss_model, 1e-12)
    f = (ss_model / 2) / (ss_res / df_res)
    return f_sf(f, 2, df_res)


def power(runs, days, k, spread, tau, reps=2000, seed=2026):
    """Share of simulated studies where the model test has p < 0.05.

    spread: the model effects are (-spread, 0, +spread) on the log-odds scale.
    """
    if runs % 3:
        raise ValueError("runs must be a multiple of 3 (one full rotation each)")
    rng = random.Random(seed)
    effects = (-spread, 0.0, spread)
    hits = sum(simulate_once(rng, runs, days, k, effects, tau) < ALPHA for _ in range(reps))
    return hits / reps


DESIGNS = [("9 runs x 50 days (plan rev 3)", 9, 50), ("27 runs x 20 days (issue #10)", 27, 20)]
SPREADS = [0.0, 0.25, 0.5]   # 0 checks the false-positive rate stays near 5%
TAUS = [0.3, 0.6, 1.0]
K = 6                        # decisions a day, e.g. one per district


def main(reps=2000):
    print("Power of the model F-test, alpha 0.05, %d simulated studies per cell" % reps)
    print("spread = model effects (-s, 0, +s) on the log-odds scale; tau = run-to-run sd")
    print()
    header = "design".ljust(32) + "".join(("s=%.2f t=%.1f" % (s, t)).rjust(14) for s in SPREADS for t in TAUS)
    print(header)
    for name, runs, days in DESIGNS:
        row = name.ljust(32)
        for s in SPREADS:
            for t in TAUS:
                row += ("%.2f" % power(runs, days, K, s, t, reps)).rjust(14)
        print(row)


if __name__ == "__main__":
    main(int(sys.argv[1]) if len(sys.argv) > 1 else 2000)
