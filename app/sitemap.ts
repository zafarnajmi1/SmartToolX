import type { MetadataRoute } from "next";
import { getCms } from "@/lib/cms";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cms = await getCms();
  return Object.values(cms.seo)
    .filter((entry) => entry.robotsIndex)
    .map((entry) => ({
      url: entry.canonical,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: entry.path === "/" ? 1 : 0.7,
    }));
}
