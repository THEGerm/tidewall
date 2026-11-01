// The run page (docs/dashboard.md, page 2, steps D2 and D2b). Reads
// /api/runs/:id for the charts and /api/runs/:id/days/:day for the day shown.
// The risograph print (map.js) sits on top; the plain tiles below it carry
// the same facts as text.

const DISTRICTS = ["Port", "Hightown", "Old Quarter", "Lowtown", "Market", "Seawall"];
const TURF = { Port: "Families", Hightown: "Families", "Old Quarter": "Families", Lowtown: "Saltdogs", Market: "Saltdogs", Seawall: "Saltdogs" };
const FAMILY = { claude: "Claude", gemini: "Gemini", gpt: "GPT" };
const SCORERS = [
  { key: "Council", cls: "gov", dash: "" },
  { key: "Chief", cls: "gov", dash: "5 4" },
  { key: "Families", cls: "fam", dash: "" },
  { key: "Saltdogs", cls: "salt", dash: "" },
];
const STATUS = { ready: "Ready to start", running: "Live", paused: "Paused", over: "Finished", truncated: "Finished (stopped at the cap)", sealed: "Finished, sealed until its triple ends" };

const params = new URLSearchParams(location.search);
const id = params.get("id") || "";
let summary = null;
let day = Number(params.get("day")) || 0;
const cache = new Map();

// Small DOM helper: h("p", {class: "x"}, "text", child)
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
const svg = (tag, attrs = {}) => {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
};
const $ = (s) => document.getElementById(s);
const signed = (n) => (n > 0 ? `+${n}` : String(n));

// One event in plain words.
function describe(e) {
  const d = e.detail || {};
  switch (e.kind) {
    case "storm": return "Storm: the Port is closed";
    case "fire": return `Fire in ${e.district}: ${d.gang} lose ${d.loss}`;
    case "strike": return `Dock strike: the treasury loses ${d.loss}`;
    case "ship": return `A ship docks: the Families gain ${d.gain}`;
    case "crime": return `${d.gang} crime in ${e.district}: the city loses ${d.damage}`;
    case "arrest": return `Arrest in ${e.district}: ${d.gang} fined ${d.fine}, one to prison`;
    case "fine_no_place": return `${d.gang} caught in ${e.district}: fined ${d.fine}, no room in prison`;
    case "release": return `One of the ${d.gang} is released from prison`;
    case "turf": return `Turf: Families ${d.Families === "respect" ? "respected" : "encroached"}, Saltdogs ${d.Saltdogs === "respect" ? "respected" : "encroached"}`;
    case "audit_caught": return `Audit in ${e.district} catches the Chief: ${d.seized} seized`;
    case "audit_clean": return `Audit in ${e.district}: clean`;
    case "inspection_empty": return `Police inspect ${e.district}: nothing found`;
    case "bribe_offer": return `${e.actor} offer the Chief ${d.amount} to skip ${e.district}`;
    case "bribe_accepted": return `The Chief takes ${d.amount} from the ${d.gang} for ${e.district}`;
    case "bribe_refused": return `The Chief refuses ${d.amount} from the ${d.gang} for ${e.district}`;
    default: return e.kind;
  }
}
const SHORT = {
  storm: "Storm", fire: "Fire", ship: "Ship in", crime: "Crime", arrest: "Arrest", fine_no_place: "Fined",
  audit_caught: "Chief caught", audit_clean: "Audit", inspection_empty: "Empty inspection",
  bribe_offer: "Bribe offered", bribe_accepted: "Bribe taken", bribe_refused: "Bribe refused",
};
const TONE = { storm: "gov", fire: "fam", crime: "fam", arrest: "gov", fine_no_place: "gov", ship: "salt", audit_caught: "gov", audit_clean: "gov", inspection_empty: "gov", bribe_offer: "wire", bribe_accepted: "wire", bribe_refused: "wire" };

async function getJSON(url) {
  const r = await fetch(url);
  const body = await r.json().catch(() => ({ ok: false, error: `HTTP ${r.status}` }));
  if (!r.ok || body.ok === false) throw new Error(body.error || `HTTP ${r.status}`);
  return body;
}

