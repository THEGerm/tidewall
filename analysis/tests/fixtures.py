"""Small hand-made exports with known answers."""

ALL = ["Port", "Hightown", "Old Quarter", "Lowtown", "Market", "Seawall"]


def day(n, open_=ALL, offers=None, accepted=(), crime=(), turf=("respect", "respect"),
        inspect=(), audit=(), welfare=None, storm=False):
    return {
        "day": n,
        "nature": {"storm": storm, "fire": None, "strike": False, "ship": False},
        "open": list(open_),
        "moves": {
            "offers": offers or {"Families": {}, "Saltdogs": {}},
            "accepted": list(accepted),
            "crime": {d: d in crime for d in open_},
            "turf": {"Families": turf[0], "Saltdogs": turf[1]},
            "inspect": list(inspect),
            "audit": list(audit),
        },
        "delta": {"Council": -1, "Chief": 2, "Families": 3, "Saltdogs": 4},
        "welfare": welfare,
        "ended": False,
    }


def call(d, seq, player, step="act", ok=1, stop="done", error=None, latency=1000, cost=0.001,
         provider="anthropic", model="claude-test", output=100, reasoning=0, fallback_key=0):
    return {"day": d, "seq": seq, "player": player, "step": step, "provider": provider, "model": model,
            "model_reported": model if ok else None, "payer_name": "Germ", "fallback_key": fallback_key,
            "ok": ok, "stop": stop if ok else None, "input": 1000 if ok else None, "cached_input": 0,
            "cache_write": 0, "output": output if ok else None, "reasoning": reasoning if ok else None,
            "cost_usd": cost if ok else None, "error": error, "latency_ms": latency if ok else None, "day_saved": 1}


def small():
    """Three days. Known answers:

    crime: 3 of 17 open district-days (Families 2 of 8, Saltdogs 1 of 9)
    inspection: 3 of 16 inspectable (2 of 10 without the Chief's day-3 fallback)
    audit: 3 of 17
    welfare: -39, 10, -46
    """
    days = [
        day(1, offers={"Families": {"Port": 5}, "Saltdogs": {}}, accepted=["Port"], crime=["Port", "Lowtown"],
            inspect=["Lowtown", "Market"], audit=["Port"], welfare=-39),
        day(2, open_=ALL[1:], crime=[], turf=("encroach", "respect"), welfare=10, storm=True),
        day(3, crime=["Hightown"], turf=("encroach", "encroach"), inspect=["Hightown"], audit=["Market", "Seawall"],
            welfare=-46),
    ]
    forecasts = [
        {"day": 1, "player": "Families", "forecasts": {
            "p_crime": {"Port": 0.9, "Lowtown": 0.2}, "p_inspect": {"Port": 0.1},
            "p_both_respect": 0.5, "p_any_audit": 0.3}},
        {"day": 2, "player": "Chief", "forecasts": {
            "p_crime": {"Port": 0.5}, "p_inspect": {"Market": 0.4}, "p_any_audit": 0.5,
            "p_any_bribe_accepted": 0.2}},
        {"day": 2, "player": "Council", "forecasts": {"p_any_audit": 0.9, "p_both_respect": 0.4}},
    ]
    return {
        "run": {"id": "t1", "model_set": "test", "seed": "1", "triple": 0, "rotation": 1,
                "seating": {"Government": "claude", "Criminals": "gpt", "World": "gemini"},
                "rules_version": "draft-3", "status": "over"},
        "days": days,
        "events": [],
        "answers": [
            {"day": 1, "player": "Chief", "step": "act", "source": "player"},
            {"day": 3, "player": "Chief", "step": "act", "source": "fallback", "reason": "error",
             "errors": ["no participant has a working google key (last error: google: no_credit (400): FAILED_PRECONDITION: User location is not supported for the API use.)"]},
            {"day": 3, "player": "Families", "step": "act", "source": "player"},
            {"day": 2, "player": "Families", "step": "act", "source": "retry", "errors": ["bad"]},
            {"day": 2, "player": "Families", "step": "act", "source": "player"},
        ],
        "messages": [{"day": 1, "from": "Families", "to": "Chief", "text": "hello"},
                     {"day": 1, "from": "Families", "to": "Saltdogs", "text": "truce"}],
        "forecasts": forecasts,
        "diaries": [
            {"day": 1, "player": "Chief", "text": "one two three", "forgotten_on": 3},
            {"day": 2, "player": "Chief", "text": "four five", "forgotten_on": 3},
            {"day": 3, "player": "Chief", "text": "six", "forgotten_on": None},
        ],
        "wire": [],
        "confidant": [
            {"day": 2, "player": "Saltdogs", "window": "after", "text": '{"crime": {"Lowtown": false}, "turf": "respect"}', "reply": "I hear you."},
            {"day": 2, "player": "Families", "window": "before", "text": "We hold our ground.", "reply": "I hear you."},
            {"day": 2, "player": "Council", "window": "before", "text": None, "reply": None},
        ],
        "ledger": [
            call(1, 0, "Chief", provider="google", model="gemini-test"),
            call(1, 1, "Families", provider="openai", model="gpt-test", fallback_key=1),
            call(2, 0, "Families", provider="openai", model="gpt-test", stop="max_tokens"),
            call(3, 0, "Chief", provider="google", model="gemini-test", ok=0,
                 error="google: no_credit (400): FAILED_PRECONDITION: User location is not supported for the API use."),
            call(3, 1, "World", ok=0, error="anthropic: bad_key (403): forbidden: Request not allowed"),
        ],
    }


def long_run(n=8, rid="t2", seating=None):
    """n identical days: both gangs encroach, the Chief inspects every open
    district, the Council audits one, no crime."""
    days = [day(i, turf=("encroach", "encroach"), inspect=ALL, audit=["Port"], welfare=4 - 24 - 8) for i in range(1, n + 1)]
    return {"run": {"id": rid, "model_set": "test", "triple": 0, "rotation": 1,
                    "seating": seating or {"Government": "claude", "Criminals": "gpt", "World": "gemini"}},
            "days": days, "events": [], "answers": [], "messages": [], "forecasts": [], "diaries": [],
            "wire": [], "confidant": [], "ledger": []}
