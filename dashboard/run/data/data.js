// A run's data page: every played day in one table, with downloads. Built
// from the public API, so a live run shows only what is public; a finished
// run adds inspections, audits, bribes and fallbacks.

const $ = (id) => document.getElementById(id);
const id = new URLSearchParams(location.search).get("id") || "";
const PROVIDER = { anthropic: "Anthropic", google: "Google", openai: "OpenAI", openrouter: "OpenRouter" };

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

function link(href, text, download) {
  const a = document.createElement("a");
  a.className = "button ghost";
  a.href = href;
  a.textContent = text;
  if (download) a.download = download;
  return a;
}

async function load() {
  if (!/^[a-z0-9-]{1,40}$/.test(id)) { $("note").textContent = "No run given. Open a run from the home page."; return; }
  $("back").href = $("back2").href = `/run/?id=${encodeURIComponent(id)}`;
  $("back").textContent = id;
  let summary, ledger;
  try {
    [summary, ledger] = await Promise.all([get(`/api/runs/${id}`), get(`/api/runs/${id}/ledger`)]);
  } catch (e) { $("note").textContent = `Couldn't load ${id}: ${e.message}`; return; }
  const { run, days } = summary;
  const finished = !run.live;
  $("title").textContent = `Data: ${run.id}`;
  $("note").textContent = finished
    ? `${days.length} days, finished. Everything is open, secrets included.`
    : `${days.length} days so far, ${run.status}. While a run is live this page shows only what is public; secret moves open when it ends.`;

  // A finished run: one request, the export, cut into days. A live run: one
  // request per day, so a long live run (a 10,000-day bot run) skips the
  // counts until it ends.
  let views;
  if (finished) {
    const ex = await get(`/api/runs/${id}/export`);
    const by = (rows) => { const m = new Map(); for (const r of rows || []) m.set(r.day, [...(m.get(r.day) || []), r]); return m; };
    const ev = by(ex.events), an = by(ex.answers);
    views = days.map((d) => ({ events: ev.get(d.day) || [], moves: ex.days[d.day - 1]?.moves || {}, answers: an.get(d.day) || [] }));
  } else if (days.length <= 400) {
    views = await Promise.all(days.map((d) => get(`/api/runs/${id}/days/${d.day}`).catch(() => null)));
  } else views = days.map(() => null);
  const costByDay = {};
  for (const r of ledger.ledger) costByDay[r.day] = (costByDay[r.day] || 0) + (r.cost_usd || 0);

  const head = ["Day", "Nature", "Families turf", "Saltdogs turf", "Crimes", "Arrests", "Council", "Chief", "Families", "Saltdogs", "Treasury", "Prison", "Cost ($)"];
  if (finished) head.push("Inspections", "Audits", "Bribes offered", "Bribes taken", "Fallbacks");
  const rows = days.map((d, i) => {
    const v = views[i];
    const count = (k) => (v ? v.events.filter((e) => e.kind === k).length : "");
    const n = d.nature || {};
    const nature = [n.storm && "storm", n.fire && `fire (${n.fire})`, n.strike && "strike", n.ship && "ship"].filter(Boolean).join(", ") || "calm";
    const row = [d.day, nature, d.turf?.Families ?? "", d.turf?.Saltdogs ?? "", count("crime"), count("arrest") + (v ? count("fine_no_place") : 0),
      d.scores.Council, d.scores.Chief, d.scores.Families, d.scores.Saltdogs, d.treasury, d.prison, (costByDay[d.day] || 0).toFixed(3)];
    if (finished) {
      const m = v?.moves || {};
      const offers = Object.values(m.offers || {}).reduce((a, o) => a + Object.keys(o).length, 0);
      row.push((m.inspect || []).length, (m.audit || []).length, offers, (m.accepted || []).length, (v?.answers || []).filter((a) => a.source === "fallback").length);
    }
    return row;
  });
  table($("days"), head, rows);
  $("days-note").textContent = "Scores are running totals. Crimes are the ones nobody caught; arrests include fines with no prison place.";

  const byProvider = {};
  for (const r of ledger.ledger) {
    const t = (byProvider[r.provider] ??= { calls: 0, input: 0, cached: 0, output: 0, cost: 0 });
    t.calls += r.calls; t.input += r.input || 0; t.cached += r.cached_input || 0; t.output += r.output || 0; t.cost += r.cost_usd || 0;
  }
  const total = Object.values(byProvider).reduce((a, t) => a + t.cost, 0);
  table($("models"), ["Provider", "Calls", "Input tokens", "Cached", "Output tokens", "Cost ($)", "Per day ($)"],
    [...Object.entries(byProvider).map(([p, t]) => [PROVIDER[p] || p, t.calls, t.input, t.cached, t.output, t.cost.toFixed(3), days.length ? (t.cost / days.length).toFixed(3) : ""]),
      ["All", "", "", "", "", total.toFixed(3), days.length ? (total / days.length).toFixed(3) : ""]]);

  const csv = [head, ...rows].map((r) => r.map((c) => (/[",\n]/.test(String(c)) ? `"${String(c).replace(/"/g, '""')}"` : c)).join(",")).join("\n");
  const dl = $("downloads");
  dl.append(link(URL.createObjectURL(new Blob([csv], { type: "text/csv" })), "Days (CSV)", `${id}-days.csv`));
  dl.append(link(`/api/runs/${id}/ledger`, "Ledger (JSON)"));
  if (finished) dl.append(link(`/api/runs/${id}/export`, "Whole run (JSON)", `${id}.json`));
  $("main").hidden = false;
}

load();
