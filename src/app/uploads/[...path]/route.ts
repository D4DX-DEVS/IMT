import { getCloudflareContext } from "@opennextjs/cloudflare";
import { MIME_BY_EXT, isUploadName, uploadKey } from "@/content/uploads";
import { IMAGE_QUALITIES, IMAGE_WIDTHS } from "@/lib/image-sizes";
import { images, media } from "@/storage";

const IMMUTABLE = "public, max-age=31536000, immutable";

/** Cloudflare's per-data-centre cache, when running on Workers (absent in `next dev`). */
const edgeCache = (): Cache | null => (typeof caches !== "undefined" && "default" in caches ? (caches as unknown as { default: Cache }).default : null);

function extOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot).toLowerCase();
}

/** Best format the browser accepts: AVIF, then WebP, else the original. */
function negotiate(accept: string, original: string): string {
  if (/image\/avif/i.test(accept)) return "image/avif";
  if (/image\/webp/i.test(accept)) return "image/webp";
  return original;
}

/**
 * Serves uploaded images from R2. `/uploads/<name>` returns the stored file; `/uploads/<name>?w=640&q=75`
 * (what the site's next/image loader asks for) returns a resized copy in AVIF/WebP when the browser supports
 * it, made by Cloudflare Images. Only the widths and qualities next/image uses are accepted, so the number of
 * variants per image stays small. Filenames are unique and never reused, so every response is cached forever,
 * in the browser and in Cloudflare's edge cache.
 */
export async function GET(request: Request, ctx: RouteContext<"/uploads/[...path]">) {
  const { path: segments } = await ctx.params;
  const name = segments.length === 1 ? segments[0] : "";
  const type = isUploadName(name) ? MIME_BY_EXT[extOf(name)] : undefined;
  if (!type) return new Response("Not found", { status: 404 });

  const url = new URL(request.url);
  const w = url.searchParams.get("w");
  const q = url.searchParams.get("q");
  const width = w === null ? null : Number(w);
  const quality = q === null ? 75 : Number(q);
  if (width !== null && !IMAGE_WIDTHS.includes(width)) return new Response("Unsupported width", { status: 400 });
  if (!IMAGE_QUALITIES.includes(quality)) return new Response("Unsupported quality", { status: 400 });

  const format = width === null ? type : negotiate(request.headers.get("accept") ?? "", type);
  const etag = `"${name}-${width ?? "o"}-${quality}-${format.slice(6)}"`;
  const headers = (contentType: string): HeadersInit => ({
    "Content-Type": contentType,
    "Cache-Control": IMMUTABLE,
    ETag: etag,
    Vary: "Accept",
    "X-Content-Type-Options": "nosniff",
  });
  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers: headers(format) });
  }

  // One cache entry per variant: the format is part of the key, so `Vary: Accept` isn't needed for the lookup.
  const cache = edgeCache();
  const cacheKey = new Request(`${url.origin}/uploads/${name}?w=${width ?? ""}&q=${quality}&f=${format.slice(6)}`);
  const cached = await cache?.match(cacheKey);
  if (cached) {
    const hit = new Response(cached.body, cached);
    hit.headers.set("Vary", "Accept");
    return hit;
  }

  let object: R2ObjectBody | null;
  try {
    object = await (await media()).get(uploadKey(name));
  } catch (error) {
    console.error("[uploads] R2 read failed", error);
    return new Response("Image storage is unavailable", { status: 502, headers: { "Cache-Control": "no-store" } });
  }
  if (!object) return new Response("Not found", { status: 404 });

  let response: Response;
  if (width === null) {
    response = new Response(object.body, { headers: { ...headers(type), "Content-Length": String(object.size) } });
  } else {
    try {
      const result = await (await images())
        .input(object.body)
        .transform({ width, fit: "scale-down" })
        .output({ format: format as "image/avif" | "image/webp" | "image/jpeg" | "image/png", quality });
      response = new Response(result.image(), { headers: headers(result.contentType()) });
    } catch (error) {
      console.error("[uploads] resize failed; sending the original", error);
      const original = await (await media()).get(uploadKey(name));
      if (!original) return new Response("Not found", { status: 404 });
      return new Response(original.body, { headers: { ...headers(type), "Cache-Control": "public, max-age=300" } });
    }
  }

  if (cache) {
    const [toClient, toCache] = response.body!.tee();
    // The key already encodes the format, so drop `Vary` from the cached copy (it would make lookups miss).
    const cachedHeaders = new Headers(response.headers);
    cachedHeaders.delete("Vary");
    const put = cache.put(cacheKey, new Response(toCache, { status: response.status, headers: cachedHeaders })).catch((error) => console.error("[uploads] edge cache put failed", error));
    (await getCloudflareContext({ async: true })).ctx.waitUntil(put);
    return new Response(toClient, response);
  }
  return response;
}
