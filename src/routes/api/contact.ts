import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";
import { handleContact, methodNotAllowed } from "../../server/contact";

export const Route = createFileRoute("/api/contact")({
  server: {
    handlers: {
      POST: ({ request }) => handleContact(request, env),
      GET: methodNotAllowed,
      PUT: methodNotAllowed,
      PATCH: methodNotAllowed,
      DELETE: methodNotAllowed,
    },
  },
});
