#!/usr/bin/env node
/**
 * One-off copy of the site's data from DigitalOcean Spaces to Cloudflare:
 *
 *   content.json      -> D1 table `content`
 *   backups/*.json    -> D1 table `content_backups` (newest 30)
 *   media.json        -> D1 table `media` (images missing from it are measured with sharp)
 *   uploads/*         -> R2 bucket `imt-media`, same keys
 *
 * Reads the DO_SPACES_* settings from .env / .env.local (as the old site did) and uses wrangler, so it
 * writes to whichever Cloudflare account `npx wrangler whoami` shows.
 *
 *   npm run storage:migrate -- --dry-run     list what would be copied, change nothing
 *   npm run storage:migrate -- --local       copy into the local dev bindings (.wrangler/state) instead
 *   npm run storage:migrate                  copy into the real D1 database and R2 bucket
 *   npm run storage:migrate -- --overwrite   replace content that is already in D1
 *
 * Run `npm run db:migrate:remote` (or :local) first so the tables exist.
 */
import { execFileSync } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { GetObjectCommand, ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";

const DB_NAME = "imt-db";
const BUCKET = "imt-media";
const MAX_BACKUPS = 30;

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const overwrite = args.has("--overwrite");
const target = args.has("--local") ? "--local" : "--remote";
const env = process.env;

const missing = [
  !env.DO_SPACES_KEY && "DO_SPACES_KEY",
  !env.DO_SPACES_SECRET && "DO_SPACES_SECRET",
  !env.DO_SPACES_BUCKET && "DO_SPACES_BUCKET",
  !env.DO_SPACES_ENDPOINT && !env.DO_SPACES_REGION && "DO_SPACES_ENDPOINT (or DO_SPACES_REGION)",
].filter(Boolean);
if (missing.length) {
  console.error(`Set these in .env / .env.local (or the environment) first: ${missing.join(", ")}`);
  process.exit(1);
}

const folderRaw = (env.DO_SPACES_FOLDER ?? "").trim().replace(/^\/+|\/+$/g, "");
const folder = folderRaw ? `${folderRaw}/` : "";
const spacesBucket = env.DO_SPACES_BUCKET;
const endpointRaw = env.DO_SPACES_ENDPOINT
  ? /^https?:\/\//i.test(env.DO_SPACES_ENDPOINT) ? env.DO_SPACES_ENDPOINT : `https://${env.DO_SPACES_ENDPOINT}`
  : `https://${env.DO_SPACES_REGION}.digitaloceanspaces.com`;
const endpoint = new URL(endpointRaw);
if (endpoint.hostname.startsWith(`${spacesBucket}.`)) endpoint.hostname = endpoint.hostname.slice(spacesBucket.length + 1);

const s3 = new S3Client({
  region: "us-east-1",
  endpoint: endpoint.origin,
  forcePathStyle: env.DO_SPACES_FORCE_PATH_STYLE === "true",
  credentials: { accessKeyId: env.DO_SPACES_KEY, secretAccessKey: env.DO_SPACES_SECRET },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

const MIME = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".avif": "image/avif" };
const UPLOAD_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

async function list(prefix) {
  const found = [];
  let token;
  do {
    const res = await s3.send(new ListObjectsV2Command({ Bucket: spacesBucket, Prefix: folder + prefix, ContinuationToken: token }));
    for (const item of res.Contents ?? []) {
      if (item.Key) found.push({ key: item.Key.slice(folder.length), size: item.Size ?? 0, lastModified: item.LastModified ?? new Date() });
    }
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);
  return found;
}

async function get(key) {
  try {
    const res = await s3.send(new GetObjectCommand({ Bucket: spacesBucket, Key: folder + key }));
    return Buffer.from(await res.Body.transformToByteArray());
  } catch (error) {
    if (error?.name === "NoSuchKey" || error?.$metadata?.httpStatusCode === 404) return null;
    throw error;
  }
}

const isWindows = process.platform === "win32";
// On Windows npx is a .cmd file, which needs a shell; quote arguments with spaces for it.
const quote = (arg) => (isWindows && /[\s"*()&|<>^]/.test(arg) ? `"${arg.replaceAll('"', '\\"')}"` : arg);
function wrangler(...rest) {
  return execFileSync(isWindows ? "npx.cmd" : "npx", ["wrangler", ...rest].map(quote), {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    shell: isWindows,
    maxBuffer: 64 * 1024 * 1024,
  });
}

const sql = (value) => (value === null || value === undefined ? "NULL" : typeof value === "number" ? String(value) : `'${String(value).replaceAll("'", "''")}'`);

console.log(`Source: Spaces bucket "${spacesBucket}" at ${endpoint.origin}${folder ? `, folder "${folder}"` : ""}`);
console.log(`Target: D1 "${DB_NAME}" and R2 "${BUCKET}" (${target === "--local" ? "local dev state" : "Cloudflare account"})${dryRun ? " — DRY RUN" : ""}\n`);

// ---- What is in the Space ----
const contentObj = (await list("content.json")).find((o) => o.key === "content.json");
const content = contentObj ? await get("content.json") : null;
if (content) JSON.parse(content.toString("utf8")); // refuse to copy a broken file

const backups = (await list("backups/")).filter((o) => o.key.endsWith(".json")).sort((a, b) => a.key.localeCompare(b.key)).slice(-MAX_BACKUPS);
const uploads = (await list("uploads/")).filter((o) => {
  const name = o.key.slice("uploads/".length);
  return UPLOAD_NAME.test(name) && !name.includes("..") && MIME[path.extname(name).toLowerCase()];
});
const mediaRaw = await get("media.json");
let mediaIndex = [];
try {
  mediaIndex = mediaRaw ? JSON.parse(mediaRaw.toString("utf8")).filter((r) => r && typeof r.name === "string") : [];
} catch {
  console.warn("media.json is not valid JSON; every image will be measured instead.");
}

console.log(`content.json: ${content ? `${content.length} bytes, saved ${contentObj.lastModified.toISOString()}` : "not found (the site will start from its defaults)"}`);
console.log(`backups:      ${backups.length}`);
console.log(`uploads:      ${uploads.length} images, ${(uploads.reduce((n, o) => n + o.size, 0) / 1024 / 1024).toFixed(1)} MB`);
console.log(`media.json:   ${mediaIndex.length} entries\n`);
if (content && content.length > 90_000) {
  console.warn("Warning: content.json is close to D1's 100 KB statement limit; the import may fail.\n");
}
if (dryRun) process.exit(0);

// ---- Refuse to clobber content that is already in D1 ----
const existing = JSON.parse(wrangler("d1", "execute", DB_NAME, target, "--json", "--command", "SELECT COUNT(*) AS n FROM content"));
if (existing[0]?.results?.[0]?.n > 0 && !overwrite) {
  console.error("D1 already has content. Run again with --overwrite to replace it.");
  process.exit(1);
}

// ---- Uploads -> R2, measuring any image the index doesn't know ----
const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "imt-migrate-"));
const known = new Map(mediaIndex.map((r) => [r.name, r]));
const records = [];
let copied = 0;
for (const object of uploads) {
  const name = object.key.slice("uploads/".length);
  const bytes = await get(object.key);
  if (!bytes) continue;
  const file = path.join(tmp, name);
  await fs.writeFile(file, bytes);
  wrangler(
    "r2", "object", "put", `${BUCKET}/uploads/${name}`, target,
    "--file", file,
    "--content-type", MIME[path.extname(name).toLowerCase()],
    "--cache-control", "public, max-age=31536000, immutable",
  );
  await fs.rm(file);

  let record = known.get(name);
  if (!record || !Number.isFinite(record.width) || !Number.isFinite(record.height)) {
    const { width, height } = await sharp(bytes).metadata();
    record = { name, width: width ?? 1, height: height ?? 1, bytes: bytes.length, uploadedAt: object.lastModified.toISOString() };
  }
  records.push(record);
  copied += 1;
  process.stdout.write(`\rR2: ${copied}/${uploads.length} images copied`);
}
if (uploads.length) process.stdout.write("\n");

// ---- Content, backups and index -> D1 ----
const statements = [];
if (content) {
  const json = JSON.stringify(JSON.parse(content.toString("utf8")));
  // Upsert rather than delete-then-insert, so a failed import never leaves the site without content.
  statements.push(
    `INSERT INTO content (id, json, version, updated_at) VALUES (1, ${sql(json)}, 1, ${sql(contentObj.lastModified.toISOString())}) ` +
      "ON CONFLICT(id) DO UPDATE SET json = excluded.json, version = content.version + 1, updated_at = excluded.updated_at;",
  );
}
if (backups.length) {
  statements.push("DELETE FROM content_backups;");
  for (const b of backups) {
    const raw = await get(b.key);
    if (!raw) continue;
    try {
      const json = JSON.stringify(JSON.parse(raw.toString("utf8")));
      statements.push(`INSERT INTO content_backups (json, created_at) VALUES (${sql(json)}, ${sql(b.lastModified.toISOString())});`);
    } catch {
      console.warn(`Skipped ${b.key}: not valid JSON.`);
    }
  }
}
for (const r of records) {
  statements.push(
    `INSERT OR REPLACE INTO media (name, width, height, bytes, uploaded_at) VALUES (${sql(r.name)}, ${sql(r.width)}, ${sql(r.height)}, ${sql(r.bytes ?? 0)}, ${sql(r.uploadedAt ?? new Date().toISOString())});`,
  );
}

const tooBig = statements.find((st) => Buffer.byteLength(st) > 95_000);
if (tooBig) {
  console.error(`A statement is ${Buffer.byteLength(tooBig)} bytes, over D1's 100 KB limit; nothing was written to D1.`);
  process.exit(1);
}
if (statements.length) {
  const sqlFile = path.join(tmp, "import.sql");
  await fs.writeFile(sqlFile, statements.join("\n") + "\n");
  wrangler("d1", "execute", DB_NAME, target, "--yes", "--file", sqlFile);
}
await fs.rm(tmp, { recursive: true, force: true });

console.log(`D1: content ${content ? "copied" : "not present"}, ${backups.length} backups, ${records.length} image records.`);
console.log("\nDone. Deploy (npm run deploy) so the site picks the content up, then check /admin.");
