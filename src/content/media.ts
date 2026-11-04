import { images, media } from "@/storage";
import builtinManifest from "@/data/builtin-images.json";
import { slugify } from "./schema";
import { MIME_BY_EXT, addToUploadIndex, readUploadIndex, uploadKey, UPLOAD_PREFIX_KEY, type UploadRecord } from "./uploads";

/** An upload problem whose message is safe to show to the admin. */
export class UploadError extends Error {}

export type MediaItem = { src: string; width: number; height: number; name: string; builtin: boolean };

/** Kept under the 10 MB request-body buffer the proxy applies, with room for multipart overhead. */
export const MAX_UPLOAD_MB = 8;
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;
const MAX_EDGE = 2400;
const MAX_INPUT_PIXELS = 80_000_000;

type OutputFormat = "image/jpeg" | "image/png" | "image/webp" | "image/avif";
const FORMATS: Record<string, { ext: string; quality?: number }> = {
  "image/jpeg": { ext: "jpg", quality: 85 },
  "image/png": { ext: "png" },
  "image/webp": { ext: "webp", quality: 85 },
  "image/avif": { ext: "avif", quality: 60 },
};

const streamOf = (bytes: Uint8Array): ReadableStream<Uint8Array> => new Blob([bytes as Uint8Array<ArrayBuffer>]).stream();

function randomHex(bytes: number): string {
  return [...crypto.getRandomValues(new Uint8Array(bytes))].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** `My Photo.final.JPG` → `My Photo.final` */
const baseName = (fileName: string): string => fileName.replace(/^.*[\\/]/, "").replace(/\.[^.]*$/, "");

/**
 * Validates an uploaded image by decoding it with Cloudflare Images (the filename and declared type are
 * not trusted), downsizes anything larger than 2400px, re-encodes it (which drops metadata such as GPS
 * location), stores it in R2 under a unique name and records its size in D1.
 */
export async function saveUpload(input: Uint8Array, originalName: string): Promise<MediaItem> {
  if (input.length === 0) throw new UploadError("The file is empty.");
  if (input.length > MAX_UPLOAD_BYTES) throw new UploadError(`That image is larger than ${MAX_UPLOAD_MB} MB.`);

  const imagesBinding = await images();
  let info: Awaited<ReturnType<ImagesBinding["info"]>>;
  try {
    info = await imagesBinding.info(streamOf(input));
  } catch {
    throw new UploadError("That file is not a readable image.");
  }
  const format = FORMATS[info.format];
  if (!format || !("width" in info)) throw new UploadError("Use a JPG, PNG, WebP or AVIF image.");
  if (info.width * info.height > MAX_INPUT_PIXELS) throw new UploadError("That image has too many pixels. Use a smaller one.");

  let data: Uint8Array;
  let width: number;
  let height: number;
  try {
    const result = await imagesBinding
      .input(streamOf(input))
      .transform({ width: MAX_EDGE, height: MAX_EDGE, fit: "scale-down" })
      .output({ format: info.format as OutputFormat, quality: format.quality });
    data = new Uint8Array(await new Response(result.image()).arrayBuffer());
    const out = await imagesBinding.info(streamOf(data));
    if (!("width" in out)) throw new Error("unexpected output");
    ({ width, height } = out);
  } catch {
    throw new UploadError("That image could not be processed.");
  }

  const base = slugify(baseName(originalName)).slice(0, 40) || "image";
  const name = `${Date.now().toString(36)}-${randomHex(4)}-${base}.${format.ext}`;

  await (await media()).put(uploadKey(name), data, {
    httpMetadata: {
      contentType: MIME_BY_EXT[`.${format.ext}`],
      // The name is unique and never reused, so browsers and caches may keep the file forever.
      cacheControl: "public, max-age=31536000, immutable",
    },
  });
  await addToUploadIndex([{ name, width, height, bytes: data.length, uploadedAt: new Date().toISOString() }]);

  return { src: `/uploads/${name}`, width, height, name, builtin: false };
}

/** Images shipped in public/images, measured at build time by `npm run images:manifest`. */
function builtinImages(): MediaItem[] {
  return (builtinManifest as { name: string; width: number; height: number }[])
    .map((i) => ({ src: `/images/${i.name}`, width: i.width, height: i.height, name: i.name, builtin: true }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

const IMAGE_FILE = /\.(jpe?g|png|webp|avif)$/i;

async function listUploadObjects(): Promise<R2Object[]> {
  const bucket = await media();
  const found: R2Object[] = [];
  let cursor: string | undefined;
  do {
    const page = await bucket.list({ prefix: UPLOAD_PREFIX_KEY, cursor });
    found.push(...page.objects);
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  return found;
}

/** Uploaded images (newest first). Files that exist in R2 but not in the index are measured and added. */
async function uploadedImages(): Promise<MediaItem[]> {
  const [records, objects] = await Promise.all([readUploadIndex(), listUploadObjects()]);

  const byName = new Map(records.map((r) => [r.name, r]));
  const stored = new Map(objects.map((o) => [o.key.slice(UPLOAD_PREFIX_KEY.length), o]));

  const added: UploadRecord[] = [];
  const missing = [...stored].filter(([name]) => !byName.has(name) && IMAGE_FILE.test(name));
  if (missing.length) {
    const [bucket, imagesBinding] = await Promise.all([media(), images()]);
    for (const [name, object] of missing) {
      try {
        const body = await bucket.get(object.key);
        if (!body) continue;
        const info = await imagesBinding.info(body.body);
        if (!("width" in info)) continue;
        added.push({ name, width: info.width, height: info.height, bytes: object.size, uploadedAt: object.uploaded.toISOString() });
      } catch {
        /* not a readable image; leave it out */
      }
    }
  }
  if (added.length) {
    await addToUploadIndex(added);
    added.forEach((a) => byName.set(a.name, a));
  }

  return [...byName.values()]
    .filter((r) => stored.has(r.name))
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
    .map((r) => ({ src: `/uploads/${r.name}`, width: r.width, height: r.height, name: r.name, builtin: false }));
}

/** Every image an admin can pick: their uploads (newest first), then the images shipped with the site. */
export async function listMedia(): Promise<MediaItem[]> {
  return [...(await uploadedImages()), ...builtinImages()];
}
