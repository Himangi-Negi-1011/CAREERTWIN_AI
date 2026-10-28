# CareerTwin database schema

The dedicated Supabase project was inventoried before changes and contained no public application tables, migrations, or Storage buckets. The first version-controlled migration is now applied. The broader table list below remains a design draft and will be delivered incrementally.

## Ownership strategy

Every user-owned root record stores `owner_clerk_user_id text not null`. Child records reference an owned parent with foreign keys. RLS compares the owner to a verified Clerk identity claim or uses server-mediated access until the Clerk/Supabase JWT integration is configured and tested.

## Implemented foundation

- `career_profiles` — one profile per Clerk subject, validated education and availability fields, onboarding state, timestamps, forced RLS, and owner-only CRUD policies.
- Private `resumes` Storage bucket — 5 MB limit, PDF/DOCX MIME allowlist, and owner-folder CRUD policies.
- `current_clerk_user_id()` — reads the verified JWT `sub` claim and returns null without a valid subject.

## Proposed next tables

- `career_profiles` additions — learning preferences and expanded onboarding fields, added through non-destructive migrations.
- `career_targets` — selected role, custom role, timeline, active flag.
- `skill_definitions` — canonical skill and category.
- `career_roles` — curated target role metadata and source freshness.
- `role_competencies` — required level, weight, prerequisites, evidence source.
- `user_skill_evidence` — confirmed/inferred evidence, level, source, verification state.
- `skill_assessments` and `assessment_attempts` — stable evaluation records.
- `resume_files` and `resume_analyses` — private object metadata, extraction state, reviewed structured output.
- `roadmaps` and `roadmap_tasks` — generated plan and persistent task state.
- `project_recommendations` and `user_projects` — recommendation snapshots and selected work.
- `project_milestones` — implementation progress and evidence.
- `interview_sessions` and `interview_answers` — setup, responses, criteria, and guidance.
- `learning_activities` — append-only activity history.
- `skill_proficiency_history` — evidence-backed changes over time.
- `ai_conversations` and `ai_messages` — optional, user-controlled chat history.
- `user_preferences` — Pip, motion, sound, privacy, and notification settings.

## Database requirements

- UUID primary keys generated in PostgreSQL.
- `created_at` and `updated_at` timestamps.
- Foreign keys and explicit delete behavior.
- Unique constraints for one active profile/target and idempotent generation keys.
- Indexes beginning with owner IDs and common timeline/filter fields.
- Check constraints for proficiency, priority, state, and non-negative durations.
- RLS enabled on every user-owned table before application access.
- No broad anonymous read policies.

## Storage draft

Private bucket: `resumes`.

Object path: `<clerk-user-id>/<resume-id>/<sanitized-file-name>`.

Policies must limit object read/write/delete to the owner. Upload validation will enforce MIME type, extension, size, and server-generated object paths. Database deletion and object deletion will be coordinated and audited.
