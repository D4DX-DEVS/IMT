import type { NextConfig } from "next";

/**
 * Uploaded images are loaded from the Space's CDN, so Next's image optimizer must be allowed to fetch from
 * that address (only from the uploads folder). Read from DO_SPACES_CDN_URL / DO_SPACES_FOLDER at build and start.
 */
function cdnImagePatterns(): NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]> {
  const raw = process.env.DO_SPACES_CDN_URL;
  if (!raw) return [];
  try {
    const cdn = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    const folder = (process.env.DO_SPACES_FOLDER ?? "").trim().replace(/^\/+|\/+$/g, "");
    return [
      {
        protocol: cdn.protocol === "http:" ? "http" : "https",
        hostname: cdn.hostname,
        port: cdn.port,
        pathname: `${cdn.pathname.replace(/\/+$/, "")}/${folder ? `${folder}/` : ""}uploads/**`,
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: cdnImagePatterns(),
    // Lets the optimizer fetch from a local S3 emulator while developing. Never in production.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
  },
  // Keep old WordPress URLs working.
  async redirects() {
    return [
      { source: "/hello-world", destination: "/news", permanent: true },
      { source: "/category/uncategorized", destination: "/news", permanent: true },
    ];
  },
};

export default nextConfig;
