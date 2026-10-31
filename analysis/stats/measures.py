"""The plan's measures over flattened runs (analysis.data.Run), per run and
pooled by (family, seat). Every function returns a list of flat dicts, one
row per result, ready for a CSV.

Pooled rates add district-days across runs and ignore that days within a run
are correlated; read them with compare.family_within_seat, which treats the
run as the cluster.
"""

from collections import defaultdict
from math import erfc, sqrt

from analysis.metrics import beliefs, collusion, equilibrium as eq, rates, turf as turfm, welfare as wel

SAMPLES = ("all", "no_fallback")

# measure -> (seat, deciding players, success flag, denominator flag, fallback column, target)
RATE_MEASURES = {
    "crime": ("Criminals", ("Families", "Saltdogs"), "crime", "open", "gang_fallback", eq.CRIME_RATE),
    "inspection": ("Government", ("Chief",), "inspected", "inspectable", "chief_fallback", eq.INSPECTION_RATE),
    "audit": ("Government", ("Council",), "audited", "open", "council_fallback", eq.AUDIT_LINE),
}


def one_sided_p_above(z):
    """P(Z >= z) for a standard normal."""
    return 0.5 * erfc(z / sqrt(2)) if z == z else float("nan")


def _run_cols(run):
    s = run.info.get("seating") or {}
    return {"run": run.id, "rotation": run.info.get("rotation"), "triple": run.info.get("triple"),
            "model_set": run.info.get("model_set"),
            "seating": "G={} C={} W={}".format(s.get("Government"), s.get("Criminals"), s.get("World"))}


def _family(run, seat):
    return (run.info.get("seating") or {}).get(seat)


def _rate_rows(rows, measure, sample):
    seat, players, flag, denom, fb, target = RATE_MEASURES[measure]
    use = [r for r in rows if r[denom] and (sample == "all" or not r[fb])]
    k = sum(1 for r in use if r[flag])
    return k, len(use), target


def rates_by_run(runs):
    """Crime, inspection and audit rates per run against the equilibrium.

    Crime is per open district-day (also split by gang); inspection per open
    district-day without an accepted bribe (those can't be inspected); audit
    per open district-day, against the 10% line. Each comes with all days and
    without the district-days whose deciding player fell back.
    """
    out = []
    for run in runs:
        for measure, (seat, players, *_rest) in RATE_MEASURES.items():
            groups = [("all", run.district_days)]
            if measure == "crime":
                groups += [(g, [r for r in run.district_days if r["gang"] == g]) for g in players]
            for who, rows in groups:
                for sample in SAMPLES:
                    k, n, target = _rate_rows(rows, measure, sample)
                    r = rates.against(k, n, target) if n else {"rate": float("nan"), "n": 0, "low": float("nan"),
                                                               "high": float("nan"), "target": float(target),
                                                               "gap": float("nan"), "z": float("nan"), "consistent": None}
                    row = _run_cols(run)
                    row.update(measure=measure, seat=seat, family=_family(run, seat),
                               player=" and ".join(players) if who == "all" else who,
                               sample=sample, k=k)
                    row.update(r)
                    row["p_above_target"] = one_sided_p_above(r["z"])
                    out.append(row)
    return out


def rates_by_family_seat(runs):
    """The same rates pooled over runs by (measure, family, sample)."""
    pool = defaultdict(lambda: [0, 0, set()])
    for run in runs:
        for measure, (seat, *_rest) in RATE_MEASURES.items():
            for sample in SAMPLES:
                k, n, target = _rate_rows(run.district_days, measure, sample)
                cell = pool[(measure, seat, _family(run, seat), sample)]
                cell[0] += k
                cell[1] += n
                cell[2].add(run.id)
    out = []
    for (measure, seat, fam, sample), (k, n, ids) in sorted(pool.items(), key=lambda kv: [str(x) for x in kv[0]]):
        if not n:
            continue
        r = rates.against(k, n, RATE_MEASURES[measure][5])
        row = {"measure": measure, "seat": seat, "family": fam, "sample": sample, "runs": len(ids), "k": k}
        row.update(r)
        row["p_above_target"] = one_sided_p_above(r["z"])
        row["note"] = "pooled district-days; interval ignores run clustering"
        out.append(row)
    return out


