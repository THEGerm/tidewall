import unittest

from analysis import data, stats
from analysis.metrics import rates
from analysis.stats import tdist
from analysis.tests import fixtures


def pick(rows, **kw):
    return [r for r in rows if all(r.get(k) == v for k, v in kw.items())]


class TDist(unittest.TestCase):
    def test_quantile_and_p(self):
        self.assertAlmostEqual(tdist.t_quantile(0.975, 4), 2.776445, places=5)
        self.assertAlmostEqual(tdist.t_quantile(0.975, 1e6), 1.959964, places=4)
        self.assertAlmostEqual(tdist.t_two_sided_p(2.776445, 4), 0.05, places=5)

    def test_welch(self):
        w = tdist.welch([1, 2, 3], [4, 5, 6])
        self.assertAlmostEqual(w["diff"], -3)
        self.assertAlmostEqual(w["t"], -3.674235, places=5)
        self.assertAlmostEqual(w["df"], 4)
        self.assertAlmostEqual(w["p"], 0.021312, places=5)

    def test_one_run_is_undefined(self):
        m = tdist.mean_interval([0.3])
        self.assertEqual(m["n"], 1)
        self.assertNotEqual(m["low"], m["low"])


class Measures(unittest.TestCase):
    def setUp(self):
        self.runs = [data.load(fixtures.small())]

    def test_rates_by_run(self):
        r = stats.rates_by_run(self.runs)
        crime = pick(r, measure="crime", player="Families and Saltdogs", sample="all")[0]
        self.assertEqual((crime["k"], crime["n"]), (3, 17))
        self.assertAlmostEqual(crime["low"], rates.wilson(3, 17)[0])
        self.assertEqual(crime["family"], "gpt")
        fam = pick(r, measure="crime", player="Families", sample="all")[0]
        self.assertEqual((fam["k"], fam["n"]), (2, 8))
        insp = pick(r, measure="inspection", sample="all")[0]
        self.assertEqual((insp["k"], insp["n"], insp["family"]), (3, 16, "claude"))
        insp_nf = pick(r, measure="inspection", sample="no_fallback")[0]
        self.assertEqual((insp_nf["k"], insp_nf["n"]), (2, 10))
        audit = pick(r, measure="audit", sample="all")[0]
        self.assertEqual((audit["k"], audit["n"], audit["target"]), (3, 17, 0.1))

    def test_pooled(self):
        runs = self.runs + [data.load(fixtures.long_run(5))]
        p = pick(stats.rates_by_family_seat(runs), measure="inspection", sample="all")[0]
        self.assertEqual((p["k"], p["n"], p["runs"]), (3 + 30, 16 + 30, 2))

    def test_welfare(self):
        days = stats.welfare_days(self.runs[0])
        self.assertEqual([d["welfare"] for d in days], [-39, 10, -46])
        w = pick(stats.welfare_by_run(self.runs), sample="all")[0]
        self.assertEqual((w["total"], w["best"], w["days_engine_disagrees"]), (-75, 36, 0))
        nf = pick(stats.welfare_by_run(self.runs), sample="no_fallback")[0]
        self.assertEqual((nf["total"], nf["days"]), (-29, 2))

    def test_bribes(self):
        b = stats.bribes(self.runs)
        fam = pick(b, measure="offer rate", player="Families")[0]
        self.assertEqual((fam["k"], fam["n"], fam["mean_amount"]), (1, 8, 5))
        chief = pick(b, measure="acceptance rate")[0]
        self.assertEqual((chief["k"], chief["n"]), (1, 1))
        # a_hat on day 1 is the prior 0.10; 5 > 100 * 0.10 is false, so accepting goes against the payoff.
        self.assertEqual(chief["h3_payoff_agreement"], 0)

    def test_beliefs(self):
        b = stats.beliefs_by_player(self.runs)
        fam = pick(b, player="Families", event="all")[0]
        self.assertEqual(fam["n"], 3)
        self.assertAlmostEqual(fam["brier"], (0.64 + 0.01 + 0.49) / 3)
        # Skill against each event type's base rate in the run.
        base_crime, base_insp, base_audit = 3 / 17, 3 / 17, 2 / 3
        ref = ((base_crime - 1) ** 2 + base_insp ** 2 + (base_audit - 1) ** 2) / 3
        self.assertAlmostEqual(fam["brier_skill"], 1 - fam["brier"] / ref)
        self.assertEqual(fam["left_out_own_move"], 2)
        chief = pick(b, player="Chief", event="all")[0]
        self.assertEqual(chief["n"], 1)
        self.assertAlmostEqual(chief["brier"], 0.25)

    def test_turf(self):
        t = stats.turf_by_run(self.runs)
        fam = pick(t, player="Families")[0]
        self.assertAlmostEqual(fam["cooperation"], 1 / 3)
        self.assertAlmostEqual(fam["both_respect"], 1 / 3)
        salt = pick(t, player="Saltdogs")[0]
        self.assertAlmostEqual(salt["cooperation"], 2 / 3)
        self.assertIn("tit-for-tat", salt["strategy"])
        self.assertEqual(salt["agreement"], 1.0)

    def test_fallbacks_and_costs(self):
        f = {r["player"]: r for r in stats.fallbacks(self.runs)}
        self.assertEqual((f["Chief"]["answers"], f["Chief"]["fallbacks"], f["Chief"]["fallback_error"]), (2, 1, 1))
        self.assertEqual(f["Families"]["retries"], 1)
        self.assertEqual(f["Families"]["key_fallback_calls"], 1)
        c = pick(stats.costs(self.runs), player="Chief")[0]
        self.assertEqual((c["calls"], c["ok_calls"], c["cost_usd"]), (2, 1, 0.001))

    def test_family_comparison(self):
        vals = [("crime rate", "Criminals", "a", "r1", 0.1), ("crime rate", "Criminals", "a", "r2", 0.2),
                ("crime rate", "Criminals", "a", "r3", 0.3), ("crime rate", "Criminals", "b", "r4", 0.4),
                ("crime rate", "Criminals", "b", "r5", 0.5), ("crime rate", "Criminals", "b", "r6", 0.6)]
        means, pairs = stats.family_within_seat(vals)
        a = pick(means, family="a")[0]
        self.assertAlmostEqual(a["mean"], 0.2)
        self.assertAlmostEqual(a["high"] - a["mean"], 2 * 4.302653 * 0.1 / 3 ** 0.5 / 2 * 1, places=4)
        self.assertEqual(len(pairs), 1)
        self.assertAlmostEqual(pairs[0]["p"], 0.021312, places=5)
        self.assertAlmostEqual(pairs[0]["q"], pairs[0]["p"])
        self.assertEqual(pairs[0]["method"], "Benjamini-Hochberg")

    def test_confirmatory_is_holm(self):
        runs = [data.load(fixtures.long_run(6))]
        rows = stats.confirmatory(stats.rates_by_family_seat(runs), stats.turf_by_run(runs))
        self.assertTrue(rows)
        self.assertTrue(all(r["method"] == "Holm" for r in rows))
        h2 = [r for r in rows if r["test"].startswith("H2")][0]
        self.assertEqual(h2["estimate"], 1.0)
        self.assertTrue(h2["reject"])


if __name__ == "__main__":
    unittest.main()
