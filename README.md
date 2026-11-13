<div align="center">

# 🌟 CareerTwin AI

### Intelligent Career Navigation, Verifiable Skill Evidence & Adaptive Learning Platform

[![Live App](https://img.shields.io/badge/Live%20Demo-careertwin--techai.vercel.app-6d3df5?style=for-the-badge&logo=vercel)](https://careertwin-techai.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](./LICENSE)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Groq & Gemini AI](https://img.shields.io/badge/AI-Groq%20%7C%20Gemini-F55036?style=for-the-badge&logo=openai)](https://groq.com/)
[![Clerk Auth](https://img.shields.io/badge/Auth-Clerk-6C47FF?style=for-the-badge&logo=clerk)](https://clerk.com/)
[![Supabase Database](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)

<p align="center">
  <strong>CareerTwin</strong> bridges the gap between academic learning and industry expectations. It analyzes verified student skills, computes real gap topologies across 18+ tech specializations, generates adaptive weekly roadmaps, and guides learners through hands-on labs, enterprise projects, and simulated interviews.
</p>

[🌐 Visit Live Application](https://careertwin-techai.vercel.app/) • [🚀 Getting Started](#-getting-started) • [✨ Key Modules](#-key-modules) • [🏛 Architecture](#-architecture) • [📄 License](#-license)

---

</div>

## 📌 Project Overview

Traditional job portals and learning sites often present generic quizzes, inflated readiness scores, and unverified promises. **CareerTwin** is architected on an **evidence-first, deterministic foundation**:

- **Deterministic Skill Computation**: Your Career Twin persona is calculated strictly from proven evidence, lab completions, and validated profile inputs without synthetic hallucinations.
- **Role-Grounded Frameworks**: 18+ curated technical paths (Full Stack, Backend, Frontend, AI/ML, Cloud, DevOps, Data Science, Cybersecurity, Mobile, QA, and more) map directly to real-world hiring criteria.
- **Multi-Model AI Engine**: High-speed AI inference (powered by **Groq** and **Google Gemini**) delivers ultra-fast roadmap generation, interactive tutoring, and detailed interview evaluations.
- **Privacy & Ownership First**: Sensitive profile data and resume documents are protected with Row-Level Security (RLS) and scoped to private user accounts.

---

## ✨ Key Modules & Capabilities

### 1. 🎯 Dynamic Career Profile & Resume Ingestion
- 7-step onboarding process covering education, skills, prior projects, career direction, and target roles.
- Safe resume parsing with user confirmation gates to prevent unverified inferences.
- Offline-safe browser drafts that seamlessly sync to the cloud upon authentication.

### 2. 🧬 Deterministic AI Career Twin
- Calculates evidence coverage percentages based on tangible proof.
- Distinguishes between **Demonstrated**, **Developing**, **Assessed**, and **Unverified** competencies.
- Recommends prioritized next actions based on market demands.

### 3. 🗺️ Adaptive 12-Week Roadmap
- Milestone-driven execution plans broken into weekly tasks, practical proofs, and time commitments.
- Automated progress tracking connected directly to your focus calendar.

### 4. 📚 Comprehensive Learning Studio
- 14 validated production skill tracks (Python, TypeScript, SQL, React, Docker, Kubernetes, Cloud IAM, Networking, and more).
- Structured NetAcad-style progressive modular curricula with in-depth notes, interactive knowledge checks, and 42 timed mock certification exams.
- In-browser interactive AI Tutor to answer conceptual questions in context.

### 5. 🧪 Hands-on Practice Labs & Sandboxes
- Practical interactive environments including Python code runners, CIDR subnet calculators, Cloud IAM policy builders, and SOC log analyzers.
- Validated checkpoints requiring functional outputs before awarding evidence badges.

### 6. 💼 Career Center & Opportunities Tracker
- Daily verified internship, fellowship, and junior engineering openings.
- Automated relevance matching comparing job requirements directly against your Career Twin baseline.
- ATS resume analyzer that reviews keyword density, formatting, and measurable outcomes.

### 7. 🎙️ AI Career Coach & Mock Interview Simulator
- Realistic behavioral, technical, and system design mock interview scenarios.
- Support for text input and voice recordings with automated transcription.
- Detailed rubric evaluations providing scored criteria, identified weaknesses, and one-click task additions to your roadmap.

---

## 🏛 Architecture

```mermaid
graph TD
  Browser([Student Browser]) -->|Next.js App Router| UI[CareerTwin Dashboard & Pages]
  
  subgraph Client
    UI --> ClerkClient[Clerk Auth Client]
    UI --> StateStore[Local Drafts & Sync State]
    UI --> ThemeEngine[Dark / Light Contrast Engine]
  end

  subgraph API Layer [/api]
    UI -->|REST / JSON| APIRoutes[Next.js Server Endpoints]
    APIRoutes --> AuthCheck[Clerk Server Auth Verification]
    APIRoutes --> TwinService[/api/twin]
    APIRoutes --> RoadmapService[/api/roadmap/generate]
    APIRoutes --> LearningService[/api/learning]
    APIRoutes --> CareerService[/api/career]
    APIRoutes --> InterviewService[/api/interviews]
  end

  subgraph AI Orchestration Layer
    APIRoutes --> AIProvider[Multi-Provider AI Client]
    AIProvider -->|Primary Fast Inference| Groq[Groq API · LLaMA 3.3 / GPT-OSS]
    AIProvider -->|Multimodal & Audio| Gemini[Google Gemini API]
    AIProvider -->|Offline Fallback| Heuristics[Deterministic Domain Fallback]
  end

  subgraph Persistence
    APIRoutes --> Supabase[Supabase Database]
    Supabase --> PostgreSQL[(PostgreSQL + RLS)]
    Supabase --> Storage[Private File Storage]
  end
```

---

## 🛠 Tech Stack

| Domain | Tools & Technologies |
|---|---|
| **Frontend Framework** | [Next.js 16 (App Router)](https://nextjs.org/) & [React 19](https://react.dev/) |
| **Language** | [TypeScript 5.9](https://www.typescriptlang.org/) (Strict mode, full type-safety) |
| **Styling & Theming** | [Tailwind CSS v4](https://tailwindcss.com/) & CSS Design Tokens (Dark/Light high-contrast support) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) (Hardware-accelerated transitions) |
| **Authentication** | [Clerk](https://clerk.com/) (User management, session protection, OAuth) |
| **Database & Storage** | [Supabase](https://supabase.com/) (PostgreSQL with Row-Level Security policies) |
| **AI Inference** | [Groq](https://groq.com/) & [Google Gemini](https://ai.google.dev/) |
| **Testing Suite** | [Vitest](https://vitest.dev/) (Unit and integration tests) & [Playwright](https://playwright.dev/) |
| **Deployment** | [Vercel](https://vercel.com/) (Automated continuous deployments) |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) version `20.9.0` or higher (Node 22 LTS recommended)
- `npm`, `pnpm`, or `bun` package manager

### 1. Clone the Repository

```bash
git clone https://github.com/Himangi-Negi-1011/CAREERTWIN_AI.git
cd CAREERTWIN_AI
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables Configuration

Create a `.env.local` file in the root directory by copying the example template:

```bash
cp .env.example .env.local
```

Populate the required credentials in `.env.local`:

```env
# Application Host
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase (Database & Storage)
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# AI Provider (Groq / Gemini)
AI_PROVIDER=groq
GROQ_API_KEY=gsk_...
GROQ_MODEL=openai/gpt-oss-120b
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser to explore CareerTwin locally.

---

## 🧪 Testing & Verification

Run the test suite to ensure system integrity:

```bash
# Execute unit and component tests
npm test

# Run strict TypeScript verification
npm run typecheck

# Build for production
npm run build
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for complete details.

---

## 👤 Author & Maintainer

- **Himangi Negi** — [GitHub Profile](https://github.com/Himangi-Negi-1011)
- **Repository**: [Himangi-Negi-1011/CAREERTWIN_AI](https://github.com/Himangi-Negi-1011/CAREERTWIN_AI)
- **Live Deployment**: [careertwin-techai.vercel.app](https://careertwin-techai.vercel.app/)
