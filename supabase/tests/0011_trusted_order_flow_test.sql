begin;
create extension if not exists pgtap with schema extensions;
select plan(11);

select has_function('public', 'create_order', array['text','jsonb'], 'create_order exists');
select has_function('public', 'complete_order_failure', array['uuid'], 'complete_order_failure exists');

insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
                        email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
                        created_at, updated_at)
values
 ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-0000000000e1',
  'authenticated', 'authenticated', 'flow1@test.dev', '', now(), '{"provider":"email"}', '{}', now(), now()),
 ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-0000000000e2',
  'authenticated', 'authenticated', 'flow2@test.dev', '', now(), '{"provider":"email"}', '{}', now(), now());

insert into public.gag_scripts (id, service, timeline, weight, active)
values ('00000000-0000-0000-0000-0000000000e3', 'food',
        '{"duration_s":0,"events":[{"t":0,"type":"finale","kind":"canal","status_text":"done"}]}',
        100000, true);
insert into public.voucher_campaigns
  (id, title, trigger_event, conditions, status, priority, code_mode, is_fallback)
values ('00000000-0000-0000-0000-0000000000e4', 'trusted fallback',
        'order_failed', '{}', 'active', 100000, 'unique', true);

insert into public.orders (id, user_id, service, items_json, script_id, seed)
values ('00000000-0000-0000-0000-0000000000e5',
        '00000000-0000-0000-0000-0000000000e1', 'food', '[]',
        '00000000-0000-0000-0000-0000000000e3', 7);

set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000e1","role":"authenticated"}', true);


select is((public.create_order('food', '[]')).user_id, auth.uid(),
  'create_order owns the new order');
select is((select count(*) from public.orders where user_id = auth.uid() and status = 'tracking'),
  2::bigint, 'create_order inserts tracking order without client write privilege');
select ok(
  public.complete_order_failure('00000000-0000-0000-0000-0000000000e5'::uuid) -> 'voucher' ->> 'id' is not null,
  'failure RPC mints voucher through trusted context');
select is((select status from public.orders where id = '00000000-0000-0000-0000-0000000000e5'),
  'failed_hilariously', 'failure RPC owns status transition');
select is((select loyalty_xp from public.profiles where id = auth.uid()), 27,
  'failure RPC adds server-owned failure XP');
select is((select context ->> 'finale_type' from public.vouchers
            where context ->> 'order_id' = '00000000-0000-0000-0000-0000000000e5'),
  'canal', 'voucher finale comes from stored gag script');

select is(
  (public.complete_order_failure('00000000-0000-0000-0000-0000000000e5'::uuid) -> 'voucher' ->> 'id')::uuid,
  (select id from public.vouchers where context ->> 'order_id' = '00000000-0000-0000-0000-0000000000e5' limit 1),
  'repeated failure completion returns the original voucher');
select is((select loyalty_xp from public.profiles where id = auth.uid()), 27,
  'idempotent completion does not double-award XP');

select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000e2","role":"authenticated"}', true);
select throws_ok(
  $$ select public.complete_order_failure('00000000-0000-0000-0000-0000000000e5'::uuid) $$,
  'ORDER_NOT_FOUND', 'another user cannot complete an owned order');

select * from finish();
rollback;