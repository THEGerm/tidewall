# Study models and reasoning effort

Decided by Germ, 30 Oct 2026.

- **Rule:** each provider is represented by its main flagship, the tier that matches Claude Opus 5.5, not its top-end model.
- **Claude:** Opus 5.5 (`claude-opus-5-5`), $4 in, $0.20 cached, $5 cache write, $20 out per million tokens.
- **GPT:** GPT-6.1 Sol (`gpt-6.1-sol`), OpenAI's "near-Astra performance at a lower cost", $2 in, $0.10 cached, $2.50 cache write, $10 out. GPT-6 Astra ($10/$50) is the top tier and would match Claude Fable 5.1, not Opus. No dated snapshot is listed, so every call logs the model the provider reports.
- **Gemini:** to choose by the same rule.
- **Effort:** medium for every model and every call, so differences come from the models rather than from one of them reasoning longer.
