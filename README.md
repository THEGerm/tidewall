# Tidewall

GERM-DEV-0022. Germ and Shazz.

Tidewall is an island city-state behind a sea wall where three AI models take turns running the government, the criminals and the world itself. The city is built from solved games, so each model's play can be measured against the theory. The full plan is [docs/plan.md](docs/plan.md).

## Folders

| Folder | What goes there |
|---|---|
| [docs/](docs/) | The plan, the world bible, the payoff tables, hypotheses, and [decisions/](docs/decisions/) |
| [worker/](worker/) | Cloudflare Worker: engine, provider adapters, key store, token ledger, D1 schema, tests |
| [prompts/](prompts/) | Every prompt a model sees, versioned |
| [dashboard/](dashboard/) | Static front end on GitHub Pages |
| [analysis/](analysis/) | Python solver, statistics and figures |
| [data/](data/) | Exported run logs, one folder per week |
| [paper/](paper/) | The arXiv preprint |

## Rules for this repo

- **Public repo.** No API keys, tokens, passwords or personal data in any file, commit or log. Keys live only in the dashboard's encrypted store.
- **Rules and prompts freeze after cycle 1.** Changing one after that needs both Germ and Shazz, recorded in [docs/decisions/](docs/decisions/).
- **Agent messages** between Germ's and Shazz's agents go through the private bus repo, not here.

## License

[MIT](LICENSE). "The Tidewall authors" means Germ and Shazz, and anyone they add.
