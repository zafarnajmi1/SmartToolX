import { promises as fs } from "fs";
import path from "path";
import { DEFAULT_CMS } from "@/lib/cms-defaults";
import type { CmsData } from "@/lib/cms-types";

const FILE = path.join(process.cwd(), "data", "cms.json");

function mergeCms(stored: Partial<CmsData>): CmsData {
  return {
    site: { ...DEFAULT_CMS.site, ...stored.site },
    social: { ...DEFAULT_CMS.social, ...stored.social },
    privacy: { ...DEFAULT_CMS.privacy, ...stored.privacy },
    terms: { ...DEFAULT_CMS.terms, ...stored.terms },
    seo: { ...DEFAULT_CMS.seo, ...stored.seo },
  };
}

export async function getCms(): Promise<CmsData> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    return mergeCms(JSON.parse(raw) as Partial<CmsData>);
  } catch {
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(DEFAULT_CMS, null, 2));
    return DEFAULT_CMS;
  }
}

export async function saveCms(data: CmsData) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(data, null, 2));
}
