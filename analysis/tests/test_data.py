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
        # Families: own crime district and both-respect left out.
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

    def test_decides(self):
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
