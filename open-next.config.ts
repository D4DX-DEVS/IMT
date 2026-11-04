import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";
import memoryQueue from "@opennextjs/cloudflare/overrides/queue/memory-queue";
import d1NextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache";

/**
 * Prerendered pages and "use cache" entries are kept in R2 (with a per-colo cache in front), and cache
 * tags in D1 — so `updateTag("content")` after an admin save is seen by every worker instance.
 */
export default defineCloudflareConfig({
  incrementalCache: withRegionalCache(r2IncrementalCache, { mode: "long-lived", bypassTagCacheOnCacheHit: false }),
  tagCache: d1NextTagCache,
  queue: memoryQueue,
});
