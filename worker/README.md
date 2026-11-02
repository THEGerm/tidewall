# Worker (back end)

The Cloudflare Worker: game engine, provider calls, encrypted key store, token ledger, and the cron that plays 8 game days a day. TypeScript.

| Folder | Holds |
|---|---|
| `src/engine/` | City state, rules, the 4 games, Nature's events, scoring |
| `src/providers/` | One adapter each for Anthropic, Google and OpenAI |
| `src/keys/` | Key encryption and the turn-order fallback, for four providers: Anthropic, Google, OpenAI, and OpenRouter (offline judges) |
| `src/ledger/` | Token and cost records per call, per day, per participant |
| `src/api/` | Routes the dashboard calls |
| `migrations/` | D1 database schema |
| `test/` | Unit tests; engine tests check the equilibria against `analysis/solver/` |

## Run it

```bash
cd worker
npm install
npm run dev      # local copy at http://localhost:8787
npm run check    # typecheck and a dry-run build
npm test         # unit tests (vitest); no network, no keys
```

`/api/health` answers with the project's status. Every other path that isn't a file in `dashboard/` returns the 404 page.

## Provider adapters

`src/providers/` holds one adapter per provider behind one call, `callModel(provider, key, request)`:

| Provider | API | Notes |
|---|---|---|
| Anthropic | Messages (`/v1/messages`) | Cache breakpoints on the system prompt and the newest message; effort and JSON schema in `output_config` |
| Google | Gemini `generateContent` | Key in a header, never the URL; thought parts dropped from the text, counted as output |
| OpenAI | Responses (`/v1/responses`) | `store: false`; optional `prompt_cache_key`; strict JSON schema |

Every call returns the same shape: the text, why it stopped (`done`, `max_tokens`, `refused`), the model version the provider reports, and token usage as the ledger records it (input including cached, cached, cache writes, output including reasoning, reasoning). A refusal is a result, not an error, so it lands in the log.

Failures throw a `ProviderError` with a `kind` (`bad_key`, `no_credit`, `rate_limited`, `model_unavailable`, `overloaded`, `server`, `bad_request`, `network`, `bad_response`) and two flags: `retryable` (same key, a bit later; `withRetry` does this) and `tryNextKey` (the next participant's key may work: bad key, no credit, rate limit, model not available to this key). Error text is scrubbed of anything key-shaped before it leaves the adapter.

OpenRouter keys (for the offline judges) are stored, tested and rotated like the others. Players never call OpenRouter (`callModel("openrouter", ...)` fails with `bad_request`); the judges call it through `src/providers/openrouter.ts`, each pinned to one upstream provider with no fallbacks, at temperature 0, and the ledger takes the cost OpenRouter reports.

## The judges

`src/judges/` codes finished runs for H5 and the exploratory codes (pre-registration, section 6; #112). `prompt.ts` holds the frozen prompt and schema (a test compares the prompt with the pre-registration), `items.ts` builds the items from a run's export, `runner.ts` runs one batch, `agree.ts` combines the three judges and computes Krippendorff's alpha, and `export.ts` adds the codes to the run's export. Control starts it: **Judge** on a finished run, or **Judge every finished study run**, once the whole study is over (Germ, 2 Nov; `docs/decisions/2026-11-02-judge-runner.md`); each request is one batch of up to 48 calls and the page asks again until done. A rerun skips coded items. Codes are in D1 (`judge_codes`, `judge_runs`), in the run's export under `judges`, at `/api/runs/:id/judges`, and in `data/judges/` once a run is fully judged. `python -m analysis.bayes.collect_tones data/judges/study-*.json` makes the `--tones` file.

`src/providers/check.ts` is the My keys **Test** button: a free key check, then one free metadata request per pinned model (`pinnedModels` in `src/players/models.ts`), each answered `usable`, `not_usable` or `unknown`. "Usable" means the provider lists the model for this key; project-level blocks can still show up only on a real call, as `model_unavailable` in the ledger.

No sampling settings (temperature and the like) are sent to the players' models: current models at Anthropic and OpenAI reject them. The judges get temperature 0. The tests in `test/providers/` answer with canned responses through an injected `fetch`; nothing calls a provider.

Secrets never go in this folder. Local secrets live in `.dev.vars`, which git ignores.
