"""H1, H2b and H6: the tests that work on one number per run or per seat-run,
not on a mixed model. Standard library only, so they run in CI.

All three treat the triple as the unit (#17): a triple is the 3 runs that
share a seed and rotate the models through the seats. H1 and H6 resample
whole triples, so every resample stays a balanced Latin square; H2b tests
the 9 triple means. Seed 2026, 10,000 resamples
(docs/preregistration-analysis.md). With only 9 triples, percentile
intervals run slightly too narrow, by about sqrt(8/9).

Every row builder takes with_fallbacks: False leaves out what a fallback
decided (rules 7), the same way in every test.
"""

import math
import random
from collections import Counter, defaultdict

from analysis import data
from analysis.metrics import beliefs, choice, predictability
from analysis.metrics.glm import _solve
from analysis.stats.tdist import t_quantile, t_two_sided_p

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


def _seat_family(run, seat):
    return (run.info.get("seating") or {}).get(seat)


# ---------------------------------------------------------------- H1

def respect_shares(runs, with_fallbacks=True):
    """One row per run: the share of individual gang-day moves that are
    Respect (each gang's choice counts once a day, so 2 x days moves).
    This is the individual rate, not the joint both-respect rate."""
    out = []
    for run in runs:
        moves = [r[g] for r in run.turf for g in data.GANGS if with_fallbacks or not r.get(f"{g}_fallback")]
        if moves:
            out.append({"run": run.id, "triple": run.info.get("triple"), "family": _seat_family(run, "Criminals"),
                        "share": sum(m == "respect" for m in moves) / len(moves)})
    return out


def h1(rows, resamples=RESAMPLES, seed=SEED, line=0.5):
    """H1: gangs respect turf more than half the time.

    The statistic is the mean of the run-level shares of individual gang-day
    Respect moves. 0.50 is a statistical benchmark (a gang choosing by coin
    flip), not a boundary from the theory. Confirmed when the one-sided 95%
    lower bound (the 5th percentile of the triple bootstrap) is above `line`.
    Also returns the two-sided 95% interval.
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

def history_gains(runs, warmup=5, with_fallbacks=True):
    """One row per run: predictability.history_gain on that run's inspection
    log. Only inspectable open district-days are scored, the same base as
    H2a; closed and bribed districts still count as history (not inspected).
    Without fallbacks, district-days whose inspections a fallback chose
    aren't scored either."""
    out = []
    for run in runs:
        by_day = defaultdict(dict)
        for r in run.district_days:
            by_day[r["day"]][r["district"]] = r
        days = [by_day[d] for d in sorted(by_day)]
        insp = [[bool(day.get(x, {}).get("inspected")) for x in data.DISTRICTS] for day in days]
        crime = [[bool(day.get(x, {}).get("crime")) for x in data.DISTRICTS] for day in days]
        mask = [[bool(day.get(x, {}).get("open")) and bool(day.get(x, {}).get("inspectable"))
                 and (with_fallbacks or not day.get(x, {}).get("chief_fallback")) for x in data.DISTRICTS] for day in days]
        if len(days) > warmup + 1:
            g = predictability.history_gain(insp, crime, warmup, score_mask=mask)
            if g["days_scored"]:
                out.append({"run": run.id, "triple": run.info.get("triple"), "family": _seat_family(run, "Government"),
                            "gain": g["gain_per_district_day"]})
    return out


def h2b(rows):
    """H2b: inspections are predictable from yesterday.

    The runs in a triple share a seed, so the test is on the triple means of
    the run-level gains: their mean, a t test with (triples - 1) degrees of
    freedom, and a one-sided p for a gain above 0. Confirmed when p < 0.05
    (before Holm). With no spread between triples, a mean above 0 gives
    p = 0, and a mean at or below 0 gives p = 1.
    """
    triples = _triples(rows)
    n = len(triples)
    if n < 2:
        raise ValueError("need at least 2 triples")
    means = [sum(r["gain"] for r in t) / len(t) for t in triples]
    mean = sum(means) / n
    sd = (sum((g - mean) ** 2 for g in means) / (n - 1)) ** 0.5
    se = sd / n ** 0.5
    if se == 0:
        t, p = (float("inf"), 0.0) if mean > 0 else (float("-inf") if mean < 0 else 0.0, 1.0)
    else:
        t = mean / se
        p_two = t_two_sided_p(t, n - 1)
        p = p_two / 2 if t > 0 else 1 - p_two / 2
    half = t_quantile(0.975, n - 1) * se
    return {"estimate": mean, "se": se, "low": mean - half, "high": mean + half, "t": t, "df": n - 1, "p": p,
            "clears": p < 0.05, "runs": len(rows), "triples": n}


