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
import math
import random
import sys
from collections import defaultdict

from analysis import data
from analysis.bayes.run_level import RESAMPLES, SEED, brier_skill_rows

FAMILIES = ("claude", "gemini", "gpt")
STUDY_NAMES = {"claude": "Claude Opus 5.5", "gemini": "Gemini 4 Argon", "gpt": "GPT-6.1 Sol"}
STUDY2_NAMES = {"claude": "Claude Haiku 5.5", "gemini": "Gemini 3.1 Flash-Lite", "gpt": "GPT-6 Luna"}
FAMILY_LABEL = {"claude": "Claude", "gemini": "Gemini", "gpt": "GPT"}
# "Study 2" is an internal name; the paper calls the two sets of models by the
# providers' own tier words (Germ, 2 Nov): lightweight and flagship.
SHORT = {"study": {"claude": "Opus 5.5", "gemini": "Argon", "gpt": "Sol"},
         "study2": {"claude": "Haiku 5.5", "gemini": "Flash-Lite", "gpt": "Luna"}}


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
    lines = ["| Family | Lightweight model | Brier skill (95% CI) | Rank | P(first) | Flagship model | Brier skill (95% CI) | Rank | P(first) | Flagship minus lightweight (95% CI) |",
             "|---|---|---|---|---|---|---|---|---|---|"]
    for e in result:
        a, b, c = e["study2"], e["study"], e["change"]
        neg = lambda v: None if v is None else -v
        lines.append(f"| {FAMILY_LABEL[e['family']]} | {e['study2_model']} | {_fmt(a['score'])} ({_fmt(a['low'])} to {_fmt(a['high'])}) | {a['rank'] or ''} | {_fmt(a['p_first'], 2)} "
                     f"| {e['study_model']} | {_fmt(b['score'])} ({_fmt(b['low'])} to {_fmt(b['high'])}) | {b['rank'] or ''} | {_fmt(b['p_first'], 2)} "
                     f"| {_fmt(neg(c['score']))} ({_fmt(neg(c['high']))} to {_fmt(neg(c['low']))}) |")
    return "\n".join(lines) + "\n"


# The figure: a slope chart, the relationship it shows being the change from
# each family's lightweight model (left) to its flagship model (right). One
# line per family between two columns; a crossing line is a change of rank.
# Categorical palette slots 1 to 3, checked with the dataviz validator (the
# aqua's low contrast is why every line also carries its family name in ink).
# Labels are short model names at the line ends; values, ranks and
# intervals are in the table, the pairing in the caption.
SERIES = {"claude": "#2a78d6", "gemini": "#eb6834", "gpt": "#1baf7a"}
INK, MUTED, GRID, SURFACE = "#1f1f1e", "#5f5e58", "#e4e3dd", "#fcfcfb"


def _esc(s):
    return str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def _ticks(lo, hi, n=5):
    raw = (hi - lo) / n
    mag = 10 ** math.floor(math.log10(raw)) if raw > 0 else 0.1
    step = next(m * mag for m in (1, 2, 2.5, 5, 10) if raw <= m * mag)
    t = math.ceil(lo / step) * step
    out = []
    while t <= hi + 1e-12:
        out.append(round(t, 10))
        t += step
    return out


def _spread(ys, gap=15):
    """Nudge label positions apart so no two sit closer than gap pixels."""
    order = sorted(range(len(ys)), key=lambda i: ys[i])
    out = list(ys)
    for a, b in zip(order, order[1:]):
        if out[b] - out[a] < gap:
            out[b] = out[a] + gap
    return out


