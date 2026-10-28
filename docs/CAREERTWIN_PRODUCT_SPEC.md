# CareerTwin — Product Improvement, Implementation, and Testing Specification

## Mission
Transform the existing CareerTwin application into a professional, accessible, evidence-led career-development workspace. Preserve working code, records, integrations, and configuration. Improve incrementally rather than replacing the application.

The product must help a user answer:
1. What career am I targeting?
2. What can I currently demonstrate?
3. What is unverified versus genuinely missing?
4. What should I learn or practise next, and why?
5. What should I complete this week?
6. What progress have I actually recorded?

Every visible control must work or be clearly marked unavailable. Never fabricate skills, credentials, activity, assessments, market statistics, readiness, or hiring outcomes.

## Required stack and architecture
- Next.js, React, TypeScript, Tailwind CSS, and Framer Motion.
- Clerk for authentication.
- Supabase PostgreSQL and private Storage for owner-scoped application data.
- Provider-neutral server-side AI through the configured provider.
- Zod validation for important inputs and AI output.
- Vitest for unit/integration coverage and Playwright for browser coverage.
- Vercel for validated production releases.
- Reuse compatible existing packages; avoid unnecessary dependencies.

## Delivery method
1. Audit repository, live application, routes, dependencies, data model, auth, storage, AI configuration, tests, and deployment state.
2. Preserve working behavior and uncommitted changes.
3. Implement in small, testable slices.
4. Validate lint, TypeScript, unit/integration tests, browser tests, production build, and production smoke checks.
5. Report PASS, FAIL, BLOCKED, and NOT APPLICABLE honestly.
6. Never expose or request secrets in chat, client code, logs, screenshots, source, or reports.

## Product design
Use a premium productivity-workspace direction:
- Warm neutral background; deep navy/charcoal text; restrained blue/indigo accent.
- Compact fixed desktop sidebar and functional mobile drawer.
- Simple header, clear hierarchy, consistent radii, thin borders, restrained shadows.
- Purposeful motion with reduced-motion support.
- No fake charts, excessive gradients, decorative glassmorphism, giant empty hero areas, or arbitrary statistics.
- Keyboard-operable controls, visible focus, semantic labels, responsive layouts, and accessible feedback.

## Primary authenticated navigation
1. Dashboard
2. Skill Gap Analysis
3. Career Intelligence
4. Career Roadmap
5. AI Career Coach
6. My Documents
7. Progress & Weekly Tests
8. Privacy & Settings

Do not remove an important working feature; consolidate it intentionally into one of these sections.

## Dashboard
### Welcome
Use actual profile information. Show name, target role, weekly availability when supplied, and working actions for profile, roadmap, and weekly assessment.

### Career Twin overview
Show target role, confirmed skills, skills under development, unverified skills, and remaining priority areas. Any score must use a documented algorithm and must never represent employability probability.

### Weekly summary
Calculate planned/completed tasks, planned/recorded time, remaining work, next activity, and upcoming assessment from saved records. Opening a page must never increase progress.

### Recommended next action
Produce one deterministic recommendation from profile completeness, evidence status, roadmap prerequisites, weekly availability, incomplete work, and assessment history. Show the reason and a working action.

### Skill progress and activity
Summarize demonstrated, developing, and unverified skills. Show only real completed lessons, tests, projects, and interview sessions; otherwise use helpful empty states.

### Pip
Keep Pip compact and unobtrusive. Use genuine saved context. Use configured AI only through authenticated server endpoints, with an honest deterministic fallback when unavailable.

## Skill Gap Analysis
Use target role, self-reported skills, confirmed resume facts, project evidence, roadmap completion, assessments, and available time.

For each skill show:
- Current evidenced state and target competency.
- Missing skill versus missing evidence.
- Importance, rationale, prerequisites, estimated effort, resources, exercise, assessment, and status.
- Working actions for details, learning, resources, assessment, evidence, completion, and history.

A documented deterministic priority algorithm must consider role relevance, competency/evidence gap, prerequisites, roadmap dependencies, and available time. AI must not assign arbitrary scores. Completing a lesson alone must not establish mastery.

## Career Intelligence
Provide searchable skill guides, role relationships, use cases, prerequisites, tools, complementary skills, learning priorities, projects, certifications, and effort assumptions.

Market claims require authorized, cited data with source, region, period, and last-verified date. Never invent live job counts, salaries, trends, or company hiring statistics. When live data is unavailable, clearly label maintained guidance as non-live.

Allow comparison of two or three skills by target-role relevance, evidence gap, effort, prerequisites, market evidence, and portfolio value. A selected skill can be added to the roadmap only after confirmation.

## Weekly Learning Plan and Assessments
Users can configure weekly hours, preferred days, session duration, and goals. Plans must adapt to incomplete prioritized gaps and existing roadmap work.

Each activity includes title, skill, objective, duration, date, status, completion criteria, optional resource, and linked assessment. Users can reschedule, carry forward, start, pause, resume, complete, and record actual time.

Assessments include curated or validated multiple-choice, scenario, and reasoning questions. Do not reveal answers before submission outside explicit study mode. Keep answer keys server-side. Save attempts, calculate results, explain answers, record revision topics, and recommend next actions. A passing quiz is evidence—not complete proof of competency.

## Career Roadmap
Generate or construct an ordered, editable path based on role and starting evidence:
- Foundations
- Core skills
- Practical exercises
- Portfolio projects
- Advanced or role-specific skills
- Interview preparation
- Career readiness

Each task includes objective, skill, prerequisites, priority, effort, resource, practice, completion criteria, status, and related assessment/project. Support start, pause/resume, notes/evidence, rescheduling, completion, review, and reopening. AI-generated work remains draft until explicit approval.

## AI Career Coach
Provide contextual guidance based only on user-approved data. Support interview practice, explanations, reflection, and next-step guidance. Validate structured AI output, apply timeouts, and expose honest unavailable states. Never predict hiring outcomes or invent user facts.

## Documents
Support private PDF/DOCX upload, replacement, deletion, and reviewed extraction. Filenames are not evidence. Extracted facts must remain suggestions until explicit user approval.

## Progress and privacy
Progress represents recorded activity, not employability. Provide transparent calculations, export, correction, deletion, owner scoping, and clear AI/data-use controls.

## Security and data rules
- Authenticate protected routes server-side.
- Enforce ownership in APIs and Supabase RLS/storage policies.
- Validate inputs with Zod and limit payload/file sizes.
- Keep service credentials and AI keys server-side.
- Use additive migrations; no destructive changes without explicit approval and safeguards.
- Do not log sensitive profile, resume, audio, or credential data.

## Definition of done
- Every visible control works or is labelled unavailable.
- New and returning user paths have honest states.
- Desktop/mobile and keyboard workflows pass.
- Protected APIs reject unauthenticated requests.
- Owner-scoped persistence is verified when secure credentials are configured.
- AI failure and database-unavailable paths are tested.
- ESLint, TypeScript, Vitest, Playwright, production build, and smoke tests pass.
- Only a validated build is deployed.
