"""collect_tones joins the judge files' tone rows into what --tones reads."""

import json
import os
import tempfile
import unittest

from analysis.bayes import collect_tones, judges


class Collect(unittest.TestCase):
    def test_rows_feed_tone_rows(self):
        def row(run, judge, t):
            return {"item": f"{run}/wire:1:0", "run": run, "world_family": "gpt", "seat_holders": {"Government": "claude", "Criminals": "gemini"},
                    "judge": judge, "tone_government": t, "tone_criminals": None}
        with tempfile.TemporaryDirectory() as d:
            paths = []
            for run in ("study-t1-r1", "study-t1-r2"):
                p = os.path.join(d, f"{run}.json")
                with open(p, "w") as f:
                    json.dump({"ok": True, "run": run, "judges": {"complete": run.endswith("r1"), "tones": [row(run, j, -1) for j in ("deepseek", "qwen", "glm")]}}, f)
                paths.append(p)
            rows, incomplete = collect_tones.collect(paths)
        self.assertEqual(len(rows), 6)
        self.assertEqual(incomplete, [paths[1]])
        tone, _alpha = judges.tone_rows(rows)
        self.assertEqual(len(tone), 6)  # the two runs' items stay apart: their IDs carry the run
        self.assertEqual({r["item"] for r in tone}, {"study-t1-r1/wire:1:0:Government", "study-t1-r2/wire:1:0:Government"})


if __name__ == "__main__":
    unittest.main()
