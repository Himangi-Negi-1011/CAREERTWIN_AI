# CareerTwin engineering audit

**Audit date:** 22 October 2026  
**Production URL:** https://careertwin-three.vercel.app  
**Production deployment observed:** `dpl_CXDD9fcDRGBjnoLVZWpDqLA41JVM`  
**Local revision deployed:** **No.** The live defect described below remains present until a corrected deployment is built, released, and verified.

## Executive result

CareerTwin is a small Next.js application with a polished public landing page, Clerk authentication UI, one-step role onboarding, an authenticated dashboard shell, a browser-local skill-evidence editor/export, and an honest rules-based Pip guide. It is not yet a database-backed career platform. Roadmaps, projects, interviews, progress history, resume processing, AI generation, API endpoints, and application-to-Supabase CRUD do not exist.

The audit confirmed a **high-severity access-control defect** in production: an unauthenticated request to `/dashboard` returned the private dashboard with HTTP 200. The local source now performs a current-generation, resource-level Clerk authorization check in `app/dashboard/page.tsx` and redirects a request without `userId` before rendering. A mocked regression test covers both denied and authorized branches. This correction is **not deployed**.

Local lint, TypeScript, and 15 unit/component tests pass. The production build and post-change Playwright run are **BLOCKED** in this sandbox because Next.js compiler subprocesses are repeatedly killed by SIGKILL under the sandbox memory limit. A prior pre-audit revision passed the build and 14 Playwright project tests, but those prior results do not validate the current auth change.

## Inventory

| Area | Finding |
|---|---|
| Framework | Next.js 16.4.2 App Router, React 19.3, TypeScript 5, Tailwind CSS 4 |
| Package manager | npm (`package-lock.json`); Bun unavailable |
| Runtime libraries | Clerk 7.9.18, Framer Motion 14.5, Lucide, Zod |
| Test stack | Vitest 4.1.12, Testing Library, Playwright 1.64.1 |
| Routes | `/`, `/onboarding`, `/dashboard`, `/sign-in/[[...sign-in]]`, `/sign-up/[[...sign-up]]`, framework 404 and route error UI |
| API routes | None |
| Forms | Clerk sign-in/sign-up; target role selection/custom role; custom skill and evidence editor |
| Persistence | `localStorage`, now scoped to the authenticated Clerk subject in the dashboard; one Supabase profile migration exists but no application CRUD client exists |
| Integrations | Clerk UI/session middleware; Supabase schema/RLS/storage only; Vercel deployment; no OpenRouter connection |
| Uploads | Private Supabase `resumes` bucket and policies exist; no upload UI or application handler exists |
| AI | Not connected; Pip is explicitly rules-based and local-context-only |
| Deployment | Vercel project `careertwin` (`prj_of5B4TFveMmgPmmSDkPlBJxR6qYF`) |
| Source control | No Git remote configured in the workspace |

### Persistence keys

- Anonymous onboarding draft: `careertwin-role-draft`
- Authenticated role: `careertwin-role-draft:<Clerk subject>`
- Authenticated skill evidence: `careertwin-skill-evidence-v1:<Clerk subject>`

The dashboard migrates a legacy anonymous role/evidence draft to the first authenticated subject and removes the unscoped copy. Browser storage remains device-local and is not a substitute for server-side persistence.

## Confirmed defects and repairs

| Severity | Defect and reproduction | Root cause | Local repair | State |
|---|---|---|---|---|
| High | Unauthenticated `GET https://careertwin-three.vercel.app/dashboard` returned HTTP 200 and dashboard content | No resource-level check in `app/dashboard/page.tsx`; previous middleware initialized Clerk without protecting the route | Await `auth()`, require `userId`, redirect to `/sign-in?redirect_url=/dashboard`; add denied/authorized regression tests | **Fixed locally; live still FAIL** |
| High | Browser-local role/evidence could be read by the next Clerk user of a shared browser | Global, unscoped localStorage keys | Scope dashboard data by Clerk subject and migrate/remove old unscoped data | **Fixed locally; not deployed** |
| Medium | Roadmap/project/interview/progress controls looked actionable although no workflows existed | Placeholder modules linked back to onboarding with unrelated action labels | Remove misleading actions; explicitly label modules “Feature not implemented” and state no data is generated/saved | **Fixed locally** |
| Medium | Vitest 3.2.4 dependency tree included critical development-tool advisories | Outdated test runner and worker packages | Upgrade Vitest to 4.1.12; tests pass | **Fixed locally** |
| Low | No application-level error or not-found experience | Missing App Router boundaries | Add `app/error.tsx` with retry and `app/not-found.tsx` | **Fixed locally** |
| Low | Onboarding implied account sync would follow merely from configuring Clerk | Copy conflated authentication with database integration | State that browser data is account-separated locally and secure database sync is not connected | **Fixed locally** |

### Clerk `dev-browser-missing` diagnosis

Two independent conditions must not be conflated:

