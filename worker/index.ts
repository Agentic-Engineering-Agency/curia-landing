/// <reference types="@cloudflare/workers-types" />
/**
 * Cloudflare Worker entry for the Curia landing page.
 *
 * Topology:
 *   - Static assets in ./dist are served by the Workers Static Assets binding
 *     (ASSETS) with single-page-application 404 handling.
 *   - This Worker runs first only for `/api/*` (see wrangler.jsonc
 *     `assets.run_worker_first`). Everything else is delegated to env.ASSETS.
 *
 * Routes:
 *   - POST /api/contact -> validate -> POST Twenty CRM /rest/people
 *   - Any other /api/*  -> 404 JSON
 *
 * Env (set via wrangler secret put / vars / .dev.vars):
 *   TWENTY_API_KEY        (secret, required)
 *   TWENTY_BASE_URL       (secret OR var, required) e.g. https://twenty.agenticengineering.lat
 *   CONTACT_SOURCE        (var, optional) fallback `sourceUrl` when no Origin/Referer header
 */

import { z } from "zod";

interface Env {
  ASSETS: Fetcher;
  TWENTY_API_KEY?: string;
  TWENTY_BASE_URL?: string;
  CONTACT_SOURCE?: string;
}

const ContactSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(254).toLowerCase(),
  message: z.string().trim().min(1).max(5000),
  company: z.string().trim().max(200).optional(),
  projectType: z.string().trim().max(200).optional(),
  budget: z.string().trim().max(200).optional(),
  howDidYouHear: z.string().trim().max(500).optional(),
});

type ContactInput = z.infer<typeof ContactSchema>;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact") {
      if (request.method === "POST") return handleContact(request, env);
      return jsonResponse({ ok: false, error: "method_not_allowed" }, 405);
    }

    if (url.pathname.startsWith("/api/")) {
      return jsonResponse({ ok: false, error: "not_found" }, 404);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

async function handleContact(request: Request, env: Env): Promise<Response> {
  if (!env.TWENTY_API_KEY || !env.TWENTY_BASE_URL) {
    console.error("contact.misconfigured", {
      hasKey: Boolean(env.TWENTY_API_KEY),
      hasUrl: Boolean(env.TWENTY_BASE_URL),
    });
    return jsonResponse({ ok: false, error: "server_misconfigured" }, 500);
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return jsonResponse(
      { ok: false, error: "bad_request", details: ["invalid_json"] },
      400,
    );
  }

  const parsed = ContactSchema.safeParse(raw);
  if (!parsed.success) {
    const details = parsed.error.issues.map(
      (i) => `${i.path.join(".") || "<root>"}: ${i.message}`,
    );
    return jsonResponse({ ok: false, error: "bad_request", details }, 400);
  }
  const input = parsed.data;

  const upstream = await postPersonToTwenty(input, request, env);

  if (upstream.kind === "network_error") {
    console.error("contact.upstream_network_error", { message: upstream.message });
    return jsonResponse({ ok: false, error: "upstream_error" }, 502);
  }

  if (!upstream.ok) {
    console.error("contact.upstream_failed", {
      status: upstream.status,
      body: upstream.bodyPreview,
    });
    return jsonResponse({ ok: false, error: "upstream_error" }, 502);
  }

  return jsonResponse({ ok: true, id: upstream.id ?? null }, 201);
}

type TwentyResult =
  | { kind: "ok"; ok: true; status: number; id: string | null }
  | { kind: "http_error"; ok: false; status: number; bodyPreview: string }
  | { kind: "network_error"; ok: false; message: string };

async function postPersonToTwenty(
  input: ContactInput,
  request: Request,
  env: Env,
): Promise<TwentyResult> {
  const { firstName, lastName } = splitName(input.name);
  const sourceUrl =
    request.headers.get("Origin") ??
    request.headers.get("Referer") ??
    env.CONTACT_SOURCE ??
    "";

  // Twenty Person body shape (>= v0.30): nested composites for name/emails/phones,
  // top-level keys for custom fields. Empty strings are stripped so we don't
  // overwrite existing values on idempotent re-runs.
  const personBody: Record<string, unknown> = {
    name: { firstName, lastName },
    emails: { primaryEmail: input.email, additionalEmails: [] },
  };
  if (input.message) personBody.message = input.message;
  if (input.company) personBody.companyName = input.company;
  if (input.projectType) personBody.projectType = input.projectType;
  if (input.budget) personBody.budget = input.budget;
  if (input.howDidYouHear) personBody.howDidYouHear = input.howDidYouHear;
  if (sourceUrl) personBody.sourceUrl = sourceUrl;

  const twentyUrl = `${env.TWENTY_BASE_URL!.replace(/\/$/, "")}/rest/people`;

  let upstream: Response;
  try {
    upstream = await fetch(twentyUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.TWENTY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(personBody),
    });
  } catch (err) {
    return {
      kind: "network_error",
      ok: false,
      message: err instanceof Error ? err.message : String(err),
    };
  }

  if (!upstream.ok) {
    const bodyPreview = (await upstream.text().catch(() => "")).slice(0, 500);
    return { kind: "http_error", ok: false, status: upstream.status, bodyPreview };
  }

  let id: string | null = null;
  try {
    const json = (await upstream.json()) as {
      data?: { createPerson?: { id?: string } };
    };
    id = json.data?.createPerson?.id ?? null;
  } catch {
    // upstream returned 2xx without parseable JSON; treat as success without id
  }

  return { kind: "ok", ok: true, status: upstream.status, id };
}

function splitName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
