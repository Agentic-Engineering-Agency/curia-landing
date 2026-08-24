import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";
import { handleScrubMedia } from "../../server/media";

export const Route = createFileRoute("/media-range/$filename")({
  server: {
    handlers: {
      GET: ({ request, params }) =>
        handleScrubMedia(request, env.MEDIA, params.filename),
      HEAD: ({ request, params }) =>
        handleScrubMedia(request, env.MEDIA, params.filename),
      POST: ({ request, params }) =>
        handleScrubMedia(request, env.MEDIA, params.filename),
      PUT: ({ request, params }) =>
        handleScrubMedia(request, env.MEDIA, params.filename),
      PATCH: ({ request, params }) =>
        handleScrubMedia(request, env.MEDIA, params.filename),
      DELETE: ({ request, params }) =>
        handleScrubMedia(request, env.MEDIA, params.filename),
    },
  },
});
