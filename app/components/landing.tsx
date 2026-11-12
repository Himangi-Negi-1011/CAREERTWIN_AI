"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { CheerChip } from "./robot/robot-character";
import { SplineRobot } from "./spline-robot";
import { openCookieSettings } from "./cookie-consent";
import "./landing/landing-clone.css";

const FAQ_ITEMS = [
  {
    q: "Is CareerTwin completely free to get started?",
    a: "Yes. CareerTwin is 100% free to start. You can create your account, configure your deterministic Career Twin, access all 14 structured course tracks, take topic practice papers, and build portfolio projects without any subscription or credit card.",
  },
  {
    q: "How does the deterministic Career Twin differ from generative chatbots?",
    a: "Unlike speculative chat widgets that guess or invent readiness scores, CareerTwin’s Twin engine is strictly deterministic. It calculates your career readiness and recommendations solely from verified student inputs: completed lessons, 100-mark exam scores, milestone-checked projects, and evidence logs.",
  },
  {
    q: "What courses and technical tracks are included in CareerTwin Academy?",
    a: "CareerTwin Academy includes 14 production-grade engineering tracks aligned with Cisco Networking Academy and Skills for All standards: Python, JavaScript, TypeScript, Cloud Computing, Cybersecurity, SQL & Relational Databases, Power BI, C, C++, C#, Go, Java, PHP, and Rust.",
  },
  {
    q: "How do the 100-mark mock examinations work?",
    a: "Each course features timed, 28-question, 100-mark comprehensive examinations with strict server-side evaluation. Exams include single-choice questions, code snippet output predictions, debugging exercises, and architectural scenarios with authoritative topic-wise scorecards.",
  },
  {
    q: "How do guided projects and portfolio integration work?",
    a: "The Guided Projects Library provides practical specifications across 4 difficulty tiers: Beginner, Intermediate, Advanced, and Capstone. Students follow milestone checklists, submit GitHub repository links and demo URLs, and showcase verified projects on their public student portfolio.",
  },
  {
    q: "What categories of career opportunities are refreshed daily?",
    a: "The Career Center continuously updates listings across 10 distinct categories: Internships, Entry-Level Jobs, Graduate Roles, Hackathons, Competitive Programming, Scholarships, Fellowships, Training Programs, Industry Certifications, and Technical Workshops.",
  },
  {
    q: "How does CareerTwin protect student privacy and data persistence?",
    a: "Your data is yours alone. CareerTwin never sells student resumes, code, or learning records to third parties. We use isolated guest and authenticated storage models, encrypt telemetry, and provide complete controls to review, export, or delete your records at any time.",
  },
  {
    q: "Can complete beginners without prior programming experience use CareerTwin?",
    a: "Absolutely. Every technical course begins from absolute zero with real-world analogies, syntax breakdowns, step-by-step code walkthroughs, visual mental models, and interactive practice papers before advancing to professional architectures.",
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
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const heroRef = useRef<HTMLElement | null>(null);
  const spotlightRef = useRef<HTMLDivElement | null>(null);

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

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 12);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(max > 0 ? (y / max) * 100 : 0);
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
        <i style={{ width: `${scrollProgress}%` }} />
      </div>

      {/* ============================== HEADER ============================== */}
      <header className={`site-header ${isScrolled ? "is-scrolled" : ""}`} id="header">
        <div className="container header-inner">
          <Link className="brand magnetic" href="/">
            <span className="brand-mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m12 14 4-4" />
                <path d="M3.34 19a10 10 0 1 1 17.32 0" />
              </svg>
            </span>
            <span className="brand-text">
              <span className="grad-text">Career</span>Twin
            </span>
          </Link>

          <nav className="site-nav" aria-label="Primary">
            <a href="#features">Features</a>
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
          <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
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

      <main id="home">
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

            <div className="hero-visual" aria-label="Interactive 3D CareerTwin Robot">
              <div className="visual-glow" aria-hidden="true" />
              <div className="scene-shell">
                <SplineRobot className="w-full h-full min-h-[480px]" />
              </div>
              <CheerChip label="14 Full Courses" tag="Python, Cloud, Security" />
              <CheerChip label="Examinations" tag="100-Mark Assessment" />
              <CheerChip label="Verified Evidence" tag="Zero Invented Scores" />
            </div>
          </div>
        </section>

        {/* ============================== FEATURES ============================== */}
        <section id="features" className="section">
          <div className="container">
            <div className="section-head reveal">
              <span className="kicker">Core Capabilities</span>
              <h2>Engineered for Technical Mastery</h2>
              <p>Everything you need to progress from complete beginner to production-ready engineer.</p>
            </div>

            <div className="features-grid">
              <article className="card tilt reveal">
                <div className="card-glow" aria-hidden="true" />
                <div className="card-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                </div>
                <h3>Deterministic Career Twin</h3>
                <p>Calculate your verified career readiness score based strictly on demonstrated skills and assessments.</p>
                <ul className="card-tags">
                  <li>No hallucinations</li><li>Evidence-backed</li><li>Target role match</li>
                </ul>
                <Link
                  href="/onboarding"
                  className="card-link"
                >
                  Build Your Career Twin
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                  </svg>
                </Link>
              </article>

              <article className="card tilt reveal">
                <div className="card-glow" aria-hidden="true" />
                <div className="card-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                    <path d="M6 6h10" /><path d="M6 10h10" />
                  </svg>
                </div>
                <h3>Cisco NetAcad-Inspired Academy</h3>
                <p>14 complete curriculum tracks featuring 14-point structured lessons, interactive labs, and practice papers.</p>
                <ul className="card-tags">
                  <li>14 tracks</li><li>14-point lessons</li><li>Practice papers</li>
                </ul>
                <Link
                  href="/dashboard?view=learning"
                  className="card-link"
                >
                  Explore Course Catalog
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                  </svg>
                </Link>
              </article>

              <article className="card tilt reveal">
                <div className="card-glow" aria-hidden="true" />
                <div className="card-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h3>100-Mark Examinations</h3>
                <p>Verify technical depth with 28-question timed examinations providing authoritative section scorecards.</p>
                <ul className="card-tags">
                  <li>Timed exams</li><li>Code analysis</li><li>Instant grading</li>
                </ul>
                <Link
                  href="/dashboard?view=practice"
                  className="card-link"
                >
                  Take Practice Exams
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                  </svg>
                </Link>
              </article>
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
                <div key={step.num} className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 reveal">
                  <span className="font-mono text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-md inline-block mb-3">
                    Step {step.num}
                  </span>
                  <h3 className="text-sm font-bold text-white mb-1.5">{step.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================== STATS ============================== */}
        <section className="stats">
          <div className="container stats-grid">
            <div className="stat reveal">
              <b><span>14</span></b>
              <span>Authoritative Course Packages</span>
            </div>
            <div className="stat reveal">
              <b><span>100</span></b>
              <span>Marks Proctored Mock Exams</span>
            </div>
            <div className="stat reveal">
              <b><span>4-Tier</span></b>
              <span>Guided Real-World Projects</span>
            </div>
            <div className="stat reveal">
              <b><span>10</span></b>
              <span>Opportunity Categories Refreshed</span>
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
              {FAQ_ITEMS.map((item, index) => (
                <div key={index} className="faq-item reveal">
                  <button
                    className="faq-q"
                    type="button"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    aria-expanded={openFaq === index}
                  >
                    <span>{item.q}</span>
                    <i aria-hidden="true" />
                  </button>
                  {openFaq === index && (
                    <div className="faq-a">
                      <p>{item.a}</p>
                    </div>
                  )}
                </div>
              ))}
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
              <p>Master technical skills, complete verifiable labs, build enterprise projects, and launch your career.</p>
              <Link
                href="/onboarding"
                className="btn btn-light btn-lg magnetic shine"
              >
                Start Free Learning Now
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ============================== FOOTER ============================== */}
      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <Link className="brand" href="/">
              <span className="brand-mark small">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m12 14 4-4" />
                  <path d="M3.34 19a10 10 0 1 1 17.32 0" />
                </svg>
              </span>
              <span className="brand-text">
                <span className="grad-text">Career</span>Twin
              </span>
            </Link>
            <p>© {new Date().getFullYear()} CareerTwin Academy. All rights reserved.</p>
          </div>
          <nav className="footer-links" aria-label="Footer">
            <a href="#features">Features</a>
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
