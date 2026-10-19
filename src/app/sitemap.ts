import type { MetadataRoute } from "next";
import { posts, site } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/about", "/gallery", "/news"].map((path) => ({ url: `${site.url}${path}` }));
  const news = posts.map((p) => ({ url: `${site.url}/news/${p.slug}`, lastModified: p.date }));
  return [...pages, ...news];
}
