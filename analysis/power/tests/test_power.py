import random
import unittest

from analysis.power import fdist, sim


class FDist(unittest.TestCase):
    def test_known_values(self):
        # Critical values from F tables: F(2, 6) at 0.05 is 5.143; F(2, 24) is 3.403.
        self.assertAlmostEqual(fdist.f_sf(5.1433, 2, 6), 0.05, places=4)
        self.assertAlmostEqual(fdist.f_sf(3.4028, 2, 24), 0.05, places=4)
        # F(1, d) is t squared: t(10) two-sided 0.05 is 2.228.
        self.assertAlmostEqual(fdist.f_sf(2.2281**2, 1, 10), 0.05, places=4)
        self.assertEqual(fdist.f_sf(0, 2, 6), 1.0)

    def test_betainc_symmetry(self):
        self.assertAlmostEqual(fdist.betainc(2, 3, 0.4), 1 - fdist.betainc(3, 2, 0.6), places=12)


class Sim(unittest.TestCase):
    def test_anova(self):
        self.assertAlmostEqual(sim.anova_p([[1, 2, 3], [1, 2, 3], [1, 2, 3]]), 1.0)
        self.assertLess(sim.anova_p([[0, 0.1], [5, 5.1], [10, 10.1]]), 0.001)

    def test_run_length(self):
        rng = random.Random(1)
        lengths = [sim.run_length(rng, 0.05, 60) for _ in range(20000)]
        self.assertLessEqual(max(lengths), 60)
        mean = sum(lengths) / len(lengths)
        self.assertAlmostEqual(mean, (1 - 0.95**60) / 0.05, delta=0.5)  # 19.1

    def test_false_positive_rate_near_alpha(self):
        for d in sim.DESIGNS.values():
            rate = sim.power(d["runs"], d["end"], d["cap"], spread=0.0, run_sd=0.5, sims=600, seed=7)
            self.assertLess(abs(rate - 0.05), 0.035)

    def test_more_runs_more_power(self):
        a, b = sim.DESIGNS.values()
        small = sim.power(a["runs"], a["end"], a["cap"], spread=1.0, run_sd=0.5, sims=300, seed=8)
        large = sim.power(b["runs"], b["end"], b["cap"], spread=1.0, run_sd=0.5, sims=300, seed=8)
        self.assertGreater(large, small)

    def test_unbalanced_runs_rejected(self):
        with self.assertRaises(ValueError):
            sim.one_study(random.Random(0), 10, 0.05, 60, 1.0, 0.5, 0.6)


if __name__ == "__main__":
    unittest.main()
