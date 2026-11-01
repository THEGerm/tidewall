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
    def test_h5_finds_tone_that_depends_on_the_holder(self):
        from analysis.bayes import decide, models
        rng = random.Random(5)
        fams = ("claude", "gemini", "gpt")
        items = []
        for k in range(30):
            world = fams[k % 3]
            for seat, holder in zip(("Government", "Criminals"), [f for f in fams if f != world]):
                for i in range(6):
                    # The claude World is harsh on gpt-held seats; everyone else is neutral.
                    mean = -0.8 if (world == "claude" and holder == "gpt") else 0.0
                    for judge in ("j1", "j2"):
                        x = mean + rng.gauss(0, 0.6)
                        items.append({"tone": -1 if x < -0.5 else (1 if x > 0.5 else 0), "seat": seat, "world_family": world,
                                      "holder_family": holder, "run": f"r{k}", "item": f"r{k}-{seat}-{i}", "judge": judge})
        post = models.fit(models.h5_tone(items), **QUICK)
        d = decide.h5(post)
        self.assertEqual(d["H5 omnibus"]["df"], 1)  # 6 occupied cells, additive model uses 5
        self.assertTrue(d["H5 omnibus"]["clears"], d["H5 omnibus"])
        self.assertTrue(all(v.get("measure") for k, v in d.items() if k != "H5 omnibus"))

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
        u = decide.unreliable("H4 day", log)["H4 day"]
        self.assertEqual((u["p"], u["clears"], u["note"]), (1.0, False, "not confirmed (fit unreliable)"))


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
        # An unreliable fit and judges below 0.70 stay in Holm at p = 1.
        fam = decide.confirm({"a": up, **decide.unreliable("u"), **decide.h5_unreliable_judges(0.62)})
        self.assertEqual(len([k for k, v in fam.items() if "holm" in v]), 3)
        self.assertEqual(fam["H5 omnibus"]["p"], 1.0)


if __name__ == "__main__":
    unittest.main()
