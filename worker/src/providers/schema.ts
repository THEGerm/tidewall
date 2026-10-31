// Providers' structured output accepts only part of JSON Schema, and each a
// different part. relaxSchema returns a copy without the rules a provider
// rejects, written into the description instead so the model still reads
// them. The engine checks every answer against the full rules anyway
// (rules section 5). Found in the test runs of 31 Oct: Anthropic rejects
// numeric ranges and minItems above 1; OpenAI rejects uniqueItems.

export function relaxSchema(schema: unknown, drop: readonly string[], maxMinItems = Infinity): unknown {
  if (Array.isArray(schema)) return schema.map((x) => relaxSchema(x, drop, maxMinItems));
  if (typeof schema !== "object" || schema === null) return schema;
  const s = schema as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  const notes: string[] = [];
  for (const [k, v] of Object.entries(s)) {
    if (drop.includes(k) || (k === "minItems" && typeof v === "number" && v > maxMinItems)) {
      if (k !== "uniqueItems" || v) notes.push(k === "uniqueItems" ? "no repeats" : `${k} ${v}`);
    } else if (k === "properties" && typeof v === "object" && v) {
      out[k] = Object.fromEntries(Object.entries(v).map(([n, p]) => [n, relaxSchema(p, drop, maxMinItems)]));
    } else out[k] = typeof v === "object" ? relaxSchema(v, drop, maxMinItems) : v;
  }
  if (notes.length) out.description = [s.description, notes.join(", ")].filter(Boolean).join("; ");
  return out;
}
