import type { ImageLoaderProps } from "next/image";

/**
 * next/image loader. Uploaded images (`/uploads/<name>`, stored in R2) are resized by the site's own
 * /uploads route with Cloudflare Images; everything else goes through Next's optimizer at /_next/image,
 * which OpenNext also runs on Cloudflare Images.
 */
export default function imageLoader({ src, width, quality }: ImageLoaderProps): string {
  const q = quality ?? 75;
  if (/^\/uploads\/[^/?#]+$/.test(src)) return `${src}?w=${width}&q=${q}`;
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${q}`;
}
