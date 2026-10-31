// The analysis page (docs/dashboard.md, page 8): pick a run, see its game
// theory results and its raw logs. A finished run reads its export; a live
// run shows only what the public API gives while it plays. The figures come
// from run/theory/metrics.js and are drawn by run/theory/view.js, the same
// code as the per-run theory page.

import { forecastPairs, panel, scoredOn } from "../run/theory/metrics.js";
import { SECTIONS, get, load, render } from "../run/theory/view.js";

const $ = (id) => document.getElementById(id);
const PAGE = 100; // rows drawn at a time, so a 60-day run stays quick on a phone
const PLAYERS = ["Council", "Chief", "Families", "Saltdogs", "World"];
const FAMILY = { claude: "Claude", gemini: "Gemini", gpt: "GPT" };
const PROVIDER = { anthropic: "Anthropic", google: "Google", openai: "OpenAI" };
const STATUS = { ready: "Ready to start", running: "Live", paused: "Paused", over: "Finished", truncated: "Finished (stopped at the cap)" };
const EVENT_NAME = { p_crime: "crime", p_inspect: "inspection", p_both_respect: "both gangs respect", p_any_bribe_accepted: "any bribe taken", p_any_audit: "any audit" };

const params = new URLSearchParams(location.search);
let runs = [];
let current = null; // { run, summary, x, views, ledger, logs }
let tab = params.get("tab") || "calls";
let filter = { day: "", player: "" };
let page = 0;
let ticket = 0; // the latest load; older ones drop their answer
let csvUrl = null;

function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === false || v == null) continue;
    if (k === "class") el.className = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid instanceof Node ? kid : String(kid));
  return el;
}

const yn = (b) => (b ? "yes" : "no");
const money = (x) => (typeof x === "number" ? `$${x.toFixed(2)}` : "");
const fmtDetail = (d) => (d ? Object.entries(d).map(([k, v]) => `${k}: ${typeof v === "object" && v ? JSON.stringify(v) : v}`).join(", ") : "");
const isTest = (r) => r.model_set === "test";

// ---- The run selector ----

function optionLabel(r) {
  const st = r.live ? `${STATUS[r.status] || r.status}, public data only` : STATUS[r.status] || r.status;
  return `${r.id}: ${r.days} ${r.days === 1 ? "day" : "days"}, ${st}`;
}

function fillPicker(selected) {
  const groups = [["Study runs", runs.filter((r) => !isTest(r))], ["Test runs", runs.filter(isTest)]];
  const opts = groups.filter(([, rs]) => rs.length).map(([label, rs]) =>
    h("optgroup", { label }, rs.map((r) => h("option", { value: r.id, selected: r.id === selected }, optionLabel(r)))));
  $("pick").replaceChildren(...opts);
}

// No id in the link: the latest finished study run, else the latest finished
// run, else the latest of any.
function defaultRun() {
  const newest = (rs) => [...rs].sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)))[0];
  return (newest(runs.filter((r) => !r.live && !isTest(r))) || newest(runs.filter((r) => !r.live)) || newest(runs))?.id;
}

// ---- The logs: one table per tab, built once per run ----

const col = (k, label, cls) => ({ k, label, cls });

