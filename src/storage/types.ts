/**
 * Where the site keeps its data: the content file, backups and uploaded images.
 * Two drivers implement this — DigitalOcean Spaces (with its CDN) for real use, and local disk for
 * development. `getStore()` picks one from the environment.
 *
 * Keys are slash-separated paths such as `content.json` or `uploads/photo.jpg`.
 */
export type StoredObject = { key: string; size: number; lastModified: Date };

export type PutOptions = {
  contentType?: string;
  cacheControl?: string;
  /** Make the object publicly readable (uploaded images, so the CDN can serve them). Everything else stays private. */
  public?: boolean;
};

export interface ObjectStore {
  readonly kind: "local" | "spaces";
  /** Human-readable summary for the admin dashboard, e.g. "DigitalOcean Spaces — my-bucket (blr1), CDN …". */
  readonly description: string;
  /** The object's bytes, or `null` if it doesn't exist. Other failures throw. */
  get(key: string): Promise<Buffer | null>;
  put(key: string, body: Buffer | string, options?: PutOptions): Promise<void>;
  /** Deleting something that isn't there is not an error. */
  delete(key: string): Promise<void>;
  /** Objects whose key starts with `prefix`, in no particular order. */
  list(prefix: string): Promise<StoredObject[]>;
  /** The address visitors can load this object from (the CDN), or `null` if there isn't one. */
  publicUrl(key: string): string | null;
}

const SAFE_KEY = /^[A-Za-z0-9][A-Za-z0-9._\-/]*$/;

/** Rejects keys that could escape the storage root or contain odd characters. */
export function assertSafeKey(key: string): string {
  if (!SAFE_KEY.test(key) || key.split("/").some((part) => part === "" || part === "." || part === "..")) {
    throw new Error(`Unsafe storage key: ${key}`);
  }
  return key;
}
