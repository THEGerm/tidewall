import argparse

from . import build


def main(argv=None):
    ap = argparse.ArgumentParser(prog="python3 -m analysis.worksheets",
                                 description="Write the paper's worksheets (CSV) from run exports.")
    ap.add_argument("exports", nargs="+", help="run export JSON files (/api/runs/:id/export)")
    ap.add_argument("--out", required=True, help="output directory (not committed)")
    args = ap.parse_args(argv)
    counts = build(args.exports, args.out)
    for name, n in counts.items():
        print(f"{name}.csv  {n} rows")
    print(f"README.md  data dictionary, in {args.out}")


if __name__ == "__main__":
    main()
