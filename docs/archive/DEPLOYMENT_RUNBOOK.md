# CAREERTWIN PRODUCTION DEPLOYMENT RUNBOOK

**Target Environment:** Production / Staging  
**Platform:** Vercel / Node.js Standalone (Docker)  
**Database:** Supabase PostgreSQL with Row Level Security (RLS)  
**Identity Provider:** Clerk Authentication  
**AI Engine:** Google Gemini API  

---

## 1. Environment Variable Inventory

| Environment Variable | Target | Type | Required | Purpose |
|:---|:---|:---|:---|:---|
| `NEXT_PUBLIC_APP_URL` | Client + Server | Public URL | **Yes** | Canonical origin (e.g. `https://careertwin.ai` or `https://careertwin-three.vercel.app`) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Client + Server | Public Key | **Yes** | Clerk frontend SDK initialization |
| `CLERK_SECRET_KEY` | Server Only | Secret Key | **Yes** | Server-side user authentication & session verification |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Client + Server | Config URL | **Yes** | Defaults to `/login` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Client + Server | Config URL | **Yes** | Defaults to `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Client + Server | Config URL | **Yes** | Defaults to `/dashboard` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Client + Server | Config URL | **Yes** | Defaults to `/onboarding` |
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Public URL | **Yes** | Supabase Project REST API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Public Key | **Yes** | Supabase anonymous public client key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server Only | Secret Key | **Yes** | Administrative database access bypasses RLS for server operations |
| `GEMINI_API_KEY` | Server Only | Secret Key | **Yes** | Google Gemini API key for AI Tutor, Interview Coach & Roadmaps |
| `GEMINI_MODEL` | Server Only | Config String | Optional | Model identifier (defaults to `gemini-1.5-pro` or `gemini-1.5-flash`) |

> [!CAUTION]
> Never expose `CLERK_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, or `GEMINI_API_KEY` to client components or commit them into git tracking.

---

## 2. Database Migration & Schema Setup

CareerTwin uses Supabase PostgreSQL. Clerk provides the authenticated user identity (`owner_clerk_user_id`), and Supabase tables use Row Level Security (RLS) to enforce student data isolation.

### Step 2.1: Applying Schema Migrations
1. Open your Supabase Project Dashboard -> **SQL Editor**.
2. Load the consolidated migration script: `supabase/all_migrations.sql`.
3. Click **Run** to execute the migration.
4. Verify all tables are created:
   - `career_profiles`
   - `career_twin_states`
   - `career_assessment_sessions`
   - `interview_sessions`
   - `interview_questions`
   - `interview_assessments`
   - `career_roadmap_tasks`
   - `skill_catalog`
   - `skill_aliases`
   - `learning_resources`
   - `learning_curricula`
   - `ai_generation_jobs`
   - `learning_enrollments`
   - `learning_progress`
   - `learning_quiz_attempts`
   - `skill_mastery_evidence`
   - `curriculum_records`
   - `learning_lessons`
   - `learning_mock_tests`
   - `learning_mock_test_attempts`
   - `user_learning_progress`
   - `student_portfolios`
   - `career_applications`
   - `student_feedback`

### Step 2.2: Clerk JWT Template Configuration
To allow authenticated Supabase queries using student credentials:
1. In Clerk Dashboard -> **JWT Templates** -> Create **Supabase**.
2. Configure the signing key and add `sub` claim.
3. Save the template with name `supabase`.

---

## 3. Pre-Deployment Verification Gate

Before initiating a production deployment, run the following automated checks locally or in CI:

```bash
# 1. Typecheck
npm run typecheck
# Must exit with 0 errors

# 2. Course Library Integrity
npm run courses:validate
# Must report 14/14 VALID production courses

# 3. Unit & Integration Test Suites
npm run test
# Must pass 47/47 test files (167 tests, 0 failures)

# 4. Production Build Test
npm run build
# Must compile successfully and generate all 39 static and dynamic routes

# 5. Playwright Browser E2E Tests
npx playwright test
# Must pass 20/20 browser journeys across desktop and mobile
```

---

## 4. Deployment Procedures

### Method A: Vercel (Recommended)
1. Link GitHub repository `Himangi-Negi-1011/CAREERTWIN_AI` to Vercel.
2. In Project Settings -> **Environment Variables**, populate the 12 variables from Section 1.
3. Build & Development Settings:
   - **Framework Preset:** Next.js
   - **Build Command:** `next build --webpack` (or `npm run build`)
   - **Output Directory:** `.next`
   - **Node.js Version:** `20.x` or `22.x`
4. Deploy branch `main`.

### Method B: Self-Hosted Docker / Standalone Server
```dockerfile
# Multi-stage Docker build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/content ./content
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 5. Post-Deployment Verification (Smoke Tests)

Immediately following deployment, perform the following live verification:

1. **System Health Check:**
   - Navigate to `/api/admin/health`
   - Verify `database.status` is `connected`
   - Verify `learningLibrary.status` is `production_ready` (14 courses, 84 lessons, 84 assessments)
   - Verify `aiProvider.status` is `healthy`
2. **Landing Page:**
   - Open `/`
   - Check hero heading, CTA navigation, theme toggle (Dark/Light)
   - Confirm floating `<Pip>` assistant is absent from public landing
3. **Authentication & Protected Routes:**
   - Attempt to open `/dashboard` directly without authentication -> Verify redirect to `/login`
   - Register or log in with test account -> Verify seamless dashboard entry
4. **Learning Experience:**
   - Open `/dashboard?view=learning` -> Confirm all 14 courses display
   - Open Python or Cloud Computing course -> Verify 6 lessons render with readable code examples
   - Open 100-Mark Mock Exams Hub -> Verify 28 questions load with zero answer key leakage
5. **Settings & Logout:**
   - Open Profile & Settings -> Update full name -> Verify persistence
   - Click "Sign Out" -> Verify immediate redirect to `/login?logged_out=true` with confirmation banner
   - Attempt to revisit `/dashboard` -> Verify access denied

---

## 6. Rollback Procedures

### Instant Rollback on Vercel
1. Open Vercel Dashboard -> **Deployments**.
2. Locate the last known good deployment.
3. Click the three dots (`...`) -> **Promote to Production**.
4. Traffic is redirected to the previous build within 5 seconds without downtime.

### Database Rollback Strategy
- Migrations are designed to be additive (`IF NOT EXISTS`, nullable new columns).
- When a schema change must be reverted, apply an explicit rollback SQL script (`supabase/migrations/revert_*.sql`).
- If data corruption occurs, restore from the automated daily point-in-time recovery (PITR) backup in Supabase Dashboard -> **Database** -> **Backups**.

---

## 7. Incident Response & Troubleshooting

| Symptom | Probable Cause | Immediate Remediation |
|:---|:---|:---|
| `500 Server Error` on API routes | Missing Supabase or Gemini server environment keys | Check Vercel Project Settings -> Environment Variables. Ensure `SUPABASE_SERVICE_ROLE_KEY` and `GEMINI_API_KEY` are defined for Production. |
| `EROFS: read-only file system` | Attempted local file write in serverless `/var/task` | Ensure Supabase persistence is active. File writes in serverless must use `try/catch` and treat local disk as temporary. |
| User redirected in infinite loop on `/login` | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` domain mismatch | Verify Clerk allowed redirect URLs match production domain (`careertwin.ai`). |
| AI Tutor returns fallback messages | Gemini quota limit or invalid API key | Verify Google Cloud Console billing/quota for Generative Language API. Fallback deterministic explanations remain functional. |

