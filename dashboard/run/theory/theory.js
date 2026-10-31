// A run's game theory panel (docs/dashboard.md, page 3). A finished run reads
// its export; a live run is built from public data only, so the secret
// measures (inspections, audits, bribes, forecasts, answers) wait for the end.
// The panel itself is drawn by view.js, which the analysis page shares.

import { panel } from "./metrics.js";
import { SECTIONS, load, render } from "./view.js";

const $ = (id) => document.getElementById(id);
const id = new URLSearchParams(location.search).get("id") || "";

(async () => {
  if (!/^[a-z0-9-]{1,40}$/.test(id)) { $("note").textContent = "No run given. Open a run from the home page."; return; }
  $("back").href = $("back2").href = `/run/?id=${encodeURIComponent(id)}`;
  $("back").textContent = id;
  $("data").href = `/run/data/?id=${encodeURIComponent(id)}`;
  $("analysis").href = `/analysis/?id=${encodeURIComponent(id)}`;
  try {
    const { run, x } = await load(id);
    const p = panel(x);
    $("title").textContent = `Game theory: ${run.id}`;
    $("note").textContent = run.live
      ? `${p.days} days so far. While a run is live this page uses public data only: crime and turf. Inspections, audits, bribes, forecasts and fallbacks open when it ends.`
      : `${p.days} days, finished. Everything is open.`;
    $("main").innerHTML = SECTIONS;
    $("main").hidden = false;
    render($("main"), p);
  } catch (e) { $("note").textContent = `Couldn't load ${id}: ${e.message}`; }
})();
