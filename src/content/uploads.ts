import { db, media } from "@/storage";

/**
 * Uploaded images live in the R2 bucket under `uploads/<name>`; the site refers to them as `/uploads/<name>`
 * and serves them from its own /uploads route. The D1 table `media` keeps each image's size, so the image
 * library never has to download files to measure them.
 */
export type UploadRecord = { name: string; width: number; height: number; bytes: number; uploadedAt: string };

export const UPLOAD_PREFIX_KEY = "uploads/";
export const uploadKey = (name: string): string => `${UPLOAD_PREFIX_KEY}${name}`;

export const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

const NAME = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

/** Only plain file names: no folders, no `..`. */
export const isUploadName = (name: string): boolean => NAME.test(name) && !name.includes("..");

/** `/uploads/foo.jpg` → `foo.jpg`, or null for anything else. */
export function uploadNameFromUrl(url: string): string | null {
  const match = /^\/uploads\/([^/?#]+)$/.exec(url);
  return match && isUploadName(match[1]) ? match[1] : null;
}

type MediaRow = { name: string; width: number; height: number; bytes: number; uploaded_at: string };

export async function readUploadIndex(): Promise<UploadRecord[]> {
  const { results } = await (await db())
    .prepare("SELECT name, width, height, bytes, uploaded_at FROM media")
    .all<MediaRow>();
  return results.map((r) => ({ name: r.name, width: r.width, height: r.height, bytes: r.bytes, uploadedAt: r.uploaded_at }));
}

/** Adds (or replaces) entries in the index. */
export async function addToUploadIndex(records: UploadRecord[]): Promise<void> {
  if (records.length === 0) return;
  const database = await db();
  await database.batch(
    records.map((r) =>
      database
        .prepare("INSERT OR REPLACE INTO media (name, width, height, bytes, uploaded_at) VALUES (?, ?, ?, ?, ?)")
        .bind(r.name, r.width, r.height, r.bytes, r.uploadedAt),
    ),
  );
}

/** Deletes uploaded files and forgets them in the index. */
export async function deleteUploads(names: string[]): Promise<void> {
  if (names.length === 0) return;
  await (await media()).delete(names.map(uploadKey));
  const database = await db();
  await database.batch(names.map((name) => database.prepare("DELETE FROM media WHERE name = ?").bind(name)));
}
