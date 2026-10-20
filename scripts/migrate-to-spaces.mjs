#!/usr/bin/env node
/**
 * Helpers for moving the site onto DigitalOcean Spaces. Reads the same DO_SPACES_* settings as the site
 * (from .env.local or the environment).
 *
 *   npm run storage:migrate                          copy the local data folder into the Space
 *   npm run storage:migrate -- --dry-run             show what would be copied
 *   npm run storage:migrate -- --overwrite           replace content.json in the Space with the local one
 *   npm run storage:migrate -- --make-uploads-public make every uploaded image in the Space publicly readable
 *                                                    (needed for the CDN if images were uploaded before it was set up)
 *
 * The local folder is `DATA_DIR`, or ./data. Run the copy once when switching from local disk to Spaces.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { GetObjectCommand, ListObjectsV2Command, PutObjectAclCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const overwrite = args.has("--overwrite");
const makePublic = args.has("--make-uploads-public");
const env = process.env;

const missing = [
  !env.DO_SPACES_KEY && "DO_SPACES_KEY",
  !env.DO_SPACES_SECRET && "DO_SPACES_SECRET",
  !env.DO_SPACES_BUCKET && "DO_SPACES_BUCKET",
  !env.DO_SPACES_ENDPOINT && !env.DO_SPACES_REGION && "DO_SPACES_ENDPOINT (or DO_SPACES_REGION)",
].filter(Boolean);
if (missing.length) {
  console.error(`Set these in .env.local (or the environment) first: ${missing.join(", ")}`);
  process.exit(1);
}

const source = env.DATA_DIR ? path.resolve(env.DATA_DIR) : path.join(process.cwd(), "data");
const folderRaw = (env.DO_SPACES_FOLDER ?? "").trim().replace(/^\/+|\/+$/g, "");
const folder = folderRaw ? `${folderRaw}/` : "";
const bucket = env.DO_SPACES_BUCKET;
const hasCdn = Boolean(env.DO_SPACES_CDN_URL);

const endpoint = new URL(/^https?:\/\//i.test(env.DO_SPACES_ENDPOINT ?? "") ? env.DO_SPACES_ENDPOINT : env.DO_SPACES_ENDPOINT ? `https://${env.DO_SPACES_ENDPOINT}` : `https://${env.DO_SPACES_REGION}.digitaloceanspaces.com`);
if (endpoint.hostname.startsWith(`${bucket}.`)) endpoint.hostname = endpoint.hostname.slice(bucket.length + 1);

const client = new S3Client({
  region: "us-east-1",
  endpoint: endpoint.origin,
  forcePathStyle: env.DO_SPACES_FORCE_PATH_STYLE === "true",
  credentials: { accessKeyId: env.DO_SPACES_KEY, secretAccessKey: env.DO_SPACES_SECRET },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

const MIME = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".avif": "image/avif", ".json": "application/json" };

async function remoteGet(key) {
  try {
    const res = await client.send(new GetObjectCommand({ Bucket: bucket, Key: folder + key }));
    return Buffer.from(await res.Body.transformToByteArray());
  } catch (error) {
    if (error.name === "NoSuchKey" || error.$metadata?.httpStatusCode === 404) return null;
    throw error;
  }
}

async function remotePut(key, body, { cacheControl, isPublic } = {}) {
  console.log(`${dryRun ? "would copy" : "copying   "} ${key}${isPublic ? "  (public)" : ""}`);
  if (dryRun) return;
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: folder + key,
      Body: body,
      ContentType: MIME[path.extname(key).toLowerCase()] ?? "application/octet-stream",
      CacheControl: cacheControl,
      ACL: isPublic ? "public-read" : undefined,
    }),
  );
}

async function filesIn(dir) {
  try {
    return (await fs.readdir(dir, { withFileTypes: true })).filter((e) => e.isFile() && !e.name.endsWith(".tmp")).map((e) => e.name);
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function makeUploadsPublic() {
  let token;
  let count = 0;
  do {
    const res = await client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: `${folder}uploads/`, ContinuationToken: token }));
    for (const item of res.Contents ?? []) {
      console.log(`${dryRun ? "would make public" : "making public   "} ${item.Key.slice(folder.length)}`);
      if (!dryRun) await client.send(new PutObjectAclCommand({ Bucket: bucket, Key: item.Key, ACL: "public-read" }));
      count += 1;
    }
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);
  console.log(count ? `\n${dryRun ? "Dry run only." : "Done."} ${count} image(s).` : "\nNo uploaded images found in the Space.");
}

async function copyLocalData() {
  let content;
  try {
    content = await fs.readFile(path.join(source, "content.json"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  if (content && !overwrite && (await remoteGet("content.json"))) {
    console.error("The Space already has a content.json. Nothing was copied.\nUse --overwrite to replace it with the local one.");
    process.exit(1);
  }

  // Content refers to images as /uploads/<name>, so it needs no changes to work from the Space.
  if (content) await remotePut("content.json", content, { cacheControl: "no-store" });
  else console.log("No local content.json — the site is still on its default content, nothing to copy there.");

  for (const name of await filesIn(path.join(source, "backups"))) {
    await remotePut(`backups/${name}`, await fs.readFile(path.join(source, "backups", name)));
  }

  // Uploads (public when there is a CDN), plus the index of their sizes that the admin's image library reads.
  const index = JSON.parse((await remoteGet("media.json"))?.toString("utf8") ?? "[]");
  for (const name of await filesIn(path.join(source, "uploads"))) {
    const file = path.join(source, "uploads", name);
    const bytes = await fs.readFile(file);
    await remotePut(`uploads/${name}`, bytes, { cacheControl: "public, max-age=31536000, immutable", isPublic: hasCdn });
    try {
      const { width, height } = await sharp(bytes).metadata();
      const stat = await fs.stat(file);
      const record = { name, width: width ?? 1, height: height ?? 1, bytes: bytes.length, uploadedAt: stat.mtime.toISOString() };
      const at = index.findIndex((r) => r.name === name);
      if (at >= 0) index[at] = record;
      else index.push(record);
    } catch {
      console.warn(`  (could not read ${name} as an image; copied without a size entry)`);
    }
  }
  await remotePut("media.json", JSON.stringify(index, null, 2), { cacheControl: "no-store" });

  console.log(dryRun ? "\nDry run only — nothing was changed." : "\nDone. Restart the site with the DO_SPACES_* settings and it will use the Space.");
}

try {
  console.log(`${makePublic ? "In" : `From ${source}\nTo  `} ${bucket}${env.DO_SPACES_REGION ? ` (${env.DO_SPACES_REGION})` : ""}${folder ? `, folder ${folder}` : ""}\n`);
  if (makePublic) await makeUploadsPublic();
  else await copyLocalData();
} catch (error) {
  console.error("\nFailed:", error.name === "InvalidAccessKeyId" || error.name === "SignatureDoesNotMatch" ? "DigitalOcean rejected the key or secret." : error.message ?? error);
  process.exit(1);
}
