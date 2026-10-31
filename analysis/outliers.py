"""Outliers and anomalies in flattened runs (analysis.data.Run).

Two kinds of flag, each a dict with: level (run, day, call, player), kind,
run, day, player, seq, value, why.

- Robust flags: a value whose modified z-score (Iglewicz and Hoaglin,
  0.6745 (x - median) / MAD) is above 3.5 against its comparison group.
  When the MAD is 0, the mean absolute deviation times 1.2533 stands in;
  when that is 0 too, nothing is flagged. Groups under 5 values are skipped
  (3 for runs, since a seating has few runs).
- Rule flags: patterns the test runs showed (004-germ), which a z-score
  can't see: JSON sent as a text to Sam, a player deleting most of its
  diary, a seat whose move never changes, infrastructure errors in the
  ledger, failed calls, abnormal stop reasons, and engine welfare that
  disagrees with the formula.
"""

import json
from collections import defaultdict

from analysis.stats import measures

THRESHOLD = 3.5
NORMAL_STOP = "done"


def modified_z(values):
    """Modified z-scores of a list of numbers (None for missing values)."""
    xs = sorted(v for v in values if v is not None and v == v)
    if not xs:
        return [None] * len(values)
    n = len(xs)
    med = (xs[n // 2] + xs[(n - 1) // 2]) / 2
    dev = sorted(abs(v - med) for v in xs)
    mad = (dev[n // 2] + dev[(n - 1) // 2]) / 2
    if mad > 0:
        scale = mad / 0.6745
    else:
        mean_ad = sum(dev) / n
        scale = mean_ad * 1.253314 if mean_ad > 0 else 0
    out = []
    for v in values:
        if v is None or v != v or scale == 0:
            out.append(None)
        else:
            out.append((v - med) / scale)
    return out


def _flag(level, kind, why, run=None, day=None, player=None, seq=None, value=None, z=None):
    return {"level": level, "kind": kind, "run": run, "day": day, "player": player, "seq": seq,
            "value": value, "z": round(z, 2) if z is not None else None, "why": why}


def robust(items, level, kind, label, min_n=5, threshold=THRESHOLD):
    """items: list of (value, where) with where a dict of run/day/player/seq.
    Flags the items whose |modified z| is above the threshold."""
    if len([v for v, _ in items if v is not None]) < min_n:
        return []
    zs = modified_z([v for v, _ in items])
    out = []
    for (v, where), z in zip(items, zs):
        if z is not None and abs(z) > threshold:
            out.append(_flag(level, kind, f"{label} {v:g} is {'high' if z > 0 else 'low'} (modified z {z:.1f}, threshold {threshold})",
                             value=v, z=z, **where))
    return out


# Run level ---------------------------------------------------------------

def run_flags(runs, min_n=3):
    """A run's rates or welfare far from the other runs of the same seating."""
    rate_rows = [r for r in measures.rates_by_run(runs) if r["sample"] == "all"
                 and r["player"] in ("Families and Saltdogs", "Chief", "Council")]
    welfare = [r for r in measures.welfare_by_run(runs) if r["sample"] == "all"]
    groups = defaultdict(list)
    for r in rate_rows:
        groups[(r["seating"], r["measure"] + " rate")].append((r["rate"] if r["n"] else None, {"run": r["run"]}))
    for r in welfare:
        groups[(r["seating"], "welfare share")].append((r["share"] if r["days"] else None, {"run": r["run"]}))
    out = []
    for (seating, label), items in sorted(groups.items()):
        out += robust(items, "run", label, f"{label} (seating {seating})", min_n=min_n)
    return out


# Day level ---------------------------------------------------------------

def day_flags(run):
    """Days with unusual welfare, calls, cost, latency or fallbacks, against
    the run's other days."""
    welfare = {d["day"]: d["welfare"] for d in measures.welfare_days(run)}
    calls = defaultdict(list)
    for c in run.calls:
        calls[c["day"]].append(c)
    fb = defaultdict(int)
    for a in run.answers:
        if a["source"] == "fallback":
            fb[a["day"]] += 1
    days = sorted(welfare)
    series = {
        "welfare": [welfare[d] for d in days],
        "calls": [len(calls[d]) for d in days],
        "cost_usd": [sum(c.get("cost_usd") or 0 for c in calls[d]) for d in days],
        "mean latency_ms": [_mean([c["latency_ms"] for c in calls[d] if c.get("latency_ms") is not None]) for d in days],
        "fallbacks": [fb[d] for d in days],
    }
    out = []
    for label, vals in series.items():
        out += robust([(v, {"run": run.id, "day": d}) for v, d in zip(vals, days)], "day", "day " + label, label)
    for d in days:
        if fb[d]:
            out.append(_flag("day", "fallback day", f"{fb[d]} move fallbacks; results are given with and without this day",
                             run=run.id, day=d, value=fb[d]))
    return out


def _mean(xs):
    return sum(xs) / len(xs) if xs else None


# Call level --------------------------------------------------------------

def call_flags(run):
    """Calls with unusual latency, tokens, reasoning share or cost, against
    calls of the same model and step; plus failed calls and calls whose stop
    reason isn't normal."""
    groups = defaultdict(list)
    for c in run.calls:
        if c.get("ok"):
            groups[(c.get("model"), c.get("step"))].append(c)
    out = []
    for (model, step), cs in sorted(groups.items(), key=lambda kv: [str(x) for x in kv[0]]):
        where = lambda c: {"run": run.id, "day": c["day"], "player": c["player"], "seq": c["seq"]}  # noqa: E731
        for label, get in (
            ("latency_ms", lambda c: c.get("latency_ms")),
            ("input tokens", lambda c: c.get("input")),
            ("output tokens", lambda c: c.get("output")),
            ("reasoning share", lambda c: (c.get("reasoning") or 0) / c["output"] if c.get("output") else None),
            ("cost_usd", lambda c: c.get("cost_usd")),
        ):
            out += robust([(get(c), where(c)) for c in cs], "call", "call " + label, f"{label} ({model}, {step})")
    for c in run.calls:
        where = {"run": run.id, "day": c["day"], "player": c["player"], "seq": c["seq"]}
        if not c.get("ok"):
            kind = infra_kind(c.get("error") or "")
            out.append(_flag("call", "failed call" if kind == "other" else "infrastructure: " + kind,
                             f"{c.get('provider')} call failed: {c.get('error')}", value=c.get("error"), **where))
        elif c.get("stop") != NORMAL_STOP:
            out.append(_flag("call", "stop reason", f"stop is {c.get('stop')!r}, not {NORMAL_STOP!r}", value=c.get("stop"), **where))
    return out


def infra_kind(error):
    e = error.lower()
    if "location" in e:
        return "location error"
    if "bad_key" in e or "api key" in e or "forbidden" in e or "unauthor" in e:
        return "key error"
    if "no_credit" in e or "quota" in e or "billing" in e:
        return "credit error"
    if "model_unavailable" in e or "not_found" in e:
        return "model unavailable"
    if "schema" in e:
        return "schema rejected by provider"
    if "rate" in e and "limit" in e:
        return "rate limit"
    if "no participant has a working" in e:
        return "no working key"
    return "other"


# Rule flags --------------------------------------------------------------

def _looks_like_json(text):
    t = (text or "").strip()
    if not t or t[0] not in "{[":
        return False
    try:
        json.loads(t)
        return True
    except ValueError:
        return t.endswith(("}", "]"))


def confidant_json(run):
    """A text to Sam that is JSON: the model answered the wrong step (004-germ)."""
    out = []
    for c in run.raw.get("confidant") or []:
        if _looks_like_json(c.get("text")):
            out.append(_flag("player", "text to Sam is JSON",
                             f"the {c.get('window')} text to Sam is a JSON object, not plain words ({len(c['text'])} chars)",
                             run=run.id, day=c["day"], player=c["player"], value=c["text"][:80]))
    return out


def diary_deletion(run, share=0.5, burst=5):
    """A player that deletes most of its diary, or many entries in one day."""
    out = []
    entries = defaultdict(list)
    for x in run.raw.get("diaries") or []:
        entries[x["player"]].append(x)
    for player, xs in sorted(entries.items()):
        gone = [x for x in xs if x.get("forgotten_on") is not None]
        if xs and len(gone) / len(xs) > share:
            out.append(_flag("player", "diary mostly deleted",
                             f"{len(gone)} of {len(xs)} diary entries deleted ({len(gone) / len(xs):.0%})",
                             run=run.id, player=player, value=len(gone) / len(xs)))
        per_day = defaultdict(int)
        for x in gone:
            per_day[x["forgotten_on"]] += 1
        for day, n in sorted(per_day.items()):
            if n >= burst:
                out.append(_flag("player", "diary burst deletion", f"{n} entries deleted on one day",
                                 run=run.id, day=day, player=player, value=n))
    return out


def constant_moves(run, min_days=5, near=0.9):
    """A seat whose move is the same every day (or on at least `near` of the
    days): Chief inspecting every district it can, or none; Council auditing
    every day, or never; a gang always encroaching, never committing crime,
    always offering. A constant move can't be told apart from a stuck model."""
    by_day = defaultdict(list)
    for r in run.district_days:
        by_day[r["day"]].append(r)
    days = sorted(by_day)
    if len(days) < min_days:
        return []
    turf = {t["day"]: t for t in run.turf}
    checks = {
        ("Chief", "inspects every district it can"): [all(r["inspected"] for r in by_day[d] if r["inspectable"]) and any(r["inspectable"] for r in by_day[d]) for d in days],
        ("Chief", "inspects nowhere"): [not any(r["inspected"] for r in by_day[d]) for d in days],
        ("Chief", "refuses every offer (days with offers)"): [not any(r["bribe_accepted"] for r in by_day[d]) for d in days if any(r["bribe_offered"] for r in by_day[d])],
        ("Council", "audits every day"): [any(r["audited"] for r in by_day[d]) for d in days],
        ("Council", "never audits"): [not any(r["audited"] for r in by_day[d]) for d in days],
    }
    for g in ("Families", "Saltdogs"):
        checks[(g, "encroaches")] = [turf.get(d, {}).get(g) == "encroach" for d in days]
        checks[(g, "respects")] = [turf.get(d, {}).get(g) == "respect" for d in days]
        checks[(g, "commits no crime")] = [not any(r["crime"] for r in by_day[d] if r["gang"] == g) for d in days]
        checks[(g, "offers a bribe in every open district")] = [all(r["bribe_offered"] for r in by_day[d] if r["gang"] == g and r["open"]) for d in days]
    out = []
    for (player, what), hits in checks.items():
        if len(hits) < min_days:
            continue
        share = sum(hits) / len(hits)
        if share == 1:
            out.append(_flag("player", "constant move", f"{player} {what} on all {len(hits)} days",
                             run=run.id, player=player, value=1.0))
        elif share >= near:
            out.append(_flag("player", "near-constant move", f"{player} {what} on {sum(hits)} of {len(hits)} days",
                             run=run.id, player=player, value=round(share, 3)))
    if all(turf.get(d, {}).get("Families") == "encroach" and turf.get(d, {}).get("Saltdogs") == "encroach" for d in days):
        out.append(_flag("run", "constant move", f"both gangs encroach on all {len(days)} days", run=run.id))
    return out


def fallback_answers(run):
    """Move fallbacks caused by infrastructure (no working key), per answer."""
    out = []
    for a in run.answers:
        if a["source"] == "fallback" and a["reason"] == "error":
            out.append(_flag("player", "infrastructure: " + infra_kind(a["errors"]),
                             f"{a['step']} fell back: {a['errors'][:160]}", run=run.id, day=a["day"], player=a["player"]))
    return out


def welfare_mismatch(run):
    out = []
    for d in measures.welfare_days(run):
        if d["engine_welfare"] is not None and d["engine_welfare"] != d["welfare"]:
            out.append(_flag("day", "welfare mismatch", f"engine says {d['engine_welfare']}, formula gives {d['welfare']}",
                             run=run.id, day=d["day"], value=d["engine_welfare"] - d["welfare"]))
    return out


def rule_flags(run):
    return confidant_json(run) + diary_deletion(run) + constant_moves(run) + fallback_answers(run) + welfare_mismatch(run)


def all_flags(runs):
    """Every flag for a set of runs, run level first."""
    out = run_flags(runs)
    for run in runs:
        out += day_flags(run) + call_flags(run) + rule_flags(run)
    return out
