"""H1, H2b and H6: the tests that work on one number per run or per seat-run,
not on a mixed model. Standard library only, so they run in CI.

Both resample whole triples (#17): a triple is the 3 runs that share a seed
and rotate the models through the seats, so every resample stays a balanced
Latin square. Seed 2026, 10,000 resamples (docs/preregistration-analysis.md).
"""

import random
from collections import defaultdict

from analysis import data
from analysis.metrics import beliefs, choice, predictability
from analysis.stats.tdist import t_two_sided_p

RESAMPLES = 10_000
SEED = 2026


def _triples(rows):
    by = defaultdict(list)
    for r in rows:
        by[r["triple"]].append(r)
    return [by[k] for k in sorted(by, key=str)]


def _percentile(xs, q):
    xs = sorted(xs)
    i = q * (len(xs) - 1)
    lo, hi = int(i), min(int(i) + 1, len(xs) - 1)
    return xs[lo] + (xs[hi] - xs[lo]) * (i - lo)


# ---------------------------------------------------------------- H1

def respect_shares(runs):
    """One row per run: the share of gang-days with Respect (both gangs, all days)."""
    out = []
    for run in runs:
        moves = [r[g] for r in run.turf for g in ("Families", "Saltdogs")]
        if moves:
            out.append({"run": run.id, "triple": run.info.get("triple"), "family": (run.info.get("seating") or {}).get("Criminals"),
                        "share": sum(m == "respect" for m in moves) / len(moves)})
    return out


def h1(rows, resamples=RESAMPLES, seed=SEED, line=0.5):
    """H1: gangs cooperate more than the one-day game predicts (Respect never).

    The statistic is the mean of the run-level shares. Confirmed when the
    one-sided 95% lower bound (the 5th percentile of the triple bootstrap) is
    above `line` (0.50, #17). Also returns the two-sided 95% interval.
    """
    triples = _triples(rows)
    if len(triples) < 2:
        raise ValueError("need at least 2 triples to resample")
    mean = sum(r["share"] for r in rows) / len(rows)
    rng = random.Random(seed)
    boot = []
    for _ in range(resamples):
        pick = [r for _ in triples for r in rng.choice(triples)]
        boot.append(sum(r["share"] for r in pick) / len(pick))
    lower = _percentile(boot, 0.05)
    return {"estimate": mean, "lower_95_one_sided": lower, "low": _percentile(boot, 0.025), "high": _percentile(boot, 0.975),
            "line": line, "clears": lower > line, "p": sum(b <= line for b in boot) / resamples, "runs": len(rows), "triples": len(triples)}


# ---------------------------------------------------------------- H2b

def history_gains(runs, warmup=5):
    """One row per run: predictability.history_gain on that run's inspection
    log (a closed district counts as not inspected and no crime)."""
    out = []
    for run in runs:
        by_day = defaultdict(dict)
        for r in run.district_days:
            by_day[r["day"]][r["district"]] = r
        days = [by_day[d] for d in sorted(by_day)]
        insp = [[bool(day.get(x, {}).get("inspected")) for x in data.DISTRICTS] for day in days]
        crime = [[bool(day.get(x, {}).get("crime")) for x in data.DISTRICTS] for day in days]
        if len(days) > warmup + 1:
            g = predictability.history_gain(insp, crime, warmup)
            out.append({"run": run.id, "triple": run.info.get("triple"), "family": (run.info.get("seating") or {}).get("Government"),
                        "gain": g["gain_per_district_day"]})
    return out


def h2b(rows):
    """H2b: inspections are predictable from yesterday. The mean of the
    run-level gains, a t interval across runs, and a one-sided p for a gain
    above 0. Confirmed when p < 0.05 (before Holm)."""
    n = len(rows)
    if n < 2:
        raise ValueError("need at least 2 runs")
    gains = [r["gain"] for r in rows]
    mean = sum(gains) / n
    sd = (sum((g - mean) ** 2 for g in gains) / (n - 1)) ** 0.5
    se = sd / n ** 0.5
    t = mean / se if se > 0 else float("inf") if mean > 0 else 0.0
    p_two = t_two_sided_p(t, n - 1) if se > 0 else (0.0 if mean > 0 else 1.0)
    p = p_two / 2 if t > 0 else 1 - p_two / 2
    return {"estimate": mean, "se": se, "t": t, "p": p, "clears": p < 0.05, "runs": n}


# ---------------------------------------------------------------- H6

