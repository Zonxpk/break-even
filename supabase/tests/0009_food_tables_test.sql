begin;
create extension if not exists pgtap with schema extensions;
select plan(12);

select has_table('public', 'food_restaurants', 'food_restaurants exists');
select has_table('public', 'food_menu_categories', 'food_menu_categories exists');
select has_table('public', 'food_menu_items', 'food_menu_items exists');
select has_table('public', 'food_modifier_groups', 'food_modifier_groups exists');
select has_table('public', 'food_modifier_options', 'food_modifier_options exists');
select has_table('public', 'food_item_modifier_groups', 'food_item_modifier_groups exists');
select has_table('public', 'food_promos', 'food_promos exists');

select ok(has_table_privilege('anon', 'public.food_restaurants', 'select'), 'anon select food_restaurants');
select ok(has_table_privilege('anon', 'public.food_menu_items', 'select'), 'anon select food_menu_items');
select ok(has_table_privilege('anon', 'public.food_promos', 'select'), 'anon select food_promos');

insert into public.food_restaurants (id, name, cuisine_tags, rating, review_count, delivery_fee, eta_minutes, sort)
values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'ร้านทดสอบ', '{อาหารตามสั่ง}', 4.5, 100, 15, 25, 1);

set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
select is((select count(*) from public.food_restaurants where name = 'ร้านทดสอบ'), 1::bigint,
  'anon can read food_restaurants');

select throws_ok(
  $$ insert into public.food_restaurants (name) values ('hack') $$,
  '42501', null, 'anon cannot insert food content');

select * from finish();
rollback;