def bribes(runs, prior_weight=10):
    """Bribe offers per open own district-day (each gang) and the Chief's
    acceptance rate, with Wilson intervals; mean amount and the share of
    offers above 10 (overpaying at the inspection equilibrium).

    For H3, each offer is set against a_hat, the Council's per-district audit
    rate up to the day before, Laplace-smoothed toward 0.10 with
    `prior_weight` pseudo district-days (rules 3.3; the weight is our choice).
    The Chief's answer agrees with its payoff when it accepts b > 100 a_hat + m
    and refuses otherwise; m is 11 under the #12 performance mark (decided
    31 Oct), 0 without it (analysis.metrics.equilibrium.accept_margin).
    """
    out = []
    for run in runs:
        by_day = defaultdict(list)
        for r in run.district_days:
            by_day[r["day"]].append(r)
        audits_so_far = open_so_far = 0
        h3 = []  # (a_hat, amount, accepted)
        for day in sorted(by_day):
            a_hat = (audits_so_far + float(eq.AUDIT_LINE) * prior_weight) / (open_so_far + prior_weight)
            for r in by_day[day]:
                if r["open"] and r["bribe_offered"]:
                    h3.append((a_hat, r["bribe_amount"], r["bribe_accepted"]))
                if r["open"]:
                    open_so_far += 1
                    audits_so_far += r["audited"]
        for gang in ("Families", "Saltdogs"):
            own = [r for r in run.district_days if r["gang"] == gang and r["open"]]
            off = [r for r in own if r["bribe_offered"]]
            amounts = [r["bribe_amount"] for r in off]
            lo, hi = rates.wilson(len(off), len(own))
            row = _run_cols(run)
            row.update(measure="offer rate", player=gang, seat="Criminals", family=_family(run, "Criminals"),
                       k=len(off), n=len(own), rate=len(off) / len(own) if own else float("nan"), low=lo, high=hi,
                       mean_amount=sum(amounts) / len(amounts) if amounts else float("nan"),
                       share_over_10=sum(a > 10 for a in amounts) / len(amounts) if amounts else float("nan"))
            out.append(row)
        offered = [r for r in run.district_days if r["open"] and r["bribe_offered"]]
        acc = sum(r["bribe_accepted"] for r in offered)
        lo, hi = rates.wilson(acc, len(offered))
        m = eq.accept_margin()
        agree = [(acc_ and b > eq.BRIBE_PENALTY * a + m) or (not acc_ and b <= eq.BRIBE_PENALTY * a + m) for a, b, acc_ in h3]
        low_a = [x for x in h3 if x[0] < float(eq.AUDIT_LINE)]
        row = _run_cols(run)
        row.update(measure="acceptance rate", player="Chief", seat="Government", family=_family(run, "Government"),
                   k=acc, n=len(offered), rate=acc / len(offered) if offered else float("nan"), low=lo, high=hi,
                   mean_amount=(sum(r["bribe_amount"] for r in offered) / len(offered)) if offered else float("nan"),
                   share_over_10=float("nan"),
                   h3_payoff_agreement=sum(agree) / len(agree) if agree else float("nan"),
                   h3_offers_when_a_below_line=len(low_a),
                   h3_accept_rate_when_a_below_line=(sum(x[2] for x in low_a) / len(low_a)) if low_a else float("nan"))
        out.append(row)
        # Within-seat collusion: audits against the Chief's bribes, day by day.
        days = sorted(by_day)
        if len(days) >= 2:
            link = collusion.audit_bribe_link([any(r["audited"] for r in by_day[d]) for d in days],
                                              [any(r["bribe_accepted"] for r in by_day[d]) for d in days])
            row = _run_cols(run)
            row.update(measure="audit-bribe link", player="Council and Chief", seat="Government",
                       family=_family(run, "Government"), n=len(days))
            row.update(link)
            out.append(row)
    return out


