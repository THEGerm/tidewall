// The ledger page (docs/dashboard.md, page 4, step D3). Reads /api/me/ledger:
// every model call summed by run, day, provider, model and payer name.

const $ = (id) => document.getElementById(id);
const PROVIDER = { anthropic: "Anthropic", google: "Google", openai: "OpenAI" };
const usd = (x) => (x == null ? "unpriced" : `$${Number(x).toFixed(2)}`);
const mtok = (x) => (x == null ? "" : (Number(x) / 1e6).toFixed(2));
let data = null;

function table(el, head, rows) {
  const thead = document.createElement("thead");
  const tr = document.createElement("tr");
  for (const h of head) { const th = document.createElement("th"); th.textContent = h; tr.append(th); }
  thead.append(tr);
  const tbody = document.createElement("tbody");
  for (const r of rows) {
    const row = document.createElement("tr");
    for (const c of r) { const td = document.createElement("td"); td.textContent = c ?? ""; row.append(td); }
    tbody.append(row);
  }
  if (!rows.length) {
    const row = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = head.length;
    td.textContent = "No calls yet.";
    row.append(td);
    tbody.append(row);
  }
  el.replaceChildren(thead, tbody);
}

const tokens = (r) => [mtok(r.input), mtok(r.cached_input), mtok(r.output)];
const calls = (r) => `${r.calls}${r.failed ? ` (${r.failed} failed)` : ""}`;

async function load() {
  const res = await fetch("/api/me/ledger", { credentials: "same-origin" });
  const body = await res.json().catch(() => ({ ok: false, error: `error ${res.status}` }));
  if (!res.ok || !body.ok) {
    $("who").textContent = body.error === "not signed in" || body.error === "not a participant"
      ? "Sign in as a participant to see the ledger."
      : `Couldn't load: ${body.error}`;
    return;
  }
  data = body;
  $("who").textContent = "Every model call, who paid for it, and what it cost.";
  $("main").hidden = false;

  const spent = data.study.usd;
  const share = data.cap_usd ? Math.min(1, spent / data.cap_usd) : 0;
  $("totals").replaceChildren(...[
    ["Spent", `${usd(spent)} of $${data.cap_usd}`],
    ["Calls", String(data.byRun.reduce((a, r) => a + Number(r.calls), 0))],
    ["Unpriced calls", String(data.study.unpriced)],
  ].map(([h, v]) => {
    const a = document.createElement("article");
    const t = document.createElement("h3"); t.textContent = h;
    const p = document.createElement("p"); p.className = "big"; p.textContent = v;
    a.append(t, p);
    return a;
  }));
  $("capbar").firstElementChild.style.width = `${(share * 100).toFixed(1)}%`;
  $("capbar").setAttribute("aria-label", `${Math.round(share * 100)}% of the spending cap used`);

  // Fallback payback (#117): open debts, repaid through the debtor's Anthropic key.
  const owed = data.balances || [];
  $("balance").textContent = owed.length
    ? `${owed.map((b) => `${b.debtor} owes ${b.creditor} ${usd(b.usd)}`).join(". ")}. Paid back through ${owed.length > 1 ? "their" : `${owed[0].debtor}'s`} Anthropic key on ${owed.length > 1 ? "the creditors'" : `${owed[0].creditor}'s`} days.`
    : "Fallbacks: settled.";

  const head = ["Calls", "Fallback", "Input (M)", "Cached (M)", "Output (M)", "Cost"];
  table($("payers"), ["Payer", "Provider", "Calls", "Fallback", "Payback", ...head.slice(2)],
    data.byPayer.map((r) => [r.payer_name ?? "nobody (no key)", PROVIDER[r.provider] || r.provider, calls(r), r.fallback_calls || "", r.payback_calls || "", ...tokens(r), usd(r.cost_usd)]));
  table($("runs"), ["Run", ...head],
    data.byRun.map((r) => [r.run_id, calls(r), r.fallback_calls || "", ...tokens(r), usd(r.cost_usd)]));

  const ids = data.byRun.map((r) => r.run_id);
  $("pick").replaceChildren(...ids.map((id) => { const o = document.createElement("option"); o.value = o.textContent = id; return o; }));
  const wanted = new URLSearchParams(location.search).get("run"); // from the Control page's Ledger button
  if (wanted && ids.includes(wanted)) $("pick").value = wanted;
  $("pick").onchange = renderDays;
  renderDays();
}

function renderDays() {
  const id = $("pick").value;
  table($("days"), ["Day", "Provider", "Model", "Payer", "Calls", "Fallback", "Input (M)", "Cached (M)", "Output (M)", "Cost"],
    data.rows.filter((r) => r.run_id === id).map((r) => [r.day, PROVIDER[r.provider] || r.provider, r.model, r.payer_name ?? "nobody", calls(r), r.fallback_calls || "", ...tokens(r), usd(r.cost_usd)]));
}

load();
