import path from "node:path";
import { MIME_BY_EXT, isUploadName, uploadKey } from "@/content/uploads";
import { getStore } from "@/storage";

const IMMUTABLE = "public, max-age=31536000, immutable";

/**
 * Serves uploaded images from the site's storage. With a DigitalOcean CDN address set, visitors load images
 * from the CDN directly and this route is only used by the admin's previews; without one (local development)
 * it is how images reach visitors. Filenames are unique and never reused, so responses are cached forever.
 */
export async function GET(request: Request, ctx: RouteContext<"/uploads/[...path]">) {
  const { path: segments } = await ctx.params;
  const name = segments.length === 1 ? segments[0] : "";
  const type = isUploadName(name) ? MIME_BY_EXT[path.extname(name).toLowerCase()] : undefined;
  if (!type) return new Response("Not found", { status: 404 });

  // Same name, same bytes: if the browser already has it there is nothing to fetch.
  const etag = `"${name}"`;
  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers: { ETag: etag, "Cache-Control": IMMUTABLE } });
  }

  let data: Buffer | null;
  try {
    data = await getStore().get(uploadKey(name));
  } catch (error) {
    console.error("[uploads] storage read failed", error);
    return new Response("Image storage is unavailable", { status: 502, headers: { "Cache-Control": "no-store" } });
  }
  if (!data) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": type,
      "Content-Length": String(data.length),
      "Cache-Control": IMMUTABLE,
      ETag: etag,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
