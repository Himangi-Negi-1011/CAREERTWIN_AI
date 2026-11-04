# CAREERTWIN — LEARNING SYSTEM AUDIT & ARCHITECTURAL INVENTORY

**Audit Date**: November 2026  
**Repository**: `https://github.com/Himangi-Negi-1011/CAREERTWIN_AI`  
**Current Branch**: `main`  
**Target**: Full AI-Powered Educational Platform, In-Depth Courses, Comprehensive Assessments & Advanced Multi-Mode AI Learning Agent  

---

## 1. Executive Summary

CareerTwin currently features a functional foundation with 14 validated production course packages (`content/courses/`), Cisco-inspired Learning Studio UI, Mock Exams Hub, Hands-on Labs, and basic AI Tutor and progress endpoints. However, to meet the Master Prompt standard for a **complete, professional technical education platform**, substantial enhancements are required in three key areas:

1. **Course Breadth & Depth**: Existing courses contain 4-6 lessons and 3 mock tests each. While verified and schema-compliant, students need deeper modular progression (Foundations $\rightarrow$ Core $\rightarrow$ Intermediate $\rightarrow$ Advanced $\rightarrow$ Practical Labs $\rightarrow$ Capstones) with richer worked examples, troubleshooting notes, and real-world architectures.
2. **Assessment Depth & Question Banks**: Tests are currently limited to single-choice and debugging formats with fixed question counts. Students need varied assessment formats: single-choice, multiple-select, scenario-based, short-answer rubrics, code execution / output prediction, matching workflows, and diagnostic weak-topic analysis.
3. **Advanced AI Learning Agent**: The current tutor endpoint (`/api/learning/tutor`) only accepts single-turn questions without conversation memory. It must be upgraded into a **Multi-Mode Context-Aware Learning Agent** supporting 9 dedicated pedagogical modes, conversation history, adaptive difficulty, and backend action tools (retrieve lesson, explain code, generate quiz, summarize revision, and diagnose weak topics).

---

## 2. Component-by-Component Audit

### A. Course Catalogue & Course Content Store
- **Store Location**: `content/courses/<slug>/`
- **Current Packages (14 total)**:
  - `c-programming`: 3 modules, 6 lessons, 3 phase tests, 3 mock tests, resources
  - `cloud-computing`: 2 modules, 4 lessons, 2 phase tests, 3 mock tests, resources
  - `cpp`: 3 modules, 6 lessons, 3 phase tests, 3 mock tests, resources
  - `csharp`: 3 modules, 6 lessons, 3 phase tests, 3 mock tests, resources
  - `cybersecurity`: 2 modules, 4 lessons, 2 phase tests, 3 mock tests, resources
  - `go`: 3 modules, 6 lessons, 3 phase tests, 3 mock tests, resources
  - `java`: 3 modules, 6 lessons, 3 phase tests, 3 mock tests, resources
  - `javascript`: 3 modules, 6 lessons, 3 phase tests, 3 mock tests, resources
  - `php`: 3 modules, 6 lessons, 3 phase tests, 3 mock tests, resources
  - `power-bi`: 2 modules, 4 lessons, 2 phase tests, 3 mock tests, resources
  - `python`: 3 modules, 6 lessons, 3 phase tests, 3 mock tests, resources
  - `rust`: 3 modules, 6 lessons, 3 phase tests, 3 mock tests, resources
  - `sql`: 2 modules, 4 lessons, 2 phase tests, 3 mock tests, resources
  - `typescript`: 3 modules, 6 lessons, 3 phase tests, 3 mock tests, resources
- **Archive Status**: `careertwin-authored-courses-progress (1).zip` was extracted and all 10 authored JSONs are safely backed up in `data/authored-courses/` and synchronized to `content/courses/`.
- **Validation**: `npm run courses:validate` passes 100% of the 14 packages.

### B. Learning Studio Interface (`learning-studio.tsx`)
- **Strengths**: Clean responsive tabs, collapsible syllabus, code viewer, knowledge check scoring, video demonstration tab, hands-on lab integration.
- **Gaps**:
  - AI Tutor is a simple text chat at the bottom; lacks mode switching chips, code copy buttons, multi-turn memory, and tool actions.
  - Lesson completion is toggleable without mandatory practice check or interactive quiz validation.
  - Notes feature is basic; lacks structured revision export and study plan generation.

### C. AI Learning Agent & LLM Integration (`app/api/learning/tutor/route.ts` & `lib/ai/provider.ts`)
- **Current State**: Single-turn prompt that returns `{ answer, relatedConcepts, suggestedAction }`.
- **Gaps**:
  - No mode awareness (`Explain Concept`, `Teach Me From Zero`, `Ask AI Tutor`, `Practical Mentor`, `Code Helper`, `Revision Mode`, `Quiz Me`, `Career Connection`, `Doubt Solver`).
  - No message history; subsequent questions reset context.
  - No student context integration (current skill level, weak topics, quiz failures, past attempts).
  - No fallback mode switching when offline or rate-limited.

### D. Assessment System (`mock-test-engine.ts`, `mock-exams-hub.tsx`, `/api/learning/mock-tests`)
- **Current State**: 42 mock tests and 38 phase assessments with automated grading.
- **Gaps**:
  - Predominantly multiple-choice and code output; lacks short-answer rubrics, matching/ordering tasks, and scenario analysis.
  - Test attempts are scored, but diagnostic weak topics are not persistently recorded to feed the AI Tutor's revision recommendations.

### E. Progress Tracking & Database (`/api/learning/progress`, `repository.ts`)
- **Current State**: Tracks enrollment, completed lessons in localStorage and Supabase.
- **Gaps**: Needs unified analytics schema recording:
  - Quiz attempt breakdown
  - Specific weak topics identified per test
  - Time spent per module
  - Revision history and streak

---

## 3. Prioritized Action Plan

1. **AI Learning Agent Core (`lib/learning/agent.ts` & `/api/learning/tutor`)**:
   - Implement the 9 teaching modes.
   - Multi-turn conversation state with history buffer.
   - Context injection: active course, lesson, code snippet, student level, weak topics.
   - Pedagogical fallback engine for instant, deterministic, high-quality answers when LLM is unavailable or offline.
2. **Learning Studio Upgrade (`learning-studio.tsx`)**:
   - Professional AI Learning Agent drawer / sidecar with mode selector pills.
   - Code snippet copy/debug actions.
   - Interactive "Quiz Me" with immediate feedback.
   - Revision plan and notes saving.
3. **Assessment Engine Enhancements (`mock-test-engine.ts` & assessment APIs)**:
   - Add scenario-based, short-answer rubric, and workflow matching question types.
   - Generate diagnostic score reports that pinpoint exact weak topics and feed AI revision.
4. **Course Material & Depth Expansion**:
   - Expand practical exercises, real-world architecture examples, and troubleshooting guides.
5. **Full Engineering Validation**:
   - Automated Vitest tests for the agent, assessment grading, and learning progress.
   - Course completeness validation (`courses:validate`).
   - Clean Next.js production build (`next build --webpack`).
