// The Control page's log: one line per thing that happened, newest last.
// Idle ticks (schedule off, a day not due yet) write nothing.

export type Level = "info" | "warn" | "error";

export async function log(db: D1Database, text: string, o: { run?: string | null; level?: Level } = {}): Promise<void> {
  await db.prepare("INSERT INTO log (at, run_id, level, text) VALUES (?, ?, ?, ?)")
    .bind(new Date().toISOString(), o.run ?? null, o.level ?? "info", text).run();
}

export async function recentLog(db: D1Database, n = 15) {
  const { results } = await db.prepare("SELECT at, run_id, level, text FROM log ORDER BY id DESC LIMIT ?").bind(n).all<Record<string, string>>();
  return results.reverse();
}
