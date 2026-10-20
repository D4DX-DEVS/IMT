import { randomBytes } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import sharp, { type OutputInfo } from "sharp";
import { getStore } from "@/storage";
import { slugify } from "./schema";
import { MIME_BY_EXT, hasCdn, readUploadIndex, updateUploadIndex, uploadKey, UPLOAD_PREFIX_KEY, type UploadRecord } from "./uploads";

/** An upload problem whose message is safe to show to the admin. */
export class UploadError extends Error {}

export type MediaItem = { src: string; width: number; height: number; name: string; builtin: boolean };

/** Kept under the 10 MB request-body buffer the proxy applies, with room for multipart overhead. */
export const MAX_UPLOAD_MB = 8;
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;
const MAX_EDGE = 2400;

const EXTENSIONS: Record<string, string> = { jpeg: "jpg", png: "png", webp: "webp", avif: "avif" };

/**
 * Validates an uploaded image by decoding it (the filename and declared type are not trusted),
 * downsizes anything larger than 2400px, strips metadata such as GPS location, and stores it
 * under a unique name.
 */
export async function saveUpload(input: Buffer, originalName: string): Promise<MediaItem> {
  if (input.length === 0) throw new UploadError("The file is empty.");
  if (input.length > MAX_UPLOAD_BYTES) throw new UploadError(`That image is larger than ${MAX_UPLOAD_MB} MB.`);

  let image = sharp(input, { limitInputPixels: 80_000_000 });
  let format: string | undefined;
  try {
    const meta = await image.metadata();
    // libvips reports AVIF files as "heif" with AV1 compression; HEIC photos (HEVC) are not supported.
    format = meta.format === "heif" ? (meta.compression === "av1" ? "avif" : "heic") : meta.format;
  } catch {
    throw new UploadError("That file is not a readable image.");
  }
  if (!format || !(format in EXTENSIONS)) {
    throw new UploadError("Use a JPG, PNG, WebP or AVIF image.");
  }

  image = image.rotate().resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true });
  if (format === "jpeg") image = image.jpeg({ quality: 85, mozjpeg: true });
  else if (format === "png") image = image.png({ compressionLevel: 9 });
  else if (format === "webp") image = image.webp({ quality: 85 });
  else image = image.avif({ quality: 60 });

  let output: { data: Buffer; info: OutputInfo };
  try {
    output = await image.toBuffer({ resolveWithObject: true });
  } catch {
    throw new UploadError("That image could not be processed.");
  }

  const base = slugify(path.parse(originalName).name).slice(0, 40) || "image";
  const ext = EXTENSIONS[format];
  const name = `${Date.now().toString(36)}-${randomBytes(4).toString("hex")}-${base}.${ext}`;

  await getStore().put(uploadKey(name), output.data, {
    contentType: MIME_BY_EXT[`.${ext}`],
    // With a CDN the file must be publicly readable; everything else in the Space stays private.
    public: hasCdn(),
    // The name is unique and never reused, so browsers and CDNs may keep the file forever.
    cacheControl: "public, max-age=31536000, immutable",
  });
  const { width, height } = output.info;
  await updateUploadIndex((records) => [
    ...records,
    { name, width, height, bytes: output.data.length, uploadedAt: new Date().toISOString() },
  ]);

  return { src: `/uploads/${name}`, width, height, name, builtin: false };
}

const IMAGE_FILE = /\.(jpe?g|png|webp|avif)$/i;
const dimensionCache = new Map<string, { width: number; height: number }>();

async function builtinImages(): Promise<MediaItem[]> {
  const dir = path.join(process.cwd(), "public", "images");
  let names: string[];
  try {
    names = (await fs.readdir(dir)).filter((f) => IMAGE_FILE.test(f)).sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
  const items = await Promise.all(
    names.map(async (name): Promise<MediaItem | null> => {
      try {
        let size = dimensionCache.get(name);
        if (!size) {
          const { width, height } = await sharp(path.join(dir, name)).metadata();
          size = { width: width ?? 1, height: height ?? 1 };
          dimensionCache.set(name, size);
        }
        return { src: `/images/${name}`, ...size, name, builtin: true };
      } catch {
        return null;
      }
    }),
  );
  return items.filter((i): i is MediaItem => i !== null);
}

/** Uploaded images (newest first). Files that exist in storage but not in the index are measured and added. */
async function uploadedImages(): Promise<MediaItem[]> {
  const store = getStore();
  const [records, objects] = await Promise.all([readUploadIndex(), store.list(UPLOAD_PREFIX_KEY)]);

  const byName = new Map(records.map((r) => [r.name, r]));
  const stored = new Map(objects.map((o) => [o.key.slice(UPLOAD_PREFIX_KEY.length), o]));

  const added: UploadRecord[] = [];
  for (const [name, object] of stored) {
    if (byName.has(name) || !IMAGE_FILE.test(name)) continue;
    try {
      const bytes = await store.get(uploadKey(name));
      if (!bytes) continue;
      const { width, height } = await sharp(bytes).metadata();
      added.push({ name, width: width ?? 1, height: height ?? 1, bytes: object.size, uploadedAt: object.lastModified.toISOString() });
    } catch {
      /* not a readable image; leave it out */
    }
  }
  if (added.length) {
    await updateUploadIndex((current) => [...current, ...added.filter((a) => !current.some((c) => c.name === a.name))]);
    added.forEach((a) => byName.set(a.name, a));
  }

  return [...byName.values()]
    .filter((r) => stored.has(r.name))
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
    .map((r) => ({ src: `/uploads/${r.name}`, width: r.width, height: r.height, name: r.name, builtin: false }));
}

/** Every image an admin can pick: their uploads (newest first), then the images shipped with the site. */
export async function listMedia(): Promise<MediaItem[]> {
  const [uploads, builtin] = await Promise.all([uploadedImages(), builtinImages()]);
  return [...uploads, ...builtin];
}
