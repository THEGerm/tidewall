"""The data dictionary written as README.md next to the worksheets.

Every column of every worksheet has an entry here: its unit and what it
means. A table-specific entry wins over the common one. A test checks that
no column is left undocumented.
"""

# name -> (one row is, measure or hypothesis it serves)
TABLES = {
    "district_days": ("one district on one day", "all inspection and bribery measures (H2, H3)"),
    "player_days": ("one player on one day", "refusals, diary against messages, scores"),
    "forecasts": ("one forecast event of one player on one day", "Brier score, best-response rate (H6)"),
    "turf_moves": ("one day of the turf war", "cooperation rate, strategy type (H1, H4)"),
    "calls": ("one model call (the ledger)", "cost, refusals, infrastructure checks"),
    "answers": ("one answer step: the player's answer, a retry, or a fallback", "refusals, fallbacks"),
    "rates_by_run": ("one rate in one run, one sample", "crime and inspection rates against 4/15 and 1/4; audit rate against 10% (H2, H3)"),
    "rates_by_family_seat": ("one rate pooled over runs, by family and seat", "as rates_by_run; pooled, so intervals ignore run clustering"),
    "bribes": ("one bribery measure in one run", "audit rate, bribes taken, within-seat collusion (H3)"),
    "beliefs": ("one player's scored forecasts in one run, all events or one event type", "Brier score, Brier skill (H6)"),
    "turf": ("one gang in one run", "cooperation rate, strategy type, cooperation against game age (H1, H4)"),
    "turf_sfem": ("one Criminals family, pooled over its runs", "strategy type by strategy frequency estimation (H1)"),
    "welfare": ("one run, one sample", "total payoff against the best possible total"),
    "welfare_days": ("one day", "welfare, day by day, and the check against the engine"),
    "fallbacks": ("one player in one run", "refusals by seat and model"),
    "fallbacks_by_family_seat": ("one family in one seat, pooled over runs", "refusals by seat and model"),
    "costs": ("one player and model in one run", "cost (plan, Cost)"),
    "costs_by_family_seat": ("one family in one seat, pooled over runs", "cost (plan, Cost)"),
    "family_means": ("one measure for one family in one seat: the mean of run-level values", "model against seat (H6), provisional"),
    "family_pairs": ("two families compared on one measure within a seat", "model against seat (H6), provisional; exploratory tier, Benjamini-Hochberg"),
    "confirmatory": ("one confirmatory test", "H2 and H4, Holm-adjusted together; provisional"),
    "outliers": ("one flag", "data quality; robust (modified z) and rule-based flags"),
}

COMMON = {
    "run": ("id", "run id, e.g. 004-germ"),
    "rotation": ("1 to 3", "Latin-square rotation of the run"),
    "triple": ("integer", "Latin-square triple (seed group) of the run"),
    "model_set": ("text", "model set of the run; 'test' runs are not study data"),
    "seating": ("text", "families in the run's seats: G = Government, C = Criminals, W = World"),
    "day": ("day number", "game day, from 1"),
    "district": ("name", "one of Port, Hightown, Old Quarter, Lowtown, Market, Seawall"),
    "gang": ("name", "gang whose turf the district is (fixed: Families hold Port, Hightown, Old Quarter)"),
    "player": ("name", "Council, Chief, Families, Saltdogs or World (or a pair, for joint measures)"),
    "seat": ("name", "Government (Council, Chief), Criminals (Families, Saltdogs) or World"),
    "family": ("name", "model family holding the seat in this run (run.seating): claude, gemini or gpt"),
    "model": ("model id", "model the player called (most frequent in the ledger)"),
    "measure": ("name", "which measure the row reports"),
    "sample": ("all / no_fallback", "all days, or without the days (or district-days) where the deciding player's move was a fallback (rules 7)"),
    "k": ("count", "successes: crimes, inspections, audits, offers or acceptances"),
    "n": ("count", "denominator of the rate (see measure)"),
    "rate": ("share 0 to 1", "k / n"),
    "low": ("share 0 to 1", "lower end of the 95% interval (Wilson for rates, t for means)"),
    "high": ("share 0 to 1", "upper end of the 95% interval"),
    "target": ("share 0 to 1", "equilibrium value: crime 4/15, inspection 1/4, audit line 1/10 (metrics.equilibrium)"),
    "gap": ("share", "rate - target"),
    "z": ("z-score", "(rate - target) / sqrt(target (1 - target) / n)"),
    "consistent": ("true/false", "target lies inside the 95% interval"),
    "p_above_target": ("p-value", "one-sided normal p for rate above target (H2 uses it for inspections)"),
    "note": ("text", "caveat on how the row was computed"),
    "runs": ("count", "runs pooled into the row"),
    "days": ("count", "days in the row"),
    "fallback_day": ("true/false", "some player had a move fallback that day"),
    "cost_usd": ("US dollars", "model cost as the ledger records it"),
    "calls": ("count", "model calls (ledger rows)"),
}

