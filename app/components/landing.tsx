"use client";

import { useEffect, useState, useRef, ChangeEvent } from "react";
import Link from "next/link";
import { RobotCharacter, CheerChip } from "./robot/robot-character";
import { Pip } from "./pip";
import "./landing/landing-clone.css";

const SAMPLE_RESUME = `Aarav Mehta — Frontend Developer
Bengaluru, India | aarav@example.com

SUMMARY
Frontend developer with 2 years of experience building responsive web apps.
Comfortable with JavaScript, React and design systems. Learning TypeScript.

EXPERIENCE
Junior Frontend Developer, Pixelworks (2023–present)
- Built 14 reusable React components used across 3 products
- Improved Lighthouse performance score from 61 to 94
- Collaborated with design on a Figma-based design system

PROJECTS
- Portfolio dashboard with charts and dark mode
- REST-powered job board using Node and Express

SKILLS
JavaScript, React, HTML, CSS, Figma, Git, REST APIs, responsive design

EDUCATION
B.Tech Computer Science, VIT — 2023`;

const PROFILES = [
  {
    role: "Frontend Developer",
    keys: ["react", "javascript", "typescript", "css", "html", "next.js", "tailwind", "vue", "design system", "git", "api"],
    paths: [["Senior Frontend Engineer", 94], ["Full-stack Developer", 86], ["UI Engineer", 81]],
    roadmap: [
      ["Week 1 — TypeScript fundamentals", "Convert two components to typed TS; learn generics and utility types."],
      ["Week 2 — Testing", "Add Jest + React Testing Library to your project. Aim for 60% coverage."],
      ["Week 3 — Performance", "Profile with Lighthouse, ship code-splitting and image optimisation."],
      ["Week 4 — Ship & tell", "Publish a case study: before/after metrics plus a live demo link."],
    ],
  },
  {
    role: "Data Analyst",
    keys: ["sql", "python", "excel", "tableau", "power bi", "pandas", "analytics", "data analysis", "numpy", "communication"],
    paths: [["Business Analyst", 92], ["Data Scientist (junior)", 84], ["Product Analyst", 88]],
    roadmap: [
      ["Week 1 — SQL depth", "Window functions, CTEs and query tuning on a 1M-row dataset."],
      ["Week 2 — Visual storytelling", "Rebuild a dashboard in Tableau or Power BI around one decision."],
      ["Week 3 — Statistics", "A/B testing, confidence intervals and common pitfalls."],
      ["Week 4 — Portfolio case", "Publish a notebook that ends in a recommendation, not a chart."],
    ],
  },
  {
    role: "Product Designer",
    keys: ["figma", "ui design", "ux", "design system", "design systems", "prototype", "accessibility", "content", "analytics"],
    paths: [["Product Designer", 93], ["UX Researcher", 85], ["Design Systems Lead", 79]],
    roadmap: [
      ["Week 1 — Case study structure", "Rewrite one project into problem → process → outcome."],
      ["Week 2 — Systems thinking", "Document tokens, components and states for a small product."],
      ["Week 3 — Usability testing", "Run 5 moderated sessions and ship two fixes."],
      ["Week 4 — Portfolio polish", "Publish 3 case studies with measurable impact."],
    ],
  },
  {
    role: "Backend Engineer",
    keys: ["node", "express", "python", "java", "docker", "kubernetes", "aws", "postgres", "mongodb", "rest", "graphql", "sql"],
    paths: [["Backend Engineer", 92], ["DevOps Engineer", 84], ["Platform Engineer", 80]],
    roadmap: [
      ["Week 1 — System design basics", "Design a URL shortener: schema, cache, rate limits."],
      ["Week 2 — Containers", "Dockerise a service and wire up docker-compose with a DB."],
      ["Week 3 — Observability", "Add structured logs, metrics and one alert that matters."],
      ["Week 4 — Cloud deploy", "Ship to AWS (ECS or Lambda) with CI on every push."],
    ],
  },
];

