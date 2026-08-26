begin;
create extension if not exists pgtap with schema extensions;
select plan(5);

insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
                        email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
                        created_at, updated_at)
values ('00000000-0000-0000-0000-000000000000',
        '00000000-0000-0000-0000-0000000000d1',
        'authenticated', 'authenticated', 'security@test.dev', '', now(),
        '{"provider":"email"}', '{}', now(), now());

insert into public.gag_scripts (id, service, timeline, weight, active)
values ('00000000-0000-0000-0000-0000000000d2', 'food',
        '{"duration_s":1,"events":[{"t":1,"type":"finale","kind":"canal","status_text":"done"}]}',
        1, true);

insert into public.orders (id, user_id, service, items_json, script_id, seed)
values ('00000000-0000-0000-0000-0000000000d3',
        '00000000-0000-0000-0000-0000000000d1', 'food', '[]',
        '00000000-0000-0000-0000-0000000000d2', 1);
insert into public.voucher_campaigns
  (id, title, trigger_event, conditions, status, priority, code_mode, is_fallback)
values ('00000000-0000-0000-0000-0000000000d4', 'security fallback',
        'order_failed', '{}', 'active', 999, 'unique', true);

set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000d1","role":"authenticated"}', true);

select throws_ok($$ update public.profiles set loyalty_xp = 9999 where id = auth.uid() $$,
  '42501', null, 'client cannot update loyalty_xp');
select throws_ok($$ update public.profiles set tier = 'vip' where id = auth.uid() $$,
  '42501', null, 'client cannot update tier');
select throws_ok($$ update public.orders set status = 'failed_hilariously' where id = '00000000-0000-0000-0000-0000000000d3' $$,
  '42501', null, 'client cannot directly fail an order');
select throws_ok($$ insert into public.orders (user_id, service, items_json, script_id, seed)
  values (auth.uid(), 'food', '[]', '00000000-0000-0000-0000-0000000000d2', 2) $$,
  '42501', null, 'client cannot forge orders directly');
select throws_ok($$ select public.grant_voucher('order_failed', '{"service":"food"}') $$,
  '42501', null, 'client cannot call raw voucher grant RPC');

select * from finish();
rollback;
