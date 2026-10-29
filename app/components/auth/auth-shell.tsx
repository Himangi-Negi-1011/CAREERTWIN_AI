"use client";

import { ArrowLeft, CheckCircle2, Sparkles, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";
import "../landing/landing-clone.css";

const benefits = [
  "Personalized AI Career Twin and adaptive roadmap",
  "Universal AI Course Generation for any skill",
  "Interactive practice labs, objective quizzes, and mastery tracking",
  "Continuous evidence updates for job-readiness",
];

export function AuthShell({
  children,
  eyebrow,
  title,
  description,
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
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
    localStorage.setItem("ct-theme", next);
    window.dispatchEvent(new Event("careertwin:theme"));
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--fg)] relative overflow-hidden transition-colors duration-300">
      {/* Background glow and grid */}
      <div className="hero-bg pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="grid-fade" />
        <div className="grid-veil" />
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8 flex flex-col min-h-screen">
        {/* Navigation Bar */}
        <header className="flex items-center justify-between py-4 border-b border-[var(--border)]">
          <Link href="/" className="brand flex items-center gap-2.5">
            <span className="brand-mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5 text-[var(--primary)]">
                <path d="m12 14 4-4" />
                <path d="M3.34 19a10 10 0 1 1 17.32 0" />
              </svg>
            </span>
            <span className="brand-text font-bold text-lg tracking-tight">
              <span className="grad-text">Career</span>Twin
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="theme-toggle size-9 rounded-xl border border-[var(--border)] grid place-items-center text-[var(--muted)] hover:text-[var(--fg)] hover:border-[var(--primary)] transition"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <Link href="/" className="btn btn-ghost text-xs font-semibold inline-flex items-center gap-1.5 px-3 py-2">
              <ArrowLeft size={14} /> Back to home
            </Link>
          </div>
        </header>

        {/* Main Split Panel */}
        <div className="my-auto py-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center max-w-[1100px] mx-auto w-full">
          {/* Left Hero / Brand Card */}
          <section className="space-y-6">
            <div className="eyebrow inline-flex items-center gap-2">
              <span className="pulse-dot" aria-hidden="true" />
              <span>{eyebrow}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.05]">
              Step into your <br />
              <span className="grad-text">AI Career Twin</span>
            </h1>

            <p className="text-sm leading-relaxed text-[var(--muted)] max-w-lg">
              {description}
            </p>

            <ul className="space-y-3 pt-2 text-xs font-medium text-[var(--fg)]/85">
              {benefits.map((b) => (
                <li key={b} className="flex items-center gap-2.5">
                  <span className="grid size-5 place-items-center rounded-full bg-[var(--primary)]/15 text-[var(--primary)] shrink-0">
                    <CheckCircle2 size={13} />
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] backdrop-blur-md flex items-center justify-between max-w-md">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-400 grid place-items-center text-white">
                  <Sparkles size={18} />
                </div>
                <div>
                  <strong className="block text-xs font-bold">Universal Learning Engine</strong>
                  <span className="text-[11px] text-[var(--muted)]">Generate full courses for any skill</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[var(--primary)]/20 text-[var(--primary)] text-[10px] font-mono font-bold">
                Ready
              </span>
            </div>
          </section>

          {/* Right Auth Container */}
          <section className="rounded-3xl border border-[var(--border-strong)] bg-[var(--card-solid)] p-6 sm:p-8 shadow-2xl relative">
            <div className="mb-6">
              <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--primary)] font-bold">{eyebrow}</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">{title}</h2>
            </div>

            <div className="clerk-auth-wrapper min-h-[360px] flex items-center justify-center">
              {children}
            </div>

            <p className="mt-6 text-center text-[11px] leading-5 text-[var(--muted)]">
              Authentication is securely handled. CareerTwin never stores raw passwords.
            </p>
          </section>
        </div>

        {/* Footer */}
        <footer className="py-4 text-center text-xs text-[var(--muted)] border-t border-[var(--border)]">
          © {new Date().getFullYear()} CareerTwin Inc. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
