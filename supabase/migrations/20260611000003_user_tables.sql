-- User-owned rows. RLS: owner-only. Vouchers are minted exclusively by the
-- grant_voucher RPC (security definer) — clients can only read them.

create table public.orders (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  service    text not null check (service in ('food', 'ride', 'parcel', 'mart', 'date')),
  items_json jsonb not null default '[]',
  script_id  uuid not null references public.gag_scripts (id),
  seed       bigint not null,
  status     text not null default 'tracking'
             check (status in ('tracking', 'failed_hilariously', 'cancelled')),
  created_at timestamptz not null default now()
);

create table public.vouchers (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  campaign_id uuid not null references public.voucher_campaigns (id),
  code        text,
  status      text not null default 'active'
              check (status in ('active', 'spent', 'redeemed', 'expired')),
  context     jsonb not null default '{}',
  granted_at  timestamptz not null default now()
);

create table public.matches (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  persona_id  uuid not null references public.personas (id),
  affection   integer not null default 0,
  beats_done  jsonb not null default '[]',
  created_at  timestamptz not null default now(),
  unique (user_id, persona_id)
);

alter table public.orders   enable row level security;
alter table public.vouchers enable row level security;
alter table public.matches  enable row level security;

create policy "orders owner select" on public.orders
  for select to authenticated using (user_id = auth.uid());
create policy "orders owner insert" on public.orders
  for insert to authenticated with check (user_id = auth.uid());
create policy "orders owner update" on public.orders
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "vouchers owner select" on public.vouchers
  for select to authenticated using (user_id = auth.uid());
-- no insert/update policies: RPC-only writes

create policy "matches owner all" on public.matches
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- auto_expose_new_tables = false: explicit grants required per table.
-- Column-level insert/update keeps id/created_at (and order ownership fields
-- after creation) immutable for clients. Vouchers: select-only — the
-- grant_voucher RPC writes as table owner.
grant select on public.orders to authenticated;
grant insert (user_id, service, items_json, script_id, seed) on public.orders to authenticated;
grant update (status) on public.orders to authenticated;

grant select on public.vouchers to authenticated;

grant select, delete on public.matches to authenticated;
grant insert (user_id, persona_id, affection, beats_done) on public.matches to authenticated;
grant update (affection, beats_done) on public.matches to authenticated;

create index orders_user_idx   on public.orders (user_id, created_at desc);
create index vouchers_user_idx on public.vouchers (user_id, status);
