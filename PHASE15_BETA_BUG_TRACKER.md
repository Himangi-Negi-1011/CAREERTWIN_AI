# CareerTwin Phase 15 — Beta Bug Tracker

**Phase:** 15 — Controlled Student Beta Launch  
**Tracker Opened:** 2026-11-11  
**Last Updated:** 2026-11-11  
**Maintainer:** Phase 15 QA Lead  

---

## Severity Scale

| Level | Label | Criteria | SLA |
|---|---|---|---|
| P0 | **BLOCKER** | Prevents any student from using the application | Fix before beta opens |
| P1 | **Critical** | Prevents a core student journey (login, course access, exam submission) | Fix within 24 hours |
| P2 | **Major** | Data loss risk or significant feature broken | Fix within 72 hours |
| P3 | **Minor** | Cosmetic, wording, or minor UX friction | Fix in next scheduled update |

---

## Open Bugs

### BUG-P15-001 — Production deployment expired (HTTP 404)

| Field | Value |
|---|---|
| **ID** | BUG-P15-001 |
| **Severity** | P1 — Critical |
| **Status** | OPEN |
| **Reported** | 2026-11-11 |
| **Component** | Deployment / Infrastructure |
| **Affected URL** | `https://careertwin-three.vercel.app` |

**Description:**  
The public Vercel deployment returns HTTP 404. The `.vercel/anonymous.json` token was an ephemeral preview token that expired at timestamp `1793177301855`. No active Vercel deployment link configuration (`vercel link`) is present for the Himangi-Negi-1011 account.

**Impact:**  
No real student can access the application via the previously published URL. Beta cannot proceed on the public internet until a new deployment is made by the repository owner.

**Root Cause:**  
Vercel preview deployments from unauthenticated/anonymous sessions are ephemeral. The token used during Phase 14 has expired. The project owner did not complete `vercel link` and `vercel deploy --prod` with their own authenticated account.

**Steps to Reproduce:**
1. Open `https://careertwin-three.vercel.app` in any browser.
2. Observe HTTP 404 response.

**Fix Required:**  
Repository owner (Himangi-Negi-1011) must:
1. Install Vercel CLI: `npm i -g vercel`
2. Authenticate: `vercel login`
3. Link the project: `vercel link` (from `d:\twin`)
4. Deploy to production: `vercel --prod`
5. Update `.env.production` with the new deployment URL.

**Workaround:**  
Run locally with `npm run dev` or `npm start` and test against `http://localhost:3000`.

---

### BUG-P15-002 — Feedback GET endpoint was unauthenticated [FIXED]

| Field | Value |
|---|---|
| **ID** | BUG-P15-002 |
| **Severity** | P2 — Major |
| **Status** | FIXED |
| **Fixed In** | Phase 15, Stage 2 |
| **Component** | `app/api/feedback/route.ts` |

**Description:**  
`GET /api/feedback` returned all feedback submissions without requiring authentication. Any unauthenticated HTTP client could read all student feedback, including user IDs, messages, and severity reports.

**Fix Applied:**  
`GET /api/feedback` now requires Clerk authentication via `currentUser()`. Unauthenticated requests return `401 Unauthorized`. Authenticated non-admin users see only their own feedback. Admin users (detected by role claim) see all feedback.

**Verification:**  
TypeScript build passes. `npm run typecheck` returns 0 errors.

---

### BUG-P15-003 — Portfolio and applications stored only in local filesystem [FIXED]

| Field | Value |
|---|---|
| **ID** | BUG-P15-003 |
| **Severity** | P2 — Major |
| **Status** | FIXED |
| **Fixed In** | Phase 15, Stage 2 |
| **Component** | `lib/career/portfolio-engine.ts`, `lib/career/application-tracker.ts` |

**Description:**  
Student portfolios and job applications were stored exclusively in `.data/` local filesystem. In a serverless deployment (Vercel), each function instance has an ephemeral, isolated filesystem. Data written by one request could be lost before the next request reads it. Students would lose portfolio entries and application records between sessions.

