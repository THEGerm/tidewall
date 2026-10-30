"""Print the power grid: python3 -m analysis.power [--sims N]"""

import argparse

from .sim import DESIGNS, grid


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--sims", type=int, default=1000)
    ap.add_argument("--seed", type=int, default=2026)
    args = ap.parse_args()
    names = list(DESIGNS)
    print("Power to detect a model effect on gang cooperation (one-way ANOVA on run rates, alpha 0.05)")
    print(f"{args.sims} simulated studies per cell, seed {args.seed}. Base cooperation 60%.")
    print("spread = logit gap between most and least cooperative model; run_sd = run-to-run noise (logit)\n")
    print(f"{'run_sd':>6} {'spread':>6}  " + "  ".join(f"{n:>32}" for n in names))
    for row in grid(sims=args.sims, seed=args.seed):
        print(f"{row['run_sd']:>6} {row['spread']:>6}  " + "  ".join(f"{row[n]:>32.2f}" for n in names))


if __name__ == "__main__":
    main()
