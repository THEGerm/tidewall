"""Fit the confirmatory models on run exports and print the decisions.

    python -m analysis.bayes data/runs/study/*.json            # pre-registered sampler
    python -m analysis.bayes data/runs/test/*.json --quick     # a fast look

Needs the packages in analysis/bayes/requirements.txt. Models whose data is
missing in the runs given (no bribes offered, one run only) are skipped and
say why.
"""

import argparse
import sys

from analysis import data
from analysis.bayes import decide, models


def main(argv):
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("exports", nargs="+")
    ap.add_argument("--quick", action="store_true", help="500 draws, 2 chains: for a look, not for the paper")
    ap.add_argument("--without-fallbacks", action="store_true", help="drop rows where a fallback acted (rules 7)")
    a = ap.parse_args(argv)
    runs = data.load_all(a.exports)
    kw = {"draws": 500, "tune": 500, "chains": 2} if a.quick else {}
    keep = not a.without_fallbacks
    results = {}
    for name, build, rule in (("H2a", models.h2a_inspection, decide.h2a), ("H3", models.h3_bribes, decide.h3), ("H4", models.h4_turf, decide.h4)):
        try:
            post = models.fit(build(runs, with_fallbacks=keep), **kw)
        except Exception as e:  # too little data in these runs for this model
            print(f"{name}: skipped ({e})")
            continue
        results |= rule(post)
    print("H5: needs the judges' tone coding (#13); not fitted here.")
    if not results:
        return 1
    print("Log-odds scale. An effect clears when its 95% interval lies wholly past the threshold, in the predicted direction.")
    print(f"{'effect':<24}{'median':>8}{'95% low':>9}{'95% high':>9}{'threshold':>11}{'p_d':>7}{'Holm':>7}  clears")
    for k, v in decide.confirm(results).items():
        side = ">" if v["direction"] == "above" else "<"
        print(f"{k:<24}{v['estimate']:>8.2f}{v['low']:>9.2f}{v['high']:>9.2f}{side + format(v['threshold'], '.2f'):>11}{v['p_d']:>7.3f}{v['holm']:>7.3f}  {'yes' if v['clears'] else 'no'}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
