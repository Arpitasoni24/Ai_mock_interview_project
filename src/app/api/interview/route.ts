import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import  prisma  from "@/lib/prisma";
// import { authOptions } from "@/lib/auth"; 

export async function POST(req: Request) {
  console.log("🔥 DATABASE_URL =", process.env.DATABASE_URL);

  console.log("🔥 /api/interview HIT");
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET!
  ) as { userId: string };

  const body = await req.json();
  console.log("📦 Interview body:", body);

  const interview = await prisma.interview.create({
    data: {
      userId: decoded.userId,  
      domain: body.domain,
      level: body.level,
      question: body.question,
      answer: body.answer,
      score: body.score,
      feedback: JSON.stringify(body.feedback),
    },
  });
  console.log("✅ Interview saved with ID:", interview.id);

  return Response.json(interview);
}
