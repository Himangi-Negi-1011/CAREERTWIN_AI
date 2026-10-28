# CareerTwin feature program — 23 October 2026

## Governing decisions

- Preserve Next.js, React, TypeScript, Tailwind CSS, Clerk, Supabase, Vitest, and Vercel.
- Do not migrate to Vite, Firebase Auth, Firestore, Express, or Render.
- Use a provider-neutral, server-side AI boundary. AI controls stay unavailable until credentials, validation, privacy, and real provider responses are verified.
- Never convert planned features into implied working claims.

## Current status

| Area | Status | Evidence and limitation |
| --- | --- | --- |
| Responsive landing experience | Working | Existing production landing page, navigation, motion, and reduced-motion support. Dark mode is planned. |
| Authentication | Working | Clerk protects the dashboard and provides sign-in/sign-up. Provider options depend on Clerk configuration. |
| Target-role onboarding | Working, limited | Role selection and account-scoped local draft work. The five-step profile flow is planned. |
| Career workspace | Working | Overview, skill evidence, roadmap, projects, interviews, progress, export, and guide are connected. |
| Skill evidence | Working, self-recorded | Users record status and evidence. No AI verification or assessment claim. |
| Learning roadmap | Working, rules-based | Starter/custom steps and completion tracking work locally. Adaptive AI planning is planned. |
| Evidence projects | Working | User-defined projects and status tracking work locally. |
| Interview practice | Working, self-assessed | Questions, guidance, editable answer text, self-rating, reflection, and local history work. |
| Voice answer preview | Working where supported | Browser microphone recording, playback, re-record, discard, and typed transcript review. Audio stays in the current tab and is not uploaded or persisted. |
| Automatic transcription | Planned/blocked | Requires a selected provider, consent, retention policy, server validation, and integration tests. |
| AI feedback and scoring | Planned/blocked | No credentials or verified provider adapter. No AI score is shown. Rubric coverage rules must be implemented before overall scores. |
| Supabase profile foundation | Partially available | Existing schema/RLS/storage checks passed, but development modules still use owner-scoped browser storage. |
| Documents | Planned | Secure upload, extraction, review, approval, duplicate handling, and deletion are not implemented. |
| Career intelligence/gap analysis | Planned | Requires sourced role requirements, explainable calculations, user confirmation, and persistent records. |
| Notifications/check-ins | Planned | Requires persistent scheduling, timezone handling, delivery semantics, and preferences. |
| Privacy center/data deletion | Planned | Existing interface provides safe-use guidance and JSON export; complete server-data controls are not implemented. |
| Linear/Notion integrations | Unavailable by design | Require CareerTwin-owned OAuth apps, secure token storage, state validation, minimum scopes, and revocation. |

## Delivery phases

### Phase 1 — honest interview capture (implemented locally)

- Browser microphone permission handling.
- Start, stop, playback, re-record, and discard.
- Explicit current-tab-only audio handling.
- Editable typed/pasted answer transcript.
- Saved transcript text and user self-reflection; no uploaded audio or fabricated AI assessment.

### Phase 2 — server-persisted profiles and interview sessions

- Version-controlled Supabase migration for profiles, interview sessions, answers, and consent metadata.
- Clerk-subject ownership enforced server-side and with RLS.
- Zod validation, retention controls, tested create/read/update/delete operations, and safe migration plan.
- Do not deploy destructively or overwrite existing data.

### Phase 3 — provider-neutral transcription and evaluation boundary (started)

- Added authenticated `POST /api/interviews/evaluate` with Zod request/output validation, a 25-second timeout, safe configuration/provider errors, interview-type rubrics, evidence citations, and the 75% assessed-weight rule.
- The provider-neutral adapter now supports the official `@google/genai` SDK when `AI_PROVIDER=gemini`, `GEMINI_API_KEY`, and `GEMINI_MODEL` are configured, or OpenRouter when its server-side variables are configured. Credentials never reach client code.
- Added `GET /api/health/ai`, which reports configuration initialization honestly without leaking keys or claiming live provider connectivity when no credential is available.
- The original repository contained no Gemini initialization code or `Gemini API initialized: false` log. Gemini support was added to the existing Next.js server architecture rather than migrating to the unrelated Vite/Express/Firebase proposal.
- Server-only provider adapter and environment validation.
- Explicit recording consent and upload-size/type limits.
- Transcript preview/edit/approve before profile or history updates.
- Failure, retry, deletion, and retention behavior tested without fake success states.

### Phase 4 — evidence-aware interview evaluation

- Interview-type-specific rubrics.
- Criterion-level citations to transcript excerpts.
- Exclude criteria with insufficient evidence.
- Display an overall score only when at least 75% of rubric weight was assessed.
- Preserve original/revised assessments and support reassessment requests.

### Phase 5 — career intelligence and skill gaps

- Source role requirements and label their provenance/date.
- Separate recorded, verified, inferred, and estimated information.
- Preview and user approval before changing targets, profile data, or roadmaps.

### Phase 6 — documents, adaptive roadmaps, notifications, and privacy center

- Add each area incrementally with migrations, RLS, privacy controls, tests, and explicit unavailable states until providers are verified.
