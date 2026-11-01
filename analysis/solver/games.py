"""The 4 games of docs/rules.md (draft 4), solved from the numbers in params.py."""

import math
from fractions import Fraction as F

from ..metrics.week0 import trials_needed
from . import params as P
from .bimatrix import equilibria
from .stats import binomial_tail, rate_band

# Expected open districts a day: a storm closes the Port.
OPEN_PER_DAY = P.DISTRICTS - P.NATURE["storm"]


def _unique(eqs, name):
    assert len(eqs) == 1, f"{name}: expected one equilibrium, found {len(eqs)}"
    return eqs[0]


def inspection_matrices(chief_counts_damage=None):
    """Gang rows (Crime, Lie low) against Chief columns (Inspect, Don't), one district-day.

    chief_counts_damage: the #12 switch (rules 3.1). None means the params default.
    """
    if chief_counts_damage is None:
        chief_counts_damage = P.CHIEF_COUNTS_DAMAGE
    gang = [[-P.FINE, P.CRIME_GAIN], [0, 0]]
    if chief_counts_damage:
        police = [[-P.INSPECTION_COST, -P.CRIME_DAMAGE], [-P.INSPECTION_COST, 0]]
    else:
        # The Chief's stated payoff only: money, no performance mark.
        police = [[-P.INSPECTION_COST, 0], [-P.INSPECTION_COST, 0]]
    return gang, police


def _inspection_eq(chief_counts_damage, name):
    x, y, gang_value, police_value = _unique(equilibria(*inspection_matrices(chief_counts_damage)), name)
    crime, inspect = x[0], y[0]
    return {
        "crime": crime,
        "inspect": inspect,
        "gang_value": gang_value,
        "police_value": police_value,
        "damage": crime * (1 - inspect) * P.CRIME_DAMAGE,  # expected, per district-day
    }


def prison(arrest):
    """Prison at equilibrium. arrest: chance of an arrest per open district-day."""
    per_day = OPEN_PER_DAY * arrest
    held_days = P.SENTENCE_DAYS * P.DISTRICTS  # district-days whose arrests are still inside
    return {
        "sentence_days": P.SENTENCE_DAYS,
        "places": P.PRISON_PLACES,
        "arrests_per_day": per_day,
        # Little's law: inflow x stay. Arrested on day t, released on day t + sentence.
        "expected_occupancy": per_day * P.SENTENCE_DAYS,
        "expected_occupancy_all_open": P.DISTRICTS * arrest * P.SENTENCE_DAYS,
        "most_possible": P.ARREST_CAP * P.SENTENCE_DAYS,
        # Occupancy is at most Binomial(60, arrest), all districts open, no arrest cap.
        "full_at_most": binomial_tail(arrest, held_days, P.PRISON_PLACES - 1),
    }


def inspection():
    eq = _inspection_eq(None, "inspection")
    alt = _inspection_eq(False, "inspection, Chief's stated payoff")
    crime, inspect = eq["crime"], eq["inspect"]
    arrest = crime * inspect  # per open district-day
    d = P.DISTRICTS

    def per(n):
        return {
            "crimes": n * crime,
            "inspections": n * inspect,
            "arrests": n * arrest,
            "uninspected_crimes": n * crime * (1 - inspect),
            "crime_damage": n * eq["damage"],
            "inspection_cost": n * inspect * P.INSPECTION_COST,
        }

    return {
        "chief_counts_damage": P.CHIEF_COUNTS_DAMAGE,
        "inspection_pays_when": "%s q > %s, so q > %s" % (P.CRIME_DAMAGE, P.INSPECTION_COST,
                                                          F(P.INSPECTION_COST, P.CRIME_DAMAGE)),
        "per_district": {
            "crime": crime,
            "inspect": inspect,
            "gang_value": eq["gang_value"],
            "police_value": eq["police_value"],
        },
        "per_day": per(d),  # a day with all 6 districts open
        "open_districts_per_day": OPEN_PER_DAY,
        "per_average_day": per(OPEN_PER_DAY),  # the Port closed on 10% of days
        "arrest_cap_binds": binomial_tail(arrest, d, P.ARREST_CAP),
        "prison_fills_if_sentence_over_days": P.PRISON_PLACES / (d * arrest),
        "prison": prison(arrest),
        "with_chief_stated_payoff": {"crime": alt["crime"], "inspect": alt["inspect"]},
    }