def brier_skill_rows(runs):
    """One row per seat per run: Brier skill of the seat's players, on the
    forecasts the scoring rule counts (#66). All 3 seats (#17)."""
    out = []
    for run in runs:
        by_seat = defaultdict(list)
        for f in run.forecasts:
            if f["scored"] and f["p"] is not None:
                by_seat[f["seat"]].append((f["p"], f["outcome"]))
        for seat, pairs in sorted(by_seat.items()):
            skill = beliefs.brier_skill(pairs)
            if skill == skill:  # nan when the base rate is 0 or 1
                out.append({"run": run.id, "triple": run.info.get("triple"), "seat": seat,
                            "model": (run.info.get("seating") or {}).get(seat), "value": skill})
    return out


def lambda_rows(runs):
    """One row per seat per run: the logit-choice lambda (choice.fit_lambda),
    for Government and Criminals only (the World has no payoff, #17).

    - Criminals: each gang's crime decision in its own open district against
      its stated chance of inspection there: delta = 10 - 40 p.
    - Government: the Chief's inspection decision in each inspectable
      district against its stated chance of crime there: delta = 15 q - 4.
    A seat-run whose fit separates (every move a best response) is left out
    and counted.
    """
    out = []
    for run in runs:
        fc = {(f["day"], f["player"], f["event"], f["district"]): f["p"] for f in run.forecasts if f["p"] is not None}
        crim, gov = [], []
        for r in run.district_days:
            if not r["open"]:
                continue
            p = fc.get((r["day"], r["gang"], "p_inspect", r["district"]))
            if p is not None and not r["gang_fallback"]:
                crim.append((choice.gang_delta(p), r["crime"]))
            q = fc.get((r["day"], "Chief", "p_crime", r["district"]))
            if q is not None and r["inspectable"] and not r["chief_fallback"]:
                gov.append((choice.police_delta(q), r["inspected"]))
        for seat, pairs in (("Criminals", crim), ("Government", gov)):
            if len(pairs) < 10:
                continue
            fit = choice.fit_lambda(pairs)
            out.append({"run": run.id, "triple": run.info.get("triple"), "seat": seat,
                        "model": (run.info.get("seating") or {}).get(seat), "value": fit["lambda"], "separated": fit["separated"]})
    return [r for r in out if not r["separated"]]


def omega_squared(rows):
    """Omega-squared of model and of seat in an additive two-way ANOVA on
    seat-run values. Main-effect sums of squares are exact here because the
    Latin square makes model and seat orthogonal."""
    n = len(rows)
    grand = sum(r["value"] for r in rows) / n
    ss_total = sum((r["value"] - grand) ** 2 for r in rows)

    def ss(key):
        g = defaultdict(list)
        for r in rows:
            g[r[key]].append(r["value"])
        return sum(len(v) * (sum(v) / len(v) - grand) ** 2 for v in g.values()), len(g) - 1

    ss_m, df_m = ss("model")
    ss_s, df_s = ss("seat")
    df_e = n - 1 - df_m - df_s
    ms_e = max(ss_total - ss_m - ss_s, 0.0) / df_e if df_e > 0 else float("nan")
    w = lambda s, d: (s - d * ms_e) / (ss_total + ms_e) if ss_total + ms_e > 0 else 0.0
    return {"model": w(ss_m, df_m), "seat": w(ss_s, df_s)}


def h6(rows, resamples=RESAMPLES, seed=SEED):
    """H6: does the model explain more than the seat? The difference
    omega2(model) - omega2(seat), with a 95% interval from the triple
    bootstrap. Confirmed when the interval excludes 0; its sign says which
    explains more. p is two-sided."""
    triples = _triples(rows)
    if len(triples) < 2:
        raise ValueError("need at least 2 triples to resample")
    w = omega_squared(rows)
    rng = random.Random(seed)
    diffs = []
    for _ in range(resamples):
        pick = [r for _ in triples for r in rng.choice(triples)]
        b = omega_squared(pick)
        diffs.append(b["model"] - b["seat"])
    low, high = _percentile(diffs, 0.025), _percentile(diffs, 0.975)
    above = sum(d > 0 for d in diffs) / resamples
    return {"omega2_model": w["model"], "omega2_seat": w["seat"], "difference": w["model"] - w["seat"],
            "low": low, "high": high, "clears": low > 0 or high < 0, "p": min(1.0, 2 * min(above, 1 - above)),
            "rows": len(rows), "triples": len(triples)}
