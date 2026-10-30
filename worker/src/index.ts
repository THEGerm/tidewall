// Tidewall Worker. Static files in ../dashboard are served first; any path
// they don't match lands here. Only /api/* is handled so far.

export interface Env {
  ASSETS: Fetcher;
}

const STATUS = {
  project: "Tidewall",
  id: "GERM-DEV-0022",
  phase: "setup",
  step: "1 of 5: landing page",
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      return Response.json({ ok: true, ...STATUS, time: new Date().toISOString() });
    }

    if (url.pathname.startsWith("/api/")) {
      return Response.json({ ok: false, error: "not found" }, { status: 404 });
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
