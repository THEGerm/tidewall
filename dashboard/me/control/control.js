// Control (docs/dashboard.md, page 5, step D4): schedule, cap, runs and their
// actions, new runs, and the model IDs in use. Talks to /api/me/control/*.

const FAMILY = { claude: "Claude", gemini: "Gemini", gpt: "GPT" };
const SEATINGS = {
  1: { Government: "claude", Criminals: "gemini", World: "gpt" },
  2: { Government: "gemini", Criminals: "gpt", World: "claude" },
  3: { Government: "gpt", Criminals: "claude", World: "gemini" },
};
const STATUS = { ready: "Ready", running: "Running", paused: "Paused", over: "Finished", truncated: "Finished (cap)" };

const $ = (id) => document.getElementById(id);
let state = null;

async function api(path, options = {}) {
  const res = await fetch(`/api/me/control/${path}`, {
    ...options,
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
  });
  const body = await res.json().catch(() => ({ ok: false, error: "no answer" }));
  if (!res.ok || !body.ok) throw new Error(body.error || `error ${res.status}`);
  return body;
}

function button(label, onclick, ghost = true) {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = label;
  if (ghost) b.className = "ghost";
  b.onclick = onclick;
  return b;
}
const cell = (text) => { const td = document.createElement("td"); td.textContent = text; return td; };

async function load() {
  try {
    state = await api("status");
  } catch (e) {
    $("who").textContent = e.message === "not signed in" || e.message === "not a participant"
      ? "Sign in as a participant to use this page."
      : `Couldn't load: ${e.message}`;
    return;
  }
  $("who").textContent = "Start, pause and step runs, and watch the spending.";
  $("main").hidden = false;
  render();
}

function render() {
  const on = state.schedule === "on";
  $("sched").textContent = on ? "On" : "Off";
  $("sched-btn").textContent = on ? "Turn off" : "Turn on";
  $("sched-btn").onclick = async () => {
    try {
      Object.assign(state, await api("schedule", { method: "POST", body: JSON.stringify({ on: !on }) }));
      render();
    } catch (e) { $("run-msg").textContent = e.message; }
  };
  $("spend").textContent = `$${state.spend.usd.toFixed(2)} of $${state.cap_usd}`;
  $("unpriced").textContent = state.spend.unpriced ? `${state.spend.unpriced} calls have no price yet.` : "Every call so far is priced.";
  if (document.activeElement !== $("cap")) $("cap").value = state.cap_usd;

  $("runs").replaceChildren(
    ...(state.runs.length ? state.runs.map(runRow) : [(() => { const tr = document.createElement("tr"); const td = cell("No runs yet."); td.colSpan = 6; tr.append(td); return tr; })()]),
  );

  $("models").replaceChildren(
    ...Object.keys(FAMILY).map((f) => {
      const tr = document.createElement("tr");
      tr.append(cell(FAMILY[f]), cell(state.models.study[f].model), cell(state.models.test[f].model));
      return tr;
    }),
  );
  $("effort").textContent = `Reasoning effort for every model: ${state.effort}.`;
}

function runRow(r) {
  const tr = document.createElement("tr");
  const seating = typeof r.seating === "string" ? JSON.parse(r.seating) : r.seating;
  const link = document.createElement("a");
  link.href = `/run/?id=${encodeURIComponent(r.id)}`;
  link.textContent = r.id;
  const first = document.createElement("td");
  first.append(link);
  const status = cell(STATUS[r.status] || r.status);
  if (r.pause_reason) {
    const why = document.createElement("div");
    why.className = "muted small";
    why.textContent = r.pause_reason;
    status.append(why);
  }
  const actionsCell = document.createElement("td");
  const actions = document.createElement("div");
  actions.className = "actions";
  actionsCell.append(actions);
  const done = r.status === "over" || r.status === "truncated";
  const act = (label, path, method = "POST") => button(label, async (ev) => {
    const b = ev.currentTarget;
    b.disabled = true;
    $("run-msg").textContent = `${label}: ${r.id}...`;
    try {
      const out = await api(`runs/${r.id}/${path}`, { method });
      $("run-msg").textContent = explain(label, r.id, out);
      state = await api("status");
      render();
    } catch (e) {
      $("run-msg").textContent = `${label} ${r.id}: ${e.message}`;
      b.disabled = false;
    }
  });
  if (!done) {
    actions.append(act("Step", "step"));
    if (r.status === "paused" || r.status === "ready") actions.append(act("Resume", "resume"));
    if (r.status === "running") actions.append(act("Pause", "pause"));
    actions.append(act("Check", "check", "GET"));
  }
  actions.append(act("Ledger", "ledger", "GET"));
  tr.append(first, cell(r.model_set === "test" ? "Test" : "Study"), cell(["Government", "Criminals", "World"].map((s) => FAMILY[seating[s]]).join(", ")), status, cell(done ? "" : r.day), actionsCell);
  // Labels for the stacked layout on phones (style.css, table.stack).
  ["Run", "Models", "Seats", "Status", "Next day", ""].forEach((label, i) => tr.children[i].setAttribute("data-label", label));
  return tr;
}

function explain(label, id, out) {
  if (label === "Step") {
    const o = out.outcome;
    return o.played ? `${id}: day ${o.day} played, ${o.calls} model calls${o.over ? ". The run is over." : "."}` : `${id}: no day played. ${o.reason}`;
  }
  if (label === "Check") return out.blocker ? `${id} can't play: ${out.blocker}` : `${id}: ready to play the next day.`;
  if (label === "Ledger") {
    const rows = out.ledger;
    const cost = rows.reduce((a, x) => a + (x.cost_usd || 0), 0);
    const calls = rows.reduce((a, x) => a + x.calls, 0);
    return `${id}: ${calls} calls, $${cost.toFixed(2)}. Full rows: /api/runs/${id}/ledger`;
  }
  return `${label}: ${id} done.`;
}

$("cap-form").onsubmit = async (e) => {
  e.preventDefault();
  const cap = Number($("cap").value);
  if (!(cap >= 0)) return;
  try {
    Object.assign(state, await api("schedule", { method: "POST", body: JSON.stringify({ cap_usd: cap }) }));
    $("cap").blur();
    render();
  } catch (err) { $("run-msg").textContent = err.message; }
};

$("new-form").onsubmit = async (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const body = {
    id: String(f.get("id")).trim().toLowerCase(), // IDs are lowercase letters, numbers and hyphens
    seed: f.get("seed"),
    triple: Number(f.get("triple")),
    rotation: Number(f.get("rotation")),
    seating: SEATINGS[f.get("rotation")],
    model_set: f.get("model_set"),
  };
  try {
    await api("runs", { method: "POST", body: JSON.stringify(body) });
    $("new-msg").textContent = `Created ${body.id}. It's ready: press Step to play day 1, or Resume and turn the schedule on.`;
    e.target.reset();
    state = await api("status");
    render();
  } catch (err) { $("new-msg").textContent = err.message; }
};

load();
