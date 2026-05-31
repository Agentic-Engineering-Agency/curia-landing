import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import worker from "./index.js";

type ContactEnv = {
  ASSETS: Fetcher;
  TWENTY_API_KEY?: string;
  TWENTY_BASE_URL?: string;
  CONTACT_SOURCE?: string;
};

const assetsStub: Fetcher = {
  fetch: () => Promise.resolve(new Response("asset", { status: 404 })),
};

function contactEnv(overrides: Partial<ContactEnv> = {}): ContactEnv {
  return {
    ASSETS: assetsStub,
    TWENTY_API_KEY: "test-twenty-key",
    TWENTY_BASE_URL: "https://twenty.example.test",
    ...overrides,
  };
}

function postContact(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request("https://curia.example.test/api/contact", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Origin: "https://curia.example.test",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("POST /api/contact — Twenty CRM upsert", () => {
  it("returns 500 when Twenty credentials are missing", async () => {
    const res = await worker.fetch(
      postContact({ name: "Ana López", email: "ana@example.test", message: "Hola" }),
      contactEnv({ TWENTY_API_KEY: undefined, TWENTY_BASE_URL: undefined }),
    );
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ ok: false, error: "server_misconfigured" });
  });

  it("returns 400 with field details for invalid JSON bodies", async () => {
    const res = await worker.fetch(
      new Request("https://curia.example.test/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{not-json",
      }),
      contactEnv(),
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { ok: boolean; error: string; details?: string[] };
    expect(body.ok).toBe(false);
    expect(body.error).toBe("bad_request");
    expect(body.details).toContain("invalid_json");
  });

  it("returns 400 when required contact fields fail validation", async () => {
    const res = await worker.fetch(
      postContact({ name: "", email: "not-an-email", message: "" }),
      contactEnv(),
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { ok: boolean; details?: string[] };
    expect(body.ok).toBe(false);
    expect(body.details?.length).toBeGreaterThan(0);
  });

  it("posts to Twenty with ?upsert=true and maps the person payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: { createPerson: { id: "person_123" } } }), {
        status: 201,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const res = await worker.fetch(
      postContact({
        name: "Juan Pérez García",
        email: "Juan@Example.TEST",
        message: "Necesito una demo",
        company: "KLGV",
        projectType: "Litigio",
      }),
      contactEnv(),
    );

    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ ok: true, id: "person_123" });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://twenty.example.test/rest/people?upsert=true");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({
      Authorization: "Bearer test-twenty-key",
      "Content-Type": "application/json",
    });

    const payload = JSON.parse(String(init.body)) as {
      name: { firstName: string; lastName: string };
      emails: { primaryEmail: string };
      message: string;
      companyName: string;
      projectType: string;
      sourceUrl: string;
    };
    expect(payload.name).toEqual({ firstName: "Juan", lastName: "Pérez García" });
    expect(payload.emails.primaryEmail).toBe("juan@example.test");
    expect(payload.message).toBe("Necesito una demo");
    expect(payload.companyName).toBe("KLGV");
    expect(payload.projectType).toBe("Litigio");
    expect(payload.sourceUrl).toBe("https://curia.example.test");
  });

  it("returns 502 when Twenty responds with a client error (duplicate without upsert)", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("duplicate entry detected", { status: 400 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const res = await worker.fetch(
      postContact({ name: "Repeat Lead", email: "repeat@example.test", message: "Hola otra vez" }),
      contactEnv(),
    );

    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ ok: false, error: "upstream_error" });
  });

  it("returns 502 when the upstream network fails", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("connection reset"));
    vi.stubGlobal("fetch", fetchMock);

    const res = await worker.fetch(
      postContact({ name: "Network Fail", email: "net@example.test", message: "Hola" }),
      contactEnv(),
    );

    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ ok: false, error: "upstream_error" });
  });

  it("returns 405 for non-POST methods on /api/contact", async () => {
    const res = await worker.fetch(
      new Request("https://curia.example.test/api/contact", { method: "GET" }),
      contactEnv(),
    );
    expect(res.status).toBe(405);
    expect(await res.json()).toEqual({ ok: false, error: "method_not_allowed" });
  });

  it("returns 404 JSON for unknown /api/* routes", async () => {
    const res = await worker.fetch(
      new Request("https://curia.example.test/api/health", { method: "GET" }),
      contactEnv(),
    );
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ ok: false, error: "not_found" });
  });
});
