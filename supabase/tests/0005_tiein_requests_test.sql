begin;
create extension if not exists pgtap with schema extensions;
select plan(3);

select has_table('public', 'tiein_requests', 'tiein_requests exists');

-- clients (even authenticated) cannot read or write; only the Edge Function's
-- service role may touch this table.
insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
                        email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
                        created_at, updated_at)
values ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-0000000000a9',
        'authenticated', 'authenticated', 'x@test.dev', '', now(),
        '{"provider":"email"}', '{}', now(), now());

insert into public.tiein_requests (company, contact, merch_desc, budget_range)
values ('ACME', 'line: @acme', 'หมวก', '50k-100k');

set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000a9","role":"authenticated"}', true);

select throws_ok(
  $$ select count(*) from public.tiein_requests $$,
  '42501', null, 'authenticated users cannot read tie-in requests');
select throws_ok(
  $$ insert into public.tiein_requests (company, contact, merch_desc, budget_range)
     values ('evil', 'x', 'x', 'x') $$,
  '42501', null, 'authenticated users cannot insert directly');

select * from finish();
rollback;