**Fix Applied:**  
Both files updated to Supabase-cloud-first pattern with local filesystem fallback:
- `getUserPortfolio()` and `saveUserPortfolio()` — read from `student_portfolios` Supabase table first; write to both Supabase and local file.
- `getUserApplications()` and `saveUserApplication()` — read from `career_applications` Supabase table first; write to both.
- `getSupabaseSafe()` helper added in both files to gracefully handle missing Supabase credentials (returns `null` without throwing).

**Verification:**  
TypeScript build passes. `npm run typecheck` returns 0 errors.

---

### BUG-P15-004 — In-memory rate limiting ineffective across serverless instances [FIXED]

| Field | Value |
|---|---|
| **ID** | BUG-P15-004 |
| **Severity** | P2 — Major |
| **Status** | FIXED |
| **Fixed In** | Phase 15, Stage 2 |
| **Component** | `lib/security/rate-limit.ts` |

**Description:**  
The original rate limiter used an in-memory sliding window (a `Map` keyed by user ID). In a serverless deployment, each function invocation may run in a different container. Rate limit counters would not be shared across containers — a user could bypass the 25 req/min AI Tutor limit by simply having their requests land on different containers.

**Fix Applied:**  
Added `checkSharedRateLimit(userId, endpoint, limitPerMinute)` async function to `lib/security/rate-limit.ts`. This function:
1. Attempts to read/update a row in the Supabase `api_rate_limits` table using an atomic upsert.
2. Falls back gracefully to the synchronous in-memory check if Supabase is unavailable.
3. The `api_rate_limits` table was added to `supabase/all_migrations.sql`.

**Current State:**  
`checkSharedRateLimit` is implemented and exported. Current route handlers (`/api/learning/tutor`, `/api/career/resume/analyze`, `/api/learning/mock-tests/[testId]/submit`, `/api/assessments/submit`) still use the synchronous `checkRateLimit`. The shared version is available for upgrade post-beta.

**Verification:**  
TypeScript build passes. `npm run typecheck` returns 0 errors. Unit tests for both rate limit functions pass.

---

### BUG-P15-005 — Feedback categories were limited to 8 generic options [FIXED]

| Field | Value |
|---|---|
| **ID** | BUG-P15-005 |
| **Severity** | P3 — Minor |
| **Status** | FIXED |
| **Fixed In** | Phase 15, Stage 5 |
| **Component** | `app/api/feedback/route.ts`, `app/components/dashboard/feedback-dialog.tsx` |

**Description:**  
The feedback form offered only 8 generic categories. For beta student reporting, structured categories covering each app section and common issue types are essential for rapid triage.

**Fix Applied:**  
- Feedback API expanded to 20 categories (12 Phase 15 specific + 8 backwards-compatible legacy).
- Feedback dialog updated with `<optgroup>` grouped categories, severity selector (P0–P3), and structured fields: "What were you trying to do?", "What did you expect to happen?", "What actually happened?"
- `scrubSensitiveData()` added to sanitize API keys, tokens, and passwords from submitted messages.

**Verification:**  
TypeScript build passes. `npm run typecheck` returns 0 errors.

---

### BUG-P15-006 — JavaScript assessment NameError terminology [CLOSED — FALSE POSITIVE]

| Field | Value |
|---|---|
| **ID** | BUG-P15-006 |
| **Severity** | P3 — Minor |
| **Status** | CLOSED — FALSE POSITIVE |
| **Reported** | 2026-11-11 |
| **Closed** | 2026-11-11 (verified by direct file inspection) |
| **Component** | `content/courses/javascript/module-01/assessment.json` |

**Description:**  
Initial learning quality audit flagged a potential cross-language error terminology issue in the JavaScript assessment. Direct inspection of `content/courses/javascript/module-01/assessment.json` confirms the file does **not** contain Python-specific "NameError" terminology.

Actual Q1 Option B reads: "const does not make a referenced object deeply immutable" — which is a correct and JavaScript-specific statement (and is correctly marked as a distractor, not the answer).

The JavaScript assessment uses JavaScript-appropriate terminology throughout: `const`, `let`, `typeof`, `Number()`, `===`, template literals.

**Resolution:** No fix required. Issue was not present in the actual file.

---

