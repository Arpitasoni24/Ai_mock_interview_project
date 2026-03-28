"use client";

import { useState } from "react";
import Image from "next/image";
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    console.log("LOGIN CLICKED");
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
    email: email.trim(),
    password: password.trim(),
  }),
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
        <span className="logo">
              <Image src="/images/logo.png" alt="Logo" width={40} height={40} />
              <span>InterviewGuide</span>
            </span>
            <br />
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

          <button type="submit" disabled={loading} className="button-login">
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="login-footer">
          Don’t have an account?{" "}
          <a href="/signup">Create one</a>
        </p>
      </div>
    </div>
  );
}
