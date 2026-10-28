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
