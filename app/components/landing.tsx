"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { SplineRobot } from "./spline-robot";
import { openCookieSettings } from "./cookie-consent";
import "./landing/landing-clone.css";

const FAQ_ITEMS = [
  {
    q: "Is CareerTwin completely free to get started?",
    a: "Yes. CareerTwin is 100% free to start. You can create your account, configure your deterministic Career Twin, access all 14 structured course tracks, take topic practice papers, and build portfolio projects without any subscription or credit card.",
  },
  {
    q: "What courses and technical tracks can I learn from zero to advanced?",
    a: "CareerTwin offers 14 full-spectrum engineering tracks aligned with Cisco Networking Academy and Skills for All standards: Python, JavaScript, TypeScript, Cloud Computing, Cybersecurity, SQL & Relational Databases, Power BI, C, C++, C#, Go, Java, PHP, and Rust. Each track proceeds from basic fundamentals to deep architecture.",
  },
  {
    q: "How do the 100-mark examinations and LeetCode-style practice labs work?",
    a: "Every track includes chapter-by-chapter LeetCode-style coding challenges with instant automated test evaluation, hands-on scenario labs, and timed 28-question, 100-mark comprehensive examinations with authoritative topic-wise scorecards and zero leaked answer keys.",
  },
  {
    q: "How does the AI Career Twin help me get hired?",
    a: "Unlike generic chat widgets, your deterministic Career Twin analyzes your completed lessons, verified project code, and exam results to build an evidence-backed skill profile, generate tailored interview prep, and recommend matching internships, hackathons, and entry-level engineering roles.",
  },
];

const LIFECYCLE_STEPS = [
  {
    num: "01",
    title: "Create Student Account",
    desc: "Register securely with email or social authentication to launch your personalized career workspace.",
  },
  {
    num: "02",
    title: "Complete Profile & Background",
    desc: "Record education history, academic coursework, and current career interests without guesswork.",
  },
  {
    num: "03",
    title: "Add Technical Skills & Evidence",
    desc: "Catalog languages, frameworks, and tools backed by practical evidence notes and past work.",
  },
  {
    num: "04",
    title: "Configure Deterministic AI Twin",
    desc: "Your Career Twin analyzes real market requirements and builds an evidence-based competence baseline.",
  },
  {
    num: "05",
    title: "Receive Career Guidance",
    desc: "Get transparent role match percentages, salary expectations, and prioritized next action steps.",
  },
  {
    num: "06",
    title: "Identify Technical Skill Gaps",
    desc: "Pinpoint exact knowledge deficiencies across foundational, intermediate, and advanced competencies.",
  },
  {
    num: "07",
    title: "Follow 12-Week Roadmap",
    desc: "Execute a structured weekly progression plan balancing concepts, labs, and assessment milestones.",
  },
  {
    num: "08",
    title: "Complete In-Depth Courses",
    desc: "Study comprehensive 14-point lessons, hands-on practice labs, and pass 100-mark examinations.",
  },
  {
    num: "09",
    title: "Build 4-Tier Guided Projects",
    desc: "Ship production applications from Beginner to Capstone and publish them to your student portfolio.",
  },
  {
    num: "10",
    title: "Track Career Opportunities",
    desc: "Discover daily verified internships, hackathons, and graduate roles matching your exact skill profile.",
  },
];

