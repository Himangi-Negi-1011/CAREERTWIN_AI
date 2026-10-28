-- Run in Supabase's disposable SQL test workflow. All inserted records roll back.
begin;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"user_interview_a","role":"authenticated"}', true);

insert into public.interview_sessions (id, owner_clerk_user_id, interview_type, difficulty, current_difficulty, question_count, target_role)
values ('10000000-0000-4000-8000-000000000001', 'user_interview_a', 'behavioral', 'beginner', 'beginner', 5, 'Policy Analyst');
insert into public.interview_questions (id, session_id, owner_clerk_user_id, ordinal, category, prompt, guidance, difficulty, answer_text)
values ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'user_interview_a', 1, 'Judgement', 'Tell me about a difficult decision you made.', 'Use context and outcomes.', 'beginner', 'I reviewed the evidence, chose an option, and reflected on the outcome.');
insert into public.interview_assessments (session_id, question_id, owner_clerk_user_id, version, kind, evaluation, coverage, overall_score)
values ('10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'user_interview_a', 1, 'original', '{"criteria":[]}'::jsonb, 1, 4);

do $$ begin
  if (select count(*) from public.interview_sessions where id='10000000-0000-4000-8000-000000000001') <> 1 then raise exception 'owner could not read session'; end if;
  if (select count(*) from public.interview_assessments where question_id='20000000-0000-4000-8000-000000000001') <> 1 then raise exception 'owner could not read assessment'; end if;
end $$;

select set_config('request.jwt.claims', '{"sub":"user_interview_b","role":"authenticated"}', true);
do $$ begin
  if (select count(*) from public.interview_sessions where id='10000000-0000-4000-8000-000000000001') <> 0 then raise exception 'cross-user session read was not blocked'; end if;
  if (select count(*) from public.interview_questions where session_id='10000000-0000-4000-8000-000000000001') <> 0 then raise exception 'cross-user question read was not blocked'; end if;
  if (select count(*) from public.interview_assessments where session_id='10000000-0000-4000-8000-000000000001') <> 0 then raise exception 'cross-user assessment read was not blocked'; end if;
end $$;
rollback;

-- Immutable assessment update/delete tests must run in separate expected-error transactions:
-- update public.interview_assessments set overall_score=5 where question_id='...';
-- Expected: Interview assessments are immutable; create a new version instead.
