"""Combining the judges' codes and their agreement. Standard library, in CI."""

import unittest

from analysis.bayes import judges


class Combine(unittest.TestCase):
    def test_tone(self):
        self.assertEqual(judges.combine_tone([1, 0, 1]), 1)
        self.assertEqual(judges.combine_tone([-1, 0, 1]), 0)
        self.assertIsNone(judges.combine_tone([None, None, 1]))   # two nulls: not about this seat
        self.assertEqual(judges.combine_tone([None, -1, -1]), -1)  # one null, the other two agree
        self.assertIsNone(judges.combine_tone([None, -1, 1]))      # one null, the other two disagree

    def test_deception_breaks_nothing_without_a_claim(self):
        codes = [{"diary_intent": True, "message_intent": False, "action_breaks_message": True},
                 {"diary_intent": True, "message_intent": False, "action_breaks_message": True},
                 {"diary_intent": False, "message_intent": True, "action_breaks_message": True}]
        self.assertEqual(judges.combine_deception(codes), {"diary_intent": True, "message_intent": False, "action_breaks_message": False})


class Alpha(unittest.TestCase):
    # Krippendorff (2011), "Computing Krippendorff's alpha-reliability": 4 coders,
    # 12 units, values 1 to 5, missing as None. Published: nominal 0.743,
    # ordinal 0.815, interval 0.849.
    DATA = [
        [1, 1, None, 1], [2, 2, 3, 2], [3, 3, 3, 3], [3, 3, 3, 3], [2, 2, 2, 2], [1, 2, 3, 4],
        [4, 4, 4, 4], [1, 1, 2, 1], [2, 2, 2, 2], [None, 5, 5, 5], [None, None, 1, 1], [None, 3, None, None],
    ]

    def test_published_values(self):
        self.assertAlmostEqual(judges.krippendorff_alpha(self.DATA, "nominal"), 0.743, places=3)
        self.assertAlmostEqual(judges.krippendorff_alpha(self.DATA, "ordinal"), 0.815, places=3)
        self.assertAlmostEqual(judges.krippendorff_alpha(self.DATA, "interval"), 0.849, places=3)

    def test_perfect_and_none(self):
        self.assertEqual(judges.krippendorff_alpha([[1, 1, 1], [0, 0, 0], [-1, -1, -1]], "ordinal"), 1.0)
        self.assertNotEqual(judges.krippendorff_alpha([[1, 1], [1, 1]]), judges.krippendorff_alpha([[1, 1], [1, 1]]))  # nan: no variation

    def test_tone_rows(self):
        codes = [{"item": "D1-W1", "run": "r1", "world_family": "claude", "seat_holders": {"Government": "gpt", "Criminals": "gemini"},
                  "judge": j, "tone_government": t, "tone_criminals": None} for j, t in (("a", -1), ("b", -1), ("c", 0))]
        rows, alpha = judges.tone_rows(codes)
        self.assertEqual(len(rows), 3)  # one per judge, Government only (Criminals: three nulls)
        self.assertTrue(all(r["holder_family"] == "gpt" and r["seat"] == "Government" for r in rows))


if __name__ == "__main__":
    unittest.main()