def turf(continue_=None):
    R, T, S, Pn = P.TURF_R, P.TURF_T, P.TURF_S, P.TURF_P
    delta = 1 - P.END_CHANCE if continue_ is None else continue_
    A = [[R, S], [T, Pn]]  # rows and columns: Respect, Encroach
    B = [[R, T], [S, Pn]]
    stage = [(x[0], y[0]) for x, y, _, _ in equilibria(A, B)]
    grim = F(T - R, T - Pn)
    tft_alternate = F(T - R, R - S)
    tft_forgive_defection = F(Pn - S, T - Pn)
    tft = max(grim, tft_alternate)
    return {
        "stage_equilibria_respect_prob": stage,
        "grim_trigger_threshold": grim,
        "tft_nash_threshold": tft,
        # TFT is subgame perfect only if delta == (T-R)/(R-S) and delta <= (P-S)/(T-P).
        "tft_subgame_perfect": delta == tft_alternate and delta <= tft_forgive_defection,
        "tft_spe_needs": {"delta_equals": tft_alternate, "delta_at_most": tft_forgive_defection},
        "mutual_respect_beats_alternating": T + S < 2 * R,
        "continue": delta,  # from day MIN_DAYS on
        "continue_before_min_days": 1,
        "grim_holds": delta >= grim,
        "tft_nash_holds": delta >= tft,
        "continuation_note": "Before day %d the game surely goes on, so cooperation is easier to "
        "sustain there than from day %d on. The %d-day cap is never told to players, so they have "
        "no known last day and no backward induction." % (P.MIN_DAYS, P.MIN_DAYS, P.HIDDEN_CAP),
        "values": {  # expected totals from day MIN_DAYS on
            "respect_forever": R / (1 - delta),
            "encroach_forever": Pn / (1 - delta),
            "deviate_against_grim": T + delta * Pn / (1 - delta),
            "alternate_against_tft": (T + delta * S) / (1 - delta**2),
        },
    }


def bribery_audit_matrices(bribe, chief_counts_damage=False, refuse_value=0, damage_if_refused=0):
    """Chief rows (Take, Refuse) against Council columns (Audit, Don't), one district-day
    with an offer of `bribe`.

    A taken bribe means sure crime there (the gang knows before moving, and the
    district can't be inspected). With the #12 mark on, that costs the Chief 15.
    refuse_value is the Chief's expected payoff in the district without the bribe
    (the inspection equilibrium); damage_if_refused is the treasury's.
    """
    mark = P.CRIME_DAMAGE if chief_counts_damage else 0
    chief = [[bribe - P.SEIZURE - mark, bribe - mark], [refuse_value, refuse_value]]
    dmg = P.CRIME_DAMAGE
    council = [
        [P.SEIZURE - P.AUDIT_COST - dmg, -dmg],
        [-P.AUDIT_COST - damage_if_refused, -damage_if_refused],
    ]
    return chief, council


def _audit_game(bribe, counts, refuse_value, damage_if_refused):
    m = bribery_audit_matrices(bribe, counts, refuse_value, damage_if_refused)
    x, y, _, _ = _unique(equilibria(*m), "bribery audit at %s" % bribe)
    return {"bribe": bribe, "audit": y[0], "take": x[0]}


def _bribery_case(counts, skip_value, insp_eq):
    """Acceptance rule, deal window and audit games for one setting of the #12 mark."""
    mark = P.CRIME_DAMAGE if counts else 0
    refuse_value = insp_eq["police_value"]
    # The Chief takes b when b - 100a - mark > refuse_value.
    premium = mark + refuse_value
    line = F(skip_value - premium, P.SEIZURE)
    needs = "%d a + %s" % (P.SEIZURE, premium) if premium else "%d a" % P.SEIZURE
    games = {b: _audit_game(b, counts, refuse_value, insp_eq["damage"]) for b in (skip_value, P.BRIBE_MAX)}
    return {
        "premium": premium,
        "chief_accepts_if": "b > " + needs,
        "audit_line": line,
        "deal_exists": line > 0,
        "deal_window": "bribe b with %s < b <= %s: non-empty only if a < %s" % (needs, skip_value, line)
        if line > 0 else "none: the Chief needs b > %s > %s, the most a gang gains" % (needs, skip_value),
        "audit_game_at_max_bribe": games[skip_value],
        "audit_game_at_top_offer": games[P.BRIBE_MAX],
    }


