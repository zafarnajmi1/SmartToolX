"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  clearAdminSession,
  credentialsMatch,
  isAdminAuthenticated,
  setAdminSession,
} from "@/lib/admin-auth";
import { getCms, saveCms } from "@/lib/cms";
import type { LegalPage, SeoEntry, SocialLinks } from "@/lib/cms-types";
import { deleteContactMessage } from "@/lib/contact-messages";

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
}

export async function loginAction(
  _prev: { error: string } | null,
  formData: FormData,
) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!credentialsMatch(email, password)) {
    return { error: "Invalid email or password." };
  }
  await setAdminSession();
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function saveSeoAction(entry: SeoEntry) {
  await requireAdmin();
  const cms = await getCms();
  cms.seo[entry.path] = entry;
  await saveCms(cms);
  revalidatePath("/", "layout");
  revalidatePath(entry.path);
  revalidatePath("/admin");
  revalidatePath("/admin/seo");
}

export async function saveSocialAction(social: SocialLinks) {
  await requireAdmin();
  const cms = await getCms();
  cms.social = social;
  await saveCms(cms);
  revalidatePath("/social");
  revalidatePath("/", "layout");
  revalidatePath("/admin/social");
}

export async function saveLegalAction(
  kind: "privacy" | "terms",
  page: LegalPage,
) {
  await requireAdmin();
  const cms = await getCms();
  cms[kind] = page;
  await saveCms(cms);
  revalidatePath(kind === "privacy" ? "/privacy" : "/terms");
  revalidatePath(kind === "privacy" ? "/admin/privacy" : "/admin/terms");
}

export async function saveSiteAction(site: CmsSiteInput) {
  await requireAdmin();
  const cms = await getCms();
  cms.site = { ...cms.site, ...site };
  await saveCms(cms);
  revalidatePath("/", "layout");
}

export async function deleteContactMessageAction(id: string) {
  await requireAdmin();
  await deleteContactMessage(id);
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}

type CmsSiteInput = {
  siteUrl: string;
  siteName: string;
  defaultOgImage: string;
  googleSiteVerification: string;
  bingVerification: string;
  facebookAppId: string;
};
