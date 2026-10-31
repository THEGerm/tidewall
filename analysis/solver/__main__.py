"""python3 -m analysis.solver [--check]

Prints the equilibria and writes analysis/solver/equilibria.json.
With --check, writes nothing and fails if the JSON file is out of date.
"""

import json
import sys
from fractions import Fraction as F
from pathlib import Path

from .games import solve_all

OUT = Path(__file__).with_name("equilibria.json")


def plain(x):
    """Fractions become {"exact": "4/15", "value": 0.266667}; huge ones keep only the value (6 significant digits)."""
    if isinstance(x, F):
        value = float(f"{float(x):.6g}")
        if x.denominator == 1:
            return int(x)
        return {"exact": str(x), "value": value} if x.denominator < 10**6 else {"value": value}
    if isinstance(x, dict):
        return {k: plain(v) for k, v in x.items()}
    if isinstance(x, (list, tuple)):
        return [plain(v) for v in x]
    return x


def pct(x):
    return f"{float(x) * 100:.1f}%"


def report(r):
    insp, trf, brib, end, info, bands = (
        r["inspection"], r["turf"], r["bribery"], r["end_rule"], r["information"], r["week0_bands"])
    d, day, pr = insp["per_district"], insp["per_average_day"], insp["prison"]
    mark = brib["with_performance_mark"]
    alt = end["alternative_plan_rev3"]
    nat = info["nature_expected_effects_per_run"]
    lines = [
        "Tidewall solver, rules.md draft 3",
        "",
        f"1. Inspection game, one open district (Chief counts crime damage: {insp['chief_counts_damage']})",
        f"   gang commits crime {d['crime']} ({pct(d['crime'])}), Chief inspects {d['inspect']} ({pct(d['inspect'])}); "
        f"inspection pays when {insp['inspection_pays_when']}",
        f"   per average day ({float(insp['open_districts_per_day'])} open districts): {float(day['crimes']):.2f} crimes, "
        f"{float(day['inspections']):.2f} inspections, {float(day['arrests']):.3f} arrests, damage {float(day['crime_damage']):.1f}",
        f"   arrest cap of 5 binds with probability {float(insp['arrest_cap_binds']):.2e}",
        f"   prison: sentence {pr['sentence_days']}, expected occupancy {float(pr['expected_occupancy']):.2f} of "
        f"{pr['places']}; full with probability under {float(pr['full_at_most']):.1e}",
        f"   with the Chief's stated payoff (no performance mark): crime {pct(insp['with_chief_stated_payoff']['crime'])}, "
        f"inspect {pct(insp['with_chief_stated_payoff']['inspect'])}",
        "",
        "2. Turf war",
        f"   one day: both encroach (respect probability {trf['stage_equilibria_respect_prob'][0][0]})",
        f"   grim trigger holds above {trf['grim_trigger_threshold']}; tit-for-tat is a Nash equilibrium above "
        f"{trf['tft_nash_threshold']}; continue = {trf['continue']} from day {end['min_days']} (1 before)",
        f"   tit-for-tat subgame perfect: {trf['tft_subgame_perfect']}",
        f"   expected totals from day {end['min_days']}: respect forever {float(trf['values']['respect_forever'])}, "
        f"encroach forever {float(trf['values']['encroach_forever'])}, "
        f"deviate against grim {float(trf['values']['deviate_against_grim'])}",
        "",
        "3. Bribery",
        f"   skipping inspection is worth {brib['skip_value']} a day to a gang",
        f"   mark off: Chief takes if {brib['chief_accepts_if']}; corruption pays below a = {brib['audit_line']}; "
        f"at b = {brib['audit_game_at_max_bribe']['bribe']} Council audits {brib['audit_game_at_max_bribe']['audit']}, "
        f"Chief takes {brib['audit_game_at_max_bribe']['take']}",
        f"   mark on (default): Chief takes if {mark['chief_accepts_if']}; deal window: {mark['deal_window']}",
        f"   Council indifferent when {pct(brib['council_indifferent_take_rate'])} of district-days carry a taken bribe; "
        f"2 audits reach a = {brib['max_audit_rate']} ({brib['max_audit_rate_port_closed']} with the Port closed)",
        "",
        "4. Information game",
        f"   {info['equilibrium']}",
        "   Nature, expected per run: "
        + ", ".join(f"{k} {float(v):.2f}" for k, v in info["nature_expected_per_run"].items()),
        f"   effects per run: Port closed {float(nat['port_days_closed']):.2f} days, fire -{float(nat['fire_loss_per_gang']):.1f} "
        f"per gang, strike -{float(nat['strike_loss_treasury']):.1f} treasury, ship +{float(nat['ship_gain_families']):.1f} Families",
        "",
        "Run length",
        f"   {end['min_days']} days sure, then {pct(end['end_chance'])} a day, hidden cap {end['cap_days']}",
        f"   expected {float(end['expected_days_no_cap'])} days without the cap, {float(end['expected_days_with_cap']):.2f} "
        f"with it; median {end['median_days']}; reach day {end['cap_days']}: {float(end['reach_cap']) * 100:.2f}%",
        f"   old rule ({alt['rule']}): {float(alt['expected_days_with_cap']):.1f} days, median {alt['median_days']}, "
        f"cap {pct(alt['reach_cap'])}",
        "",
        f"Week-0 bands ({float(bands['days']):.1f} days, {bands['open_district_days']} open district-days, {pct(bands['level'])})",
    ]
    for k in ("crime_rate", "inspection_rate", "audit_rate"):
        b = bands[k]
        e = b["equivalence"]
        lines.append(f"   {k}: {pct(b['target'])}, expect {pct(b['band'][0])} to {pct(b['band'][1])} (n = {b['n']}); "
                     f"within {e['margin']} at {pct(e['power'])} power: {e['bot_days']} bot days")
    lines += ["", "Rules checks"]
    lines += [f"   {'ok  ' if ok else 'FAIL'} {name}" for name, ok in r["plan_checks"].items()]
    lines += ["", f"Open questions: {len(r['open_questions'])}, listed in {OUT.name} and the README"]
    return "\n".join(lines)


def main(argv):
    r = solve_all()
    text = json.dumps(plain(r), indent=2, ensure_ascii=False) + "\n"
    if "--check" in argv:
        if not OUT.exists() or OUT.read_text() != text:
            print(f"{OUT.name} is out of date: run python3 -m analysis.solver")
            return 1
    else:
        print(report(r))
        OUT.write_text(text)
    return 0 if all(r["plan_checks"].values()) else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
