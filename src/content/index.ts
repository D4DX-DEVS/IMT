import { cache } from "react";
import { unstable_cache } from "next/cache";
import { readContent } from "./store";

/** Cache tag every admin save invalidates (see `updateTag(CONTENT_TAG)` in the admin actions). */
export const CONTENT_TAG = "content";

/**
 * The content cached across requests (in OpenNext's R2 incremental cache) until an admin save invalidates
 * `CONTENT_TAG`. Pages that read it are statically generated and carry the tag, so they are regenerated
 * after a save too.
 *
 * (Next's Cache Components / "use cache" is not used: its request-time prerendering depends on Node's
 * timer internals and hangs on Cloudflare Workers.)
 */
const getCachedContent = unstable_cache(readContent, ["site-content"], { tags: [CONTENT_TAG], revalidate: false });

/** The content for the public site, read once per request. */
export const getContent = cache(() => getCachedContent());
