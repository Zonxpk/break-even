begin;
create extension if not exists pgtap with schema extensions;
select plan(6);

select ok(not has_table_privilege('authenticated', 'public.orders', 'truncate'),
  'authenticated cannot truncate orders');
select ok(not has_table_privilege('anon', 'public.vouchers', 'truncate'),
  'anon cannot truncate vouchers');
select ok(not has_table_privilege('authenticated', 'public.profiles', 'truncate'),
  'authenticated cannot truncate profiles');
select ok(not has_table_privilege('authenticated', 'public.orders', 'references'),
  'authenticated cannot add FKs referencing orders');
select ok(not has_table_privilege('authenticated', 'public.orders', 'trigger'),
  'authenticated cannot create triggers on orders');
select ok(not has_table_privilege('anon', 'public.orders', 'maintain'),
  'anon cannot run maintenance on orders');

select * from finish();
rollback;
