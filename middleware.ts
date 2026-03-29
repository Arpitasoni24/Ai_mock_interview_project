

// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import jwt from "jsonwebtoken";

// export function middleware(request: NextRequest) {
//   const pathname = request.nextUrl.pathname;

//   // ✅ Get token safely
//   const token = request.cookies.get("token")?.value;

//   // 🔥 DEBUG (will show in Vercel logs)
//   console.log("PATH:", pathname);
//   console.log("TOKEN:", token);

//   // ✅ Allow public routes
//   if (
//     pathname === "/" ||
//     pathname.startsWith("/login") ||
//     pathname.startsWith("/signup")
//   ) {
//     return NextResponse.next();
//   }

//   // ✅ Protect private routes
//   if (
//     pathname.startsWith("/dashboard") ||
//     pathname.startsWith("/interview")
//   ) {
//     // ❌ No token → redirect
//     if (!token) {
//       console.log("❌ No token found in middleware");
//       return NextResponse.redirect(new URL("/login", request.url));
//     }

//     try {
//       // ✅ Verify JWT
//       jwt.verify(token, process.env.JWT_SECRET!);

//       console.log("✅ Token valid");
//       return NextResponse.next();

//     } catch (error) {
//       console.error("❌ JWT ERROR:", error);

//       return NextResponse.redirect(new URL("/login", request.url));
//     }
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/dashboard/:path*", "/interview/:path*"],
// };




import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const token = request.cookies.get("token")?.value;

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

    // ✅ Token exists → allow
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/interview/:path*"],
};