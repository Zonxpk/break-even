begin;
create extension if not exists pgtap with schema extensions;
select plan(6);

select has_table('public', 'profiles', 'profiles table exists');
select col_default_is('public', 'profiles', 'loyalty_xp', '0', 'xp defaults to 0');
select col_default_is('public', 'profiles', 'tier', 'silver', 'tier defaults to silver');

-- signup trigger creates a profile row
insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
                        email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
                        created_at, updated_at)
values ('00000000-0000-0000-0000-000000000000',
        '00000000-0000-0000-0000-0000000000a1',
        'authenticated', 'authenticated', 'u1@test.dev', '', now(),
        '{"provider":"email"}', '{"nickname":"น้องทดสอบ"}', now(), now());

select is(
  (select nickname from public.profiles where id = '00000000-0000-0000-0000-0000000000a1'),
  'น้องทดสอบ', 'signup trigger copies nickname into profile');

-- RLS: owner can read own profile, not others
insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
                        email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
                        created_at, updated_at)
values ('00000000-0000-0000-0000-000000000000',
        '00000000-0000-0000-0000-0000000000a2',
        'authenticated', 'authenticated', 'u2@test.dev', '', now(),
        '{"provider":"email"}', '{}', now(), now());

set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}', true);

select is((select count(*) from public.profiles), 1::bigint,
  'user sees exactly one profile (their own)');

update public.profiles set loyalty_xp = 50
 where id = '00000000-0000-0000-0000-0000000000a1';
select is(
  (select loyalty_xp from public.profiles
    where id = '00000000-0000-0000-0000-0000000000a1'),
  50, 'owner can update own xp (v1 client-trust per spec §15)');

select * from finish();
rollback;
