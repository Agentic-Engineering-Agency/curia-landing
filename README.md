# Curia Landing

Marketing landing page for [Curia](https://agenticengineering.online) — inteligencia legal para despachos mexicanos. Built as a Cloudflare Worker that serves the SPA from Workers Static Assets and handles the contact form via a `/api/contact` route that forwards leads to a self-hosted Twenty CRM.

## Tech Stack

| Layer            | Tool                                       |
| ---------------- | ------------------------------------------ |
| Framework        | React 19 + TypeScript                      |
| Build            | Vite 7                                     |
| Styling          | Tailwind CSS 4                             |
| Icons            | lucide-react                               |
| Validation       | Zod 4                                      |
| Runtime          | Cloudflare Workers (Static Assets binding) |
| CRM              | Self-hosted Twenty (`twenty.agenticengineering.lat`) |
| Package manager  | pnpm 10                                    |
| Node             | 24.14.1+                                   |

## Project Structure

```
curia-landing/
├── src/                    # React SPA source
│   ├── App.tsx             # Single-page marketing site + contact form
│   ├── main.tsx            # React entry point
│   └── style.css           # Tailwind + design tokens
├── worker/
│   ├── index.ts            # Cloudflare Worker: handles POST /api/contact → Twenty CRM
│   └── index.test.ts       # Vitest unit tests (mocked fetch, no live Twenty calls)
├── index.html              # Vite HTML entry
├── wrangler.jsonc          # Workers config (Static Assets + worker)
├── vitest.config.ts        # Vitest: node env, `worker/**/*.test.ts`
├── tsconfig.json           # TypeScript config for the SPA
├── tsconfig.worker.json    # TypeScript config for the Worker (WebWorker lib)
├── vite.config.ts          # Vite + Tailwind plugin
├── .dev.vars.example       # Template for local Worker secrets
└── package.json
```

## Environment Variables

The `/api/contact` Worker reads these. Local development uses `.dev.vars`; production uses `wrangler secret put`. **Never commit `.dev.vars`** — it's in `.gitignore`.

| Variable               | Where                | Required | Description                                                                                  |
| ---------------------- | -------------------- | -------- | -------------------------------------------------------------------------------------------- |
| `TWENTY_API_KEY`       | `wrangler secret put` | yes     | Bearer token from Twenty → Settings → API & Webhooks                                         |
| `TWENTY_BASE_URL`      | `wrangler secret put` | yes     | e.g. `https://twenty.agenticengineering.lat` — no trailing slash                             |
| `CONTACT_SOURCE`       | `wrangler.jsonc` var | no      | Fallback `sourceUrl` written to Twenty when the request has no Origin/Referer (e.g. testing) |

## Getting Started

```bash
pnpm install
pnpm dev          # Vite dev server only (no /api/contact)
```

To exercise the contact form end-to-end locally, you need the Worker too:

```bash
cp .dev.vars.example .dev.vars     # fill in TWENTY_API_KEY + TWENTY_BASE_URL
pnpm cf:dev                         # build SPA + run `wrangler dev` (http://127.0.0.1:8787)
```

## Scripts

| Command           | Description                                                              |
| ----------------- | ------------------------------------------------------------------------ |
| `pnpm dev`        | Vite dev server (frontend only)                                          |
| `pnpm build`      | Production build (SPA → `dist/`)                                         |
| `pnpm preview`    | Preview production build locally                                         |
| `pnpm typecheck`  | TypeScript check for both `tsconfig.json` and `tsconfig.worker.json`     |
| `pnpm test`       | Vitest unit tests for the Worker (`worker/index.test.ts`)                |
| `pnpm cf:dev`     | Build + run the Worker locally with `wrangler dev` (reads `.dev.vars`)   |
| `pnpm cf:deploy`  | Build + deploy the Worker via `wrangler deploy`                          |
| `pnpm cf:tail`    | Stream Worker logs from production (`wrangler tail`)                     |
| `pnpm cf:secrets` | List Worker secrets configured in the Cloudflare account                 |

## Build & Deploy (Cloudflare Workers Static Assets)

### One-time setup

```bash
# 1. Install deps
pnpm install

# 2. Authenticate Wrangler with the Cloudflare account that owns the Worker
npx wrangler login

# 3. Store production secrets (paste each value when prompted)
npx wrangler secret put TWENTY_API_KEY
npx wrangler secret put TWENTY_BASE_URL

# 4. Verify
npx wrangler secret list
```

### Deploy

```bash
pnpm cf:deploy
```

This runs `vite build` (SPA → `dist/`) and `wrangler deploy` (Worker + assets, single atomic publish to `https://agenticengineering.online`).

### Tail production logs

```bash
pnpm cf:tail
```

### Smoke-test the deployed endpoint

```bash
curl -i -X POST "https://agenticengineering.online/api/contact" \
  -H "Content-Type: application/json" \
  -d '{"name":"Smoke Test","email":"smoke@example.com","message":"Hola desde curl","company":"Despacho Test"}'
# Expect: HTTP/2 201   {"ok":true,"id":"<uuid>"}
```

## Testing

Worker behavior is covered by Vitest unit tests that stub `global.fetch` — no live Twenty or Cloudflare calls.

```bash
pnpm test
```

`worker/index.test.ts` exercises validation, routing (`405` / `404`), misconfigured secrets (`500`), upstream failures (`502`), and the Twenty payload shape including `?upsert=true`. Run tests before changing `worker/index.ts` or the contact API contract.

## How the contact form works

```
┌────────────────────────┐
│ Browser submits JSON   │  POST /api/contact   { name, email, message, company? }
└──────────┬─────────────┘
           ↓ (same-origin)
┌────────────────────────┐
│ Worker fetch handler   │  Zod validation → POST Twenty
└──────────┬─────────────┘
           ↓
┌────────────────────────┐
│ Twenty CRM             │  POST /rest/people?upsert=true  → create or update Person
└────────────────────────┘
```

### API contract (`POST /api/contact`)

| Status | Body shape | When |
| ------ | ---------- | ---- |
| `201` | `{ "ok": true, "id": "<uuid>" \| null }` | Twenty accepted the Person |
| `400` | `{ "ok": false, "error": "bad_request", "details": [...] }` | Invalid JSON or Zod validation |
| `405` | `{ "ok": false, "error": "method_not_allowed" }` | Non-`POST` on `/api/contact` |
| `404` | `{ "ok": false, "error": "not_found" }` | Unknown `/api/*` route |
| `500` | `{ "ok": false, "error": "server_misconfigured" }` | Missing `TWENTY_API_KEY` or `TWENTY_BASE_URL` |
| `502` | `{ "ok": false, "error": "upstream_error" }` | Twenty HTTP error or network failure |

The SPA maps all `502` / `500` responses to a single user-facing error string; check `pnpm cf:tail` and Twenty logs when debugging production failures.

### Twenty upsert (returning leads)

The Worker calls `POST {TWENTY_BASE_URL}/rest/people?upsert=true`. With upsert enabled, Twenty matches on email and updates an existing Person (including soft-deleted rows it can restore) instead of returning `400 duplicate entry detected`.

Without `?upsert=true`, a returning visitor whose email already exists in Twenty gets a `400` from Twenty, which the Worker surfaces as `502 upstream_error` — the form looks broken even though validation passed.

### Twenty `Person` field mapping

The Worker creates or updates a Twenty Person per submission. Custom fields must already exist in Twenty (Settings → Data Model → Person → + Add Field, type Text unless noted):

| Request JSON field | Twenty field (API name)        | Standard? | Notes |
| ------------------ | ------------------------------ | --------- | ----- |
| `name`             | `name.firstName` / `lastName`  | standard  | Split on first space |
| `email`            | `emails.primaryEmail`          | standard  | Normalized to lowercase |
| `company`          | `companyName`                  | **custom** (Text) | SPA sends the firm name as `company` |
| `message`          | `message`                      | **custom** (Text — Multiline) | |
| `projectType`      | `projectType`                  | **custom** (Text) | Optional; not sent by the SPA today |
| `budget`           | `budget`                       | **custom** (Text) | Optional |
| `howDidYouHear`    | `howDidYouHear`                | **custom** (Text) | Optional |
| (server-set) `Origin` / `Referer` / `CONTACT_SOURCE` | `sourceUrl` | **custom** (Text) | First non-empty wins |

If a custom field is missing in Twenty, the Worker still posts the Person but Twenty silently drops unknown keys.

### Troubleshooting

| Symptom | Likely cause | What to check |
| ------- | ------------ | ------------- |
| Form shows generic error, `502` in Network tab | Twenty rejected the payload or is unreachable | `pnpm cf:tail`; Twenty admin → API logs; confirm `?upsert=true` is present in Worker code |
| `500 server_misconfigured` | Secrets not set in the target environment | `pnpm cf:secrets` / `wrangler secret list`; redeploy after `wrangler secret put` |
| `400` with `details` | Client sent invalid JSON or failed Zod (empty name, bad email) | Browser devtools → request payload |
| Lead created but custom fields empty | Field not defined in Twenty data model | Settings → Data Model → Person |
| `pnpm dev` contact submit fails | Vite-only dev has no Worker | Use `pnpm cf:dev` on port 8787 |

## Topology notes

- `wrangler.jsonc` sets `assets.run_worker_first = ["/api/*"]` so the Worker only intercepts `/api/*` paths; everything else goes through the Static Assets binding with `not_found_handling: "single-page-application"` (SPA fallback).
- The Twenty call is a subrequest and counts against the Workers subrequest cap (1000/request on paid plans).
- Logs are kept PII-free (no name/email/message bodies in `console.error`).

## Links

- **Live site:** https://agenticengineering.online
- **Twenty CRM:** https://twenty.agenticengineering.lat
- **Sister landing page:** https://agenticengineering.agency (Agentic Engineering Agency)
