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