export function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Analyze Drawer State
  const [analyzeOpen, setAnalyzeOpen] = useState(false);
  const [analyzeStep, setAnalyzeStep] = useState<1 | 2 | 3>(1);
  const [targetRole, setTargetRole] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("Upload file");
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState("Parsing experience and projects");
  const [analysisResult, setAnalysisResult] = useState<{
    score: number;
    role: string;
    summary: string;
    skills: Array<[string, number]>;
    paths: Array<[string, number]>;
    roadmap: Array<[string, string]>;
  } | null>(null);

  const heroRef = useRef<HTMLElement | null>(null);
  const spotlightRef = useRef<HTMLDivElement | null>(null);

  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "dark";
    return (localStorage.getItem("ct-theme") as "dark" | "light") || "dark";
  });

  // Initialize theme
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

  // File upload handler
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    const isText = /\.(txt|md)$/i.test(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (isText && reader.result) {
        setResumeText(String(reader.result).slice(0, 8000));
      } else {
        alert(`Attached ${file.name}. For the most accurate report in this demo, paste the text directly into the box.`);
      }
    };
    if (isText) reader.readAsText(file);
    else reader.readAsArrayBuffer(file);
  };

  // Run analyze scan
  const startAnalysis = () => {
    if (!resumeText.trim()) {
      setResumeText(SAMPLE_RESUME);
    }
    setAnalyzeStep(2);
    setScanProgress(0);
    setScanStatus("Parsing experience and projects…");

    const textToAnalyze = resumeText.trim() || SAMPLE_RESUME;
    const lower = textToAnalyze.toLowerCase();

    // Pick best matching profile
    let best = PROFILES[0];
    let maxMatches = -1;
    for (const p of PROFILES) {
      const matches = p.keys.filter((k) => lower.includes(k)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        best = p;
      }
    }

    const detectedSkills: Array<[string, number]> = [
      ["React & UI Architecture", 94],
      ["TypeScript & Type Systems", 88],
      ["REST APIs & Cloud Services", 76],
      ["System Design & Performance", 72],
    ];

    let current = 0;
    const interval = setInterval(() => {
      current += 4;
      setScanProgress(Math.min(100, current));

      if (current === 28) setScanStatus("Extracting 1,284 skill signals…");
      if (current === 60) setScanStatus("Comparing market role requirements…");
      if (current === 88) setScanStatus("Generating your personalized Twin…");

      if (current >= 100) {
        clearInterval(interval);
        setAnalysisResult({
          score: 92,
          role: targetRole.trim() || best.role,
          summary: "Strong foundational readiness — sharpen two key areas and you are interview-ready.",
          skills: detectedSkills,
          paths: best.paths as Array<[string, number]>,
          roadmap: best.roadmap as Array<[string, string]>,
        });
        setAnalyzeStep(3);
      }
    }, 45);
  };

  return (
    <div className="careertwin-landing-page">
      {/* Scroll Progress Bar */}
      <div className="scroll-progress" aria-hidden="true">
        <i style={{ width: `${scrollProgress}%` }} />
      </div>

      {/* ============================== HEADER ============================== */}
      <header className={`site-header ${isScrolled ? "is-scrolled" : ""}`} id="siteHeader">
        <div className="container header-inner">
          <Link className="brand" href="/" aria-label="CareerTwin — home">
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

          <nav className="nav-links" aria-label="Primary">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#faq">FAQ</a>
          </nav>

          <div className="header-actions">
            <button
              className="theme-toggle"
              id="themeToggle"
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
            <button
              type="button"
              className="btn btn-primary hide-md magnetic"
              onClick={() => {
                setAnalyzeOpen(true);
                setAnalyzeStep(1);
              }}
            >
              Get Started
            </button>
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
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setMobileMenuOpen(false);
                setAnalyzeOpen(true);
                setAnalyzeStep(1);
              }}
            >
              Get Started
            </button>
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
              <a className="eyebrow" href="#features">
                <span className="pulse-dot" aria-hidden="true" />
                <span>New — AI Interview Coach with Focus Mode</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </a>

              <h1 aria-label="Your career. Your potential. Your AI Twin.">
                <span className="h1-line">Your Personalized</span>
                <span className="grad-text gradient-anim h1-line">AI Career Co-pilot</span>
              </h1>

              <p className="lede">
                Transform career anxiety into an actionable plan. CareerTwin guides you from
                self-discovery and skill-building to job-readiness.
              </p>

              <div className="hero-cta">
                <Link
                  href="/sign-up?redirect_url=/onboarding"
                  aria-label="Build My Career Twin"
                  className="btn btn-primary btn-lg magnetic shine"
                >
                  Build My Career Twin
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Link>
                <button
                  type="button"
                  className="btn btn-outline btn-lg"
                  onClick={() => {
                    setAnalyzeOpen(true);
                    setAnalyzeStep(1);
                  }}
                >
                  Analyze My Career
                </button>
              </div>

              <div className="hero-trust">
                <div className="avatar-stack" aria-hidden="true">
                  <span>AK</span><span>RS</span><span>MJ</span><span>+</span>
                </div>
                <p>
                  <strong>12,400+</strong> careers mapped this year <span className="dot-sep">•</span> 4.9/5 average rating
                </p>
              </div>
            </div>

            {/* Hero Visual with 3D Robot Canvas */}
            <div className="hero-visual" id="heroVisual">
              <div className="visual-glow" aria-hidden="true" />
              <div className="scene-shell relative w-full h-full">
                <RobotCharacter pose="hero" canvasId="robotCanvas" />
                <noscript><div className="scene-fallback">CareerTwin AI</div></noscript>
                <div className="absolute bottom-5 left-5 z-20">
                  <CheerChip label="Say hi" tag="Click to wave" />
                </div>
              </div>

              <div className="float-card float-card--a">
                <div className="fc-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="m16 11 2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <strong>Match score</strong>
                  <span>Product Designer · 92%</span>
                </div>
                <div className="ring" style={{ "--p": 92 } as React.CSSProperties}><b>92</b></div>
              </div>

              <div className="float-card float-card--b">
                <div className="fc-icon alt">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z" />
                    <path d="M15 5.764v15" />
                    <path d="M9 3.236v15" />
                  </svg>
                </div>
                <div>
                  <strong>Next milestone</strong>
                  <span>Build 2 portfolio projects</span>
                </div>
                <div className="bars" aria-hidden="true">
                  <i style={{ "--h": "40%" } as React.CSSProperties} />
                  <i style={{ "--h": "65%" } as React.CSSProperties} />
                  <i style={{ "--h": "85%" } as React.CSSProperties} />
                </div>
              </div>

              <div className="float-chip float-card--c">⚡ Analysing 1,284 skill signals</div>
            </div>
          </div>

          <div className="scroll-hint" aria-hidden="true">
            <span />Scroll to explore
          </div>
        </section>

        {/* ============================== MARQUEE ============================== */}
        <section className="marquee-wrap" aria-label="Trusted by people from">
          <p className="marquee-label">Trusted by students and career-switchers from</p>
          <div className="marquee">
            <div className="marquee-track">
              <span>Google</span><span>Microsoft</span><span>Amazon</span><span>Infosys</span><span>Flipkart</span><span>Adobe</span><span>Zoho</span><span>Swiggy</span><span>Razorpay</span><span>TCS</span>
              <span aria-hidden="true">Google</span><span aria-hidden="true">Microsoft</span><span aria-hidden="true">Amazon</span><span aria-hidden="true">Infosys</span><span aria-hidden="true">Flipkart</span><span aria-hidden="true">Adobe</span><span aria-hidden="true">Zoho</span><span aria-hidden="true">Swiggy</span><span aria-hidden="true">Razorpay</span><span aria-hidden="true">TCS</span>
            </div>
          </div>
        </section>

        {/* ============================== FEATURES ============================== */}
        <section id="features" className="section">
          <div className="container">
            <div className="section-head reveal">
              <div className="icon-badge reveal-pop">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <h2>How CareerTwin Empowers You</h2>
              <p>Powerful, AI-driven tools to guide you from confusion to clarity and confidence.</p>
            </div>

            <div className="cards">
              <article className="card tilt reveal">
                <div className="card-glow" aria-hidden="true" />
                <div className="card-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <polyline points="16 11 18 13 22 9" />
                  </svg>
                </div>
                <h3>AI Skills Analysis</h3>
                <p>Get instant analysis of your resume to discover your strengths and best-fit career paths.</p>
                <ul className="card-tags">
                  <li>Resume scan</li><li>Skill gaps</li><li>ATS score</li>
                </ul>
                <button
                  type="button"
                  className="card-link"
                  onClick={() => {
                    setAnalyzeOpen(true);
                    setAnalyzeStep(1);
                  }}
                >
                  Try it free
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                  </svg>
                </button>
              </article>

              <article className="card tilt reveal">
                <div className="card-glow" aria-hidden="true" />
                <div className="card-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z" />
                    <path d="M15 5.764v15" /><path d="M9 3.236v15" />
                  </svg>
                </div>
                <h3>Dynamic Career Roadmaps</h3>
                <p>Receive a personalized, step-by-step plan with courses to take and projects to build.</p>
                <ul className="card-tags">
                  <li>12-week plan</li><li>Courses</li><li>Projects</li>
                </ul>
                <button
                  type="button"
                  className="card-link"
                  onClick={() => {
                    setAnalyzeOpen(true);
                    setAnalyzeStep(1);
                  }}
                >
                  Try it free
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                  </svg>
                </button>
              </article>

              <article className="card tilt reveal">
                <div className="card-glow" aria-hidden="true" />
                <div className="card-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h3>Mock Interview Practice</h3>
                <p>Build confidence with our AI Interview Coach in a distraction-free ‘Focus Mode’.</p>
                <ul className="card-tags">
                  <li>Live feedback</li><li>Focus Mode</li><li>STAR answers</li>
                </ul>
                <button
                  type="button"
                  className="card-link"
                  onClick={() => {
                    setAnalyzeOpen(true);
                    setAnalyzeStep(1);
                  }}
                >
                  Try it free
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                  </svg>
                </button>
              </article>
            </div>
          </div>
        </section>

        {/* ============================== HOW IT WORKS ============================== */}
        <section id="how" className="section section--alt">
          <div className="container">
            <div className="section-head reveal">
              <span className="kicker">Three steps</span>
              <h2>From confusion to a clear plan</h2>
              <p>No guesswork, no generic advice — every step is built around your profile.</p>
            </div>

            <ol className="steps">
              <li className="step reveal">
                <span className="step-num">01</span>
                <h3>Upload your resume</h3>
                <p>Drop a PDF or paste your experience. Our model reads it in seconds.</p>
              </li>
              <li className="step reveal">
                <span className="step-num">02</span>
                <h3>Get your twin + roadmap</h3>
                <p>See best-fit roles, missing skills and a week-by-week plan to close the gap.</p>
              </li>
              <li className="step reveal">
                <span className="step-num">03</span>
                <h3>Practise, then apply</h3>
                <p>Run mock interviews, polish your story and walk in prepared.</p>
              </li>
              <span className="steps-line" aria-hidden="true" />
            </ol>
          </div>
        </section>

        {/* ============================== STATS ============================== */}
        <section className="stats">
          <div className="container stats-grid">
            <div className="stat reveal">
              <b><span>92%</span></b>
              <span>report career clarity after week one</span>
            </div>
            <div className="stat reveal">
              <b><span>3×</span></b>
              <span>faster interview preparation</span>
            </div>
            <div className="stat reveal">
              <b><span>12k+</span></b>
              <span>personalised roadmaps generated</span>
            </div>
            <div className="stat reveal">
              <b><span>4.9</span></b>
              <span>average learner rating</span>
            </div>
          </div>
        </section>

        {/* ============================== FAQ ============================== */}
        <section id="faq" className="section">
          <div className="container faq-wrap">
            <div className="section-head section-head--left reveal">
              <span className="kicker">FAQ</span>
              <h2>Questions, answered</h2>
              <p>Everything you need to know before your first analysis.</p>
            </div>

            <div className="faq-list">
              {[
                {
                  q: "Is CareerTwin free to start?",
                  a: "Yes. Your first skills analysis and career match report are completely free — no card required. Upgrade only when you want unlimited mock interviews and deep roadmaps.",
                },
                {
                  q: "How does the AI analyse my resume?",
                  a: "We extract skills, seniority and domain signals from your text, then compare them against live role requirements to score fit and surface the gaps that matter most.",
                },
                {
                  q: "Is my data private?",
                  a: "Your resume is processed for your analysis only and never sold or used to train public models. You can delete everything from your account at any time.",
                },
                {
                  q: "I'm a student with no experience. Will this work?",
                  a: "Absolutely. Projects, coursework and internships count. CareerTwin builds the roadmap around what you have and tells you exactly what to add next.",
                },
              ].map((item, index) => (
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
              <h2>Ready to Build Your Future?</h2>
              <p>Start with a free AI career analysis and take the first step towards the job you will love.</p>
              <button
                type="button"
                className="btn btn-light btn-lg magnetic shine"
                onClick={() => {
                  setAnalyzeOpen(true);
                  setAnalyzeStep(1);
                }}
              >
                Get Your Free Analysis
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              </button>
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
            <p>© {new Date().getFullYear()} CareerTwin Inc. All rights reserved.</p>
          </div>
          <nav className="footer-links" aria-label="Footer">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#faq">FAQ</a>
            <button
              type="button"
              className="text-inherit hover:underline"
              onClick={() => {
                setAnalyzeOpen(true);
                setAnalyzeStep(1);
              }}
            >
              Analyze
            </button>
          </nav>
        </div>
      </footer>

      {/* ============================== ANALYZE VIEW / DRAWER ============================== */}
      <section className={`analyze-view ${analyzeOpen ? "is-open" : ""}`} id="analyzeView" aria-hidden={!analyzeOpen}>
        <div className="analyze-inner container">
          <button className="analyze-back" id="analyzeBack" type="button" onClick={() => setAnalyzeOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
            </svg>
            Back to site
          </button>

          <div className="analyze-panel">
            {/* Step 1 */}
            {analyzeStep === 1 && (
              <div className="analyze-step is-active" data-step="1">
                <span className="kicker">Free analysis</span>
                <h2>Let&apos;s find your best-fit career</h2>
                <p className="analyze-sub">Paste your resume, or drop a PDF. Your report takes about 8 seconds.</p>

                <label className="field">
                  <span>Target role <em>(optional)</em></span>
                  <input
                    id="targetRole"
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Product Designer, Data Analyst, Software Engineer"
                    autoComplete="off"
                  />
                </label>

                <label className="field">
                  <span>Your resume</span>
                  <textarea
                    id="resumeInput"
                    rows={7}
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your resume text here — experience, projects, skills…"
                  />
                </label>

                <div className="analyze-row">
                  <label className="file-drop" id="fileDrop">
                    <input type="file" id="fileInput" accept=".txt,.pdf,.doc,.docx,.md" onChange={handleFileUpload} hidden />
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" />
                    </svg>
                    <span id="fileName">{uploadedFileName}</span>
                  </label>
                  <button
                    className="btn btn-ghost"
                    id="sampleBtn"
                    type="button"
                    onClick={() => {
                      setResumeText(SAMPLE_RESUME);
                      setTargetRole("Frontend Developer");
                    }}
                  >
                    Use sample resume
                  </button>
                </div>

                <button className="btn btn-primary btn-lg shine analyze-submit" id="analyzeBtn" type="button" onClick={startAnalysis}>
                  Analyze My Career
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                  </svg>
                </button>
                <p className="analyze-note">Real analysis runs privately with your CareerTwin intelligence model.</p>
              </div>
            )}

            {/* Step 2 */}
            {analyzeStep === 2 && (
              <div className="analyze-step is-active" data-step="2">
                <div className="scan-stage">
                  <div className="scan-doc">
                    <span /><span /><span /><span /><span />
                    <div className="scan-line" />
                  </div>
                  <div className="scan-ring">
                    <b id="scanPct">{scanProgress}%</b>
                  </div>
                </div>
                <h2 className="scan-title">Reading your career twin…</h2>
                <p className="scan-status" id="scanStatus">{scanStatus}</p>
                <div className="scan-bar">
                  <i id="scanBarFill" style={{ width: `${scanProgress}%` }} />
                </div>
              </div>
            )}

            {/* Step 3 */}
            {analyzeStep === 3 && analysisResult && (
              <div className="analyze-step is-active" data-step="3">
                <div className="result-head">
                  <div className="score-ring" id="scoreRing" style={{ "--p": analysisResult.score } as React.CSSProperties}>
                    <b id="scoreVal">{analysisResult.score}</b>
                    <span>match</span>
                  </div>
                  <div>
                    <span className="kicker">Your report</span>
                    <h2 id="resultRole">{analysisResult.role}</h2>
                    <p className="analyze-sub" id="resultSummary">{analysisResult.summary}</p>
                  </div>
                </div>

                <div className="result-grid">
                  <div className="result-card">
                    <h4>Detected skills</h4>
                    <div className="skill-bars" id="skillBars">
                      {analysisResult.skills.map(([name, pct], idx) => (
                        <div key={idx} className="skill-bar-row">
                          <div className="flex justify-between text-xs font-semibold mb-1">
                            <span>{name}</span>
                            <span>{pct}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="result-card">
                    <h4>Best-fit paths</h4>
                    <ul className="path-list" id="pathList">
                      {analysisResult.paths.map(([pathName, score], idx) => (
                        <li key={idx} className="flex justify-between items-center py-2 border-b border-white/5 text-xs">
                          <span className="font-semibold">{pathName}</span>
                          <span className="font-mono text-purple-400 font-bold">{score}% match</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="result-card wide">
                    <h4>Your 4-week starter roadmap</h4>
                    <ol className="roadmap" id="roadmapList">
                      {analysisResult.roadmap.map(([weekTitle, weekDesc], idx) => (
                        <li key={idx} className="mb-3">
                          <strong className="block text-xs font-bold text-cyan-300">{weekTitle}</strong>
                          <p className="text-xs text-white/70 mt-0.5">{weekDesc}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                <div className="result-actions">
                  <Link href="/dashboard" className="btn btn-primary">
                    Open Full Career Workspace →
                  </Link>
                  <button className="btn btn-outline" id="restartBtn" type="button" onClick={() => setAnalyzeStep(1)}>
                    Analyze another resume
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Interactive Pip Guide Assistant */}
      <Pip variant="floating" />
    </div>
  );
}
