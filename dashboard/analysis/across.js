// Across runs (docs/dashboard.md, page 8, and section 3): the finished runs
// side by side, each measure as the run-level mean for the family that held
// the seat, as analysis/stats/compare.py does. Each run's numbers come from
// panel() in run/theory/metrics.js, the same as its own theory page; nothing
// is recomputed here. Descriptive only: the tests are in analysis/bayes.

import { AUDIT_LINE, CRIME_RATE, INSPECTION_RATE, panel } from "../run/theory/metrics.js";
import { get } from "../run/theory/view.js";

const FAMILY = { claude: "Claude", gemini: "Gemini", gpt: "GPT", bots: "Bots" };
const ORDER = ["claude", "gemini", "gpt", "bots"];
// Rows are models, not families (Germ, 3 Nov): Opus and Haiku are compared,
// not "Claude". The model each seat played comes from the run's export.
const MODEL_NAME = {
  "claude-opus-5-5": "Claude Opus 5.5", "claude-haiku-5-5": "Claude Haiku 5.5",
  "gemini-4-argon": "Gemini 4 Argon", "gemini-3.1-flash-lite": "Gemini 3.1 Flash-Lite",
  "gpt-6.1-sol": "GPT-6.1 Sol", "gpt-6-luna": "GPT-6 Luna",
};
// Short names for the chart's row labels, so they fit on a phone.
const MODEL_SHORT = {
  "claude-opus-5-5": "Opus 5.5", "claude-haiku-5-5": "Haiku 5.5", "gemini-4-argon": "Argon",
  "gemini-3.1-flash-lite": "Flash-Lite", "gpt-6.1-sol": "Sol", "gpt-6-luna": "Luna",
};
// Flagships first within a family, then the lightweight models, then any other.
const MODEL_RANK = ["claude-opus-5-5", "claude-haiku-5-5", "gemini-4-argon", "gemini-3.1-flash-lite", "gpt-6.1-sol", "gpt-6-luna"];
const SEATS = { Government: ["Council", "Chief"], Criminals: ["Families", "Saltdogs"], World: ["World"] };
const SEAT_OF = Object.fromEntries(Object.entries(SEATS).flatMap(([s, ps]) => ps.map((p) => [p, s])));
const BIG = 1000; // a run longer than this is a large export (010-germ: 10,000 days, about 10 MB)

const pct = (x, d = 1) => (Number.isFinite(x) ? `${(x * 100).toFixed(d)}%` : "");
const num1 = (x) => (Number.isFinite(x) ? x.toFixed(1) : "");
const money = (x) => (Number.isFinite(x) ? `$${x.toFixed(x < 0.1 && x > 0 ? 3 : 2)}` : "");
const isBot = (r) => r.model_set === "bot";
// A study-model run outside triples 1 to 9 (the 012-smoke-test) is a test, as
// in the export workflow and analysis.data.is_study_run.
const isTest = (r) => r.model_set === "test" || (r.model_set === "study" && !(r.triple > 0));
const isStudy2 = (r) => r.model_set === "study2"; // Study 2, lightweight models: never pooled with the study

// What each seat's family is compared on. Welfare is the whole city's, shown
// under every seat by the family that held it; fallbacks and cost are the
// seat's own players.
const MEASURES = {
  Government: [["inspection", "Inspection rate", pct], ["audit", "Audit rate", pct], ["welfare", "Welfare per day", num1], ["fallback", "Fallback share", pct], ["cost", "Cost per day", money]],
  Criminals: [["crime", "Crime rate", pct], ["both", "Both respect", pct], ["welfare", "Welfare per day", num1], ["fallback", "Fallback share", pct], ["cost", "Cost per day", money]],
  World: [["welfare", "Welfare per day", num1], ["fallback", "Fallback share", pct], ["cost", "Cost per day", money]],
};
const value = (row, key, seat) => (key === "fallback" || key === "cost" ? row[key][seat] : row[key]);

function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === false || v == null) continue;
    if (k === "class") el.className = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else if (k === "checked") el.checked = !!v;
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid instanceof Node ? kid : String(kid));
  return el;
}
const svg = (tag, attrs = {}, text) => {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  if (text != null) el.textContent = text;
  return el;
};

// ---- One run's numbers, from its export, loaded once ----

const cache = new Map(); // id -> Promise of the run's row

