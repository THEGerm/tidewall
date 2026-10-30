"""Tests for the method changes from issue #13."""

import random
import unittest
from math import exp, log

from analysis.metrics import beliefs, choice, collusion, glm, multiple, turf, week0, welfare


class LogScore(unittest.TestCase):
    def test_values(self):
        self.assertAlmostEqual(beliefs.log_score([(0.5, True), (0.5, False)]), log(0.5))
        # A stated certainty that turns out wrong is clipped, not infinite.
        self.assertAlmostEqual(beliefs.log_score([(1.0, False)]), log(0.01))
        self.assertAlmostEqual(beliefs.log_score([(0.0, False)]), log(0.99))
        with self.assertRaises(ValueError):
            beliefs.log_score([(1.5, True)])

    def test_calibration_has_ten_bins(self):
        bins = beliefs.calibration([(i / 20, i % 2 == 0) for i in range(20)])
        self.assertEqual(len(bins), 10)


class Logit(unittest.TestCase):
    def test_recovers_coefficients(self):
        rng = random.Random(1)
        rows, ys = [], []
        for _ in range(4000):
            x = rng.uniform(-3, 3)
            p = 1 / (1 + exp(-(0.5 + 1.2 * x)))
            rows.append([1.0, x])
            ys.append(1 if rng.random() < p else 0)
        fit = glm.logit(rows, ys, names=["a", "b"])
        a, a_se = fit["coef"]["a"]
        b, b_se = fit["coef"]["b"]
        self.assertLess(abs(a - 0.5), 3 * a_se)
        self.assertLess(abs(b - 1.2), 3 * b_se)
        self.assertFalse(fit["separated"])

    def test_separation_is_flagged(self):
        fit = glm.logit([[1.0, x] for x in (-2, -1, 1, 2)], [0, 0, 1, 1])
        self.assertTrue(fit["separated"])

    def test_constant_covariate_is_flagged(self):
        fit = glm.logit([[1.0, 1.0]] * 6, [0, 1, 0, 1, 1, 0])
        self.assertTrue(fit["separated"])


class Choice(unittest.TestCase):
    def test_deltas(self):
        self.assertEqual(choice.gang_delta(0.25), 0)
        self.assertEqual(choice.police_delta(4 / 15), 0)
        self.assertEqual(choice.chief_delta(10, 0.1), 0)
        self.assertGreater(choice.gang_delta(0.1), 0)

    def test_fit_lambda(self):
        rng = random.Random(5)
        pairs = []
        for _ in range(3000):
            belief = rng.random()
            d = choice.gang_delta(belief)
            pairs.append((d, rng.random() < 1 / (1 + exp(-0.2 * d))))
        r = choice.fit_lambda(pairs)
        self.assertLess(abs(r["lambda"] - 0.2), 3 * r["se"])

    def test_ignoring_beliefs_gives_lambda_near_zero(self):
        rng = random.Random(6)
        pairs = [(choice.gang_delta(rng.random()), rng.random() < 0.5) for _ in range(3000)]
        r = choice.fit_lambda(pairs)
        self.assertLess(abs(r["lambda"]), 3 * r["se"])


class Endgame(unittest.TestCase):
    def test_late_betrayal_shows_in_day(self):
        rng = random.Random(9)
        theirs = [rng.random() < 0.8 for _ in range(200)]
        mine = [rng.random() < (0.95 if t < 100 else 0.3) for t in range(200)]
        fit = turf.endgame_regression(mine, theirs)
        day, se = fit["coef"]["day"]
        self.assertLess(day, -2 * se)

    def test_reciprocity_is_not_age(self):
        # Tit-for-tat against a random gang: cooperation follows their last
        # move, not the day.
        rng = random.Random(10)
        theirs = [rng.random() < 0.7 for _ in range(300)]
        mine = [True] + theirs[:-1]
        mine = [m if rng.random() > 0.05 else not m for m in mine]
        fit = turf.endgame_regression(mine, theirs)
        day, day_se = fit["coef"]["day"]
        prev, _ = fit["coef"]["their_previous"]
        self.assertLess(abs(day), 3 * day_se)
        self.assertGreater(prev, 2)


