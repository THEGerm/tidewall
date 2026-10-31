"""The confirmatory mixed models, in Bambi on PyMC (decided 31 Oct).

One builder per hypothesis. Each returns an unfitted bambi.Model with the
pre-registered priors:
- slopes and intercepts on the log-odds scale: Normal(0, 2.5);
- random-effect standard deviations: HalfNormal(1).

Formulas follow #17:
- H2a  inspected ~ 0 + family + (1|run): each Government family's inspection
       rate, against the equilibrium 1/4.
- H3   accepted ~ delta + family + (delta|run): does the Chief accept more when
       accepting pays more? delta = b - 100 a_hat - 11 (the #12 mark).
- H4   respect ~ day + after_min + their_prev + own_prev + family + (day|run):
       cooperation against the game's age, holding reciprocity fixed.
- H5   tone ~ seat + world_family * holder_family + (1|run) + (1|item) + (1|judge),
       cumulative logit: does the World's tone toward a seat depend on which
       family holds it?
- Refusals (exploratory): refused steps ~ seat + family + day + (1|run),
       hurdle Poisson.

H1 (bootstrap by triples), H2b (predictability) and H6 (omega-squared,
lambda) are not mixed models; they stay in analysis/metrics and analysis/stats.

Bambi, PyMC and pandas are imported here only, so the rest of analysis/
stays standard library and CI never needs them (analysis/bayes/README.md).
"""

import bambi as bmb
import pandas as pd

from analysis.bayes import frames

SLOPE = {"mu": 0, "sigma": 2.5}
SD = {"sigma": 1}


def _slope():
    return bmb.Prior("Normal", **SLOPE)


def _group():
    # A random intercept or slope: Normal(0, sd), sd ~ HalfNormal(1).
    return bmb.Prior("Normal", mu=0, sigma=bmb.Prior("HalfNormal", **SD))


def _frame(rows, with_fallbacks=True):
    df = pd.DataFrame(rows)
    if df.empty:
        raise ValueError("no rows: nothing to fit")
    if not with_fallbacks and "fallback" in df:
        df = df[~df["fallback"]].copy()
    return df


def h2a_inspection(runs, with_fallbacks=True):
    df = _frame(frames.inspections(runs), with_fallbacks)
    priors = {"family": _slope(), "1|run": _group()}
    return bmb.Model("y ~ 0 + family + (1|run)", df, family="bernoulli", priors=priors)


def h3_bribes(runs, with_fallbacks=True):
    df = _frame(frames.bribe_answers(runs), with_fallbacks)
    priors = {"Intercept": _slope(), "delta": _slope(), "family": _slope(), "1|run": _group(), "delta|run": _group()}
    formula = "y ~ delta + family + (delta|run)" if df["family"].nunique() > 1 else "y ~ delta + (delta|run)"
    if df["family"].nunique() == 1:
        priors.pop("family")
    return bmb.Model(formula, df, family="bernoulli", priors=priors)


def h4_turf(runs, with_fallbacks=True):
    df = _frame(frames.turf_moves(runs), with_fallbacks)
    df["day_c"] = df["day"] - df["day"].mean()
    priors = {"Intercept": _slope(), "day_c": _slope(), "after_min": _slope(), "their_prev": _slope(),
              "own_prev": _slope(), "family": _slope(), "1|run": _group(), "day_c|run": _group()}
    terms = ["day_c", "their_prev", "own_prev"]
    if df["after_min"].nunique() > 1:
        terms.append("after_min")
    else:
        priors.pop("after_min")
    if df["family"].nunique() > 1:
        terms.append("family")
    else:
        priors.pop("family")
    return bmb.Model(f"y ~ {' + '.join(terms)} + (day_c|run)", df, family="bernoulli", priors=priors)


def h5_tone(items):
    df = _frame(frames.tones(items))
    df["tone_level"] = pd.Categorical(df["tone_level"], categories=["0", "1", "2"], ordered=True)
    priors = {"seat": _slope(), "world_family": _slope(), "holder_family": _slope(),
              "world_family:holder_family": _slope(), "1|run": _group(), "1|item": _group(), "1|judge": _group()}
    return bmb.Model("tone_level ~ seat + world_family * holder_family + (1|run) + (1|item) + (1|judge)",
                     df, family="cumulative", priors=priors)


def refusals(runs):
    df = _frame(frames.refusals(runs))
    priors = {"Intercept": _slope(), "seat": _slope(), "family": _slope(), "day": _slope(), "1|run": _group()}
    return bmb.Model("y ~ seat + family + day + (1|run)", df, family="hurdle_poisson", priors=priors)


def fit(model, draws=2000, tune=2000, chains=4, seed=2026, target_accept=0.95, **kw):
    """Fit with the pre-registered sampler settings. Returns the posterior.
    target_accept 0.95 keeps divergences away on small run-level groups."""
    return model.fit(draws=draws, tune=tune, chains=chains, cores=kw.pop("cores", 1), random_seed=seed,
                     target_accept=target_accept, progressbar=kw.pop("progressbar", False), **kw)
