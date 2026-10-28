# CareerTwin Master Product Engineering Report

Date: 2026-10-28

## Executive outcome

This implementation preserved the existing Next.js/React/TypeScript/Tailwind, Clerk, Supabase, and provider-neutral AI architecture. It added a tested Learning Studio foundation and applied an additive, RLS-enabled Supabase migration. It did **not** claim the complete master product is finished: full lesson delivery, approved content administration, exercises, project submission, tutor conversations, live market feeds, and authenticated production verification still require further implementation or secure external configuration.

Production remains on the previously validated landing-page release. The new source passed a Vercel preview build but was not promoted because production does not have the required Supabase/AI configuration and the new Learning Studio is intentionally limited to curriculum preparation/review states.

## Repository audit

### Stack
- Next.js 16.4.2 App Router, React 19, TypeScript, Tailwind CSS 4, Framer Motion.
- Clerk authentication and protected server routes.
- Supabase PostgreSQL/private Storage with additive migrations and RLS.
- Provider adapter supporting Gemini and OpenRouter.
- Zod at API and AI structured-output boundaries.
- Vitest/Testing Library and Playwright.
- Vercel deployment.

### Existing verified capabilities
- Public landing, responsive navigation, sign-up/sign-in routes, Pip.
- Seven-step resumable profile onboarding and optional resume workflow.
- Authenticated dashboard and canonical Career Twin state.
- Skill-evidence review and deterministic gap prioritization.
- Roadmap tasks, weekly planning, curated assessment grading, and atomic assessment/Twin updates.
- Career-intelligence guidance with explicit non-live limitations.
- Interview session lifecycle, provider-backed evaluation, text/optional voice paths, history, and roadmap recommendations.
- Privacy settings and account export.

### Existing limitations found
- Production Vercel has Clerk configuration but not the required Supabase server configuration.
- No supported production AI provider is currently configured under the variable names the application validates.
- Existing development/roadmap modules retain browser-draft fallbacks; secure sync depends on production Supabase variables.
- No real-user test identities were available for register/sign-in/sign-out, expired-session, or two-user isolation browser tests.
- No live market-data provider is configured; the app correctly labels guidance as non-live.
- Before this change there was no scalable skill catalog, curriculum schema, Learning Studio, curriculum generation job model, or deterministic reusable quiz grader.

## Implemented in this iteration

### Extensible skill taxonomy
- Added a broad code-seeded catalog covering software, web, data, AI, analytics, cybersecurity, cloud/DevOps, networking/IT, design/product, business, marketing, finance, professional skills, and creative/education domains.
- Added normalization, alias resolution, duplicate prevention, ranked search, and safe registration validation for unseen skills.
- Unseen skills can be registered without a frontend code change.
- Seed entries are explicitly drafts unless reviewed; the system does not claim a finite list covers every skill.

### Learning content contracts
- Added validated schemas for skills, resource references, objectives, modules, curricula, objective question types, answer keys, and learning-state records.
- Added curriculum integrity checks for duplicate modules, unknown objective references, and uncovered objectives.
- Added deterministic objective grading using exact answer-set comparison. Correct answers remain server-side until submission in the intended API flow.

### Provider-neutral curriculum generation
- Extended the existing Gemini/OpenRouter adapter with structured curriculum generation.
- Prompts prohibit invented credentials, progress, mastery, market claims, certifications, and resource URLs.
- Only supplied trusted resources may appear in generated output.
- Generated curricula are saved as `ai-draft` and `draft`; schema validation does not label them verified or approved.
- Requests use a 25-second timeout and explicit configuration/provider/rate-limit failure states.

### Curriculum API and generation jobs
- Added authenticated skill-search and curriculum-preparation endpoints.
- Added validation, canonicalization, deduplication keys, generation job states, limited failure codes, and approved-curriculum reuse.
- New output is stored as draft and returned as `awaiting-review`; it is not silently published.
- Missing database or AI configuration returns an honest unavailable response rather than fake content.

### Learning Studio UI
- Added Learning Studio to desktop/mobile navigation and command search.
- Users can search seeded skills, select level/language, or request registration of an unseen skill.
- The UI renders validated curriculum drafts with objectives, modules, checkpoints, and proficiency criteria.
- Drafts are visibly labelled “Review required.”
- Missing AI/provider states do not render fabricated lessons.

### Canonical learning state
- Extended Career Twin source validation with owner-scoped enrollments, lesson progress, quiz attempts, and mastery evidence.
- Mastery evidence distinguishes diagnostics, quizzes, exercises, projects, and review evidence.
- Lesson completion is not represented as mastery.

## Database migration

Applied additive migration `learning_studio` to Supabase project `guisgrevijogykburmvf`.

