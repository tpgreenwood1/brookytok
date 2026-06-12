import { NextRequest, NextResponse } from "next/server";

// Inline BetterAuth session cookie check to avoid importing Node.js-incompatible modules
// in the Edge Runtime. BetterAuth sets the cookie as "better-auth.session_token"
// (or with __Secure- prefix in production).
function getSessionCookie(request: NextRequest): string | null {
  const prefix = "better-auth";
  const name = "session_token";
  return (
    request.cookies.get(`__Secure-${prefix}.${name}`)?.value ??
    request.cookies.get(`${prefix}.${name}`)?.value ??
    request.cookies.get(`__Secure-${prefix}-${name}`)?.value ??
    request.cookies.get(`${prefix}-${name}`)?.value ??
    null
  );
}

export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname === "/signin" || pathname === "/signup";

  if (!sessionCookie && !isAuthPage) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  if (sessionCookie && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
