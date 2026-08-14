# Contact API contract

The Cloudflare Worker owns `POST /api/contact`. The browser sends contact requests to the same origin; the Worker validates the payload and forwards it server-side to Twenty CRM. CRM credentials never enter the Vite bundle.

## Request

```json
{
  "name": "Ana López",
  "email": "ana@example.test",
  "message": "Quiero conocer Curia",
  "company": "Despacho Ejemplo",
  "projectType": "Litigio",
  "budget": "Por definir",
  "howDidYouHear": "Referencia"
}
```

`name`, `email`, and `message` are required. Optional fields are bounded strings. Email is trimmed, lowercased, and validated.

## Responses

| Status | Body | Meaning |
| --- | --- | --- |
| `201` | `{ "ok": true, "id": string | null }` | Twenty accepted the person |
| `400` | `{ "ok": false, "error": "bad_request", "details": string[] }` | Invalid JSON or payload |
| `405` | `{ "ok": false, "error": "method_not_allowed" }` | Non-POST request |
| `404` | `{ "ok": false, "error": "not_found" }` | Unknown `/api/*` route |
| `500` | `{ "ok": false, "error": "server_misconfigured" }` | Required CRM configuration is absent |
| `502` | `{ "ok": false, "error": "upstream_error" }` | CRM rejected the request or was unreachable |

## Configuration

- `TWENTY_API_KEY`: Wrangler secret; required.
- `TWENTY_BASE_URL`: Wrangler secret or local `.dev.vars`; required.
- `CONTACT_SOURCE`: public Wrangler variable used as a fallback source URL.

Local Worker development uses `.dev.vars` copied from `.dev.vars.example`. Never commit credentials or real lead data.

## Logging and privacy

Worker logs must remain PII-free. Logs may include stable event names, HTTP status codes, and coarse error categories, but must not include request payloads, CRM response bodies, exception messages, names, email addresses, or message text.