Created:
- `skill_catalog`
- `skill_aliases`
- `learning_resources`
- `learning_curricula`
- `ai_generation_jobs`
- `learning_enrollments`
- `learning_progress`
- `learning_quiz_attempts`
- `skill_mastery_evidence`

All nine tables have RLS enabled. Generic catalog/resource/curriculum reads are restricted to approved/curated content. Learner records are owner-scoped using the existing Clerk user identity helper. Anonymous access is revoked. Foreign keys, unique constraints, checks, and lookup indexes were added.

## Feature-to-test matrix

| Feature | Implementation | Automated evidence | Status |
|---|---|---|---|
| Catalog normalization/aliases | `lib/learning/catalog.ts` | `learning-engine.test.ts` | PASS |
| Broad seed domains | `lib/learning/catalog.ts` | schema-valid seed/count test | PASS |
| Unseen skill registration | catalog + skills API | engine/API tests | PASS |
| Authenticated skill search | `/api/learning/skills` | API boundary tests | PASS |
| Curriculum schema/integrity | `lib/learning/schema.ts` | valid/invalid coverage tests | PASS |
| Deterministic objective grading | `gradeObjectiveQuiz` | correct, extra-answer, explanation tests | PASS |
| Provider-neutral curriculum draft | `lib/ai/provider.ts` | type/lint/build; live provider not configured | BLOCKED live |
| Curriculum request validation/auth | `/api/learning/curricula` | API boundary tests | PASS |
| Learning Studio UI | `learning-studio.tsx` | component tests | PASS |
| Honest missing-provider state | API/UI | component test | PASS |
| Learning DB schema/RLS | Supabase migration | live metadata query: 9/9 RLS | PASS |
| Full approved-course enrollment | schema only | not implemented end-to-end | MISSING |
| Lesson rendering/progress continuation | state contracts only | not implemented | MISSING |
| Exercise/project submission | database foundations only | not implemented | MISSING |
| Tutor conversation | provider architecture only | not implemented | MISSING |
| Admin review/publish UI | database status model only | not implemented | MISSING |
| Live market intelligence | explicit non-live fallback | existing tests | BLOCKED by data provider |
| Two-user browser isolation | RLS tests exist for earlier models | no test identities for new models | BLOCKED |

## Tests actually executed

- `npm run typecheck` — PASS.
- `npm run lint` — PASS.
- `npm test -- --run` — PASS: 21 files, 77 tests.
- Existing production Playwright suite — PASS: 14/14 across desktop/mobile. This verifies the current production release, not the unpromoted Learning Studio preview.
- Vercel preview production build — PASS: deployment `dpl_J9AhKa1fLHwHXdQPuDdW26qhJYgM`, READY/STAGED.
- Supabase live schema check — PASS: all 9 new tables exist with RLS enabled.
- Local `next build --webpack` and Turbopack build — BLOCKED by the 2 GB sandbox OOM killer. The same source completed on Vercel’s 8 GB build machine.
- Local Playwright dev-server run — BLOCKED when the local compiler was killed under the same memory limit; the production remote suite then passed.

## Environment variables

Documented in `.env.example`:
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SPLINE_SCENE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AI_PROVIDER`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL`

Only server-side names accepted by the application enable AI. No secret value was added to source or this report.

## Mandatory journey status

- Sign in → profile → target → skill gap → roadmap → assessment → interview: **PARTIAL/PREVIOUSLY IMPLEMENTED**, with production secure persistence blocked by missing Supabase environment variables.
- Skill search → unseen registration → curriculum preparation → schema validation → draft persistence: **IMPLEMENTED**, live AI execution blocked by missing supported provider configuration.
- Open approved course → lesson → exercise → quiz → mastery evidence → roadmap update: **NOT COMPLETE**. Contracts and persistence foundations exist, but lesson/exercise/enrollment APIs and reviewed content are still required.

## Local commands

```bash
npm install --legacy-peer-deps
cp .env.example .env.local
npm run dev
npm run typecheck
npm run lint
npm test -- --run
npm run test:e2e
npm run build
```

Apply migrations through the approved Supabase migration workflow before using Learning Studio persistence.

## Remaining production-readiness work

1. Securely install the required Supabase variables in Vercel; never paste them into chat.
2. Configure one supported AI provider using the exact documented server variable names and run live connectivity/evaluation checks.
3. Add reviewed/approved foundational curricula and resource references.
4. Implement normalized lessons, enrollments, progress APIs, deterministic quiz submission, exercise/project submission, and mastery rules.
5. Implement an administrator review/version/publish workflow.
6. Add tutor retrieval, retention controls, rate/cost limits, and prompt-injection evaluation.
7. Add two-real-user isolation tests for every new learning table and API.
8. Run authenticated end-to-end tests with approved test identities.
9. Promote only after secure production configuration and the full learning vertical slice pass.
