"""How likely is the study to detect a model effect, for a given run design?

Simulated measure: gang cooperation in the turf war. In each run the
Criminal seat is one model (both gangs), so the run is the independent unit.

  logit P(respect on a day) = base + model effect + run effect
  run effect ~ Normal(0, run_sd), one draw per run
  run length: each day ends the run with the daily end chance, up to the cap

Each run gives one number, its cooperation rate over both gangs' days. A
one-way ANOVA across the 3 models on those run rates is the test; power is
the share of simulated studies where it gives p < alpha. Effect sizes are
assumptions, so results are a grid, not one figure.
"""

import random
from math import exp, log

from .fdist import f_sf

MODELS = ("claude", "gemini", "gpt")

# Designs from issue #10.
DESIGNS = {
    "rev 3: 9 runs, 2% end, cap 150": {"runs": 9, "end": 0.02, "cap": 150},
    "#10: 27 runs, 5% end, cap 60": {"runs": 27, "end": 0.05, "cap": 60},
}


def run_length(rng, end, cap):
    days = 1
    while days < cap and rng.random() >= end:
        days += 1
    return days


def anova_p(groups):
    """One-way ANOVA p-value. groups: list of lists of numbers."""
    all_values = [v for g in groups for v in g]
    n, k = len(all_values), len(groups)
    grand = sum(all_values) / n
    between = sum(len(g) * (sum(g) / len(g) - grand) ** 2 for g in groups)
    within = sum((v - sum(g) / len(g)) ** 2 for g in groups for v in g)
    if within == 0:
        return 0.0 if between > 0 else 1.0
    f = (between / (k - 1)) / (within / (n - k))
    return f_sf(f, k - 1, n - k)


def one_study(rng, runs, end, cap, spread, run_sd, base_rate, gangs=2):
    """Simulate one study; return the ANOVA p-value for a model effect.

    spread: logit gap between the most and least cooperative model, with the
    third in the middle. runs must be a multiple of 3 (balanced rotation).
    """
    if runs % len(MODELS):
        raise ValueError("runs must be a multiple of 3")
    base = log(base_rate / (1 - base_rate))
    effects = [-spread / 2, 0.0, spread / 2]
    groups = [[] for _ in MODELS]
    for r in range(runs):
        m = r % len(MODELS)
        logit = base + effects[m] + rng.gauss(0, run_sd)
        p = 1 / (1 + exp(-logit))
        days = run_length(rng, end, cap) * gangs
        groups[m].append(sum(rng.random() < p for _ in range(days)) / days)
    return anova_p(groups)


def power(runs, end, cap, spread, run_sd, base_rate=0.6, sims=1000, alpha=0.05, seed=0):
    rng = random.Random(seed)
    hits = sum(one_study(rng, runs, end, cap, spread, run_sd, base_rate) < alpha for _ in range(sims))
    return hits / sims


def grid(spreads=(0.0, 0.5, 1.0, 1.5), run_sds=(0.3, 0.6), sims=1000, seed=2026):
    """Power for each design over a grid of effect sizes. spread 0 gives the
    false-positive rate, which should sit near alpha."""
    rows = []
    for run_sd in run_sds:
        for spread in spreads:
            row = {"spread": spread, "run_sd": run_sd}
            for name, d in DESIGNS.items():
                row[name] = power(d["runs"], d["end"], d["cap"], spread, run_sd, sims=sims, seed=seed)
            rows.append(row)
    return rows
