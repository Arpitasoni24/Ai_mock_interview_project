import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const pathname = request.nextUrl.pathname;

  // ✅ Allow public routes
  if (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup")
  ) {
    return NextResponse.next();
  }

  // ✅ Protect private routes
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/interview")
  ) {
    // ❌ No token → redirect
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      // ✅ Verify token safely
      jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");

      return NextResponse.next();
    } catch (error) {
      console.error("JWT ERROR:", error);

      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/interview/:path*"],
};