function measure(r) {
  if (!cache.has(r.id)) {
    const p = get(`/api/runs/${encodeURIComponent(r.id)}/export`).then((x) => {
      const p = panel({ ...x, secret: true });
      const days = p.days;
      const fallback = {}, cost = {};
      for (const [seat, players] of Object.entries(SEATS)) {
        const a = players.map((pl) => p.answers?.[pl]).filter(Boolean);
        const n = a.reduce((s, t) => s + t.n, 0);
        fallback[seat] = n ? a.reduce((s, t) => s + t.fallback, 0) / n : NaN;
        cost[seat] = 0;
      }
      let total = 0;
      for (const l of x.ledger || []) {
        const c = l.cost_usd || 0;
        total += c;
        if (SEAT_OF[l.player]) cost[SEAT_OF[l.player]] += c;
      }
      for (const s of Object.keys(cost)) cost[s] = days ? cost[s] / days : NaN;
      const costTotal = typeof r.cost_usd === "number" ? r.cost_usd : total;
      return {
        id: r.id, set: r.model_set, triple: r.triple, seating: r.seating || {}, days,
        models: Object.fromEntries(Object.entries(x.run?.models || {}).map(([seat, m]) => [seat, m?.model])),
        crime: p.crime.rate, inspection: p.inspection?.rate ?? NaN, audit: p.audit?.rate ?? NaN, both: p.turf.both,
        welfare: p.welfare && days ? p.welfare.total / days : NaN, fallback, cost, costTotal, costPerDay: days ? costTotal / days : NaN,
      };
    });
    p.catch(() => cache.delete(r.id)); // a failed load can be tried again
    cache.set(r.id, p);
  }
  return cache.get(r.id);
}

const familyOf = (row, seat) => (row.set === "bot" ? "bots" : row.seating[seat] || "?");

// The row a run counts in for a seat: its model, with test runs kept apart
// from the study sets that play the same model.
function modelOf(row, seat) {
  if (row.set === "bot") return "bots";
  const id = row.models?.[seat] || row.seating[seat] || "?";
  return isTest({ model_set: row.set, triple: row.triple }) ? `${id} (test)` : id;
}
const modelLabel = (key) => {
  if (key === "bots") return "Bots";
  const [id, test] = key.split(" (test)");
  return (MODEL_NAME[id] || FAMILY[id] || id) + (test !== undefined ? " (test)" : "");
};
const modelShort = (key) => {
  if (key === "bots") return "Bots";
  const [id, test] = key.split(" (test)");
  return (MODEL_SHORT[id] || MODEL_NAME[id] || id) + (test !== undefined ? " (test)" : "");
};
const modelOrder = (keys) => [...new Set(keys)].sort((a, b) => {
  const r = (k) => { const i = MODEL_RANK.indexOf(k.split(" (test)")[0]); return k === "bots" ? 999 : i < 0 ? 500 : i; };
  return r(a) - r(b) || a.localeCompare(b);
});

function stats(xs) {
  const v = xs.filter(Number.isFinite);
  if (!v.length) return null;
  return { n: v.length, mean: v.reduce((a, b) => a + b, 0) / v.length, min: Math.min(...v), max: Math.max(...v) };
}

// ---- The page ----

let root, runs, chosen, ticket = 0, csvUrl = null;

export function show(el, all) {
  if (root) return;
  root = el;
  runs = all.filter((r) => !r.sealed);
  const study = runs.filter((r) => r.model_set === "study" && !isTest(r));
  chosen = new Set((study.length ? study : runs.filter(isTest)).map((r) => r.id));
  const live = all.filter((r) => r.sealed).length;
  root.replaceChildren(
    h("section", { "aria-label": "Which runs" },
      h("p", { class: "callout" },
        h("strong", {}, "Descriptive only. "),
        "Each run counts once: its rate over all its days, then the plain mean of those rates for the model that held the seat. With this few runs the means and ranges describe what happened and test nothing. The confirmatory tests are the Bambi models in ",
        h("code", {}, "analysis/bayes"), ", run offline; their results are not on this page."),
      h("div", { class: "runset", id: "x-pick" }),
      live ? h("p", { class: "muted small" }, `${live} live ${live === 1 ? "run is" : "runs are"} left out until ${live === 1 ? "it ends" : "they end"}.`) : null,
      h("p", { class: "msg", id: "x-note" })),
    h("div", { id: "x-body" }),
  );
  renderPicker();
  update();
}

function renderPicker() {
  const groups = [
    ["Study runs", runs.filter((r) => r.model_set === "study" && !isTest(r)), null],
    ["Study 2 runs (lightweight models)", runs.filter(isStudy2), null],
    ["Test runs", runs.filter(isTest), null],
    ["Bot runs", runs.filter(isBot), "The equilibrium baseline: bots, no models. Loaded only when ticked."],
  ].filter(([, rs]) => rs.length);
  root.querySelector("#x-pick").replaceChildren(...groups.map(([label, rs, help]) => h("fieldset", {},
    h("legend", {}, label,
      h("button", { type: "button", class: "ghost small", onclick: () => { rs.forEach((r) => chosen.add(r.id)); renderPicker(); update(); } }, "all"),
      h("button", { type: "button", class: "ghost small", onclick: () => { rs.forEach((r) => chosen.delete(r.id)); renderPicker(); update(); } }, "none")),
    help ? h("p", { class: "help" }, help) : null,
    h("div", { class: "checks" }, rs.map((r) => h("label", {},
      h("input", { type: "checkbox", value: r.id, checked: chosen.has(r.id), onchange: (e) => { e.target.checked ? chosen.add(r.id) : chosen.delete(r.id); update(); } }),
      `${r.id}, ${Number(r.days).toLocaleString("en")} ${r.days === 1 ? "day" : "days"}${r.days > BIG ? " (large download)" : ""}`))))));
}

