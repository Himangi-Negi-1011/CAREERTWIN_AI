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