function buildLogs(d) {
  const { run, x, views, ledger } = d;
  const secret = !run.live;
  const closed = "Secret until the run ends.";
  const logs = {};

  logs.calls = secret
    ? {
        label: "Model calls",
        note: "One row per model call, from the ledger. Covering means the payer's key stood in for a player whose own key failed.",
        cols: [col("day", "Day"), col("seq", "Seq"), col("player", "Player"), col("step", "Step"), col("provider", "Provider"), col("model", "Model"),
          col("payer", "Payer"), col("ok", "OK"), col("stop", "Stop"), col("input", "Tokens in"), col("cached", "Cached"), col("output", "Out"),
          col("reasoning", "Reasoning"), col("cost", "Cost ($)"), col("latency", "Latency (ms)"), col("error", "Error", "text")],
        rows: (x.ledger || []).map((l) => ({
          day: l.day, seq: l.seq, player: l.player, step: l.step, provider: PROVIDER[l.provider] || l.provider,
          model: l.model_reported && l.model_reported !== l.model ? `${l.model} (reported ${l.model_reported})` : l.model,
          payer: `${l.payer_name ?? "nobody"}${l.fallback_key ? " (covering)" : ""}`, ok: yn(l.ok), stop: l.stop ?? "",
          input: l.input ?? "", cached: l.cached_input ?? "", output: l.output ?? "", reasoning: l.reasoning ?? "",
          cost: typeof l.cost_usd === "number" ? l.cost_usd.toFixed(5) : "", latency: l.latency_ms ?? "", error: l.error ?? "",
        })),
      }
    : {
        label: "Model calls",
        note: "While a run is live the public ledger gives totals per day, provider and payer. One row per call opens when the run ends.",
        cols: [col("day", "Day"), col("provider", "Provider"), col("payer", "Payer"), col("calls", "Calls"), col("covering", "Covering"),
          col("input", "Tokens in"), col("cached", "Cached"), col("output", "Out"), col("cost", "Cost ($)")],
        rows: (ledger || []).map((l) => ({
          day: l.day, provider: PROVIDER[l.provider] || l.provider, payer: l.payer_name ?? "nobody", calls: l.calls, covering: l.fallback_calls || "",
          input: l.input ?? "", cached: l.cached_input ?? "", output: l.output ?? "", cost: typeof l.cost_usd === "number" ? l.cost_usd.toFixed(5) : "",
        })),
        noPlayer: true,
      };

  logs.answers = {
    label: "Answers",
    note: secret ? "Where each player's answer came from: the player, a retry after an invalid answer, or the fallback move." : closed,
    cols: [col("day", "Day"), col("player", "Player"), col("step", "Step"), col("source", "Source"), col("reason", "Reason"), col("errors", "Errors", "text")],
    rows: secret ? (x.answers || []).map((a) => ({ ...a, reason: a.reason ?? "", errors: (a.errors || []).join("; ") })) : [],
  };

  const events = secret ? x.events || [] : (views || []).flatMap((v) => (v?.events || []).map((e) => ({ day: v.day, ...e })));
  logs.events = {
    label: "Events",
    note: secret ? "Every event, public and secret. Secret ones were hidden while the run was live." : "Public events only while the run is live; secret ones open when it ends.",
    cols: [col("day", "Day"), col("id", "ID"), col("kind", "Kind"), col("seen", "Seen"), col("district", "District"), col("actor", "Actor"), col("detail", "Detail", "text")],
    rows: events.map((e) => ({ day: e.day, id: e.id, kind: e.kind, seen: e.public ? "public" : "secret", district: e.district ?? "", actor: e.actor ?? "", detail: fmtDetail(e.detail) })),
    who: (r) => [r.actor],
  };

  logs.messages = {
    label: "Private messages",
    note: secret ? "Messages between players. The player filter matches sender or recipient." : closed,
    cols: [col("day", "Day"), col("from", "From"), col("to", "To"), col("text", "Message", "text")],
    rows: secret ? (x.messages || []).map((m) => ({ ...m })) : [],
    who: (r) => [r.from, r.to],
  };

  const diaries = secret ? x.diaries || [] : views?.at(-1)?.diary?.entries || [];
  logs.diaries = {
    label: "Diaries",
    confidential: true,
    note: "Each player's diary entry for the day. Forgotten on is the day the player deleted it from its memory; the record keeps it.",
    cols: [col("day", "Day"), col("player", "Player"), col("text", "Entry", "text"), col("forgotten", "Forgotten on")],
    rows: diaries.map((e) => ({ day: e.day, player: e.player, text: e.text ?? "", forgotten: e.forgotten_on ?? "" })),
  };

  const byDay = Object.fromEntries((x.days || []).map((dd) => [dd.day, dd]));
  logs.forecasts = {
    label: "Forecasts",
    note: secret ? "Each forecast against what happened, one row per question. Scored is no where the player's own moves decide the event." : closed,
    cols: [col("day", "Day"), col("player", "Player"), col("event", "Event"), col("p", "Forecast"), col("happened", "Happened"), col("scored", "Scored")],
    rows: secret ? (x.forecasts || []).flatMap((f) => {
      const dd = byDay[f.day];
      if (!dd) return [];
      return forecastPairs(f.forecasts || {}, dd.moves || {}, dd.open || []).map(([key, dist, p, o]) => ({
        day: f.day, player: f.player, event: dist ? `${EVENT_NAME[key]}: ${dist}` : EVENT_NAME[key] || key, p: p.toFixed(2), happened: yn(o), scored: yn(scoredOn(f.player, key, dist)),
      }));
    }) : [],
  };

  const wire = secret ? x.wire || [] : (views || []).flatMap((v) => (v?.wire || []).map((w) => ({ day: v.day, ...w })));
  logs.wire = {
    label: "The Wire",
    note: "The city's newspaper, with the events each item reports.",
    cols: [col("day", "Day"), col("headline", "Headline", "text"), col("text", "Story", "text"), col("cites", "Reports")],
    rows: wire.map((w) => ({ day: w.day, headline: w.headline, text: w.text, cites: (w.events || []).join(" ") })),
    noPlayer: true,
  };

  const conf = secret ? x.confidant || [] : (views || []).flatMap((v) => (v?.confidant?.texts || []).map((c) => ({ day: v.day, ...c })));
  logs.confidant = {
    label: "Texts to Sam",
    confidential: true,
    note: "Each human player's texts to Sam, the confidant, before moving and after the day, and Sam's replies.",
    cols: [col("day", "Day"), col("player", "Player"), col("window", "When"), col("text", "Text", "text"), col("reply", "Sam", "text")],
    rows: conf.map((c) => ({ day: c.day, player: c.player, window: c.window === "before" ? "before moving" : "after the day", text: c.text ?? "(sent nothing)", reply: c.reply ?? "" })),
  };
  return logs;
}

