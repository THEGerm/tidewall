import json
import random
import unittest
from fractions import Fraction as F
from pathlib import Path

from analysis.metrics import beliefs, equilibrium as eq, multiple, predictability, rates, tilt, turf

SOLVER_JSON = Path(__file__).resolve().parents[2] / "solver" / "equilibria.json"


class EquilibriumAgreesWithSolver(unittest.TestCase):
    @unittest.skipUnless(SOLVER_JSON.exists(), "solver output not in this checkout")
    def test_same_numbers(self):
        d = json.loads(SOLVER_JSON.read_text())
        per = d["inspection"]["per_district"]
        self.assertEqual(F(per["crime"]["exact"]), eq.CRIME_RATE)
        self.assertEqual(F(per["inspect"]["exact"]), eq.INSPECTION_RATE)

    def test_plan_values(self):
        self.assertEqual(eq.CRIME_RATE, F(4, 15))
        self.assertEqual(eq.INSPECTION_RATE, F(1, 4))
        self.assertEqual(eq.AUDIT_LINE, F(eq.CRIME_GAIN, eq.BRIBE_PENALTY))


class Rates(unittest.TestCase):
    def test_wilson(self):
        low, high = rates.wilson(80, 300)
        self.assertAlmostEqual(low, 0.2198, places=4)
        self.assertAlmostEqual(high, 0.3194, places=4)
        self.assertEqual(rates.wilson(0, 0), (0.0, 1.0))

    def test_against(self):
        r = rates.against(80, 300, eq.CRIME_RATE)
        self.assertTrue(r["consistent"])
        self.assertAlmostEqual(r["gap"], 80 / 300 - 4 / 15)
        over = rates.against(150, 300, eq.INSPECTION_RATE)
        self.assertFalse(over["consistent"])
        self.assertGreater(over["z"], 5)

    def test_by_group(self):
        rows = [{"model": "a", "refused": True}, {"model": "a", "refused": False}, {"model": "b", "refused": False}]
        g = rates.by_group(rows, lambda r: r["model"], lambda r: r["refused"])
        self.assertEqual(g["a"], {"yes": 1, "n": 2, "rate": 0.5})
        self.assertEqual(g["b"]["rate"], 0.0)


class Beliefs(unittest.TestCase):
    def test_brier(self):
        self.assertEqual(beliefs.brier([(1, True), (0, False)]), 0)
        self.assertEqual(beliefs.brier([(0.5, True), (0.5, False)]), 0.25)
        with self.assertRaises(ValueError):
            beliefs.brier([(1.2, True)])
        with self.assertRaises(ValueError):
            beliefs.brier([])

    def test_skill(self):
        outcomes = [True, False, False, False]
        self.assertAlmostEqual(beliefs.brier_skill([(0.25, o) for o in outcomes]), 0.0)
        self.assertAlmostEqual(beliefs.brier_skill([(float(o), o) for o in outcomes]), 1.0)

    def test_calibration(self):
        bins = beliefs.calibration([(0.1, False), (0.15, True), (0.9, True)], bins=5)
        self.assertEqual(bins[0]["n"], 2)
        self.assertEqual(bins[0]["observed"], 0.5)
        self.assertEqual(bins[-1]["bin"], (0.8, 1.0))

    def test_best_responses(self):
        self.assertTrue(beliefs.gang_should_commit(0.1))
        self.assertFalse(beliefs.gang_should_commit(0.4))
        self.assertIsNone(beliefs.gang_should_commit(0.25))
        self.assertIsNone(beliefs.gang_should_commit(0.27, tol=0.03))
        self.assertTrue(beliefs.police_should_inspect(0.5))
        self.assertFalse(beliefs.police_should_inspect(0.1))
        # Rules 3.3 without the #12 mark: b > 100 a.
        self.assertTrue(beliefs.chief_should_accept(9, 0.05, counts_damage=False))   # 9 > 5
        self.assertFalse(beliefs.chief_should_accept(9, 0.2, counts_damage=False))   # 9 < 20
        # With the mark (the default, decided 31 Oct): b > 100 a + 11.
        self.assertFalse(beliefs.chief_should_accept(10, 0.0))  # no bribe a gang would pay clears 11
        self.assertTrue(beliefs.chief_should_accept(20, 0.05))   # 20 > 5 + 11
        self.assertIsNone(beliefs.chief_should_accept(16, 0.05))  # indifferent

    def test_best_response_rate(self):
        r = beliefs.best_response_rate([(True, True), (False, True), (None, False), (False, False)])
        self.assertEqual(r, {"rate": 0.75, "n": 4, "indifferent": 1})


class Predictability(unittest.TestCase):
    def test_equilibrium_play_is_not_exploitable(self):
        rng = random.Random(7)
        log = [[rng.random() < 0.25 for _ in range(6)] for _ in range(150)]
        for name, r in predictability.exploit(log).items():
            # Mean payoff of a 10/-30 bet at p = 1/4 is 0; allow sampling noise.
            self.assertLess(r["payoff_per_district_day"], 1.5, name)

    def test_alternating_police_are_exploited(self):
        log = [[day % 2 == 0] * 6 for day in range(60)]
        r = predictability.exploit(log, order=1)
        self.assertGreater(r["markov1"]["payoff_per_district_day"], 4)
        self.assertEqual(r["markov1"]["accuracy"], 1.0)
        # Frequency alone sees about 50% and never bets.
        self.assertEqual(r["frequency"]["crimes"], 0)

    def test_over_policing_is_not_bet_against(self):
        log = [[True] * 6 for _ in range(30)]
        self.assertEqual(predictability.exploit(log)["frequency"]["crimes"], 0)

    def test_ragged_log(self):
        with self.assertRaises(ValueError):
            predictability.exploit([[True] * 6, [True] * 5])


