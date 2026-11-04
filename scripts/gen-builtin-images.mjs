#!/usr/bin/env node
/**
 * Measures the images shipped in public/images and writes src/data/builtin-images.json, which the admin's
 * image library reads (the worker can't read the file system or run sharp). Runs before every build.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const dir = path.join(process.cwd(), "public", "images");
const out = path.join(process.cwd(), "src", "data", "builtin-images.json");
const IMAGE_FILE = /\.(jpe?g|png|webp|avif)$/i;

const names = (await fs.readdir(dir)).filter((f) => IMAGE_FILE.test(f)).sort((a, b) => a.localeCompare(b));
const items = [];
for (const name of names) {
  try {
    const { width, height } = await sharp(path.join(dir, name)).metadata();
    items.push({ name, width: width ?? 1, height: height ?? 1 });
  } catch (error) {
    console.warn(`[images] skipped ${name}: ${error.message}`);
  }
}
await fs.writeFile(out, JSON.stringify(items, null, 2) + "\n");
console.log(`[images] ${items.length} built-in images measured -> ${path.relative(process.cwd(), out)}`);
