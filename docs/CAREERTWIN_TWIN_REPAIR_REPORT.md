# CareerTwin Digital Twin Repair — Engineering Report

Date: 27 October 2026

## Executive status

The local repair and integration layer now has a deterministic, persisted Career Twin as its canonical source. Profile saves, skill evidence, roadmap/project work, weekly activity, assessments, interview-approved roadmap items, dashboard summaries, and Pip recommendations are connected to that source where secure synchronization is available. Browser drafts remain an explicit outage fallback and are not represented as secure saves.

The promoted production release remains unchanged at <https://careertwin-three.vercel.app>. It predates this repair. No deployment or destructive database operation was performed. Production authenticated persistence remains blocked because the Vercel project has Clerk variables only and does not have the required Supabase server variables.

The supplied workspace is not a Git working tree (`.git` is absent), so `git status`/diff inspection is unavailable. Existing files, migrations, reports, and executable test results were used as the source of truth; no Git state is claimed.

## Root causes found

1. Profile data had a Supabase API, but evidence, roadmap, projects, weekly plans, assessment history, and dashboard summaries were primarily independent owner-namespaced browser records.
2. There was no validated Twin source/output contract, deterministic server recomputation pipeline, persisted revision, idempotent mutation boundary, or secure assessment session.
3. Several post-repair integrations still bypassed canonical state: Career Intelligence roadmap additions, interview roadmap approval, and Pip guidance.
4. Onboarding could prefer a stale browser draft over a newer server profile.
5. Roadmap generation accepted client-supplied profile context rather than loading the authenticated saved profile.
6. Query-linked workspace navigation did not react reliably after initial render.
7. Some asynchronous failures displayed wording that could be mistaken for a secure success.
8. Settings and account export needed explicit authenticated, owner-scoped server endpoints and input validation.
9. Mutable workspace modules could mount from an older browser draft while the canonical Twin request was still in flight, creating a narrow stale-overwrite race for deep links or very fast navigation.
10. Production configuration is incomplete: required Supabase variables are absent, and no AI provider is securely configured.

## Implemented repair

### Canonical Twin and deterministic calculations

- Added Zod-validated Career Twin source and output contracts.
- Added maintained role-requirement frameworks and explicit calculation limitations.
- Added deterministic states for demonstrated, developing, assessment-supported, and unverified skills.
- Missing evidence is never treated as proof that a skill is absent.
- Added evidence coverage with a documented meaning; it is not called job readiness or mastery.
- Added one canonical next recommendation derived from the saved profile, evidence, roadmap, weekly activity, and assessments.
- Added canonical roadmap, weekly-progress, assessment, gap, and evidence summaries.
- Added authenticated `/api/twin` GET/PATCH endpoints with validated partial updates.
- Added owner-scoped persistence with optimistic revisions and idempotent mutation IDs.

### Profile, dashboard, roadmap, and Pip integration

- Profile saves trigger Twin recalculation and return an explicit warning if that secondary operation fails.
- Onboarding compares `updatedAt` and uses the newer valid browser or server profile.
- Dashboard loads canonical Twin state when available and aggregates from canonical evidence, development, and weekly sources.
- Mutable modules now wait for the initial canonical Twin request to resolve before mounting. On success they hydrate from canonical state; on failure they deliberately enter browser-draft fallback instead of racing an in-flight server load.
- Query-linked destinations update the current workspace view reliably.
- Career Intelligence roadmap actions persist through the Twin API.
- Roadmap AI generation loads the authenticated saved profile server-side; client-supplied profile authority was removed.
- Pip now consumes the canonical Twin recommendation and canonical evidence context inside the signed-in workspace. Its public-page fallback remains local and clearly labeled.
- Non-AI profile, Twin, evidence, task, project, weekly, assessment, and progress paths remain available when AI is unavailable.

### Assessments and interviews

- Added secure, expiring assessment sessions. Submissions must match the server-issued question set and cannot be reused.
- Added the `complete_assessment_with_twin` transaction boundary so assessment finalization, limited assessment evidence, Twin recomputation, and revision persistence succeed or fail together.
- Assessment evidence is explicitly limited and does not claim mastery.
- Interview roadmap approval attempts canonical development synchronization and reports a warning if Twin synchronization fails.
- Transcript-retention preferences are enforced in interview persistence.
- Interview and practice browser drafts use truthful draft/sync-failure messaging.

### Settings, privacy, and export

- Added authenticated privacy-preference GET/PUT handling with Zod validation.
- Added an authenticated, owner-scoped JSON account export endpoint.
- Export is downloaded through authenticated fetch/blob handling rather than an unauthenticated navigation.
- Removed visible but unimplemented AI-personalization toggles; AI controls remain unavailable until authorization and secure credentials are verified.

## Database changes

Applied additive migrations to Supabase project `guisgrevijogykburmvf` in `ap-south-1`:

- `20261027183000_career_twin_engine.sql`
  - `public.career_twin_states`
  - `public.career_assessment_sessions`
  - `public.upsert_career_twin_state(...)`
  - enabled and forced RLS with owner policies
- `20261027193000_atomic_assessment_twin.sql`
  - atomic assessment finalization and Twin revision RPC

