import { db } from "@/storage";
import { contentSchema, type Content } from "./schema";
import { seedContent } from "./seed";
import { deleteUploads, uploadNameFromUrl } from "./uploads";

/**
 * The editable content, stored as one JSON document in the D1 table `content` (a single row), plus the
 * last 30 versions in `content_backups`.
 *
 * Server only — never import this from a client component.
 */
const MAX_BACKUPS = 30;
const MAX_SAVE_ATTEMPTS = 5;

/** An error whose message is safe to show to the admin, e.g. "That slug is already used". */
export class ContentError extends Error {}

/** The defaults, validated and normalised the same way as stored content. */
const defaults = (): Content => contentSchema.parse(structuredClone(seedContent));

type Row = { json: string; version: number; updated_at: string };
type Loaded = { raw: string | null; version: number; content: Content };

/**
 * Reads the stored content. No row means a fresh site, so the defaults are used. A database failure
 * throws instead — silently showing the defaults would hide the problem (and get cached).
 */
async function load(): Promise<Loaded> {
  const row = await (await db()).prepare("SELECT json, version, updated_at FROM content WHERE id = 1").first<Row>();
  if (!row) return { raw: null, version: 0, content: defaults() };

  try {
    const parsed = contentSchema.safeParse(JSON.parse(row.json));
    if (parsed.success) return { raw: row.json, version: row.version, content: parsed.data };
    console.error("[content] stored content failed validation; using defaults.", parsed.error.issues.slice(0, 3));
  } catch (error) {
    console.error("[content] stored content is not valid JSON; using defaults.", error);
  }
  return { raw: row.json, version: row.version, content: defaults() };
}

export async function readContent(): Promise<Content> {
  return (await load()).content;
}

export async function contentLastSaved(): Promise<Date | null> {
  const row = await (await db()).prepare("SELECT updated_at FROM content WHERE id = 1").first<{ updated_at: string }>();
  return row ? new Date(row.updated_at) : null;
}

/** Uploaded files referenced anywhere in the content. */
function collectUploads(value: unknown, into = new Set<string>()): Set<string> {
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
async function removeUnreferencedUploads(before: Content, after: Content): Promise<void> {
  const stillUsed = collectUploads(after);
  const dropped = [...collectUploads(before)].filter((name) => !stillUsed.has(name));
  try {
    await deleteUploads(dropped);
  } catch (error) {
    console.error("[content] could not delete unused uploads", error);
  }
}

/**
 * Writes `next` only if the stored version is still `expected`, together with a backup of the previous
 * version, in one D1 batch (a transaction). Returns false if someone else saved in between.
 */
async function writeIfUnchanged(current: Loaded, next: Content): Promise<boolean> {
  const database = await db();
  const now = new Date().toISOString();
  const json = JSON.stringify(next);

  const write =
    current.version === 0
      ? database
          .prepare("INSERT INTO content (id, json, version, updated_at) VALUES (1, ?, 1, ?) ON CONFLICT(id) DO NOTHING")
          .bind(json, now)
      : database
          .prepare("UPDATE content SET json = ?, version = version + 1, updated_at = ? WHERE id = 1 AND version = ?")
          .bind(json, now, current.version);

  const statements = [write];
  if (current.raw !== null) {
    // Only back up if the write above actually changed the row (`changes()` is its row count), then trim.
    statements.push(
      database.prepare("INSERT INTO content_backups (json, created_at) SELECT ?, ? WHERE changes() > 0").bind(current.raw, now),
      database
        .prepare("DELETE FROM content_backups WHERE id NOT IN (SELECT id FROM content_backups ORDER BY id DESC LIMIT ?)")
        .bind(MAX_BACKUPS),
    );
  }

  const [result] = await database.batch(statements);
  return (result.meta.changes ?? 0) > 0;
}

/**
 * Read–modify–write the content. `mutate` receives a copy of the current content and returns the
 * new content; the result is validated before it is written. If another save lands in between, the
 * change is re-applied on top of it (optimistic concurrency), so saves from several worker instances
 * never overwrite each other. Uploaded images that are no longer referenced afterwards are deleted.
 */
export async function updateContent(mutate: (draft: Content) => Content): Promise<Content> {
  for (let attempt = 0; attempt < MAX_SAVE_ATTEMPTS; attempt++) {
    const current = await load();
    const next = contentSchema.parse(mutate(structuredClone(current.content)));
    if (await writeIfUnchanged(current, next)) {
      await removeUnreferencedUploads(current.content, next);
      return next;
    }
  }
  throw new ContentError("Someone else is saving changes right now. Please try again.");
}