async function load() {
  if (!/^[a-z0-9-]{1,40}$/.test(id)) return fail("No run given. Pick one from the list on the home page.");
  try {
    summary = await getJSON(`/api/runs/${id}`);
  } catch (e) {
    return fail(e.message === "no such run" ? `There is no run called ${id}.` : `Couldn't load the run: ${e.message}`);
  }
  const { run, days } = summary;
  document.title = `${run.id} · Tidewall`;
  $("crumb").textContent = run.id;
  $("title").textContent = `Run ${run.id}${run.model_set === "test" ? " (test)" : run.model_set === "bot" ? " (bots)" : ""}`;
  $("seating").textContent = ["Government", "Criminals", "World"].map((s) => `${s}: ${FAMILY[run.seating[s]] || run.seating[s]}`).join(" · ");
  $("status").textContent = `${STATUS[run.status] || run.status}, ${days.length} ${days.length === 1 ? "day" : "days"} played`;
  if (run.live && run.status === "running") $("dot").classList.add("ok");
  $("data").href = `/run/data/?id=${encodeURIComponent(run.id)}`;
  $("data-top").href = $("data").href;
  $("theory").href = $("theory-top").href = `/run/theory/?id=${encodeURIComponent(run.id)}`;
  $("analysis").href = `/analysis/?id=${encodeURIComponent(run.id)}`;
  if (!days.length) return fail("No day played yet. The city opens on day 1.", true);

  $("main").hidden = false;
  const slider = $("slider");
  slider.max = days.length;
  if (!day || day > days.length) day = days.length;
  slider.oninput = () => show(Number(slider.value));
  $("prev").onclick = () => show(day - 1);
  $("next").onclick = () => show(day + 1);
  document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" && e.target.type !== "range") return;
    if (e.key === "ArrowLeft") show(day - 1);
    if (e.key === "ArrowRight") show(day + 1);
  });
  renderTurf();
  renderGauges();
  renderPaid();
  let resizing;
  addEventListener("resize", () => { clearTimeout(resizing); resizing = setTimeout(renderScores, 150); });
  await show(day);
}

function fail(text, keepHeader) {
  $("seating").textContent = text;
  if (!keepHeader) $("status").textContent = "";
}

async function show(n) {
  const total = summary.days.length;
  n = Math.max(1, Math.min(total, n));
  day = n;
  $("slider").value = n;
  $("prev").disabled = n <= 1;
  $("next").disabled = n >= total;
  $("daylabel").textContent = `Day ${n} of ${total}`;
  const u = new URL(location.href);
  u.searchParams.set("day", n);
  history.replaceState(null, "", u);
  renderScores();
  renderTurf();
  renderGauges();
  let v = cache.get(n);
  if (!v) {
    try {
      v = await getJSON(`/api/runs/${id}/days/${n}`);
    } catch (e) {
      $("wire").replaceChildren(h("li", { class: "muted" }, `Couldn't load day ${n}: ${e.message}`));
      return;
    }
    cache.set(n, v);
  }
  if (n !== day) return; // the reader moved on while this loaded
  renderMap(v);
  renderWire(v);
  renderConfidant(v);
  renderDiaries(v);
  renderSecrets(v);
}

// The map's colours, for fun only: nothing here is in the game (Germ, 31 Oct;
// turf never changes hands). Each day a gang encroaches, its colour spreads 25
// points into the other gang's districts, up to 50%, and stays: respecting
// never takes it back (Germ, 31 Oct: nothing cancels out). Both gangs' spreads
// show at once. Each gang member in prison hands 10% of that gang's districts
// to the Government colour, up to 80%. Replayed from day 1, so each day
// remembers the one before.
const ENCROACH_STEP = 0.25, ENCROACH_MAX = 0.5, PER_PRISONER = 0.1, GOV_MAX = 0.8;
function influence(upto) {
  const reach = { Families: 0, Saltdogs: 0 };
  for (const d of summary.days.slice(0, upto)) {
    for (const g of ["Families", "Saltdogs"]) {
      if (d.turf?.[g] === "encroach") reach[g] = Math.min(ENCROACH_MAX, reach[g] + ENCROACH_STEP);
    }
  }
  const held = summary.days[upto - 1]?.prisonBy || {};
  return Object.fromEntries(DISTRICTS.map((d) => {
    const owner = TURF[d], other = owner === "Families" ? "Saltdogs" : "Families";
    return [d, { owner, other, encroached: reach[other], government: Math.min(GOV_MAX, PER_PRISONER * (held[owner] || 0)) }];
  }));
}

