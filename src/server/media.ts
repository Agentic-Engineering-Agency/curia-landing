type ScrubMediaEntry = {
  key: string;
  type: string;
  size: number;
};

const RANGE_CHUNK_BYTES = 512 * 1024;

const SCRUB_MEDIA = new Map<string, ScrubMediaEntry>([
  [
    "despacho-scrub-hevc.mp4",
    {
      key: "scrub/despacho-scrub-hevc.mp4",
      type: "video/mp4",
      size: 7_988_645,
    },
  ],
  [
    "despacho-scrub.webm",
    { key: "scrub/despacho-scrub.webm", type: "video/webm", size: 10_744_943 },
  ],
  [
    "despacho-scrub.mp4",
    { key: "scrub/despacho-scrub.mp4", type: "video/mp4", size: 10_978_264 },
  ],
  [
    "despacho-scrub-movil-hevc.mp4",
    {
      key: "scrub/despacho-scrub-movil-hevc.mp4",
      type: "video/mp4",
      size: 2_809_913,
    },
  ],
  [
    "despacho-scrub-movil-fast.mp4",
    {
      key: "scrub/despacho-scrub-movil-fast.mp4",
      type: "video/mp4",
      size: 3_998_624,
    },
  ],
  [
    "despacho-scrub-movil.mp4",
    {
      key: "scrub/despacho-scrub-movil.mp4",
      type: "video/mp4",
      size: 3_733_975,
    },
  ],
  [
    "despacho-scrub-movil.webm",
    {
      key: "scrub/despacho-scrub-movil.webm",
      type: "video/webm",
      size: 3_500_269,
    },
  ],
]);

export interface MediaRange {
  offset: number;
  length: number;
}

export interface MediaObject {
  body: ReadableStream<Uint8Array>;
  size: number;
  range?: MediaRange;
  httpEtag: string;
  writeHttpMetadata: (headers: Headers) => void;
}

export interface MediaBucket {
  get: (
    key: string,
    options?: { range: Headers | MediaRange },
  ) => Promise<MediaObject | null>;
}

type ParsedRange = MediaRange | "invalid" | undefined;

function parseRange(header: string | null, size: number): ParsedRange {
  if (!header) return undefined;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header);
  if (!match || (!match[1] && !match[2])) return "invalid";

  if (!match[1]) {
    const suffix = Number(match[2]);
    if (!Number.isSafeInteger(suffix) || suffix <= 0) return "invalid";
    const length = Math.min(suffix, size, RANGE_CHUNK_BYTES);
    return { offset: size - length, length };
  }

  const offset = Number(match[1]);
  if (!Number.isSafeInteger(offset) || offset < 0 || offset >= size) {
    return "invalid";
  }
  const requestedEnd = match[2] ? Number(match[2]) : size - 1;
  if (!Number.isSafeInteger(requestedEnd) || requestedEnd < offset) {
    return "invalid";
  }
  const end = Math.min(requestedEnd, size - 1);
  return {
    offset,
    length: Math.min(end - offset + 1, RANGE_CHUNK_BYTES),
  };
}

function fallbackStatic(request: Request, filename: string): Response {
  const actual = new URL(request.url);
  actual.pathname = `/media/${filename}`;
  return Response.redirect(actual, 307);
}

export async function handleScrubMedia(
  request: Request,
  bucket: MediaBucket,
  filename: string,
): Promise<Response> {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response(null, {
      status: 405,
      headers: { Allow: "GET, HEAD" },
    });
  }

  const medio = SCRUB_MEDIA.get(filename);
  if (!medio) return new Response("Not Found", { status: 404 });
  const range = parseRange(request.headers.get("range"), medio.size);
  if (range === "invalid") {
    return new Response(null, {
      status: 416,
      headers: { "Content-Range": `bytes */${medio.size}` },
    });
  }

  let object: MediaObject | null;
  try {
    object = range
      ? await bucket.get(medio.key, { range })
      : await bucket.get(medio.key);
  } catch {
    return new Response(null, {
      status: 416,
      headers: { "Content-Range": `bytes */${medio.size}` },
    });
  }
  if (!object) return fallbackStatic(request, filename);

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("Content-Type", medio.type);
  headers.set("ETag", object.httpEtag);
  headers.set("X-Content-Type-Options", "nosniff");

  let status = 200;
  if (range && object.range) {
    const { offset, length } = object.range;
    headers.set("Content-Length", String(length));
    headers.set(
      "Content-Range",
      `bytes ${offset}-${offset + length - 1}/${object.size}`,
    );
    status = 206;
  } else {
    headers.set("Content-Length", String(object.size));
  }

  return new Response(request.method === "HEAD" ? null : object.body, {
    status,
    headers,
  });
}