function filtered(log) {
  const who = log.who || ((r) => [r.player]);
  return log.rows.filter((r) =>
    (!filter.day || String(r.day) === filter.day) && (!filter.player || log.noPlayer || who(r).includes(filter.player)));
}

const csvCell = (c) => { const s = String(c ?? ""); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };

function renderTabs() {
  const logs = current.logs;
  if (!logs[tab]) tab = "calls";
  $("tabs").replaceChildren(...Object.entries(logs).map(([k, log]) => h("button", {
    type: "button", role: "tab", class: "ghost", "aria-selected": String(k === tab), "aria-controls": "logpanel",
    onclick: () => { tab = k; page = 0; setUrl(); renderTabs(); },
  }, `${log.label} (${log.rows.length})`)));
  renderLog();
}

function select(label, value, options, onchange) {
  return h("label", { class: "pick" }, label,
    h("select", { onchange: (e) => onchange(e.target.value) }, options.map(([v, t]) => h("option", { value: v, selected: v === value }, t))));
}

function renderLog() {
  const log = current.logs[tab];
  $("log-note").replaceChildren(log.confidential ? h("span", { class: "confidential" }, "CONFIDENTIAL") : "", log.note);
  const days = [...new Set(log.rows.map((r) => r.day))].sort((a, b) => a - b);
  const names = [...new Set(log.rows.flatMap(log.who || ((r) => [r.player])).filter(Boolean))]
    .sort((a, b) => (PLAYERS.indexOf(a) + 1 || 99) - (PLAYERS.indexOf(b) + 1 || 99) || a.localeCompare(b));
  const rows = filtered(log);
  const last = Math.max(0, Math.ceil(rows.length / PAGE) - 1);
  page = Math.min(page, last);

  if (csvUrl) URL.revokeObjectURL(csvUrl);
  const csv = [log.cols.map((c) => c.label), ...rows.map((r) => log.cols.map((c) => r[c.k]))].map((r) => r.map(csvCell).join(",")).join("\n");
  csvUrl = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const suffix = [filter.day && `day${filter.day}`, !log.noPlayer && filter.player].filter(Boolean).join("-");
  $("filters").replaceChildren(
    select("Day", filter.day, [["", "All days"], ...days.map((d) => [String(d), `Day ${d}`])], (v) => { filter.day = v; page = 0; renderLog(); }),
    ...(log.noPlayer ? [] : [select("Player", filter.player, [["", "All players"], ...names.map((n) => [n, n])], (v) => { filter.player = v; page = 0; renderLog(); })]),
    h("a", { class: "button ghost small", href: csvUrl, download: `${current.run.id}-${tab}${suffix ? `-${suffix}` : ""}.csv` }, `Download CSV (${rows.length} ${rows.length === 1 ? "row" : "rows"})`),
  );

  const shown = rows.slice(page * PAGE, (page + 1) * PAGE);
  const thead = h("thead", {}, h("tr", {}, log.cols.map((c) => h("th", {}, c.label))));
  const tbody = h("tbody", {}, shown.length
    ? shown.map((r) => h("tr", { class: r.seen === "secret" ? "secret" : r.ok === "no" ? "failed" : null }, log.cols.map((c) => h("td", { class: c.cls }, r[c.k] ?? ""))))
    : h("tr", {}, h("td", { colspan: String(log.cols.length) }, log.rows.length ? "No rows match these filters." : current.run.live && !log.rows.length ? "Nothing public yet." : "No rows.")));
  $("log").replaceChildren(thead, tbody);

  $("pager").replaceChildren(...(rows.length > PAGE ? [
    h("button", { type: "button", class: "ghost small", disabled: page === 0, onclick: () => { page--; renderLog(); } }, "Previous"),
    h("span", { class: "muted" }, `Rows ${page * PAGE + 1} to ${page * PAGE + shown.length} of ${rows.length}`),
    h("button", { type: "button", class: "ghost small", disabled: page === last, onclick: () => { page++; renderLog(); } }, "Next"),
  ] : []));
}

