"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { BrandMark } from "./brand";
import { SplineRobot } from "./spline-robot";
import { openCookieSettings } from "./cookie-consent";
import "./landing/landing-clone.css";

const FAQ_ITEMS = [
  {
    q: "Is CareerTwin completely free to get started?",
    a: "Yes. CareerTwin is 100% free to start. You can create your student account, configure your deterministic Career Twin, access all 14 structured course tracks, take topic practice tests, and build verifiable portfolio projects without any subscription or credit card.",
  },
  {
    q: "How does the deterministic Career Twin differ from generative chatbots?",
    a: "Unlike speculative chat widgets that guess or hallucinate readiness scores, CareerTwin's engine is strictly deterministic. It calculates your career readiness and recommendations solely from verified student inputs: completed lessons, 100-mark exam scores, milestone-checked projects, and evidence logs.",
  },
  {
    q: "What courses and technical tracks are included in CareerTwin Academy?",
    a: "CareerTwin offers 14 full-spectrum engineering tracks aligned with Cisco Networking Academy and Skills for All standards: Python, JavaScript, TypeScript, Cloud Computing, Cybersecurity, SQL & Relational Databases, Power BI, C, C++, C#, Go, Java, PHP, and Rust. Each track proceeds from basic fundamentals to deep architecture.",
  },
  {
    q: "How do the 100-mark mock examinations work?",
    a: "Each course features timed, 28-question, 100-mark comprehensive examinations with instant grading. The assessment evaluates syntax output predictions, multi-step debugging, and architectural scenarios server-side with zero leaked answer keys and provides a detailed section-by-section scorecard.",
  },
  {
    q: "How do the LeetCode-style practice labs evaluate solutions?",
    a: "Practice labs run directly in your browser with real-time automated test assertion suites. You write code against explicit unit test specifications, run the test runner, inspect error traces, and earn verified skill proof once all edge-case tests pass.",
  },
  {
    q: "How do guided projects and portfolio integration work?",
    a: "Guided projects are structured across 4 progressive tiers (Beginner, Intermediate, Advanced, and Capstone). As you complete code tasks and record GitHub repository links, projects automatically attach to your public verifiable portfolio page with cryptographic evidence stamps.",
  },
  {
    q: "What categories of career opportunities are refreshed daily?",
    a: "CareerTwin aggregates and verifies technical opportunities across internships, hackathons, open-source fellowships, graduate trainee programs, and junior engineering roles, filtering them against your exact verified skill profile.",
  },
  {
    q: "How does CareerTwin protect student privacy and data persistence?",
    a: "Your career profile, learning progress, and exam scores are encrypted and isolated per user. Guest drafts remain private in your local browser sandbox and synchronize seamlessly to your secure backend record once you authenticate.",
  },
];

