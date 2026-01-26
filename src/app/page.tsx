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
        <div className="light-ray ray-1" data-speed="0.4" />
        <div className="light-ray ray-2" data-speed="0.6" />
        <div className="light-ray ray-3" data-speed="0.8" />
      </div>

      {/* ===== SCROLLABLE CONTENT ===== */}
      <main className="page-content">
        {/* NAVBAR */}
<nav className="navbar">
  {/* LEFT */}
  <div className="nav-left">
    <span className="logo">
      <Image src="/images/logo.png" alt="Logo" width={40} height={40} />
      <span>AI Interview</span>
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
  <div className="nav-right">
    <button onClick={handleStartInterview} className="cta">
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
          <div className="nav-right">
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

        {/* ABOUT */}
        <section className="section" id="about">
          <h2>What is AI Mock Interview?</h2>
          <p className="section-subtext">
            A realistic interview simulation platform that helps you practice
            interviews using voice, time limits, and AI-driven feedback.
          </p>

          <div className="card-grid">
            <div className="glass-card feature-card">
  <Image
    src="/images/voice.png"
    alt="Voice based interview"
    width={120}
    height={120}
    className="feature-image"
  />
  <h3>Voice-Based Interviews</h3>
  <p>Answer questions by speaking — just like a real interview.</p>
</div>

            <div className="glass-card feature-card">
  <Image src="/images/ai.png" alt="AI Interviewer" width={120} height={120} />
  <h3>AI Interviewer</h3>
  <p>Questions adapt to your role and experience.</p>
</div>
            <div className="glass-card feature-card">
  <Image src="/images/performance.png" alt="Performance Tracking" width={120} height={120} />
              <h3>Performance Tracking</h3>
              <p>Track scores, strengths, and improvement.</p>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="section" id="how">
          <h2>How It Works</h2>

          <div className="card-grid">
            <div className="glass-card feature-card">
              <Image src="/images/domain.png" alt="Choose domain" width={120} height={120} />
              <h3>Choose Domain</h3>
              <p>Any role — Frontend, Backend, AI, Full Stack, DevOps.</p>
            </div>
            <div className="glass-card feature-card">
              <Image src="/images/answer.png" alt="Answer questions" width={120} height={120} />
              <h3>Answer Questions</h3>
              <p>Speak or type while the AI tracks timing.</p>
            </div>
            <div className="glass-card feature-card">
              <Image src="/images/feedback.png" alt="Get Feedback" width={120} height={120} />
              <h3>Get Feedback</h3>
              <p>Receive score, strengths, and improvements.</p>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="section" id="features">
          <h2>Why It’s Powerful</h2>

          <div className="card-grid">
            <div className="glass-card feature-card">
              <img src="/images/domainlimitless.png" alt="Unlimited Domains" width={120} height={120} />
              <h3>Unlimited Domains</h3>
              <p>No fixed categories — interview for any role.</p>
            </div>
            <div className="glass-card feature-card">
              <img src="/images/nolimit.png" alt="Real AI Evaluation" width={120} height={120} />
              <h3>Real AI Evaluation</h3>
              <p>Feedback is based on your actual answers.</p>
            </div>
            <div className="glass-card feature-card">
              <img src="/images/progress.png" alt="Progress Visualization" width={120} height={120}  />
              <h3>Progress Visualization</h3>
              <p>See improvement across interviews.</p>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="final-cta">
          <h2>Ready to crack your next interview?</h2>
          <p>Practice smarter. Speak confidently. Improve faster.</p>
          <button className="cta-bottom" onClick={() => (location.href = "/signup")}>
            Create Free Account
          </button>
        </section>

        {/* FOOTER */}
        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-brand">
              <span>
              <Image src="/images/logo.png" alt="Logo" width={40} height={40} />
                AI Interview</span>
              <p>
                Practice interviews. Get real feedback.
                <br />
                Build confidence before placements.
              </p>
            </div>

            <div className="footer-links">
              <div>
                <h4>Product</h4>
                <button onClick={() => scrollTo("features")} className="nav-link">Features</button>
                <br /> <br />
                <button onClick={() => scrollTo("how")} className="nav-link">How It Works</button>
                <br /> <br />
                <button className="nav-link" onClick={() => scrollTo("about")}>
              About
            </button>
              </div>


              <div>
                <h4>Get Started</h4>
                <a href="/login">Login</a>
                <br />
                <a href="/signup">Signup</a>
                <br />
                <a href="/dashboard">Dashboard</a>
              </div>
              <div>
                <h4>Contact</h4>
                <p>soniarpita954@gmail.com</p>
                <br />
                <p>https://github.com/Arpitasoni24</p>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            © {new Date().getFullYear()} AI Interview. All rights reserved.
          </div>
        </footer>
      </main>
    </div>
  );
}
