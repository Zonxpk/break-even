begin;
create extension if not exists pgtap with schema extensions;
select plan(10);

select has_table('public', 'orders',   'orders exists');
select has_table('public', 'vouchers', 'vouchers exists');
select has_table('public', 'matches',  'matches exists');

-- fixtures: two users + one script + one campaign
insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
                        email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
                        created_at, updated_at)
values
 ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-0000000000b1',
  'authenticated', 'authenticated', 'b1@test.dev', '', now(), '{"provider":"email"}', '{}', now(), now()),
 ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-0000000000b2',
  'authenticated', 'authenticated', 'b2@test.dev', '', now(), '{"provider":"email"}', '{}', now(), now());

insert into public.gag_scripts (id, timeline)
values ('00000000-0000-0000-0000-0000000000c1', '{"duration_s":10,"events":[]}');

insert into public.voucher_campaigns (id, title, trigger_event, status)
values ('00000000-0000-0000-0000-0000000000c2', 'test camp', 'order_failed', 'active');

insert into public.orders (user_id, service, items_json, script_id, seed)
values ('00000000-0000-0000-0000-0000000000b1', 'food', '[]',
        '00000000-0000-0000-0000-0000000000c1', 42);

-- user B1 sees own order; user B2 sees none
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000b1","role":"authenticated"}', true);
select is((select count(*) from public.orders), 1::bigint, 'owner sees own order');

select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000b2","role":"authenticated"}', true);
select is((select count(*) from public.orders), 0::bigint, 'other user sees nothing');

-- user can insert an order only as themselves
select throws_ok(
  $$ insert into public.orders (user_id, service, items_json, script_id, seed)
     values ('00000000-0000-0000-0000-0000000000b1', 'food', '[]',
             '00000000-0000-0000-0000-0000000000c1', 7) $$,
  '42501', null, 'cannot insert order for another user');

-- vouchers are RPC-minted only: direct client insert lacks the privilege
select throws_ok(
  $$ insert into public.vouchers (user_id, campaign_id)
     values ('00000000-0000-0000-0000-0000000000b2',
             '00000000-0000-0000-0000-0000000000c2') $$,
  '42501', null, 'clients cannot mint vouchers directly');

-- matches: owner-scoped CRUD
select throws_ok(
  $$ insert into public.matches (user_id, persona_id)
     values ('00000000-0000-0000-0000-0000000000b1',
             '00000000-0000-0000-0000-0000000000c3') $$,
  '42501', null, 'cannot create a match for another user');

reset role;
insert into public.personas (id, name, system_prompt)
values ('00000000-0000-0000-0000-0000000000c3', 'test persona', 'p');
insert into public.matches (user_id, persona_id)
values ('00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000c3');

set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000b2","role":"authenticated"}', true);
select is((select count(*) from public.matches), 0::bigint,
  'other user cannot see the match');

select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000b1","role":"authenticated"}', true);
delete from public.matches where persona_id = '00000000-0000-0000-0000-0000000000c3';
select is((select count(*) from public.matches), 0::bigint,
  'owner can delete own match');

select * from finish();
rollback;