1. **Confirmed authorization defect:** the live dashboard had no protection. This was reproducible with a normal unauthenticated HTTP request and did not depend on the development-browser handshake.
2. **Clerk development-instance behavior:** current local credentials pass the SDK doctor but were identified as an unclaimed/accountless development instance. Development keys can require Clerk’s development-browser handshake and may show `dev-browser-missing` in unsupported automation. This does not justify bypassing auth.

The configured credentials are not verified as belonging to the required selected Clerk application `app_3L0HjylGi9Lht39XNglnXq9hAQp`. The previously pasted secret must be treated as compromised and rotated. No secret value was printed during this audit.

## Route and feature status

Status meanings: **PASS** verified in the current local source/test run; **FAIL** confirmed broken; **BLOCKED** cannot be honestly verified with available runtime/credentials; **N/A** not implemented and not represented as working.

| Route / journey | Status | Evidence |
|---|---|---|
| `/` public landing content and primary navigation | PASS | Existing component coverage; prior browser baseline; landing blank-section defect was repaired before this audit |
| `/onboarding` preset role, custom role normalization, restore | PASS | 3 current Vitest interaction tests |
| `/sign-in` Clerk form | BLOCKED | Route exists; real-provider end-to-end sign-in requires a claimed/verified Clerk instance |
| `/sign-up` Clerk form | BLOCKED | Route exists; real-provider end-to-end sign-up requires a claimed/verified Clerk instance |
| `/dashboard` unauthenticated, live | FAIL | Production returned HTTP 200 before repair; production not redeployed |
| `/dashboard` unauthenticated, local logic | PASS (mocked) | Current test proves redirect before private render |
| `/dashboard` authenticated, real Clerk | BLOCKED | Current post-change browser run could not compile under sandbox memory limit; Clerk instance also requires ownership/domain verification |
| Dashboard navigation and deep-link view selection | PASS (component) | Current workspace tests and source behavior |
| Role data separated by Clerk subject | PASS (component) | Current test checks migration to `:<userId>` and removal of global role key |
| Skill status/evidence/custom skill/save | PASS (component) | Current Testing Library journey |
| Evidence text export | PASS (component behavior), browser download BLOCKED | Export code is implemented; current post-change browser run blocked |
| Pip open/close/prompts/contextual guidance | PASS (component) | 2 current interaction tests; no fabricated AI response |
| Responsive desktop/mobile journeys | BLOCKED post-change | Prior baseline passed desktop/mobile; current Playwright web server is killed during compilation |
| 404 and route error states | PASS (source/type/lint), browser BLOCKED | Added and statically checked; browser compilation blocked |
| Supabase profile CRUD from the app | N/A | No Supabase client/server application code exists |
| Resume upload/analysis | N/A | Schema bucket only; no implemented route/control |
| Roadmap generation/persistence | N/A | Explicitly unavailable |
| Project recommendations/history | N/A | Explicitly unavailable |
| Interview sessions/history/feedback | N/A | Explicitly unavailable |
| Progress tracking | N/A | Explicitly unavailable |
| Generative AI / OpenRouter | N/A | No provider integration or key configured |

## Database and authorization audit

Migration `supabase/migrations/20261021061144_profile_foundation.sql`:

- keeps Clerk as the identity provider and reads the verified JWT `sub`;
- enables and forces RLS on `career_profiles`;
- scopes select/insert/update/delete to `owner_clerk_user_id = current_clerk_user_id()`;
- revokes anonymous table access;
- creates a private 5 MB resume bucket limited to PDF and DOCX;
- scopes storage objects to a first path segment equal to the Clerk subject;
- includes SQL ownership-isolation tests in `supabase/tests/profile_rls.sql`.

Previously executed connector checks reported Auth, database, REST, and Storage healthy. No destructive schema or production-data change was made in this audit. Application CRUD remains absent, so real Clerk JWT-to-Supabase authorization is **BLOCKED/untested from the app**.

## Security, privacy, accessibility, and performance

- **Secrets:** `.env.local` is gitignored; `.env.example` uses placeholders. `CLERK_SECRET_KEY` is server-only. Previously shared Clerk/Supabase/OpenRouter secrets require rotation.
- **Authorization:** resource-level dashboard authorization is now present locally. There are no application API endpoints to audit.
- **Validation:** current meaningful inputs are browser-local strings. Important future writes/API inputs must use server-side Zod; no claim is made that client validation is authorization.
- **Uploads:** secure schema policy exists, but no upload implementation exists; MIME checks must not rely only on file extension when implemented.
- **Accessibility:** semantic labels, live regions, pressed/current states, visible focus rules, reduced-motion handling, and responsive navigation exist. Automated browser accessibility tooling was not configured, so WCAG conformance is **BLOCKED**, not passed.
- **Performance:** no current Lighthouse/browser trace was completed. Framer Motion and Clerk increase client cost; route-level measurements should follow a successful production build.
- **Dependency audit:** `npm audit --omit=dev` reports **0 vulnerabilities**. Full audit reports **5 high-severity development-only findings** through the Next ESLint/fast-glob/micromatch/braces chain; npm only proposes an unsafe major downgrade, so no forced fix was applied.

