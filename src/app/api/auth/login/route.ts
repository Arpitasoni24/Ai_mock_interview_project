import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // ✅ Get token using Next.js cookies API (correct way)
    const token = cookies().get("token")?.value;

    // ❌ No token
    if (!token) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    // ✅ Verify token
    jwt.verify(token, process.env.JWT_SECRET!);

    return NextResponse.json(
      { authenticated: true },
      { status: 200 }
    );

  } catch (error) {
    console.error("Auth check error:", error);

    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }
}