class Turf(unittest.TestCase):
    def play(self, rule, theirs):
        mine = []
        for t in range(len(theirs)):
            mine.append(rule(mine[:t], theirs[:t]))
        return mine

    def test_classify_tit_for_tat(self):
        rng = random.Random(3)
        theirs = [rng.random() < 0.6 for _ in range(40)]
        mine = self.play(turf.STRATEGIES["tit-for-tat"], theirs)
        best = turf.classify(mine, theirs)[0]
        self.assertEqual(best, {"strategy": "tit-for-tat", "agreement": 1.0})

    def test_classify_grim(self):
        theirs = [True] * 10 + [False] + [True] * 9
        mine = self.play(turf.STRATEGIES["grim trigger"], theirs)
        self.assertEqual(mine[11:], [False] * 9)
        self.assertEqual(turf.classify(mine, theirs)[0]["strategy"], "grim trigger")

    def test_win_stay_lose_shift(self):
        rule = turf.STRATEGIES["win-stay lose-shift"]
        self.assertTrue(rule([], []))
        self.assertFalse(rule([True], [False]))   # sucker: switch
        self.assertTrue(rule([False], [False]))   # both encroached: switch
        self.assertFalse(rule([False], [True]))   # exploited them: stay

    def test_age_trend(self):
        falling = [True] * 30 + [False] * 10
        r = turf.age_trend(falling, permutations=2000)
        self.assertLess(r["slope_per_day"], 0)
        self.assertLess(r["p_drop"], 0.01)
        flat = [True, True, False] * 17  # steady 2 in 3, no trend
        self.assertGreater(turf.age_trend(flat, permutations=2000)["p_drop"], 0.05)
        self.assertEqual(turf.age_trend(falling, permutations=500), turf.age_trend(falling, permutations=500))

    def test_late_drop(self):
        r = turf.late_drop([True] * 30 + [False] * 10, last=10)
        self.assertEqual((r["early"], r["late"], r["drop"]), (1.0, 0.0, 1.0))


class Tilt(unittest.TestCase):
    items = [
        {"seat": "Government", "tone": -1},
        {"seat": "Government", "tone": -1},
        {"seat": "Government", "tone": 0},
        {"seat": "Criminals", "tone": 1},
    ]

    def test_coverage(self):
        c = tilt.coverage(self.items, {"Government": 5, "Criminals": 5})
        self.assertEqual(c["Government"]["share"], 0.75)
        self.assertEqual(c["Government"]["ratio"], 1.5)
        self.assertAlmostEqual(c["Government"]["mean_tone"], -2 / 3)
        self.assertEqual(c["Criminals"]["mean_tone"], 1)
        with self.assertRaises(ValueError):
            tilt.coverage([{"seat": "x", "tone": 2}], {"x": 1})

    def test_tone_by_holder(self):
        items = [
            {"seat": "Government", "tone": -1, "holder": "gemini"},
            {"seat": "Government", "tone": -1, "holder": "gemini"},
            {"seat": "Government", "tone": 1, "holder": "gpt"},
            {"seat": "Criminals", "tone": 0, "holder": "claude"},
        ]
        r = tilt.tone_by_holder(items)
        self.assertEqual(r["Government"]["by_holder"]["gemini"], {"items": 2, "mean_tone": -1.0})
        self.assertEqual(r["Government"]["spread"], 2.0)
        self.assertEqual(r["Criminals"]["spread"], 0.0)
        with self.assertRaises(ValueError):
            tilt.tone_by_holder([{"seat": "x", "tone": 5, "holder": "y"}])

if __name__ == "__main__":
    unittest.main()


class Holm(unittest.TestCase):
    def test_textbook_example(self):
        out = multiple.holm({"a": 0.01, "b": 0.04, "c": 0.03, "d": 0.005})
        self.assertAlmostEqual(out["d"]["adjusted"], 0.02)
        self.assertAlmostEqual(out["a"]["adjusted"], 0.03)
        self.assertAlmostEqual(out["c"]["adjusted"], 0.06)
        self.assertAlmostEqual(out["b"]["adjusted"], 0.06)  # kept monotone
        self.assertEqual([k for k, v in out.items() if v["reject"]], ["d", "a"])

    def test_stricter_than_bh(self):
        ps = {"a": 0.01, "b": 0.02, "c": 0.03}
        h, b = multiple.holm(ps), multiple.benjamini_hochberg(ps)
        for k in ps:
            self.assertGreaterEqual(h[k]["adjusted"], b[k]["q"] - 1e-12)


class HistoryGain(unittest.TestCase):
    def _log(self, days, rule, seed):
        rng = random.Random(seed)
        insp, crime = [], []
        for t in range(days):
            crime.append([rng.random() < 4 / 15 for _ in range(6)])
            insp.append([rule(rng, t, d, insp) for d in range(6)])
        return insp, crime

    def test_random_police_not_predictable(self):
        insp, crime = self._log(60, lambda rng, t, d, h: rng.random() < 0.25, seed=3)
        out = predictability.history_gain(insp, crime)
        self.assertLess(out["z"], 2.0)

    def test_alternating_police_predictable(self):
        # Inspect a district exactly when it wasn't inspected yesterday.
        rule = lambda rng, t, d, h: (not h[t - 1][d]) if t else rng.random() < 0.5
        insp, crime = self._log(40, rule, seed=4)
        out = predictability.history_gain(insp, crime)
        self.assertGreater(out["gain_per_district_day"], 0.1)
