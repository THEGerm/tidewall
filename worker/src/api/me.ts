// /api/me routes: who is signed in, and their provider keys.

import type { Env } from "../index";
import { accessEmail } from "../access";
import { deleteKey, isProvider, keyStatus, readKey, saveKey } from "../keys/store";
import { checkKey } from "../providers/check";
import { handleControl } from "./control";
import { fullLedger } from "../ledger/ledger";

const json = (body: unknown, status = 200) => Response.json(body, { status });

export async function handleMe(request: Request, env: Env, url: URL): Promise<Response> {
  const email = await accessEmail(request, env.ACCESS_TEAM_DOMAIN, env.ACCESS_AUD);
  if (!email) return json({ ok: false, error: "not signed in" }, 401);

  const participant = await env.DB.prepare("SELECT name, turn_order FROM participants WHERE email = ?")
    .bind(email)
    .first<{ name: string; turn_order: number }>();
  if (!participant) return json({ ok: false, error: "not a participant" }, 403);

  // Writes must come from this site's own pages.
  if (request.method !== "GET") {
    const origin = request.headers.get("Origin");
    if (origin !== url.origin) return json({ ok: false, error: "bad origin" }, 403);
  }

  if (url.pathname === "/api/me" || url.pathname === "/api/me/") {
    return json({ ok: true, email, ...participant, keys: await keyStatus(env.DB, email) });
  }

  if (url.pathname === "/api/me/ledger" && request.method === "GET") {
    const cap = await env.DB.prepare("SELECT value FROM meta WHERE key = 'cap_usd'").first<{ value: string }>();
    return json({ ok: true, cap_usd: Number(cap?.value ?? 0), ...(await fullLedger(env.DB)) });
  }

  if (url.pathname.startsWith("/api/me/control/")) {
    return handleControl(request, env, url.pathname.slice("/api/me/control/".length), participant.name);
  }

  const test = url.pathname.match(/^\/api\/me\/keys\/([a-z]+)\/test$/);
  if (test && isProvider(test[1])) {
    if (request.method !== "POST") return json({ ok: false, error: "method not allowed" }, 405);
    const key = await readKey(env.DB, env.KEY_ENC_SECRET, email, test[1]);
    if (!key) return json({ ok: false, error: "no key saved" }, 404);
    return json({ ok: true, check: await checkKey(test[1], key) });
  }

  const match = url.pathname.match(/^\/api\/me\/keys\/([a-z]+)$/);
  if (match && isProvider(match[1])) {
    const provider = match[1];
    if (request.method === "PUT") {
      const body = (await request.json().catch(() => null)) as { key?: unknown } | null;
      const key = typeof body?.key === "string" ? body.key.trim() : "";
      if (key.length < 20 || key.length > 400 || /\s/.test(key)) {
        return json({ ok: false, error: "that doesn't look like an API key" }, 400);
      }
      await saveKey(env.DB, env.KEY_ENC_SECRET, email, provider, key);
      return json({ ok: true, keys: await keyStatus(env.DB, email) });
    }
    if (request.method === "DELETE") {
      await deleteKey(env.DB, email, provider);
      return json({ ok: true, keys: await keyStatus(env.DB, email) });
    }
    return json({ ok: false, error: "method not allowed" }, 405);
  }

  return json({ ok: false, error: "not found" }, 404);
}