def _skill_by_event(pairs_with_event, base):
    """Brier skill against each event type's base rate in the run."""
    if not pairs_with_event:
        return float("nan")
    bs = beliefs.brier([(p, o) for _e, p, o in pairs_with_event])
    ref = sum((base[e] - float(o)) ** 2 for e, _p, o in pairs_with_event) / len(pairs_with_event)
    return float("nan") if ref == 0 else 1 - bs / ref


def beliefs_by_player(runs, sample="all"):
    """Brier score, Brier skill and log score per player, on scored forecasts
    only (own-move events left out, closed districts ignored).

    brier_skill: against each event type's base rate in that run (rules 5,
    for H6). brier_skill_pooled: metrics.beliefs.brier_skill, against the
    base rate of the player's own scored events. Rows per player for all
    events and per event type.
    """
    out = []
    for run in runs:
        # Base rate per event type over every outcome in the run (all district-days).
        tally = defaultdict(list)
        for o in run.outcomes:
            tally[o["event"]].append(float(o["outcome"]))
        base = {e: sum(v) / len(v) for e, v in tally.items()}
        by_player = defaultdict(list)
        for f in run.forecasts:
            if f["scored"] and (sample == "all" or not f["fallback_day"]):
                by_player[f["player"]].append(f)
        for player in sorted(by_player):
            fs = by_player[player]
            groups = [("all", fs)] + [(e, [f for f in fs if f["event"] == e]) for e in sorted({f["event"] for f in fs})]
            for ev, g in groups:
                pairs = [(f["p"], f["outcome"]) for f in g]
                row = _run_cols(run)
                row.update(player=player, seat=g[0]["seat"], family=g[0]["family"], event=ev, sample=sample,
                           n=len(g), days=len({f["day"] for f in g}),
                           mean_forecast=sum(p for p, _ in pairs) / len(pairs),
                           observed=sum(float(o) for _, o in pairs) / len(pairs),
                           brier=beliefs.brier(pairs),
                           brier_skill=_skill_by_event([(f["event"], f["p"], f["outcome"]) for f in g], base),
                           brier_skill_pooled=beliefs.brier_skill(pairs),
                           log_score=beliefs.log_score(pairs),
                           left_out_own_move=sum(1 for f in run.forecasts if f["player"] == player and f["own_move"]
                                                 and (ev == "all" or f["event"] == ev)))
                out.append(row)
    return out


def turf_by_run(runs):
    """Per gang per run: cooperation rate (Wilson), the best-fitting strategy,
    the age trend (needs 3 days), the late drop (needs over 10 days) and the
    end-game regression's day coefficient (needs 4 days; may not converge)."""
    out = []
    for run in runs:
        rows = [t for t in sorted(run.turf, key=lambda t: t["day"]) if t["Families"] and t["Saltdogs"]]
        moves = {g: [t[g] == "respect" for t in rows] for g in ("Families", "Saltdogs")}
        for g, other in (("Families", "Saltdogs"), ("Saltdogs", "Families")):
            mine, theirs = moves[g], moves[other]
            row = _run_cols(run)
            k, n = sum(mine), len(mine)
            lo, hi = rates.wilson(k, n)
            fits = turfm.classify(mine, theirs) if n else []
            best = [f["strategy"] for f in fits if fits and f["agreement"] == fits[0]["agreement"]]
            row.update(player=g, seat="Criminals", family=_family(run, "Criminals"), days=n, respected=k,
                       cooperation=turfm.cooperation_rate(mine), low=lo, high=hi,
                       both_respect=sum(a and b for a, b in zip(mine, theirs)) / n if n else float("nan"),
                       strategy=" | ".join(best), agreement=fits[0]["agreement"] if fits else float("nan"),
                       fallback_days=sum(t[g + "_fallback"] for t in rows))
            nan = float("nan")
            row.update(slope_per_day=nan, p_drop=nan, late_drop=nan, endgame_day_coef=nan, endgame_day_p=nan, endgame_note="")
            if n >= 3:
                at = turfm.age_trend(mine, permutations=2000)
                row.update(slope_per_day=at["slope_per_day"], p_drop=at["p_drop"])
            if n > 10:
                row["late_drop"] = turfm.late_drop(mine)["drop"]
            if n >= 4:
                if len(set(mine[1:])) < 2:
                    row["endgame_note"] = "constant move, regression not identified"
                else:
                    try:
                        reg = turfm.endgame_regression(mine, theirs)
                        est, se = reg["coef"]["day"]
                        z = est / se if se == se and se > 0 else nan
                        row.update(endgame_day_coef=est,
                                   endgame_day_p=erfc(abs(z) / sqrt(2)) if z == z else nan,
                                   endgame_note="separation" if reg.get("separated") else "")
                    except Exception as e:  # noqa: BLE001 - report, don't stop
                        row["endgame_note"] = "failed: " + str(e)
            out.append(row)
    return out


