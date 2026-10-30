# Dashboard (front end)

The static web app, served by the Worker in `worker/` at the same address as the API: live city, game theory panel, token ledger, run controls, My keys, and the public replay. It talks only to the Worker's API (`/api/...`) and never calls a model provider itself. `.assetsignore` keeps this README off the site.
