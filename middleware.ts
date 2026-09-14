import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CANONICAL_HOST = "smarttoolx.com";

export function middleware(request: NextRequest) {
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

  return NextResponse.next();
}
