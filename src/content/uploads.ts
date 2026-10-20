import { getStore } from "@/storage";

/**
 * Uploaded images live in storage under `uploads/<name>`; the site refers to them as `/uploads/<name>`.
 * `media.json` keeps each image's size, so the image library never has to download files to measure them.
 */
export type UploadRecord = { name: string; width: number; height: number; bytes: number; uploadedAt: string };

const INDEX_KEY = "media.json";

export const UPLOAD_PREFIX_KEY = "uploads/";
export const uploadKey = (name: string) => `${UPLOAD_PREFIX_KEY}${name}`;

export const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

const NAME = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

/** Only plain file names: no folders, no `..`. */
export const isUploadName = (name: string) => NAME.test(name) && !name.includes("..");

/** `/uploads/foo.jpg` → `foo.jpg`, or null for anything else. */
export function uploadNameFromUrl(url: string): string | null {
  const match = /^\/uploads\/([^/]+)$/.exec(url);
  return match && isUploadName(match[1]) ? match[1] : null;
}

const isRecord = (r: unknown): r is UploadRecord =>
  !!r && typeof r === "object" && typeof (r as UploadRecord).name === "string" && typeof (r as UploadRecord).width === "number";

export async function readUploadIndex(): Promise<UploadRecord[]> {
  const raw = await getStore().get(INDEX_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw.toString("utf8"));
    return Array.isArray(parsed) ? parsed.filter(isRecord) : [];
  } catch {
    return [];
  }
}

// Index changes run one at a time so concurrent uploads don't overwrite each other.
let queue: Promise<unknown> = Promise.resolve();

export function updateUploadIndex(mutate: (records: UploadRecord[]) => UploadRecord[]): Promise<UploadRecord[]> {
  const run = async () => {
    const next = mutate(await readUploadIndex());
    await getStore().put(INDEX_KEY, JSON.stringify(next, null, 2), { contentType: "application/json", cacheControl: "no-store" });
    return next;
  };
  const result = queue.then(run, run);
  queue = result.catch(() => undefined);
  return result;
}

/** True when uploads are served from a CDN (DigitalOcean Spaces with `DO_SPACES_CDN_URL`). */
export const hasCdn = () => getStore().publicUrl(uploadKey("x")) !== null;

/**
 * Copy of `value` with every `/uploads/<name>` replaced by that file's CDN address. Content is stored with
 * plain `/uploads/...` paths so it stays portable; the public site reads it through this, so visitors load
 * images from the CDN. Without a CDN (local development) the value is returned unchanged.
 */
export function withCdnUploadUrls<T>(value: T): T {
  const store = getStore();
  if (!hasCdn()) return value;
  const swap = (v: unknown): unknown => {
    if (typeof v === "string") {
      const name = uploadNameFromUrl(v);
      return name ? (store.publicUrl(uploadKey(name)) ?? v) : v;
    }
    if (Array.isArray(v)) return v.map(swap);
    if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, swap(x)]));
    return v;
  };
  return swap(value) as T;
}

/** Deletes uploaded files and forgets them in the index. */
export async function deleteUploads(names: string[]): Promise<void> {
  if (names.length === 0) return;
  const store = getStore();
  await Promise.all(names.map((name) => store.delete(uploadKey(name))));
  await updateUploadIndex((records) => records.filter((r) => !names.includes(r.name)));
}