def svg(result, title="Forecast accuracy: lightweight against flagship models"):
    W, H = 540, 380
    top, bottom, x1, x2 = 78, 340, 200, 370
    AXIS_X = 64  # tick numbers at the left, clear of the model labels and the axis title
    pts = [e for e in result if e["study"]["score"] is not None and e["study2"]["score"] is not None]
    vals = [v for e in pts for k in ("study", "study2") for v in (e[k]["low"], e[k]["high"], e[k]["score"]) if v is not None]
    lo, hi = (min(vals), max(vals)) if vals else (0.0, 1.0)
    pad = (hi - lo) * 0.08 or 0.05
    lo, hi = lo - pad, hi + pad
    y = lambda v: bottom - (v - lo) / (hi - lo) * (bottom - top)
    p = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" font-family="Helvetica, Arial, sans-serif" role="img" aria-label="{_esc(title)}">',
         f'<rect width="{W}" height="{H}" fill="{SURFACE}"/>',
         f'<text x="24" y="28" font-size="15" fill="{INK}" font-weight="600">{_esc(title)}</text>',
         f'<text x="24" y="48" font-size="12" fill="{MUTED}">Higher is better; 0 is the base rate. Bars: 95% intervals over triples.</text>',
         f'<text x="18" y="{(top + bottom) / 2:.1f}" font-size="12" fill="{INK}" text-anchor="middle" transform="rotate(-90 18 {(top + bottom) / 2:.1f})">Brier skill</text>']
    for tv in _ticks(lo, hi):
        p.append(f'<line x1="{AXIS_X + 8}" y1="{y(tv):.1f}" x2="{x2 + 40}" y2="{y(tv):.1f}" stroke="{GRID}" stroke-width="1"/>')
        p.append(f'<text x="{AXIS_X}" y="{y(tv) + 4:.1f}" font-size="11" fill="{MUTED}" text-anchor="end">{tv:g}</text>')
    for x, head in ((x1, "Lightweight"), (x2, "Flagship")):
        p.append(f'<line x1="{x}" y1="{top - 6}" x2="{x}" y2="{bottom + 6}" stroke="{MUTED}" stroke-width="1"/>')
        p.append(f'<text x="{x}" y="{bottom + 26}" font-size="12" fill="{INK}" text-anchor="middle" font-weight="600">{head}</text>')
    for e in pts:
        c = SERIES[e["family"]]
        a, b = e["study2"], e["study"]  # lightweight left, flagship right
        for x, s_ in ((x1, a), (x2, b)):
            if s_["low"] is not None:
                p.append(f'<line x1="{x}" y1="{y(s_["low"]):.1f}" x2="{x}" y2="{y(s_["high"]):.1f}" stroke="{c}" stroke-width="2" stroke-opacity="0.35" stroke-linecap="round"/>')
        p.append(f'<line x1="{x1}" y1="{y(a["score"]):.1f}" x2="{x2}" y2="{y(b["score"]):.1f}" stroke="{c}" stroke-width="2"/>')
        for x, s_ in ((x1, a), (x2, b)):
            p.append(f'<circle cx="{x}" cy="{y(s_["score"]):.1f}" r="5" fill="{c}" stroke="{SURFACE}" stroke-width="2"/>')
    for side, x, anchor, dx in (("study2", x1, "end", -12), ("study", x2, "start", 12)):
        ys = _spread([y(e[side]["score"]) for e in pts])
        for e, yy in zip(pts, ys):
            p.append(f'<text x="{x + dx}" y="{yy + 4:.1f}" font-size="12" fill="{INK}" text-anchor="{anchor}">{SHORT[side][e["family"]]}</text>')
    p.append("</svg>")
    return "\n".join(p) + "\n"


def caption(result):
    """The figure's caption: which model is which, and what the bars are."""
    pairs = "; ".join(f"{e['study2_model']} and {e['study_model']}" for e in result)
    return (f"Mean Brier skill of each model over its 27 seat-runs. Each line joins a provider's lightweight model (left) "
            f"to its flagship model (right): {pairs}. Bars are 95% bootstrap intervals over the 9 triples (seed 2026). "
            "The lightweight models replay the flagship runs' seeds, so each line is a paired comparison. "
            "Values, ranks and the share of resamples each model ranks first are in the table.")


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
        print(f"figure: {a.figure}\ncaption: {caption(result)}")


if __name__ == "__main__":
    main(sys.argv[1:])
