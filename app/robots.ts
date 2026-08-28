import type { MetadataRoute } from "next";
import { getCms } from "@/lib/cms";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const cms = await getCms();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/"],
    },
    sitemap: `${cms.site.siteUrl}/sitemap.xml`,
    host: cms.site.siteUrl,
  };
}