const CORE_FEATURES = [
  {
    num: "01",
    tag: "Deterministic AI",
    title: "Deterministic AI Career Twin",
    desc: "Calculates your career readiness score strictly from demonstrable code submissions, 100-mark examinations, and milestone reviews with zero invented numbers or chat hallucinations.",
  },
  {
    num: "02",
    tag: "Cisco NetAcad Aligned",
    title: "14 Production-Grade Tracks",
    desc: "Authored curriculums from beginner foundations to enterprise architecture covering Python, Cloud Computing, Cybersecurity, TypeScript, SQL, Go, Rust, and Power BI.",
  },
  {
    num: "03",
    tag: "Hands-On Runtime",
    title: "LeetCode-Style Practice Labs",
    desc: "Interactive coding environments with live test evaluation. Write solutions, execute test suites against real edge cases, and earn verifiable skill proof directly in your browser.",
  },
  {
    num: "04",
    tag: "Authoritative Testing",
    title: "100-Mark Comprehensive Exams",
    desc: "28-question timed assessments featuring syntax output predictions, multi-step debugging, and architectural scenarios. Scored securely server-side with zero leaked answers.",
  },
  {
    num: "05",
    tag: "9 Pedagogical Modes",
    title: "AI Master Tutor & Coach",
    desc: "Interact with your AI Tutor in Socratic, Code Review, Deep Explainer, or Exam Prep modes. Ask questions on any chapter topic and receive rigorous, curriculum-grounded guidance.",
  },
  {
    num: "06",
    tag: "Verified Credentials",
    title: "Cryptographic Portfolio & Proof",
    desc: "Transform completed course milestones, GitHub submissions, and exam credentials into a tamper-proof public showcase link designed for recruiters and campus placement teams.",
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
            <BrandMark className="size-9" />
            <span className="brand-text">
              <span className="brand-thin">Career</span>
              <span className="brand-strong">Twin</span>
            </span>
          </Link>

          {/* Navigation Bar with proper spacing */}
          <nav className="nav-links flex items-center gap-7 text-sm font-semibold" aria-label="Primary">
            <a href="#features" className="hover:text-purple-400 transition-colors">Features</a>
            <a href="#how" className="hover:text-purple-400 transition-colors">How it works</a>
            <a href="#faq" className="hover:text-purple-400 transition-colors">FAQ</a>
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
          <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
          <a href="#how" onClick={() => setMobileMenuOpen(false)}>How it works</a>
          <a href="#faq" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
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

        {/* ============================== FEATURES & CAPABILITIES ============================== */}
        <section id="features" className="section">
          <div className="container">
            <div className="section-head text-center max-w-3xl mx-auto">
              <span className="kicker">Core Capabilities</span>
              <h2>Engineered for Deep Learning & Verifiable Career Readiness</h2>
              <p>Six structured pillars bridging the gap between beginner tutorials and production enterprise engineering.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {CORE_FEATURES.map((feat) => (
                <div
                  key={feat.title}
                  className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/90 p-7 shadow-xs hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/5 transition duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/50 px-2.5 py-1 rounded-full">
                        {feat.tag}
                      </span>
                      <span className="font-mono text-xs font-semibold text-slate-400">
                        {feat.num}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">
                      {feat.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                  <div className="pt-6 mt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-semibold text-purple-600 dark:text-purple-400">
                    <Link href="/onboarding" className="inline-flex items-center gap-1.5 hover:underline">
                      <span>Explore Capability</span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
                        <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================== HOW IT WORKS (10-STEP STUDENT LIFECYCLE) ============================== */}
        <section id="how" className="section section--alt">
          <div className="container">
            <div className="section-head text-center max-w-3xl mx-auto">
              <span className="kicker">Student Journey</span>
              <h2>From Zero to Career-Ready in 10 Steps</h2>
              <p>A systematic, transparent learning path engineered to transform beginners into employed professionals.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-8">
              {LIFECYCLE_STEPS.map((step) => (
                <div
                  key={step.num}
                  className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-5 space-y-2.5 shadow-2xs"
                >
                  <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md inline-block">
                    {step.num}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
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
            <div className="section-head section-head--left">
              <span className="kicker">FAQ</span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Everything you need to know about learning, assessments, and career tracking.
              </p>
            </div>

            <div className="faq-list">
              {FAQ_ITEMS.map((item, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={index} className={`faq-item ${isOpen ? "is-open" : ""}`}>
                    <button
                      className="faq-q text-slate-900 dark:text-white font-semibold"
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      aria-expanded={isOpen}
                    >
                      <span>{item.q}</span>
                      <i aria-hidden="true" />
                    </button>
                    <div className="faq-a">
                      <div className="faq-a-inner">
                        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{item.a}</p>
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
            <div className="cta-band">
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
              <BrandMark className="size-9" />
              <span className="brand-text">
                <span className="brand-thin">Career</span>
                <span className="brand-strong">Twin</span>
              </span>
            </Link>
            <p>© {new Date().getFullYear()} CareerTwin Academy. All rights reserved.</p>
          </div>
          <nav className="footer-links" aria-label="Footer">
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
