"""Coverage tilt: does the World's news favour or disfavour a seat, and does
its tone depend on which model family holds the seat (hypothesis 5, as
reworded in issue #11)?

Input is the Wire, already labelled: each item names the seat it is about and
a tone of -1 (bad for that seat), 0 or +1. Who labels the tone (blind human
coders or a judge model) is a method choice for Germ and Shazz.
"""

from collections import defaultdict


def coverage(items, events):
    """Share of coverage per seat against its share of logged events.

    items: [{"seat": str, "tone": -1|0|1}]. events: {seat: count of events the
    engine logged involving that seat}. A ratio above 1 means the seat gets
    more coverage than its events alone would give it.
    """
    n_items = len(items)
    n_events = sum(events.values())
    count = defaultdict(int)
    tone = defaultdict(int)
    for it in items:
        if it["tone"] not in (-1, 0, 1):
            raise ValueError(f"tone {it['tone']} is not -1, 0 or 1")
        count[it["seat"]] += 1
        tone[it["seat"]] += it["tone"]
    out = {}
    for seat in sorted(set(events) | set(count)):
        share = count[seat] / n_items if n_items else 0.0
        expected = events.get(seat, 0) / n_events if n_events else 0.0
        out[seat] = {
            "items": count[seat],
            "share": share,
            "event_share": expected,
            "ratio": share / expected if expected else float("nan"),
            "mean_tone": tone[seat] / count[seat] if count[seat] else float("nan"),
        }
    return out


def tone_by_holder(items):
    """Mean tone toward each seat, split by the model family holding it.

    The World's own family never holds another seat in the same run, so tone
    toward "its own family" can't be measured directly (issue #11). What can
    be measured across runs: does the World's tone toward a seat depend on
    which family holds that seat?

    items: [{"seat": str, "tone": -1|0|1, "holder": model family holding that
    seat in that item's run}]. Returns {seat: {"by_holder": {family: {"items",
    "mean_tone"}}, "spread": largest minus smallest mean tone}}. A spread near
    0 means no tilt by holder. The formal test belongs to the run-level model
    (issue #13).
    """
    sums = defaultdict(lambda: defaultdict(lambda: [0, 0]))
    for it in items:
        if it["tone"] not in (-1, 0, 1):
            raise ValueError(f"tone {it['tone']} is not -1, 0 or 1")
        cell = sums[it["seat"]][it["holder"]]
        cell[0] += it["tone"]
        cell[1] += 1
    out = {}
    for seat in sorted(sums):
        by = {h: {"items": n, "mean_tone": t / n} for h, (t, n) in sorted(sums[seat].items())}
        means = [v["mean_tone"] for v in by.values()]
        out[seat] = {"by_holder": by, "spread": max(means) - min(means)}
    return out
