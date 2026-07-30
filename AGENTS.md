# Curia Landing Agent Rules

Marketing SPA and contact-form Worker for Curia's Mexican legal-services audience.

Workspace standards apply when this repository is checked out inside the Agentic Engineering multi-repo workspace, where they live at `docs/standards/README.md` in the workspace root (the directory containing this repository). That baseline is not vendored here, so in a standalone checkout treat the rules below as the complete set rather than looking for a file that is absent. Where the two conflict, this file wins, and the conflict is recorded under `## Deviations`.

## Stack

- Language / runtime: strict TypeScript; Node 24.14.1+ for tooling and Cloudflare Workers for the contact API.
- Framework / platform: React 19, Vite 7, Tailwind CSS 4, Zod 4, and Workers Static Assets.
- Package manager: pnpm 10.

## Non-negotiables

- Never commit `.dev.vars`, Twenty credentials, lead data, or other secrets; keep new configurable values as safe placeholders and use Wrangler secrets for production.
- Keep logs free of names, email addresses, message bodies, and other lead PII.
- Preserve the split in `wrangler.jsonc`: `/api/*` runs through the Worker and other routes use the SPA asset fallback.
- Treat `worker/index.ts` and the contact payload/status behavior as one contract; run its tests when either changes.
- Keep CRM calls server-side. Do not expose `TWENTY_API_KEY` or `TWENTY_BASE_URL` to the Vite client.

## Commands

| Purpose | Command |
|---|---|
| Install | `pnpm install` |
| Frontend dev | `pnpm dev` |
| Worker dev | `pnpm cf:dev` |
| Test | `pnpm test` |
| Typecheck | `pnpm typecheck` |
| Build | `pnpm build` |
| Preview | `pnpm preview` |
| Deploy | `pnpm cf:deploy` |
| Tail Worker logs | `pnpm cf:tail` |
| List Worker secrets | `pnpm cf:secrets` |

## Verification gates

- Required for every change: `pnpm typecheck` and the smallest relevant runtime exercise.
- Contact Worker or API-contract changes additionally require `pnpm test`.
- Required for release: `pnpm test`, `pnpm typecheck`, and `pnpm build`.
- Visual changes require an unprimed screenshot critique; use comparison telemetry when a target exists.

## Read order

1. `README.md`
2. `docs/landing-copy.md` for approved page content
3. `worker/index.ts` and its adjacent test before changing the contact path
4. `wrangler.jsonc` before changing routing, bindings, or deployment

## Scope discipline

- Default to the smallest slice that proves the change.
- Capture scope expansion in a PRD, ADR, or spec instead of silently building it.
- Keep marketing-page work separate from Twenty administration and production CRM data changes.

## Deviations

- None.
