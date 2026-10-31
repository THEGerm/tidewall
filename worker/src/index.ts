// Tidewall Worker. Static files in ../dashboard are served first; any path
// they don't match lands here. /me/* and /api/me/* sit behind Cloudflare Access.

import { handleMe } from "./api/me";
import { handlePublic } from "./api/public";
import { playBots, tick } from "./engine/runner";

export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  ACCESS_TEAM_DOMAIN: string;
  ACCESS_AUD: string;
  KEY_ENC_SECRET: string;
}

const STATUS = {
  project: "Tidewall",
  id: "GERM-DEV-0022",
  phase: "setup",
  step: "dashboard",
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      const row = await env.DB.prepare("SELECT value FROM meta WHERE key = 'schema'")
        .first<{ value: string }>()
        .catch(() => null);
      return Response.json({
        ok: true,
        ...STATUS,
        database: row ? `schema ${row.value}` : "unreachable",
        time: new Date().toISOString(),
      });
    }

    if (url.pathname === "/api/me" || url.pathname.startsWith("/api/me/")) {
      return handleMe(request, env, url);
    }

    if (url.pathname === "/api/runs" || url.pathname.startsWith("/api/runs/")) {
      return handlePublic(request, env, url);
    }

    if (url.pathname.startsWith("/api/")) {
      return Response.json({ ok: false, error: "not found" }, { status: 404 });
    }

    return env.ASSETS.fetch(request);
  },

  // Cron (wrangler.jsonc): one scheduler tick plays at most one game day.
  async scheduled(_event: ScheduledController, env: Env): Promise<void> {
    // Model runs and bot runs side by side: neither waits for the other.
    const [outcome, bots] = await Promise.all([tick(env), playBots(env)]);
    console.log("tick", JSON.stringify(outcome), "bots", JSON.stringify(bots));
  },
} satisfies ExportedHandler<Env>;