export function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const heroRef = useRef<HTMLElement | null>(null);
  const spotlightRef = useRef<HTMLDivElement | null>(null);
  const scrollProgressRef = useRef<HTMLDivElement | null>(null);

  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Initialize theme
  useEffect(() => {
    const saved = (localStorage.getItem("ct-theme") as "dark" | "light") || "dark";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("ct-theme", next);
    window.dispatchEvent(new Event("careertwin:theme"));
  };

  // Scroll handler — optimized to avoid re-rendering whole component
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY;
          const nextScrolled = y > 12;
          setIsScrolled((prev) => (prev !== nextScrolled ? nextScrolled : prev));
          const max = document.documentElement.scrollHeight - window.innerHeight;
          const pct = max > 0 ? (y / max) * 100 : 0;
          if (scrollProgressRef.current) {
            scrollProgressRef.current.style.width = `${pct}%`;
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Spotlight effect
  useEffect(() => {
    const hero = heroRef.current;
    const spot = spotlightRef.current;
    if (!hero || !spot) return;

    const handlePointerMove = (e: PointerEvent) => {
      const r = hero.getBoundingClientRect();
      spot.style.left = `${e.clientX - r.left}px`;
      spot.style.top = `${e.clientY - r.top}px`;
    };

    hero.addEventListener("pointermove", handlePointerMove);
    return () => hero.removeEventListener("pointermove", handlePointerMove);
  }, []);

  // Reveal animations
  useEffect(() => {
    const reveals = document.querySelectorAll(".reveal, .reveal-scale, .reveal-pop");
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-in");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.16, rootMargin: "0px 0px -60px 0px" }
      );
      reveals.forEach((el) => observer.observe(el));
      return () => observer.disconnect();
    } else {
      reveals.forEach((el) => el.classList.add("is-in"));
    }
  }, []);

  return (
    <div className="careertwin-landing-page">
      {/* Scroll Progress Bar */}
      <div className="scroll-progress" aria-hidden="true">
        <i ref={scrollProgressRef} style={{ width: "0%" }} />
      </div>

      {/* ============================== HEADER ============================== */}
      <header className={`site-header ${isScrolled ? "is-scrolled" : ""}`} id="header">
        <div className="container header-inner">
          <Link className="brand magnetic" href="/">
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </span>
            <span className="brand-text">
              <span className="grad-text">Career</span>Twin
            </span>
          </Link>

          {/* Navigation Bar with proper spacing */}
          <nav className="nav-links" aria-label="Primary">
            <a href="#how">How it works</a>
            <a href="#faq">FAQ</a>
            <Link href="/dashboard?view=learning">Academy</Link>
          </nav>

          <div className="header-actions">
            <button
              className="theme-btn"
              id="themeBtn"
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              <svg className="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
              <svg className="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            </button>
            <Link className="btn btn-ghost hide-md" href="/login">
              Login
            </Link>
            <Link className="btn btn-primary hide-md magnetic" href="/onboarding">
              Start Free Learning
            </Link>
            <button
              className="menu-btn"
              id="menuBtn"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Open menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className={`mobile-menu ${mobileMenuOpen ? "is-open" : ""}`} id="mobileMenu" aria-label="Mobile">
          <a href="#how" onClick={() => setMobileMenuOpen(false)}>How it works</a>
          <a href="#faq" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
          <Link href="/dashboard?view=learning" onClick={() => setMobileMenuOpen(false)}>Academy</Link>
          <div className="mobile-menu-actions">
            <Link className="btn btn-outline" href="/login" onClick={() => setMobileMenuOpen(false)}>
              Login
            </Link>
            <Link className="btn btn-primary" href="/onboarding" onClick={() => setMobileMenuOpen(false)}>
              Start Free Learning
            </Link>
          </div>
        </nav>
      </header>

      {/* ============================== MAIN CONTENT ============================== */}
      <main id="main">
        {/* ============================== HERO ============================== */}
        <section ref={heroRef} className="hero" id="hero">
          <div className="hero-bg" aria-hidden="true">
            <div className="grid-fade" />
            <div className="grid-veil" />
            <div className="blob blob-1" />
            <div className="blob blob-2" />
            <div className="blob blob-3" />
            <div ref={spotlightRef} className="spotlight" id="spotlight" />
          </div>

          <div className="container hero-inner">
            <div className="hero-copy">
              <Link className="eyebrow" href="/dashboard?view=learning">
                <span className="pulse-dot" aria-hidden="true" />
                <span>New — 14 Cisco NetAcad-Aligned Engineering Tracks</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>

              <h1 aria-label="Your career. Your potential. Your AI Twin.">
                <span className="h1-line">Your Personalized</span>
                <span className="grad-text gradient-anim h1-line">AI Career Co-pilot</span>
              </h1>

              <p className="lede">
                Transform career anxiety into an actionable engineering roadmap. CareerTwin guides you from
                foundational concepts and 100-mark examinations to enterprise portfolio projects and daily opportunities.
              </p>

              <div className="hero-cta">
                <Link
                  href="/onboarding"
                  className="btn btn-primary btn-lg magnetic shine"
                >
                  Start Free Learning
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Link>
                <Link className="btn btn-outline btn-lg" href="/dashboard?view=learning">
                  Explore Academy
                </Link>
              </div>

              <ul className="hero-facts">
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  14 Verified Course Tracks
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  100-Mark Examinations
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  Real-World Guided Projects
                </li>
              </ul>
            </div>

            {/* Clean Hero Visual without any cluttered chips underneath */}
            <div className="hero-visual" aria-label="Interactive 3D CareerTwin Robot">
              <div className="visual-glow" aria-hidden="true" />
              <div className="scene-shell">
                <SplineRobot className="w-full h-full min-h-[480px]" />
              </div>
            </div>
          </div>
        </section>

        {/* ============================== HOW IT WORKS (10-STEP STUDENT LIFECYCLE) ============================== */}
        <section id="how" className="section section--alt">
          <div className="container">
            <div className="section-head reveal">
              <span className="kicker">Student Journey</span>
              <h2>From Zero to Career-Ready in 10 Steps</h2>
              <p>A systematic, transparent learning path engineered to transform beginners into employed professionals.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-8">
              {LIFECYCLE_STEPS.map((step) => (
                <div
                  key={step.num}
                  className="rounded-2xl border border-ink/8 dark:border-white/10 bg-white dark:bg-slate-900 p-5 space-y-2.5 shadow-2xs reveal"
                >
                  <span className="font-mono text-xs font-bold text-accent dark:text-purple-400 bg-accent/10 dark:bg-purple-950/60 px-2 py-0.5 rounded-md inline-block">
                    {step.num}
                  </span>
                  <h3 className="text-base font-bold text-ink dark:text-white leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate dark:text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================== FAQ ============================== */}
        <section id="faq" className="section">
          <div className="container faq-wrap">
            <div className="section-head section-head--left reveal">
              <span className="kicker">FAQ</span>
              <h2>Frequently Asked Questions</h2>
              <p>Everything you need to know about learning, assessments, and career tracking.</p>
            </div>

            <div className="faq-list">
              {FAQ_ITEMS.map((item, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={index} className={`faq-item reveal ${isOpen ? "is-open" : ""}`}>
                    <button
                      className="faq-q"
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      aria-expanded={isOpen}
                    >
                      <span>{item.q}</span>
                      <i aria-hidden="true" />
                    </button>
                    <div className="faq-a">
                      <div className="faq-a-inner">
                        <p>{item.a}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================== CTA ============================== */}
        <section className="section section--cta">
          <div className="container">
            <div className="cta-band reveal-scale">
              <div className="cta-orbits" aria-hidden="true">
                <span /><span /><span />
              </div>
              <h2>Ready to Build Your Engineering Career?</h2>
              <p>
                Master technical skills, complete verifiable labs, build enterprise projects, and launch your career.
              </p>
              <div className="cta-actions">
                <Link
                  className="btn btn-primary btn-lg magnetic shine"
                  href="/onboarding"
                >
                  Start Free Learning Now
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ============================== FOOTER ============================== */}
      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <Link className="brand" href="/">
              <span className="brand-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </span>
              <span className="brand-text">
                <span className="grad-text">Career</span>Twin
              </span>
            </Link>
            <p>© {new Date().getFullYear()} CareerTwin Academy. All rights reserved.</p>
          </div>
          <nav className="footer-links" aria-label="Footer">
            <a href="#how">How it works</a>
            <a href="#faq">FAQ</a>
            <Link href="/dashboard?view=learning">Academy</Link>
            <Link href="/terms">Terms & Conditions</Link>
            <button
              type="button"
              className="text-inherit hover:underline cursor-pointer"
              onClick={openCookieSettings}
            >
              Cookie Settings
            </button>
          </nav>
        </div>
      </footer>
    </div>
  );
}
