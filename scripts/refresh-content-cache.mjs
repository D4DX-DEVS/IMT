#!/usr/bin/env node
/**
 * Runs after `opennextjs-cloudflare deploy`. The build prerenders pages with the *local* dev database
 * (usually empty, so the built-in default content), and those pages are uploaded to the cache. Marking the
 * "content" cache tag as revalidated in the production D1 makes the deployed site discard them and render
 * the real content from D1 on the first request — the same thing an admin save does.
 *
 *   node scripts/refresh-content-cache.mjs            production D1
 *   node scripts/refresh-content-cache.mjs --local    local dev D1
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const DB_NAME = "imt-next-cache"; // OpenNext's tag cache database (NEXT_TAG_CACHE_D1)
const TAG = "content";
const target = process.argv.includes("--local") ? "--local" : "--remote";

// Must match OpenNext's cache key: `${OPEN_NEXT_BUILD_ID}/${tag}`, where the id is Next's BUILD_ID.
const buildId = readFileSync(".next/BUILD_ID", "utf8").trim();
const now = Date.now();
const command = `INSERT OR REPLACE INTO revalidations (tag, revalidatedAt, stale, expire) VALUES ('${buildId}/${TAG}', ${now}, ${now}, NULL)`;

const isWindows = process.platform === "win32";
execFileSync(isWindows ? "npx.cmd" : "npx", ["wrangler", "d1", "execute", DB_NAME, target, "--command", isWindows ? `"${command}"` : command], {
  stdio: "inherit",
  shell: isWindows,
});
console.log(`[cache] "${TAG}" tag refreshed for build ${buildId}; pages will re-render from D1.`);
