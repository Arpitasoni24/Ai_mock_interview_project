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
const [filterDomain, setFilterDomain] = useState("all");
const [sortBy, setSortBy] = useState("latest");
const [domainFilter, setDomainFilter] = useState("all");
const [minScore, setMinScore] = useState(0);
const filteredInterviews = interviews
  .filter((i) =>
    i.domain.toLowerCase().includes(search.toLowerCase())
  )
  .filter((i) =>
    filterDomain === "all" ? true : i.domain === filterDomain
  )
  .sort((a, b) => {
    if (sortBy === "latest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === "best") {
      return b.score - a.score;
    }
    return 0;
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
  // ------------------------------
  const [search, setSearch] = useState("");
const [filterDomain, setFilterDomain] = useState("all");
const [sortBy, setSortBy] = useState("latest");

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

function generateInsight(analytics: any, interviews: any[]) {
  if (!interviews.length) {
    return "Start your first interview to unlock AI-powered insights.";
  }

  if (analytics.average >= 8) {
    return "Excellent performance. You're consistently scoring high — focus on refining advanced answers.";
  }

  if (analytics.average >= 6) {
    return "Good progress. Try improving clarity and structure in your responses to reach the next level.";
  }

  return "You're getting started. Focus on consistency and practicing daily to build confidence.";
}
function calculateLevelData(interviews: any[]) {
  const totalXP = interviews.length * 20; // 20 XP per interview

  const level = Math.floor(totalXP / 100) + 1;
  const currentXP = totalXP % 100;
  const nextLevelXP = 100;

  return {
    totalXP,
    level,
    currentXP,
    nextLevelXP,
  };
}

const levelData = calculateLevelData(interviews);
  return (
  <div className="bg">
    {/* Background rays */}
    

    <div className="content">

      {/* ================= HEADER ================= */}
      {/* <div
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
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#E5E7EB",
  padding: "10px 16px",
  borderRadius: "10px",
}}
        >
          Logout
        </button>
      </div> */}
      <div className="dashboard-header">
  <div>
    <h1>Interview Dashboard</h1>
    <p className="muted">
      Track your progress and AI-powered insights
    </p>
  </div>

  <div className="header-actions">
    <button
      className="cta"
      onClick={() => (window.location.href = "/interview")}
    >
       New Interview
    </button>

    <button className="logout-btn" onClick={handleLogout}>
      Logout
    </button>
  </div>
</div>

      {/* ================= TOP STATS ================= */}
      <div className="stats-container">

  {/* LEFT — SCORE */}
  <div className="stats-left">
    <CircularProgress value={analytics.average} label="Average Score" />
    <CircularProgress value={analytics.best} label="Best Score" />
  </div>

  {/* RIGHT — CHART */}
  <div className="glass-card stats-chart">
    <h3>Performance Trend</h3>

    <p className="muted">
      Score progression across interviews
    </p>

    <div className="chart-wrapper">
      <ResponsiveContainer width="100%" height="100%">
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
  cursor={{ stroke: "rgba(124,58,237,0.3)", strokeWidth: 2 }}

  contentStyle={{
    background: "rgba(15, 10, 40, 0.6)",
    backdropFilter: "blur(16px)",
    borderRadius: "12px",
    border: "1px solid rgba(124,58,237,0.3)",
    color: "#E5E7EB",
    boxShadow: "0 10px 40px rgba(124,58,237,0.25)",
  }}

  labelStyle={{
    color: "#A855F7",
    fontWeight: 600,
    marginBottom: "4px",
  }}

  itemStyle={{
    color: "#F1F5F9",
    fontSize: "13px",
  }}
/>

          <Line
  type="monotone"
  dataKey="score"
  stroke="#A855F7"
  strokeWidth={3}
  dot={{ r: 4 }}
  activeDot={{
    r: 8,
    stroke: "#fff",
    strokeWidth: 2,
    fill: "#A855F7"
  }}
/>
        </LineChart>
      </ResponsiveContainer>
    </div>

    <p className="muted small-text">
      Performance trends help identify consistency and growth patterns.
    </p>

    <p className="muted small-text">
      Use AI feedback to refine clarity, structure, and confidence.
    </p>
  </div>

</div>

      {/* ================= STREAK + CONSISTENCY ================= */}
      <div className="streak-grid">

  <div className="streak-card purple">
    <div className="card-top">
      <span className="card-icon"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#BD4C31"><path d="M240-400q0 52 21 98.5t60 81.5q-1-5-1-9v-9q0-32 12-60t35-51l113-111 113 111q23 23 35 51t12 60v9q0 4-1 9 39-35 60-81.5t21-98.5q0-50-18.5-94.5T648-574q-20 13-42 19.5t-45 6.5q-62 0-107.5-41T401-690q-39 33-69 68.5t-50.5 72Q261-513 250.5-475T240-400Zm240 52-57 56q-11 11-17 25t-6 29q0 32 23.5 55t56.5 23q33 0 56.5-23t23.5-55q0-16-6-29.5T537-292l-57-56Zm0-492v132q0 34 23.5 57t57.5 23q18 0 33.5-7.5T622-658l18-22q74 42 117 117t43 163q0 134-93 227T480-80q-134 0-227-93t-93-227q0-129 86.5-245T480-840Z"/></svg></span>
      <h3>Current Streak</h3>
    </div>

    <p className="streak-value">{currentStreak} days</p>
    <p className="muted">Consecutive active days</p>
  </div>

  <div className="streak-card gold">
    <div className="card-top">
      <span className="card-icon"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFF55"><path d="m305-704 112-145q12-16 28.5-23.5T480-880q18 0 34.5 7.5T543-849l112 145 170 57q26 8 41 29.5t15 47.5q0 12-3.5 24T866-523L756-367l4 164q1 35-23 59t-56 24q-2 0-22-3l-179-50-179 50q-5 2-11 2.5t-11 .5q-32 0-56-24t-23-59l4-165L95-523q-8-11-11.5-23T80-570q0-25 14.5-46.5T135-647l170-57Zm49 69-194 64 124 179-4 191 200-55 200 56-4-192 124-177-194-66-126-165-126 165Zm126 135Z"/></svg></span>
      <h3>Best Streak</h3>
    </div>

    <p className="streak-value">{bestStreak} days</p>
    <p className="muted">Your longest streak</p>
  </div>

  <div className="streak-card cyan">
    <div className="card-top">
      <span className="card-icon"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#CCDAF5"><path d="M337.5-463Q311-498 289-537q-5 14-6.5 28.5T281-480q0 83 58 141t141 58q14 0 28.5-2t28.5-6q-39-22-74-48.5T396-396q-32-32-58.5-67ZM567-364.5Q630-328 702-308q-40 51-98 79.5T481-200q-117 0-198.5-81.5T201-480q0-65 28.5-123t79.5-98q20 72 56.5 135T453-452q51 51 114 87.5ZM743-380q-20-5-39.5-11T665-405q8-18 11.5-36.5T680-480q0-83-58.5-141.5T480-680q-20 0-38.5 3.5T405-665q-8-19-13.5-38T381-742q24-9 49-13.5t51-4.5q117 0 198.5 81.5T761-480q0 26-4.5 51T743-380ZM440-840v-120h80v120h-80Zm0 840v-120h80V0h-80Zm323-706-57-57 85-84 57 56-85 85ZM169-113l-57-56 85-85 57 57-85 84Zm671-327v-80h120v80H840ZM0-440v-80h120v80H0Zm791 328-85-85 57-57 84 85-56 57ZM197-706l-84-85 56-57 85 85-57 57Zm199 310Z"/></svg></span>
      <h3>Weekly Consistency</h3>
    </div>

    <p className="streak-value">{consistency}%</p>

    {/* 🔥 PROGRESS BAR */}
    <div className="progress-bar">
      <div
        className="progress-fill"
        style={{ width: `${consistency}%` }}
      />
    </div>

    <p className="muted">Last 7 days</p>
  </div>

</div>

{/* =======AI INSIGHT================ */}
<div className="ai-insights glass-card">

  <div className="ai-header">
    <span className="ai-icon"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M160-120v-200q0-33 23.5-56.5T240-400h480q33 0 56.5 23.5T800-320v200H160Zm200-320q-83 0-141.5-58.5T160-640q0-83 58.5-141.5T360-840h240q83 0 141.5 58.5T800-640q0 83-58.5 141.5T600-440H360ZM240-200h480v-120H240v120Zm120-320h240q50 0 85-35t35-85q0-50-35-85t-85-35H360q-50 0-85 35t-35 85q0 50 35 85t85 35Zm28.5-91.5Q400-623 400-640t-11.5-28.5Q377-680 360-680t-28.5 11.5Q320-657 320-640t11.5 28.5Q343-600 360-600t28.5-11.5Zm240 0Q640-623 640-640t-11.5-28.5Q617-680 600-680t-28.5 11.5Q560-657 560-640t11.5 28.5Q583-600 600-600t28.5-11.5ZM480-200Zm0-440Z"/></svg></span>
    <h3>AI Insights</h3>
  </div>

  <p className="ai-text">
    {generateInsight(analytics, interviews)}
  </p>

  <div className="ai-tags">
    <span>Clarity</span>
    <span>Confidence</span>
    <span>Consistency</span>
  </div>

</div>

{/* =============XP================== */}
<div className="level-card">

  <div className="level-header">
    <h3><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M536.5-543.5Q560-567 560-600t-23.5-56.5Q513-680 480-680t-56.5 23.5Q400-633 400-600t23.5 56.5Q447-520 480-520t56.5-23.5ZM280-120v-80h160v-124q-49-11-87.5-41.5T296-442q-75-9-125.5-65.5T120-640v-40q0-33 23.5-56.5T200-760h80v-80h400v80h80q33 0 56.5 23.5T840-680v40q0 76-50.5 132.5T664-442q-18 46-56.5 76.5T520-324v124h160v80H280Zm0-408v-152h-80v40q0 38 22 68.5t58 43.5Zm285 93q35-35 35-85v-240H360v240q0 50 35 85t85 35q50 0 85-35Zm115-93q36-13 58-43.5t22-68.5v-40h-80v152Zm-200-52Z"/></svg> Level {levelData.level}</h3>
    <span className="xp-text">
      {levelData.currentXP} / {levelData.nextLevelXP} XP
    </span>
  </div>

  {/* Progress bar */}
  <div className="level-bar">
    <div
      className="level-fill"
      style={{ width: `${levelData.currentXP}%` }}
    />
  </div>

  <p className="muted small-text">
    Complete interviews to gain XP and level up
  </p>

</div>
      {/* ================= ACHIEVEMENTS ================= */}
      <div className="achievements-section">

  <h2 className="section-title">Achievements</h2>

  <div className="badges-grid">
    {BADGES.map((badge) => {
      const unlocked = badge.unlocked(badgeData);

      return (
        <div
          key={badge.id}
          className={`badge-card ${unlocked ? "unlocked" : "locked"}`}
        >
          <div className="badge-image-wrapper">
            <img
              src={badge.image}
              alt={badge.title}
              className="badge-image"
            />
          </div>

          <p className="badge-title">{badge.title}</p>

          <p className="badge-status">
            {unlocked ? "Unlocked" : "Locked"}
          </p>
        </div>
      );
    })}
  </div>

</div>

{/* ====================================== */}
<div className="filters-bar">

  {/* SEARCH */}
  <input
    type="text"
    placeholder="Search domain..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="filter-input"
  />

  {/* DOMAIN FILTER */}
  <select
    value={filterDomain}
    onChange={(e) => setFilterDomain(e.target.value)}
    className="filter-select"
  >
    <option value="all">All Domains</option>
    {[...new Set(interviews.map((i) => i.domain))].map((d) => (
      <option key={d} value={d}>
        {d}
      </option>
    ))}
  </select>

  {/* SORT */}
  <select
    value={sortBy}
    onChange={(e) => setSortBy(e.target.value)}
    className="filter-select"
  >
    <option value="latest">Latest</option>
    <option value="best">Best Score</option>
  </select>

</div>
      {/* ================= PAST INTERVIEWS ================= */}
      <div className="interviews-section">

  <h2 className="section-title">Past Interviews</h2>

  {filteredInterviews.map((interview) => {
    const isOpen = expandedId === interview.id;
    const fb = JSON.parse(interview.feedback || "{}");

    return (
      <div
        key={interview.id}
        className={`interview-card ${isOpen ? "open" : ""}`}
        onClick={() =>
          setExpandedId(isOpen ? null : interview.id)
        }
      >
        {/* HEADER */}
        <div className="interview-header">

          <MiniScoreRing score={interview.score} />

          <div className="interview-info">
            <p className="interview-domain">{interview.domain}</p>
            <p className="muted small-text">
              {new Date(interview.createdAt).toLocaleDateString()}
            </p>
          </div>

          <span className="toggle-icon">
            {isOpen ? "▲" : "▼"}
          </span>
        </div>

        {/* EXPANDED CONTENT */}
        {isOpen && (
          <div className="interview-details">

            <div className="qa-block">
              <strong>Question</strong>
              <p>{interview.question}</p>
            </div>

            <div className="qa-block">
              <strong>Your Answer</strong>
              <p>{interview.answer}</p>
            </div>

            <div className="feedback-grid">

              <div className="feedback-card good">
                <strong>Strengths</strong>
                <ul>
                  {fb.strengths?.map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="feedback-card bad">
                <strong>Weaknesses</strong>
                <ul>
                  {fb.weaknesses?.map((w: string, i: number) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>

            </div>

            <div className="qa-block improved">
              <strong>Improved Answer</strong>
              <p>{fb.improvedAnswer}</p>
            </div>

            <button
              className="export-btn"
              onClick={(e) => {
                e.stopPropagation();
                exportInterviewReport(interview);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M360-460h40v-80h40q17 0 28.5-11.5T480-580v-40q0-17-11.5-28.5T440-660h-80v200Zm40-120v-40h40v40h-40Zm120 120h80q17 0 28.5-11.5T640-500v-120q0-17-11.5-28.5T600-660h-80v200Zm40-40v-120h40v120h-40Zm120 40h40v-80h40v-40h-40v-40h40v-40h-80v200ZM320-240q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320Zm0-80h480v-480H320v480ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm160-720v480-480Z"/></svg>Export PDF
            </button>

          </div>
        )}
      </div>
    );
  })}
  {filteredInterviews.length === 0 && (
  <div className="empty-state">
    <h3>No interviews found</h3>
    <p>Try adjusting your filters</p>
  </div>
)}

</div>
    </div>
  </div>
);

}

