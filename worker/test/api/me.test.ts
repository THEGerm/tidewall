// /api/me key routes: OpenRouter is a provider like the others, and Test
// returns the per-model results next to the old check. Access is stubbed and
// fetch is canned; nothing leaves the test.

import { afterEach, describe, expect, it, vi } from "vitest";
import { handleMe } from "../../src/api/me";
import { testD1 } from "../engine/d1";
import { FAKE_KEY } from "../providers/helpers";

vi.mock("../../src/access", () => ({ accessEmail: async () => "s@x" }));

const SECRET = btoa(String.fromCharCode(...new Uint8Array(32).map((_, i) => i + 3)));
const ORIGIN = "https://tidewall.test";

async function setup() {
  const db = testD1();
  await db.prepare("INSERT INTO participants (email, name, turn_order) VALUES ('s@x', 'Shazz', 1)").run();
  const env = { DB: db, KEY_ENC_SECRET: SECRET, ACCESS_TEAM_DOMAIN: "t", ACCESS_AUD: "a" } as any;
  const call = async (path: string, method = "GET", body?: unknown) => {
    const url = new URL(ORIGIN + path);
    const req = new Request(url, { method, headers: { Origin: ORIGIN }, ...(body ? { body: JSON.stringify(body) } : {}) });
    const res = await handleMe(req, env, url);
    const text = await res.text();
    return { status: res.status, body: JSON.parse(text) as any, text };
  };
  return { db, call };
}

afterEach(() => vi.unstubAllGlobals());

describe("/api/me keys", () => {
  it("lists OpenRouter, and saves, tests and deletes an OpenRouter key", async () => {
    const { db, call } = await setup();
    expect((await call("/api/me")).body.keys).toMatchObject({ openrouter: { saved: false } });
    const saved = await call("/api/me/keys/openrouter", "PUT", { key: FAKE_KEY });
    expect(saved.status).toBe(200);
    expect(saved.body.keys.openrouter).toMatchObject({ saved: true, last4: FAKE_KEY.slice(-4) });
    const row = await db.prepare("SELECT ciphertext FROM provider_keys WHERE provider = 'openrouter'").first<{ ciphertext: string }>();
    expect(row!.ciphertext).not.toContain(FAKE_KEY);

    const seen: Request[] = [];
    vi.stubGlobal("fetch", async (req: Request) => {
      seen.push(req);
      return new Response(JSON.stringify({ data: {} }), { status: 200 });
    });
    const test = await call("/api/me/keys/openrouter/test", "POST");
    expect(test.body).toEqual({
      ok: true,
      check: { ok: true, status: 200, detail: "the provider accepted this key" },
      models: [],
      pinned: false,
    });
    expect(seen).toHaveLength(1);

    expect((await call("/api/me/keys/openrouter", "DELETE")).body.keys.openrouter).toEqual({ saved: false });
  });

  it("returns the old check plus each pinned model", async () => {
    const { call } = await setup();
    await call("/api/me/keys/anthropic", "PUT", { key: FAKE_KEY });
    const seen: Request[] = [];
    vi.stubGlobal("fetch", async (req: Request) => {
      seen.push(req);
      if (req.url.endsWith("/claude-haiku-5-5")) return new Response(`{"error":{"message":"${FAKE_KEY}"}}`, { status: 404 });
      return new Response('{"id":"x"}', { status: 200 });
    });
    const test = await call("/api/me/keys/anthropic/test", "POST");
    expect(test.status).toBe(200);
    expect(test.body.check).toEqual({ ok: true, status: 200, detail: "the provider accepted this key" });
    expect(test.body.pinned).toBe(true);
    expect(test.body.models).toEqual([
      { model: "claude-opus-5-5", result: "usable", status: 200, reason: "listed for this key" },
      { model: "claude-haiku-5-5", result: "not_usable", status: 404, reason: "not found for this key" },
    ]);
    expect(test.text).not.toContain(FAKE_KEY);
    for (const req of seen) expect(req.url).not.toContain(FAKE_KEY);
  });

  it("still refuses unknown providers", async () => {
    const { call } = await setup();
    expect((await call("/api/me/keys/mistral", "PUT", { key: FAKE_KEY })).status).toBe(404);
    expect((await call("/api/me/keys/mistral/test", "POST")).status).toBe(404);
  });
});