No tables were dropped, and no existing user rows were deleted or overwritten.

Live checks:

- Two-identity transactional RLS isolation passed and rolled back without persisted test rows.
- A live transactional atomic assessment/Twin completion passed, created revision 1 inside the transaction, and rolled back without persisted synthetic data.

## Principal changed files

- `lib/profile/schema.ts`
- `lib/twin/schema.ts`
- `lib/twin/roles.ts`
- `lib/twin/engine.ts`
- `lib/twin/repository.ts`
- `lib/twin/client.ts`
- `lib/interviews/repository.ts`
- `app/api/profile/route.ts`
- `app/api/twin/route.ts`
- `app/api/assessments/submit/route.ts`
- `app/api/roadmap/generate/route.ts`
- `app/api/interviews/[sessionId]/apply-to-roadmap/route.ts`
- `app/api/settings/route.ts`
- `app/api/account/export/route.ts`
- `app/onboarding/page.tsx`
- `app/components/dashboard/workspace.tsx`
- `app/components/dashboard/career-intelligence.tsx`
- `app/components/dashboard/development-hub.tsx`
- `app/components/dashboard/skill-evidence.tsx`
- `app/components/dashboard/interview-coach.tsx`
- `app/components/pip.tsx`
- `supabase/migrations/20261027183000_career_twin_engine.sql`
- `supabase/migrations/20261027193000_atomic_assessment_twin.sql`
- focused unit/API/component regressions under `tests/unit/`

## Verification matrix

| Check | Status | Evidence / limitation |
|---|---|---|
| TypeScript | PASS | `npm run typecheck` completed after final Pip integration |
| ESLint | PASS | `npm run lint` completed after final Pip integration |
| Unit/API/component tests | PASS | 59/59 across 17 files, including canonical-before-mutable-module hydration regression |
| Production build | PASS | Final Next.js optimized build compiled, type-checked, and generated all routes |
| Local Playwright desktop/mobile | PASS | 14/14 against the final built production server |
| Local public landing/onboarding interactions | PASS | Desktop/mobile landing, Pip, seven-step wizard, and target-role autosave covered |
| Supabase health | PASS | Project services healthy |
| Twin migrations | PASS | Both additive migrations applied |
| Twin RLS owner isolation | PASS | Two synthetic identities; transaction rolled back |
| Atomic assessment/Twin transaction | PASS | Live transaction passed; synthetic data rolled back |
| Production public routes | PASS | `/`, `/sign-in`, `/sign-up`, and `/onboarding` returned 200 on desktop/mobile with no captured console/page errors |
| Production unsigned dashboard protection | PASS | `/dashboard` redirected to `/sign-in?redirect_url=%2Fdashboard` on desktop/mobile |
| Production authenticated persistence | BLOCKED | Required Supabase server variables are absent from Vercel |
| AI provider generation/failure journey | BLOCKED | No rotated secure provider credential is configured |
| Full signed-in local browser journey | BLOCKED | No authorized dedicated Clerk browser identities and local Supabase server configuration |
| Refresh and sign-out/sign-in restoration | BLOCKED | Requires the configured authenticated persistence journey |
| Two real Clerk account browser isolation | NOT RUN | No authorized credentials for two dedicated test accounts |
| Deployment of this repair | NOT DEPLOYED | User approval is required; promoted production remains unchanged |

The first Playwright attempt in this resumed environment could not launch Chromium because Linux browser libraries were absent. The dependencies were installed, the same final suite was rerun successfully, and the infrastructure-only launch failure is not counted as an application failure.

## Production inspection

- Promoted URL: <https://careertwin-three.vercel.app>
- Promoted deployment: `dpl_2Rg3sH3qVNxnaCCH2iqBCv3QQp6K`
- Vercel project: `prj_of5B4TFveMmgPmmSDkPlBJxR6qYF`
- Existing deployment build logs show successful compilation and deployment. Package-install warnings were non-fatal.
- Vercel environment inspection shows production Clerk configuration only.
- The production release predates the repair, so public-route availability is not evidence that the repaired authenticated journey is deployed.

## Required secure configuration and remaining QA

Configure these directly in Vercel protected environment settings; do not paste values into chat:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

If AI is to be enabled, configure newly rotated provider credentials through protected server environment settings. Do not reuse any credential previously pasted into chat.

After configuration and explicit deployment approval:

1. Deploy the reviewed repair.
2. Use two dedicated Clerk test accounts.
3. Execute and record the complete journey:
   `Sign in → Complete onboarding → Save career profile → Calculate Twin → View skill gaps → Create/update roadmap → Complete learning task → Take assessment → Save results → Update evidence → Recalculate recommendations → Refresh dashboard → Verify persistence → Sign out/in → Verify restoration`.
4. Test empty/incomplete profile, database failure, missing AI credentials, malformed AI output, expired authentication, duplicate submission, revision conflict, refresh recovery, and two-user isolation in the browser.
5. Reinspect console/network failures, loading states, mobile navigation, and every authenticated primary action.

Until those steps succeed, production end-to-end readiness remains **BLOCKED**, not PASS.
