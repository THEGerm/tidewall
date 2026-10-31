"""Families compared within a seat, with the run as the cluster, and the
multiple-comparison tiers.

PROVISIONAL. Each run gives one number per measure (its rate), so days within
a run never count as independent. Family means get a t interval over runs and
each pair of families a Welch t comparison. This stands in for the run-level
mixed model until Germ and Shazz pick the library (statsmodels or a Bayesian
package). With one run per family the interval is undefined (NaN).

Tiers (issue #17): the confirmatory tests get Holm; the exploratory family
comparisons get Benjamini-Hochberg. Each row names its tier and method.
"""

from collections import defaultdict
from itertools import combinations

from analysis.metrics import multiple

from .tdist import mean_interval, welch

PROVISIONAL = "provisional: run-level t, until the mixed model is chosen"


def run_level_values(rate_rows, turf_rows=(), welfare_rows=(), belief_rows=()):
    """One value per (measure, seat, family, run) from the per-run tables."""
    vals = []
    for r in rate_rows:
        if r["sample"] == "all" and r["player"] in ("Families and Saltdogs", "Chief", "Council") and r["n"]:
            vals.append((r["measure"] + " rate", r["seat"], r["family"], r["run"], r["rate"]))
    coop = defaultdict(list)
    for r in turf_rows:
        if r["days"]:
            coop[(r["family"], r["run"])].append(r["cooperation"])
    for (fam, rid), xs in coop.items():
        vals.append(("cooperation", "Criminals", fam, rid, sum(xs) / len(xs)))
    for r in welfare_rows:
        if r["sample"] == "all" and r["days"]:
            # Welfare belongs to no single seat; compared by the Government's family.
            vals.append(("welfare share (by Government family)", "Government", r["seating"].split()[0][2:], r["run"], r["share"]))
    for r in belief_rows:
        if r["event"] == "all" and r["sample"] == "all" and r["brier_skill"] == r["brier_skill"]:
            vals.append(("brier skill, " + r["player"], r["seat"], r["family"], r["run"], r["brier_skill"]))
    return vals


def family_within_seat(values, alpha=0.05):
    """values: (measure, seat, family, run, value) tuples.

    Returns (means, pairs): a run-level mean with a t interval per (measure,
    family), and Welch comparisons for every pair of families within a
    measure, with BH q-values across all pairs (exploratory tier).
    """
    cells = defaultdict(list)
    for measure, seat, fam, _rid, v in values:
        cells[(measure, seat, fam)].append(v)
    means = []
    for (measure, seat, fam), xs in sorted(cells.items(), key=lambda kv: [str(x) for x in kv[0]]):
        m = mean_interval(xs)
        means.append({"measure": measure, "seat": seat, "family": fam, "runs": m["n"], "mean": m["mean"],
                      "sd": m["sd"], "low": m["low"], "high": m["high"], "note": PROVISIONAL})
    by_measure = defaultdict(dict)
    for (measure, seat, fam), xs in cells.items():
        by_measure[(measure, seat)][fam] = xs
    pairs = []
    for (measure, seat), fams in sorted(by_measure.items()):
        for a, b in combinations(sorted(fams, key=str), 2):
            w = welch(fams[a], fams[b])
            pairs.append({"measure": measure, "seat": seat, "family_a": a, "family_b": b, "diff_a_minus_b": w["diff"],
                          "low": w["low"], "high": w["high"], "t": w["t"], "df": w["df"], "p": w["p"],
                          "runs_a": w["n_x"], "runs_b": w["n_y"], "tier": "exploratory", "method": "Benjamini-Hochberg",
                          "note": PROVISIONAL})
    ps = {i: r["p"] for i, r in enumerate(pairs) if r["p"] == r["p"]}
    adj = multiple.benjamini_hochberg(ps, alpha) if ps else {}
    for i, r in enumerate(pairs):
        r["q"] = adj[i]["q"] if i in adj else float("nan")
        r["reject"] = adj[i]["reject"] if i in adj else None
    return means, pairs


def confirmatory(pooled_rates, turf_rows, alpha=0.05):
    """The confirmatory tests the data can run today, Holm-adjusted together.

    H2: police over-inspect, one-sided z of the pooled inspection rate above
        25%, per Government family (pooled district-days: provisional).
    H4: no end-game drop; the permutation test's p for a falling cooperation
        slope, per gang per run. A small p is evidence against H4.
    H1, H3, H5 and H6 are reported descriptively elsewhere (turf, bribes) or
    need inputs the exports don't have yet (H5: tone labels; H6: the mixed
    model).
    """
    tests = {}
    for r in pooled_rates:
        if r["measure"] == "inspection" and r["sample"] == "all":
            tests[f"H2 over-inspection, Government={r['family']}"] = (r["p_above_target"], r)
    for r in turf_rows:
        if r["p_drop"] == r["p_drop"]:
            tests[f"H4 end-game drop, {r['run']} {r['player']}"] = (r["p_drop"], r)
    if not tests:
        return []
    adj = multiple.holm({k: v[0] for k, v in tests.items()}, alpha)
    out = []
    for name, (p, src) in tests.items():
        est = src.get("rate", src.get("slope_per_day"))
        out.append({"test": name, "estimate": est, "p": p, "holm_adjusted": adj[name]["adjusted"],
                    "reject": adj[name]["reject"], "tier": "confirmatory", "method": "Holm",
                    "note": "provisional: H2 pools district-days over runs, H4 is one test per gang per run"})
    return sorted(out, key=lambda r: r["test"])
