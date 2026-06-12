import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const intlMiddleware = createMiddleware(routing);

function getSecret(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "fallback-change-me";
  return new TextEncoder().encode(secret);
}

async function isValidSession(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get("admin_session")?.value;

  // Extract locale from pathname
  const foundLocale = routing.locales.find(
    (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`
  );
  const localePrefix = foundLocale ? `/${foundLocale}` : "";
  const pathWithoutLocale = foundLocale
    ? pathname.slice(localePrefix.length) || "/"
    : pathname;

  // Protect /admin (except /admin/login)
  if (
    pathWithoutLocale.startsWith("/admin") &&
    pathWithoutLocale !== "/admin/login"
  ) {
    if (!session || !isValidSession(session)) {
      const locale = foundLocale || routing.defaultLocale;
      return NextResponse.redirect(
        new URL(`/${locale}/admin/login`, req.url)
      );
    }
  }

  // Redirect logged-in admin away from login
  if (pathWithoutLocale === "/admin/login" && session) {
    // Verify the session is actually valid before redirecting
    if (await isValidSession(session)) {
      const locale = foundLocale || routing.defaultLocale;
      return NextResponse.redirect(new URL(`/${locale}/admin`, req.url));
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};