"""Worksheets for the paper: CSVs of the tidy tables, the analysis results
and the outlier flags, with a README data dictionary.

    python3 -m analysis.worksheets <export.json ...> --out DIR
"""

import csv
from pathlib import Path

from analysis import data, outliers, stats

from .dictionary import TABLES, describe


def tables(runs):
    """Every worksheet as {name: rows}."""
    rate_run = stats.rates_by_run(runs)
    rate_pool = stats.rates_by_family_seat(runs)
    turf_rows = stats.turf_by_run(runs)
    welfare = stats.welfare_by_run(runs)
    belief_rows = stats.beliefs_by_player(runs) + stats.beliefs_by_player(runs, sample="no_fallback")
    fb = stats.fallbacks(runs)
    cost = stats.costs(runs)
    means, pairs = stats.family_within_seat(stats.run_level_values(rate_run, turf_rows, welfare, belief_rows))
    out = {
        "district_days": [r for run in runs for r in run.district_days],
        "player_days": [r for run in runs for r in run.player_days],
        "forecasts": [r for run in runs for r in run.forecasts],
        "turf_moves": [r for run in runs for r in run.turf],
        "calls": [r for run in runs for r in run.calls],
        "answers": [r for run in runs for r in run.answers],
        "rates_by_run": rate_run,
        "rates_by_family_seat": rate_pool,
        "bribes": stats.bribes(runs),
        "beliefs": belief_rows,
        "turf": turf_rows,
        "turf_sfem": stats.turf_sfem(runs),
        "welfare": welfare,
        "welfare_days": [d for run in runs for d in stats.welfare_days(run)],
        "fallbacks": fb,
        "fallbacks_by_family_seat": _rated(stats.pooled(fb, ["family", "seat"], [
            "answers", "fallbacks", "fallback_refused", "fallback_invalid", "fallback_error", "retries",
            "calls", "failed_calls", "refused_calls", "key_fallback_calls"])),
        "costs": cost,
        "costs_by_family_seat": stats.pooled(cost, ["family", "seat"], [
            "calls", "ok_calls", "input", "cached_input", "cache_write", "output", "reasoning", "cost_usd"]),
        "family_means": means,
        "family_pairs": pairs,
        "confirmatory": stats.confirmatory(rate_pool, turf_rows),
        "outliers": outliers.all_flags(runs),
    }
    return out


def _rated(rows):
    for r in rows:
        r["fallback_rate"] = r["fallbacks"] / r["answers"] if r["answers"] else float("nan")
        r["refusal_rate"] = (r["fallback_refused"] + r["refused_calls"]) / r["calls"] if r["calls"] else float("nan")
        r["key_fallback_rate"] = r["key_fallback_calls"] / r["calls"] if r["calls"] else float("nan")
    return rows


def _cell(v):
    if v is None:
        return ""
    if isinstance(v, float):
        return "" if v != v else repr(round(v, 6))
    if isinstance(v, (list, tuple)):
        return ";".join(map(str, v))
    return v


def columns(rows):
    cols = []
    for r in rows:
        for k in r:
            if k not in cols:
                cols.append(k)
    return cols


def write_csv(path, rows):
    cols = columns(rows)
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore")
        w.writeheader()
        for r in rows:
            w.writerow({k: _cell(r.get(k)) for k in cols})
    return cols


def build(sources, out_dir):
    """Load the exports, write every worksheet and the README. Returns
    {name: row count}."""
    runs = data.load_all(sources)
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    counts, cols = {}, {}
    for name, rows in tables(runs).items():
        cols[name] = write_csv(out / f"{name}.csv", rows)
        counts[name] = len(rows)
    (out / "README.md").write_text(describe(cols, counts, [r.id for r in runs]), encoding="utf-8")
    return counts


__all__ = ["build", "tables", "TABLES"]
