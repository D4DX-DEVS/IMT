import type { MetadataRoute } from "next";
import { getContent } from "@/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { site, institutions, posts } = await getContent();
  const pages = ["", "/about", "/gallery", "/news", "/contact"].map((path) => ({ url: `${site.url}${path}` }));
  const institutionPages = institutions.map((i) => ({ url: `${site.url}/institutions/${i.slug}` }));
  const news = posts.map((p) => ({ url: `${site.url}/news/${p.slug}`, lastModified: p.date }));
  return [...pages, ...institutionPages, ...news];
}
