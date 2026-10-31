import json
import unittest
from fractions import Fraction as F

from analysis.solver import params as P
from analysis.solver.__main__ import OUT, plain
from analysis.solver.bimatrix import equilibria
from analysis.solver.games import bribery_audit_matrices, inspection_matrices, run_length, solve_all
from analysis.solver.stats import binomial_band, binomial_tail


class RulesNumbersTest(unittest.TestCase):
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
        self.assertEqual(P.CHIEF_COUNTS_DAMAGE, True)  # same default as worker CHIEF_COUNTS_DAMAGE
        day = self.r["inspection"]["per_day"]
        self.assertEqual((day["crimes"], day["inspections"], day["arrests"]), (F(8, 5), F(3, 2), F(2, 5)))
        self.assertEqual(day["crime_damage"], 18)
        self.assertEqual(self.r["inspection"]["arrest_cap_binds"], F(1, 15) ** 6)
        avg = self.r["inspection"]["per_average_day"]
        self.assertEqual(self.r["inspection"]["open_districts_per_day"], F(59, 10))
        self.assertEqual(avg["arrests"], F(59, 150))

    def test_switch_matrices(self):
        on = equilibria(*inspection_matrices(True))
        off = equilibria(*inspection_matrices(False))
        self.assertEqual((on[0][0][0], on[0][1][0]), (F(4, 15), F(1, 4)))
        self.assertEqual((off[0][0][0], off[0][1][0]), (1, 0))

    def test_chief_stated_payoff_breaks_the_mix(self):
        alt = self.r["inspection"]["with_chief_stated_payoff"]
        self.assertEqual((alt["crime"], alt["inspect"]), (1, 0))

    def test_prison(self):
        pr = self.r["inspection"]["prison"]
        self.assertEqual(pr["sentence_days"], 10)
        self.assertEqual(pr["expected_occupancy"], F(59, 15))
        self.assertEqual(pr["expected_occupancy_all_open"], 4)
        self.assertLess(pr["full_at_most"], F(1, 10**30))

    def test_turf_thresholds(self):
        t = self.r["turf"]
        self.assertEqual(t["stage_equilibria_respect_prob"], [(0, 0)])
        self.assertEqual(t["grim_trigger_threshold"], F(1, 2))
        self.assertEqual(t["tft_nash_threshold"], F(2, 3))
        self.assertEqual(t["continue"], F(23, 25))
        self.assertTrue(t["grim_holds"] and t["tft_nash_holds"])
        self.assertFalse(t["tft_subgame_perfect"])
        self.assertTrue(t["mutual_respect_beats_alternating"])
        v = t["values"]
        self.assertEqual((v["respect_forever"], v["encroach_forever"], v["deviate_against_grim"]), (75, 25, 33))
        self.assertGreater(v["respect_forever"], v["alternate_against_tft"])

    def test_bribery_mark_off(self):
        b = self.r["bribery"]
        self.assertEqual(b["skip_value"], 10)
        self.assertEqual(b["audit_line"], F(1, 10))
        self.assertEqual(b["chief_accepts_if"], "b > 100 a")
        g = b["audit_game_at_max_bribe"]
        self.assertEqual((g["audit"], g["take"]), (F(1, 10), F(2, 25)))
        top = b["audit_game_at_top_offer"]
        self.assertEqual((top["bribe"], top["audit"], top["take"]), (20, F(1, 5), F(2, 25)))
        self.assertEqual(b["council_indifferent_take_rate"], F(8, 100))
        self.assertEqual(b["max_audit_rate"], F(1, 3))

    def test_bribery_mark_on_has_no_deal(self):
        m = self.r["bribery"]["with_performance_mark"]
        self.assertEqual(m["premium"], 11)  # 15 for the sure crime, less the -4 the Chief gets anyway
        self.assertEqual(m["chief_accepts_if"], "b > 100 a + 11")
        self.assertEqual(m["audit_line"], F(-1, 100))
        self.assertFalse(m["deal_exists"])
        # At the most a gang gains, refusing dominates: no bribe taken, no audit.
        g = m["audit_game_at_max_bribe"]
        self.assertEqual((g["bribe"], g["audit"], g["take"]), (10, 0, 0))
        # Only an overpaying offer of 20 brings a mix: a = 9/100, take 8%.
        top = m["audit_game_at_top_offer"]
        self.assertEqual((top["audit"], top["take"]), (F(9, 100), F(2, 25)))

    def test_bribe_acceptance_rule_directly(self):
        # Mark on: the Chief's payoff from taking b, unaudited, against refusing (-4).
        for b in range(1, 21):
            chief, _ = bribery_audit_matrices(b, True, refuse_value=-4)
            for a in (F(0), F(1, 100), F(1, 10)):
                take = (1 - a) * chief[0][1] + a * chief[0][0]
                with self.subTest(b=b, a=a):
                    self.assertEqual(take > chief[1][0], b > 100 * a + 11)

    def test_end_rule(self):
        e = self.r["end_rule"]
        q = F(23, 25)
        self.assertEqual(e["expected_days_no_cap"], F(47, 2))
        self.assertEqual(e["reach_cap"], q**48)
        self.assertEqual(e["expected_days_with_cap"], 11 + (1 - q**49) / F(2, 25))
        self.assertAlmostEqual(float(e["expected_days_with_cap"]), 23.29, places=2)
        self.assertEqual(e["median_days"], 20)
        alt = e["alternative_plan_rev3"]
        self.assertEqual(alt["expected_days_no_cap"], 50)
        self.assertEqual(alt["reach_cap"], F(49, 50) ** 149)
        self.assertAlmostEqual(float(alt["expected_days_with_cap"]), 47.59, places=2)
        self.assertEqual(alt["median_days"], 35)

    def test_run_length_by_brute_force(self):
        # P(L = n) summed directly, small numbers.
        r = run_length(3, F(1, 2), 6)
        pmf = {3: F(1, 2), 4: F(1, 4), 5: F(1, 8), 6: F(1, 8)}
        self.assertEqual(r["expected_days_with_cap"], sum(n * p for n, p in pmf.items()))
        self.assertEqual(r["reach_cap"], F(1, 8))
        self.assertEqual(r["median_days"], 3)

    def test_week0(self):
        w = self.r["week0_bands"]
        self.assertEqual(w["open_district_days"], 137)
        self.assertEqual(w["crime_rate"]["equivalence"]["bot_days"], 710)

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