async function update() {
  const mine = ++ticket;
  const pick = runs.filter((r) => chosen.has(r.id));
  const note = root.querySelector("#x-note");
  if (!pick.length) { note.textContent = "Tick at least one run."; root.querySelector("#x-body").replaceChildren(); return; }
  const fresh = pick.filter((r) => !cache.has(r.id));
  if (fresh.length) {
    const big = fresh.filter((r) => r.days > BIG);
    note.textContent = `Loading ${fresh.length} ${fresh.length === 1 ? "export" : "exports"}${big.length ? `, including ${big.map((r) => r.id).join(", ")} (${big.map((r) => Number(r.days).toLocaleString("en")).join(", ")} days, which takes a few seconds)` : ""}...`;
  }
  const got = await Promise.allSettled(pick.map(measure));
  if (mine !== ticket) return;
  const rows = got.filter((g) => g.status === "fulfilled").map((g) => g.value);
  const failed = pick.filter((_, i) => got[i].status === "rejected").map((r) => r.id);
  note.textContent = failed.length ? `Couldn't load ${failed.join(", ")}. Untick and tick again to retry.` : "";
  render(rows);
}

// ---- Drawing ----

function render(rows) {
  const n = rows.length;
  const body = root.querySelector("#x-body");
  const runsWord = (k) => `${k} ${k === 1 ? "run" : "runs"}`;

  const seatTables = Object.entries(MEASURES).map(([seat, ms]) => {
    const keys = modelOrder(rows.map((r) => modelOf(r, seat)));
    const head = h("tr", {}, h("th", {}, `${seat} model`), ms.map(([, label]) => h("th", {}, label)));
    const trs = keys.map((k) => {
      const mine = rows.filter((r) => modelOf(r, seat) === k);
      return h("tr", {}, h("th", { scope: "row" }, modelLabel(k), h("span", { class: "sub" }, runsWord(mine.length))),
        ms.map(([key, , fmt]) => {
          const s = stats(mine.map((r) => value(r, key, seat)));
          if (!s) return h("td", {}, h("span", { class: "muted" }, "none"));
          return h("td", {}, fmt(s.mean), h("span", { class: "sub" }, s.n === 1 ? "1 run" : `${s.n} runs, ${fmt(s.min)} to ${fmt(s.max)}`));
        }));
    });
    return h("div", { class: "seat" }, h("h3", {}, seat),
      h("div", { class: "table-wrap" }, h("table", { class: "num across" }, h("thead", {}, head), h("tbody", {}, trs))));
  });

  const chart = h("div", { class: "chart" });
  const table = headline(rows);

  body.replaceChildren(
    h("section", { "aria-labelledby": "h-x-seats" },
      h("h2", { id: "h-x-seats" }, `By seat and model (${runsWord(n)})`),
      h("p", { class: "muted" }, "Each cell is the mean of the run-level values for the model that held the seat, with the number of runs and the lowest to highest. Inspections count over the districts the Chief could inspect: open, and without a bribe he took that day. Welfare is the city's, so every seat shows it, by the model that held that seat. Bot runs are grouped as Bots whatever the seating."),
      seatTables),
    h("section", { "aria-labelledby": "h-x-chart" },
      h("h2", { id: "h-x-chart" }, "Rates by model"),
      h("p", { class: "muted" }, "One small dot per run, the ring is the model's mean, the dark tick is the equilibrium: crime 27% and inspection 25%; below a 10% audit rate, taking bribes pays."),
      chart),
    h("section", { "aria-labelledby": "h-x-runs" },
      h("h2", { id: "h-x-runs" }, "Each run"),
      table.wrap,
      h("div", { class: "cta" }, table.download)),
  );
  chart.replaceChildren(rateChart(rows, Math.max(320, Math.min(1100, chart.clientWidth || 640))));
}

