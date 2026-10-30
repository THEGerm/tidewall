// Tidewall Worker. Static files in ../dashboard are served first; any path
// they don't match lands here. Only /api/* is handled so far.

export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
}

const STATUS = {
  project: "Tidewall",
  id: "GERM-DEV-0022",
  phase: "setup",
  step: "3 of 5: live",
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

    if (url.pathname.startsWith("/api/")) {
      return Response.json({ ok: false, error: "not found" }, { status: 404 });
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
