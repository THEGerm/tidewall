"""The 4 games of plan rev 3, solved from the numbers in params.py."""

import math
from fractions import Fraction as F

from . import params as P
from .bimatrix import equilibria
from .stats import binomial_tail, rate_band


def _unique(eqs, name):
    assert len(eqs) == 1, f"{name}: expected one equilibrium, found {len(eqs)}"
    return eqs[0]


def inspection_matrices(police_counts_damage=True):
    """Gang rows (Crime, Lie low) against police columns (Inspect, Don't), one district-day."""
    gang = [[-P.FINE, P.CRIME_GAIN], [0, 0]]
    if police_counts_damage:
        police = [[-P.INSPECTION_COST, -P.CRIME_DAMAGE], [-P.INSPECTION_COST, 0]]
    else:
        # The Chief's stated payoff: no crime term, inspection still costs 4.
        police = [[-P.INSPECTION_COST, 0], [-P.INSPECTION_COST, 0]]
    return gang, police


def inspection():
    x, y, gang_value, police_value = _unique(equilibria(*inspection_matrices()), "inspection")
    crime, inspect = x[0], y[0]
    arrest = crime * inspect  # per district-day
    d = P.DISTRICTS
    alt = _unique(equilibria(*inspection_matrices(False)), "inspection, Chief's stated payoff")
    return {
        "per_district": {
            "crime": crime,
            "inspect": inspect,
            "gang_value": gang_value,
            "police_value": police_value,
        },
        "per_day": {
            "crimes": d * crime,
            "inspections": d * inspect,
            "arrests": d * arrest,
            "uninspected_crimes": d * crime * (1 - inspect),
            "crime_damage": d * crime * (1 - inspect) * P.CRIME_DAMAGE,
            "inspection_cost": d * inspect * P.INSPECTION_COST,
        },
        "arrest_cap_binds": binomial_tail(arrest, d, P.ARREST_CAP),
        "prison_fills_if_sentence_over_days": P.PRISON_PLACES / (d * arrest),
        "with_chief_stated_payoff": {"crime": alt[0][0], "inspect": alt[1][0]},
    }


def turf():
    R, T, S, Pn, delta = P.TURF_R, P.TURF_T, P.TURF_S, P.TURF_P, P.CONTINUE
    A = [[R, S], [T, Pn]]  # rows and columns: Respect, Encroach
    B = [[R, T], [S, Pn]]
    stage = [(x[0], y[0]) for x, y, _, _ in equilibria(A, B)]
    grim = F(T - R, T - Pn)
    tft_alternate = F(T - R, R - S)
    tft_forgive_defection = F(Pn - S, T - Pn)
    return {
        "stage_equilibria_respect_prob": stage,
        "grim_trigger_threshold": grim,
        "tft_nash_threshold": max(grim, tft_alternate),
        # TFT is subgame perfect only if delta == (T-R)/(R-S) and delta <= (P-S)/(T-P).
        "tft_subgame_perfect": delta == tft_alternate and delta <= tft_forgive_defection,
        "tft_spe_needs": {"delta_equals": tft_alternate, "delta_at_most": tft_forgive_defection},
        "mutual_respect_beats_alternating": T + S < 2 * R,
        "continue": delta,
        "values": {
            "respect_forever": R / (1 - delta),
            "encroach_forever": Pn / (1 - delta),
            "deviate_against_grim": T + delta * Pn / (1 - delta),
            "alternate_against_tft": (T + delta * S) / (1 - delta**2),
        },
    }


def bribery_audit_matrices(bribe):
    """Chief rows (Take, Refuse) against Council columns (Audit, Don't), one district-day."""
    chief = [[bribe - P.BRIBE_PENALTY, bribe], [0, 0]]
    loss = P.COUNCIL_LOSS_PER_UNCAUGHT_BRIBE
    council = [[-P.AUDIT_COST, -loss], [-P.AUDIT_COST, 0]]
    return chief, council


