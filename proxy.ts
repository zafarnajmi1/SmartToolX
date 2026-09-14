import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdminCookie, SESSION_COOKIE } from "@/lib/admin-session";

const CANONICAL_HOST = "smarttoolx.com";

export function proxy(request: NextRequest) {
  const host = (
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    ""
  )
    .split(",")[0]
    .trim()
    .replace(/:\d+$/, "");

  if (host === `www.${CANONICAL_HOST}`) {
    const dest = `https://${CANONICAL_HOST}${request.nextUrl.pathname}${request.nextUrl.search}`;
    return NextResponse.redirect(dest, 301);
  }

  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }
  if (pathname === "/admin/login") {
    if (isAdminCookie(request.cookies.get(SESSION_COOKIE)?.value)) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }
  if (!isAdminCookie(request.cookies.get(SESSION_COOKIE)?.value)) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
