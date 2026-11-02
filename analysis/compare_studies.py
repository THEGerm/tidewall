"""Study against Study 2: each model on one benchmark (Germ, 2 Nov).

    python -m analysis.compare_studies data/runs/study/*.json data/runs/study2/*.json \
        --figure paper/figures/study-comparison.svg --table paper/figures/study-comparison.md

The benchmark is Brier skill: how much better a model's forecasts are than the
base rate (beliefs.brier_skill, scored only on events its own moves don't
decide, #66). Every model gives the same 16 forecasts a day in every seat, so
it is defined for all 3 seats and comparable across models; it is a proper
scoring rule, so a model can't raise it by shading its forecasts.

- Score: a model's mean Brier skill over its seat-runs in one study. Each
  model holds each seat 9 times, so the mean is balanced across seats.
- Interval: 95% percentile bootstrap over whole triples (seed 2026, 10,000
  resamples), as in the study's run-level tests.
- Rank: models ranked by score within each study; the table also gives each
  model's share of resamples in which it ranks first.
- Change: for each family, Study 2 minus the study. The two studies share
  their seeds, so a resample draws the same triples from both (paired).

Exploratory (docs/preregistration-study2.md). Standard library only.
"""

import argparse
import random
import sys
from collections import defaultdict

from analysis import data
from analysis.bayes.run_level import RESAMPLES, SEED, brier_skill_rows

FAMILIES = ("claude", "gemini", "gpt")
STUDY_NAMES = {"claude": "Claude Opus 5.5", "gemini": "Gemini 4 Argon", "gpt": "GPT-6.1 Sol"}
STUDY2_NAMES = {"claude": "Claude Haiku 5.5", "gemini": "Gemini 3.1 Flash-Lite", "gpt": "GPT-6 Luna"}
FAMILY_LABEL = {"claude": "Claude", "gemini": "Gemini", "gpt": "GPT"}


def _by_triple(rows):
    """{triple: {family: [values]}}."""
    out = defaultdict(lambda: defaultdict(list))
    for r in rows:
        out[r["triple"]][r["model"]].append(r["value"])
    return out


def _means(by_triple, triples):
    sums, counts = defaultdict(float), defaultdict(int)
    for t in triples:
        for fam, vs in by_triple.get(t, {}).items():
            sums[fam] += sum(vs)
            counts[fam] += len(vs)
    return {f: sums[f] / counts[f] for f in counts}


def _pct(xs, q):
    xs = sorted(xs)
    i = q * (len(xs) - 1)
    lo, hi = int(i), min(int(i) + 1, len(xs) - 1)
    return xs[lo] + (xs[hi] - xs[lo]) * (i - lo)


def compare(study_rows, study2_rows, resamples=RESAMPLES, seed=SEED):
    """One entry per family: score, interval and rank in each study, the share of
    resamples it ranks first, and the paired change (Study 2 minus study)."""
    s1, s2 = _by_triple(study_rows), _by_triple(study2_rows)
    triples = sorted(set(s1) | set(s2), key=str)
    point1, point2 = _means(s1, triples), _means(s2, triples)
    rng = random.Random(seed)
    boot = {k: defaultdict(list) for k in ("s1", "s2", "diff")}
    first = {k: defaultdict(int) for k in ("s1", "s2")}
    for _ in range(resamples):
        pick = [rng.choice(triples) for _ in triples]
        m1, m2 = _means(s1, pick), _means(s2, pick)
        for key, m in (("s1", m1), ("s2", m2)):
            for f, v in m.items():
                boot[key][f].append(v)
            if m:
                first[key][max(m, key=m.get)] += 1
        for f in FAMILIES:
            if f in m1 and f in m2:
                boot["diff"][f].append(m2[f] - m1[f])
    rank = lambda pts: {f: i + 1 for i, f in enumerate(sorted(pts, key=pts.get, reverse=True))}
    r1, r2 = rank(point1), rank(point2)
    ci = lambda xs: (_pct(xs, 0.025), _pct(xs, 0.975)) if xs else (None, None)
    out = []
    for f in FAMILIES:
        e = {"family": f, "study_model": STUDY_NAMES[f], "study2_model": STUDY2_NAMES[f]}
        for key, pts, rk, names in (("study", point1, r1, "s1"), ("study2", point2, r2, "s2")):
            lo, hi = ci(boot[names][f])
            e[key] = {"score": pts.get(f), "low": lo, "high": hi, "rank": rk.get(f),
                      "p_first": first[names][f] / resamples if pts else None,
                      "n": sum(len(v.get(f, [])) for v in (s1 if key == "study" else s2).values())}
        lo, hi = ci(boot["diff"][f])
        both = e["study"]["score"] is not None and e["study2"]["score"] is not None
        e["change"] = {"score": e["study2"]["score"] - e["study"]["score"] if both else None, "low": lo, "high": hi}
        out.append(e)
    return out


