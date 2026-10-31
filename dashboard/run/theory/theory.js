// A run's game theory panel (docs/dashboard.md, page 3). A finished run reads
// its export; a live run is built from public data only, so the secret
// measures (inspections, audits, bribes, forecasts, answers) wait for the end.

import { DISTRICTS, MIN_DAYS, panel } from "./metrics.js";

const $ = (id) => document.getElementById(id);
const id = new URLSearchParams(location.search).get("id") || "";
const PLAYERS = ["Council", "Chief", "Families", "Saltdogs", "World"];
const pct = (x, d = 0) => (Number.isFinite(x) ? `${(x * 100).toFixed(d)}%` : "");
const num = (x, d = 2) => (Number.isFinite(x) ? x.toFixed(d) : "");

async function get(url) {
  const r = await fetch(url);
  const body = await r.json().catch(() => ({ ok: false, error: `HTTP ${r.status}` }));
  if (!r.ok || body.ok === false) throw new Error(body.error || `HTTP ${r.status}`);
  return body;
}

function table(el, head, rows) {
  const tr = (cells, tag) => { const row = document.createElement("tr"); for (const c of cells) { const x = document.createElement(tag); x.textContent = c ?? ""; row.append(x); } return row; };
  const thead = document.createElement("thead");
  thead.append(tr(head, "th"));
  const tbody = document.createElement("tbody");
  for (const r of rows) tbody.append(tr(r, "td"));
  el.replaceChildren(thead, tbody);
}

const svg = (tag, attrs = {}, text) => {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  if (text != null) el.textContent = text;
  return el;
};

// A finished run: the export. A live run: open districts, crimes and turf
// moves, all public, rebuilt from the day views.
async function load() {
  const { run, days } = await get(`/api/runs/${id}`);
  if (!run.live) {
    const x = await get(`/api/runs/${id}/export`);
    return { run, x: { ...x, secret: true } };
  }
  const views = await Promise.all(days.map((d) => get(`/api/runs/${id}/days/${d.day}`).catch(() => null)));
  const rebuilt = days.map((d, i) => {
    const v = views[i];
    const crime = {};
    for (const e of v?.events || []) if (["crime", "arrest", "fine_no_place"].includes(e.kind)) crime[e.district] = true;
    return { day: d.day, open: v?.open || [], moves: { crime, turf: d.turf || undefined } };
  });
  return { run, x: { days: rebuilt, secret: false } };
}

