"use client";

import { ArrowLeft, CheckCircle2, Sparkles, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";
import "../landing/landing-clone.css";
import "./login-clone.css";
import { RobotCharacter } from "../robot/robot-character";

export function AuthShell({
  children,
  eyebrow = "Welcome back",
  title = "Log in to continue",
  description = "Access your personalized AI career co-pilot, resume your learning courses, practice interviews, and track skill mastery.",
}: {
  children: ReactNode;
  eyebrow?: string;
  title?: string;
  description?: string;
}) {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "dark";
    return (localStorage.getItem("ct-theme") as "dark" | "light") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("ct-theme", next);
    } catch {
      // sandbox safe
    }
    window.dispatchEvent(new Event("careertwin:theme"));
  };

  const handleCheer = () => {
    window.dispatchEvent(new CustomEvent("careertwin:cheer"));
  };

  return (
    <div className="auth-page min-h-screen bg-[var(--bg)] text-[var(--fg)] relative overflow-hidden transition-colors duration-300">
      {/* Background glow and grid */}
      <div className="auth-bg pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="grid-fade" />
        <div className="grid-veil" />
        <div className="blob blob-1" />
        <div className="blob blob-2" />
      </div>

      {/* Navigation Header */}
      <header className="site-header auth-header">
        <div className="container header-inner flex items-center justify-between">
          <Link href="/" className="brand" aria-label="CareerTwin — home">
            <span className="brand-mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5.6 11.1q2.4-3.1 4.8 0" />
                <path d="M13.6 11.1q2.4-3.1 4.8 0" />
                <path d="M7.6 14.2q4.4 3.5 8.8 0" />
              </svg>
            </span>
            <span className="brand-text">
              <span className="brand-thin">Career</span>
              <span className="brand-strong">Twin</span>
            </span>
          </Link>

          <div className="header-actions flex items-center gap-3">
            <button
              className="theme-toggle"
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {theme === "dark" ? (
                <svg className="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              ) : (
                <svg className="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              )}
            </button>
            <Link href="/" className="btn btn-ghost inline-flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ transform: "rotate(180deg)" }}>
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
              <span className="back-label">Back to site</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Split Layout */}
      <main className="auth-main">
        <div className="container auth-shell">
          {/* Left: 3D Robot + Pitch */}
          <section className="auth-visual" aria-label="CareerTwin assistant">
            <div className="auth-robot-wrap">
              <div className="visual-glow" aria-hidden="true" />
              <RobotCharacter pose="login" canvasId="loginRobot" />

              <div className="float-card auth-float auth-float--a" data-float>
                <div className="fc-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="m16 11 2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <strong>Welcome back</strong>
                  <span>Your roadmap is waiting</span>
                </div>
              </div>

              <button
                className="robot-hint robot-hint--login cursor-pointer"
                type="button"
                onClick={handleCheer}
                aria-label="Say hi to robot assistant"
              >
                <svg className="hint-wave" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11" />
                  <path d="M12 10.5V4.8a1.5 1.5 0 0 1 3 0V11" />
                  <path d="M15 11V6.5a1.5 1.5 0 0 1 3 0v6.2" />
                  <path d="M9 11V9a1.5 1.5 0 0 0-3 0v3.4c0 4.1 2.4 7.1 6.3 7.1 3.3 0 5.7-2.2 5.7-5.5" />
                </svg>{" "}
                Say hi
              </button>

              <div className="float-card auth-float auth-float--b" data-float>
                <div className="fc-icon alt">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div>
                  <strong>Focus Mode</strong>
                  <span>Interview coach ready</span>
                </div>
              </div>
            </div>

            <div className="auth-pitch">
              <h1>
                Pick up where you
                <br />
                <span className="grad-text gradient-anim">left off</span>
              </h1>
              <p>{description}</p>
              <ul className="auth-points">
                <li>
                  <span className="tick" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  Resume analysis history and saved roadmaps
                </li>
                <li>
                  <span className="tick" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  Full interactive courses with practical labs & quizzes
                </li>
                <li>
                  <span className="tick" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  Weekly milestones and verifiable skill evidence
                </li>
              </ul>
            </div>
          </section>

          {/* Right: Authentication Card */}
          <section className="auth-card-wrap">
            <div className="auth-card">
              <div className="auth-card-head mb-4">
                <span className="auth-badge">{eyebrow}</span>
                <h2>{title}</h2>
                <p className="text-xs text-[var(--muted)]">Log in to continue your career plan.</p>
              </div>

              <div className="clerk-auth-container min-h-[360px] flex items-center justify-center">
                {children}
              </div>

              <p className="mt-4 text-center text-[11px] text-[var(--muted)]">
                Authentication is securely handled. CareerTwin never stores raw passwords.
              </p>
            </div>
          </section>
        </div>
      </main>

      <footer className="site-foot py-6 text-center text-xs text-[var(--muted)] border-t border-[var(--border)]">
        <p>© {new Date().getFullYear()} CareerTwin · Built with verifiable evidence & adaptive learning.</p>
      </footer>
    </div>
  );
}
