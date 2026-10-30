# Worker (back end)

The Cloudflare Worker: game engine, provider calls, encrypted key store, token ledger, and the cron that plays 8 game days a day. TypeScript.

| Folder | Holds |
|---|---|
| `src/engine/` | City state, rules, the 4 games, Nature's events, scoring |
| `src/providers/` | One adapter each for Anthropic, Google and OpenAI |
| `src/keys/` | Key encryption and the turn-order fallback |
| `src/ledger/` | Token and cost records per call, per day, per participant |
| `src/api/` | Routes the dashboard calls |
| `migrations/` | D1 database schema |
| `test/` | Unit tests; engine tests check the equilibria against `analysis/solver/` |

Secrets never go in this folder. Local secrets live in `.dev.vars`, which git ignores.
