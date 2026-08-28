export const ADMIN_EMAIL = "admin@gmail.com";
export const ADMIN_PASSWORD = "admin1234";
export const SESSION_COOKIE = "stx_admin";
export const SESSION_TOKEN = "stx_adm_7f3a9c2e1b84";

export function credentialsMatch(email: string, password: string) {
  return email.trim() === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}

export function isAdminCookie(value: string | undefined) {
  return value === SESSION_TOKEN;
}
