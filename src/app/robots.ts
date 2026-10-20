import type { MetadataRoute } from "next";
import { getContent } from "@/content";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { site } = await getContent();
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
