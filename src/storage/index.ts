import path from "node:path";
import { createLocalStore } from "./local";
import { createSpacesStore, type SpacesConfig } from "./spaces";
import type { ObjectStore } from "./types";

export type { ObjectStore, StoredObject } from "./types";

/** `blr1.digitaloceanspaces.com` or `https://blr1.digitaloceanspaces.com/` → `https://blr1.digitaloceanspaces.com`. */
function normalizeUrl(raw: string, name: string): URL {
  try {
    return new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    throw new Error(`${name} is not a valid address: “${raw}”.`);
  }
}

/**
 * DigitalOcean Spaces settings from the environment:
 *
 *   DO_SPACES_KEY, DO_SPACES_SECRET   the Spaces access key pair
 *   DO_SPACES_BUCKET                  the Space's name
 *   DO_SPACES_ENDPOINT                e.g. https://blr1.digitaloceanspaces.com (or give DO_SPACES_REGION instead)
 *   DO_SPACES_REGION                  e.g. blr1
 *   DO_SPACES_CDN_URL                 the Space's CDN address; uploaded images are served from here
 *   DO_SPACES_FOLDER                  a folder inside the Space to keep everything in
 *
 * Returns null when none are set (use local disk) and throws when only some are — better to fail
 * loudly than to quietly fall back to a disk that a platform like App Platform wipes on every deploy.
 */
function spacesConfigFromEnv(): SpacesConfig | null {
  const env = process.env;
  const names = ["DO_SPACES_KEY", "DO_SPACES_SECRET", "DO_SPACES_BUCKET", "DO_SPACES_ENDPOINT", "DO_SPACES_REGION", "DO_SPACES_CDN_URL", "DO_SPACES_FOLDER"];
  if (!names.some((name) => env[name])) return null;

  const missing = [
    !env.DO_SPACES_KEY && "DO_SPACES_KEY",
    !env.DO_SPACES_SECRET && "DO_SPACES_SECRET",
    !env.DO_SPACES_BUCKET && "DO_SPACES_BUCKET",
    !env.DO_SPACES_ENDPOINT && !env.DO_SPACES_REGION && "DO_SPACES_ENDPOINT (or DO_SPACES_REGION)",
  ].filter(Boolean);
  if (missing.length) {
    throw new Error(`DigitalOcean Spaces is only partly configured. Missing: ${missing.join(", ")}.`);
  }

  const bucket = env.DO_SPACES_BUCKET!;
  const region = env.DO_SPACES_REGION || undefined;

  // The endpoint is the region's address, without the bucket name. Tolerate a missing scheme or a
  // bucket-prefixed host (`my-space.blr1.digitaloceanspaces.com`), which people often paste from the dashboard.
  const endpointUrl = env.DO_SPACES_ENDPOINT ? normalizeUrl(env.DO_SPACES_ENDPOINT, "DO_SPACES_ENDPOINT") : new URL(`https://${region}.digitaloceanspaces.com`);
  if (endpointUrl.hostname.startsWith(`${bucket}.`)) endpointUrl.hostname = endpointUrl.hostname.slice(bucket.length + 1);

  const cdn = env.DO_SPACES_CDN_URL ? normalizeUrl(env.DO_SPACES_CDN_URL, "DO_SPACES_CDN_URL") : null;
  const folder = (env.DO_SPACES_FOLDER ?? "").trim().replace(/^\/+|\/+$/g, "");

  return {
    accessKey: env.DO_SPACES_KEY!,
    secretKey: env.DO_SPACES_SECRET!,
    bucket,
    endpoint: endpointUrl.origin,
    region,
    cdnUrl: cdn ? (cdn.origin + cdn.pathname).replace(/\/+$/, "") : undefined,
    folder: folder ? `${folder}/` : "",
    // Only for local S3 emulators such as MinIO, which don't use bucket sub-domains. Not needed for DigitalOcean.
    forcePathStyle: env.DO_SPACES_FORCE_PATH_STYLE === "true",
  };
}

let store: ObjectStore | undefined;

/** The storage the site uses: DigitalOcean Spaces if configured, otherwise local disk (`DATA_DIR` or ./data). */
export function getStore(): ObjectStore {
  if (store) return store;
  const spaces = spacesConfigFromEnv();
  if (spaces) {
    store = createSpacesStore(spaces);
  } else {
    const root = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(process.cwd(), "data");
    store = createLocalStore(root);
    if (process.env.NODE_ENV === "production") {
      console.warn(`[storage] Using ${store.description}. Set the DO_SPACES_* variables to store content and uploads in DigitalOcean Spaces.`);
    }
  }
  return store;
}

/** A plain-English explanation of a storage failure, for the admin dashboard. */
export function explainStorageError(error: unknown): string {
  const e = error as { name?: string; message?: string; code?: string; $metadata?: { httpStatusCode?: number } };
  const status = e.$metadata?.httpStatusCode;
  if (e.name === "InvalidAccessKeyId" || e.name === "SignatureDoesNotMatch" || status === 403) {
    return "DigitalOcean rejected the access key or secret. Check DO_SPACES_KEY and DO_SPACES_SECRET, and that the key can write to this Space.";
  }
  if (e.name === "NoSuchBucket") return "That Space wasn’t found. Check DO_SPACES_BUCKET and DO_SPACES_ENDPOINT (or DO_SPACES_REGION).";
  if (e.code === "ENOTFOUND" || e.code === "ECONNREFUSED" || e.code === "ETIMEDOUT" || e.name === "TimeoutError") {
    return "Could not reach DigitalOcean Spaces. Check DO_SPACES_ENDPOINT (or DO_SPACES_REGION) and the server’s network access.";
  }
  if (e.code === "EACCES" || e.code === "EROFS") return "The server isn’t allowed to write to its data folder.";
  return e.message ? `Storage error: ${e.message}` : "Storage check failed.";
}
