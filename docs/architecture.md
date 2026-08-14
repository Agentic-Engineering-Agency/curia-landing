# Repository boundaries

These ownership boundaries keep parallel agent work independent and make review scope explicit.

| Area | Owner | Contract / source of truth |
| --- | --- | --- |
| SPA composition and sections | `src/` | Components, section copy, and visual behavior |
| Approved public claims | `docs/landing-copy.md` | Do not invent legal/product claims in code |
| Contact API | `worker/index.ts` | [`contact-api.md`](contact-api.md) and Worker tests |
| CRM integration | Worker only | Credentials and Twenty calls stay server-side |
| Routes and deployment | `wrangler.jsonc` | `/api/*` reaches the Worker; other paths use SPA fallback |
| Verification | `.github/workflows/ci.yml` | `pnpm test`, `pnpm typecheck`, and `pnpm build` |

## Parallel-work rules

- Keep UI, Worker, and deployment changes in separate PRs when they do not require one another.
- Treat the Worker response shape as a public contract; update tests and [`contact-api.md`](contact-api.md) with contract changes.
- Do not use production CRM data for tests or screenshots.
- Do not commit `.dev.vars`, credentials, lead records, or log output containing lead data.
- Before opening a PR, report fresh verification output and call out visual or API-contract impact.
