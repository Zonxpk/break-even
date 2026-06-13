begin;
create extension if not exists pgtap with schema extensions;
select plan(11);

select has_function('public', 'claim_merch', array['uuid'], 'claim_merch exists');
select has_function('public', 'redeem_claim', array['text'], 'redeem_claim exists');

-- fixtures: user with 2 vouchers, brand member, item costing 2 vouchers, stock 1
insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
                        email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
                        created_at, updated_at)
values
 ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-0000000000d1',
  'authenticated', 'authenticated', 'buyer@test.dev', '', now(), '{"provider":"email"}', '{}', now(), now()),
 ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-0000000000d2',
  'authenticated', 'authenticated', 'staff@test.dev', '', now(), '{"provider":"email"}', '{}', now(), now());

insert into public.brands (id, name)
values ('00000000-0000-0000-0000-0000000000e1', 'CapCo');
insert into public.brand_members (user_id, brand_id)
values ('00000000-0000-0000-0000-0000000000d2', '00000000-0000-0000-0000-0000000000e1');
insert into public.shops (id, brand_id, name)
values ('00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-0000000000e1', 'Cap Drop');
insert into public.merch_items (id, shop_id, name, voucher_price, stock)
values ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000f1',
        'หมวกไรเดอร์หลงทาง', 2, 1);

insert into public.voucher_campaigns (id, title, trigger_event, status)
values ('00000000-0000-0000-0000-0000000000c9', 'ev', 'order_failed', 'active');

insert into public.merch_items (id, shop_id, name, voucher_price, stock, required_campaign_id)
values ('00000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-0000000000f1',
        'เสื้อลิมิเต็ด', 1, 5, '00000000-0000-0000-0000-0000000000c9');

insert into public.voucher_campaigns (id, title, trigger_event, status)
values ('00000000-0000-0000-0000-0000000000c8', 'other camp', 'order_failed', 'active');
insert into public.vouchers (user_id, campaign_id, status) values
 ('00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-0000000000c9', 'active'),
 ('00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-0000000000c9', 'active');

-- buyer claims the item
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000d1","role":"authenticated"}', true);

select matches(
  (select redemption_code from public.claim_merch('00000000-0000-0000-0000-0000000000a1')),
  '^WHEN-[0-9A-F]{12}$', 'claim mints a redemption code');

reset role;
select is((select count(*) from public.vouchers where status = 'spent'), 2::bigint,
  'both vouchers consumed');
select is((select stock from public.merch_items
            where id = '00000000-0000-0000-0000-0000000000a1'),
  0, 'stock decremented');

-- second claim fails: out of stock (and no vouchers left anyway)
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000d1","role":"authenticated"}', true);
select throws_ok(
  $$ select public.claim_merch('00000000-0000-0000-0000-0000000000a1') $$,
  'OUT_OF_STOCK', 'cannot oversell a drop');

-- brand member redeems the code at pickup
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000d2","role":"authenticated"}', true);
select is(
  (select status from public.redeem_claim(
     (select redemption_code from public.claims limit 1))),
  'redeemed', 'brand member redeems claim');

-- non-member cannot redeem
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000d1","role":"authenticated"}', true);
select throws_ok(
  $$ select public.redeem_claim(
       (select redemption_code from public.claims limit 1)) $$,
  'NOT_BRAND_MEMBER', 'non-member cannot redeem');

-- campaign-gated item: wrong-campaign vouchers don't count
reset role;
insert into public.vouchers (user_id, campaign_id, status) values
 ('00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-0000000000c8', 'active');
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000d1","role":"authenticated"}', true);
select throws_ok(
  $$ select public.claim_merch('00000000-0000-0000-0000-0000000000a2') $$,
  'INSUFFICIENT_VOUCHERS', 'wrong-campaign voucher cannot buy gated merch');

-- ...right-campaign voucher works
reset role;
insert into public.vouchers (user_id, campaign_id, status) values
 ('00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-0000000000c9', 'active');
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000d1","role":"authenticated"}', true);
select matches(
  (select redemption_code from public.claim_merch('00000000-0000-0000-0000-0000000000a2')),
  '^WHEN-[0-9A-F]{12}$', 'right-campaign voucher buys gated merch');

-- double redemption is rejected (the hat claim was already redeemed above)
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000d2","role":"authenticated"}', true);
select throws_ok(
  $$ select public.redeem_claim(
       (select redemption_code from public.claims c
         join public.merch_items mi on mi.id = c.merch_item_id
        where mi.id = '00000000-0000-0000-0000-0000000000a1' limit 1)) $$,
  'ALREADY_REDEEMED', 'double redemption rejected');

select * from finish();
rollback;
