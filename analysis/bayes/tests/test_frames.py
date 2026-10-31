"""The rows behind each model: standard library only, so these run in CI."""

import unittest
from pathlib import Path

from analysis import data
from analysis.bayes import frames

RUNS = Path(__file__).resolve().parents[3] / "data" / "runs" / "test"


class FromExports(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.export = data.load(RUNS / "004-germ.json")  # 21 days, bribes offered, both gangs encroach

    def test_inspections_are_the_inspectable_district_days(self):
        rows = frames.inspections([self.export])
        want = [r for r in self.export.district_days if r["open"] and r["inspectable"]]
        self.assertEqual(len(rows), len(want))
        self.assertEqual(sum(r["y"] for r in rows), sum(r["inspected"] for r in want))
        self.assertEqual({r["family"] for r in rows}, {"gemini"})

    def test_bribe_answers_set_each_offer_against_the_smoothed_audit_rate(self):
        rows = frames.bribe_answers([self.export])
        offered = [r for r in self.export.district_days if r["open"] and r["bribe_offered"]]
        self.assertEqual(len(rows), len(offered))
        first = [r for r in rows if r["day"] == 1]
        self.assertTrue(first and all(abs(r["a_hat"] - 0.10) < 1e-12 for r in first))  # the prior alone on day 1
        for r in rows:
            self.assertAlmostEqual(r["delta"], r["amount"] - 100 * r["a_hat"] - 11)
            self.assertEqual(r["below_line"], int(r["a_hat"] < 0.10))
        # In 004 the Council audited 2 districts a day, so a_hat climbs above the line.
        self.assertGreater(max(r["a_hat"] for r in rows), 0.10)

    def test_turf_rows_carry_yesterday(self):
        rows = frames.turf_moves([self.export])
        self.assertEqual(len(rows), 2 * (len(self.export.turf) - 1))
        self.assertTrue(all(r["y"] == 0 and r["their_prev"] == 0 and r["own_prev"] == 0 for r in rows))  # all encroach
        self.assertEqual({r["after_min"] for r in rows if r["day"] >= 12}, {1})
        self.assertEqual({r["after_min"] for r in rows if r["day"] < 12}, {0})

    def test_refusals_one_row_per_player_day(self):
        rows = frames.refusals([self.export])
        self.assertEqual(len(rows), len(self.export.player_days))
        self.assertTrue(all(r["y"] >= 0 for r in rows))


class Tones(unittest.TestCase):
    ok = {"tone": -1, "seat": "Government", "world_family": "claude", "holder_family": "gpt", "run": "r1", "item": "D3-W1", "judge": "j1"}

    def test_valid_rows_pass_with_an_ordered_level(self):
        self.assertEqual(frames.tones([self.ok])[0]["tone_level"], "0")

    def test_bad_rows_are_refused(self):
        for bad in ({"tone": 2}, {"seat": "World"}, {"holder_family": "claude"}):
            with self.assertRaises(ValueError):
                frames.tones([self.ok | bad])
        with self.assertRaises(ValueError):
            frames.tones([{k: v for k, v in self.ok.items() if k != "judge"}])


if __name__ == "__main__":
    unittest.main()
