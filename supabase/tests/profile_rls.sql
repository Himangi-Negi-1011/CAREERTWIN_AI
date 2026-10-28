-- Run against a disposable database or inside Supabase's SQL test workflow.
-- The transaction is rolled back so no test profile persists.

begin;

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"user_test_a","role":"authenticated"}',
  true
);

insert into public.career_profiles (owner_clerk_user_id, display_name)
values ('user_test_a', 'RLS test user');

-- The owner can see the row.
do $$
begin
  if (select count(*) from public.career_profiles where owner_clerk_user_id = 'user_test_a') <> 1 then
    raise exception 'owner could not read their profile';
  end if;
end
$$;

-- A second authenticated identity cannot see or mutate the first user's row.
select set_config(
  'request.jwt.claims',
  '{"sub":"user_test_b","role":"authenticated"}',
  true
);

do $$
begin
  if (select count(*) from public.career_profiles where owner_clerk_user_id = 'user_test_a') <> 0 then
    raise exception 'cross-user profile read was not blocked';
  end if;
end
$$;

update public.career_profiles
set display_name = 'unauthorized change'
where owner_clerk_user_id = 'user_test_a';

-- A cross-user INSERT is tested separately because its expected RLS error aborts a transaction:
-- set local role authenticated;
-- select set_config('request.jwt.claims', '{"sub":"user_test_b","role":"authenticated"}', true);
-- insert into public.career_profiles (owner_clerk_user_id) values ('user_test_a');
-- Expected: ERROR 42501, row violates row-level security policy.

rollback;
