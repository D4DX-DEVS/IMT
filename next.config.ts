import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import { DEVICE_SIZES, IMAGE_QUALITIES, IMAGE_SIZES } from "./src/lib/image-sizes";

const nextConfig: NextConfig = {
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
    // Uploaded images (R2) are resized by the /uploads route, everything else by /_next/image;
    // both use Cloudflare Images. See src/lib/image-loader.ts.
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    formats: ["image/avif", "image/webp"],
    deviceSizes: DEVICE_SIZES,
    imageSizes: IMAGE_SIZES,
    qualities: IMAGE_QUALITIES,
  },
  experimental: {
    serverActions: {
      // imtpmna.org reaches the worker with Host/x-forwarded-host = the workers.dev hostname, so
      // Next's Server Action CSRF check (origin vs host) rejects every form post, e.g. admin login.
      allowedOrigins: ["imtpmna.org", "www.imtpmna.org"],
    },
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

// Gives `next dev` (and the build's prerendering) local versions of the D1/R2/Images bindings in wrangler.jsonc.
initOpenNextCloudflareForDev();
