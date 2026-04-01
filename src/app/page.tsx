"use client";

import { useEffect } from "react";
import {useRouter} from "next/navigation";
import { useState } from "react";
import Image from 'next/image';


export default function HomePage() {
 
  // Always start at top
  useEffect(() => {
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);
  const [menuOpen, setMenuOpen] = useState(false);
  // Parallax light rays
  useEffect(() => {
    const rays = document.querySelectorAll<HTMLElement>(".light-ray");

    const handleScroll = () => {
      const scrollY = window.scrollY;
      rays.forEach((ray) => {
        const speed = Number(ray.dataset.speed || 0.1);
        ray.style.transform = `translateY(${scrollY * speed}px)`;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };
   const router = useRouter();
  const handleStartInterview = async () => {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include", 
      });

      if (res.ok) {
        router.push("/interview");
      } else {
        router.push("/login");
      }
    } catch {
      router.push("/login");
    }
  };

  return (
    
    <div className="page-root">
      {/* ===== BACKGROUND ONLY ===== */}
      <div className="global-bg">
        
      </div>
<head>
  <title>InterviewGuide</title>
</head>
      {/* ===== SCROLLABLE CONTENT ===== */}
      <main className="page-content">
        {/* NAVBAR */}
<nav className="navbar">
  {/* LEFT */}
  <div className="nav-left">
    <span className="logo">
      <Image src="/images/logo.png" alt="Logo" width={40} height={40} />
      <span>InterviewGuide</span>
    </span>
  </div>

  {/* CENTER LINKS (DESKTOP ONLY) */}
  <div className="nav-center">
    <button className="nav-link" onClick={() => scrollTo("features")}>
      Features
    </button>
    <button className="nav-link" onClick={() => scrollTo("how")}>
      How It Works
    </button>
    <button className="nav-link" onClick={() => scrollTo("about")}>
      About
    </button>
  </div>

  {/* RIGHT */}
  <div className="hero-actions">
    <button onClick={handleStartInterview} className="nav-btn primary">
      Start Mock Interview
    </button>

    {/* HAMBURGER (MOBILE ONLY) */}
    <button
      className="hamburger"
      onClick={() => setMenuOpen(!menuOpen)}
    >
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z"/></svg>
    </button>
  </div>

  {/* BACKDROP */}
{menuOpen && (
  <div
    className="drawer-backdrop"
    onClick={() => setMenuOpen(false)}
  />
)}

{/* SLIDE DRAWER */}
<div className={`drawer ${menuOpen ? "open" : ""}`}>
  <div className="drawer-header">
    <span>Menu</span>
    <button onClick={() => setMenuOpen(false)}><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M560-280 360-480l200-200v400Z"/></svg></button>
  </div>

  <button onClick={() => { scrollTo("features"); setMenuOpen(false); }}>
    Features
  </button>
  <button onClick={() => { scrollTo("how"); setMenuOpen(false); }}>
    How It Works
  </button>
  <button onClick={() => { scrollTo("about"); setMenuOpen(false); }}>
    About
  </button>
</div>
</nav>

        {/* HERO SECTION */}
        <section className="hero-section">
          <h1 className="glow-heading">
            Turn interview anxiety into confidence with AI-powered practice.
          </h1>
          <p className="glow-subtext">
            Practice real interview questions, speak your answers, and get
            structured AI feedback — just like a real interviewer.
          </p>
          <div className="hero-actions">
            <button
              className="nav-btn ghost"
              onClick={() => (location.href = "/login")}
            >
              Login
            </button>
            <button
              className="nav-btn primary"
              onClick={() => (location.href = "/signup")}
            >
              Get Started
            </button>
          </div>
        </section>
        <div className="section-divider" />

        {/* ABOUT */}
        <section className="about-section" id="about">

  <div className="about-header">
    <h2 className="gradient-heading">
      What is AI Mock Interview?
    </h2>

    <p className="section-subtext">
      A realistic interview simulation platform designed to help you
      practice with voice, time limits, and AI-powered feedback.
    </p>
  </div>

  <div className="features-grid">

    <div className="feature-card">
      <div className="feature-image-wrapper">
        <Image
          src="/images/voice.png"
          alt="Voice based interview"
          width={100}
          height={100}
        />
      </div>
      <h3>Voice-Based Interviews</h3>
      <p>Answer questions naturally by speaking — just like real interviews.</p>
    </div>

    <div className="feature-card">
      <div className="feature-image-wrapper">
        <Image
          src="/images/ai.png"
          alt="AI Interviewer"
          width={100}
          height={100}
        />
      </div>
      <h3>AI Interviewer</h3>
      <p>Smart questions tailored to your role and experience level.</p>
    </div>

    <div className="feature-card">
      <div className="feature-image-wrapper">
        <Image
          src="/images/performance.png"
          alt="Performance Tracking"
          width={100}
          height={100}
        />
      </div>
      <h3>Performance Tracking</h3>
      <p>Track your progress with detailed analytics and insights.</p>
    </div>

  </div>

</section>
        <div className="section-divider" />
<section className="split-highlight">

  {/* LEFT */}
  <div className="split-left">
    <h2 className="gradient-heading">
      Practice Like It’s Real
    </h2>

    <p className="split-text">
      Experience timed interviews, voice responses, and real-time AI
      evaluation — just like a real interview environment.
    </p>

    <div className="split-points">
      <span>⏱ Timed Sessions</span>
      <span>🎤 Voice Input</span>
      <span>🤖 AI Feedback</span>
    </div>
  </div>

  {/* RIGHT */}
  <div className="split-right">

    <div className="voice-card">

      <div className="voice-header">
        <span className="voice-dot" />
        <p>AI Listening...</p>
      </div>

      {/* ORB */}
      <div className="voice-orb-ui" />

      {/* WAVE LINE */}
      <div className="pulse-line" />

    </div>

  </div>

</section>

<div className="section-divider" />

        {/* HOW IT WORKS */}
        

        <section className="how-section" id="how">

  <div className="how-header">
    <h2>How It Works</h2>
    <p className="muted">
      A simple 3-step process to level up your interview skills
    </p>
  </div>

  <div className="timeline-modern">

    <div className="step-card">
      <div className="step-number">01</div>
      <h3>Choose Domain</h3>
      <p>Select your role and difficulty level</p>
    </div>

    <div className="step-card">
      <div className="step-number">02</div>
      <h3>Answer Questions</h3>
      <p>Speak or type your responses in real-time</p>
    </div>

    <div className="step-card">
      <div className="step-number">03</div>
      <h3>Get Feedback</h3>
      <p>AI analyzes and improves your answers</p>
    </div>

  </div>

</section>

<div className="section-divider" />

        {/* FEATURES */}
       <section className="features-section" id="features">

  <div className="features-header">
    <h2 className="gradient-heading">
      Why It’s Powerful
    </h2>

    <p className="section-subtext">
      Built to simulate real interviews with intelligence, flexibility, and deep insights.
    </p>
  </div>

  <div className="features-grid">

    <div className="feature-card highlight">
      <div className="feature-image-wrapper">
        <img src="/images/domainlimitless.png" alt="Unlimited Domains" />
      </div>
      <h3>Unlimited Domains</h3>
      <p>No fixed categories — practice for any role, from tech to management.</p>
    </div>

    <div className="feature-card highlight">
      <div className="feature-image-wrapper">
        <img src="/images/nolimit.png" alt="Real AI Evaluation" />
      </div>
      <h3>Real AI Evaluation</h3>
      <p>AI analyzes your actual responses, not templates or keywords.</p>
    </div>

    <div className="feature-card highlight">
      <div className="feature-image-wrapper">
        <img src="/images/progress.png" alt="Progress Visualization" />
      </div>
      <h3>Progress Visualization</h3>
      <p>Track your growth with analytics, trends, and performance insights.</p>
    </div>

  </div>

</section>

        <div className="section-divider" />

        {/* FINAL CTA */}
        <section className="final-cta">

  <div className="cta-content">

    <h2 className="cta-heading">
      Ready to crack your next interview?
    </h2>

    <p className="cta-subtext">
      Practice smarter. Speak confidently. Improve faster.
    </p>

    <button
      className="cta-primary"
      onClick={() => (location.href = "/signup")}
    >
       Create Free Account
    </button>

  </div>

</section>

        {/* FOOTER */}
        <footer className="footer">

  <div className="footer-inner">

    {/* BRAND */}
    <div className="footer-brand">
      <div className="footer-logo">
        <Image src="/images/logo.png" alt="Logo" width={36} height={36} />
        <span>InterviewGuide</span>
      </div>

      <p>
        Practice interviews. Get real feedback.
        <br />
        Build confidence before placements.
      </p>
    </div>

    {/* LINKS */}
    <div className="footer-links">

      <div>
        <h4>Product</h4>
        <button onClick={() => scrollTo("features")} className="footer-link">Features</button>
        <button onClick={() => scrollTo("how")} className="footer-link">How It Works</button>
        <button onClick={() => scrollTo("about")} className="footer-link">About</button>
      </div>

      <div>
        <h4>Get Started</h4>
        <a href="/login">Login</a>
        <a href="/signup">Signup</a>
        <a href="/dashboard">Dashboard</a>
      </div>

      <div>
        <h4>Contact</h4>
        <a href="mailto:soniarpita954@gmail.com">Email</a>
        <a href="https://github.com/Arpitasoni24" target="_blank">GitHub</a>
      </div>

    </div>

  </div>

  <div className="footer-bottom">
    © {new Date().getFullYear()} InterviewGuide. All rights reserved.
  </div>

</footer>
      </main>
    </div>
  );
}