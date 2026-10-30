import json
import unittest
from fractions import Fraction as F

from analysis.solver import params as P
from analysis.solver.__main__ import OUT, plain
from analysis.solver.games import solve_all
from analysis.solver.stats import binomial_band, binomial_tail


class PlanNumbersTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.r = solve_all()

    def test_every_plan_check_passes(self):
        for name, ok in self.r["plan_checks"].items():
            with self.subTest(name):
                self.assertTrue(ok)

    def test_inspection_equilibrium(self):
        d = self.r["inspection"]["per_district"]
        self.assertEqual((d["crime"], d["inspect"]), (F(4, 15), F(1, 4)))
        day = self.r["inspection"]["per_day"]
        self.assertEqual((day["crimes"], day["inspections"], day["arrests"]), (F(8, 5), F(3, 2), F(2, 5)))
        self.assertEqual(day["crime_damage"], 18)
        self.assertEqual(self.r["inspection"]["arrest_cap_binds"], F(1, 15) ** 6)

    def test_chief_stated_payoff_breaks_the_mix(self):
        alt = self.r["inspection"]["with_chief_stated_payoff"]
        self.assertEqual((alt["crime"], alt["inspect"]), (1, 0))

    def test_turf_thresholds(self):
        t = self.r["turf"]
        self.assertEqual(t["stage_equilibria_respect_prob"], [(0, 0)])
        self.assertEqual(t["grim_trigger_threshold"], F(1, 2))
        self.assertEqual(t["tft_nash_threshold"], F(2, 3))
        self.assertFalse(t["tft_subgame_perfect"])
        self.assertTrue(t["mutual_respect_beats_alternating"])
        v = t["values"]
        self.assertEqual((v["respect_forever"], v["encroach_forever"], v["deviate_against_grim"]), (300, 100, 108))
        self.assertGreater(v["respect_forever"], v["alternate_against_tft"])

    def test_bribery(self):
        b = self.r["bribery"]
        self.assertEqual(b["skip_value"], 10)
        self.assertEqual(b["audit_line"], F(1, 10))
        g = b["audit_game_at_max_bribe"]
        self.assertEqual((g["audit"], g["take"]), (F(1, 10), F(8, 15)))

    def test_end_rule(self):
        e = self.r["end_rule"]
        self.assertEqual(e["expected_days_no_cap"], 50)
        self.assertEqual(e["reach_cap"], F(49, 50) ** 149)
        self.assertLess(e["reach_cap"], F(5, 100))
        self.assertAlmostEqual(float(e["expected_days_with_cap"]), 47.59, places=2)
        self.assertEqual(e["median_days"], 35)

    def test_week0_bands_contain_target(self):
        for k in ("crime_rate", "inspection_rate", "audit_rate"):
            b = self.r["week0_bands"][k]
            with self.subTest(k):
                self.assertLess(b["band"][0], b["target"])
                self.assertGreater(b["band"][1], b["target"])

    def test_open_questions_listed(self):
        self.assertEqual(self.r["open_questions"], P.OPEN_QUESTIONS)
        self.assertGreaterEqual(len(P.OPEN_QUESTIONS), 1)

    def test_committed_json_is_current(self):
        expected = json.dumps(plain(self.r), indent=2, ensure_ascii=False) + "\n"
        self.assertEqual(OUT.read_text(), expected, "run python3 -m analysis.solver")


class StatsTest(unittest.TestCase):
    def test_band_covers_level(self):
        low, high = binomial_band(F(1, 4), 300)
        inside = 1 - binomial_tail(F(1, 4), 300, high) - (1 - binomial_tail(F(1, 4), 300, low - 1))
        self.assertGreaterEqual(inside, F(95, 100))

    def test_tail(self):
        self.assertEqual(binomial_tail(F(1, 2), 2, 0), F(3, 4))


if __name__ == "__main__":
    unittest.main()
