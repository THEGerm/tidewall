"""Can a simple bot exploit the police's inspection pattern?

A gang that learns from history predicts each day's inspection in each
district and commits crime only when its predicted chance of inspection is
below 1/4. At the mixed equilibrium no such bot earns more than 0 a
district-day on average; a positive average means the pattern leaks.
"""

from collections import defaultdict

from . import equilibrium as eq


def _predictors(order):
    """Online predictors of P(inspect) for one district's history."""

    def frequency(history, counts):
        return (sum(history) + 1) / (len(history) + 2)  # Laplace

    def markov(history, counts):
        if len(history) < order:
            return frequency(history, counts)
        state = tuple(history[-order:])
        yes, n = counts[state]
        return (yes + 1) / (n + 2)

    return {"frequency": frequency, f"markov{order}": markov}


def exploit(inspections, order=1, warmup=5):
    """Replay an inspection log against simple predicting gangs.

    inspections: list of days, each a list of booleans (inspected?) per
    district. Each predictor sees only earlier days. From day `warmup` on, it
    "commits crime" where its forecast is below 1/4 and earns 10, or -30 if
    that district was inspected.

    Returns per predictor: decisions made, crimes committed, mean payoff per
    district-day (0 at equilibrium), hit rate on inspections (accuracy), and
    the accuracy of always guessing the majority so far, as a baseline.
    """
    if not inspections:
        raise ValueError("empty log")
    districts = len(inspections[0])
    preds = _predictors(order)
    out = {}
    for name, predict in preds.items():
        history = defaultdict(list)
        counts = defaultdict(lambda: [0, 0])
        payoff = crimes = decided = correct = base_correct = 0
        for day, row in enumerate(inspections):
            if len(row) != districts:
                raise ValueError(f"day {day} has {len(row)} districts, expected {districts}")
            for d, inspected in enumerate(row):
                h = history[d]
                if day >= warmup:
                    p = predict(h, counts)
                    decided += 1
                    correct += (p >= 0.5) == bool(inspected)
                    base_correct += (sum(h) * 2 >= len(h) and len(h) > 0) == bool(inspected)
                    if p < float(eq.INSPECTION_RATE):
                        crimes += 1
                        payoff += -eq.FINE if inspected else eq.CRIME_GAIN
                if len(h) >= order:
                    state = tuple(h[-order:])
                    counts[state][0] += bool(inspected)
                    counts[state][1] += 1
                h.append(bool(inspected))
        out[name] = {
            "decisions": decided,
            "crimes": crimes,
            "payoff_per_district_day": payoff / decided if decided else float("nan"),
            "accuracy": correct / decided if decided else float("nan"),
            "majority_accuracy": base_correct / decided if decided else float("nan"),
        }
    return out
