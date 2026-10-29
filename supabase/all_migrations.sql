-- CareerTwin Consolidated Database Schema Migrations
-- Generated for direct application via Supabase SQL Editor

-- ==========================================
-- Migration: 20261021061144_profile_foundation.sql
-- ==========================================

-- CareerTwin profile foundation
-- Clerk is the identity provider. Supabase Auth users are intentionally not referenced.

create extension if not exists pgcrypto with schema extensions;

create or replace function public.current_clerk_user_id()
returns text
language sql
stable
set search_path = ''
as $$
  select nullif(auth.jwt() ->> 'sub', '');
$$;

comment on function public.current_clerk_user_id() is
  'Returns the verified Clerk subject from the current Supabase JWT, or null when unavailable.';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.career_profiles (
  id uuid primary key default extensions.gen_random_uuid(),
  owner_clerk_user_id text not null,
  display_name text,
  education_level text check (education_level in (
    'secondary', 'diploma', 'undergraduate', 'postgraduate', 'doctoral', 'bootcamp', 'self_taught', 'other'
  )),
  course_or_degree text,
  study_year smallint check (study_year between 1 and 12),
  country_code text check (country_code is null or country_code ~ '^[A-Z]{2}$'),
  preferred_job_market text,
  weekly_minutes integer not null default 300 check (weekly_minutes between 0 and 10080),
  onboarding_step smallint not null default 1 check (onboarding_step between 1 and 7),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint career_profiles_one_per_owner unique (owner_clerk_user_id),
  constraint career_profiles_owner_not_blank check (length(trim(owner_clerk_user_id)) > 0)
);

create index career_profiles_owner_idx on public.career_profiles (owner_clerk_user_id);

create trigger career_profiles_set_updated_at
before update on public.career_profiles
for each row execute function public.set_updated_at();

alter table public.career_profiles enable row level security;
alter table public.career_profiles force row level security;

create policy career_profiles_select_own
on public.career_profiles
for select
to authenticated
using (owner_clerk_user_id = (select public.current_clerk_user_id()));

create policy career_profiles_insert_own
on public.career_profiles
for insert
to authenticated
with check (owner_clerk_user_id = (select public.current_clerk_user_id()));

create policy career_profiles_update_own
on public.career_profiles
for update
to authenticated
using (owner_clerk_user_id = (select public.current_clerk_user_id()))
with check (owner_clerk_user_id = (select public.current_clerk_user_id()));

create policy career_profiles_delete_own
on public.career_profiles
for delete
to authenticated
using (owner_clerk_user_id = (select public.current_clerk_user_id()));

revoke all on table public.career_profiles from anon;
grant select, insert, update, delete on table public.career_profiles to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resumes',
  'resumes',
  false,
  5242880,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy resume_objects_select_own
on storage.objects
for select
to authenticated
using (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = (select public.current_clerk_user_id())
);

create policy resume_objects_insert_own
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = (select public.current_clerk_user_id())
);

create policy resume_objects_update_own
on storage.objects
for update
to authenticated
using (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = (select public.current_clerk_user_id())
)
with check (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = (select public.current_clerk_user_id())
);

create policy resume_objects_delete_own
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = (select public.current_clerk_user_id())
);


-- ==========================================
-- Migration: 20261027090000_interview_coach.sql
-- ==========================================

-- Additive CareerTwin interview coach foundation.
-- Clerk remains the identity provider; owner_clerk_user_id is always the verified Clerk subject.

create table public.interview_privacy_preferences (
  owner_clerk_user_id text primary key,
  allow_profile_context boolean not null default false,
  allow_history_personalization boolean not null default false,
  retain_transcripts boolean not null default true,
  retain_audio boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint interview_privacy_owner_not_blank check (length(trim(owner_clerk_user_id)) > 0)
);

