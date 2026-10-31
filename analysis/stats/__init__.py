"""Statistics over flattened runs (analysis.data): the plan's measures per run
and pooled by (family, seat), and the provisional run-clustered comparison of
families within a seat. Standard library only."""

from .compare import confirmatory, family_within_seat, run_level_values  # noqa: F401
from .measures import (  # noqa: F401
    beliefs_by_player, bribes, costs, fallbacks, pooled, rates_by_family_seat, rates_by_run,
    turf_by_run, turf_sfem, welfare_by_run, welfare_days,
)
