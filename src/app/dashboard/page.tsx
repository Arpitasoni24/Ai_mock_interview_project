"use client";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import CircularProgress from "@/components/CircularProgress";
import MiniScoreRing from "@/components/MiniScoreRing";


import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Interview } from "@prisma/client";

type InterviewSession = {
  sessionId: string;
  domain: string;
  level: string;
  createdAt: string;
  questions: {
    question: string;
    answer: string;
    score: number;
    feedback: {
      strengths: string[];
      weaknesses: string[];
      improvedAnswer: string;
    };
  }[];
};


const calculateAnalytics = (interviews: Interview[]) => {
  if (interviews.length === 0) {
    return { total: 0, average: 0, best: 0 };
  }

  const scores = interviews.map((i) => i.score);

  return {
    total: interviews.length,
    average: Number(
      (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
    ),
    best: Math.max(...scores),
  };
};
function getScoreColor(score: number) {
  if (score >= 8) return "#22c55e"; // green
  if (score >= 5) return "#38bdf8"; // blue
  return "#f97316"; // orange (low score)
}
function getScoreLabel(score: number) {
  if (score >= 8) return "Excellent performance";
  if (score >= 5) return "Good performance";
  return "Needs improvement";
}

function calculateStreaks(interviews: any[]) {
  if (interviews.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  // Convert interview dates to YYYY-MM-DD
  const days = interviews
    .map((i) =>
      new Date(i.createdAt).toISOString().slice(0, 10)
    )
    .sort()
    .reverse();

  const uniqueDays = Array.from(new Set(days));

  let currentStreak = 1;
  let bestStreak = 1;

  for (let i = 0; i < uniqueDays.length - 1; i++) {
    const today = new Date(uniqueDays[i]);
    const next = new Date(uniqueDays[i + 1]);

    const diff =
      (today.getTime() - next.getTime()) /
      (1000 * 60 * 60 * 24);

    if (diff === 1) {
      currentStreak++;
    } else {
      break;
    }
  }

  let tempStreak = 1;
  for (let i = 0; i < uniqueDays.length - 1; i++) {
    const a = new Date(uniqueDays[i]);
    const b = new Date(uniqueDays[i + 1]);

    const diff =
      (a.getTime() - b.getTime()) /
      (1000 * 60 * 60 * 24);

    if (diff === 1) {
      tempStreak++;
      bestStreak = Math.max(bestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  return { currentStreak, bestStreak };
}

function calculateConsistency(interviews: any[], days = 7) {
  const today = new Date();
  let activeDays = 0;

  for (let i = 0; i < days; i++) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);

    const dayStr = day.toISOString().slice(0, 10);

    if (
      interviews.some(
        (i) =>
          new Date(i.createdAt)
            .toISOString()
            .slice(0, 10) === dayStr
      )
    ) {
      activeDays++;
    }
  }

  return Math.round((activeDays / days) * 100);
}

const BADGES = [
  {
    id: "first",
    title: "First Interview",
    image: "/achievements/first.png",
    unlocked: (data: any) => data.total >= 1,
  },
  {
    id: "five",
    title: "5 Interviews",
    image: "/achievements/five.png",
    unlocked: (data: any) => data.total >= 5,
  },
  {
    id: "avg7",
    title: "Strong Performer",
    image: "/achievements/strong.png",
    unlocked: (data: any) => data.average >= 7,
  },
  {
    id: "best9",
    title: "Top Score",
    image: "/achievements/top.png",
    unlocked: (data: any) => data.best >= 9,
  },
  {
    id: "streak3",
    title: "3-Day Streak",
    image: "/achievements/streak3.png",
    unlocked: (data: any) => data.currentStreak >= 3,
  },
  {
    id: "streak7",
    title: "7-Day Streak",
    image: "/achievements/streak7.png",
    unlocked: (data: any) => data.currentStreak >= 7,
  },
];

export default function DashboardPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
const consistency = calculateConsistency(interviews, 7);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

const [search, setSearch] = useState("");
const [domainFilter, setDomainFilter] = useState("all");
const [minScore, setMinScore] = useState(0);
const filteredInterviews = interviews.filter((interview) => {
  const matchesSearch = interview.question
    .toLowerCase()
    .includes(search.toLowerCase());

  const matchesDomain =
    domainFilter === "all" ||
    interview.domain === domainFilter;

  const matchesScore = interview.score >= minScore;

  return matchesSearch && matchesDomain && matchesScore;
});

  const analytics = calculateAnalytics(interviews);
  const { currentStreak, bestStreak } =
  calculateStreaks(interviews);

  const badgeData = {
  total: analytics.total,
  average: analytics.average,
  best: analytics.best,
  currentStreak,
};

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await fetch("/api/interview/history");
        const data = await res.json();
        if (res.ok) setInterviews(data.interviews);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  const chartData = interviews.map((i, index) => ({
    name: `Interview ${index + 1}`,
    score: i.score,
  }));

const exportInterviewReport = (interview: Interview) => {
  const doc = new jsPDF();

  const feedback = JSON.parse(interview.feedback || "{}");

  // ---------- HEADER ----------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("AI Mock Interview Report", 105, 18, { align: "center" });

  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(1);
  doc.line(14, 24, 196, 24);

  // ---------- META INFO ----------
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  doc.text(`Domain: ${interview.domain}`, 14, 34);
  doc.text(`Level: ${interview.level}`, 14, 41);
  doc.text(
    `Date: ${new Date(interview.createdAt).toLocaleString()}`,
    14,
    48
  );

  doc.setFont("helvetica", "bold");
  doc.text(`Score: ${interview.score}/10`, 150, 41);

  // ---------- QUESTION ----------
  let y = 60;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Interview Question", 14, y);

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(doc.splitTextToSize(interview.question, 180), 14, y);

  // ---------- ANSWER ----------
  y += 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Your Answer", 14, y);

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(doc.splitTextToSize(interview.answer, 180), 14, y);

  // ---------- STRENGTHS ----------
  y += 22;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Strengths", 14, y);

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  if (feedback.strengths?.length) {
    feedback.strengths.forEach((s: string) => {
      doc.text(`• ${s}`, 18, y);
      y += 6;
    });
  } else {
    doc.text("• No strengths identified", 18, y);
    y += 6;
  }

  // ---------- WEAKNESSES ----------
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Areas for Improvement", 14, y);

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  if (feedback.weaknesses?.length) {
    feedback.weaknesses.forEach((w: string) => {
      doc.text(`• ${w}`, 18, y);
      y += 6;
    });
  } else {
    doc.text("• No weaknesses identified", 18, y);
    y += 6;
  }

  // ---------- IMPROVED ANSWER ----------
  y += 12;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Improved Answer (AI Suggested)", 14, y);

  y += 6;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(11);
  doc.text(
    doc.splitTextToSize(
      feedback.improvedAnswer ||
        "No improved answer provided.",
      180
    ),
    14,
    y
  );

  // ---------- FOOTER ----------
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(
    "Generated by AI Mock Interview Platform",
    105,
    285,
    { align: "center" }
  );

  doc.save(`Interview_Report_${interview.domain}.pdf`);
};


  return (
  <div className="bg">
    {/* Background rays */}
    <div className="light-ray ray-1" />
    <div className="light-ray ray-2" />
    <div className="light-ray ray-3" />

    <div className="content">

      {/* ================= HEADER ================= */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 700 }}>
             Interview Dashboard
          </h1>
          <p className="muted">
            Track your progress and review AI feedback
          </p>
        </div>

        <button
          className="cta"
          style={{ height: "fit-content",
            marginRight: "12px",
            marginTop: "8px",
           }}
          onClick={() => (window.location.href = "/interview")}
        >
          Start New Interview
        </button>
        <button
          onClick={handleLogout}
          style={{
            background: "#ef4444",
            color: "white",
            padding: "8px 16px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      {/* ================= TOP STATS ================= */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "32px",
          alignItems: "center",
          marginBottom: "40px",
        }}
      >

        <div
  style={{
    display: "grid",
    gridTemplateColumns: "380px 1fr",
    gap: "32px",
    alignItems: "stretch",
    marginBottom: "48px",
  }}
>
  {/* LEFT — SCORE RINGS */}
  <div
    style={{
      display: "flex",
      gap: "32px",
      alignItems: "center",
      justifyContent: "center",
      flexWrap: "wrap",
    }}
  >
    <CircularProgress value={analytics.average} label="Average Score" />
    <CircularProgress value={analytics.best} label="Best Score" />
  </div>

  {/* RIGHT — PERFORMANCE GRAPH */}
  <div className="glass-card" style={{ padding: "20px" }}>
    <h3 style={{ marginBottom: "12px" }}>
       Performance Trend
    </h3>

    <p className="muted" style={{ fontSize: "13px", marginBottom: "16px" }}>
      Score progression across interviews
    </p>

    <div style={{ height: "220px" , marginTop: "56px" ,}}>
      <ResponsiveContainer width="100%" height="100%" >
        <LineChart data={chartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.08)"
          />

          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            stroke="#94a3b8"
          />

          <YAxis
            domain={[0, 10]}
            tick={{ fontSize: 12 }}
            stroke="#94a3b8"
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "#020617",
              borderRadius: "8px",
              border: "1px solid #334155",
              color: "#fff",
            }}
          />

          <Line
            type="monotone"
            dataKey="score"
            stroke="#38bdf8"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="muted" style={{ marginTop: "12px", fontSize: "13px" }}>
  Performance trends help identify consistency and growth patterns.
</p>
      <p className="muted" style={{ marginTop: "4px", fontSize: "13px" }}>
  Use AI feedback to refine clarity, structure, and confidence.
</p>

    </div>
  </div>
</div>


        
      </div>

      {/* ================= STREAK + CONSISTENCY ================= */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "24px",
          marginBottom: "48px",
        }}
      >
        <div className="glass-card">
          <h3>🔥 Current Streak</h3>
          <p style={{ fontSize: "32px", fontWeight: 700 }}>
            {currentStreak} days
          </p>
          <p className="muted">Consecutive active days</p>
        </div>

        <div className="glass-card">
          <h3>🏆 Best Streak</h3>
          <p style={{ fontSize: "32px", fontWeight: 700 }}>
            {bestStreak} days
          </p>
          <p className="muted">Your longest streak</p>
        </div>

        <div className="glass-card">
          <h3>📆 Weekly Consistency</h3>
          <p style={{ fontSize: "28px", fontWeight: 700 }}>
            {consistency}%
          </p>
          <p className="muted">Last 7 days</p>
        </div>
      </div>

      {/* ================= ACHIEVEMENTS ================= */}
      <div style={{ marginBottom: "56px" }}>
        <h2 style={{ marginBottom: "16px" }}>Achievements</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "16px",
          }}
        >
          {BADGES.map((badge) => {
            const unlocked = badge.unlocked(badgeData);

            return (
              <div
                key={badge.id}
                className="glass-card"
                style={{
                  textAlign: "center",
                  opacity: unlocked ? 1 : 0.4,
                  cursor: "default",
                  transform: unlocked ? "none" : "scale(0.95)",
                }}

              >
                <img
  src={badge.image}
  alt={badge.title}
  style={{
    width: "64px",
    height: "64px",
    objectFit: "contain",
    marginBottom: "8px",
    filter: unlocked ? "none" : "grayscale(100%)",
    opacity: unlocked ? 1 : 0.4,
    transition: "all 0.3s ease",
  }}
/>


{/* <p className="muted" style={{ fontSize: "12px" }}>
  {unlocked ? "Unlocked" : "Locked"}
</p> */}

                <p style={{ fontWeight: 600 }}>{badge.title}</p>
                <p className="muted" style={{ fontSize: "12px" }}>
                  {unlocked ? "Unlocked" : "Locked"}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= PAST INTERVIEWS ================= */}
      <div>
        <h2 style={{ marginBottom: "16px" }}> Past Interviews</h2>

        {filteredInterviews.map((interview) => (
          <div
            key={interview.id}
            className="glass-card"
            style={{ marginBottom: "14px", cursor: "pointer" }}
            onClick={() =>
              setExpandedId(
                expandedId === interview.id ? null : interview.id
              )
            }
          >
            <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
              <MiniScoreRing score={interview.score} />

              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600 }}>{interview.domain}</p>
                <p className="muted" style={{ fontSize: "13px" }}>
                  {new Date(interview.createdAt).toLocaleDateString()}
                </p>
              </div>

              <span>{expandedId === interview.id ? "▲" : "▼"}</span>
            </div>

            {expandedId === interview.id && (() => {
  const fb = JSON.parse(interview.feedback || "{}");

  return (
    <div style={{ marginTop: "16px" }}>
      <p><strong>Question:</strong> {interview.question}</p>

      <p style={{ marginTop: "8px" }}>
        <strong>Your Answer:</strong> {interview.answer}
      </p>

      <p style={{ marginTop: "12px" }}>
        <strong>Strengths:</strong>
      </p>
      <ul>
        {fb.strengths?.map((s: string, i: number) => (
          <li key={i}>{s}</li>
        ))}
      </ul>

      <p>
        <strong>Weaknesses:</strong>
      </p>
      <ul>
        {fb.weaknesses?.map((w: string, i: number) => (
          <li key={i}>{w}</li>
        ))}
      </ul>

      <p>
        <strong>Improved Answer:</strong>
      </p>
      <p>{fb.improvedAnswer}</p>

      <button
        style={{
          marginTop: "12px",
          padding: "8px 14px",
          borderRadius: "6px",
          background: "#0f172a",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
        onClick={(e) => {
          e.stopPropagation();
          exportInterviewReport(interview);
        }}
      >
        📄 Export PDF
      </button>
    </div>
  );
})()}

          </div>
        ))}
      </div>
    </div>
  </div>
);

}
