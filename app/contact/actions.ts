"use server";

import { addContactMessage } from "@/lib/contact-messages";

function clean(value: FormDataEntryValue | null, max: number) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export async function submitContactAction(formData: FormData) {
  const name = clean(formData.get("name"), 120);
  const email = clean(formData.get("email"), 200).toLowerCase();
  const message = String(formData.get("message") ?? "")
    .trim()
    .slice(0, 5000);

  if (!name || !email || !message) {
    return { ok: false as const };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false as const };
  }

  await addContactMessage({ name, email, message });
  return { ok: true as const };
}
