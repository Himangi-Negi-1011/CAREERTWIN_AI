# CareerTwin integration audit

Reviewed: 2026-10-21

## Repository

The repository is a Next.js 16 App Router application with React 19, TypeScript, Tailwind CSS 4, Framer Motion, Zod, Vitest, Testing Library, and Playwright. Phase 1 contains the marketing site, Pip UI shell, a clearly labeled local-only onboarding role draft, and an honest unconfigured sign-in state.

There is currently no Clerk SDK, Supabase client, Supabase migration, database schema, or Vercel project for CareerTwin in the repository/account.

## Connected services

### Supabase — verified

The connector credentials are valid. After explicit approval, a dedicated free-plan project named `CareerTwin` was created in Mumbai (`ap-south-1`) with reference `guisgrevijogykburmvf`. The new project was inspected before changes: it had no public tables, no custom migrations, and no Storage buckets.

Migration `20261021061144_profile_foundation` was then applied from the version-controlled file `supabase/migrations/20261021061144_profile_foundation.sql`. It adds the owned `career_profiles` table, forced RLS, four owner-only policies, a private 5 MB `resumes` bucket limited to PDF/DOCX, and four owner-path Storage policies. A rollback-only two-identity check confirmed cross-user updates affect zero rows, an unauthorized insert is rejected with PostgreSQL error `42501`, and no test data persisted.

Two unrelated older projects remain inactive and were not changed. Supported connector operations include project and health inspection, SQL queries, migration history/application, database branches, API keys, auth configuration, edge functions, and project secrets.

### Vercel — verified

The connector credentials are valid. Existing projects and deployments are accessible, but no project named CareerTwin exists. Existing unrelated production projects were not changed. Supported operations include project/deployment inspection, build events/files, environment variables, domains, teams, feature flags, shared variables, and deployment creation. No project or deployment was created because production/public publishing requires approval.

### Linear — verified and organized

Authenticated as Sourav in team `G16`. No CareerTwin project existed. A new planned, high-priority CareerTwin project and 11 backlog issues were created. See the project in Linear for issue identifiers `G16-5` through `G16-15`.

### Notion — verified but workspace access is insufficient

The credential is valid. Search returned no CareerTwin documentation. The only accessible page is a Notion person-profile record. Notion does not allow normal page content beneath a person profile, so no page was created or modified. Share a normal parent page with the integration to enable documentation creation. Until then, the canonical docs live under `docs/` in this repository.

## Required decisions/configuration

1. Provide Clerk project credentials through `.env.local`/Vercel environment variables—not chat or source files.
2. Configure Clerk-issued session tokens for Supabase and verify the production claim shape before browser database access is enabled.
3. Share a normal Notion parent page with the integration if Notion-hosted documentation is desired.
4. Create the approved Vercel preview project only after the database/auth foundation is ready. Production deployment remains separately approval-gated.