def bribery(insp):
    # What skipping inspection is worth to a gang: crime for sure, against its
    # value at the inspection equilibrium (mark on: inspections at 1/4).
    on = _inspection_eq(True, "inspection, mark on")
    off = _inspection_eq(False, "inspection, mark off")
    skip_value = P.CRIME_GAIN - on["gang_value"]
    money = _bribery_case(False, skip_value, off)
    mark = _bribery_case(True, skip_value, on)
    return {
        "skip_value": skip_value,
        # Mark off (the Chief's money only), as rules 3.3 states it.
        "audit_line": money["audit_line"],
        "deal_window": money["deal_window"],
        "audit_game_at_max_bribe": money["audit_game_at_max_bribe"],
        "audit_rate_formula": "a = b / %d (Chief indifferent, mark off)" % P.SEIZURE,
        "take_rate_formula": "c = %s / %s (Council indifferent: it gains the seizure)" % (P.AUDIT_COST, P.SEIZURE),
        "chief_accepts_if": money["chief_accepts_if"],
        "audit_game_at_top_offer": money["audit_game_at_top_offer"],
        "skip_value_mark_off": P.CRIME_GAIN - off["gang_value"],
        "council_indifferent_take_rate": F(P.AUDIT_COST, P.SEIZURE),
        "max_audit_rate": F(P.MAX_AUDITS, P.DISTRICTS),
        "max_audit_rate_port_closed": F(P.MAX_AUDITS, P.DISTRICTS - 1),
        "expected_audits_per_day_at_line": money["audit_line"] * OPEN_PER_DAY,
        # Mark on (#12, the default): the Chief also loses 15 for the sure crime.
        "with_performance_mark": mark,
        "default_case": "with_performance_mark" if P.CHIEF_COUNTS_DAMAGE else "mark off",
        "finding": "With the mark on, the Chief takes b only if b > 100a + 11, and a gang gains at most "
        "10, so no bribe both sides want exists for any a >= 0: no corruption in equilibrium. "
        "The a < 1/10 line holds only with the mark off, where the Chief never inspects and "
        "a gang gains nothing from a bribe.",
    }


def run_length(min_days, end_chance, cap):
    """Length L of a run: no end draw after days 1 to min_days - 1; after each day
    from min_days on the game ends with end_chance; the run stops at day cap."""
    q = 1 - end_chance

    def survive(n):  # P(L >= n), no cap
        return F(1) if n <= min_days else q ** (n - min_days)

    median = min_days
    while 1 - survive(median + 1) < F(1, 2):
        median += 1
    with_cap = sum(survive(n) for n in range(1, cap + 1))
    no_cap = (min_days - 1) + 1 / end_chance
    return {
        "expected_days_no_cap": no_cap,
        "expected_days_with_cap": with_cap,
        "reach_cap": survive(cap),
        "median_days": median,
        "expected_days_lost_to_cap": no_cap - with_cap,
    }


def end_rule():
    r = run_length(P.MIN_DAYS, P.END_CHANCE, P.HIDDEN_CAP)
    r.update({
        "min_days": P.MIN_DAYS,
        "end_chance": P.END_CHANCE,
        "cap_days": P.HIDDEN_CAP,
        "cap_told_to_players": False,
        "reach_cap_rules_say": "0.92^%d, about 1.8%%" % (P.HIDDEN_CAP - P.MIN_DAYS),
        "end_draws_before_cap": P.HIDDEN_CAP - P.MIN_DAYS,
        "alternative_plan_rev3": dict(
            run_length(P.ALT_MIN_DAYS, P.ALT_END_CHANCE, P.ALT_CAP),
            rule="plan rev 3, superseded: 2%% end chance after every day, %d-day cap told to players" % P.ALT_CAP),
    })
    return r


def information(end):
    days = end["expected_days_with_cap"]
    n = {k: p * days for k, p in P.NATURE.items()}
    return {
        "equilibrium": "The World has no payoff, so it is indifferent between all reporting rules: "
        "every rule is an equilibrium strategy for it. Any tilt is the model's own habit.",
        "nature_per_day": dict(P.NATURE),
        "nature_expected_per_run": n,
        "nature_expected_effects_per_run": {
            "port_days_closed": n["storm"],
            # A fire hits one of 6 districts at random; each gang holds 3.
            "fire_loss_per_gang": n["fire"] * P.FIRE_LOSS / 2,
            "strike_loss_treasury": n["strike"] * P.STRIKE_LOSS,
            "ship_gain_families": n["ship"] * P.SHIP_GAIN,
        },
        "nature_changes_no_equilibrium": True,
    }


