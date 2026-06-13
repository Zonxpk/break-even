-- Content tables: the CMS. The internal team edits these in Supabase Studio
-- (postgres role = table owner, bypasses RLS). Clients get read-only access.

create table public.brands (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  logo_url   text,
  contact    text,
  status     text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now()
);

create table public.catalog_items (
  id              uuid primary key default gen_random_uuid(),
  service         text not null check (service in ('food', 'ride', 'parcel', 'mart')),
  name            text not null,
  photo_url       text,
  price           numeric(10,2) not null default 0,   -- displayed; never charged (spec §2.2)
  rating          numeric(2,1),
  tie_in_brand_id uuid references public.brands (id),
  active          boolean not null default true,
  sort            integer not null default 0
);

-- timeline jsonb schema (documented for script authors; the client gag engine
-- is the consumer — see spec §6):
-- { "duration_s": 240,
--   "events": [
--     {"t": 0,   "type": "eta",      "minutes": 14},
--     {"t": 0,   "type": "move",     "mode": "route_to_user"},
--     {"t": 40,  "type": "move",     "mode": "wrong_turn"},
--     {"t": 45,  "type": "chat",     "text": "..."},
--     {"t": 90,  "type": "incident", "kind": "sleepy", "anchor": "seven_eleven", "eta_minutes": 45},
--     {"t": 90,  "type": "sabotage", "action": "call", "label": "โทรปลุกไรเดอร์",
--                "backfire": {"chat": "...", "move": "wrong_direction", "eta_minutes": 87}},
--     {"t": 210, "type": "finale",   "kind": "canal", "anchor": "canal", "status_text": "..."} ] }
create table public.gag_scripts (
  id         uuid primary key default gen_random_uuid(),
  service    text check (service in ('food', 'ride', 'parcel', 'mart', 'date')), -- null = any service
  timeline   jsonb not null,
  weight     integer not null default 1,
  active     boolean not null default true,
  season_tag text
);

create table public.gag_anchors (
  id   uuid primary key default gen_random_uuid(),
  type text not null check (type in ('canal', 'seven_eleven', 'temple', 'market')),
  name text not null,
  lat  double precision not null,
  lng  double precision not null
);

create table public.personas (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  avatar_url    text,
  bio           text,
  rarity        text not null default 'common'
                check (rarity in ('common', 'rare', 'legendary')),
  system_prompt text not null,
  beats         jsonb not null default '[]',
  brand_id      uuid references public.brands (id),  -- set for brand-mascot personas
  active        boolean not null default true
);

-- conditions jsonb schema (all present keys must pass — see spec §9):
-- { "service": "food", "finale_type": "canal", "persona_rarity": "legendary",
--   "min_tier": "gold", "nth_fail": 5, "day_of_week": [5,6,7],   -- isodow 1=Mon
--   "hour_range": [0, 5],                                        -- [start, end) local server time
--   "first_time_event": true }
create table public.voucher_campaigns (
  id            uuid primary key default gen_random_uuid(),
  brand_id      uuid references public.brands (id),
  title         text not null,
  image_url     text,
  terms         text,
  code_mode     text not null default 'unique'
                check (code_mode in ('none', 'static', 'unique')),
  static_code   text,
  redeem_info   text,
  trigger_event text not null
                check (trigger_event in ('order_failed', 'date_ghosted', 'tier_up', 'signup', 'share')),
  conditions    jsonb not null default '{}',
  quota_total   integer,                  -- null = unlimited
  quota_used    integer not null default 0,
  per_user_max  integer,
  cooldown_hours integer,
  active_from   timestamptz,
  active_to     timestamptz,
  status        text not null default 'draft'
                check (status in ('draft', 'active', 'paused')),
  priority      integer not null default 0,
  weight        integer not null default 1,
  is_fallback   boolean not null default false,  -- evergreen consolation (spec §13); trigger/conditions/quota are ignored for fallbacks
  created_at    timestamptz not null default now(),
  constraint static_code_required
    check (code_mode <> 'static' or static_code is not null),
  constraint valid_active_window
    check (active_from is null or active_to is null or active_to > active_from)
);

alter table public.brands            enable row level security;
alter table public.catalog_items     enable row level security;
alter table public.gag_scripts       enable row level security;
alter table public.gag_anchors       enable row level security;
alter table public.personas          enable row level security;
alter table public.voucher_campaigns enable row level security;

create policy "public read" on public.brands            for select using (true);
create policy "public read" on public.catalog_items     for select using (true);
create policy "public read" on public.gag_scripts       for select using (true);
create policy "public read" on public.gag_anchors       for select using (true);
create policy "public read" on public.personas          for select using (true);
create policy "public read" on public.voucher_campaigns for select using (true);

-- auto_expose_new_tables = false: explicit grants required per table.
-- Content is public-read; nobody but the Studio/service role writes it.
grant select on public.brands            to anon, authenticated;
grant select on public.catalog_items     to anon, authenticated;
grant select on public.gag_scripts       to anon, authenticated;
grant select on public.gag_anchors       to anon, authenticated;
grant select on public.personas          to anon, authenticated;
grant select on public.voucher_campaigns to anon, authenticated;

-- Studio editors see comment-on-column text, not SQL file comments.
comment on column public.gag_scripts.timeline is
  'Event timeline JSON: {"duration_s": int, "events": [{"t": sec, "type": "eta|move|chat|incident|sabotage|finale", ...}]}. See migration file for full example.';
comment on column public.voucher_campaigns.conditions is
  'All present keys must pass. Valid keys/values: service (food|ride|parcel|mart|date), finale_type (e.g. canal), persona_rarity (common|rare|legendary), min_tier (silver|gold|platinum|vip — exact lowercase), nth_fail (int), day_of_week (array, isodow 1=Mon..7=Sun), hour_range ([start,end) hours), first_time_event (bool).';
