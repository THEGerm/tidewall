// Minimal types for the Node built-ins the test-only D1 adapter uses. The
// worker's own types (Cloudflare) don't include Node.
declare module "node:fs" {
  export function readdirSync(path: string): string[];
  export function readFileSync(path: string, encoding: "utf8"): string;
}
declare module "node:path" {
  export function join(...parts: string[]): string;
}
declare module "node:url" {
  export function fileURLToPath(url: string | URL): string;
}
declare module "node:sqlite" {
  export class DatabaseSync {
    constructor(path: string);
    exec(sql: string): void;
    prepare(sql: string): any;
  }
}
interface ImportMeta {
  url: string;
}
