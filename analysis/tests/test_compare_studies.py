"""Study against Study 2 on one benchmark (analysis.compare_studies)."""
import unittest

from analysis import compare_studies as cs


def rows(scores, triples=range(1, 10), seats=("Government", "Criminals", "World")):
    """Every family in every seat in every triple, with a fixed score per family
    plus a small triple effect."""
    return [{"run": f"r{t}{s}", "triple": t, "seat": s, "model": f, "value": v + 0.01 * (t % 3)}
            for t in triples for s in seats for f, v in scores.items()]


class CompareStudies(unittest.TestCase):
    def test_scores_ranks_and_paired_change(self):
        out = cs.compare(rows({"claude": 0.30, "gemini": 0.20, "gpt": 0.10}), rows({"claude": 0.05, "gemini": 0.15, "gpt": 0.00}), resamples=500)
        by = {e["family"]: e for e in out}
        self.assertEqual([by[f]["study"]["rank"] for f in ("claude", "gemini", "gpt")], [1, 2, 3])
        self.assertEqual([by[f]["study2"]["rank"] for f in ("claude", "gemini", "gpt")], [2, 1, 3])
        self.assertAlmostEqual(by["claude"]["change"]["score"], -0.25, places=9)
        self.assertEqual(by["claude"]["study"]["p_first"], 1.0)
        self.assertEqual(by["claude"]["study"]["n"], 27)
        for e in out:
            for k in ("study", "study2"):
                self.assertLessEqual(e[k]["low"], e[k]["score"])
                self.assertGreaterEqual(e[k]["high"], e[k]["score"])

    def test_missing_study2_leaves_its_cells_empty(self):
        out = cs.compare(rows({"claude": 0.3, "gemini": 0.2, "gpt": 0.1}), [], resamples=100)
        self.assertTrue(all(e["study2"]["score"] is None and e["change"]["score"] is None for e in out))
        self.assertIn("Claude Haiku 5.5", cs.table(out))

    def test_figure_is_one_line_per_family_and_the_caption_names_every_model(self):
        out = cs.compare(rows({"claude": 0.3, "gemini": -0.05, "gpt": 0.1}), rows({"claude": 0.1, "gemini": 0.0, "gpt": 0.2}), resamples=200)
        s = cs.svg(out)
        self.assertTrue(s.startswith("<svg"))
        for name in ("Haiku 5.5", "Flash-Lite", "Luna", "Opus 5.5", "Argon", "Sol"):
            self.assertEqual(s.count(f">{name}</text>"), 1)
        self.assertNotIn("Study 2", s)
        self.assertIn(">Brier skill</text>", s)
        self.assertNotIn("Study 2", cs.caption(out))
        self.assertLess(s.index(">Lightweight<"), s.index(">Flagship<"))
        c = cs.caption(out)
        for name in list(cs.STUDY_NAMES.values()) + list(cs.STUDY2_NAMES.values()):
            self.assertIn(name, c)

    def test_labels_never_overlap(self):
        self.assertEqual(cs._spread([100.0, 104.0, 200.0]), [100.0, 115.0, 200.0])


if __name__ == "__main__":
    unittest.main()
