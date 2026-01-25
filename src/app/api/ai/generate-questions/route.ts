import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { domain, level = "mid" } = await req.json();

    if (!domain) {
      return NextResponse.json(
        { error: "Domain is required" },
        { status: 400 }
      );
    }

    const prompt = `
You are a senior interviewer conducting a spoken technical interview.

The candidate role/domain is:
"${domain}"

Generate exactly 5 ${level}-level INTERVIEW QUESTIONS meant for
verbal discussion, NOT coding tests.

Rules:
- DO NOT include any introduction, explanation, or preface
- DO NOT say things like "Here are the questions" or "Let's start"
- Each line MUST be a single interview question
- Questions must be conceptual, scenario-based, or experience-based
- DO NOT ask to "implement", "write code", or "solve"
- Focus on HOW, WHY, WHEN, and WHAT decisions
- At least 3 questions must mention real tools, frameworks, or technologies
- No answers
- Return ONLY a numbered list

Examples of GOOD questions:
- "How does React handle state updates internally?"
- "What trade-offs do you consider when designing an API?"
- "How would you debug a performance issue in Next.js?"

Examples of BAD questions (do NOT generate):
- "Implement a stack"
- "Write code for authentication"
- "Solve this problem"
`;


    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq raw error:", errorText);
      throw new Error(errorText);
    }

    const data = await response.json();

    const text = data.choices?.[0]?.message?.content || "";

    const questions = text
  .split("\n")
  .map((q: string) => q.trim())
  .filter(
    (q: string) =>
      q.match(/^\d+\./) &&               // must start with number
      !q.toLowerCase().includes("let's") &&
      !q.toLowerCase().includes("start") &&
      !q.toLowerCase().includes("here are")
  )
  .map((q: string) => q.replace(/^\d+\.\s*/, ""))
  .slice(0, 5);


    if (questions.length === 0) {
      throw new Error("No questions generated");
    }

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Groq error:", error);
    return NextResponse.json(
      { error: "AI service unavailable. Please try again later." },
      { status: 503 }
    );
  }
}
