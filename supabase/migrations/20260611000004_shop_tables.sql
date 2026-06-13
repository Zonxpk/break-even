-- Pop-up shop + brand self-service. RLS is the security boundary (spec §10):
-- brand members may write only rows belonging to their own brand.

create table public.brand_members (
  user_id  uuid not null references auth.users (id) on delete cascade,
  brand_id uuid not null references public.brands (id) on delete cascade,
  role     text not null default 'editor' check (role in ('editor')),
  primary key (user_id, brand_id)
);

-- schedule jsonb schema (client + brand-mode consumer):
-- { "windows": [ { "from": "2026-06-01", "to": "2026-06-30",
--                  "days_of_week": [5], "open": "18:00", "close": "22:00" } ] }
create table public.shops (
  id         uuid primary key default gen_random_uuid(),
  brand_id   uuid not null references public.brands (id) on delete cascade,
  name       text not null,
  banner_url text,
  schedule   jsonb not null default '{"windows": []}',
  status     text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now()
);

create table public.merch_items (
  id                      uuid primary key default gen_random_uuid(),
  shop_id                 uuid not null references public.shops (id) on delete cascade,
  name                    text not null,
  images                  jsonb not null default '[]',
  description             text,
  voucher_price           integer not null check (voucher_price > 0),
  required_campaign_id    uuid references public.voucher_campaigns (id), -- null = any active voucher
  stock                   integer not null default 0 check (stock >= 0),
  redemption_instructions text,
  active                  boolean not null default true
);

create table public.claims (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  merch_item_id   uuid not null references public.merch_items (id),
  voucher_ids     uuid[] not null,
  redemption_code text not null unique,
  status          text not null default 'claimed'
                  check (status in ('claimed', 'redeemed', 'expired')),
  created_at      timestamptz not null default now()
);

alter table public.brand_members enable row level security;
alter table public.shops         enable row level security;
alter table public.merch_items   enable row level security;
alter table public.claims        enable row level security;

create or replace function public.is_brand_member(p_brand uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.brand_members
                  where user_id = auth.uid() and brand_id = p_brand)
$$;

revoke execute on function public.is_brand_member(uuid) from public;
grant execute on function public.is_brand_member(uuid) to authenticated;

create policy "members see own memberships" on public.brand_members
  for select to authenticated using (user_id = auth.uid());

create policy "public read" on public.shops for select using (true);
create policy "brand write" on public.shops
  for all to authenticated
  using (public.is_brand_member(brand_id))
  with check (public.is_brand_member(brand_id));

create policy "public read" on public.merch_items for select using (true);
create policy "brand write" on public.merch_items
  for all to authenticated
  using (public.is_brand_member((select s.brand_id from public.shops s where s.id = shop_id)))
  with check (public.is_brand_member((select s.brand_id from public.shops s where s.id = shop_id)));

create policy "claims owner select" on public.claims
  for select to authenticated using (user_id = auth.uid());
-- brand members can see claims on their items (stats + redemption desk)
create policy "claims brand select" on public.claims
  for select to authenticated
  using (public.is_brand_member((
    select s.brand_id from public.merch_items mi join public.shops s on s.id = mi.shop_id
     where mi.id = merch_item_id)));
-- no insert/update policies: claim_merch / redeem_claim RPCs only

-- auto_expose_new_tables = false: explicit grants required per table.
-- Shops/merch are public-read; brand members manage their own rows (RLS-scoped).
-- Column-level insert/update keeps id/created_at immutable. Claims: select-only
-- (claim_merch / redeem_claim RPCs write as table owner).
grant select on public.brand_members to authenticated;

grant select on public.shops to anon, authenticated;
grant insert (brand_id, name, banner_url, schedule, status) on public.shops to authenticated;
grant update (name, banner_url, schedule, status) on public.shops to authenticated;
grant delete on public.shops to authenticated;

grant select on public.merch_items to anon, authenticated;
grant insert (shop_id, name, images, description, voucher_price, required_campaign_id,
              stock, redemption_instructions, active) on public.merch_items to authenticated;
grant update (name, images, description, voucher_price, required_campaign_id,
              stock, redemption_instructions, active) on public.merch_items to authenticated;
grant delete on public.merch_items to authenticated;

grant select on public.claims to authenticated;

create index merch_items_shop_idx on public.merch_items (shop_id);
