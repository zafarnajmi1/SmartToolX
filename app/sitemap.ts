import type { MetadataRoute } from "next";
import { getCms } from "@/lib/cms";

function isPublicUrl(value: string | undefined): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const cms = await getCms();
    const entries = Object.values(cms.seo)
      .filter((entry) => entry?.robotsIndex && isPublicUrl(entry.canonical))
      .map((entry) => ({
        url: entry.canonical,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: entry.path === "/" ? 1 : 0.7,
      }));
    if (entries.length > 0) return entries;
  } catch {
    // Fall through to a minimal sitemap so Google never gets a 500.
  }

  return [
    {
      url: "https://smarttoolx.com",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
