import tempfile
import unittest
from pathlib import Path

from analysis import data, outliers
from analysis.tests import fixtures


def kinds(flags):
    return {f["kind"] for f in flags}


class ModifiedZ(unittest.TestCase):
    def test_flags_the_far_value(self):
        z = outliers.modified_z([1, 1.1, 0.9, 1, 1.05, 10])
        self.assertGreater(z[-1], 3.5)
        self.assertTrue(all(abs(v) < 3.5 for v in z[:-1]))

    def test_zero_mad_falls_back_to_mean_deviation(self):
        z = outliers.modified_z([0, 0, 0, 0, 0, 0, 5])
        self.assertGreater(z[-1], 3.5)
        self.assertEqual(outliers.modified_z([2, 2, 2]), [None, None, None])

    def test_small_groups_are_skipped(self):
        items = [(v, {"run": "r"}) for v in (1, 1, 50)]
        self.assertEqual(outliers.robust(items, "run", "x", "x"), [])


class Rules(unittest.TestCase):
    def setUp(self):
        self.run = data.load(fixtures.small())

    def test_json_text_to_sam(self):
        f = outliers.confidant_json(self.run)
        self.assertEqual(len(f), 1)
        self.assertEqual((f[0]["player"], f[0]["day"]), ("Saltdogs", 2))

    def test_diary_deletion(self):
        f = outliers.diary_deletion(self.run, burst=2)
        self.assertEqual(kinds(f), {"diary mostly deleted", "diary burst deletion"})
        self.assertTrue(all(x["player"] == "Chief" for x in f))

    def test_infrastructure_and_stop(self):
        f = outliers.call_flags(self.run)
        k = kinds(f)
        self.assertIn("infrastructure: location error", k)
        self.assertIn("infrastructure: key error", k)
        self.assertIn("stop reason", k)
        stop = [x for x in f if x["kind"] == "stop reason"][0]
        self.assertEqual((stop["day"], stop["player"], stop["seq"]), (2, "Families", 0))
        self.assertIn("infrastructure: location error", kinds(outliers.fallback_answers(self.run)))

    def test_constant_moves(self):
        run = data.load(fixtures.long_run(8))
        f = outliers.constant_moves(run)
        whys = " / ".join(x["why"] for x in f)
        self.assertIn("Chief inspects every district it can on all 8 days", whys)
        self.assertIn("Families encroaches on all 8 days", whys)
        self.assertIn("both gangs encroach on all 8 days", whys)
        self.assertIn("Council audits every day on all 8 days", whys)
        # Too short to judge.
        self.assertEqual(outliers.constant_moves(self.run), [])

    def test_welfare_mismatch(self):
        ex = fixtures.small()
        ex["days"][1]["welfare"] = 99
        f = outliers.welfare_mismatch(data.load(ex))
        self.assertEqual([(x["day"], x["value"]) for x in f], [(2, 89)])

    def test_day_flags(self):
        ex = fixtures.long_run(8)
        ex["ledger"] = [fixtures.call(d, s, "Chief", latency=1000) for d in range(1, 9) for s in range(3)]
        ex["ledger"] += [fixtures.call(5, 9, "Chief", latency=1000) for _ in range(9)]
        f = outliers.day_flags(data.load(ex))
        calls = [x for x in f if x["kind"] == "day calls"]
        self.assertEqual([x["day"] for x in calls], [5])

    def test_call_latency(self):
        ex = fixtures.long_run(5)
        ex["ledger"] = [fixtures.call(1, s, "Chief", latency=1000 + 10 * s) for s in range(8)]
        ex["ledger"].append(fixtures.call(1, 8, "Chief", latency=90000))
        f = [x for x in outliers.call_flags(data.load(ex)) if x["kind"] == "call latency_ms"]
        self.assertEqual([x["seq"] for x in f], [8])

    def test_run_level(self):
        runs = [data.load(fixtures.long_run(5, rid=f"r{i}")) for i in range(4)]
        odd = fixtures.long_run(5, rid="odd")
        for d in odd["days"]:
            d["moves"]["inspect"] = []
        runs.append(data.load(odd))
        f = [x for x in outliers.run_flags(runs) if x["kind"] == "inspection rate"]
        self.assertEqual([x["run"] for x in f], ["odd"])


class Worksheets(unittest.TestCase):
    def test_build_writes_every_file_documented(self):
        import json

        from analysis.worksheets import build

        with tempfile.TemporaryDirectory() as d:
            src = Path(d) / "t1.json"
            src.write_text(json.dumps(fixtures.small()))
            out = Path(d) / "out"
            counts = build([str(src), fixtures.long_run(6)], out)
            for name in ("district_days", "player_days", "forecasts", "rates_by_run", "rates_by_family_seat",
                         "beliefs", "turf", "welfare", "fallbacks", "costs", "outliers"):
                self.assertTrue((out / f"{name}.csv").exists(), name)
            self.assertEqual(counts["district_days"], 18 + 36)
            readme = (out / "README.md").read_text()
            self.assertNotIn("undocumented", readme)
            self.assertNotIn("\u2014", readme)


if __name__ == "__main__":
    unittest.main()
