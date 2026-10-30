import unittest

from analysis.power.fdist import f_sf
from analysis.power.simulate import model_of, power


class FDist(unittest.TestCase):
    def test_critical_values(self):
        # Tabulated 5% critical values of F.
        self.assertAlmostEqual(f_sf(3.739, 2, 14), 0.05, places=3)
        self.assertAlmostEqual(f_sf(3.183, 2, 50), 0.05, places=3)
        self.assertAlmostEqual(f_sf(1.0, 2, 1000), 0.368, places=2)


class Design(unittest.TestCase):
    def test_latin_square(self):
        for r in range(3):
            self.assertEqual(sorted(model_of(r, s) for s in range(3)), [0, 1, 2])
        for s in range(3):
            self.assertEqual(sorted(model_of(r, s) for r in range(3)), [0, 1, 2])

    def test_false_positive_rate(self):
        # No model effect: the test should fire about 5% of the time.
        p = power(9, 20, 6, 0.0, 0.5, reps=600, seed=7)
        self.assertLess(abs(p - 0.05), 0.03)


if __name__ == "__main__":
    unittest.main()
