# Curia Landing

Marketing landing page for [Curia](https://agenticengineering.online), an intelligence platform for Mexican legal practices. The repository contains a componentized React SPA and the Cloudflare Worker that receives contact requests.

## Ownership map

- [`src/`](src/) owns the SPA. Page-level content is split into sections, while shared presentation and behavior belong in the component layer.
- [`worker/index.ts`](worker/index.ts) owns the `POST /api/contact` boundary, request validation, and the handoff to Twenty CRM.
- [`docs/landing-copy.md`](docs/landing-copy.md) is the source of truth for approved public copy and product-claim boundaries.
- [`worker/index.test.ts`](worker/index.test.ts) covers the contact Worker without making live CRM calls.
- [`wrangler.jsonc`](wrangler.jsonc) owns the Worker, Static Assets routing, public variables, and deployment configuration. Vite and Vitest configuration remain with their respective root config files.

## Local development

Use Node.js 24.14.1 or newer and pnpm 10:

```bash
pnpm install
pnpm dev
```

The Vite server serves the SPA only. To exercise the contact flow through the Worker, copy `.dev.vars.example` to `.dev.vars`, provide the local credentials, and run:

```bash
pnpm cf:dev
```

Never commit `.dev.vars`. Production credentials are managed as Wrangler secrets.

### Twenty CRM setup

Before using the contact form, create these custom fields on the Twenty `Person` model. Twenty silently drops unknown keys, so a successful request is not proof that the custom values were stored.

| API field | Twenty type |
|---|---|
| `companyName` | Text |
| `message` | Text — Multiline |
| `projectType` | Text |
| `budget` | Text |
| `howDidYouHear` | Text |
| `sourceUrl` | Text |

The Worker owns the complete request-to-Person mapping in [`worker/index.ts`](worker/index.ts).

## Verification and deployment

Run the checks that cover both application surfaces:

```bash
pnpm typecheck
pnpm test
pnpm build
```

`pnpm cf:deploy` builds and publishes the Worker with its static assets. Review [`wrangler.jsonc`](wrangler.jsonc) before changing routing or deployment behavior.

## Links

- [Live site](https://agenticengineering.online)
- [Agentic Engineering](https://agenticengineering.agency)
