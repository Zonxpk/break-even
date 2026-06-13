begin;
create extension if not exists pgtap with schema extensions;
select plan(12);

select has_function('public', 'grant_voucher', array['text', 'jsonb'],
  'grant_voucher exists');

-- fixtures
insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
                        email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
                        created_at, updated_at)
values ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-0000000000aa',
        'authenticated', 'authenticated', 'g@test.dev', '', now(),
        '{"provider":"email"}', '{}', now(), now());

insert into public.brands (id, name)
values ('00000000-0000-0000-0000-0000000000bb', 'NoodleCo');

insert into public.voucher_campaigns
  (id, brand_id, title, trigger_event, conditions, quota_total, per_user_max, cooldown_hours,
   status, priority, code_mode)
values
  -- food-only campaign with quota 1 (use date_ghosted to avoid seed campaign conflicts)
  ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000bb',
   'Noodle Week (Fixture)', 'date_ghosted', '{"service": "food"}', 1, null, null, 'active', 10, 'unique'),
  -- single global fallback (is_fallback=true, priority 100 beats any seed fallback)
  ('00000000-0000-0000-0000-000000000002', null,
   'fixture fallback', 'date_ghosted', '{}', null, null, null, 'active', 100, 'unique'),
  -- spam brakes
  ('00000000-0000-0000-0000-0000000000c3', null,
   'Share once', 'share', '{}', null, 1, null, 'active', 10, 'unique'),
  ('00000000-0000-0000-0000-0000000000c4', null,
   'Tier-up hourly', 'tier_up', '{}', null, null, null, 'active', 10, 'unique');

update public.voucher_campaigns
   set is_fallback = true
 where id = '00000000-0000-0000-0000-000000000002';

update public.voucher_campaigns
   set cooldown_hours = 1
 where id = '00000000-0000-0000-0000-0000000000c4';

set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000aa","role":"authenticated"}', true);

-- conditions mismatch: ride context does not match the food-only campaign
select is(
  (select campaign_id from public.grant_voucher('date_ghosted', '{"service": "ride"}')),
  '00000000-0000-0000-0000-000000000002'::uuid,
  'ride context does not match food campaign');

-- matching event wins the targeted campaign
select is(
  (select campaign_id from public.grant_voucher('date_ghosted', '{"service": "food"}')),
  '00000000-0000-0000-0000-0000000000c1'::uuid,
  'food context wins the food campaign');

-- unique code minted with WHEN- prefix (scoped to c1's voucher)
select matches(
  (select code from public.vouchers
    where campaign_id = '00000000-0000-0000-0000-0000000000c1' limit 1),
  '^WHEN-[0-9A-F]{12}$', 'unique code minted');

-- quota 1 now exhausted -> diverts to fallback
select is(
  (select campaign_id from public.grant_voucher('date_ghosted', '{"service": "food"}')),
  '00000000-0000-0000-0000-000000000002'::uuid,
  'quota exhausted falls back to evergreen');

reset role;
select is((select quota_used from public.voucher_campaigns
            where id = '00000000-0000-0000-0000-0000000000c1'),
  1, 'quota_used incremented exactly once across three calls');

set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000aa","role":"authenticated"}', true);

-- unknown trigger is rejected outright
select throws_ok(
  $$ select public.grant_voucher('garbage_event', '{}') $$,
  'INVALID_TRIGGER', 'unknown trigger rejected');

-- per_user_max stops the second grant; fallback takes over
select is(
  (select campaign_id from public.grant_voucher('share', '{}')),
  '00000000-0000-0000-0000-0000000000c3'::uuid, 'first share grant hits campaign');
select is(
  (select campaign_id from public.grant_voucher('share', '{}')),
  '00000000-0000-0000-0000-000000000002'::uuid,
  'per_user_max diverts to fallback campaign');

-- cooldown stops the second grant; fallback takes over
select is(
  (select campaign_id from public.grant_voucher('tier_up', '{}')),
  '00000000-0000-0000-0000-0000000000c4'::uuid, 'first tier_up grant hits campaign');
select is(
  (select campaign_id from public.grant_voucher('tier_up', '{}')),
  '00000000-0000-0000-0000-000000000002'::uuid,
  'cooldown diverts to fallback campaign');

-- anon cannot call
reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
select throws_ok(
  $$ select public.grant_voucher('order_failed', '{}') $$,
  '42501', null, 'anon cannot execute grant_voucher');

select * from finish();
rollback;