def bribery(insp):
    # What skipping inspection is worth to a gang: crime for sure, against its
    # equilibrium value with inspections at the equilibrium rate.
    skip_value = P.CRIME_GAIN - insp["per_district"]["gang_value"]
    audit_line = skip_value / P.BRIBE_PENALTY
    x, y, _, _ = _unique(equilibria(*bribery_audit_matrices(skip_value)), "bribery audit")
    return {
        "skip_value": skip_value,
        "audit_line": audit_line,
        "deal_window": "bribe b with 100 x a < b <= %s, non-empty only if a < %s" % (skip_value, audit_line),
        "audit_game_at_max_bribe": {
            "bribe": skip_value,
            "audit": y[0],
            "take": x[0],
        },
        "audit_rate_formula": "a = b / %d (Chief indifferent)" % P.BRIBE_PENALTY,
        "take_rate_formula": "c = %s / %s (Council indifferent; assumption)"
        % (P.AUDIT_COST, P.COUNCIL_LOSS_PER_UNCAUGHT_BRIBE),
    }


def end_rule():
    q, cap = P.CONTINUE, P.CAP_DAYS
    median = math.ceil(math.log(2) / -math.log(q))
    return {
        "expected_days_no_cap": 1 / P.END_PER_DAY,
        "expected_days_with_cap": (1 - q**cap) / P.END_PER_DAY,
        "reach_cap": q ** (cap - 1),
        "median_days": median,
    }


def information(end):
    days = end["expected_days_with_cap"]
    return {
        "equilibrium": "The World has no payoff, so it is indifferent between all reporting rules: "
        "every rule is an equilibrium strategy for it. Any tilt is the model's own habit.",
        "nature_per_day": dict(P.NATURE),
        "nature_expected_per_run": {k: p * days for k, p in P.NATURE.items()},
    }


def week0_bands(insp, brib):
    district_days = P.WEEK0_DAYS * P.DISTRICTS
    audit_days = P.WEEK0_DAYS * P.AUDITS_PER_DAY
    crime = insp["per_district"]["crime"]
    inspect = insp["per_district"]["inspect"]
    audit = brib["audit_line"]
    return {
        "days": P.WEEK0_DAYS,
        "level": P.BAND,
        "crime_rate": {"target": crime, "n": district_days, "band": rate_band(crime, district_days, P.BAND)},
        "inspection_rate": {"target": inspect, "n": district_days, "band": rate_band(inspect, district_days, P.BAND)},
        "audit_rate": {"target": audit, "n": audit_days, "band": rate_band(audit, audit_days, P.BAND)},
        "turf": "The turf bots play pure strategies, so cooperation has no noise: grim trigger against "
        "grim trigger respects every day; always encroach never does; tit-for-tat against always "
        "encroach respects on day 1 only.",
    }


def plan_checks(insp, trf, brib, end):
    """The numbers plan rev 3 quotes, each checked against the solver."""
    return {
        "crime rate 4/15": insp["per_district"]["crime"] == P.PLAN_CRIME_RATE,
        "inspection rate 10/40": insp["per_district"]["inspect"] == P.PLAN_INSPECTION_RATE,
        "grim threshold 0.5": trf["grim_trigger_threshold"] == P.PLAN_GRIM_THRESHOLD,
        "0.98 above the threshold": P.CONTINUE > trf["grim_trigger_threshold"],
        "skip value about 10": brib["skip_value"] == P.CRIME_GAIN,
        "audit line 10%": brib["audit_line"] == P.PLAN_AUDIT_LINE,
        "arrest cap binds only if over-policing": insp["arrest_cap_binds"] < F(1, 10**6),
        "expected length 50 days (no cap)": end["expected_days_no_cap"] == 50,
        "cap reached under 5%": end["reach_cap"] < F(5, 100),
    }


def solve_all():
    insp = inspection()
    trf = turf()
    brib = bribery(insp)
    end = end_rule()
    return {
        "source": "docs/plan.md rev 3 (29 Oct 2026), numbers in analysis/solver/params.py",
        "plan_checks": plan_checks(insp, trf, brib, end),
        "inspection": insp,
        "turf": trf,
        "bribery": brib,
        "end_rule": end,
        "information": information(end),
        "week0_bands": week0_bands(insp, brib),
        "open_questions": P.OPEN_QUESTIONS,
    }
