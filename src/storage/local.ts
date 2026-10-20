import { promises as fs } from "node:fs";
import path from "node:path";
import { assertSafeKey, type ObjectStore, type StoredObject } from "./types";

const isMissing = (error: unknown) => (error as NodeJS.ErrnoException).code === "ENOENT";

/** Stores objects as files under `root`. Writes go through a temporary file so they are atomic. */
export function createLocalStore(root: string): ObjectStore {
  const fileFor = (key: string) => path.join(root, assertSafeKey(key));

  async function walk(dir: string, base: string, into: StoredObject[]) {
    let entries: import("node:fs").Dirent[];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch (error) {
      if (isMissing(error)) return;
      throw error;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(full, `${base}${entry.name}/`, into);
      else if (!entry.name.endsWith(".tmp")) {
        const stat = await fs.stat(full);
        into.push({ key: `${base}${entry.name}`, size: stat.size, lastModified: stat.mtime });
      }
    }
  }

  return {
    kind: "local",
    description: `Local disk (${root})`,

    // No CDN: uploads are served by the site's own /uploads route.
    publicUrl: () => null,

    async get(key) {
      try {
        return await fs.readFile(fileFor(key));
      } catch (error) {
        if (isMissing(error)) return null;
        throw error;
      }
    },

    async put(key, body) {
      const file = fileFor(key);
      await fs.mkdir(path.dirname(file), { recursive: true });
      const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
      await fs.writeFile(tmp, body);
      await fs.rename(tmp, file);
    },

    async delete(key) {
      try {
        await fs.unlink(fileFor(key));
      } catch (error) {
        if (!isMissing(error)) throw error;
      }
    },

    async list(prefix) {
      const all: StoredObject[] = [];
      await walk(root, "", all);
      return all.filter((o) => o.key.startsWith(prefix));
    },
  };
}