let print = null;
function renderPrint(v) {
  if (!window.TidewallMap) return; // the plain tiles still carry every fact
  if (!print) {
    print = TidewallMap.mount($("print"), {
      seed: id,
      onDistrict: (d) => document.querySelector(`.tile[data-district="${d}"]`)?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
    });
  }
  const d = summary.days[v.day - 1];
  print.update({ day: v.day, open: v.open, nature: v.nature, events: v.events, turf: d.turf, prison: d.prison, treasury: d.treasury, live: v.run.live, sealed: v.run.sealed, influence: influence(v.day) });
}

function renderMap(v) {
  renderPrint(v);
  const open = new Set(v.open);
  const byDistrict = Object.fromEntries(DISTRICTS.map((d) => [d, []]));
  const citywide = [];
  for (const e of v.events) {
    if (e.kind === "turf") continue; // shown in the turf strip
    if (e.district && byDistrict[e.district] && SHORT[e.kind]) byDistrict[e.district].push(e);
    else citywide.push(e);
  }
  $("map").replaceChildren(
    ...DISTRICTS.map((d) => {
      const gang = TURF[d];
      const evs = byDistrict[d];
      return h("article", { class: `tile ${gang === "Families" ? "fam" : "salt"}${open.has(d) ? "" : " closed"}`, "data-district": d },
        h("header", {}, h("strong", {}, d), h("span", { class: "owner" }, gang)),
        open.has(d) ? null : h("p", { class: "closedtag" }, "Closed today"),
        h("ul", { class: "badges" }, evs.map((e) => h("li", { class: `badge ${TONE[e.kind] || ""}${e.public ? "" : " secret"}`, title: describe(e) }, SHORT[e.kind]))),
        evs.length ? null : h("p", { class: "quiet" }, "Quiet"),
      );
    }),
  );
  $("citywide").replaceChildren(...citywide.map((e) => h("li", {}, describe(e))));
}

function renderWire(v) {
  const byId = Object.fromEntries(v.events.map((e) => [e.id, e]));
  const items = v.wire.map((w) => {
    const districts = [...new Set(w.events.map((x) => byId[x]?.district).filter(Boolean))];
    const li = h("li", { tabindex: "0" },
      h("strong", {}, w.headline),
      h("p", {}, w.text),
      h("p", { class: "cites" }, "Reports: ", w.events.map((x) => (byId[x] ? describe(byId[x]) : x)).join("; ")),
    );
    const mark = (on) => {
      document.querySelectorAll(".tile").forEach((t) => t.classList.toggle("lit", on && districts.includes(t.dataset.district)));
      print?.highlight(on ? districts : []);
    };
    li.addEventListener("mouseenter", () => mark(true));
    li.addEventListener("mouseleave", () => mark(false));
    li.addEventListener("focus", () => mark(true));
    li.addEventListener("blur", () => mark(false));
    return li;
  });
  $("wire").replaceChildren(...(items.length ? items : [h("li", { class: "muted" }, "No news today.")]));
}

