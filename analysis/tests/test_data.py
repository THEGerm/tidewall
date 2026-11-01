import json
import tempfile
import unittest
from pathlib import Path

from analysis import data
from analysis.tests import fixtures


class Flatten(unittest.TestCase):
    def setUp(self):
        self.run = data.load(fixtures.small())

    def test_loads_from_path(self):
        with tempfile.TemporaryDirectory() as d:
            p = Path(d) / "t1.json"
            p.write_text(json.dumps(fixtures.small()))
            self.assertEqual(data.load(str(p)).id, "t1")

    def test_district_days(self):
        dd = self.run.district_days
        self.assertEqual(len(dd), 18)
        port1 = next(r for r in dd if r["day"] == 1 and r["district"] == "Port")
        self.assertEqual((port1["gang"], port1["crime"], port1["bribe_offered"], port1["bribe_amount"],
                          port1["bribe_accepted"], port1["inspectable"], port1["audited"], port1["outcome"]),
                         ("Families", True, True, 5, True, False, True, "crime under bribe"))
        low1 = next(r for r in dd if r["day"] == 1 and r["district"] == "Lowtown")
        self.assertEqual(low1["outcome"], "crime caught")
        port2 = next(r for r in dd if r["day"] == 2 and r["district"] == "Port")
        self.assertEqual((port2["open"], port2["crime"], port2["outcome"]), (False, None, "closed"))
        self.assertTrue(all(r["chief_fallback"] for r in dd if r["day"] == 3))
        self.assertFalse(any(r["gang_fallback"] for r in dd))

    def test_player_days(self):
        pd = {(r["day"], r["player"]): r for r in self.run.player_days}
        self.assertEqual(len(pd), 15)
        fam1 = pd[(1, "Families")]
        self.assertEqual((fam1["seat"], fam1["family"], fam1["model"], fam1["messages_sent"], fam1["key_fallbacks"]),
                         ("Criminals", "gpt", "gpt-test", 2, 1))
        self.assertEqual(pd[(3, "Families")]["score_running"], 9)
        self.assertIsNone(pd[(3, "World")]["score_running"])
        chief3 = pd[(3, "Chief")]
        self.assertEqual((chief3["fallbacks"], chief3["fallback_steps"], chief3["forgot"], chief3["diary_words"],
                          chief3["failed_calls"]), (1, "act", 2, 1, 1))
        self.assertEqual(pd[(2, "Families")]["retries"], 1)
        self.assertEqual(pd[(2, "Families")]["confidant_texts"], 1)
        self.assertEqual(pd[(2, "Council")]["confidant_texts"], 0)
        self.assertEqual(pd[(1, "Council")]["family"], "claude")

    def test_scoring_rule(self):
        f = {(r["day"], r["player"], r["event"], r["district"]): r for r in self.run.forecasts}
        # A draft-3 export. Families: own crime district and both-respect left out.
        self.assertFalse(f[(1, "Families", "p_crime", "Port")]["scored"])
        self.assertTrue(f[(1, "Families", "p_crime", "Port")]["own_move"])
        self.assertTrue(f[(1, "Families", "p_crime", "Lowtown")]["scored"])
        self.assertTrue(f[(1, "Families", "p_crime", "Lowtown")]["outcome"])
        self.assertTrue(f[(1, "Families", "p_inspect", "Port")]["scored"])
        self.assertFalse(f[(1, "Families", "p_both_respect", None)]["scored"])
        self.assertTrue(f[(1, "Families", "p_any_audit", None)]["scored"])
        # Chief: closed district ignored, own inspections and bribe answers left out.
        self.assertEqual(f[(2, "Chief", "p_crime", "Port")]["why_not"], "closed or no outcome")
        self.assertFalse(f[(2, "Chief", "p_inspect", "Market")]["scored"])
        self.assertFalse(f[(2, "Chief", "p_any_bribe_accepted", None)]["scored"])
        self.assertTrue(f[(2, "Chief", "p_any_audit", None)]["scored"])
        # Council: own audits left out, turf scored.
        self.assertFalse(f[(2, "Council", "p_any_audit", None)]["scored"])
        self.assertTrue(f[(2, "Council", "p_both_respect", None)]["scored"])
        self.assertFalse(f[(2, "Council", "p_both_respect", None)]["outcome"])

    def test_scoring_rule_split_turf(self):
        # Rules draft 4: one respect forecast per gang. Each gang is scored on
        # its rival's, not its own; everyone else on both.
        ex = fixtures.small()
        ex["forecasts"] = [
            {"day": 2, "player": p, "forecasts": {"p_families_respect": 0.3, "p_saltdogs_respect": 0.8}}
            for p in ("Council", "Chief", "Families", "Saltdogs", "World")]
        run = data.load(ex)
        f = {(r["player"], r["event"]): r for r in run.forecasts}
        self.assertEqual(len(f), 10)
        self.assertFalse(f[("Families", "p_families_respect")]["scored"])
        self.assertEqual(f[("Families", "p_families_respect")]["why_not"], "own move")
        self.assertTrue(f[("Families", "p_saltdogs_respect")]["scored"])
        self.assertTrue(f[("Saltdogs", "p_families_respect")]["scored"])
        self.assertFalse(f[("Saltdogs", "p_saltdogs_respect")]["scored"])
        for p in ("Council", "Chief", "World"):
            self.assertTrue(f[(p, "p_families_respect")]["scored"])
            self.assertTrue(f[(p, "p_saltdogs_respect")]["scored"])
        # Day 2: the Families encroach, the Saltdogs respect.
        self.assertFalse(f[("Council", "p_families_respect")]["outcome"])
        self.assertTrue(f[("Council", "p_saltdogs_respect")]["outcome"])
        # No forecast uses the old joint event, so it gets no outcome rows.
        self.assertFalse([o for o in run.outcomes if o["event"] == "p_both_respect"])
        self.assertEqual(len([o for o in run.outcomes if o["event"] == "p_families_respect"]), 3)

    def test_old_exports_keep_the_joint_event(self):
        # small() is a draft-3 export: p_both_respect is read and scored as before.
        self.assertEqual(len([o for o in self.run.outcomes if o["event"] == "p_both_respect"]), 3)
        root = Path(__file__).resolve().parents[2] / "data" / "runs" / "test"
        for path in sorted(root.glob("*.json")):
            run = data.load(path)
            gangs = [f for f in run.forecasts if f["event"] == "p_both_respect" and f["player"] in data.GANGS]
            self.assertFalse(any(f["scored"] for f in gangs), path.name)

    def test_decides(self):
        self.assertTrue(data.decides("Families", "p_families_respect"))
        self.assertFalse(data.decides("Families", "p_saltdogs_respect"))
        self.assertTrue(data.decides("Saltdogs", "p_saltdogs_respect"))
        self.assertFalse(data.decides("Council", "p_saltdogs_respect"))
        self.assertTrue(data.decides("Saltdogs", "p_crime", "Market"))
        self.assertFalse(data.decides("Saltdogs", "p_crime", "Port"))
        self.assertTrue(data.decides("Chief", "p_inspect", "Port"))
        self.assertFalse(data.decides("World", "p_any_audit"))

    def test_turf_calls_answers(self):
        self.assertEqual([(t["Families"], t["Saltdogs"]) for t in self.run.turf],
                         [("respect", "respect"), ("encroach", "respect"), ("encroach", "encroach")])
        self.assertEqual(len(self.run.calls), 5)
        self.assertEqual(self.run.calls[0]["run"], "t1")
        self.assertEqual(self.run.calls[0]["seat"], "Government")
        self.assertEqual(sum(a["source"] == "fallback" for a in self.run.answers), 1)

    def test_outcomes_cover_every_district_day(self):
        crime = [o for o in self.run.outcomes if o["event"] == "p_crime"]
        self.assertEqual(len(crime), 17)
        self.assertEqual(sum(o["outcome"] for o in crime), 3)


if __name__ == "__main__":
    unittest.main()


class StudyRuns(unittest.TestCase):
    def test_only_triples_1_to_9_on_the_study_models_count(self):
        from analysis.data import Run, is_study_run
        mk = lambda **i: Run(i)
        self.assertTrue(is_study_run(mk(id="study-t1-r1", model_set="study", triple=1)))
        self.assertFalse(is_study_run(mk(id="012-smoke-test", model_set="study", triple=0)))
        self.assertFalse(is_study_run(mk(id="011-germ", model_set="test", triple=0)))
        self.assertFalse(is_study_run(mk(id="bot-t1-eq", model_set="bot", triple=1)))