// Crime by the Criminals' family, inspection and audit by the Government's.
function rateChart(rows, W) {
  const blocks = [["Crime", "crime", "Criminals", CRIME_RATE, "fam"], ["Inspection", "inspection", "Government", INSPECTION_RATE, "gov"], ["Audit", "audit", "Government", AUDIT_LINE, "wire"]]
    .map(([label, key, seat, target, cls]) => ({
      label, target, cls,
      fams: modelOrder(rows.map((r) => modelOf(r, seat))).map((k) => [k, rows.filter((r) => modelOf(r, seat) === k).map((r) => r[key]).filter(Number.isFinite)]).filter(([, v]) => v.length),
    }));
  // The label column fits the longest short model name, within limits.
  const longest = Math.max(4, ...blocks.flatMap((b) => b.fams.map(([k]) => modelShort(k).length)));
  const row = 28, headH = 24, gap = 10, x0 = Math.min(W * 0.45, Math.max(88, 22 + 7 * longest)), x1 = W - 22;
  const H = blocks.reduce((a, b) => a + headH + Math.max(1, b.fams.length) * row + gap, 0) + 24;
  const sx = (v) => x0 + v * (x1 - x0);
  const s = svg("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "Crime, inspection and audit rates by model, one dot per run" });
  for (const t of [0, 0.25, 0.5, 0.75, 1]) {
    s.append(svg("line", { x1: sx(t), x2: sx(t), y1: 6, y2: H - 22, class: "grid" }));
    s.append(svg("text", { x: sx(t), y: H - 6, "text-anchor": "middle", class: "tick" }, `${t * 100}%`));
  }
  let y = 4;
  for (const b of blocks) {
    s.append(svg("text", { x: 8, y: y + 16, class: `label ${b.cls}` }, `${b.label} rate`));
    y += headH;
    if (!b.fams.length) { s.append(svg("text", { x: x0, y: y + 16, class: "tick" }, "no data")); y += row + gap; continue; }
    for (const [f, vals] of b.fams) {
      const cy = y + row / 2;
      s.append(svg("text", { x: x0 - 14, y: cy + 4, "text-anchor": "end", class: "label" }, modelShort(f)));
      s.append(svg("line", { x1: sx(b.target), x2: sx(b.target), y1: cy - 11, y2: cy + 11, stroke: "var(--text)", "stroke-width": 2.5 }));
      for (const v of vals) s.append(svg("circle", { cx: sx(v), cy, r: 4, fill: `var(--${b.cls})`, "fill-opacity": 0.55 }));
      const mean = vals.reduce((a, c) => a + c, 0) / vals.length;
      s.append(svg("circle", { cx: sx(mean), cy, r: 8, fill: "none", stroke: `var(--${b.cls})`, "stroke-width": 2.5 }));
      y += row;
    }
    y += gap;
  }
  return s;
}

const seatingText = (r) => (r.set === "bot" ? "bots in every seat" : `Gov ${FAMILY[r.seating.Government] || r.seating.Government}, Crim ${FAMILY[r.seating.Criminals] || r.seating.Criminals}, World ${FAMILY[r.seating.World] || r.seating.World}`);
const csvCell = (c) => { const s = String(c ?? ""); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
const raw = (x, d = 4) => (Number.isFinite(x) ? x.toFixed(d) : "");

function headline(rows) {
  const cols = ["Run", "Model set", "Seating", "Days", "Crime", "Inspection", "Audit", "Both respect", "Welfare per day", "Cost"];
  const trs = rows.map((r) => h("tr", {}, [
    h("a", { href: `/analysis/?id=${encodeURIComponent(r.id)}` }, r.id), r.set, seatingText(r), r.days.toLocaleString("en"),
    pct(r.crime), pct(r.inspection), pct(r.audit), pct(r.both), num1(r.welfare), money(r.costTotal),
  ].map((c, i) => h("td", { class: i === 2 ? "wrap" : null }, c))));
  const wrap = h("div", { class: "table-wrap" }, h("table", { class: "num" }, h("thead", {}, h("tr", {}, cols.map((c) => h("th", {}, c)))), h("tbody", {}, trs)));

  const csv = [
    ["run", "model_set", "government", "criminals", "world", "days", "crime_rate", "inspection_rate", "audit_rate", "both_respect_share", "welfare_per_day", "cost_usd",
      "fallback_government", "fallback_criminals", "fallback_world"],
    ...rows.map((r) => [r.id, r.set, r.seating.Government, r.seating.Criminals, r.seating.World, r.days, raw(r.crime), raw(r.inspection), raw(r.audit), raw(r.both),
      raw(r.welfare, 3), raw(r.costTotal, 6), raw(r.fallback.Government), raw(r.fallback.Criminals), raw(r.fallback.World)]),
  ].map((r) => r.map(csvCell).join(",")).join("\n");
  if (csvUrl) URL.revokeObjectURL(csvUrl);
  csvUrl = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const download = h("a", { class: "button ghost small", href: csvUrl, download: "tidewall-across-runs.csv" }, `Download CSV (${rows.length} ${rows.length === 1 ? "run" : "runs"})`);
  return { wrap, download };
}
