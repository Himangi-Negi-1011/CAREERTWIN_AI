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
