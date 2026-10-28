-- Run in a disposable SQL test workflow. All rows are rolled back.
begin;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"twin_test_a","role":"authenticated"}',true);
insert into public.career_twin_states(owner_clerk_user_id,source_state,twin_output) values('twin_test_a','{}','{}');
do $$ begin if (select count(*) from public.career_twin_states where owner_clerk_user_id='twin_test_a')<>1 then raise exception 'owner could not read Twin'; end if; end $$;
select set_config('request.jwt.claims','{"sub":"twin_test_b","role":"authenticated"}',true);
do $$ begin if (select count(*) from public.career_twin_states where owner_clerk_user_id='twin_test_a')<>0 then raise exception 'cross-user Twin read was not blocked'; end if; end $$;
update public.career_twin_states set source_state='{"tampered":true}' where owner_clerk_user_id='twin_test_a';
select set_config('request.jwt.claims','{"sub":"twin_test_a","role":"authenticated"}',true);
do $$ begin if (select source_state ? 'tampered' from public.career_twin_states where owner_clerk_user_id='twin_test_a') then raise exception 'cross-user Twin update was not blocked'; end if; end $$;
rollback;