create table public.interview_sessions (
  id uuid primary key default extensions.gen_random_uuid(),
  owner_clerk_user_id text not null,
  interview_type text not null check (interview_type in ('behavioral','technical','communication')),
  difficulty text not null check (difficulty in ('beginner','intermediate','advanced')),
  current_difficulty text not null check (current_difficulty in ('beginner','intermediate','advanced')),
  adaptive_difficulty boolean not null default false,
  question_count smallint not null check (question_count in (5,10,15)),
  playback_enabled boolean not null default false,
  target_role text not null check (length(trim(target_role)) between 2 and 120),
  allow_profile_context boolean not null default false,
  status text not null default 'active' check (status in ('active','completed','cancelled')),
  current_question_ordinal smallint not null default 1,
  final_report jsonb,
  roadmap_proposal jsonb,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint interview_sessions_owner_not_blank check (length(trim(owner_clerk_user_id)) > 0)
);
create index interview_sessions_owner_created_idx on public.interview_sessions(owner_clerk_user_id, created_at desc);
create trigger interview_sessions_set_updated_at before update on public.interview_sessions for each row execute function public.set_updated_at();

create table public.interview_questions (
  id uuid primary key default extensions.gen_random_uuid(),
  session_id uuid not null references public.interview_sessions(id) on delete cascade,
  owner_clerk_user_id text not null,
  ordinal smallint not null check (ordinal between 1 and 15),
  category text not null,
  prompt text not null,
  guidance text not null,
  difficulty text not null check (difficulty in ('beginner','intermediate','advanced')),
  answer_text text,
  input_mode text check (input_mode is null or input_mode in ('text','voice')),
  answered_at timestamptz,
  created_at timestamptz not null default now(),
  constraint interview_questions_session_ordinal_unique unique(session_id, ordinal),
  constraint interview_questions_answer_size check (answer_text is null or length(answer_text) between 20 and 8000)
);
create index interview_questions_session_idx on public.interview_questions(session_id, ordinal);

create table public.interview_assessments (
  id uuid primary key default extensions.gen_random_uuid(),
  session_id uuid not null references public.interview_sessions(id) on delete cascade,
  question_id uuid not null references public.interview_questions(id) on delete cascade,
  owner_clerk_user_id text not null,
  version smallint not null check (version > 0),
  kind text not null check (kind in ('original','reassessment')),
  clarification text,
  evaluation jsonb not null,
  coverage numeric(6,5) not null check (coverage between 0 and 1),
  overall_score numeric(4,2) check (overall_score is null or overall_score between 1 and 5),
  created_at timestamptz not null default now(),
  constraint interview_assessments_question_version_unique unique(question_id, version)
);
create index interview_assessments_session_idx on public.interview_assessments(session_id, question_id, version);

create table public.interview_roadmap_approvals (
  id uuid primary key default extensions.gen_random_uuid(),
  session_id uuid not null references public.interview_sessions(id) on delete cascade,
  owner_clerk_user_id text not null,
  proposal_snapshot jsonb not null,
  approved_at timestamptz not null default now(),
  applied_at timestamptz,
  constraint interview_roadmap_one_approval unique(session_id)
);

create table public.career_roadmap_tasks (
  id uuid primary key default extensions.gen_random_uuid(),
  owner_clerk_user_id text not null,
  source text not null check (source in ('manual','interview')),
  source_session_id uuid references public.interview_sessions(id) on delete set null,
  title text not null check (length(trim(title)) between 2 and 120),
  detail text not null check (length(trim(detail)) between 5 and 600),
  estimated_minutes integer not null check (estimated_minutes between 10 and 600),
  done boolean not null default false,
  created_at timestamptz not null default now()
);
create index career_roadmap_tasks_owner_idx on public.career_roadmap_tasks(owner_clerk_user_id, created_at desc);

create or replace function public.prevent_interview_assessment_changes()
returns trigger language plpgsql set search_path = '' as $$
begin
  raise exception 'Interview assessments are immutable; create a new version instead.';
end;
$$;
create trigger interview_assessments_immutable before update or delete on public.interview_assessments for each row execute function public.prevent_interview_assessment_changes();

alter table public.interview_privacy_preferences enable row level security;
alter table public.interview_privacy_preferences force row level security;
alter table public.interview_sessions enable row level security;
alter table public.interview_sessions force row level security;
alter table public.interview_questions enable row level security;
alter table public.interview_questions force row level security;
alter table public.interview_assessments enable row level security;
alter table public.interview_assessments force row level security;
alter table public.interview_roadmap_approvals enable row level security;
alter table public.interview_roadmap_approvals force row level security;
alter table public.career_roadmap_tasks enable row level security;
alter table public.career_roadmap_tasks force row level security;

