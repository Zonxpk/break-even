begin;
create extension if not exists pgtap with schema extensions;
select plan(3);

select ok(not has_table_privilege('authenticated', 'public.orders', 'truncate'),
  'authenticated cannot truncate orders');
select ok(not has_table_privilege('anon', 'public.vouchers', 'truncate'),
  'anon cannot truncate vouchers');
select ok(not has_table_privilege('authenticated', 'public.profiles', 'truncate'),
  'authenticated cannot truncate profiles');

select * from finish();
rollback;
