import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Where the site keeps its data on Cloudflare:
 *
 *   DB      D1 database: the content (one JSON document), its backups, the uploaded-image index and the login throttle
 *   MEDIA   R2 bucket: the uploaded image files, under `uploads/<name>`
 *   IMAGES  Cloudflare Images: resizes uploads, and serves resized copies of them to visitors
 *
 * Bindings are declared in wrangler.jsonc. In `next dev` they are local emulations (in `.wrangler/state`);
 * in production they are the real resources of the Cloudflare account the worker is deployed to.
 *
 * Server only — never import this from a client component.
 */
export type SiteBindings = { db: D1Database; media: R2Bucket; images: ImagesBinding };

export async function bindings(): Promise<SiteBindings> {
  const { env } = await getCloudflareContext({ async: true });
  const { DB, MEDIA, IMAGES } = env;
  if (!DB || !MEDIA || !IMAGES) {
    const missing = [!DB && "DB (D1)", !MEDIA && "MEDIA (R2)", !IMAGES && "IMAGES (Cloudflare Images)"].filter(Boolean);
    throw new StorageConfigError(`The worker is missing these bindings: ${missing.join(", ")}. Check wrangler.jsonc.`);
  }
  return { db: DB, media: MEDIA, images: IMAGES };
}

export const db = async (): Promise<D1Database> => (await bindings()).db;
export const media = async (): Promise<R2Bucket> => (await bindings()).media;
export const images = async (): Promise<ImagesBinding> => (await bindings()).images;

/** A storage setup problem whose message is safe to show to the admin. */
export class StorageConfigError extends Error {}

export const STORAGE_DESCRIPTION = "Cloudflare — content in D1 (imt-db), images in R2 (imt-media)";

/** A plain-English explanation of a storage failure, for the admin dashboard. */
export function explainStorageError(error: unknown): string {
  if (error instanceof StorageConfigError) return error.message;
  const message = error instanceof Error ? error.message : String(error ?? "");
  if (/no such table/i.test(message)) {
    return "The database exists but its tables haven't been created. Run `npm run db:migrate:remote` (or `db:migrate:local` in development).";
  }
  if (/D1_ERROR|D1 /i.test(message)) return `Database error: ${message}`;
  if (/R2|bucket/i.test(message)) return `Image storage (R2) error: ${message}`;
  return message ? `Storage error: ${message}` : "Storage check failed.";
}
