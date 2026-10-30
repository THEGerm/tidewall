// The run page (docs/dashboard.md, page 2, step D2). Reads /api/runs/:id for
// the charts and /api/runs/:id/days/:day for the day shown. The map here is
// the plain one; the risograph map (D2b) replaces it later.

const DISTRICTS = ["Port", "Hightown", "Old Quarter", "Lowtown", "Market", "Seawall"];
const TURF = { Port: "Families", Hightown: "Families", "Old Quarter": "Families", Lowtown: "Saltdogs", Market: "Saltdogs", Seawall: "Saltdogs" };
const FAMILY = { claude: "Claude", gemini: "Gemini", gpt: "GPT" };
const SCORERS = [
  { key: "Council", cls: "gov", dash: "" },
  { key: "Chief", cls: "gov", dash: "5 4" },
  { key: "Families", cls: "fam", dash: "" },
  { key: "Saltdogs", cls: "salt", dash: "" },
];
const STATUS = { ready: "Ready to start", running: "Live", paused: "Paused", over: "Finished", truncated: "Finished (stopped at the cap)" };

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
  $("title").textContent = `Run ${run.id}${run.model_set === "test" ? " (test)" : ""}`;
  $("seating").textContent = ["Government", "Criminals", "World"].map((s) => `${s}: ${FAMILY[run.seating[s]] || run.seating[s]}`).join(" · ");
  $("status").textContent = `${STATUS[run.status] || run.status}, ${days.length} ${days.length === 1 ? "day" : "days"} played`;
  if (run.live && run.status === "running") $("dot").classList.add("ok");
  $("ledger").href = `/api/runs/${run.id}/ledger`;
  if (!run.live) { $("export").href = `/api/runs/${run.id}/export`; $("export").hidden = false; }
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
  renderSecrets(v);
}

function renderMap(v) {
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
    const mark = (on) => document.querySelectorAll(".tile").forEach((t) => t.classList.toggle("lit", on && districts.includes(t.dataset.district)));
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

function renderSecrets(v) {
  if (v.run.live) { $("after").hidden = true; return; }
  $("after").hidden = false;
  const hidden = v.events.filter((e) => !e.public);
  const block = (title, items) => h("div", { class: "block" }, h("h3", {}, title), items.length ? h("ul", {}, items) : h("p", { class: "muted" }, "None."));
  $("secrets").replaceChildren(
    block("Secret moves", hidden.map((e) => h("li", {}, describe(e)))),
    block("Private messages", (v.messages || []).map((m) => h("li", {}, h("strong", {}, `${m.from} to ${m.to}: `), m.text))),
    block("Diaries", (v.diaries || []).filter((x) => x.text).map((x) => h("li", {}, h("strong", {}, `${x.player}: `), x.text))),
  );
}

load();
// Live runs: check for a new day every two minutes; follow it if the reader is on the latest day.
setInterval(async () => {
  if (!summary?.run.live || document.hidden) return;
  try {
    const next = await getJSON(`/api/runs/${id}`);
    const atEnd = day === summary.days.length;
    const grew = next.days.length > summary.days.length;
    if (!next.run.live) { location.reload(); return; } // finished: reload to open the secrets
    summary = next;
    $("status").textContent = `${STATUS[next.run.status] || next.run.status}, ${next.days.length} days played`;
    if (grew) {
      $("slider").max = next.days.length;
      if ($("main").hidden) { location.reload(); return; }
      show(atEnd ? next.days.length : day);
    }
  } catch {}
}, 120000);
