"""H1 and H6 on synthetic Latin squares, and their row builders on a real
export. Standard library only, so these run in CI."""

import random
import unittest
from pathlib import Path

from analysis import data
from analysis.bayes import run_level as rl

FAMS = ("claude", "gemini", "gpt")
SEATS = ("Government", "Criminals", "World")
RUNS = Path(__file__).resolve().parents[3] / "data" / "runs" / "test"


def square(triples=9, model_fx=None, seat_fx=None, noise=0.05, seed=1):
    """Seat-run rows from a replicated 3 x 3 Latin square."""
    rng = random.Random(seed)
    model_fx = model_fx or {f: 0.0 for f in FAMS}
    seat_fx = seat_fx or {s: 0.0 for s in SEATS}
    rows = []
    for t in range(triples):
        for rot in range(3):
            for i, seat in enumerate(SEATS):
                fam = FAMS[(i + rot) % 3]
                rows.append({"run": f"t{t}r{rot}", "triple": t, "seat": seat, "model": fam,
                             "value": model_fx[fam] + seat_fx[seat] + rng.gauss(0, noise)})
    return rows


class H1(unittest.TestCase):
    def test_cooperative_gangs_clear_the_line(self):
        rows = [{"run": f"r{i}", "triple": i // 3, "share": 0.8 + 0.05 * ((i % 3) - 1)} for i in range(27)]
        r = rl.h1(rows, resamples=2000)
        self.assertTrue(r["clears"])
        self.assertAlmostEqual(r["estimate"], 0.8)
        self.assertLess(r["p"], 0.01)

    def test_half_and_half_does_not(self):
        rng = random.Random(3)
        rows = [{"run": f"r{i}", "triple": i // 3, "share": rng.choice([0.0, 1.0])} for i in range(27)]
        self.assertFalse(rl.h1(rows, resamples=2000)["clears"])

    def test_needs_two_triples(self):
        with self.assertRaises(ValueError):
            rl.h1([{"run": "a", "triple": 0, "share": 1.0}])

    def test_shares_from_an_export(self):
        r = rl.respect_shares([data.load(RUNS / "004-germ.json"), data.load(RUNS / "005-germ.json")])
        self.assertEqual(r[0]["share"], 0.0)          # 004: both gangs encroach every day
        self.assertAlmostEqual(r[1]["share"], 25 / 26)  # 005: one encroachment, on day 1


class H2b(unittest.TestCase):
    def test_pooled_gain_on_triple_means(self):
        rows = [{"run": i, "triple": i // 3, "gain": 0.05 + 0.01 * (i % 3) + 0.002 * (i // 3)} for i in range(27)]
        r = rl.h2b(rows)
        self.assertTrue(r["clears"])
        self.assertEqual((r["triples"], r["df"]), (9, 8))
        noise = [{"run": i, "triple": i // 3, "gain": (-1) ** (i // 3) * 0.02} for i in range(27)]
        self.assertFalse(rl.h2b(noise)["clears"])

    def test_edge_cases_with_no_spread(self):
        flat = lambda g: [{"run": i, "triple": i // 3, "gain": g} for i in range(9)]
        self.assertEqual(rl.h2b(flat(0.03))["p"], 0.0)
        self.assertEqual(rl.h2b(flat(-0.03))["p"], 1.0)  # not 0.5
        self.assertEqual(rl.h2b(flat(0.0))["p"], 1.0)
        with self.assertRaises(ValueError):
            rl.h2b(flat(0.01)[:3])  # one triple

    def test_gains_from_exports(self):
        r = rl.history_gains([data.load(RUNS / "004-germ.json"), data.load(RUNS / "005-germ.json")])
        self.assertEqual([x["run"] for x in r], ["004-germ", "005-germ"])
        self.assertTrue(all(x["gain"] == x["gain"] for x in r))  # not nan

    def test_only_inspectable_open_district_days_are_scored(self):
        from analysis.metrics import predictability
        insp = [[i % 2 == 0, False] for i in range(12)]
        crime = [[False, False] for _ in range(12)]
        all_ = predictability.history_gain(insp, crime, 3)
        first_only = predictability.history_gain(insp, crime, 3, score_mask=[[True, False] for _ in range(12)])
        self.assertGreater(first_only["gain_per_district_day"], all_["gain_per_district_day"])  # the dead column dilutes it
        none = predictability.history_gain(insp, crime, 3, score_mask=[[False, False] for _ in range(12)])
        self.assertEqual(none["days_scored"], 0)


class H6(unittest.TestCase):
    def test_omega_squared_splits_model_and_seat(self):
        w = rl.omega_squared(square(model_fx={"claude": 1, "gemini": 0, "gpt": -1}))
        self.assertGreater(w["model"], 0.9)
        self.assertLess(abs(w["seat"]), 0.02)
        w = rl.omega_squared(square(seat_fx={"Government": 1, "Criminals": 0, "World": -1}))
        self.assertGreater(w["seat"], 0.9)

    def test_model_wins(self):
        r = rl.h6(square(model_fx={"claude": 0.3, "gemini": 0, "gpt": -0.3}, seat_fx={"Government": 0.05, "Criminals": 0, "World": -0.05}), resamples=1000)
        self.assertTrue(r["clears"])
        self.assertGreater(r["low"], 0)

    def test_seat_wins(self):
        r = rl.h6(square(seat_fx={"Government": 0.3, "Criminals": 0, "World": -0.3}), resamples=1000)
        self.assertTrue(r["clears"])
        self.assertLess(r["high"], 0)

    def test_neither(self):
        r = rl.h6(square(noise=0.2, seed=4), resamples=1000)
        self.assertFalse(r["clears"])

    def test_unbalanced_square_uses_type_ii(self):
        rows = square(model_fx={"claude": 1, "gemini": 0, "gpt": -1}, noise=0.05)
        # Drop a third of one model's cells: the square is no longer balanced.
        dropped = [r for i, r in enumerate(rows) if not (r["model"] == "claude" and i % 3 == 0)]
        w = rl.omega_squared(dropped)
        self.assertGreater(w["model"], 0.9)
        self.assertLess(abs(w["seat"]), 0.03)
        # A seat effect confounded by the imbalance is still separated from model.
        rows = square(seat_fx={"Government": 1, "Criminals": 0, "World": -1}, noise=0.05)
        w = rl.omega_squared([r for r in rows if not (r["seat"] == "World" and r["model"] == "gpt")])
        self.assertGreater(w["seat"], 0.9)
        self.assertLess(abs(w["model"]), 0.03)

    def test_separated_rows_are_left_out_and_counted(self):
        rows = square(model_fx={"claude": 0.3, "gemini": 0, "gpt": -0.3})
        rows[0]["separated"] = True
        rows[5]["separated"] = True
        r = rl.h6(rows, resamples=200)
        self.assertEqual(sum(r["separated_left_out"].values()), 2)
        self.assertEqual(r["rows"], len(rows) - 2)

    def test_rows_from_exports(self):
        runs = [data.load(RUNS / f"00{i}-germ.json") for i in (4, 5)]
        b = rl.brier_skill_rows(runs)
        self.assertTrue(b and all(r["seat"] in SEATS and r["model"] in FAMS for r in b))
        lam = rl.lambda_rows(runs)
        self.assertTrue(lam, "lambda_rows found nothing in 004 and 005")
        self.assertTrue(all(r["seat"] in ("Government", "Criminals") for r in lam))
        self.assertTrue(all("separated" in r for r in lam))

    def test_without_fallbacks_drops_what_a_fallback_decided(self):
        run = data.load(RUNS / "004-germ.json")  # day 21: every Government step fell back
        with_ = rl.lambda_rows([run])
        without = rl.lambda_rows([run], with_fallbacks=False)
        self.assertEqual(len(with_), len(without))
        b_with = sum(1 for f in run.forecasts if f["scored"] and f["p"] is not None)
        b_without = sum(1 for f in run.forecasts if f["scored"] and f["p"] is not None and not f.get("fallback_day"))
        self.assertLess(b_without, b_with)
        self.assertEqual(rl.respect_shares([run], with_fallbacks=False)[0]["share"], 0.0)


if __name__ == "__main__":
    unittest.main()
