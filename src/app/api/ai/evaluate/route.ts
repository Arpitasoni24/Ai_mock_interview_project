import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { question, answer } = await req.json();

    if (!question || !answer) {
      return NextResponse.json(
        { error: "Missing question or answer" },
        { status: 400 }
      );
    }

    const prompt = `
You are an experienced technical interviewer.

Evaluate the following interview answer.

Question:
"${question}"

Candidate Answer:
"${answer}"

Return ONLY a valid JSON object.
Do NOT add any text before or after the JSON.

JSON format:
{
  "score": number (0-10),
  "strengths": string[] (2-4 specific points),
  "weaknesses": string[] (2-4 specific points),
  "improvedAnswer": string (rewritten better answer)
}
`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.4,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err);
    }

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content || "";

    // 🛡 SAFELY EXTRACT JSON
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.error("❌ No JSON found:", rawText);

      return NextResponse.json({
        score: 5,
        strengths: ["Answer was understandable"],
        weaknesses: ["Needs better structure"],
        improvedAnswer:
          "Try structuring your answer clearly and add real-world examples.",
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.error("❌ JSON parse failed:", jsonMatch[0]);

      return NextResponse.json({
        score: 5,
        strengths: ["Answer was understandable"],
        weaknesses: ["Needs better structure"],
        improvedAnswer:
          "Try structuring your answer clearly and add real-world examples.",
      });
    }

    // ✅ FINAL RESPONSE
    return NextResponse.json({
      score: Number(parsed.score) || 5,
      strengths: Array.isArray(parsed.strengths)
        ? parsed.strengths
        : [],
      weaknesses: Array.isArray(parsed.weaknesses)
        ? parsed.weaknesses
        : [],
      improvedAnswer:
        parsed.improvedAnswer ||
        "Try structuring your answer clearly and add real-world examples.",
    });
  } catch (error) {
    console.error("❌ AI evaluation error:", error);
    return NextResponse.json(
      { error: "AI evaluation failed" },
      { status: 500 }
    );
  }
}