## Commands executed and outcomes

| Command/check | Result |
|---|---|
| Live `curl` for `/`, `/dashboard`, `/sign-in`, `/sign-up`, `/onboarding` | Routes returned 200; exposed dashboard confirmed |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm test` | PASS — 6 files, 15 tests |
| `npm audit --omit=dev` | PASS — 0 production vulnerabilities |
| `npm audit` | 5 high development-only findings remain in ESLint chain |
| `npm run build` (before resource-level auth change) | First run exposed Next cache/prerender incompatibility; experimental cache features were removed |
| `npm run build` (current source, repeated) | BLOCKED — compiler process SIGKILL under sandbox memory ceiling |
| `npx next build` (Turbopack diagnostic) | BLOCKED — Tailwind loader subprocess SIGKILL |
| `npx playwright test --workers=1` (current source) | BLOCKED — configured dev server exited during compile after SIGKILL |
| Prior pre-audit checks | Historical only: 13 Vitest tests, 14 Playwright project tests, and webpack build passed; not counted as current auth verification |

The build failure is not hidden or reclassified as success. The source must not be deployed until a clean build passes in an adequately provisioned environment.

## Environment variables

### Present in Vercel production

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

Both are protected and target **production only**. Values were not read or copied.

### Required before connected Supabase functionality is built

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` or the current Supabase publishable-key equivalent
- Clerk/Supabase JWT integration configuration appropriate to project `guisgrevijogykburmvf`

A service-role key must remain server-only and should not be added unless a narrowly justified server operation requires it. OpenRouter variables are not required while AI is unimplemented.

## Required external changes and blockers

1. Claim/verify that the Clerk instance belongs to selected application `app_3L0HjylGi9Lht39XNglnXq9hAQp`; do not substitute another application.
2. Rotate the compromised Clerk secret, Supabase service-role secret, and OpenRouter secret before durable use.
3. Configure the correct Clerk production domain/origins and verify sign-in, sign-up, sign-out, session persistence, and redirect URLs in a normal browser.
4. Add preview/development Vercel Clerk variables if preview verification is expected; current Vercel variables target production only.
5. Resolve the current build-memory blocker in CI/Vercel or reduce the bundle/toolchain footprint; then run all checks again.
6. Connect Supabase through a version-controlled server/data layer and test real Clerk JWT ownership before claiming database persistence.
7. Reconnect Notion before attempting to update existing documentation there.

## Pre-deployment checklist

- [ ] Confirm selected Clerk application and claim the development instance.
- [ ] Rotate every previously exposed credential; update Vercel via protected variables.
- [ ] Run `npm ci` from a clean checkout.
- [ ] Run `npm run lint`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm test` and confirm all 15+ tests pass.
- [ ] Run `npm run build` successfully; do not deploy a SIGKILL/partial build.
- [ ] Run Playwright desktop and mobile suites against the built app.
- [ ] Verify unauthenticated `/dashboard` redirects and contains no private workspace HTML.
- [ ] Verify authenticated dashboard, role editing, evidence save, subject separation, and sign-out/sign-in as a second account.
- [ ] Verify browser console/network logs contain no unexpected Clerk, hydration, CSP, 4xx, or 5xx errors.
- [ ] Run accessibility and performance audits on `/`, auth routes, onboarding, and dashboard.
- [ ] Deploy to preview first and repeat critical journeys with the real services.
- [ ] Promote only after approval, then repeat unauthenticated production `curl` and authenticated manual checks.
- [ ] Record the new deployment ID and rollback point.

## File-level changes in this audit

- `app/dashboard/page.tsx` — awaited Clerk resource authorization and redirect.
- `proxy.ts` — retains Clerk request middleware without deprecated path-based authorization.
- `app/components/dashboard/workspace.tsx` — subject-scoped local data, honest unavailable modules, loading state.
- `app/components/dashboard/skill-evidence.tsx` — subject-scoped evidence and safe legacy migration.
- `app/components/pip.tsx` — reads the matching subject-scoped context.
- `app/onboarding/page.tsx` — account-aware browser key and accurate persistence copy.
- `app/error.tsx`, `app/not-found.tsx` — failure and missing-route experiences.
- `tests/unit/dashboard-auth.test.tsx` — denied/authorized auth regression coverage.
- `tests/unit/workspace.test.tsx`, `tests/unit/onboarding.test.tsx` — Clerk mocks and storage-isolation assertions.
- `package.json`, `package-lock.json` — Vitest upgraded to 4.1.12.
- `next.config.ts` — removed cache/partial-prefetch experimental settings that conflicted with runtime auth; enabled webpack memory optimization diagnostic setting.
