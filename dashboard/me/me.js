// My keys: shows key status and saves or deletes keys through /api/me.
const PROVIDERS = [
  { id: "anthropic", name: "Anthropic (Claude)", console: "https://console.anthropic.com/settings/keys" },
  { id: "google", name: "Google (Gemini)", console: "https://aistudio.google.com/apikey" },
  { id: "openai", name: "OpenAI (GPT)", console: "https://platform.openai.com/api-keys" },
  { id: "openrouter", name: "OpenRouter (judges)", console: "https://openrouter.ai/settings/keys" },
];

const $ = (id) => document.getElementById(id);

// "a", "a and b", "a, b and c"
const list = (xs) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`);

// What Test found about each pinned model, in plain words. An older server
// sends no models; then there is nothing to add.
function modelWords(models) {
  if (!Array.isArray(models)) return "";
  if (models.length === 0) return "No pinned models for this provider yet.";
  const why = (m) => `${m.model} (${m.status ? `${m.status}: ` : ""}${m.reason})`;
  const ok = models.filter((m) => m.result === "usable").map((m) => m.model);
  const no = models.filter((m) => m.result === "not_usable").map(why);
  const unsure = models.filter((m) => m.result === "unknown").map(why);
  const out = [];
  if (ok.length) out.push(`Works with ${list(ok)}.`);
  if (no.length) out.push(`Can't use ${list(no)}.`);
  if (unsure.length) out.push(`Couldn't check ${list(unsure)}.`);
  return out.join(" ");
}
const say = (text) => { $("msg").textContent = text; };

async function api(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
  });
  const body = await res.json().catch(() => ({ ok: false, error: "no answer" }));
  if (!res.ok || !body.ok) throw new Error(body.error || `error ${res.status}`);
  return body;
}

function render(keys) {
  const box = $("keys");
  box.replaceChildren();
  for (const p of PROVIDERS) {
    const k = keys[p.id];
    const row = document.createElement("article");
    const status = k.saved
      ? `Saved, ends in ...${k.last4} (${new Date(k.updated_at).toLocaleDateString()})`
      : "No key saved";
    row.innerHTML = `
      <h3>${p.name}</h3>
      <p class="muted">${status} · <a href="${p.console}" target="_blank" rel="noopener">get a key</a></p>
      <form>
        <input type="password" autocomplete="off" spellcheck="false" placeholder="${k.saved ? "Paste a new key to replace it" : "Paste your key"}" aria-label="${p.name} key">
        <button type="submit">Save</button>
        ${k.saved ? '<button type="button" class="ghost test">Test</button><button type="button" class="ghost del">Delete</button>' : ""}
      </form>
      <p class="muted check" hidden></p>`;
    const form = row.querySelector("form");
    const input = row.querySelector("input");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const key = input.value.trim();
      if (!key) return;
      say("Saving...");
      try {
        const body = await api(`/api/me/keys/${p.id}`, { method: "PUT", body: JSON.stringify({ key }) });
        input.value = "";
        render(body.keys);
        say(`${p.name} key saved.`);
      } catch (err) { say(`Not saved: ${err.message}.`); }
    });
    const test = row.querySelector("button.test");
    if (test) test.addEventListener("click", async () => {
      say(`Testing your ${p.name} key...`);
      try {
        const { check, models } = await api(`/api/me/keys/${p.id}/test`, { method: "POST" });
        say(check.ok ? `${p.name}: works (${check.detail}).` : `${p.name}: failed (${check.detail}).`);
        const out = row.querySelector("p.check");
        out.textContent = check.ok ? modelWords(models) : "";
        out.hidden = !out.textContent;
      } catch (err) { say(`Test didn't run: ${err.message}.`); }
    });
    const del = row.querySelector("button.del");
    if (del) del.addEventListener("click", async () => {
      if (!confirm(`Delete your ${p.name} key?`)) return;
      try {
        const body = await api(`/api/me/keys/${p.id}`, { method: "DELETE" });
        render(body.keys);
        say(`${p.name} key deleted.`);
      } catch (err) { say(`Not deleted: ${err.message}.`); }
    });
    box.append(row);
  }
  box.hidden = false;
}

api("/api/me")
  .then((me) => {
    $("who").textContent = `Signed in as ${me.name} (${me.email}). Turn order: ${me.turn_order}.`;
    render(me.keys);
  })
  .catch((err) => {
    $("who").textContent = err.message === "not a participant"
      ? "You're signed in, but this email isn't on the participant list."
      : `Couldn't load your keys: ${err.message}.`;
  });
