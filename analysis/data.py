"""Load a run export and flatten it into tidy tables (lists of dicts).

An export is the JSON returned by /api/runs/:id/export: run, days, events,
answers, messages, forecasts, diaries, wire, confidant and ledger. load()
takes a path or an already parsed dict and returns a Run with these tables:

- district_days: one row per district per day
- player_days: one row per player per day
- forecasts: one row per player, day and forecast event, with its outcome
  and whether the scoring rule counts it
- turf: one row per day, the two gangs' turf moves
- calls: the ledger, one row per model call
- answers: one row per answer step (player, retry or fallback)

A day with a fallback stays in the data; the rows carry a flag so results can
be given with and without fallback days (rules section 7).
"""

import json
from collections import Counter, defaultdict
from pathlib import Path

DISTRICTS = ("Port", "Hightown", "Old Quarter", "Lowtown", "Market", "Seawall")
TURF = {"Port": "Families", "Hightown": "Families", "Old Quarter": "Families",
        "Lowtown": "Saltdogs", "Market": "Saltdogs", "Seawall": "Saltdogs"}
GANGS = ("Families", "Saltdogs")
PLAYERS = ("Council", "Chief", "Families", "Saltdogs", "World")
SEAT_OF = {"Council": "Government", "Chief": "Government",
           "Families": "Criminals", "Saltdogs": "Criminals", "World": "World"}

CITY_EVENTS = ("p_both_respect", "p_any_bribe_accepted", "p_any_audit")

# Scoring rule (rules section 5): a player is never scored on events its own
# moves decide. An event is left out when the player's own move can settle it:
#   p_crime[d]           the gang that holds d (it chooses crime there)
#   p_inspect[d]         the Chief (it chooses inspections)
#   p_both_respect       both gangs (either one encroaching settles it)
#   p_any_bribe_accepted the Chief (it answers) and both gangs (no offer, no
#                        bribe). This reading is ours; rules.md doesn't list it.
#   p_any_audit          the Council (it chooses audits)
CITY_DECIDERS = {
    "p_both_respect": {"Families", "Saltdogs"},
    "p_any_bribe_accepted": {"Chief", "Families", "Saltdogs"},
    "p_any_audit": {"Council"},
}


def decides(player, event, district=None):
    """True when `player`'s own moves decide the event, so it isn't scored."""
    if event == "p_crime":
        return TURF.get(district) == player
    if event == "p_inspect":
        return player == "Chief"
    return player in CITY_DECIDERS.get(event, set())


class Run:
    """A flattened export. Attributes are lists of dicts, plus `info` (the run row)."""

    TABLES = ("district_days", "player_days", "forecasts", "turf", "calls", "answers")

    def __init__(self, info, **tables):
        self.info = info
        for name in self.TABLES:
            setattr(self, name, tables.get(name, []))

    @property
    def id(self):
        return self.info.get("id")


def read(source):
    """A path (str or Path) or a dict -> the export dict."""
    if isinstance(source, dict):
        return source
    with open(Path(source), encoding="utf-8") as f:
        return json.load(f)


def words(text):
    return len(text.split()) if text else 0


def models_by_player(ledger):
    """Most frequent model per player in the ledger (successful calls first)."""
    counts = defaultdict(Counter)
    for row in ledger:
        if row.get("model"):
            counts[row["player"]][row["model"]] += 2 if row.get("ok") else 1
    return {p: c.most_common(1)[0][0] for p, c in counts.items()}


def family_of(info, player):
    return (info.get("seating") or {}).get(SEAT_OF[player])


