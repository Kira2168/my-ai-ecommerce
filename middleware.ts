import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getAdminPreauthCookieName,
  getAdminSessionCookieName,
  verifyAdminPreauthToken,
  verifyAdminSessionToken,
} from "@/lib/auth/admin-session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin/login") || pathname.startsWith("/api/admin/auth")) {
    return NextResponse.next();
  }

  const fullToken = req.cookies.get(getAdminSessionCookieName())?.value;
  const preauthToken = req.cookies.get(getAdminPreauthCookieName())?.value;

  if (pathname.startsWith("/admin/mfa")) {
    if (fullToken) {
      try {
        const session = await verifyAdminSessionToken(fullToken);
        if (session.role === "ADMIN" && session.adminId && session.mfa) {
          return NextResponse.redirect(new URL("/admin", req.url));
        }
      } catch {
        // continue to preauth checks
      }
    }

    if (!preauthToken) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    try {
      const preauth = await verifyAdminPreauthToken(preauthToken);
      if (preauth.role !== "ADMIN" || !preauth.adminId || !preauth.mfaPending) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  if (!fullToken) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  try {
    const session = await verifyAdminSessionToken(fullToken);
    if (session.role !== "ADMIN" || !session.adminId || !session.mfa) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