# ---------------------------------------------------------------- H6

def brier_skill_rows(runs, with_fallbacks=True):
    """One row per seat per run: Brier skill of the seat's players, on the
    forecasts the scoring rule counts (#66). All 3 seats (#17)."""
    out = []
    for run in runs:
        by_seat = defaultdict(list)
        for f in run.forecasts:
            if f["scored"] and f["p"] is not None and (with_fallbacks or not f.get("fallback_day")):
                by_seat[f["seat"]].append((f["p"], f["outcome"]))
        for seat, pairs in sorted(by_seat.items()):
            skill = beliefs.brier_skill(pairs)
            if skill == skill:  # nan when the base rate is 0 or 1
                out.append({"run": run.id, "triple": run.info.get("triple"), "seat": seat,
                            "model": _seat_family(run, seat), "value": skill})
    return out


def lambda_rows(runs, with_fallbacks=True):
    """One row per seat per run: the logit-choice lambda (choice.fit_lambda),
    for Government and Criminals only (the World has no payoff, #17).

    - Criminals: each gang's crime decision in its own open district against
      its stated chance of inspection there: delta = 10 - 40 p.
    - Government: the Chief's inspection decision in each inspectable
      district against its stated chance of crime there: delta = 15 q - 4.

    Each row carries `separated`: every move was a best response, so lambda
    runs away. h6 leaves those rows out and counts them (separated_by_model).

    From Pechon-Elkins and Chun 2026 (arXiv 2603.10029), where silent parser
    defaults faked up to 30% of one game's rows:
    - `valid_share`: the share of the seat-run's decisions the player made
      itself, not a fallback. A seat-run under MIN_VALID_SHARE is marked
      `too_few_valid`; h6 leaves it out and counts it by model.
    - Without fallbacks, a day where any of the Chief or the gangs fell back
      is dropped for both seats, so one side's default can't shape the other
      side's rows.
    - `lambda_norm` is lambda times the standard deviation of delta in the
      seat-run, so it has no payoff units, and `ll_gain` is the log-likelihood
      gain of the logit fit over a fixed-propensity baseline (the seat-run's
      own action rate, ignoring beliefs).
    """
    out = []
    for run in runs:
        fc = {(f["day"], f["player"], f["event"], f["district"]): f["p"] for f in run.forecasts if f["p"] is not None}
        fell_back = {r["day"] for r in run.district_days if r["gang_fallback"] or r["chief_fallback"]}
        crim, gov = [], []
        own = {"Criminals": [0, 0], "Government": [0, 0]}  # [made by the player, all]
        for r in run.district_days:
            if not r["open"]:
                continue
            if not with_fallbacks and r["day"] in fell_back:
                continue
            p = fc.get((r["day"], r["gang"], "p_inspect", r["district"]))
            if p is not None:
                own["Criminals"][1] += 1
                own["Criminals"][0] += 0 if r["gang_fallback"] else 1
                crim.append((choice.gang_delta(p), r["crime"]))
            q = fc.get((r["day"], "Chief", "p_crime", r["district"]))
            if q is not None and r["inspectable"]:
                own["Government"][1] += 1
                own["Government"][0] += 0 if r["chief_fallback"] else 1
                gov.append((choice.police_delta(q), r["inspected"]))
        for seat, pairs in (("Criminals", crim), ("Government", gov)):
            if len(pairs) < 10:
                continue
            fit = choice.fit_lambda(pairs)
            share = own[seat][0] / own[seat][1]
            deltas = [d for d, _ in pairs]
            mean_d = sum(deltas) / len(deltas)
            sd = (sum((d - mean_d) ** 2 for d in deltas) / len(deltas)) ** 0.5
            rate = sum(1 for _, a in pairs if a) / len(pairs)
            ll0 = 0.0 if rate in (0.0, 1.0) else len(pairs) * (rate * math.log(rate) + (1 - rate) * math.log(1 - rate))
            out.append({"run": run.id, "triple": run.info.get("triple"), "seat": seat,
                        "model": _seat_family(run, seat), "value": fit["lambda"], "separated": fit["separated"],
                        "valid_share": share, "too_few_valid": share < MIN_VALID_SHARE,
                        "lambda_norm": fit["lambda"] * sd, "ll_gain": fit["loglik"] - ll0})
    return out


# A seat-run whose own moves are fewer than half its decisions leaves the
# lambda test (Pechon-Elkins and Chun 2026, arXiv 2603.10029, used 50%).
MIN_VALID_SHARE = 0.5


