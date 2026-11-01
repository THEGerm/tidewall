"""The models recover known effects from simulated runs, and the decision
rules read them right. Needs analysis/bayes/requirements.txt, so CI (standard
library only) skips this file; run it on a laptop:

    pip install -r analysis/bayes/requirements.txt
    python -m unittest analysis.bayes.tests.test_models
"""

import importlib.util
import math
import random
import unittest

from analysis import data

HAVE = all(importlib.util.find_spec(m) for m in ("bambi", "pymc", "numpy"))
QUICK = {"draws": 400, "tune": 400, "chains": 2}


def sim_runs(n_runs=8, days=25, seed=1, inspect_by_family=None, chief_slope=0.4, coop_drop=0.0):
    """Runs with known behaviour, in the shape analysis.data produces."""
    rng = random.Random(seed)
    inspect_by_family = inspect_by_family or {"claude": 0.6, "gpt": 0.25}
    fams = list(inspect_by_family)
    runs = []
    for k in range(n_runs):
        fam = fams[k % len(fams)]
        u = rng.gauss(0, 0.3)
        dd, turf = [], []
        for day in range(1, days + 1):
            for dist, gang in data.TURF.items():
                offered = rng.random() < 0.4
                amount = rng.randint(1, 20) if offered else None
                # The Chief's acceptance follows delta at a_hat near 0.10: b - 10 - 11.
                accepted = offered and rng.random() < 1 / (1 + math.exp(-(chief_slope * (amount - 21) + u)))
                inspectable = not accepted
                p = inspect_by_family[fam]
                inspected = inspectable and rng.random() < 1 / (1 + math.exp(-(math.log(p / (1 - p)) + u)))
                dd.append({"day": day, "district": dist, "gang": gang, "open": True, "crime": False, "inspected": inspected,
                           "audited": rng.random() < 0.1, "bribe_offered": offered, "bribe_amount": amount,
                           "bribe_accepted": accepted, "inspectable": inspectable, "chief_fallback": False,
                           "gang_fallback": False, "council_fallback": False, "fallback_day": False})
            p_coop = 1 / (1 + math.exp(-(1.5 - coop_drop * (day - days / 2) + u)))
            turf.append({"day": day, **{g: "respect" if rng.random() < p_coop else "encroach" for g in data.GANGS},
                         "Families_fallback": False, "Saltdogs_fallback": False})
        info = {"id": f"sim{k}", "triple": k // 3, "seating": {"Government": fam, "Criminals": fams[(k + 1) % len(fams)], "World": "gemini"}}
        runs.append(data.Run(info, district_days=dd, turf=turf))
    return runs


@unittest.skipUnless(HAVE, "needs bambi and pymc (analysis/bayes/requirements.txt)")
class Recovery(unittest.TestCase):
    def test_h2a_finds_over_inspection_in_one_family_only(self):
        from analysis.bayes import decide, models
        post = models.fit(models.h2a_inspection(sim_runs()), **QUICK)
        d = decide.h2a(post)
        self.assertTrue(d["H2a claude"]["clears"])   # 0.6 against 0.25
        self.assertFalse(d["H2a gpt"]["clears"])     # at 0.25

    def test_h3_finds_a_chief_that_follows_its_payoff(self):
        from analysis.bayes import decide, models
        post = models.fit(models.h3_bribes(sim_runs(chief_slope=0.4)), **QUICK)
        d = decide.h3(post)["H3 delta"]
        self.assertTrue(d["clears"])
        self.assertGreater(d["p_d"], 0.99)

    def test_h3_departure_rate_is_measured_per_family(self):
        from analysis.bayes import decide, frames, models
        runs = sim_runs(chief_slope=0.4)
        post = models.fit(models.h3_departures(runs), **QUICK)
        d = decide.h3_departures(post)
        observed = frames.departures(frames.bribe_answers(runs))
        for fam, v in observed.items():
            est = d[f"H3 departures {fam}"]
            self.assertTrue(est["low"] <= v["share"] <= est["high"], (fam, v["share"], est))
        self.assertNotIn("holm", decide.confirm(d)[f"H3 departures {fam}"])

    def test_h4_finds_an_end_game_drop_and_none_when_absent(self):
        from analysis.bayes import decide, models
        drop = decide.h4(models.fit(models.h4_turf(sim_runs(coop_drop=0.25)), **QUICK))["H4 day"]
        self.assertTrue(drop["clears"])
        flat = decide.h4(models.fit(models.h4_turf(sim_runs(coop_drop=0.0, seed=2)), **QUICK))["H4 day"]
        self.assertFalse(flat["clears"])


@unittest.skipUnless(HAVE, "needs bambi and pymc (analysis/bayes/requirements.txt)")
class OtherModels(unittest.TestCase):
    @staticmethod
    def tone_items(two_squares, effect=-0.8, runs=30, seed=5):
        """Judge rows for H5. One square: each (world, holder) pair always in the
        same seat. Two squares (#130): even triples swap the two other seats."""
        rng = random.Random(seed)
        fams = ("claude", "gemini", "gpt")
        items = []
        for k in range(runs):
            world = fams[k % 3]
            others = [f for f in fams if f != world]
            if two_squares and (k // 3) % 2 == 1:
                others = others[::-1]
            for seat, holder in zip(("Government", "Criminals"), others):
                for i in range(6):
                    # The claude World is harsher on a gpt-held seat; no seat effect.
                    mean = effect if (world == "claude" and holder == "gpt") else 0.0
                    for judge in ("j1", "j2"):
                        x = mean + rng.gauss(0, 0.6)
                        items.append({"tone": -1 if x < -0.5 else (1 if x > 0.5 else 0), "seat": seat, "world_family": world,
                                      "holder_family": holder, "run": f"r{k}", "item": f"r{k}-{seat}-{i}", "judge": judge})
        return items

    def test_h5_with_two_squares_has_one_df_and_finds_the_tilt(self):
        from analysis.bayes import decide, models
        items = self.tone_items(two_squares=True)
        occupied = sorted({(r["world_family"], r["holder_family"], r["seat"]) for r in items})
        self.assertEqual(len(occupied), 12)
        d = decide.h5(models.fit(models.h5_tone(items), **QUICK), occupied)
        self.assertEqual(d["H5 omnibus"]["df"], 1)  # rank 7 against 6 for seat + world + holder
        self.assertTrue(d["H5 omnibus"]["clears"], d["H5 omnibus"])
        self.assertTrue(all(v.get("measure") for k, v in d.items() if k != "H5 omnibus"))

    def test_h5_with_one_square_has_no_df(self):
        from analysis.bayes import decide, models
        items = self.tone_items(two_squares=False)
        occupied = sorted({(r["world_family"], r["holder_family"], r["seat"]) for r in items})
        self.assertEqual(len(occupied), 6)
        d = decide.h5(models.fit(models.h5_tone(items), **QUICK), occupied)["H5 omnibus"]
        self.assertEqual((d["df"], d["p"], d["clears"]), (0, 1.0, False))  # the interaction is the seat effect

    def test_refusals_hurdle_model_fits(self):
        from analysis.bayes import models
        rng = random.Random(6)
        runs = []
        for k in range(6):
            pd_ = [{"day": day, "player": p, "seat": data.SEAT_OF[p], "family": ("claude", "gpt", "gemini")[(k + i) % 3],
                    "refusals": (rng.random() < (0.3 if p in data.GANGS else 0.02)) * rng.randint(1, 3)}
                   for day in range(1, 16) for i, p in enumerate(data.PLAYERS)]
            runs.append(data.Run({"id": f"r{k}", "triple": 0, "seating": {}}, player_days=pd_))
        post = models.fit(models.refusals(runs), **QUICK)
        self.assertIn("seat", list(post["posterior"].data_vars) if hasattr(post, "children") else list(post.posterior.data_vars))


@unittest.skipUnless(HAVE, "needs bambi and pymc (analysis/bayes/requirements.txt)")
class FitLadder(unittest.TestCase):
    def test_a_good_fit_passes_on_the_first_rung(self):
        import functools
        from analysis.bayes import models
        post, log = models.fit_checked(functools.partial(models.h2a_inspection, sim_runs()), draws=1000, tune=1000, chains=4)
        self.assertIsNotNone(post, log)
        self.assertTrue(log[0]["passed"], log)
        self.assertEqual(len(log), 1)

    def test_a_short_fit_fails_the_ess_rule_and_climbs(self):
        import functools
        from analysis.bayes import decide, models
        tiny = ({"target_accept": 0.95, "draws": 30, "tune": 30}, {"target_accept": 0.95, "draws": 30, "tune": 30, "simple": True})
        post, log = models.fit_checked(functools.partial(models.h4_turf, sim_runs()), ladder=tiny, chains=2)
        self.assertIsNone(post)
        self.assertEqual([r["rung"]["simple"] for r in log], [False, True])
        self.assertTrue(any("ESS" in reason for r in log for reason in r["reasons"]))
        u = decide.unreliable("H4", log)
        self.assertEqual(sorted(u), ["H4 after day 12", "H4 day"])  # the family keeps both entries
        self.assertEqual({(v["p"], v["clears"], v["note"]) for v in u.values()}, {(1.0, False, "not confirmed (fit unreliable)")})

    def test_the_last_rung_is_skipped_when_there_is_no_simpler_model(self):
        import functools
        from analysis.bayes import models
        tiny = ({"target_accept": 0.95, "draws": 30, "tune": 30}, {"target_accept": 0.95, "draws": 30, "tune": 30, "simple": True})
        post, log = models.fit_checked(functools.partial(models.h2a_inspection, sim_runs()), ladder=tiny, chains=2)
        self.assertEqual(log[-1]["reasons"], ["no simpler model; rung skipped"])

    def test_check_fails_on_nan(self):
        from unittest import mock
        import pandas as pd
        from analysis.bayes import models
        fake = pd.DataFrame({"r_hat": [1.0, float("nan")], "ess_bulk": [900.0, 900.0], "ess_tail": [900.0, 900.0]})
        post = {"sample_stats": {"diverging": mock.Mock(values=__import__("numpy").zeros((2, 10)))}}
        with mock.patch("arviz.summary", return_value=fake):
            passed, reasons = models.check(post)
        self.assertFalse(passed)
        self.assertIn("r_hat is NaN", reasons)


@unittest.skipUnless(HAVE, "needs numpy")
class Rules(unittest.TestCase):
    def test_rule_and_holm(self):
        import numpy as np
        from analysis.bayes import decide
        rng = np.random.default_rng(0)
        up = decide.rule(rng.normal(1.0, 0.2, 4000), 0.0, "above")
        self.assertTrue(up["clears"])
        self.assertGreater(up["p_d"], 0.999)
        none = decide.rule(rng.normal(0.0, 1.0, 4000), 0.0, "above")
        self.assertFalse(none["clears"])
        self.assertAlmostEqual(none["p_d"], 0.5, delta=0.05)
        both = decide.confirm({"a": up, "b": none})
        self.assertTrue(both["a"]["holm_reject"])
        self.assertFalse(both["b"]["holm_reject"])
        # An unreliable fit, a skipped test and judges below 0.70 all stay in
        # Holm at p = 1, with every entry; measurements never enter it.
        fam = decide.confirm({"a": up, **decide.unreliable("H2a"), **decide.skipped("H3", "no offers"),
                              **decide.h5_unreliable_judges(0.62), **decide.unreliable("H3 departures")})
        self.assertEqual(len([k for k, v in fam.items() if "holm" in v]), 1 + 3 + 1 + 1)
        self.assertEqual(fam["H5 omnibus"]["note"], "not confirmed (judge agreement too low)")
        self.assertTrue(all("holm" not in v for k, v in fam.items() if k.startswith("H3 departures")))
        self.assertEqual(decide.holm_size(), 11)


if __name__ == "__main__":
    unittest.main()
