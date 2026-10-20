import { getStore } from "@/storage";
import { contentSchema, type Content } from "./schema";
import { seedContent } from "./seed";
import { deleteUploads, uploadNameFromUrl } from "./uploads";

/**
 * The editable content, stored as one JSON file (`content.json`) in the site's storage — DigitalOcean
 * Spaces when `DO_SPACES_*` is configured, otherwise local disk — plus the last 30 versions under `backups/`.
 *
 * Server only — never import this from a client component.
 */
const CONTENT_KEY = "content.json";
const BACKUP_PREFIX = "backups/";
const MAX_BACKUPS = 30;

/** An error whose message is safe to show to the admin, e.g. "That slug is already used". */
export class ContentError extends Error {}

/** The defaults, validated and normalised the same way as stored content. */
const defaults = (): Content => contentSchema.parse(structuredClone(seedContent));

/**
 * Reads the stored content. A missing file means a fresh site, so the defaults are used. A storage
 * failure throws instead — silently showing the defaults would hide the problem (and get cached).
 */
async function load(): Promise<{ raw: string | null; content: Content }> {
  const bytes = await getStore().get(CONTENT_KEY);
  if (!bytes) return { raw: null, content: defaults() };

  const raw = bytes.toString("utf8");
  try {
    const parsed = contentSchema.safeParse(JSON.parse(raw));
    if (parsed.success) return { raw, content: parsed.data };
    console.error("[content] content.json failed validation; using defaults.", parsed.error.issues.slice(0, 3));
  } catch (error) {
    console.error("[content] content.json is not valid JSON; using defaults.", error);
  }
  return { raw, content: defaults() };
}

export async function readContent(): Promise<Content> {
  return (await load()).content;
}

export async function contentLastSaved(): Promise<Date | null> {
  const found = (await getStore().list(CONTENT_KEY)).find((o) => o.key === CONTENT_KEY);
  return found?.lastModified ?? null;
}

async function backUp(raw: string) {
  const store = getStore();
  try {
    await store.put(`${BACKUP_PREFIX}content-${new Date().toISOString().replace(/[:.]/g, "-")}.json`, raw, {
      contentType: "application/json",
    });
    const old = (await store.list(BACKUP_PREFIX)).map((o) => o.key).sort();
    await Promise.all(old.slice(0, Math.max(0, old.length - MAX_BACKUPS)).map((key) => store.delete(key)));
  } catch (error) {
    console.error("[content] backup failed", error);
  }
}

/** Uploaded files referenced anywhere in the content. */
function collectUploads(value: unknown, into = new Set<string>()) {
  if (typeof value === "string") {
    const name = uploadNameFromUrl(value);
    if (name) into.add(name);
  } else if (Array.isArray(value)) {
    value.forEach((v) => collectUploads(v, into));
  } else if (value && typeof value === "object") {
    Object.values(value).forEach((v) => collectUploads(v, into));
  }
  return into;
}

/** Deletes uploaded images that the new content no longer uses. Best effort: never fails a save. */
async function removeUnreferencedUploads(before: Content, after: Content) {
  const stillUsed = collectUploads(after);
  const dropped = [...collectUploads(before)].filter((name) => !stillUsed.has(name));
  try {
    await deleteUploads(dropped);
  } catch (error) {
    console.error("[content] could not delete unused uploads", error);
  }
}

// Saves run one at a time so two admins (or two tabs) can't overwrite each other mid-write.
let queue: Promise<unknown> = Promise.resolve();

/**
 * Read–modify–write the content. `mutate` receives a copy of the current content and returns the
 * new content; the result is validated before it is written. Uploaded images that are no longer
 * referenced afterwards are deleted.
 *
 * The queue only serialises saves within one server process. Run a single instance of the site
 * (the usual setup for a site this size), or two simultaneous saves on different instances could
 * overwrite each other.
 */
export function updateContent(mutate: (draft: Content) => Content): Promise<Content> {
  const run = async () => {
    const { raw, content: current } = await load();
    const next = contentSchema.parse(mutate(structuredClone(current)));
    if (raw !== null) await backUp(raw);
    await getStore().put(CONTENT_KEY, JSON.stringify(next, null, 2) + "\n", {
      contentType: "application/json",
      cacheControl: "no-store",
    });
    await removeUnreferencedUploads(current, next);
    return next;
  };
  const result = queue.then(run, run);
  queue = result.catch(() => undefined);
  return result;
}
