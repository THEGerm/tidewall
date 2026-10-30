// A D1-shaped database over Node's built-in SQLite, for tests only. Covers
// what store.ts uses: prepare/bind/run/all/first and batch (as a transaction).
// Migrations are applied from worker/migrations in order.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

class Stmt {
  constructor(private db: any, private sql: string, private args: unknown[] = []) {}
  bind(...args: unknown[]) {
    return new Stmt(this.db, this.sql, args);
  }
  private st() {
    return this.db.prepare(this.sql);
  }
  async run() {
    const r = this.st().run(...this.args);
    return { success: true, meta: { changes: r.changes } };
  }
  async all<T>() {
    return { results: this.st().all(...this.args) as T[], success: true };
  }
  async first<T>() {
    return (this.st().get(...this.args) ?? null) as T | null;
  }
  runSync() {
    this.st().run(...this.args);
  }
}

export function testD1(): D1Database {
  const db = new DatabaseSync(":memory:");
  const dir = join(fileURLToPath(new URL(".", import.meta.url)), "../../migrations");
  for (const f of readdirSync(dir).filter((f: string) => f.endsWith(".sql")).sort()) db.exec(readFileSync(join(dir, f), "utf8"));
  const d1 = {
    prepare: (sql: string) => new Stmt(db, sql),
    batch: async (stmts: Stmt[]) => {
      db.exec("BEGIN");
      try {
        for (const s of stmts) s.runSync();
        db.exec("COMMIT");
      } catch (e) {
        db.exec("ROLLBACK");
        throw e;
      }
      return [];
    },
  };
  return d1 as unknown as D1Database;
}