class Sfem(unittest.TestCase):
    def simulate(self, name, theirs, tremble, rng):
        rule = turf.STRATEGIES[name]
        mine = []
        for t in range(len(theirs)):
            m = rule(mine, theirs[:t])
            mine.append(m if rng.random() > tremble else not m)
        return mine

    def test_recovers_shares_and_tremble(self):
        rng = random.Random(21)
        runs = []
        for name, count in (("always encroach", 20), ("tit-for-tat", 30), ("always respect", 10)):
            for _ in range(count):
                theirs = [rng.random() < 0.5 for _ in range(50)]
                runs.append((self.simulate(name, theirs, 0.05, rng), theirs))
        r = turf.sfem(runs)
        self.assertAlmostEqual(r["shares"]["always encroach"], 20 / 60, delta=0.05)
        self.assertAlmostEqual(r["shares"]["tit-for-tat"], 30 / 60, delta=0.05)
        self.assertAlmostEqual(r["shares"]["always respect"], 10 / 60, delta=0.05)
        self.assertAlmostEqual(r["tremble"], 0.05, delta=0.015)
        self.assertAlmostEqual(sum(r["shares"].values()), 1.0)

    def test_bad_input(self):
        with self.assertRaises(ValueError):
            turf.sfem([])
        with self.assertRaises(ValueError):
            turf.sfem([([True], [True, False])])


class Welfare(unittest.TestCase):
    def test_best_day_and_equilibrium_day(self):
        self.assertEqual(welfare.day_welfare(12, 0, 0, 0, 0), welfare.BEST_DAY)
        # Solver's equilibrium day: 1.2 uninspected and 0.4 inspected crimes,
        # 1.5 inspections, both gangs encroach (2 + 2), no audits.
        w = welfare.day_welfare(4, 1.2, 0.4, 1.5, 0)
        self.assertAlmostEqual(w, 4 - 6 - 12 - 6)

    def test_run(self):
        days = [dict(turf_total=12, uninspected_crimes=0, inspected_crimes=0, inspections=0, audits=0)] * 2
        days = days + [dict(turf_total=4, uninspected_crimes=1, inspected_crimes=0, inspections=1, audits=1)]
        r = welfare.run_welfare(days)
        self.assertEqual(r["best"], 36)
        self.assertEqual(r["total"], 24 + (4 - 5 - 4 - 8))
        self.assertAlmostEqual(r["loss_per_day"], (36 - r["total"]) / 3)


class Collusion(unittest.TestCase):
    def test_link(self):
        audits = [True, False, True, False, True, False]
        accepted = [False, True, False, True, False, True]
        r = collusion.audit_bribe_link(audits, accepted)
        self.assertEqual(r["phi_same_day"], -1.0)
        self.assertEqual(r["bribes_after_audit"], 1.0)
        self.assertEqual(r["bribes_after_no_audit"], 0.0)
        self.assertEqual(r["audit_rate"], 0.5)
        with self.assertRaises(ValueError):
            collusion.audit_bribe_link([True], [True])


class BenjaminiHochberg(unittest.TestCase):
    def test_known_values(self):
        r = multiple.benjamini_hochberg({"a": 0.01, "b": 0.04, "c": 0.03, "d": 0.5})
        self.assertAlmostEqual(r["a"]["q"], 0.04)
        self.assertAlmostEqual(r["c"]["q"], 0.0533333, places=6)
        self.assertAlmostEqual(r["b"]["q"], 0.0533333, places=6)
        self.assertEqual(r["d"]["q"], 0.5)
        self.assertTrue(r["a"]["reject"])
        self.assertFalse(r["b"]["reject"])


class Week0(unittest.TestCase):
    def test_cdf_matches_direct_sum(self):
        from math import comb
        n, p = 30, 0.3
        direct = sum(comb(n, i) * p**i * (1 - p) ** (n - i) for i in range(10))
        self.assertAlmostEqual(week0.binom_cdf(9, n, p), direct, places=12)

    def test_tost_on_simulated_bots(self):
        sim = week0.simulate_bots(days=2000, seed=3)
        n = sim["district_days"]
        self.assertLess(week0.binom_tost(sim["crimes"], n, float(4 / 15), 0.02), 0.05)
        self.assertLess(week0.binom_tost(sim["inspections"], n, 0.25, 0.02), 0.05)

    def test_one_short_run_cannot_show_equivalence(self):
        # 50 days x 6 districts exactly on target still fails at +-0.02.
        self.assertGreater(week0.binom_tost(80, 300, float(4 / 15), 0.02), 0.05)

    def test_a_wrong_engine_fails(self):
        sim = week0.simulate_bots(days=2000, seed=4)
        n = sim["district_days"]
        self.assertGreater(week0.binom_tost(round(0.32 * n), n, float(4 / 15), 0.02), 0.05)

    def test_trials_needed(self):
        need = week0.trials_needed(float(4 / 15), 0.02)
        self.assertGreater(need, 300)          # far more than one run
        self.assertLess(need, 10_000)


if __name__ == "__main__":
    unittest.main()