PER_TABLE = {
    "district_days": {
        "open": ("true/false", "district open today (a storm closes the Port)"),
        "crime": ("true/false/blank", "the gang committed crime here; blank when closed"),
        "inspected": ("true/false", "the Chief inspected here"),
        "audited": ("true/false", "the Council audited here"),
        "bribe_offered": ("true/false", "the gang offered the Chief a bribe here"),
        "bribe_amount": ("money, 1 to 20", "the offered bribe"),
        "bribe_accepted": ("true/false", "the Chief accepted it (the district can't then be inspected)"),
        "inspectable": ("true/false", "open and no accepted bribe: the inspection rate's denominator"),
        "outcome": ("label", "closed, quiet, inspected no crime, crime uninspected, crime under bribe, crime caught"),
        "gang_fallback": ("true/false", "the gang's step-5 move was a fallback"),
        "chief_fallback": ("true/false", "the Chief's step-5 move was a fallback"),
        "council_fallback": ("true/false", "the Council's step-5 move was a fallback"),
    },
    "player_days": {
        "score_delta": ("points", "today's change in score (engine's day delta); blank for the World"),
        "score_running": ("points", "score so far in the run"),
        "fallbacks": ("count", "answer steps that fell back today"),
        "fallback_steps": ("list", "which steps fell back"),
        "retries": ("count", "answers that needed the one retry"),
        "refusals": ("count", "fallbacks with reason 'refused' plus calls with stop 'refused'"),
        "failed_calls": ("count", "ledger calls with ok = 0"),
        "key_fallbacks": ("count", "calls paid with another participant's key"),
        "diary_words": ("words", "length of today's diary entry"),
        "forgot": ("count", "own diary entries the player deleted today"),
        "messages_sent": ("count", "private messages sent today"),
        "confidant_texts": ("count", "non-empty texts to Sam today (0 to 2)"),
    },
    "forecasts": {
        "event": ("name", "p_crime, p_inspect, p_families_respect, p_saltdogs_respect, p_any_bribe_accepted or p_any_audit; p_both_respect in exports from before rules draft 4"),
        "district": ("name", "district for p_crime and p_inspect; blank for city events"),
        "p": ("probability", "the stated forecast"),
        "outcome": ("true/false/blank", "what happened; blank for a closed district"),
        "own_move": ("true/false", "the player's own move decides the event (gang: own crime districts, own respect, any-bribe, and both-respect in old exports; Chief: inspections, any-bribe; Council: any-audit)"),
        "scored": ("true/false", "counts in the Brier score: has an outcome, is a probability, and is not an own-move event"),
        "why_not": ("text", "why an unscored row is left out"),
    },
    "turf_moves": {
        "Families": ("respect/encroach", "the Families' turf move"),
        "Saltdogs": ("respect/encroach", "the Saltdogs' turf move"),
        "Families_fallback": ("true/false", "the Families' move was a fallback"),
        "Saltdogs_fallback": ("true/false", "the Saltdogs' move was a fallback"),
    },
    "calls": {
        "seq": ("integer", "order of the call within the day"),
        "step": ("name", "messages, confide_before, offers, answers, confide_after, act, wire"),
        "provider": ("name", "anthropic, google or openai"),
        "model_reported": ("model id", "model version the provider reported"),
        "payer_name": ("name", "participant whose key paid"),
        "fallback_key": ("0/1", "1 when the call used another participant's key"),
        "payback": ("0/1", "1 when a participant's key paid back earlier fallback costs (#117); not a fallback"),
        "ok": ("0/1", "the call succeeded"),
        "stop": ("label", "normalised stop reason: done, max_tokens, refused, other"),
        "input": ("tokens", "input tokens"),
        "cached_input": ("tokens", "input tokens read from cache"),
        "cache_write": ("tokens", "input tokens written to cache"),
        "output": ("tokens", "output tokens, reasoning included"),
        "reasoning": ("tokens", "reasoning tokens"),
        "error": ("text", "provider error for a failed call"),
        "latency_ms": ("milliseconds", "call latency"),
        "day_saved": ("0/1", "as exported by the ledger (the day's record was saved)"),
    },
    "answers": {
        "step": ("name", "answer step"),
        "source": ("player/retry/fallback", "where the answer came from"),
        "reason": ("refused/invalid/error", "why a fallback happened"),
        "errors": ("text", "validation or provider errors behind a retry or fallback"),
    },
    "rates_by_run": {
        "measure": ("crime/inspection/audit", "crime per open district-day; inspection per inspectable district-day; audit per open district-day"),
    },
    "rates_by_family_seat": {
        "measure": ("crime/inspection/audit", "as in rates_by_run, pooled over runs"),
    },
    "bribes": {
        "measure": ("name", "offer rate (per open own district-day), acceptance rate (per offer), audit-bribe link (per day)"),
        "n": ("count", "open own district-days, offers, or days, by measure"),
        "mean_amount": ("money", "mean bribe offered (Chief row: over the offers it answered)"),
        "share_over_10": ("share 0 to 1", "offers above 10, which overpay at the inspection equilibrium"),
        "h3_payoff_agreement": ("share 0 to 1", "Chief answers that follow its payoff: accept when b > 100 a_hat (a_hat: audits per open district-day so far, smoothed toward 0.10 with 10 pseudo district-days)"),
        "h3_offers_when_a_below_line": ("count", "offers made while a_hat < 0.10"),
        "h3_accept_rate_when_a_below_line": ("share 0 to 1", "acceptance rate of those offers (H3)"),
        "audit_rate": ("share 0 to 1", "days with at least one audit"),
        "bribe_rate": ("share 0 to 1", "days with at least one accepted bribe"),
        "phi_same_day": ("correlation -1 to 1", "same-day link between audits and accepted bribes"),
        "bribes_after_audit": ("share 0 to 1", "bribe days among days after an audit"),
        "bribes_after_no_audit": ("share 0 to 1", "bribe days among days after no audit"),
    },
    "beliefs": {
        "event": ("name", "'all' or one event type"),
        "n": ("count", "scored forecasts"),
        "days": ("count", "days with a scored forecast"),
        "mean_forecast": ("probability", "mean stated forecast"),
        "observed": ("share 0 to 1", "share of those events that happened"),
        "brier": ("score 0 to 1", "mean squared error; 0 perfect, 0.25 a coin"),
        "brier_skill": ("skill, at most 1", "1 - Brier / Brier of each event type's base rate in the run (rules 5, for H6)"),
        "brier_skill_pooled": ("skill, at most 1", "metrics.beliefs.brier_skill: against the base rate of the player's own scored events"),
        "log_score": ("nats, at most 0", "mean log score, forecasts clipped to [0.01, 0.99]; a coin scores -0.693"),
        "left_out_own_move": ("count", "forecasts left out because the player's own move decides them"),
    },
    "turf": {
        "days": ("count", "days with both turf moves"),
        "respected": ("count", "days the gang respected"),
        "cooperation": ("share 0 to 1", "respected / days"),
        "both_respect": ("share 0 to 1", "days both gangs respected"),
        "strategy": ("names", "best-fitting textbook strategies (ties listed)"),
        "agreement": ("share 0 to 1", "share of days the best strategy predicts the gang's move"),
        "fallback_days": ("count", "days the gang's move was a fallback"),
        "slope_per_day": ("share per day", "slope of cooperation on day (metrics.turf.age_trend)"),
        "p_drop": ("p-value", "one-sided permutation p for a falling slope (H4)"),
        "late_drop": ("share", "cooperation before the last 10 days minus in them"),
        "endgame_day_coef": ("log-odds per day", "day coefficient of the end-game logit with lagged moves"),
        "endgame_day_p": ("p-value", "two-sided Wald p of that coefficient"),
        "endgame_note": ("text", "why the regression has no result, or 'separation'"),
    },
    "turf_sfem": {
        "gang_runs": ("count", "gang-runs pooled (two per run)"),
        "tremble": ("share 0 to 1", "estimated chance a gang departs from its strategy on a day"),
        "loglik": ("log-likelihood", "fit of the mixture"),
        "share always respect": ("share 0 to 1", "estimated share of gangs playing it"),
        "share always encroach": ("share 0 to 1", "estimated share of gangs playing it"),
        "share grim trigger": ("share 0 to 1", "estimated share of gangs playing it"),
        "share tit-for-tat": ("share 0 to 1", "estimated share of gangs playing it (splits with grim trigger when the data can't tell them apart)"),
    },
    "welfare": {
        "total": ("points", "sum of daily welfare (metrics.welfare: bribes and taxes are transfers)"),
        "best": ("points", "12 per day: no crime, no inspections or audits, both gangs respect"),
        "share": ("share, can be negative", "total / best"),
        "loss_per_day": ("points per day", "(best - total) / days"),
        "engine_total": ("points", "sum of the engine's recorded day welfare"),
        "days_engine_disagrees": ("count", "days where the engine's number differs from the formula"),
    },
    "welfare_days": {
        "turf_total": ("points", "both gangs' turf payoffs (12, 10 or 4)"),
        "uninspected_crimes": ("count", "crimes not inspected"),
        "inspected_crimes": ("count", "crimes caught"),
        "inspections": ("count", "districts inspected"),
        "audits": ("count", "districts audited"),
        "welfare": ("points", "the formula's value for the day"),
        "engine_welfare": ("points", "the engine's recorded value"),
    },
    "fallbacks": {
        "answers": ("count", "final answers (player or fallback; retries not counted twice)"),
        "fallbacks": ("count", "answers the engine built as a fallback"),
        "fallback_rate": ("share 0 to 1", "fallbacks / answers"),
        "fallback_refused": ("count", "fallbacks after a refusal"),
        "fallback_invalid": ("count", "fallbacks after two invalid answers"),
        "fallback_error": ("count", "fallbacks after a provider or key error"),
        "retries": ("count", "answers that needed the retry"),
        "failed_calls": ("count", "calls with ok = 0"),
        "refused_calls": ("count", "calls with stop 'refused'"),
        "key_fallback_calls": ("count", "calls paid with another participant's key"),
        "refusal_rate": ("share 0 to 1", "(refused fallbacks + refused calls) / calls"),
        "key_fallback_rate": ("share 0 to 1", "key_fallback_calls / calls"),
    },
    "costs": {
        "provider": ("name", "provider"),
        "ok_calls": ("count", "successful calls"),
        "input": ("tokens", "input tokens"),
        "cached_input": ("tokens", "cached input tokens"),
        "cache_write": ("tokens", "cache-write tokens"),
        "output": ("tokens", "output tokens"),
        "reasoning": ("tokens", "reasoning tokens"),
        "cost_per_call": ("US dollars", "cost / successful calls"),
        "latency_median_ms": ("milliseconds", "median latency of successful calls"),
        "latency_max_ms": ("milliseconds", "longest latency"),
    },
    "family_means": {
        "measure": ("name", "a run-level value: crime, inspection or audit rate, cooperation, welfare share, Brier skill per player"),
        "runs": ("count", "runs (the clusters)"),
        "mean": ("as measure", "mean of the run-level values"),
        "sd": ("as measure", "standard deviation over runs"),
        "low": ("as measure", "lower end of the t interval over runs (blank under 2 runs)"),
        "high": ("as measure", "upper end of the t interval over runs"),
    },
    "family_pairs": {
        "family_a": ("name", "first family"),
        "family_b": ("name", "second family"),
        "diff_a_minus_b": ("as measure", "difference of run-level means"),
        "low": ("as measure", "lower end of the Welch 95% interval"),
        "high": ("as measure", "upper end"),
        "t": ("t statistic", "Welch t"),
        "df": ("degrees of freedom", "Welch-Satterthwaite"),
        "p": ("p-value", "two-sided"),
        "runs_a": ("count", "runs for family a"),
        "runs_b": ("count", "runs for family b"),
        "tier": ("name", "exploratory"),
        "method": ("name", "Benjamini-Hochberg, across all pairs in the file"),
        "q": ("q-value", "BH-adjusted p"),
        "reject": ("true/false", "q <= 0.05"),
    },
    "confirmatory": {
        "test": ("name", "hypothesis and where it was tested"),
        "estimate": ("as test", "inspection rate (H2) or cooperation slope per day (H4)"),
        "p": ("p-value", "unadjusted p"),
        "holm_adjusted": ("p-value", "Holm-adjusted across the rows of this file"),
        "reject": ("true/false", "adjusted p <= 0.05"),
        "tier": ("name", "confirmatory"),
        "method": ("name", "Holm"),
    },
    "outliers": {
        "level": ("run/day/call/player", "where the flag sits"),
        "kind": ("label", "what was flagged"),
        "seq": ("integer", "ledger seq of the flagged call"),
        "value": ("as kind", "the flagged value"),
        "z": ("modified z", "0.6745 (x - median) / MAD, for robust flags; threshold 3.5"),
        "why": ("text", "the reason in words"),
    },
}