function renderScores() {
  const days = summary.days;
  // Size the chart to its box so text stays at its real size on a phone.
  const W = Math.max(300, Math.min(1000, $("scores").clientWidth || 640)), H = W < 500 ? 200 : 240, L = 44, R = 78, T = 12, B = 26;
  const vals = days.flatMap((d) => SCORERS.map((s) => d.scores[s.key])).concat(0);
  let lo = Math.min(...vals), hi = Math.max(...vals);
  if (hi === lo) hi = lo + 1;
  const n = days.length;
  const x = (i) => L + (n === 1 ? (W - L - R) / 2 : (i * (W - L - R)) / (n - 1));
  const y = (v) => T + ((hi - v) * (H - T - B)) / (hi - lo);
  const root = svg("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": `Running scores to day ${day}` });
  for (const v of [lo, 0, hi]) {
    root.append(svg("line", { x1: L, x2: W - R, y1: y(v), y2: y(v), class: v === 0 ? "axis" : "grid" }));
    const t = svg("text", { x: L - 6, y: y(v) + 4, "text-anchor": "end", class: "tick" });
    t.textContent = Math.round(v);
    root.append(t);
  }
  const ticks = n <= 1 ? [0] : [0, n - 1];
  for (const i of ticks) {
    const t = svg("text", { x: x(i), y: H - 6, "text-anchor": "middle", class: "tick" });
    t.textContent = `day ${days[i].day}`;
    root.append(t);
  }
  root.append(svg("line", { x1: x(day - 1), x2: x(day - 1), y1: T, y2: H - B, class: "now" }));
  const labels = [];
  for (const s of SCORERS) {
    const pts = days.map((d, i) => `${x(i)},${y(d.scores[s.key])}`).join(" ");
    root.append(svg("polyline", { points: pts, class: `line ${s.cls}`, "stroke-dasharray": s.dash }));
    root.append(svg("circle", { cx: x(day - 1), cy: y(days[day - 1].scores[s.key]), r: 3.5, class: `pt ${s.cls}` }));
    labels.push({ s, y: y(days[n - 1].scores[s.key]) });
  }
  // End labels, nudged apart so they don't overlap.
  labels.sort((a, b) => a.y - b.y);
  for (let i = 1; i < labels.length; i++) labels[i].y = Math.max(labels[i].y, labels[i - 1].y + 13);
  for (const { s, y: ly } of labels) {
    const t = svg("text", { x: W - R + 6, y: ly + 4, class: `label ${s.cls}` });
    t.textContent = s.key;
    root.append(t);
  }
  $("scores").replaceChildren(root);
  const d = days[day - 1];
  $("today").replaceChildren(
    ...SCORERS.map((s) => h("span", { class: `chip ${s.cls}` }, `${s.key} ${d.scores[s.key]} (${signed(d.delta[s.key])} today)`)),
  );
}

function renderTurf() {
  const rows = ["Families", "Saltdogs"].map((g) =>
    h("div", { class: "turfrow" },
      h("span", { class: "turfname" }, g),
      h("div", { class: "squares" },
        summary.days.map((d) => {
          const move = d.turf?.[g];
          return h("span", {
            class: `sq ${g === "Families" ? "fam" : "salt"} ${move || "none"}${d.day === day ? " on" : ""}`,
            title: `Day ${d.day}: ${move === "respect" ? "respected" : move === "encroach" ? "encroached" : "no move"}`,
          }, move === "respect" ? "R" : move === "encroach" ? "E" : "");
        }),
      ),
    ),
  );
  $("turf").replaceChildren(...rows);
  const on = $("turf").querySelector(".sq.on");
  if (on) $("turf").scrollLeft = Math.max(0, on.offsetLeft - $("turf").clientWidth / 2);
}

function spark(values, cls) {
  const W = 160, H = 36;
  const lo = Math.min(...values), hi = Math.max(...values, lo + 1);
  const x = (i) => (values.length === 1 ? W / 2 : (i * W) / (values.length - 1));
  const y = (v) => 2 + ((hi - v) * (H - 4)) / (hi - lo);
  const root = svg("svg", { viewBox: `0 0 ${W} ${H}`, class: "spark", "aria-hidden": "true" });
  root.append(svg("polyline", { points: values.map((v, i) => `${x(i)},${y(v)}`).join(" "), class: `line ${cls}` }));
  root.append(svg("circle", { cx: x(day - 1), cy: y(values[day - 1]), r: 3, class: `pt ${cls}` }));
  return root;
}

function renderGauges() {
  const d = summary.days[day - 1];
  $("gauges").replaceChildren(
    h("article", {}, h("h3", {}, "Prison"), h("p", { class: "big" }, `${d.prison} of 40 places`), spark(summary.days.map((x) => x.prison), "gov")),
    h("article", {}, h("h3", {}, "Treasury"), h("p", { class: "big" }, `${d.treasury} coins`), spark(summary.days.map((x) => x.treasury), "wire")),
  );
}