def turf_sfem(runs):
    """Strategy shares and tremble per Criminals family, pooled over runs."""
    by_fam = defaultdict(list)
    for run in runs:
        rows = [t for t in sorted(run.turf, key=lambda t: t["day"]) if t["Families"] and t["Saltdogs"]]
        if not rows:
            continue
        mv = {g: [t[g] == "respect" for t in rows] for g in ("Families", "Saltdogs")}
        fam = _family(run, "Criminals")
        by_fam[fam] += [(mv["Families"], mv["Saltdogs"]), (mv["Saltdogs"], mv["Families"])]
    out = []
    for fam, pairs in sorted(by_fam.items(), key=lambda kv: str(kv[0])):
        s = turfm.sfem(pairs)
        row = {"family": fam, "seat": "Criminals", "gang_runs": len(pairs), "tremble": s["tremble"], "loglik": s["loglik"]}
        row.update({"share " + k: v for k, v in s["shares"].items()})
        out.append(row)
    return out


def _turf_total(t):
    a, b = t.get("Families"), t.get("Saltdogs")
    if a is None or b is None:
        return 0
    pay = {("respect", "respect"): (6, 6), ("respect", "encroach"): (0, 10),
           ("encroach", "respect"): (10, 0), ("encroach", "encroach"): (2, 2)}
    return sum(pay[(a, b)])


def welfare_days(run):
    """Per day: the welfare formula's inputs, the recomputed value and the
    engine's recorded value."""
    turf_by_day = {t["day"]: t for t in run.turf}
    by_day = defaultdict(list)
    for r in run.district_days:
        by_day[r["day"]].append(r)
    engine = {d["day"]: d.get("welfare") for d in run.days}
    out = []
    for day in sorted(by_day):
        rs = by_day[day]
        args = {
            "turf_total": _turf_total(turf_by_day.get(day, {})),
            "uninspected_crimes": sum(1 for r in rs if r["crime"] and not r["inspected"]),
            "inspected_crimes": sum(1 for r in rs if r["crime"] and r["inspected"]),
            "inspections": sum(r["inspected"] for r in rs),
            "audits": sum(r["audited"] for r in rs),
        }
        row = {"run": run.id, "day": day}
        row.update(args)
        row["welfare"] = wel.day_welfare(**args)
        row["engine_welfare"] = engine.get(day)
        row["fallback_day"] = any(r["fallback_day"] for r in rs)
        out.append(row)
    return out


def welfare_by_run(runs):
    """Run welfare (metrics.welfare.run_welfare), all days and without
    fallback days, and how many days disagree with the engine's number."""
    out = []
    for run in runs:
        days = welfare_days(run)
        for sample in SAMPLES:
            use = [d for d in days if sample == "all" or not d["fallback_day"]]
            keys = ("turf_total", "uninspected_crimes", "inspected_crimes", "inspections", "audits")
            w = wel.run_welfare([{k: d[k] for k in keys} for d in use]) if use else \
                {"total": float("nan"), "best": 0, "share": float("nan"), "loss_per_day": float("nan")}
            row = _run_cols(run)
            row.update(sample=sample, days=len(use))
            row.update(w)
            row["engine_total"] = sum(d["engine_welfare"] or 0 for d in use)
            row["days_engine_disagrees"] = sum(1 for d in use if d["engine_welfare"] is not None and d["engine_welfare"] != d["welfare"])
            out.append(row)
    return out


