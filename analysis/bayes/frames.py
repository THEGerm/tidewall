"""Rows for the Bayesian models, built from analysis.data runs.

Standard library only, so the tests for these run in CI; models.py turns the
rows into pandas frames. One function per model, each returning a list of
dicts with plain columns: the outcome, the predictors and the grouping
factors (run, triple).

Fallback rows are kept with a flag (`fallback`), so every model can be fitted
with and without them (rules section 7; decided 31 Oct).
"""

from collections import defaultdict
from analysis.metrics import equilibrium as eq

# #12, decided 31 Oct: the Chief counts crime damage, so an accepted bribe must
# clear 100 a + 11 (one source: analysis.metrics.equilibrium, from the solver).
ACCEPT_MARGIN = float(eq.accept_margin())
MIN_DAYS = 12  # rules section 6, decided 31 Oct: continuation is certain before day 12


def _triple(run):
    return str(run.info.get("triple", ""))


def _family(run, seat):
    return (run.info.get("seating") or {}).get(seat, "")


def inspections(runs):
    """H2a: one row per inspectable open district-day (no accepted bribe).
    y = inspected. Over-inspection means the rate sits above 1/4."""
    out = []
    for run in runs:
        for r in run.district_days:
            if r["open"] and r["inspectable"]:
                out.append({"y": int(r["inspected"]), "family": _family(run, "Government"), "run": run.id,
                            "triple": _triple(run), "day": r["day"], "fallback": bool(r["chief_fallback"])})
    return out


def bribe_answers(runs, prior_weight=10, margin=ACCEPT_MARGIN):
    """H3 (decided 31 Oct): the Chief should never accept a bribe unless
    b > 100 a + 11; we measure how often, and by how much, it departs from that.
    One row per offered open district-day. y = accepted; departs = 1 when the
    answer goes against that rule (accepting at delta <= 0, or refusing at
    delta > 0).

    a_hat is the Council's per-district audit rate up to the day before,
    Laplace-smoothed toward 0.10 with `prior_weight` pseudo district-days, as
    analysis/stats/measures.py does (#17, #66). delta is the Chief's gain from
    accepting at a_hat: b - 100 a_hat - margin (margin 11 under the #12 mark).
    A Chief that follows its payoff accepts more as delta rises.
    """
    out = []
    for run in runs:
        by_day = defaultdict(list)
        for r in run.district_days:
            by_day[r["day"]].append(r)
        audits = opened = 0
        for day in sorted(by_day):
            a_hat = (audits + float(eq.AUDIT_LINE) * prior_weight) / (opened + prior_weight)
            for r in by_day[day]:
                if r["open"] and r["bribe_offered"]:
                    b = r["bribe_amount"]
                    delta = b - eq.BRIBE_PENALTY * a_hat - margin
                    acc = bool(r["bribe_accepted"])
                    out.append({"y": int(acc), "amount": b, "a_hat": a_hat, "delta": delta,
                                "departs": int(acc != (delta > 0)),
                                "below_line": int(a_hat < float(eq.AUDIT_LINE)),
                                "family": _family(run, "Government"), "run": run.id, "triple": _triple(run),
                                "day": day, "fallback": bool(r["chief_fallback"])})
            for r in by_day[day]:
                if r["open"]:
                    opened += 1
                    audits += int(r["audited"])
    return out


def turf_moves(runs):
    """H4: one row per gang per day from day 2. y = respect.

    Predictors: the day; after_min (1 from day MIN_DAYS on, when continuation
    drops from certain to 0.92, #17); the other gang's and the gang's own move
    yesterday; the Criminal family (both gangs share it).
    """
    out = []
    for run in runs:
        days = sorted(run.turf, key=lambda r: r["day"])
        for prev, cur in zip(days, days[1:]):
            for g, other in (("Families", "Saltdogs"), ("Saltdogs", "Families")):
                out.append({"y": int(cur[g] == "respect"), "day": cur["day"], "after_min": int(cur["day"] >= MIN_DAYS),
                            "their_prev": int(prev[other] == "respect"), "own_prev": int(prev[g] == "respect"),
                            "gang": g, "family": _family(run, "Criminals"), "run": run.id, "triple": _triple(run),
                            "fallback": bool(cur.get(f"{g}_fallback") or prev.get(f"{g}_fallback"))})
    return out


def departures(rows):
    """H3, how often and by how much: per Government family, the share of
    answers that depart from the rule, and for accepted bribes that shouldn't
    have been, the shortfall (100 a + 11 - b), its median and its maximum."""
    by = defaultdict(list)
    for r in rows:
        by[r["family"]].append(r)
    out = {}
    for fam, rs in sorted(by.items()):
        short = sorted(-r["delta"] for r in rs if r["y"] and r["delta"] <= 0)
        out[fam] = {"answers": len(rs), "departures": sum(r["departs"] for r in rs),
                    "share": sum(r["departs"] for r in rs) / len(rs),
                    "accepted_below_rule": len(short),
                    "median_shortfall": short[len(short) // 2] if short else None,
                    "max_shortfall": short[-1] if short else None}
    return out


TONE_COLUMNS = ("tone", "seat", "world_family", "holder_family", "run", "item", "judge")


def tones(items):
    """H5: Wire items as coded by the judges, one row per item per judge.

    Each row needs TONE_COLUMNS: tone in -1, 0 or 1 toward `seat`, the World's
    family, the family holding that seat in the run, and the run, item and
    judge IDs. The judge coding isn't built yet (#13); this checks the rows.
    """
    out = []
    for i, it in enumerate(items):
        missing = [c for c in TONE_COLUMNS if c not in it]
        if missing:
            raise ValueError(f"item {i} lacks {', '.join(missing)}")
        if it["tone"] not in (-1, 0, 1):
            raise ValueError(f"item {i}: tone {it['tone']} is not -1, 0 or 1")
        if it["seat"] not in ("Government", "Criminals"):
            raise ValueError(f"item {i}: tone is toward a seat a model holds, Government or Criminals")
        if it["holder_family"] == it["world_family"]:
            raise ValueError(f"item {i}: the World's family never holds another seat in a run")
        out.append({c: it[c] for c in TONE_COLUMNS} | {"tone_level": str(it["tone"] + 1)})
    return out


def refusals(runs):
    """Refusals: one row per player per day, for every player that plays.
    y = refused steps that day (0 on most days, hence the hurdle model)."""
    out = []
    for run in runs:
        for r in run.player_days:
            out.append({"y": int(r["refusals"]), "player": r["player"], "seat": r["seat"], "family": r["family"],
                        "day": r["day"], "run": run.id, "triple": _triple(run)})
    return out
