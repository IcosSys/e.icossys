import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get("admin_session")?.value;

  // Protège /admin (sauf /admin/login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  // Redirige vers /admin si déjà connecté et va sur /admin/login
  if (pathname === "/admin/login" && session) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};