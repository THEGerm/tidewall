# How Tidewall keeps API keys safe

Written 30 Oct 2026, when the key store went live. Every claim below points to code in this repo, so anyone can check it.

## The short version

- A key is encrypted the moment it reaches the server and is stored only in encrypted form.
- Nobody can read a key back through the site: not the other participant, not Germ, not an agent. The page shows the last 4 characters and the date saved.
- Only the two participants can reach the keys page, and the server checks that twice.
- Nothing uses the keys yet. No model is called until the engine is built and both participants agree to start.

## Four providers

My keys holds one key per participant for each of four providers: Anthropic, Google and OpenAI for the players, and OpenRouter for the offline judges (DeepSeek, Qwen, GLM) that code transcripts after a run. All four get the same encryption, the same Test button and the same rotation by game day ([worker/src/players/keys.ts](../worker/src/players/keys.ts)). OpenRouter was added 1 Nov 2026 ([worker/migrations/0012_openrouter.sql](../worker/migrations/0012_openrouter.sql) widens the database's provider list and keeps every saved key as it was).

## Who can reach the keys page

1. **Cloudflare Access** guards `/me/` and `/api/me/`. A visitor types an email address and gets a one-time code by email. Only the two participants' addresses are on the list.
2. **The server checks again** ([worker/src/access.ts](../worker/src/access.ts)). Every request to `/api/me/` must carry Access's signed token. The server verifies the signature against Cloudflare's published keys, plus the issuer and the application ID. A missing or forged token gets a 401.
3. **Participant list** ([worker/src/api/me.ts](../worker/src/api/me.ts)). Even a valid token is refused unless its email is in the `participants` table. The emails live only in the database, never in this public repo.
4. **Writes must come from the site itself.** Saving or deleting a key is refused unless the request's origin is the Tidewall site.

## How a key is stored

- **Encryption:** AES-256-GCM with a fresh random 12-byte IV per key ([worker/src/keys/crypto.ts](../worker/src/keys/crypto.ts)).
- **The master key** is a Cloudflare Worker secret, `KEY_ENC_SECRET`. The deploy workflow made it once with `openssl rand -base64 32` and piped it straight into Cloudflare ([.github/workflows/deploy.yml](../.github/workflows/deploy.yml)). It was never printed, logged or committed, and no person has seen it.
- **What the database holds** ([worker/migrations/0002_keys.sql](../worker/migrations/0002_keys.sql)): the encrypted key, its IV, the last 4 characters and the date. A copy of the database alone is useless without the master key.
- **What the browser gets back** ([worker/src/keys/store.ts](../worker/src/keys/store.ts)): saved or not, last 4, date. No route returns a key.
- **Delete** removes the row at once.
- **Test** ([worker/src/providers/check.ts](../worker/src/providers/check.ts)) decrypts the key inside the Worker and asks the provider to list its models (for OpenRouter, to describe the key), which is free. It then asks the provider's free metadata endpoint about each model pinned for that provider in [worker/src/players/models.ts](../worker/src/players/models.ts) (study, test and judge sets): Anthropic `GET /v1/models/{id}`, OpenAI `GET /v1/models/{id}`, Google `GET /v1beta/models/{id}`, OpenRouter `GET /api/v1/models/{author}/{slug}/endpoints` (public, sent without the key). The key goes only in a header, never in a URL. The browser gets back "works" or "failed" with a fixed reason, and for each model "usable", "not usable" (with the status, e.g. 403: no access) or "unknown" (network, rate limit, server error); nothing the provider wrote is passed on.
- **What "usable" means.** The provider lists that model for that key. A metadata endpoint may not reflect every project-level restriction: an OpenAI project can block a model for generation while the model still shows up, and other providers may refuse only at call time. The definitive signal remains the ledger's `model_unavailable` errors on real calls.

## What this does not protect against

Being plain about the limits:

- **The Cloudflare account owner.** The Worker runs in Germ's Cloudflare account. Someone with deploy rights could, in principle, ship code that decrypts keys. Two things check that: every deploy comes from a commit in this public repo, so a change like that would sit in the history for anyone to see; and each participant can watch the repo.
- **The providers' own side.** A key used by the engine is sent to its provider (Anthropic, Google, OpenAI, OpenRouter) like any API call.
- **A stolen key.** If one ever leaks, the damage is capped by the spending limit set in the provider's console, and the key can be revoked there in seconds.

## What each participant should do

1. Make a **new key just for Tidewall** at each provider you'll use.
2. Set a **monthly spending limit** on it in the provider's console.
3. Save it on `/me/`. Delete it there, and revoke it at the provider, when the study ends.

Saving a key is optional. A participant with no key for a provider simply has that provider covered by the other participant's key, and the token ledger shows who paid for what.
