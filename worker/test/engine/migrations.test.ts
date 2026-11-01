// Migration 0012 rebuilds provider_keys to allow 'openrouter'. Saved keys
// must come through untouched, and the CHECK must still refuse anything else.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { describe, expect, it } from "vitest";
import { saveKey, readKey } from "../../src/keys/store";
import { keyChain } from "../../src/players/keys";
import { testD1 } from "./d1";

const dir = join(fileURLToPath(new URL(".", import.meta.url)), "../../migrations");
const files = readdirSync(dir).filter((f: string) => f.endsWith(".sql")).sort();
const SECRET = btoa(String.fromCharCode(...new Uint8Array(32).map((_, i) => i + 11)));

describe("migration 0012 (openrouter)", () => {
  it("is the latest migration, numbered in order", () => {
    expect(files.at(-1)).toBe("0012_openrouter.sql");
    expect(files.map((f) => f.slice(0, 4))).toEqual(files.map((_, i) => String(i + 1).padStart(4, "0")));
  });

  it("keeps every saved key and widens the provider list", () => {
    const db = new DatabaseSync(":memory:");
    db.exec("PRAGMA foreign_keys = ON"); // as D1 runs it
    for (const f of files.filter((f) => f < "0012")) db.exec(readFileSync(join(dir, f), "utf8"));
    db.exec(`INSERT INTO participants (email, name, turn_order) VALUES ('g@x', 'Germ', 1), ('s@x', 'Shazz', 2);
             INSERT INTO provider_keys VALUES ('g@x', 'anthropic', 'c1', 'i1', 'aaaa', '2026-10-30T00:00:00Z'),
                                              ('s@x', 'openai', 'c2', 'i2', 'bbbb', '2026-10-31T00:00:00Z');`);
    expect(() => db.exec("INSERT INTO provider_keys VALUES ('g@x', 'openrouter', 'c', 'i', 'cccc', 't')")).toThrow(/CHECK/);
    const before = db.prepare("SELECT * FROM provider_keys ORDER BY email, provider").all();

    db.exec(readFileSync(join(dir, "0012_openrouter.sql"), "utf8"));

    expect(db.prepare("SELECT * FROM provider_keys ORDER BY email, provider").all()).toEqual(before);
    expect((db.prepare("SELECT value FROM meta WHERE key = 'schema'").get() as { value: string }).value).toBe("0012");
    db.exec("INSERT INTO provider_keys VALUES ('g@x', 'openrouter', 'c3', 'i3', 'cccc', '2026-11-01T00:00:00Z')");
    expect(() => db.exec("INSERT INTO provider_keys VALUES ('g@x', 'mistral', 'c', 'i', 'dddd', 't')")).toThrow(/CHECK/);
    expect(() => db.exec("INSERT INTO provider_keys VALUES ('g@x', 'openrouter', 'c', 'i', 'dddd', 't')")).toThrow(/UNIQUE|PRIMARY/);
    expect(() => db.exec("INSERT INTO provider_keys VALUES ('nobody@x', 'google', 'c', 'i', 'eeee', 't')")).toThrow(/FOREIGN KEY/);
    expect(db.prepare("SELECT name FROM sqlite_master WHERE name LIKE 'provider_keys%'").all()).toEqual([{ name: "provider_keys" }]);
  });

  it("lets the store save OpenRouter keys and rotates them by game day", async () => {
    const db = testD1();
    await db.prepare("INSERT INTO participants (email, name, turn_order) VALUES ('g@x', 'Germ', 1), ('s@x', 'Shazz', 2)").run();
    await saveKey(db, SECRET, "g@x", "openrouter", "test-openrouter-germ-0000000000");
    await saveKey(db, SECRET, "s@x", "openrouter", "test-openrouter-shazz-000000000");
    expect(await readKey(db, SECRET, "s@x", "openrouter")).toBe("test-openrouter-shazz-000000000");
    expect((await keyChain(db, SECRET, "openrouter", 1)).map((k) => [k.name, k.owner])).toEqual([["Germ", true], ["Shazz", false]]);
    expect((await keyChain(db, SECRET, "openrouter", 2)).map((k) => [k.name, k.owner])).toEqual([["Shazz", true], ["Germ", false]]);
  });
});
