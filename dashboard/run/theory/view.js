// The game theory panel as a view: its markup, how a run is loaded for it,
// and how panel() from metrics.js is drawn. Shared by the per-run theory page
// (/run/theory/) and the analysis page (/analysis/), so both draw the same
// figures from the same functions.

import { DISTRICTS, MIN_DAYS } from "./metrics.js";

const PLAYERS = ["Council", "Chief", "Families", "Saltdogs", "World"];
const pct = (x, d = 0) => (Number.isFinite(x) ? `${(x * 100).toFixed(d)}%` : "");
const num = (x, d = 2) => (Number.isFinite(x) ? x.toFixed(d) : "");

export const SECTIONS = `
    <section aria-labelledby="h-rates">
      <h2 id="h-rates">Moves against the equilibrium</h2>
      <p class="muted">If every player played the textbook equilibrium, gangs would commit crime in 27% of open districts and the Chief would inspect 25%. Below a 10% audit rate, taking bribes pays. Each bar is the run's rate with its 95% interval (Wilson); the dark tick is the equilibrium.</p>
      <div class="chart" data-k="rates"></div>
      <div class="table-wrap"><table class="num" data-k="rates-table"></table></div>
    </section>

    <section aria-labelledby="h-audit">
      <h2 id="h-audit">Audits and bribes</h2>
      <p class="muted" data-k="audit-note"></p>
      <div class="table-wrap"><table class="num" data-k="audit-table"></table></div>
    </section>

    <section aria-labelledby="h-turf">
      <h2 id="h-turf">Turf war over the game</h2>
      <p class="muted">One square a day: filled is respect, open is encroach. The line marks day 12: from then on, any day can be the last, so the end-game pull to encroach starts there.</p>
      <div class="chart" data-k="turf"></div>
      <div class="table-wrap"><table class="num" data-k="turf-table"></table></div>
    </section>

    <section aria-labelledby="h-welfare">
      <h2 id="h-welfare">Welfare</h2>
      <p class="muted">What the city lost to conflict. Bribes and taxes only move money between players, so they cancel out. The best feasible day is worth 12: no crime, no inspections or audits, both gangs respecting.</p>
      <div class="table-wrap"><table class="num" data-k="welfare-table"></table></div>
    </section>

    <section aria-labelledby="h-beliefs">
      <h2 id="h-beliefs">Forecast accuracy</h2>
      <p class="muted">Each player's daily forecasts, scored only on events its own moves don't decide. Brier score: 0 is perfect, 0.25 is a coin toss. Skill: 1 is perfect, 0 is no better than knowing each event's base rate in this run, below 0 is worse.</p>
      <div class="table-wrap"><table class="num" data-k="beliefs-table"></table></div>
    </section>

    <section aria-labelledby="h-answers">
      <h2 id="h-answers">Fallbacks and refusals</h2>
      <p class="muted">Share of each player's answers that were invalid twice, refused or failed, and so replaced by the fallback move.</p>
      <div class="table-wrap"><table class="num" data-k="answers-table"></table></div>
    </section>`;

export async function get(url) {
  const r = await fetch(url);
  const body = await r.json().catch(() => ({ ok: false, error: `HTTP ${r.status}` }));
  if (!r.ok || body.ok === false) throw new Error(body.error || `HTTP ${r.status}`);
  return body;
}

// A finished run: the export. A live run: open districts, crimes and turf
// moves, all public, rebuilt from the day views (returned too, for callers
// that show more of them).
export async function load(id) {
  const summary = await get(`/api/runs/${id}`);
  const { run, days } = summary;
  if (!run.live) {
    const x = await get(`/api/runs/${id}/export`);
    return { run, summary, x: { ...x, secret: true }, views: null };
  }
  // One request per day: a long live run (a 10,000-day bot run) is read
  // from its last 400 days only, until it ends and the export opens.
  const recent = days.length > 400 ? days.slice(-400) : days;
  const views = await Promise.all(recent.map((d) => get(`/api/runs/${id}/days/${d.day}`).catch(() => null)));
  const rebuilt = recent.map((d, i) => {
    const v = views[i];
    const crime = {};
    for (const e of v?.events || []) if (["crime", "arrest", "fine_no_place"].includes(e.kind)) crime[e.district] = true;
    return { day: d.day, open: v?.open || [], moves: { crime, turf: d.turf || undefined } };
  });
  return { run, summary, x: { days: rebuilt, secret: false }, views };
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

// Draw panel(x) into root, which holds SECTIONS.
export function render(root, p) {
  const $ = (k) => root.querySelector(`[data-k="${k}"]`);
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
}