function renderConfidant(v) {
  const texts = v.confidant?.texts || [];
  const when = { before: "Before moving", after: "After the day" };
  $("confidant").replaceChildren(
    ...(texts.length
      ? texts.map((c) => h("article", {},
          h("p", { class: "who" }, `${c.player}, ${when[c.window].toLowerCase()}`),
          h("p", { class: "them" }, c.text == null ? h("em", {}, "Sent nothing.") : c.text),
          h("p", { class: "sam" }, "Sam: ", c.reply),
        ))
      : [h("p", { class: "muted" }, "No texts to Sam today.")]),
  );
}

// Each player's whole diary up to the day shown, live (Germ, 31 Oct). Each
// card pages through the player's entries one day at a time, from the day
// shown back to day 1. An entry the player had deleted from its memory by
// then is marked; the record keeps it.
const WRITERS = ["Council", "Chief", "Families", "Saltdogs", "World"];
const diaryAt = {}; // player -> day being read, kept while the day shown stays the same
let diaryDay = 0;
function renderDiaries(v) {
  if (diaryDay !== v.day) { for (const k of Object.keys(diaryAt)) delete diaryAt[k]; diaryDay = v.day; }
  const all = (v.diary?.entries || []).filter((x) => x.text);
  const books = WRITERS.map((p) => all.filter((x) => x.player === p).sort((a, b) => a.day - b.day)).filter((b) => b.length);
  const card = (b) => {
    const p = b[0].player;
    let i = b.findIndex((x) => x.day === diaryAt[p]);
    if (i < 0) i = b.length - 1; // start on the latest entry
    const x = b[i];
    const go = (j) => () => { diaryAt[p] = b[j].day; renderDiaries(v); };
    return h("article", {},
      h("p", { class: "who" }, `${p}: day ${x.day}`, x.day === v.day ? " (today)" : "", `, entry ${i + 1} of ${b.length}`),
      h("p", { class: x.forgotten_on ? "them muted" : "them" }, x.text, x.forgotten_on ? h("em", {}, ` (deleted from memory on day ${x.forgotten_on})`) : null),
      h("div", { class: "pager" },
        h("button", { class: "ghost small", onclick: go(0), disabled: i === 0, "aria-label": `${p}: first entry` }, "Day 1"),
        h("button", { class: "ghost small", onclick: go(i - 1), disabled: i === 0, "aria-label": `${p}: previous day` }, "Previous"),
        h("button", { class: "ghost small", onclick: go(i + 1), disabled: i === b.length - 1, "aria-label": `${p}: next day` }, "Next"),
        h("button", { class: "ghost small", onclick: go(b.length - 1), disabled: i === b.length - 1, "aria-label": `${p}: latest entry` }, "Latest"),
      ),
    );
  };
  $("diaries").replaceChildren(...(books.length ? books.map(card) : [h("p", { class: "muted" }, "No diary entries yet.")]));
}

// Finished runs only (step D6): tabs for what was hidden while the run was live.
let tab = "moves"; // remembered across days
const TABS = [["moves", "Secret moves"], ["messages", "Messages"], ["forecasts", "Forecasts"], ["answers", "Answers"]];
const pct = (x) => (typeof x === "number" ? `${Math.round(x * 100)}%` : "");

function renderSecrets(v) {
  if (v.run.sealed) { $("after").hidden = true; return; }
  $("after").hidden = false;
  const list = (items, empty) => (items.length ? h("ul", { class: "plain" }, items) : h("p", { class: "muted" }, empty));
  const panels = {
    moves: () => list(v.events.filter((e) => !e.public).map((e) => h("li", {}, describe(e))), "No secret moves today."),
    messages: () => list((v.messages || []).map((m) => h("li", {}, h("strong", {}, `${m.from} to ${m.to}: `), m.text)), "No private messages today."),
    forecasts: () => forecastTable(v),
    answers: () => {
      const odd = (v.answers || []).filter((a) => a.source !== "player");
      return odd.length
        ? list(odd.map((a) => h("li", {}, h("strong", {}, `${a.player}, ${a.step.replace("_", " ")}: `), a.source === "retry" ? "answered on the retry" : `fallback (${a.reason})`)), "")
        : h("p", { class: "muted" }, "Every answer came from the players themselves, first time.");
    },
  };
  const bar = h("div", { class: "tabs", role: "tablist", "aria-label": "Opened after the run" },
    TABS.map(([key, label]) => h("button", {
      type: "button", role: "tab", class: "ghost", "aria-selected": String(key === tab), "aria-controls": "tabpanel",
      onclick: () => { tab = key; renderSecrets(v); },
    }, label)));
  $("secrets").replaceChildren(bar, h("div", { id: "tabpanel", role: "tabpanel", class: "tabpanel" }, panels[tab]()));
}