def load(source):
    """Flatten one export into a Run."""
    ex = read(source)
    info = dict(ex.get("run") or {})
    rid = info.get("id")
    days = ex.get("days") or []
    answers = ex.get("answers") or []
    ledger = ex.get("ledger") or []
    model = models_by_player(ledger)

    # Move fallbacks, by (day, player): the steps that fell back.
    fell_back = defaultdict(list)
    refused = Counter()
    retries = Counter()
    for a in answers:
        key = (a["day"], a["player"])
        if a.get("source") == "fallback":
            fell_back[key].append(a["step"])
            if a.get("reason") == "refused":
                refused[key] += 1
        elif a.get("source") == "retry":
            retries[key] += 1
    for c in ledger:
        if c.get("stop") == "refused":
            refused[(c["day"], c["player"])] += 1
    fallback_days = {d for (d, _p) in fell_back}

    def acted_by_fallback(day, player):
        return "act" in fell_back.get((day, player), [])

    # District-days.
    district_days = []
    for d in days:
        day = d["day"]
        mv = d.get("moves") or {}
        open_ = set(d.get("open") or [])
        accepted = set(mv.get("accepted") or [])
        inspected = set(mv.get("inspect") or [])
        audited = set(mv.get("audit") or [])
        crime = mv.get("crime") or {}
        offers = mv.get("offers") or {}
        for dist in DISTRICTS:
            gang = TURF[dist]
            is_open = dist in open_
            amount = (offers.get(gang) or {}).get(dist)
            c = bool(crime.get(dist)) if is_open else None
            insp = dist in inspected
            if not is_open:
                outcome = "closed"
            elif c and insp:
                outcome = "crime caught"
            elif c and dist in accepted:
                outcome = "crime under bribe"
            elif c:
                outcome = "crime uninspected"
            elif insp:
                outcome = "inspected, no crime"
            else:
                outcome = "quiet"
            district_days.append({
                "run": rid, "day": day, "district": dist, "gang": gang,
                "open": is_open, "crime": c, "inspected": insp, "audited": dist in audited,
                "bribe_offered": amount is not None, "bribe_amount": amount,
                "bribe_accepted": dist in accepted,
                "inspectable": is_open and dist not in accepted,
                "outcome": outcome,
                "gang_fallback": acted_by_fallback(day, gang),
                "chief_fallback": acted_by_fallback(day, "Chief"),
                "council_fallback": acted_by_fallback(day, "Council"),
                "fallback_day": day in fallback_days,
            })

    # Player-days.
    diary_by = {(x["day"], x["player"]): x for x in ex.get("diaries") or []}
    forgot = Counter((x["forgotten_on"], x["player"]) for x in ex.get("diaries") or [] if x.get("forgotten_on") is not None)
    sent = Counter((m["day"], m["from"]) for m in ex.get("messages") or [])
    confided = Counter((c["day"], c["player"]) for c in ex.get("confidant") or [] if c.get("text"))
    key_fallbacks = Counter((c["day"], c["player"]) for c in ledger if c.get("fallback_key"))
    failed_calls = Counter((c["day"], c["player"]) for c in ledger if not c.get("ok"))
    calls_n = Counter((c["day"], c["player"]) for c in ledger)
    cost = defaultdict(float)
    for c in ledger:
        cost[(c["day"], c["player"])] += c.get("cost_usd") or 0.0
    running = Counter()
    player_days = []
    for d in days:
        day = d["day"]
        delta = d.get("delta") or {}
        for p in PLAYERS:
            key = (day, p)
            sc = delta.get(p)
            if sc is not None:
                running[p] += sc
            diary = diary_by.get(key)
            player_days.append({
                "run": rid, "day": day, "player": p, "seat": SEAT_OF[p],
                "family": family_of(info, p), "model": model.get(p),
                "score_delta": sc, "score_running": running[p] if p != "World" else None,
                "fallbacks": len(fell_back.get(key, [])),
                "fallback_steps": ";".join(sorted(fell_back.get(key, []))),
                "retries": retries[key], "refusals": refused[key],
                "calls": calls_n[key], "failed_calls": failed_calls[key],
                "key_fallbacks": key_fallbacks[key], "cost_usd": round(cost[key], 8),
                "diary_words": words(diary["text"]) if diary else 0,
                "forgot": forgot[key],
                "messages_sent": sent[key], "confidant_texts": confided[key],
            })

    # Outcomes for the 15 forecast events, per day.
    outcomes = {}
    for d in days:
        mv = d.get("moves") or {}
        open_ = set(d.get("open") or [])
        crime = mv.get("crime") or {}
        turf = mv.get("turf") or {}
        o = {}
        for dist in DISTRICTS:
            if dist in open_:
                o[("p_crime", dist)] = bool(crime.get(dist))
                o[("p_inspect", dist)] = dist in set(mv.get("inspect") or [])
        if all(g in turf for g in GANGS):
            o[("p_both_respect", None)] = all(turf[g] == "respect" for g in GANGS)
        o[("p_any_bribe_accepted", None)] = bool(mv.get("accepted"))
        o[("p_any_audit", None)] = bool(mv.get("audit"))
        outcomes[d["day"]] = o

    forecasts = []
    for f in ex.get("forecasts") or []:
        day, p = f["day"], f["player"]
        fc = f.get("forecasts") or {}
        items = []
        for ev in ("p_crime", "p_inspect"):
            for dist, prob in (fc.get(ev) or {}).items():
                items.append((ev, dist, prob))
        for ev in CITY_EVENTS:
            if ev in fc:
                items.append((ev, None, fc[ev]))
        for ev, dist, prob in items:
            out = outcomes.get(day, {}).get((ev, dist))
            own = decides(p, ev, dist)
            valid = isinstance(prob, (int, float)) and 0 <= prob <= 1
            forecasts.append({
                "run": rid, "day": day, "player": p, "seat": SEAT_OF.get(p),
                "family": family_of(info, p) if p in SEAT_OF else None,
                "event": ev, "district": dist, "p": prob, "outcome": out,
                "own_move": own,
                "scored": out is not None and not own and valid,
                "why_not": ("closed or no outcome" if out is None else "own move" if own
                            else "not a probability" if not valid else ""),
                "fallback_day": day in fallback_days,
            })

    turf = []
    for d in days:
        t = (d.get("moves") or {}).get("turf") or {}
        turf.append({"run": rid, "day": d["day"], "Families": t.get("Families"), "Saltdogs": t.get("Saltdogs"),
                     "Families_fallback": acted_by_fallback(d["day"], "Families"),
                     "Saltdogs_fallback": acted_by_fallback(d["day"], "Saltdogs")})

    calls = []
    for c in ledger:
        row = {"run": rid}
        row.update(c)
        row["seat"] = SEAT_OF.get(c.get("player"))
        row["family"] = family_of(info, c["player"]) if c.get("player") in SEAT_OF else None
        calls.append(row)

    answer_rows = []
    for a in answers:
        answer_rows.append({"run": rid, "day": a["day"], "player": a["player"], "seat": SEAT_OF.get(a["player"]),
                            "family": family_of(info, a["player"]) if a["player"] in SEAT_OF else None,
                            "step": a["step"], "source": a.get("source"), "reason": a.get("reason"),
                            "errors": " | ".join(a.get("errors") or [])})

    run = Run(info, district_days=district_days, player_days=player_days, forecasts=forecasts,
              turf=turf, calls=calls, answers=answer_rows)
    run.days = days
    run.raw = ex
    # Every forecastable event's outcome, forecast or not: the base rates.
    run.outcomes = [{"run": rid, "day": day, "event": ev, "district": dist, "outcome": o}
                    for day, evs in sorted(outcomes.items()) for (ev, dist), o in evs.items()]
    return run


def load_all(sources):
    return [load(s) for s in sources]