// One bar per rate: the interval as a band, the rate as a dot, the
// equilibrium as a dark tick.
function rateChart(rows, W) {
  const row = 46, H = rows.length * row + 30, x0 = 120, x1 = W - 20;
  const sx = (v) => x0 + v * (x1 - x0);
  const s = svg("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "Rates against the equilibrium" });
  for (const t of [0, 0.25, 0.5, 0.75, 1]) {
    s.append(svg("line", { x1: sx(t), x2: sx(t), y1: 6, y2: H - 22, class: "grid" }));
    s.append(svg("text", { x: sx(t), y: H - 6, "text-anchor": "middle", class: "tick" }, pct(t)));
  }
  rows.forEach(([label, r, cls], i) => {
    const y = 14 + i * row + row / 2 - 8;
    s.append(svg("text", { x: x0 - 10, y: y + 4, "text-anchor": "end", class: "label" }, label));
    if (!r || !r.n) { s.append(svg("text", { x: x0, y: y + 4, class: "tick" }, r ? "no data yet" : "opens when the run ends")); return; }
    s.append(svg("rect", { x: sx(r.low), y: y - 7, width: Math.max(2, sx(r.high) - sx(r.low)), height: 14, rx: 3, fill: `var(--${cls})`, "fill-opacity": 0.25 }));
    s.append(svg("circle", { cx: sx(r.rate), cy: y, r: 5, fill: `var(--${cls})` }));
    s.append(svg("line", { x1: sx(r.target), x2: sx(r.target), y1: y - 12, y2: y + 12, stroke: "var(--text)", "stroke-width": 2.5 }));
  });
  return s;
}

// Two rows of squares, one per gang, with day 12 marked.
function turfChart(days, W) {
  const n = Math.max(days.length, MIN_DAYS + 1), cell = (W - 120) / n, sq = Math.min(22, cell), H = 2 * (sq + 8) + 30;
  const s = svg("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "Turf moves by day" });
  ["Families", "Saltdogs"].forEach((g, r) => {
    const y = 8 + r * (sq + 8), cls = g === "Families" ? "fam" : "salt";
    s.append(svg("text", { x: 100, y: y + sq * 0.7, "text-anchor": "end", class: "label" }, g));
    days.forEach((d, i) => s.append(svg("rect", {
      x: 110 + i * cell + 1, y, width: cell - 2, height: sq, rx: 2,
      fill: d[g] ? `var(--${cls})` : "none", stroke: `var(--${cls})`, "stroke-width": 1.5,
    })));
  });
  const xm = 110 + MIN_DAYS * cell;
  s.append(svg("line", { x1: xm, x2: xm, y1: 2, y2: H - 20, stroke: "var(--text)", "stroke-dasharray": "4 3" }));
  s.append(svg("text", { x: xm, y: H - 6, "text-anchor": "middle", class: "tick" }, `day ${MIN_DAYS}`));
  return s;
}

// Charts are drawn at the width they show at, so the text stays readable on a phone.
const width = (el) => Math.max(320, Math.min(640, el.clientWidth || 640));

function render(run, p) {
  $("main").hidden = false;
  $("title").textContent = `Game theory: ${run.id}`;
  $("note").textContent = run.live
    ? `${p.days} days so far. While a run is live this page uses public data only: crime and turf. Inspections, audits, bribes, forecasts and fallbacks open when it ends.`
    : `${p.days} days, finished. Everything is open.`;

  const rows = [["Crime", p.crime, "fam"], ["Inspection", p.inspection, "gov"], ["Audit", p.audit, "wire"]];
  $("rates").replaceChildren(rateChart(rows, width($("rates"))));
  table($("rates-table"), ["Move", "Rate", "95% interval", "Equilibrium", "Gap", "Out of", "Equilibrium inside?"],
    rows.map(([label, r]) => r ? [label, pct(r.rate, 1), `${pct(r.low, 1)} to ${pct(r.high, 1)}`, pct(r.target, 1), `${r.gap >= 0 ? "+" : ""}${pct(r.gap, 1)}`, `${r.n} district-days`, r.n ? (r.consistent ? "yes" : "no") : ""]
      : [label, "opens when the run ends", "", "", "", "", ""]));

  if (p.auditBy) {
    $("audit-note").textContent = `Bribes offered: ${p.bribes.offered}. Taken: ${p.bribes.taken}. Each district's audit rate against the 10% line.`;
    table($("audit-table"), ["District", "Audits", "Open days", "Rate", "95% interval"],
      DISTRICTS.map((d) => { const r = p.auditBy[d]; return [d, r.k, r.n, pct(r.rate, 1), r.n ? `${pct(r.low, 1)} to ${pct(r.high, 1)}` : ""]; }));
  } else {
    $("audit-note").textContent = "Audits and bribes are secret until the run ends.";
    $("audit-table").replaceChildren();
  }

  $("turf").replaceChildren(turfChart(p.turf.days, width($("turf"))));
  const best = (g) => p.turf[g].filter((f) => f.agreement === p.turf[g][0].agreement).map((f) => f.strategy).join(", ");
  const coop = (g) => p.turf.days.filter((d) => d[g]).length / (p.turf.days.length || NaN);
  table($("turf-table"), ["Gang", "Respect rate", "Closest strategy", "Agreement"],
    ["Families", "Saltdogs"].map((g) => [g, pct(coop(g)), p.turf.days.length ? best(g) : "", pct(p.turf[g][0]?.agreement)]));

  table($("welfare-table"), ["Total", "Best feasible", "Share achieved", "Lost per day"],
    p.welfare ? [[p.welfare.total, p.welfare.best, pct(p.welfare.share), num(p.welfare.lossPerDay, 1)]] : [["opens when the run ends", "", "", ""]]);

  table($("beliefs-table"), ["Player", "Forecasts scored", "Brier", "Skill"],
    p.forecasts ? PLAYERS.filter((pl) => p.forecasts[pl]).map((pl) => [pl, p.forecasts[pl].n, num(p.forecasts[pl].brier, 3), num(p.forecasts[pl].skill, 2)]) : [["opens when the run ends", "", "", ""]]);

  table($("answers-table"), ["Player", "Answers", "Fallbacks", "Share", "Refusals"],
    p.answers ? PLAYERS.filter((pl) => p.answers[pl]).map((pl) => { const a = p.answers[pl]; return [pl, a.n, a.fallback, pct(a.fallback / a.n, 1), a.refused]; }) : [["opens when the run ends", "", "", "", ""]]);
  $("main").hidden = false;
}

(async () => {
  if (!/^[a-z0-9-]{1,40}$/.test(id)) { $("note").textContent = "No run given. Open a run from the home page."; return; }
  $("back").href = $("back2").href = `/run/?id=${encodeURIComponent(id)}`;
  $("back").textContent = id;
  $("data").href = `/run/data/?id=${encodeURIComponent(id)}`;
  try {
    const { run, x } = await load();
    render(run, panel(x));
  } catch (e) { $("note").textContent = `Couldn't load ${id}: ${e.message}`; }
})();