def _fmt(x, d=3):
    return "" if x is None else f"{x:.{d}f}"


def table(result):
    """The comparison as a Markdown table, for the paper's notes."""
    lines = ["| Family | Study model | Brier skill (95% CI) | Rank | P(first) | Study 2 model | Brier skill (95% CI) | Rank | P(first) | Change (95% CI) |",
             "|---|---|---|---|---|---|---|---|---|---|"]
    for e in result:
        a, b, c = e["study"], e["study2"], e["change"]
        lines.append(f"| {FAMILY_LABEL[e['family']]} | {e['study_model']} | {_fmt(a['score'])} ({_fmt(a['low'])} to {_fmt(a['high'])}) | {a['rank'] or ''} | {_fmt(a['p_first'], 2)} "
                     f"| {e['study2_model']} | {_fmt(b['score'])} ({_fmt(b['low'])} to {_fmt(b['high'])}) | {b['rank'] or ''} | {_fmt(b['p_first'], 2)} "
                     f"| {_fmt(c['score'])} ({_fmt(c['low'])} to {_fmt(c['high'])}) |")
    return "\n".join(lines) + "\n"


# The figure: a dumbbell per family on one Brier-skill axis. One hue, two
# shades (dataviz: before/after per item), checked with the palette validator;
# the shades also differ by marker fill, and every point is labelled with its
# model, so the study never reads by colour alone.
DARK, LIGHT = "#0d366b", "#3987e5"
INK, MUTED, GRID, SURFACE = "#1f1f1e", "#5f5e58", "#dcdbd5", "#fcfcfb"


