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
