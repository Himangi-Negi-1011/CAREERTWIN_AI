-- Migration: Complete Learning Engine persistent tables for CareerTwin
-- Supports curricula, lessons, mock tests, attempts, and progress persistence

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