// ---- The run header and results ----

function renderRun() {
  const { run, summary, x } = current;
  const days = summary.days.length;
  const listed = runs.find((r) => r.id === run.id);
  const cost = listed?.cost_usd ?? (current.ledger || []).reduce((a, l) => a + (l.cost_usd || 0), 0);
  const answers = x.answers || [];
  const fb = answers.filter((a) => a.source === "fallback").length;
  const retries = answers.filter((a) => a.source === "retry").length;
  const fact = (label, value, sub) => h("article", {}, h("h3", {}, label), h("p", { class: "big" }, value), sub ? h("p", { class: "muted small" }, sub) : null);
  $("title").textContent = run.id;
  document.title = `${run.id} analysis · Tidewall`;
  $("facts").replaceChildren(
    fact("Seating", h("span", { class: "seats" }, ["Government", "Criminals", "World"].map((s) => h("span", {}, `${s}: `, h("strong", {}, FAMILY[run.seating?.[s]] || run.seating?.[s] || "?")))), isTest(run) ? "Test run" : `Study run, triple ${run.triple}, rotation ${run.rotation}`),
    fact("Status", STATUS[run.status] || run.status, run.live ? "Public data only until it ends" : run.seed ? `Seed ${run.seed}` : null),
    fact("Days", String(days), run.rules_version ? `Rules ${run.rules_version}` : null),
    fact("Cost", money(cost), days ? `${money(cost / days)} a day` : null),
    fact("Fallbacks", run.live ? "When it ends" : `${fb} of ${answers.length}`, run.live ? "Answers are secret while live" : `answers; ${retries} more came on the retry`),
  );
  const enc = encodeURIComponent(run.id);
  const link = (href, text, download) => h("a", { class: "button ghost small", href, download }, text);
  $("links").replaceChildren(
    link(`/run/?id=${enc}`, "Watch the run"),
    link(`/run/theory/?id=${enc}`, "Game theory page"),
    link(`/run/data/?id=${enc}`, "Data and downloads"),
    ...(run.live ? [] : [link(`/api/runs/${enc}/export`, "Full export (JSON)", `${run.id}.json`)]),
  );
  $("run-link").href = `/run/?id=${enc}`;
  $("theory-link").href = `/run/theory/?id=${enc}`;
  $("data-link").href = `/run/data/?id=${enc}`;

  $("results-note").textContent = run.live
    ? "While a run is live these use public data only: crime and turf. Inspections, audits, bribes, forecasts and fallbacks open when it ends."
    : "The run against the game's equilibrium, from the full export. The same figures as the game theory page.";
  $("panel").innerHTML = SECTIONS;
}

function setUrl() {
  const u = new URL(location.href);
  if (current) u.searchParams.set("id", current.run.id);
  u.searchParams.set("tab", tab);
  history.replaceState(null, "", u);
}

async function choose(id) {
  const mine = ++ticket;
  $("note").textContent = `Loading ${id}...`;
  try {
    const [d, ledger] = await Promise.all([load(id), get(`/api/runs/${id}/ledger`).then((b) => b.ledger).catch(() => [])]);
    if (mine !== ticket) return;
    current = { ...d, ledger };
    current.logs = buildLogs(current);
    filter = { day: "", player: "" };
    page = 0;
    setUrl();
    $("main").hidden = false;
    renderRun();
    render($("panel"), panel(current.x));
    renderTabs();
    $("note").textContent = "";
  } catch (e) {
    if (mine === ticket) $("note").textContent = `Couldn't load ${id}: ${e.message}`;
  }
}

(async () => {
  try {
    runs = (await get("/api/runs")).runs;
  } catch (e) { $("note").textContent = `Couldn't load the runs: ${e.message}`; return; }
  if (!runs.length) { $("pick").replaceChildren(h("option", {}, "No runs yet")); $("note").textContent = "No runs yet."; return; }
  const asked = params.get("id");
  const id = runs.some((r) => r.id === asked) ? asked : defaultRun();
  fillPicker(id);
  $("pick").addEventListener("change", (e) => choose(e.target.value));
  await choose(id);
  if (asked && asked !== id) $("note").textContent = `There is no run called ${asked}; showing ${id}.`;
})();
