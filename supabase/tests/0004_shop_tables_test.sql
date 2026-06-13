begin;
create extension if not exists pgtap with schema extensions;
select plan(10);

select has_table('public', 'shops',         'shops exists');
select has_table('public', 'merch_items',   'merch_items exists');
select has_table('public', 'claims',        'claims exists');
select has_table('public', 'brand_members', 'brand_members exists');

-- fixtures: brand A with member M, brand B without
insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
                        email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
                        created_at, updated_at)
values ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-0000000000d1',
        'authenticated', 'authenticated', 'm@test.dev', '', now(),
        '{"provider":"email"}', '{}', now(), now());

insert into public.brands (id, name) values
 ('00000000-0000-0000-0000-0000000000e1', 'Brand A'),
 ('00000000-0000-0000-0000-0000000000e2', 'Brand B');

insert into public.brand_members (user_id, brand_id)
values ('00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-0000000000e1');

insert into public.shops (id, brand_id, name) values
 ('00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-0000000000e1', 'Shop A'),
 ('00000000-0000-0000-0000-0000000000f2', '00000000-0000-0000-0000-0000000000e2', 'Shop B');

-- brand member can update own brand's shop...
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000d1","role":"authenticated"}', true);

update public.shops set name = 'Shop A v2'
 where id = '00000000-0000-0000-0000-0000000000f1';
select is(
  (select name from public.shops where id = '00000000-0000-0000-0000-0000000000f1'),
  'Shop A v2', 'brand member updates own shop');

-- ...but updates to another brand's shop hit zero rows (RLS filters them out)
update public.shops set name = 'hacked'
 where id = '00000000-0000-0000-0000-0000000000f2';
reset role;
select is(
  (select name from public.shops where id = '00000000-0000-0000-0000-0000000000f2'),
  'Shop B', 'other brand''s shop untouched by foreign member');

-- WITH CHECK paths: inserts are brand-scoped too
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000d1","role":"authenticated"}', true);

select throws_ok(
  $$ insert into public.shops (brand_id, name)
     values ('00000000-0000-0000-0000-0000000000e2', 'sneaky shop') $$,
  '42501', null, 'cannot create a shop under another brand');

select throws_ok(
  $$ insert into public.merch_items (shop_id, name, voucher_price, stock)
     values ('00000000-0000-0000-0000-0000000000f2', 'sneaky merch', 1, 1) $$,
  '42501', null, 'cannot attach merch to another brand''s shop');

insert into public.merch_items (shop_id, name, voucher_price, stock)
values ('00000000-0000-0000-0000-0000000000f1', 'หมวกทดสอบ', 3, 10);
select is(
  (select count(*) from public.merch_items where name = 'หมวกทดสอบ'),
  1::bigint, 'brand member adds merch to own shop');

-- claims are RPC-minted only
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000d1","role":"authenticated"}', true);
select throws_ok(
  $$ insert into public.claims (user_id, merch_item_id, voucher_ids, redemption_code)
     values ('00000000-0000-0000-0000-0000000000d1',
             '00000000-0000-0000-0000-0000000000f1', '{}', 'WHEN-FAKE') $$,
  '42501', null, 'clients cannot mint claims directly');

select * from finish();
rollback;
