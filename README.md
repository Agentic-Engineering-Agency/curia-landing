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
│   └── index.ts            # Cloudflare Worker: handles POST /api/contact → Twenty CRM
├── index.html              # Vite HTML entry
├── wrangler.jsonc          # Workers config (Static Assets + worker)
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
| `TURNSTILE_SECRET_KEY` | `wrangler secret put` | no      | When set, the Worker enforces Cloudflare Turnstile verification on every submission          |
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
# Optional anti-spam (skip until you create a Turnstile site):
# npx wrangler secret put TURNSTILE_SECRET_KEY

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

## How the contact form works

```
┌────────────────────────┐
│ Browser submits JSON   │  POST /api/contact   { name, email, message, company? }
└──────────┬─────────────┘
           ↓ (same-origin)
┌────────────────────────┐
│ Worker fetch handler   │  Zod validation → optional Turnstile → POST Twenty
└──────────┬─────────────┘
           ↓
┌────────────────────────┐
│ Twenty CRM             │  POST /rest/people  → creates Person
└────────────────────────┘
```

### Twenty `Person` field mapping

The Worker creates a Twenty Person per submission. The custom fields below must already exist in Twenty (Settings → Data Model → Person → + Add Field, type Text unless noted):

| Form field             | Twenty field (API name)        | Standard? |
| ---------------------- | ------------------------------ | --------- |
| `name`                 | `name.firstName` / `lastName`  | standard (split on first space) |
| `email`                | `emails.primaryEmail`          | standard  |
| `firm` (sent as `company`) | `companyName`              | **custom** (Text) |
| `message`              | `message`                      | **custom** (Text — Multiline) |
| (server-set) Origin    | `sourceUrl`                    | **custom** (Text) |

If a custom field is missing in Twenty, the Worker still creates the Person but Twenty silently drops the unknown key.

## Topology notes

- `wrangler.jsonc` sets `assets.run_worker_first = ["/api/*"]` so the Worker only intercepts `/api/*` paths; everything else goes through the Static Assets binding with `not_found_handling: "single-page-application"` (SPA fallback).
- Both Twenty calls and Turnstile siteverify are subrequests; each counts against the Workers subrequest cap (1000/request on paid plans).
- Logs are kept PII-free (no name/email/message bodies in `console.error`).

## Links

- **Live site:** https://agenticengineering.online
- **Twenty CRM:** https://twenty.agenticengineering.lat
- **Sister landing page:** https://agenticengineering.agency (Agentic Engineering Agency)
