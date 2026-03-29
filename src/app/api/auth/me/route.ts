// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";

// export async function GET(req: Request) {
//   const cookie = req.headers.get("cookie");
//   const token = cookie
//     ?.split("; ")
//     .find((c) => c.startsWith("token="))
//     ?.split("=")[1];

//   if (!token) {
//     return NextResponse.json({ authenticated: false }, { status: 401 });
//   }

//   try {
//     jwt.verify(token, process.env.JWT_SECRET!);
//     return NextResponse.json({ authenticated: true });
//   } catch {
//     return NextResponse.json({ authenticated: false }, { status: 401 });
//   }
// }








import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // ✅ FIX: await cookies()
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

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