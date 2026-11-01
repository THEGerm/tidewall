"""Fit the confirmatory tests on run exports and print the decisions.

    python -m analysis.bayes data/runs/study/*.json                       # as pre-registered
    python -m analysis.bayes data/runs/study/*.json --without-fallbacks   # the second pass (rules 7)
    python -m analysis.bayes data/runs/test/*.json --quick                # a fast look

Needs the packages in analysis/bayes/requirements.txt. Every confirmatory test
enters Holm (decide.confirm). A Bayesian fit climbs the ladder in
models.fit_checked; a test whose fit fails every rung stays in Holm at p = 1.
A test the runs given can't support (no bribes offered, one triple) is listed
as skipped; on the study data that would be reported, not dropped. H5 needs
the judges' codes and is fitted by the judge pipeline (#112).
"""

import argparse
import functools
import sys

from analysis import data
from analysis.bayes import decide, models, run_level


def main(argv):
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("exports", nargs="+")
    ap.add_argument("--quick", action="store_true", help="500 draws, 2 chains, no ladder: for a look, not for the paper")
    ap.add_argument("--without-fallbacks", action="store_true", help="leave out what a fallback decided, in every test (rules 7)")
    ap.add_argument("--resamples", type=int, default=run_level.RESAMPLES)
    a = ap.parse_args(argv)
    runs = data.load_all(a.exports)
    keep = not a.without_fallbacks
    kw = {"draws": 500, "tune": 500, "chains": 2} if a.quick else {}
    results, skipped = {}, []

    # The mixed models (H2a, H3, H4), each up the fit ladder.
    for name, build, rule in (("H2a", models.h2a_inspection, decide.h2a), ("H3 departures", models.h3_departures, decide.h3_departures),
                              ("H3", models.h3_bribes, decide.h3), ("H4", models.h4_turf, decide.h4)):
        try:
            bound = functools.partial(build, runs, with_fallbacks=keep)
            if a.quick:
                post, log = models.fit(bound(), **kw), []
            else:
                post, log = models.fit_checked(bound, **kw)
        except Exception as e:  # too little data in these runs for this model
            skipped.append(f"{name}: {e}")
            continue
        results |= rule(post) if post is not None else decide.unreliable(name, log)

    # The run-level tests (H1, H2b, H6).
    for name, go in (
        ("H1", lambda: run_level.h1(run_level.respect_shares(runs, keep), a.resamples)),
        ("H2b", lambda: run_level.h2b(run_level.history_gains(runs, with_fallbacks=keep))),
        ("H6 Brier skill", lambda: run_level.h6(run_level.brier_skill_rows(runs, keep), a.resamples)),
        ("H6 lambda", lambda: run_level.h6(run_level.lambda_rows(runs, keep), a.resamples)),
    ):
        try:
            results[name] = go()
        except ValueError as e:
            skipped.append(f"{name}: {e}")

    print("H5: fitted from the judges' codes (#112), not from exports.")
    for s in skipped:
        print(f"skipped  {s}")
    if not results:
        return 1
    print(f"{'test':<26}{'estimate':>10}{'95% low':>9}{'95% high':>9}{'p':>8}{'Holm':>8}  result")
    for k, v in decide.confirm(results).items():
        est, lo, hi = v.get("estimate", float("nan")), v.get("low", float("nan")), v.get("high", float("nan"))
        if v.get("measure"):
            print(f"{k:<26}{est:>10.3f}{lo:>9.3f}{hi:>9.3f}{'':>8}{'':>8}  measure")
            continue
        verdict = v.get("note") or ("confirmed" if v.get("clears") and v.get("holm_reject") else "not confirmed")
        print(f"{k:<26}{est:>10.3f}{lo:>9.3f}{hi:>9.3f}{v['p']:>8.3f}{v['holm']:>8.3f}  {verdict}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