// Each player's forecasts for the day, next to what happened.
function forecastTable(v) {
  const fs = v.forecasts || [];
  if (!fs.length) return h("p", { class: "muted" }, "No forecasts today.");
  const m = v.moves || {};
  const open = v.open || [];
  const yn = (b) => (b ? "yes" : "no");
  const rows = [
    ...open.map((d) => [`Crime in ${d}`, (f) => f.p_crime?.[d], yn(m.crime?.[d])]),
    ...open.map((d) => [`Inspection in ${d}`, (f) => f.p_inspect?.[d], yn((m.inspect || []).includes(d))]),
    ["Both gangs respect", (f) => f.p_both_respect, m.turf ? yn(m.turf.Families === "respect" && m.turf.Saltdogs === "respect") : ""],
    ["Any bribe taken", (f) => f.p_any_bribe_accepted, yn((m.accepted || []).length)],
    ["Any audit", (f) => f.p_any_audit, yn((m.audit || []).length)],
  ];
  return h("div", { class: "table-wrap" }, h("table", { class: "num forecasts" },
    h("thead", {}, h("tr", {}, h("th", {}, "Question"), h("th", {}, "Happened"), fs.map((f) => h("th", {}, f.player)))),
    h("tbody", {}, rows.map(([q, get, actual]) => h("tr", {},
      h("td", {}, q), h("td", { class: actual === "yes" ? "yes" : "" }, actual),
      fs.map((f) => h("td", {}, pct(get(f.forecasts)))))))));
}

// Who paid: the run's ledger summed by payer and provider (step D3).
async function renderPaid() {
  const PROVIDER = { anthropic: "Anthropic", google: "Google", openai: "OpenAI" };
  let rows = [];
  try { rows = (await getJSON(`/api/runs/${id}/ledger`)).ledger; } catch { return; }
  const by = new Map();
  for (const r of rows) {
    const k = `${r.payer_name ?? "nobody"}|${r.provider}`;
    const t = by.get(k) || { payer: r.payer_name ?? "nobody (no key)", provider: r.provider, calls: 0, fallback: 0, input: 0, cached: 0, output: 0, cost: 0 };
    t.calls += r.calls; t.fallback += r.fallback_calls || 0;
    t.input += r.input || 0; t.cached += r.cached_input || 0; t.output += r.output || 0; t.cost += r.cost_usd || 0;
    by.set(k, t);
  }
  const m = (x) => (x / 1e6).toFixed(2);
  const head = h("thead", {}, h("tr", {}, ["Payer", "Provider", "Calls", "Covering", "Input", "Cached", "Output", "Cost"].map((x) => h("th", {}, x))));
  const body = h("tbody", {}, by.size
    ? [...by.values()].map((t) => h("tr", {}, [t.payer, PROVIDER[t.provider] || t.provider, t.calls, t.fallback || "", m(t.input), m(t.cached), m(t.output), `$${t.cost.toFixed(2)}`].map((x) => h("td", {}, x))))
    : h("tr", {}, h("td", { colspan: "8" }, "No model calls yet (bots cost nothing).")));
  $("paid").replaceChildren(head, body);
}

load();
// Live runs: check for a new day every 30 seconds; follow it if the reader is on the latest day.
setInterval(async () => {
  if (!summary?.run.live || document.hidden) return;
  try {
    const next = await getJSON(`/api/runs/${id}`);
    const atEnd = day === summary.days.length;
    const grew = next.days.length > summary.days.length;
    if (!next.run.live) { location.reload(); return; } // finished: reload (secrets open once its triple ends)
    summary = next;
    $("status").textContent = `${STATUS[next.run.status] || next.run.status}, ${next.days.length} ${next.days.length === 1 ? "day" : "days"} played`;
    if (grew) {
      $("slider").max = next.days.length;
      if ($("main").hidden) { location.reload(); return; }
      show(atEnd ? next.days.length : day);
      renderPaid();
    }
  } catch {}
}, 30000);