def too_few_valid_by_model(rows):
    """How many seat-runs h6 leaves out for too few valid moves, by model."""
    return dict(Counter(r["model"] for r in rows if r.get("too_few_valid")))


def separated_by_model(rows):
    """How many seat-runs h6 leaves out because their lambda fit separated, by model."""
    return dict(Counter(r["model"] for r in rows if r.get("separated")))


def _rss(rows, factors):
    """Residual sum of squares of a least-squares fit of value on the
    dummy-coded factors (with an intercept)."""
    levels = {f: sorted({r[f] for r in rows}, key=str)[1:] for f in factors}
    X = [[1.0] + [float(r[f] == lv) for f in factors for lv in levels[f]] for r in rows]
    y = [r["value"] for r in rows]
    k = len(X[0])
    xtx = [[sum(x[i] * x[j] for x in X) for j in range(k)] for i in range(k)]
    xty = [sum(x[i] * v for x, v in zip(X, y)) for i in range(k)]
    try:
        b = _solve(xtx, xty)
    except ValueError:  # a level that never varies with the other factor
        b = _solve([[xtx[i][j] + (1e-9 if i == j else 0.0) for j in range(k)] for i in range(k)], xty)
    return sum((v - sum(bi * xi for bi, xi in zip(b, x))) ** 2 for x, v in zip(X, y)), k


def omega_squared(rows):
    """Omega-squared of model and of seat in an additive two-way ANOVA on
    seat-run values, with Type II sums of squares from least-squares fits:
    each factor's sum of squares is what it adds over the other factor. This
    stays right when rows are missing and the square is no longer balanced."""
    n = len(rows)
    grand = sum(r["value"] for r in rows) / n
    ss_total = sum((r["value"] - grand) ** 2 for r in rows)
    rss_full, k_full = _rss(rows, ["model", "seat"])
    rss_m, _ = _rss(rows, ["model"])
    rss_s, _ = _rss(rows, ["seat"])
    df_m = len({r["model"] for r in rows}) - 1
    df_s = len({r["seat"] for r in rows}) - 1
    df_e = n - k_full
    ms_e = rss_full / df_e if df_e > 0 else float("nan")
    ss_m, ss_s = max(rss_s - rss_full, 0.0), max(rss_m - rss_full, 0.0)
    w = lambda s, d: (s - d * ms_e) / (ss_total + ms_e) if ss_total + ms_e > 0 else 0.0
    return {"model": w(ss_m, df_m), "seat": w(ss_s, df_s)}


def omega_squared_interaction(rows):
    """Exploratory: omega-squared of the model x seat interaction, the
    variation left after both main effects that the 9 (model, seat) cells
    explain (Type II: what the cell means add over the additive fit). From
    Shi et al. 2026 (arXiv 2607.05132), where mixed-model groups kept fixed
    payoff gaps: does a model do better in some seats than others?"""
    cells = [dict(r, cell=f'{r["model"]}|{r["seat"]}') for r in rows]
    n = len(rows)
    grand = sum(r["value"] for r in rows) / n
    ss_total = sum((r["value"] - grand) ** 2 for r in rows)
    rss_add, k_add = _rss(rows, ["model", "seat"])
    rss_cell, k_cell = _rss(cells, ["cell"])
    df_i, df_e = k_cell - k_add, n - k_cell
    if df_i <= 0 or df_e <= 0:
        return float("nan")
    ms_e = rss_cell / df_e
    ss_i = max(rss_add - rss_cell, 0.0)
    return (ss_i - df_i * ms_e) / (ss_total + ms_e) if ss_total + ms_e > 0 else 0.0


def h6(rows, resamples=RESAMPLES, seed=SEED):
    """H6: does the model explain more than the seat? The difference
    omega2(model) - omega2(seat), with a 95% interval from the triple
    bootstrap. Confirmed when the interval excludes 0; its sign says which
    explains more. p is two-sided. Rows whose lambda fit separated are left
    out and counted by model."""
    left_out = separated_by_model(rows)
    too_few = too_few_valid_by_model(rows)
    rows = [r for r in rows if not r.get("separated") and not r.get("too_few_valid")]
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
    return {"omega2_model": w["model"], "omega2_seat": w["seat"], "estimate": w["model"] - w["seat"],
            "difference": w["model"] - w["seat"], "low": low, "high": high, "clears": low > 0 or high < 0,
            "p": min(1.0, 2 * min(above, 1 - above)), "rows": len(rows), "triples": len(triples),
            "separated_left_out": left_out, "too_few_valid_left_out": too_few,
            "omega2_model_x_seat": omega_squared_interaction(rows)}  # exploratory, not in Holm
