"""Collect the judges' tone codes for H5 from the saved judge files.

    python -m analysis.bayes.collect_tones data/judges/study-*.json > tones.json
    python -m analysis.bayes data/runs/study/*.json --tones tones.json

The judge runner (worker/src/judges, #112) saves each run's codes to
data/judges/<run>.json; their "tones" list is already in the format
judges.tone_rows reads, one row per judge per Wire item, with item IDs that
carry the run ID. This only joins the lists. Standard library only.
"""

import json
import sys


def collect(paths):
    rows, incomplete = [], []
    for p in paths:
        with open(p) as f:
            j = json.load(f).get("judges") or {}
        if not j.get("complete"):
            incomplete.append(p)
        rows.extend(j.get("tones") or [])
    return rows, incomplete


def main(argv):
    rows, incomplete = collect(argv)
    for p in incomplete:
        print(f"warning: {p} isn't fully judged", file=sys.stderr)
    json.dump(rows, sys.stdout, indent=1)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
