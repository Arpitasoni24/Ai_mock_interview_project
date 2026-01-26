"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h1 className="login-title">Welcome back</h1>
        <p className="login-subtitle">
          Practice interviews. Improve answers. Get confident.
        </p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleLogin} className="login-form">
          <label>
            Email
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="login-footer">
          Don’t have an account?{" "}
          <a href="/signup">Create one</a>
        </p>
      </div>

      {/* STYLES */}
      <style jsx>{`
        .login-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background:
            radial-gradient(60% 60% at 20% 10%, #0f172a, transparent),
            radial-gradient(40% 40% at 80% 90%, #020617, transparent),
            #020617;
        }

        .login-card {
          width: 100%;
          max-width: 380px;
          padding: 32px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(18px);
          box-shadow: 0 40px 80px rgba(0, 0, 0, 0.5);
          color: #e5e7eb;
          animation: fadeIn 0.6s ease;
        }

        .login-title {
          font-size: 26px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .login-subtitle {
          margin-top: 6px;
          margin-bottom: 24px;
          font-size: 14px;
          color: #94a3b8;
        }

        .login-error {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fecaca;
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 13px;
          margin-bottom: 16px;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        label {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 13px;
          color: #cbd5f5;
        }

        input {
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          background: rgba(2, 6, 23, 0.7);
          color: #e5e7eb;
          outline: none;
          transition: border 0.2s ease, box-shadow 0.2s ease;
        }

        input::placeholder {
          color: #64748b;
        }

        input:focus {
          border-color: #38bdf8;
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.25);
        }

        button {
          margin-top: 8px;
          padding: 12px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, #38bdf8, #0ea5e9);
          color: #020617;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        button:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 30px rgba(56, 189, 248, 0.4);
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-footer {
          margin-top: 18px;
          font-size: 13px;
          color: #94a3b8;
          text-align: center;
        }

        .login-footer a {
          color: #38bdf8;
          text-decoration: none;
          font-weight: 500;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
