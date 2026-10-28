-- Additive profile wizard persistence. Existing profile columns and data are preserved.
alter table public.career_profiles
  add column if not exists profile_data jsonb not null default '{}'::jsonb,
  add column if not exists profile_completion smallint not null default 0 check (profile_completion between 0 and 100);

create index if not exists career_profiles_onboarding_idx on public.career_profiles(owner_clerk_user_id, onboarding_completed);
