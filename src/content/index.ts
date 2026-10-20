import { cacheLife, cacheTag } from "next/cache";
import { readContent } from "./store";
import { withCdnUploadUrls } from "./uploads";

/** Cache tag every admin save invalidates (see `updateTag(CONTENT_TAG)` in the admin actions). */
export const CONTENT_TAG = "content";

/**
 * The content for the public site, with uploaded images pointing at the CDN. Cached until an admin save
 * invalidates `CONTENT_TAG`, so pages stay fully static between edits.
 */
export async function getContent() {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("max");
  return withCdnUploadUrls(await readContent());
}
