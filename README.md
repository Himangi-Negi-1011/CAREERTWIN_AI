<div align="center">

# 🌟 CareerTwin AI

### Next-Generation AI Career Intelligence, Personalized Skill Roadmaps & Mastery Platform

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Clerk Auth](https://img.shields.io/badge/Auth-Clerk-6C47FF?style=for-the-badge&logo=clerk)](https://clerk.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![Tests Passing](https://img.shields.io/badge/Tests-84%2F84%20Passing-brightgreen?style=for-the-badge&logo=vitest)](https://vitest.dev/)
[![Vercel Ready](https://img.shields.io/badge/Deployment-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/)

<p align="center">
  <strong>CareerTwin</strong> is a production-grade, privacy-first career intelligence platform that turns approved user profiles into transparent skill topologies, adaptive learning roadmaps, interactive curricula, and realistic mock interview coaching.
</p>

[Explore Capabilities](#-core-capabilities) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [Environment Variables](#-configuration--environment-variables) • [Testing](#-testing--quality-assurance)

---

</div>

## 📖 Table of Contents

- [Overview & Philosophy](#-overview--philosophy)
- [Core Capabilities](#-core-capabilities)
  - [1. Aura Assistant Landing & Auth Shell](#1-aura-assistant-landing--auth-shell)
  - [2. Multi-Step Career Profile Wizard](#2-multi-step-career-profile-wizard)
  - [3. Deterministic Career Twin Engine](#3-deterministic-career-twin-engine)
  - [4. Transparent Skill Gap Topology](#4-transparent-skill-gap-topology)
  - [5. Adaptive Milestone Roadmaps](#5-adaptive-milestone-roadmaps)
  - [6. Interactive Learning Studio](#6-interactive-learning-studio)
  - [7. AI Career & Mock Interview Coach](#7-ai-career--mock-interview-coach)
  - [8. Weekly Planner & Focus Studio](#8-weekly-planner--focus-studio)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Configuration & Environment Variables](#-configuration--environment-variables)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Security & Data Privacy](#-security--data-privacy)
- [Contributing & License](#-contributing--license)

---

## 💡 Overview & Philosophy

Most career tools rely on decorative scores, hallucinations, or opaque AI claims that promise outcomes they cannot verify. **CareerTwin** is engineered differently:

1. **Deterministic Core First**: All skill classifications, roadmap task dependencies, and progress percentages are computed with strict mathematical determinism. Generative AI layers advisory insights on top, but never hallucinates facts.
2. **Evidence-Led Progression**: Skills are only marked *Demonstrated* when verified against tangible project proof, code repositories, or rigorous evaluations.
3. **Graceful Fallbacks**: If AI providers or network credentials are offline, the entire core platform remains completely functional with local heuristics and browser drafts.
4. **Private by Design**: Full row-level security (RLS) with Clerk-authenticated owner-scoped namespaces. Third-party AI providers never receive unapproved personal identifiable information (PII).

---

## ✨ Core Capabilities

### 1. Aura Assistant Landing & Auth Shell
- Modern, tactile SaaS landing design featuring glassmorphism cards, interactive product previews, and micro-animations.
- Seamless authentication with **Clerk**: integrated sign-in and sign-up with path-based routing, server-validated sessions, and graceful fallback when credentials are unconfigured.
- Responsive floating navigation pill with Clerk `<Show when="signed-out">` and `<Show when="signed-in">` user menus.

### 2. Multi-Step Career Profile Wizard
- 7-step guided onboarding: Target Role selection, Education history, Core & Specialized Skills, Real Projects, Career Interests, and Resume attachment.
- Automatic profile completeness calculation and live resume text extraction with user review gates.

### 3. Deterministic Career Twin Engine
- Ingests user evidence and target expectations to compute a canonical **Career Twin** state.
- Produces prioritized next recommended actions, skill confidence distributions, and actionable guidance without inflated percentages.

### 4. Transparent Skill Gap Topology
- Categorizes all target-role competencies into four discrete tiers:
  - 🟢 **Demonstrated**: Backed by documented evidence and completed projects.
  - 🟣 **Developing**: Actively in progress within current roadmap milestones.
  - 🟡 **Assessed**: Evaluated through quizzes or mock interviews.
  - ⚪ **Unverified**: Missing evidence; prioritized for immediate learning.

### 5. Adaptive Milestone Roadmaps
- Automatically breaks complex skill targets into modular tasks and portfolio-grade capstone projects.
- One-click progress tracking with time estimation, milestone check-offs, and state synchronization.

### 6. Interactive Learning Studio
- Curated curriculum catalog covering Frontend, Backend, Machine Learning, Data Analytics, and Systems Engineering.
- **Deep Lesson Viewer**: Step-by-step modular lessons with theory, code snippets, and key takeaways.
- **AI Tutor Chat**: Contextual question-answering grounded strictly in the lesson material.
- **Objective Knowledge Quizzes**: Multi-question assessments with instant rubric scoring and detailed explanations.

### 7. AI Career & Mock Interview Coach
- Role-specific behavioral, technical, and system design interview simulations.
- Dual input modes: Text and Voice recording with audio transcription support.
- Multi-dimensional rubric evaluation: Technical accuracy, communication clarity, problem-solving structure, and concrete next steps.
- **Roadmap Sync**: Identified interview weaknesses can be pushed directly into your learning roadmap with a single click.

### 8. Weekly Planner & Focus Studio
- Weekly commitment scheduling with goal-oriented session time tracking.
- Distraction-free focus timer with task completion checkpoints and progress metrics.

---

## 🏛 Architecture

```mermaid
graph TD
  User([User Browser]) -->|Next.js App Router| Frontend[Frontend UI & Dashboard]
  
  subgraph Client
    Frontend --> AuthState[Clerk Auth Client]
    Frontend --> TwinEngine[Deterministic Twin Engine]
    Frontend --> LocalDrafts[(Local Storage Drafts)]
  end

  subgraph API Layer [/api]
    Frontend -->|HTTP / REST| API[Secure API Endpoints]
    API --> AuthCheck[Clerk Server Auth Verification]
    API --> TwinAPI[/api/twin]
    API --> LearningAPI[/api/learning]
    API --> InterviewAPI[/api/interviews]
    API --> ProfileAPI[/api/profile]
  end

  subgraph AI Services
    API --> AIProvider[AI Abstraction Layer]
    AIProvider -->|Primary| Gemini[Google Gemini 2.5 Flash]
    AIProvider -->|Fallback| OpenRouter[OpenRouter API]
    AIProvider -->|Offline| Heuristics[Deterministic Heuristics]
  end

  subgraph Storage & Cloud
    API --> SupabaseClient[Supabase Client]
    SupabaseClient --> Postgres[(Supabase PostgreSQL + RLS)]
    SupabaseClient --> PrivateStorage[Supabase Storage Buckets]
  end
```

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Server Actions, Dynamic API Routes) |
| **Language** | [TypeScript 5.9](https://www.typescriptlang.org/) (Strict mode, zero `any` policy) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) & Vanilla CSS Tokens (Aura & Oblo design languages) |
| **Motion** | [Framer Motion](https://www.framer.com/motion/) (Hardware-accelerated micro-animations, reduced-motion compliant) |
| **Authentication**| [Clerk](https://clerk.com/) (User management, session tokens, secure auth shell) |
| **Database** | [Supabase](https://supabase.com/) (PostgreSQL with Row-Level Security, JSONB document storage) |
| **AI Providers** | [Google Gemini 2.5 Flash](https://ai.google.dev/) & [OpenRouter](https://openrouter.ai/) (Unified server-side abstraction) |
| **Testing** | [Vitest](https://vitest.dev/) (Unit/Integration, 84 tests) & [Playwright](https://playwright.dev/) (E2E browser tests) |
| **Deployment** | [Vercel](https://vercel.com/) (Edge-optimized serverless functions and asset delivery) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `20.9.0` or higher (Node 22 LTS recommended)
- **Package Manager**: `npm` (v10+), `pnpm`, or `bun`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Himangi-Negi-1011/CAREERTWIN_AI.git
   cd CAREERTWIN_AI
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Add your credentials (see [Configuration](#-configuration--environment-variables)).

4. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Configuration & Environment Variables

Create `.env.local` in the project root:

```env
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database & Private Storage (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# AI Provider Configuration (Google Gemini / OpenRouter)
AI_PROVIDER=gemini
GEMINI_API_KEY=AQ....
GEMINI_MODEL=gemini-2.5-flash

# Optional OpenRouter fallback
OPENROUTER_API_KEY=
OPENROUTER_MODEL=
```

> **Security Notice**: All sensitive secrets (`CLERK_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`) run strictly server-side and are never bundled into client JavaScript.

---

## 🧪 Testing & Quality Assurance

CareerTwin is engineered with end-to-end verification and rigorous automated testing suites:

```bash
# 1. Run all 84 Vitest unit and integration test suites
npm test

# 2. Run TypeScript strict type verification
npm run typecheck

# 3. Run ESLint code quality checks
npm run lint

# 4. Build optimized production bundle
npm run build

# 5. Run Playwright end-to-end browser tests
npm run test:e2e
```

### Test Suite Status

```
 ✓ tests/unit/development-hub.test.tsx (6 tests)
 ✓ tests/unit/onboarding.test.tsx (5 tests)
 ✓ tests/unit/workspace.test.tsx (7 tests)
 ✓ tests/unit/learning-studio.test.tsx (2 tests)
 ✓ tests/unit/career-intelligence.test.tsx (2 tests)
 ✓ tests/unit/weekly-planner.test.tsx (2 tests)
 ✓ tests/unit/learning-skills-api.test.ts (4 tests)
 ✓ tests/unit/pip.test.tsx (3 tests)
 ✓ tests/unit/header.test.tsx (2 tests)
 ✓ tests/unit/resume-api.test.ts (2 tests)
 ✓ tests/unit/learning-lesson-api.test.ts (3 tests)
 ✓ tests/unit/learning-engine.test.ts (10 tests)
 ✓ tests/unit/learning-quiz-api.test.ts (2 tests)
 ✓ tests/unit/twin-engine.test.ts (3 tests)
 ✓ tests/unit/twin-api.test.ts (4 tests)
 ✓ tests/unit/assessment-api.test.ts (4 tests)
 ✓ tests/unit/interview-session-api.test.ts (4 tests)
 ✓ tests/unit/roadmap-api.test.ts (2 tests)
 ✓ tests/unit/interview-evaluation.test.ts (5 tests)
 ✓ tests/unit/learning-curriculum-api.test.ts (2 tests)
 ✓ tests/unit/learning-tutor-api.test.ts (2 tests)
 ✓ tests/unit/settings-api.test.ts (2 tests)
 ✓ tests/unit/env.test.ts (4 tests)
 ✓ tests/unit/dashboard-auth.test.tsx (2 tests)

Test Files  24 passed (24)
Tests       84 passed (84)
Result      100% Passing
```

---

## 🔒 Security & Data Privacy

- **Row-Level Security (RLS)**: Database queries are filtered by user identifier (`user_id = auth.uid()`), ensuring users can only read and write their own records.
- **Sanitized Uploads**: Resumes are stored in private Supabase buckets with cryptographic access controls.
- **Zero Hallucination Guarantee**: All career recommendations clearly cite the underlying profile inputs and evidence notes.
- **GDPR Compliance**: Built-in `/api/account/export` endpoint allows one-click export of complete user career data in portable JSON format.

---

## 👥 Author & Contributions

- **Lead Engineer & Architect**: **[Himangi Negi](https://github.com/Himangi-Negi-1011)** (`Himangi-Negi-1011`)
- **Repository**: [Himangi-Negi-1011/CAREERTWIN_AI](https://github.com/Himangi-Negi-1011/CAREERTWIN_AI)

---

<div align="center">
  <sub>Built with ❤️ by Himangi Negi • Career intelligence powered by deterministic truth and secure AI.</sub>
</div>
