import { describe, expect, it, vi } from "vitest";

import { handleScrubMedia } from "./media";
import type { MediaBucket, MediaObject } from "./media";

const BYTES = new TextEncoder().encode("0123456789");

function mediaObject(range?: { offset: number; length: number }): MediaObject {
  const bytes = range
    ? BYTES.slice(range.offset, range.offset + range.length)
    : BYTES;
  return {
    body: new Blob([bytes]).stream(),
    size: BYTES.length,
    range,
    httpEtag: '"media-etag"',
    writeHttpMetadata(headers) {
      headers.set("Content-Type", "application/octet-stream");
    },
  };
}

function bucket(get: MediaBucket["get"]): MediaBucket {
  return { get };
}

describe("GET /media-range/$filename", () => {
  it("rejects filenames outside the scrub allowlist", async () => {
    const get = vi.fn<MediaBucket["get"]>();
    const response = await handleScrubMedia(
      new Request("https://curia.test/media-range/private.txt"),
      bucket(get),
      "private.txt",
    );

    expect(response.status).toBe(404);
    expect(get).not.toHaveBeenCalled();
  });

  it("redirects to the static fallback when the R2 object is absent", async () => {
    const response = await handleScrubMedia(
      new Request("https://curia.test/media-range/despacho-scrub.mp4?v=test"),
      bucket(async () => null),
      "despacho-scrub.mp4",
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://curia.test/media/despacho-scrub.mp4?v=test",
    );
  });

  it("serves a complete immutable object with byte-range capability", async () => {
    const get = vi.fn<MediaBucket["get"]>().mockResolvedValue(mediaObject());
    const response = await handleScrubMedia(
      new Request("https://curia.test/media-range/despacho-scrub-hevc.mp4"),
      bucket(get),
      "despacho-scrub-hevc.mp4",
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("accept-ranges")).toBe("bytes");
    expect(response.headers.get("content-length")).toBe("10");
    expect(response.headers.get("content-type")).toBe("video/mp4");
    expect(response.headers.get("etag")).toBe('"media-etag"');
    expect(response.headers.get("cache-control")).toContain("immutable");
    expect(await response.text()).toBe("0123456789");
    expect(get).toHaveBeenCalledWith("scrub/despacho-scrub-hevc.mp4");
  });

  it("returns an exact 206 response for a normalized R2 range", async () => {
    const response = await handleScrubMedia(
      new Request("https://curia.test/media-range/despacho-scrub.webm", {
        headers: { Range: "bytes=2-5" },
      }),
      bucket(async () => mediaObject({ offset: 2, length: 4 })),
      "despacho-scrub.webm",
    );

    expect(response.status).toBe(206);
    expect(response.headers.get("content-range")).toBe("bytes 2-5/10");
    expect(response.headers.get("content-length")).toBe("4");
    expect(response.headers.get("content-type")).toBe("video/webm");
    expect(await response.text()).toBe("2345");
  });

  it("caps open-ended browser ranges to a 512 KiB R2 read", async () => {
    const get = vi
      .fn<MediaBucket["get"]>()
      .mockResolvedValue(mediaObject({ offset: 0, length: 4 }));
    const response = await handleScrubMedia(
      new Request("https://curia.test/media-range/despacho-scrub-hevc.mp4", {
        headers: { Range: "bytes=0-" },
      }),
      bucket(get),
      "despacho-scrub-hevc.mp4",
    );

    expect(response.status).toBe(206);
    expect(get).toHaveBeenCalledWith("scrub/despacho-scrub-hevc.mp4", {
      range: { offset: 0, length: 512 * 1024 },
    });
  });

  it("returns 416 before R2 for malformed or unsatisfiable ranges", async () => {
    const get = vi.fn<MediaBucket["get"]>();
    const response = await handleScrubMedia(
      new Request("https://curia.test/media-range/despacho-scrub-hevc.mp4", {
        headers: { Range: "bytes=99999999-" },
      }),
      bucket(get),
      "despacho-scrub-hevc.mp4",
    );

    expect(response.status).toBe(416);
    expect(response.headers.get("content-range")).toBe("bytes */7988645");
    expect(get).not.toHaveBeenCalled();
  });

  it("preserves 206 headers but omits the body for HEAD", async () => {
    const response = await handleScrubMedia(
      new Request("https://curia.test/media-range/despacho-scrub-movil.mp4", {
        method: "HEAD",
        headers: { Range: "bytes=5-9" },
      }),
      bucket(async () => mediaObject({ offset: 5, length: 5 })),
      "despacho-scrub-movil.mp4",
    );

    expect(response.status).toBe(206);
    expect(response.headers.get("content-range")).toBe("bytes 5-9/10");
    expect(await response.text()).toBe("");
  });

  it("rejects unsupported methods", async () => {
    const response = await handleScrubMedia(
      new Request("https://curia.test/media-range/despacho-scrub-movil.mp4", {
        method: "POST",
      }),
      bucket(async () => mediaObject()),
      "despacho-scrub-movil.mp4",
    );

    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("GET, HEAD");
  });
});