do $$
declare t text;
begin
  foreach t in array array['interview_privacy_preferences','interview_sessions','interview_questions','interview_assessments','interview_roadmap_approvals','career_roadmap_tasks'] loop
    execute format('create policy %I on public.%I for select to authenticated using (owner_clerk_user_id = (select public.current_clerk_user_id()))', t || '_select_own', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (owner_clerk_user_id = (select public.current_clerk_user_id()))', t || '_insert_own', t);
  end loop;
end $$;

create policy interview_privacy_update_own on public.interview_privacy_preferences for update to authenticated using (owner_clerk_user_id = (select public.current_clerk_user_id())) with check (owner_clerk_user_id = (select public.current_clerk_user_id()));
create policy interview_privacy_delete_own on public.interview_privacy_preferences for delete to authenticated using (owner_clerk_user_id = (select public.current_clerk_user_id()));
create policy interview_sessions_update_own on public.interview_sessions for update to authenticated using (owner_clerk_user_id = (select public.current_clerk_user_id())) with check (owner_clerk_user_id = (select public.current_clerk_user_id()));
create policy interview_sessions_delete_own on public.interview_sessions for delete to authenticated using (owner_clerk_user_id = (select public.current_clerk_user_id()));
create policy interview_questions_update_own on public.interview_questions for update to authenticated using (owner_clerk_user_id = (select public.current_clerk_user_id())) with check (owner_clerk_user_id = (select public.current_clerk_user_id()));
create policy interview_questions_delete_own on public.interview_questions for delete to authenticated using (owner_clerk_user_id = (select public.current_clerk_user_id()));
create policy career_roadmap_tasks_update_own on public.career_roadmap_tasks for update to authenticated using (owner_clerk_user_id = (select public.current_clerk_user_id())) with check (owner_clerk_user_id = (select public.current_clerk_user_id()));
create policy career_roadmap_tasks_delete_own on public.career_roadmap_tasks for delete to authenticated using (owner_clerk_user_id = (select public.current_clerk_user_id()));

revoke all on public.interview_privacy_preferences, public.interview_sessions, public.interview_questions, public.interview_assessments, public.interview_roadmap_approvals, public.career_roadmap_tasks from anon;
grant select, insert, update, delete on public.interview_privacy_preferences, public.interview_sessions, public.interview_questions, public.career_roadmap_tasks to authenticated;
grant select, insert on public.interview_assessments, public.interview_roadmap_approvals to authenticated;


-- ==========================================
-- Migration: 20261027120000_profile_wizard.sql
-- ==========================================

-- Additive profile wizard persistence. Existing profile columns and data are preserved.
alter table public.career_profiles
  add column if not exists profile_data jsonb not null default '{}'::jsonb,
  add column if not exists profile_completion smallint not null default 0 check (profile_completion between 0 and 100);

create index if not exists career_profiles_onboarding_idx on public.career_profiles(owner_clerk_user_id, onboarding_completed);


-- ==========================================
-- Migration: 20261027183000_career_twin_engine.sql
-- ==========================================

-- Additive canonical Career Twin state. No existing records are modified or removed.
create table if not exists public.career_twin_states (
  id uuid primary key default extensions.gen_random_uuid(),
  owner_clerk_user_id text not null unique,
  source_state jsonb not null default '{}'::jsonb,
  twin_output jsonb not null default '{}'::jsonb,
  revision bigint not null default 1 check (revision > 0),
  last_mutation_id uuid,
  calculated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint career_twin_owner_not_blank check (length(trim(owner_clerk_user_id)) > 0)
);
create index if not exists career_twin_owner_idx on public.career_twin_states(owner_clerk_user_id);
drop trigger if exists career_twin_states_set_updated_at on public.career_twin_states;
create trigger career_twin_states_set_updated_at before update on public.career_twin_states for each row execute function public.set_updated_at();
alter table public.career_twin_states enable row level security;
alter table public.career_twin_states force row level security;
drop policy if exists career_twin_states_select_own on public.career_twin_states;
create policy career_twin_states_select_own on public.career_twin_states for select to authenticated using (owner_clerk_user_id = (select public.current_clerk_user_id()));
drop policy if exists career_twin_states_insert_own on public.career_twin_states;
create policy career_twin_states_insert_own on public.career_twin_states for insert to authenticated with check (owner_clerk_user_id = (select public.current_clerk_user_id()));
drop policy if exists career_twin_states_update_own on public.career_twin_states;
create policy career_twin_states_update_own on public.career_twin_states for update to authenticated using (owner_clerk_user_id = (select public.current_clerk_user_id())) with check (owner_clerk_user_id = (select public.current_clerk_user_id()));
drop policy if exists career_twin_states_delete_own on public.career_twin_states;
create policy career_twin_states_delete_own on public.career_twin_states for delete to authenticated using (owner_clerk_user_id = (select public.current_clerk_user_id()));
revoke all on public.career_twin_states from anon;
grant select, insert, update, delete on public.career_twin_states to authenticated;

create or replace function public.upsert_career_twin_state(p_owner text, p_expected_revision bigint, p_mutation_id uuid, p_source_state jsonb, p_twin_output jsonb)
returns public.career_twin_states
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare current_row public.career_twin_states;
begin
  if p_owner is null or length(trim(p_owner)) = 0 then raise exception 'owner_required' using errcode='22023'; end if;
  select * into current_row from public.career_twin_states where owner_clerk_user_id=p_owner for update;
  if found and current_row.last_mutation_id=p_mutation_id then return current_row; end if;
  if found and p_expected_revision is not null and current_row.revision<>p_expected_revision then raise exception 'stale_twin_revision' using errcode='40001'; end if;
  insert into public.career_twin_states(owner_clerk_user_id,source_state,twin_output,revision,last_mutation_id,calculated_at)
  values(p_owner,p_source_state,p_twin_output,1,p_mutation_id,now())
  on conflict(owner_clerk_user_id) do update set source_state=excluded.source_state,twin_output=excluded.twin_output,revision=public.career_twin_states.revision+1,last_mutation_id=excluded.last_mutation_id,calculated_at=now()
  returning * into current_row;
  return current_row;
end;
$$;
revoke all on function public.upsert_career_twin_state(text,bigint,uuid,jsonb,jsonb) from public, anon, authenticated;
grant execute on function public.upsert_career_twin_state(text,bigint,uuid,jsonb,jsonb) to service_role;

create table if not exists public.career_assessment_sessions (
  id uuid primary key,
  owner_clerk_user_id text not null,
  role text not null,
  question_ids text[] not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  submitted_at timestamptz,
  result_summary jsonb,
  constraint assessment_owner_not_blank check (length(trim(owner_clerk_user_id)) > 0)
);
create index if not exists career_assessment_owner_idx on public.career_assessment_sessions(owner_clerk_user_id, created_at desc);
alter table public.career_assessment_sessions enable row level security;
alter table public.career_assessment_sessions force row level security;
drop policy if exists career_assessment_sessions_select_own on public.career_assessment_sessions;
create policy career_assessment_sessions_select_own on public.career_assessment_sessions for select to authenticated using (owner_clerk_user_id=(select public.current_clerk_user_id()));
revoke all on public.career_assessment_sessions from anon;
grant select on public.career_assessment_sessions to authenticated;


-- ==========================================
-- Migration: 20261027193000_atomic_assessment_twin.sql
-- ==========================================

-- Atomically finalize a curated assessment and update its owner's canonical Twin.
create or replace function public.complete_assessment_with_twin(
  p_owner text,
  p_assessment_id uuid,
  p_expected_revision bigint,
  p_source_state jsonb,
  p_twin_output jsonb,
  p_result_summary jsonb
) returns public.career_twin_states
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare assessment_row public.career_assessment_sessions; twin_row public.career_twin_states;
begin
  select * into assessment_row from public.career_assessment_sessions where id=p_assessment_id and owner_clerk_user_id=p_owner for update;
  if not found then raise exception 'assessment_not_found' using errcode='P0002'; end if;
  if assessment_row.submitted_at is not null then raise exception 'assessment_already_submitted' using errcode='23505'; end if;
  if assessment_row.expires_at<now() then raise exception 'assessment_expired' using errcode='22023'; end if;
  select * into twin_row from public.upsert_career_twin_state(p_owner,p_expected_revision,p_assessment_id,p_source_state,p_twin_output);
  update public.career_assessment_sessions set submitted_at=now(),result_summary=p_result_summary where id=p_assessment_id and owner_clerk_user_id=p_owner;
  return twin_row;
end;
$$;
revoke all on function public.complete_assessment_with_twin(text,uuid,bigint,jsonb,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.complete_assessment_with_twin(text,uuid,bigint,jsonb,jsonb,jsonb) to service_role;


-- ==========================================
-- Migration: 20261028053357_learning_studio.sql
-- ==========================================

-- Additive Learning Studio foundation. Existing records and Career Twin data are not modified.
create table if not exists public.skill_catalog (
  id uuid primary key default extensions.gen_random_uuid(),
  canonical_name text not null,
  normalized_name text not null unique,
  slug text not null unique,
  domain text not null,
  subdomain text not null,
  description text not null,
  learning_outcomes jsonb not null default '[]'::jsonb,
  difficulty text not null check (difficulty in ('foundation','beginner','intermediate','advanced')),
  prerequisites jsonb not null default '[]'::jsonb,
  related_roles jsonb not null default '[]'::jsonb,
  proficiency_criteria jsonb not null default '[]'::jsonb,
  content_version integer not null default 1 check (content_version > 0),
  review_status text not null default 'draft' check (review_status in ('draft','approved','archived')),
  last_reviewed_at timestamptz,
  created_by_clerk_user_id text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint skill_catalog_name_not_blank check (length(trim(canonical_name)) between 2 and 120)
);
create index if not exists skill_catalog_search_idx on public.skill_catalog(normalized_name, domain);

create table if not exists public.skill_aliases (
  id uuid primary key default extensions.gen_random_uuid(),
  skill_id uuid not null references public.skill_catalog(id) on delete cascade,
  alias text not null,
  normalized_alias text not null unique,
  created_at timestamptz not null default now()
);
create index if not exists skill_alias_skill_idx on public.skill_aliases(skill_id);

create table if not exists public.learning_resources (
  id uuid primary key default extensions.gen_random_uuid(),
  title text not null, organization text not null, url text not null unique,
  retrieved_at timestamptz not null, review_status text not null check (review_status in ('curated','machine-checked','needs-review')),
  content_excerpt text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.learning_curricula (
  id uuid primary key default extensions.gen_random_uuid(),
  skill_id uuid not null references public.skill_catalog(id),
  learner_level text not null check (learner_level in ('foundation','beginner','intermediate','advanced')),
  preferred_language text not null default 'English',
  content_version integer not null check (content_version > 0),
  generation_mode text not null check (generation_mode in ('curated','ai-draft')),
  review_status text not null default 'draft' check (review_status in ('draft','approved','archived')),
  curriculum_document jsonb not null,
  prompt_version text, model_identifier text, source_references jsonb not null default '[]'::jsonb,
  created_by_clerk_user_id text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(skill_id, learner_level, preferred_language, content_version)
);
create index if not exists learning_curricula_lookup_idx on public.learning_curricula(skill_id, learner_level, preferred_language, review_status);

create table if not exists public.ai_generation_jobs (
  id uuid primary key default extensions.gen_random_uuid(), owner_clerk_user_id text not null,
  job_type text not null check (job_type in ('curriculum','lesson','quiz','exercise','project')),
  deduplication_key text not null, status text not null check (status in ('queued','generating','validating','ready','failed')),
  skill_id uuid references public.skill_catalog(id), curriculum_id uuid references public.learning_curricula(id),
  error_code text, attempts integer not null default 0 check (attempts between 0 and 5),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(owner_clerk_user_id, deduplication_key)
);
create index if not exists ai_generation_jobs_owner_idx on public.ai_generation_jobs(owner_clerk_user_id, created_at desc);

create table if not exists public.learning_enrollments (
  id uuid primary key default extensions.gen_random_uuid(), owner_clerk_user_id text not null,
  curriculum_id uuid not null references public.learning_curricula(id), status text not null default 'active' check (status in ('active','paused','complete')),
  current_module integer not null default 0 check (current_module >= 0), current_lesson integer not null default 0 check (current_lesson >= 0),
  enrolled_at timestamptz not null default now(), last_studied_at timestamptz, completed_at timestamptz,
  unique(owner_clerk_user_id, curriculum_id)
);
create index if not exists learning_enrollments_owner_idx on public.learning_enrollments(owner_clerk_user_id, enrolled_at desc);

create table if not exists public.learning_progress (
  id uuid primary key default extensions.gen_random_uuid(), owner_clerk_user_id text not null,
  enrollment_id uuid not null references public.learning_enrollments(id) on delete cascade,
  module_id text not null, lesson_id text not null, status text not null check (status in ('not-started','in-progress','complete')),
  reflection text not null default '', started_at timestamptz, completed_at timestamptz, updated_at timestamptz not null default now(),
  unique(enrollment_id, module_id, lesson_id)
);
create index if not exists learning_progress_owner_idx on public.learning_progress(owner_clerk_user_id, updated_at desc);

create table if not exists public.learning_quiz_attempts (
  id uuid primary key default extensions.gen_random_uuid(), owner_clerk_user_id text not null,
  enrollment_id uuid not null references public.learning_enrollments(id) on delete cascade,
  lesson_id text not null, question_set_version integer not null check (question_set_version > 0),
  score numeric(5,2) not null check (score between 0 and 100), correct integer not null check (correct >= 0), total integer not null check (total > 0),
  result_document jsonb not null, completed_at timestamptz not null default now()
);
create index if not exists learning_quiz_attempts_owner_idx on public.learning_quiz_attempts(owner_clerk_user_id, completed_at desc);

create table if not exists public.skill_mastery_evidence (
  id uuid primary key default extensions.gen_random_uuid(), owner_clerk_user_id text not null,
  skill_id uuid not null references public.skill_catalog(id), objective_id text not null,
  evidence_type text not null check (evidence_type in ('diagnostic','quiz','exercise','project','review')),
  reference_id text not null, result numeric(5,2) check (result between 0 and 100), recorded_at timestamptz not null default now(),
  unique(owner_clerk_user_id, skill_id, objective_id, evidence_type, reference_id)
);
create index if not exists skill_mastery_owner_idx on public.skill_mastery_evidence(owner_clerk_user_id, skill_id, recorded_at desc);

-- Generic catalog is readable; draft generation and all learner records remain owner/server controlled.
alter table public.skill_catalog enable row level security; alter table public.skill_catalog force row level security;
alter table public.skill_aliases enable row level security; alter table public.skill_aliases force row level security;
alter table public.learning_resources enable row level security; alter table public.learning_resources force row level security;
alter table public.learning_curricula enable row level security; alter table public.learning_curricula force row level security;
alter table public.ai_generation_jobs enable row level security; alter table public.ai_generation_jobs force row level security;
alter table public.learning_enrollments enable row level security; alter table public.learning_enrollments force row level security;
alter table public.learning_progress enable row level security; alter table public.learning_progress force row level security;
alter table public.learning_quiz_attempts enable row level security; alter table public.learning_quiz_attempts force row level security;
alter table public.skill_mastery_evidence enable row level security; alter table public.skill_mastery_evidence force row level security;

create policy skill_catalog_read_approved on public.skill_catalog for select to authenticated using (review_status='approved');
create policy skill_alias_read_approved on public.skill_aliases for select to authenticated using (exists(select 1 from public.skill_catalog s where s.id=skill_id and s.review_status='approved'));
create policy learning_resources_read_curated on public.learning_resources for select to authenticated using (review_status='curated');
create policy learning_curricula_read_approved on public.learning_curricula for select to authenticated using (review_status='approved');
create policy ai_jobs_read_own on public.ai_generation_jobs for select to authenticated using (owner_clerk_user_id=(select public.current_clerk_user_id()));
create policy enrollments_all_own on public.learning_enrollments for all to authenticated using (owner_clerk_user_id=(select public.current_clerk_user_id())) with check (owner_clerk_user_id=(select public.current_clerk_user_id()));
create policy progress_all_own on public.learning_progress for all to authenticated using (owner_clerk_user_id=(select public.current_clerk_user_id())) with check (owner_clerk_user_id=(select public.current_clerk_user_id()));
create policy quiz_attempts_read_own on public.learning_quiz_attempts for select to authenticated using (owner_clerk_user_id=(select public.current_clerk_user_id()));
create policy mastery_read_own on public.skill_mastery_evidence for select to authenticated using (owner_clerk_user_id=(select public.current_clerk_user_id()));

revoke all on public.skill_catalog, public.skill_aliases, public.learning_resources, public.learning_curricula, public.ai_generation_jobs, public.learning_enrollments, public.learning_progress, public.learning_quiz_attempts, public.skill_mastery_evidence from anon;
grant select on public.skill_catalog, public.skill_aliases, public.learning_resources, public.learning_curricula, public.ai_generation_jobs, public.learning_quiz_attempts, public.skill_mastery_evidence to authenticated;
grant select,insert,update,delete on public.learning_enrollments, public.learning_progress to authenticated;

-- ============================================================================
-- Complete Learning Engine persistent tables for CareerTwin
-- Supports curricula, lessons, mock tests, attempts, and progress persistence
-- ============================================================================

create table if not exists public.curriculum_records (
  id text primary key,
  skill_id text not null,
  skill_name text not null,
  learner_level text not null,
  preferred_language text not null default 'English',
  curriculum_document jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists curriculum_records_lookup_idx on public.curriculum_records(skill_name, learner_level, preferred_language);

create table if not exists public.learning_lessons (
  id text primary key,
  curriculum_id text not null,
  lesson_id text not null,
  title text not null,
  module_id text not null,
  lesson_document jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(curriculum_id, lesson_id)
);
create index if not exists learning_lessons_curr_idx on public.learning_lessons(curriculum_id);

create table if not exists public.learning_mock_tests (
  id text primary key,
  skill_slug text not null,
  test_number integer not null,
  level text not null,
  title text not null,
  duration_minutes integer not null default 30,
  test_document jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists learning_mock_tests_skill_idx on public.learning_mock_tests(skill_slug, level);

create table if not exists public.learning_mock_test_attempts (
  id text primary key,
  owner_clerk_user_id text not null,
  test_id text not null,
  skill_slug text not null,
  score numeric(5,2) not null,
  passed boolean not null,
  report_document jsonb not null,
  completed_at timestamptz not null default now()
);
create index if not exists learning_mock_attempts_owner_idx on public.learning_mock_test_attempts(owner_clerk_user_id, completed_at desc);

create table if not exists public.user_learning_progress (
  id text primary key,
  owner_clerk_user_id text not null,
  curriculum_id text not null,
  skill_name text not null,
  progress_document jsonb not null,
  mastery_score numeric(5,2) not null default 0,
  mastery_level text not null default 'novice',
  updated_at timestamptz not null default now(),
  unique(owner_clerk_user_id, curriculum_id)
);
create index if not exists user_learning_progress_owner_idx on public.user_learning_progress(owner_clerk_user_id, updated_at desc);

-- Row Level Security
alter table public.curriculum_records enable row level security;
alter table public.learning_lessons enable row level security;
alter table public.learning_mock_tests enable row level security;
alter table public.learning_mock_test_attempts enable row level security;
alter table public.user_learning_progress enable row level security;

-- Policies for public catalog curricula, lessons, and tests: readable by all authenticated users
create policy curriculum_records_read on public.curriculum_records for select to authenticated using (true);
create policy learning_lessons_read on public.learning_lessons for select to authenticated using (true);
create policy learning_mock_tests_read on public.learning_mock_tests for select to authenticated using (true);

-- User-specific data is accessible only by the owner
create policy mock_attempts_read_own on public.learning_mock_test_attempts for select to authenticated using (owner_clerk_user_id = (select public.current_clerk_user_id()));
create policy progress_records_read_own on public.user_learning_progress for select to authenticated using (owner_clerk_user_id = (select public.current_clerk_user_id()));

-- Grants
grant select on public.curriculum_records, public.learning_lessons, public.learning_mock_tests to authenticated;
grant select, insert, update on public.learning_mock_test_attempts, public.user_learning_progress to authenticated;



