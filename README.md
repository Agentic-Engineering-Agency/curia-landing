# Curia Landing

Marketing landing page for [Curia](https://agenticengineering.online), an intelligence platform for Mexican legal practices. The repository is a TanStack Start application deployed to Cloudflare Workers; its server route receives contact requests and hands them to Twenty CRM.

## Ownership map

- [`src/routes/`](src/routes/) owns TanStack Start routing, the document shell, metadata, the landing route, and `POST /api/contact`.
- [`src/App.tsx`](src/App.tsx) composes the landing. Page-level content is split into sections, while shared presentation and behavior belong in the component layer.
- [`src/server/contact.ts`](src/server/contact.ts) owns contact validation and the Twenty CRM handoff; its adjacent test never calls a live CRM.
- [`docs/landing-copy.md`](docs/landing-copy.md) is the source of truth for approved public copy and product-claim boundaries.
- [`docs/klgv-meeting-brief.md`](docs/klgv-meeting-brief.md) contains the public KLGV meeting agenda, demo script, questions, objection handling, commercials, and follow-up actions.
- [`wrangler.jsonc`](wrangler.jsonc) owns Cloudflare bindings, public variables, routes, and deployment configuration.

## Local development

Use Node.js 24.14.1 or newer and pnpm 10:

```bash
pnpm install
pnpm dev
```

`pnpm dev` runs TanStack Start inside the Cloudflare Workers runtime through the official Cloudflare Vite plugin, so the landing and `/api/contact` share one local surface. To exercise the real CRM handoff, copy `.dev.vars.example` to `.dev.vars` and provide local credentials.

Never commit `.dev.vars`. Production credentials are managed as Wrangler secrets.

### Twenty CRM setup

Before using the contact form, create these custom fields on the Twenty `Person` model. Twenty silently drops unknown keys, so a successful request is not proof that the custom values were stored.

| API field       | Twenty type      |
| --------------- | ---------------- |
| `companyName`   | Text             |
| `message`       | Text — Multiline |
| `projectType`   | Text             |
| `budget`        | Text             |
| `howDidYouHear` | Text             |
| `sourceUrl`     | Text             |

The complete request-to-Person mapping lives in [`src/server/contact.ts`](src/server/contact.ts); the HTTP boundary is [`src/routes/api/contact.ts`](src/routes/api/contact.ts).

### Scrub media delivery

The cinematic scrub videos are served through `GET /media-range/$filename` from the R2 bucket `curia-landing-media` (`MEDIA` binding). Fast connections still receive a complete Blob for local random/reverse seeks; 2G/3G and Data Saver use bounded 512 KiB `206 Partial Content` reads. The copies in [`public/media`](public/media) remain the static fallback if an R2 object is missing.

When replacing a scrub binary:

1. Upload the same filename under `scrub/` in `curia-landing-media` with its correct `Content-Type` and immutable cache metadata.
2. Keep the static fallback in `public/media` synchronized.
3. Bump `VERSION_MEDIOS` in [`src/components/media.ts`](src/components/media.ts).
4. Run the release verification below before deploying the version that references it.

## Verification and deployment

Run the checks that cover both application surfaces:

```bash
pnpm typecheck
pnpm test
pnpm build
```

`pnpm cf:deploy` builds and publishes the TanStack Start Worker with its static assets. Review [`wrangler.jsonc`](wrangler.jsonc) before changing bindings, routes, or deployment behavior.

## Links

- [Live site](https://agenticengineering.online)
- [Agentic Engineering](https://agenticengineering.agency)
