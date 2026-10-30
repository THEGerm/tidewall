import unittest
from fractions import Fraction as F

from analysis.solver.bimatrix import equilibria


class BimatrixTest(unittest.TestCase):
    def test_matching_pennies(self):
        eqs = equilibria([[1, -1], [-1, 1]], [[-1, 1], [1, -1]])
        self.assertEqual(eqs, [([F(1, 2), F(1, 2)], [F(1, 2), F(1, 2)], 0, 0)])

    def test_prisoners_dilemma_pure(self):
        eqs = equilibria([[3, 0], [5, 1]], [[3, 5], [0, 1]])
        self.assertEqual(eqs, [([0, 1], [0, 1], 1, 1)])

    def test_battle_of_the_sexes_has_three(self):
        eqs = equilibria([[2, 0], [0, 1]], [[1, 0], [0, 2]])
        mixes = sorted((x[0], y[0]) for x, y, _, _ in eqs)
        self.assertEqual(mixes, [(0, 0), (F(2, 3), F(1, 3)), (1, 1)])

    def test_rock_paper_scissors(self):
        A = [[0, -1, 1], [1, 0, -1], [-1, 1, 0]]
        B = [[-a for a in row] for row in A]
        eqs = equilibria(A, B)
        self.assertEqual(len(eqs), 1)
        third = [F(1, 3)] * 3
        self.assertEqual(eqs[0][:2], (third, third))

    def test_dominated_move_never_played(self):
        # Row's second move is strictly dominated.
        eqs = equilibria([[3, 3], [1, 1], [0, 4]], [[1, 0], [5, 5], [0, 1]])
        for x, _, _, _ in eqs:
            self.assertEqual(x[1], 0)


if __name__ == "__main__":
    unittest.main()
