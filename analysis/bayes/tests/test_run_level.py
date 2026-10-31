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
    def test_pooled_gain(self):
        self.assertTrue(rl.h2b([{"run": i, "gain": 0.05 + 0.01 * (i % 3)} for i in range(9)])["clears"])
        self.assertFalse(rl.h2b([{"run": i, "gain": (-1) ** i * 0.02} for i in range(10)])["clears"])

    def test_gains_from_exports(self):
        r = rl.history_gains([data.load(RUNS / "004-germ.json"), data.load(RUNS / "005-germ.json")])
        self.assertEqual([x["run"] for x in r], ["004-germ", "005-germ"])
        self.assertTrue(all(x["gain"] == x["gain"] for x in r))  # not nan


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

    def test_rows_from_exports(self):
        runs = [data.load(RUNS / f"00{i}-germ.json") for i in (4, 5)]
        b = rl.brier_skill_rows(runs)
        self.assertTrue(b and all(r["seat"] in SEATS and r["model"] in FAMS for r in b))
        lam = rl.lambda_rows(runs)
        self.assertTrue(all(r["seat"] in ("Government", "Criminals") for r in lam))


if __name__ == "__main__":
    unittest.main()
