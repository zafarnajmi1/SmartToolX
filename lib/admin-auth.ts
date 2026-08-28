import { cookies } from "next/headers";
import {
  credentialsMatch,
  isAdminCookie,
  SESSION_COOKIE,
  SESSION_TOKEN,
} from "@/lib/admin-session";

export { credentialsMatch, ADMIN_EMAIL } from "@/lib/admin-session";

export async function setAdminSession() {
  const store = await cookies();
  store.set(SESSION_COOKIE, SESSION_TOKEN, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function isAdminAuthenticated() {
  const store = await cookies();
  return isAdminCookie(store.get(SESSION_COOKIE)?.value);
}
