// Control (docs/dashboard.md, page 5, step D4): schedule, cap, runs and their
// actions, new runs, and the model IDs in use. Talks to /api/me/control/*.

const FAMILY = { claude: "Claude", gemini: "Gemini", gpt: "GPT" };
const SEATINGS = {
  1: { Government: "claude", Criminals: "gemini", World: "gpt" },
  2: { Government: "gemini", Criminals: "gpt", World: "claude" },
  3: { Government: "gpt", Criminals: "claude", World: "gemini" },
};
const STATUS = { ready: "Ready", running: "Running", paused: "Paused", over: "Finished", truncated: "Finished (cap)", sealed: "Finished, sealed until its triple ends" };

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
  $("sched-note").textContent = on
    ? `A day every ${state.pace_minutes} minutes${state.next_due ? `; the next is due about ${clock(state.next_due)}` : ""}. You can close this page.`
    : `When on, the first live run plays a day every ${state.pace_minutes} minutes. You can close this page.`;
  for (const b of document.querySelectorAll("[data-pace]")) {
    const pace = Number(b.dataset.pace);
    b.setAttribute("aria-pressed", String(pace === state.pace_minutes));
    b.onclick = async () => {
      if (pace === state.pace_minutes) return;
      try {
        Object.assign(state, await api("schedule", { method: "POST", body: JSON.stringify({ pace_minutes: pace }) }));
        state = await api("status");
        render();
      } catch (e) { $("run-msg").textContent = e.message; }
    };
  }
  $("spend").textContent = `$${state.spend.usd.toFixed(2)} of $${state.cap_usd}`;
  renderLog();
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
  const status = cell(r.playing ? `Playing day ${r.day}` : r.step_queued ? `Day ${r.day} queued` : STATUS[r.status] || r.status);
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
  const led = document.createElement("a");
  led.className = "button ghost small";
  led.href = `/me/ledger/?run=${encodeURIComponent(r.id)}`;
  led.textContent = "Ledger";
  actions.append(led);
  if (!done) actions.append(button("End", async (ev) => {
    if (!confirm(`End ${r.id} for good? It moves to the archive and cannot be resumed.`)) return;
    ev.currentTarget.disabled = true;
    try {
      const out = await api(`runs/${r.id}/end`, { method: "POST" });
      $("run-msg").textContent = out.message;
      state = await api("status");
      render();
    } catch (e) { $("run-msg").textContent = `End ${r.id}: ${e.message}`; ev.currentTarget.disabled = false; }
  }));
  tr.append(first, cell(r.model_set === "test" ? "Test" : r.model_set === "bot" ? "Bots" : "Study"), cell(["Government", "Criminals", "World"].map((s) => FAMILY[seating[s]]).join(", ")), status, cell(done ? "" : r.day), actionsCell);
  // Labels for the stacked layout on phones (style.css, table.stack).
  ["Run", "Models", "Seats", "Status", "Next day", ""].forEach((label, i) => tr.children[i].setAttribute("data-label", label));
  return tr;
}

function explain(label, id, out) {
  if (out.message) return out.message;
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

// A random 16-character seed for test runs (study runs use the published seeds).
const randomSeed = () => Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => b.toString(16).padStart(2, "0")).join("");

$("new-form").onsubmit = async (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const body = {
    id: String(f.get("id")).trim().toLowerCase(), // IDs are lowercase letters, numbers and hyphens
    seed: String(f.get("seed") || "").trim() || randomSeed(),
    triple: Number(f.get("triple") || 0),
    rotation: Number(f.get("rotation")),
    seating: SEATINGS[f.get("rotation")],
    // Bots: the equilibrium bots, free and at their own speed. "10,000 days"
    // switches the end draw off and plays exactly that many (Germ, 31 Oct).
    // "gangs encroaching" plays the turf war's one-shot equilibrium instead
    // of respect. Every bot run's Council audits at the 10% line.
    model_set: ["bot10k", "bot-encroach"].includes(f.get("model_set")) ? "bot" : f.get("model_set"),
    ...(f.get("model_set") === "bot10k" ? { fixed_days: 10000 } : {}),
    ...(f.get("model_set") === "bot-encroach" ? { bot_turf: "encroach" } : {}),
  };
  try {
    await api("runs", { method: "POST", body: JSON.stringify(body) });
    $("new-msg").textContent = body.model_set === "bot"
      ? `Created ${body.id} (seed ${body.seed}). The bots start at the next minute and play on their own, schedule or not${body.fixed_days ? ": 10,000 days takes about an hour" : ""}.`
      : `Created ${body.id} (seed ${body.seed}). It's ready: press Step to play day 1, or Resume and turn the schedule on.`;
    e.target.reset();
    state = await api("status");
    render();
  } catch (err) { $("new-msg").textContent = err.message; }
};

// The 27 study runs (#38). The server refuses without the typed phrase and if
// any study run exists, so this can only happen once.
$("study-btn").onclick = async () => {
  const phrase = "create the 27 study runs";
  const typed = prompt(`This creates the 27 study runs from the published seeds. With the schedule on, the study starts.\n\nType "${phrase}" to go ahead.`);
  if (typed === null) return;
  try {
    const out = await api("study", { method: "POST", body: JSON.stringify({ confirm: typed.trim().toLowerCase() }) });
    $("study-msg").textContent = `Created ${out.runs.length} study runs, ${out.runs[0].id} to ${out.runs.at(-1).id}. Turn the schedule on to start.`;
    state = await api("status");
    render();
  } catch (err) { $("study-msg").textContent = err.message; }
};

// "20:31" in the reader's own time zone.
const clock = (iso) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// What the scheduler is doing right now, worked out from the status (not stored).
function nowLine() {
  const playing = state.runs.find((r) => r.playing);
  const queued = state.runs.find((r) => r.step_queued);
  const live = state.runs.find((r) => r.status === "running");
  if (playing) return `Now: playing day ${playing.day} of ${playing.id}.`;
  if (queued) return `Now: day ${queued.day} of ${queued.id} queued, starting within a minute.`;
  if (state.schedule !== "on") return "Now: schedule off. Step queues one day.";
  if (!live && !state.runs.some((r) => r.status === "ready")) return "Now: schedule on, but no run is ready or running.";
  const due = state.next_due && Date.parse(state.next_due) > Date.now() ? `about ${clock(state.next_due)}` : "within a minute";
  return `Now: waiting. Next day of ${live ? live.id : "the next ready run"} due ${due}.`;
}

function renderLog() {
  const box = $("log");
  const now = Object.assign(document.createElement("li"), { textContent: nowLine(), className: "now" });
  box.replaceChildren(now, ...(state.log.length ? state.log.map((l) => {
    const li = document.createElement("li");
    li.className = l.level;
    const t = document.createElement("time");
    t.dateTime = l.at;
    t.textContent = clock(l.at);
    li.append(t, " ", l.text);
    return li;
  }) : [Object.assign(document.createElement("li"), { textContent: "Nothing logged yet.", className: "info" })]));
}

load();
// Keep the page current: runs, spending and the log every 15 seconds while it's open.
setInterval(async () => {
  if (!state || document.hidden || document.activeElement?.tagName === "INPUT") return;
  try { state = await api("status"); render(); } catch {}
}, 15000);