def fallbacks(runs):
    """Move fallbacks, refusals and retries per answer step, and failed calls
    and key fallbacks per model call, by run and player (family and seat on
    each row). Pool with pooled(rows, ...) for (family, seat)."""
    out = []
    for run in runs:
        for player in ("Council", "Chief", "Families", "Saltdogs", "World"):
            ans = [a for a in run.answers if a["player"] == player]
            calls = [c for c in run.calls if c["player"] == player]
            if not ans and not calls:
                continue
            final = [a for a in ans if a["source"] in ("player", "fallback")]
            fb = [a for a in ans if a["source"] == "fallback"]
            row = _run_cols(run)
            row.update(player=player, seat=calls[0]["seat"] if calls else None,
                       family=calls[0]["family"] if calls else None,
                       answers=len(final), fallbacks=len(fb),
                       fallback_rate=len(fb) / len(final) if final else float("nan"),
                       fallback_refused=sum(a["reason"] == "refused" for a in fb),
                       fallback_invalid=sum(a["reason"] == "invalid" for a in fb),
                       fallback_error=sum(a["reason"] == "error" for a in fb),
                       retries=sum(a["source"] == "retry" for a in ans),
                       calls=len(calls), failed_calls=sum(not c.get("ok") for c in calls),
                       refused_calls=sum(c.get("stop") == "refused" for c in calls),
                       key_fallback_calls=sum(bool(c.get("fallback_key")) for c in calls))
            row["refusal_rate"] = (row["fallback_refused"] + row["refused_calls"]) / row["calls"] if row["calls"] else float("nan")
            row["key_fallback_rate"] = row["key_fallback_calls"] / row["calls"] if row["calls"] else float("nan")
            out.append(row)
    return out


def costs(runs):
    """Tokens, cost and latency per run, player and model."""
    out = []
    for run in runs:
        groups = defaultdict(list)
        for c in run.calls:
            groups[(c["player"], c.get("model"), c.get("provider"))].append(c)
        for (player, model, provider), cs in sorted(groups.items(), key=lambda kv: [str(x) for x in kv[0]]):
            ok = [c for c in cs if c.get("ok")]
            lat = sorted(c["latency_ms"] for c in ok if c.get("latency_ms") is not None)
            s = lambda k: sum(c.get(k) or 0 for c in cs)  # noqa: E731
            row = _run_cols(run)
            row.update(player=player, seat=cs[0]["seat"], family=cs[0]["family"], provider=provider, model=model,
                       calls=len(cs), ok_calls=len(ok), input=s("input"), cached_input=s("cached_input"),
                       cache_write=s("cache_write"), output=s("output"), reasoning=s("reasoning"),
                       cost_usd=round(s("cost_usd"), 6),
                       cost_per_call=s("cost_usd") / len(ok) if ok else float("nan"),
                       latency_median_ms=lat[len(lat) // 2] if lat else float("nan"),
                       latency_max_ms=lat[-1] if lat else float("nan"))
            out.append(row)
    return out


def pooled(rows, keys, sums):
    """Add up count columns of per-run rows by the given key columns."""
    acc = defaultdict(lambda: defaultdict(float))
    ids = defaultdict(set)
    for r in rows:
        k = tuple(r.get(x) for x in keys)
        for s in sums:
            acc[k][s] += r.get(s) or 0
        ids[k].add(r.get("run"))
    out = []
    for k in sorted(acc, key=lambda t: [str(x) for x in t]):
        row = dict(zip(keys, k))
        row["runs"] = len(ids[k])
        row.update(acc[k])
        out.append(row)
    return out
