import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { assertSafeKey, type ObjectStore, type StoredObject } from "./types";

export type SpacesConfig = {
  accessKey: string;
  secretKey: string;
  bucket: string;
  /** e.g. `https://blr1.digitaloceanspaces.com` (no bucket name in it). */
  endpoint: string;
  /** e.g. `blr1`. Informational; the endpoint is what selects the data centre. */
  region?: string;
  /** The Space's CDN address, e.g. `https://my-space.blr1.cdn.digitaloceanspaces.com`. Uploads are served from here. */
  cdnUrl?: string;
  /** Folder inside the Space, always empty or ending in `/`. */
  folder: string;
  forcePathStyle: boolean;
};

const isNotFound = (error: unknown) => {
  const e = error as { name?: string; $metadata?: { httpStatusCode?: number } };
  return e.name === "NoSuchKey" || e.name === "NotFound" || e.$metadata?.httpStatusCode === 404;
};

/**
 * DigitalOcean Spaces over its S3-compatible API. Content, backups and indexes are private objects the
 * site reads itself; uploaded images are public objects that visitors load from the Space's CDN.
 */
export function createSpacesStore(cfg: SpacesConfig): ObjectStore {
  const client = new S3Client({
    // Spaces signs requests as us-east-1 whatever its real region; the endpoint picks the data centre.
    region: "us-east-1",
    endpoint: cfg.endpoint,
    forcePathStyle: cfg.forcePathStyle,
    credentials: { accessKeyId: cfg.accessKey, secretAccessKey: cfg.secretKey },
    // Newer SDK versions add checksum headers by default, which Spaces and other S3 clones can reject.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
  const full = (key: string) => `${cfg.folder}${assertSafeKey(key)}`;

  const parts = [`${cfg.bucket}${cfg.region ? ` (${cfg.region})` : ""}`];
  if (cfg.folder) parts.push(`folder “${cfg.folder}”`);
  parts.push(cfg.cdnUrl ? `CDN ${cfg.cdnUrl}` : "no CDN address set");

  return {
    kind: "spaces",
    description: `DigitalOcean Spaces — ${parts.join(", ")}`,

    async get(key) {
      try {
        const res = await client.send(new GetObjectCommand({ Bucket: cfg.bucket, Key: full(key) }));
        return Buffer.from(await res.Body!.transformToByteArray());
      } catch (error) {
        if (isNotFound(error)) return null;
        throw error;
      }
    },

    async put(key, body, options) {
      await client.send(
        new PutObjectCommand({
          Bucket: cfg.bucket,
          Key: full(key),
          Body: typeof body === "string" ? Buffer.from(body, "utf8") : body,
          ContentType: options?.contentType,
          CacheControl: options?.cacheControl,
          ACL: options?.public ? "public-read" : undefined,
        }),
      );
    },

    async delete(key) {
      await client.send(new DeleteObjectCommand({ Bucket: cfg.bucket, Key: full(key) }));
    },

    async list(prefix) {
      const found: StoredObject[] = [];
      let token: string | undefined;
      do {
        const res = await client.send(
          new ListObjectsV2Command({ Bucket: cfg.bucket, Prefix: `${cfg.folder}${prefix}`, ContinuationToken: token }),
        );
        for (const item of res.Contents ?? []) {
          if (!item.Key) continue;
          found.push({ key: item.Key.slice(cfg.folder.length), size: item.Size ?? 0, lastModified: item.LastModified ?? new Date(0) });
        }
        token = res.IsTruncated ? res.NextContinuationToken : undefined;
      } while (token);
      return found;
    },

    publicUrl: (key) => (cfg.cdnUrl ? `${cfg.cdnUrl}/${full(key)}` : null),
  };
}
