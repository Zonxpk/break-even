begin;
create extension if not exists pgtap with schema extensions;
select plan(8);

select has_table('public', 'brands', 'brands exists');
select has_table('public', 'catalog_items', 'catalog_items exists');
select has_table('public', 'gag_scripts', 'gag_scripts exists');
select has_table('public', 'gag_anchors', 'gag_anchors exists');
select has_table('public', 'personas', 'personas exists');
select has_table('public', 'voucher_campaigns', 'voucher_campaigns exists');

-- anonymous users can read content
insert into public.gag_anchors (type, name, lat, lng)
values ('canal', 'คลองทดสอบ', 13.75, 100.5);

set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
select is((select count(*) from public.gag_anchors), 1::bigint,
  'anon can read content tables');

-- ...but cannot write them
select throws_ok(
  $$ insert into public.gag_anchors (type, name, lat, lng)
     values ('canal', 'hack', 0, 0) $$,
  '42501', null, 'anon cannot insert content');

select * from finish();
rollback;