def _esc(s):
    return str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def svg(result, title="Brier skill by model, study and Study 2"):
    W, row_h, left, right, top = 720, 92, 150, 40, 70
    H = top + row_h * len(result) + 60
    vals = [v for e in result for k in ("study", "study2") for v in (e[k]["score"], e[k]["low"], e[k]["high"]) if v is not None]
    lo, hi = (min(vals + [0.0]), max(vals + [0.0])) if vals else (-0.1, 0.1)
    pad = (hi - lo) * 0.08 or 0.05
    lo, hi = lo - pad, hi + pad
    x = lambda v: left + (v - lo) / (hi - lo) * (W - left - right)
    step = 10 ** int(f"{(hi - lo) / 5:e}".split("e")[1])
    for m in (1, 2, 5, 10):
        if (hi - lo) / (step * m) <= 6:
            step *= m
            break
    ticks, t = [], (int(lo / step)) * step
    while t <= hi + 1e-12:
        if t >= lo - 1e-12:
            ticks.append(round(t, 10))
        t += step
    p = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" font-family="Helvetica, Arial, sans-serif" role="img" aria-label="{_esc(title)}">',
         f'<rect width="{W}" height="{H}" fill="{SURFACE}"/>',
         f'<text x="{left}" y="28" font-size="16" fill="{INK}" font-weight="600">{_esc(title)}</text>',
         f'<circle cx="{left + 6}" cy="48" r="5" fill="{DARK}"/><text x="{left + 16}" y="52" font-size="12" fill="{MUTED}">Study (frontier models)</text>',
         f'<circle cx="{left + 196}" cy="48" r="5" fill="{SURFACE}" stroke="{LIGHT}" stroke-width="2"/><text x="{left + 206}" y="52" font-size="12" fill="{MUTED}">Study 2 (smaller models)</text>']
    base = top + row_h * len(result)
    for tv in ticks:
        p.append(f'<line x1="{x(tv):.1f}" y1="{top}" x2="{x(tv):.1f}" y2="{base}" stroke="{GRID}" stroke-width="1"/>')
        p.append(f'<text x="{x(tv):.1f}" y="{base + 18}" font-size="11" fill="{MUTED}" text-anchor="middle">{tv:g}</text>')
    if lo < 0 < hi:
        p.append(f'<line x1="{x(0):.1f}" y1="{top}" x2="{x(0):.1f}" y2="{base}" stroke="{MUTED}" stroke-width="1"/>')
    p.append(f'<text x="{(left + W - right) / 2:.1f}" y="{base + 40}" font-size="12" fill="{MUTED}" text-anchor="middle">Brier skill (0 = base rate, higher is better); bars are 95% intervals over triples</text>')
    for i, e in enumerate(result):
        cy = top + row_h * i + row_h / 2
        p.append(f'<text x="{left - 14}" y="{cy + 4:.1f}" font-size="13" fill="{INK}" text-anchor="end" font-weight="600">{FAMILY_LABEL[e["family"]]}</text>')
        a, b = e["study"], e["study2"]
        for k, dy, name, fill, stroke in (("study", -14, e["study_model"], DARK, DARK), ("study2", 14, e["study2_model"], SURFACE, LIGHT)):
            s = e[k]
            if s["score"] is None:
                continue
            yy = cy + dy
            if s["low"] is not None:
                p.append(f'<line x1="{x(s["low"]):.1f}" y1="{yy:.1f}" x2="{x(s["high"]):.1f}" y2="{yy:.1f}" stroke="{stroke}" stroke-width="2" stroke-linecap="round"/>')
            p.append(f'<circle cx="{x(s["score"]):.1f}" cy="{yy:.1f}" r="5" fill="{fill}" stroke="{stroke}" stroke-width="2"/>')
            label = f'{name}: {s["score"]:.3f}, rank {s["rank"]}'
            # Label on the side with room: right of the interval, or left of it
            # when the point sits in the right part of the plot.
            if x(s["score"]) > left + 0.55 * (W - left - right):
                lx, anchor = x(s["low"] if s["low"] is not None else s["score"]) - 8, "end"
            else:
                lx, anchor = x(s["high"] if s["high"] is not None else s["score"]) + 8, "start"
            p.append(f'<text x="{lx:.1f}" y="{yy + 4:.1f}" font-size="11" fill="{INK}" text-anchor="{anchor}">{_esc(label)}</text>')
    p.append("</svg>")
    return "\n".join(p) + "\n"


def main(argv):
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("exports", nargs="+", help="run exports from data/runs/study/ and data/runs/study2/")
    ap.add_argument("--figure", help="write the SVG figure here")
    ap.add_argument("--table", help="write the Markdown table here")
    ap.add_argument("--without-fallbacks", action="store_true")
    ap.add_argument("--resamples", type=int, default=RESAMPLES)
    a = ap.parse_args(argv)
    runs = data.load_all(a.exports)
    s1 = [r for r in runs if data.is_study_run(r)]
    s2 = [r for r in runs if data.is_study2_run(r)]
    other = [r.id for r in runs if r not in s1 and r not in s2]
    if other:
        print("left out (neither study nor Study 2): " + ", ".join(other))
    wf = not a.without_fallbacks
    result = compare(brier_skill_rows(s1, wf), brier_skill_rows(s2, wf), resamples=a.resamples)
    t = table(result)
    print(f"{len(s1)} study runs, {len(s2)} Study 2 runs\n")
    print(t)
    if a.table:
        open(a.table, "w").write(t)
    if a.figure:
        open(a.figure, "w").write(svg(result))
        print(f"figure: {a.figure}")


if __name__ == "__main__":
    main(sys.argv[1:])
