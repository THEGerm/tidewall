"""Fit the confirmatory tests on run exports and print the decisions.

    python -m analysis.bayes data/runs/study/*.json                       # as pre-registered
    python -m analysis.bayes data/runs/study/*.json --without-fallbacks   # the second pass (rules 7)
    python -m analysis.bayes data/runs/test/*.json --quick                # a fast look

Needs the packages in analysis/bayes/requirements.txt. Every confirmatory test
enters Holm (decide.confirm). A Bayesian fit climbs the ladder in
models.fit_checked; a test whose fit fails every rung stays in Holm at p = 1.
A test the runs given can't support (no bribes offered, one triple, no judge
codes) enters Holm at p = 1 with all its entries (Germ, 1 Nov): the family
always has 11 entries. H5 is fitted from the judges' codes (--tones, the JSON
the judge runner writes); if their agreement on tone is below 0.70, H5 stays
in Holm at p = 1.
"""

import argparse
import functools
import json
import sys

from analysis import data
from analysis.bayes import decide, judges, models, run_level


def main(argv):
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("exports", nargs="+")
    ap.add_argument("--quick", action="store_true", help="500 draws, 2 chains, no ladder: for a look, not for the paper")
    ap.add_argument("--without-fallbacks", action="store_true", help="leave out what a fallback decided, in every test (rules 7)")
    ap.add_argument("--resamples", type=int, default=run_level.RESAMPLES)
    ap.add_argument("--tones", help="the judges' tone codes, one per judge per Wire item (JSON list), for H5")
    a = ap.parse_args(argv)
    runs = data.load_all(a.exports)
    # Only the 27 study runs count: study models in triples 1 to 9. A smoke
    # test or a test run passed in by mistake is left out and named.
    dropped = [r.id for r in runs if not data.is_study_run(r)]
    runs = [r for r in runs if data.is_study_run(r)] if any(data.is_study_run(r) for r in runs) else runs
    if dropped and any(data.is_study_run(r) for r in runs):
        print("left out (not a study run in triples 1 to 9): " + ", ".join(dropped))
    keep = not a.without_fallbacks
    kw = {"draws": 500, "tune": 500, "chains": 2} if a.quick else {}
    results, skipped = {}, []

    def skip(test, reason):
        skipped.append(f"{test}: {reason}")
        results.update(decide.skipped(test, reason))

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
            skip(name, str(e))
            continue
        results |= rule(post) if post is not None else decide.unreliable(name, log)

    # H5, from the judges' codes.
    if not a.tones:
        skip("H5", "no judge codes given (--tones)")
    else:
        rows, alpha = judges.tone_rows(json.load(open(a.tones)))
        print(f"Judge agreement on tone (Krippendorff's ordinal alpha): {alpha:.3f}")
        if not alpha >= judges.TONE_ALPHA_MIN:
            results |= decide.h5_unreliable_judges(alpha)
        else:
            occupied = sorted({(r["world_family"], r["holder_family"], r["seat"]) for r in rows})
            try:
                bound = functools.partial(models.h5_tone, rows)
                post, log = (models.fit(bound(), **kw), []) if a.quick else models.fit_checked(bound, **kw)
                results |= decide.h5(post, occupied) if post is not None else decide.unreliable("H5", log)
            except Exception as e:
                skip("H5", str(e))

    # The run-level tests (H1, H2b, H6).
    lam = run_level.lambda_rows(runs, keep)
    for name, go in (
        ("H1", lambda: run_level.h1(run_level.respect_shares(runs, keep), a.resamples)),
        ("H2b", lambda: run_level.h2b(run_level.history_gains(runs, with_fallbacks=keep))),
        ("H6 Brier skill", lambda: run_level.h6(run_level.brier_skill_rows(runs, keep), a.resamples)),
        ("H6 lambda", lambda: run_level.h6(lam, a.resamples)),
    ):
        try:
            results[name] = go()
        except ValueError as e:
            skip(name, str(e))

    # Every confirmatory entry is in the family, even one these runs can't
    # fill (for example a Government family that never played): p = 1.
    for test, keys in decide.ENTRIES.items():
        for k in keys:
            if k not in results:
                results.update({k: decide.not_decided(test, "not confirmed (no data)")[k]})

    sep = run_level.separated_by_model(lam)
    print("Seat-runs left out of H6 lambda because the fit separated: "
          + (", ".join(f"{m} {n}" for m, n in sorted(sep.items())) if sep else "none"))
    few = run_level.too_few_valid_by_model(lam)
    print(f"Seat-runs left out of H6 lambda with under {run_level.MIN_VALID_SHARE:.0%} of moves their own: "
          + (", ".join(f"{m} {n}" for m, n in sorted(few.items())) if few else "none"))
    for r in lam:  # Pechon-Elkins and Chun 2026: lambda without units, and against a beliefs-free baseline
        print(f"lambda {r['run']:<20}{r['seat']:<11}{r['model']:<7}lambda {r['value']:.3f}  "
              f"normalized {r['lambda_norm']:.3f}  gain over base rate {r['ll_gain']:.1f}  own moves {r['valid_share']:.0%}")
    for s in skipped:
        print(f"skipped (in Holm at p = 1)  {s}")
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
