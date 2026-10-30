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
    d, day = insp["per_district"], insp["per_day"]
    lines = [
        "Tidewall solver, plan rev 3",
        "",
        "1. Inspection game, one district",
        f"   gang commits crime {d['crime']} ({pct(d['crime'])}), police inspect {d['inspect']} ({pct(d['inspect'])})",
        f"   per day over 6 districts: {float(day['crimes'])} crimes, {float(day['inspections'])} inspections, "
        f"{float(day['arrests'])} arrests, damage {float(day['crime_damage'])}",
        f"   arrest cap of 5 binds with probability {float(insp['arrest_cap_binds']):.2e}",
        f"   with the Chief's stated payoff (no crime term): crime {pct(insp['with_chief_stated_payoff']['crime'])}, "
        f"inspect {pct(insp['with_chief_stated_payoff']['inspect'])}",
        "",
        "2. Turf war",
        f"   one day: both encroach (respect probability {trf['stage_equilibria_respect_prob'][0][0]})",
        f"   grim trigger holds above {trf['grim_trigger_threshold']}; tit-for-tat is a Nash equilibrium above "
        f"{trf['tft_nash_threshold']}; continue = {trf['continue']}",
        f"   tit-for-tat subgame perfect: {trf['tft_subgame_perfect']}",
        f"   expected totals: respect forever {float(trf['values']['respect_forever'])}, "
        f"encroach forever {float(trf['values']['encroach_forever'])}, "
        f"deviate against grim {float(trf['values']['deviate_against_grim'])}",
        "",
        "3. Bribery",
        f"   skipping inspection is worth {brib['skip_value']} a day to a gang",
        f"   corruption pays below an audit rate of {brib['audit_line']} ({pct(brib['audit_line'])})",
        f"   audit game at the top bribe: Council audits {brib['audit_game_at_max_bribe']['audit']}, "
        f"Chief takes {brib['audit_game_at_max_bribe']['take']} (assumptions in params.py)",
        "",
        "4. Information game",
        f"   {info['equilibrium']}",
        "   Nature, expected per run: "
        + ", ".join(f"{k} {float(v):.1f}" for k, v in info["nature_expected_per_run"].items()),
        "",
        "End rule",
        f"   expected length {float(end['expected_days_no_cap'])} days without the cap, "
        f"{float(end['expected_days_with_cap']):.1f} with it; median {end['median_days']}; "
        f"reach day 150: {pct(end['reach_cap'])}",
        "",
        f"Week-0 bands ({bands['days']} days, {pct(bands['level'])})",
    ]
    for k in ("crime_rate", "inspection_rate", "audit_rate"):
        b = bands[k]
        lines.append(f"   {k}: {pct(b['target'])}, expect {pct(b['band'][0])} to {pct(b['band'][1])} (n = {b['n']})")
    lines += ["", "Plan checks"]
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