def week0_bands(insp, brib, end):
    days = end["expected_days_with_cap"]
    n = round(days * OPEN_PER_DAY)  # expected open district-days in one run
    out = {"days": days, "level": P.BAND, "open_district_days": n}
    targets = {
        "crime_rate": insp["per_district"]["crime"],
        "inspection_rate": insp["per_district"]["inspect"],
        "audit_rate": brib["audit_line"],  # per district: audits / open district-days (H3)
    }
    for k, target in targets.items():
        trials = trials_needed(float(target), P.WEEK0_MARGIN, P.WEEK0_ALPHA, P.WEEK0_POWER)
        out[k] = {
            "target": target,
            "n": n,
            "band": rate_band(target, n, P.BAND),
            "equivalence": {
                "margin": P.WEEK0_MARGIN,
                "power": P.WEEK0_POWER,
                "open_district_days": trials,
                "bot_days": math.ceil(trials / OPEN_PER_DAY),
            },
        }
    out["turf"] = ("The turf bots play pure strategies, so cooperation has no noise: grim trigger against "
                   "grim trigger respects every day; always encroach never does; tit-for-tat against always "
                   "encroach respects on day 1 only.")
    return out


def plan_checks(insp, trf, brib, end):
    """The numbers docs/rules.md (draft 4) quotes, each checked against the solver.

    The key keeps its old name, plan_checks, so the JSON stays stable.
    """
    mark = brib["with_performance_mark"]
    return {
        "crime rate 4/15": insp["per_district"]["crime"] == P.RULES_CRIME_RATE,
        "inspection rate 1/4": insp["per_district"]["inspect"] == P.RULES_INSPECTION_RATE,
        "inspection pays when 15q > 4": F(P.INSPECTION_COST, P.CRIME_DAMAGE) == P.RULES_CRIME_RATE,
        "Chief's stated payoff: never inspects": insp["with_chief_stated_payoff"] == {"crime": 1, "inspect": 0},
        "grim threshold 0.5": trf["grim_trigger_threshold"] == P.RULES_GRIM_THRESHOLD,
        "0.92 above the grim and TFT thresholds": trf["grim_holds"] and trf["tft_nash_holds"],
        "continuation above 0.9": trf["continue"] > P.RULES_CONTINUE_ABOVE,
        "skip value about 10": brib["skip_value"] == P.CRIME_GAIN,
        "audit line 10% (mark off)": brib["audit_line"] == P.RULES_AUDIT_LINE,
        "2 audits reach a = 1/3": brib["max_audit_rate"] == P.RULES_MAX_AUDIT_RATE,
        "Council indifferent at 8%": brib["council_indifferent_take_rate"] == P.RULES_COUNCIL_INDIFFERENT,
        "mark on: Chief needs b > 100a + 11": mark["premium"] == 11,
        "mark on: no deal for any a": not mark["deal_exists"],
        "arrest cap binds only if over-policing": insp["arrest_cap_binds"] < F(1, 10**6),
        "prison never fills at equilibrium": insp["prison"]["full_at_most"] < F(1, 10**6),
        "cap reached 0.92^48": end["reach_cap"] == (1 - P.END_CHANCE) ** (P.HIDDEN_CAP - P.MIN_DAYS),
        "cap reached about 1.8%": abs(end["reach_cap"] - P.RULES_REACH_CAP_APPROX) < F(5, 10000),
    }


def solve_all():
    insp = inspection()
    trf = turf()
    brib = bribery(insp)
    end = end_rule()
    return {
        "source": "docs/rules.md draft 4 (1 Nov 2026), numbers in analysis/solver/params.py",
        "plan_checks": plan_checks(insp, trf, brib, end),
        "inspection": insp,
        "turf": trf,
        "bribery": brib,
        "end_rule": end,
        "information": information(end),
        "week0_bands": week0_bands(insp, brib, end),
        "open_questions": P.OPEN_QUESTIONS,
    }
