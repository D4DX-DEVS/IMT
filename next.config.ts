import type { NextConfig } from "next";

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
  },
  // Keep old WordPress URLs working.
  async redirects() {
    return [
      { source: "/hello-world", destination: "/news/hello-world", permanent: true },
      { source: "/category/uncategorized", destination: "/news", permanent: true },
    ];
  },
};

export default nextConfig;