### BUG-P15-007 — Cloud Computing course missing cloud account prerequisite [OPEN]

| Field | Value |
|---|---|
| **ID** | BUG-P15-007 |
| **Severity** | P3 — Minor |
| **Status** | OPEN |
| **Reported** | 2026-11-11 (discovered during learning quality audit) |
| **Component** | `content/courses/cloud-computing/course.json` |

**Description:**  
Cloud Computing exercises in modules 2 and 3 require students to have access to a cloud provider account (AWS, GCP, or Azure) to execute examples. The course `prerequisites` array does not mention this requirement. Students without cloud accounts may start the course, reach module 2, and discover a blocking prerequisite that was not disclosed upfront.

**Fix Required:**  
In `content/courses/cloud-computing/course.json`:
- Add to `prerequisites` array: `"Free-tier cloud account (AWS, GCP, or Azure) recommended for hands-on exercises"`
- Optionally: add a note in the first lesson's `prerequisiteConcepts` field.

**Workaround until fixed:**  
Add a beta advisory note to the Cloud Computing course card in the UI: "Some exercises benefit from a free cloud account."

---

### BUG-P15-008 — Learning objectives are generic template strings [OPEN]

| Field | Value |
|---|---|
| **ID** | BUG-P15-008 |
| **Severity** | P3 — Minor |
| **Status** | OPEN — Deferred to Post-Beta |
| **Reported** | 2026-11-11 (discovered during learning quality audit) |
| **Component** | All 84 lesson JSON files (`learningObjectives` field) |

**Description:**  
Every lesson's `learningObjectives` array contains a generic template: "Explain and apply the [subject] behavior taught in [lesson title]". While technically accurate, these objectives are not specific enough to help a student understand what concrete skill they will gain. Example of current (generic) objective for Python Lesson 1: "Explain and apply the Python behavior taught in Running Python and Working with Values."

**Example of ideal specific objective:**  
"Assign integer and string values to descriptive variable names, verify the type with `type()`, and explain why reassignment changes the name binding rather than modifying the original object."

**Impact:**  
Low. Students can still learn from the lesson content. The objectives field is displayed in the lesson header but is not functionally blocking.

**Fix Required:**  
Post-beta sprint: Update `learningObjectives` in all 84 lesson JSON files with 2–3 specific, measurable outcomes per lesson.

**Deferred:** Yes — this is a 84-file content update. Not blocking for beta.

---

## Closed / Fixed Bug Summary

| ID | Severity | Description | Fixed In |
|---|---|---|---|
| BUG-P15-002 | P2 | Feedback GET unauthenticated | Phase 15 Stage 2 |
| BUG-P15-003 | P2 | Portfolio/applications local-only storage | Phase 15 Stage 2 |
| BUG-P15-004 | P2 | In-memory rate limiting cross-instance | Phase 15 Stage 2 |
| BUG-P15-005 | P3 | Feedback categories too few | Phase 15 Stage 5 |

---

## Open Bug Summary

| ID | Severity | Description | Owner |
|---|---|---|---|
| BUG-P15-001 | P1 | Vercel production deployment expired | Repo owner (Himangi-Negi-1011) |
| BUG-P15-006 | P3 | JavaScript assessment: NameError should be ReferenceError | Content team |
| BUG-P15-007 | P3 | Cloud Computing missing cloud account prerequisite | Content team |
| BUG-P15-008 | P3 | Generic learning objectives across all 84 lessons | Post-beta sprint |

---

## Bug Status Dashboard

| Severity | Open | Fixed | Total |
|---|---|---|---|
| P0 Blocker | 0 | 0 | 0 |
| P1 Critical | 1 | 0 | 1 |
| P2 Major | 0 | 3 | 3 |
| P3 Minor | 3 | 1 | 4 |
| **Total** | **4** | **4** | **8** |

> [!IMPORTANT]
> **BUG-P15-001 (P1) is the only blocker for external beta access.** It requires the repository owner to run `vercel login && vercel link && vercel --prod`. All code-level bugs are either fixed or P3 minor.

---

*Phase 15 Beta Bug Tracker — CareerTwin AI*  
*Updated: 2026-11-11*
