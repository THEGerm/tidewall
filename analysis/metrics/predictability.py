"""Can a simple bot exploit the police's inspection pattern?

A gang that learns from history predicts each day's inspection in each
district and commits crime only when its predicted chance of inspection is
below 1/4. At the mixed equilibrium no such bot earns more than 0 a
district-day on average; a positive average means the pattern leaks.
"""

from collections import defaultdict

from math import exp, log

from . import equilibrium as eq
from .glm import logit


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


def _features(inspections, crimes, day, d):
    """Covariates for district d on day `day`, from day - 1 only."""
    prev_i = inspections[day - 1]
    prev_c = crimes[day - 1]
    return [1.0, float(prev_i[d]), sum(prev_i) / len(prev_i), float(prev_c[d])]


def _logloss(p, y, eps=1e-6):
    p = min(max(p, eps), 1 - eps)
    return -log(p) if y else -log(1 - p)


def history_gain(inspections, crimes, warmup=5, score_mask=None):
    """H2b (issue #17): can the police's inspections be predicted from the
    previous day better than from their overall rate so far?

    Rolling origin: for each day t >= warmup, fit a logistic model on all
    district-days before t, with an intercept, the district's inspection on
    t - 1, the city-wide inspection share on t - 1 and the district's crime on
    t - 1, then predict day t. The baseline predicts the inspection rate so
    far (Laplace-smoothed). Both are scored by log loss on day t only, never
    on data they were fitted to.

    The covariates use the full log, so this measures how much structure the
    pattern has: an upper bound on what a gang could exploit. At the mixed
    equilibrium, inspections are independent of history and the gain is 0.

    inspections, crimes: lists of days, each a list of booleans per district.
    score_mask: the same shape, True where a district-day counts (for H2b,
    inspectable open district-days). Masked-out district-days are neither
    fitted nor scored, but still serve as yesterday's history. None counts all.
    Returns the mean gain in log loss per district-day (baseline minus
    history model; positive means predictable), its standard error from
    day-level sums (district-days within a day aren't independent), a
    one-sided z, the number of days scored, and how many day fits separated
    (those days use the smoothed history table instead).
    """
    if len(inspections) != len(crimes) or len(inspections) <= warmup + 1:
        raise ValueError("need equal inspection and crime logs longer than the warm-up")
    districts = len(inspections[0])
    mask = score_mask or [[True] * districts for _ in inspections]
    day_gains, separated = [], 0
    for t in range(max(warmup, 1), len(inspections)):
        if not any(mask[t]):
            continue
        rows, ys = [], []
        for day in range(1, t):
            for d in range(districts):
                if mask[day][d]:
                    rows.append(_features(inspections, crimes, day, d))
                    ys.append(1 if inspections[day][d] else 0)
        so_far = [v for day, m in zip(inspections[:t], mask[:t]) for v, ok in zip(day, m) if ok]
        base_p = (sum(so_far) + 1) / (len(so_far) + 2)
        fit = logit(rows, ys, names=["b0", "own_prev", "city_prev", "crime_prev"]) if len(set(ys)) > 1 else None
        if fit is None or fit["separated"]:
            separated += 1
            coef = None
        else:
            coef = [fit["coef"][n][0] for n in ("b0", "own_prev", "city_prev", "crime_prev")]
        # Fallback when the fit separates (history predicts inspections
        # perfectly, the most predictable case of all): a Laplace-smoothed
        # table of P(inspect) by the district's own inspection and crime on
        # the previous day. It never separates, so a perfect pattern still
        # scores as predictable.
        table = {}
        if coef is None:
            for x, yv in zip(rows, ys):
                cell = table.setdefault((x[1], x[3]), [0, 0])
                cell[0] += yv
                cell[1] += 1
        gain, scored = 0.0, 0
        for d in range(districts):
            if not mask[t][d]:
                continue
            scored += 1
            y = inspections[t][d]
            if coef is None:
                f = _features(inspections, crimes, t, d)
                yes, n_cell = table.get((f[1], f[3]), [0, 0])
                p_model = (yes + 1) / (n_cell + 2)
            else:
                z = sum(c * x for c, x in zip(coef, _features(inspections, crimes, t, d)))
                p_model = 1 / (1 + exp(-z))
            gain += _logloss(base_p, y) - _logloss(p_model, y)
        day_gains.append(gain / scored)
    n = len(day_gains)
    if n == 0:
        return {"gain_per_district_day": float("nan"), "se": float("nan"), "z": float("nan"), "days_scored": 0, "separated_days": separated}
    mean = sum(day_gains) / n
    var = sum((g - mean) ** 2 for g in day_gains) / (n - 1) if n > 1 else float("nan")
    se = (var / n) ** 0.5 if n > 1 else float("nan")
    return {"gain_per_district_day": mean, "se": se, "z": mean / se if se and se == se else float("nan"),
            "days_scored": n, "separated_days": separated}