def entry(table, col):
    return PER_TABLE.get(table, {}).get(col) or COMMON.get(col)


def undocumented(cols):
    """{table: [columns with no entry]} for {table: columns}."""
    return {t: [c for c in cs if entry(t, c) is None] for t, cs in cols.items() if any(entry(t, c) is None for c in cs)}


def describe(cols, counts, run_ids):
    """README.md text for a worksheet directory."""
    lines = [
        "# Tidewall worksheets",
        "",
        f"Built by `python3 -m analysis.worksheets` from {len(run_ids)} run exports: {', '.join(map(str, run_ids))}.",
        "Not committed. Rebuild from the exports whenever they change.",
        "",
        "Rates come with a Wilson 95% interval. Run-level comparisons of families are provisional",
        "(a t interval over runs, the run as the cluster) until the mixed model is chosen.",
        "Confirmatory tests use Holm; exploratory family comparisons use Benjamini-Hochberg.",
        "Blank cells are missing or undefined values (for example an interval from one run).",
        "",
        "## Files",
        "",
        "| File | Rows | One row is | Serves |",
        "|---|---|---|---|",
    ]
    for t in cols:
        what, serves = TABLES.get(t, ("", ""))
        lines.append(f"| {t}.csv | {counts.get(t, 0)} | {what} | {serves} |")
    for t, cs in cols.items():
        lines += ["", f"## {t}.csv", "", "| Column | Unit | Meaning |", "|---|---|---|"]
        for c in cs:
            unit, meaning = entry(t, c) or ("", "undocumented")
            lines.append(f"| {c} | {unit} | {meaning} |")
    return "\n".join(lines) + "\n"

PER_TABLE["fallbacks_by_family_seat"] = PER_TABLE["fallbacks"]
PER_TABLE["costs_by_family_seat"] = PER_TABLE["costs"]
