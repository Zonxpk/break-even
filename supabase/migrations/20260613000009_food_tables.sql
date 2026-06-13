-- Food CMS tables (spec 2026-06-13-food-delivery-design §2)

create table public.food_restaurants (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  photo_url       text,
  banner_url      text,
  cuisine_tags    text[] not null default '{}',
  rating          numeric(2,1),
  review_count    integer not null default 0,
  delivery_fee    numeric(10,2) not null default 0,
  eta_minutes     integer not null default 30,
  promo_badge     text,
  tie_in_brand_id uuid references public.brands (id),
  active          boolean not null default true,
  sort            integer not null default 0
);

create table public.food_menu_categories (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.food_restaurants (id) on delete cascade,
  name          text not null,
  sort          integer not null default 0
);

create table public.food_menu_items (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.food_restaurants (id) on delete cascade,
  category_id   uuid not null references public.food_menu_categories (id) on delete cascade,
  name          text not null,
  description   text,
  photo_url     text,
  price         numeric(10,2) not null default 0,
  rating        numeric(2,1),
  active        boolean not null default true,
  sort          integer not null default 0
);

create table public.food_modifier_groups (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  min_select integer not null default 0,
  max_select integer not null default 1,
  active     boolean not null default true,
  sort       integer not null default 0,
  constraint food_modifier_groups_bounds
    check (min_select >= 0 and max_select >= 1 and min_select <= max_select)
);

create table public.food_modifier_options (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references public.food_modifier_groups (id) on delete cascade,
  name        text not null,
  price_delta numeric(10,2) not null default 0,
  active      boolean not null default true,
  sort        integer not null default 0
);

create table public.food_item_modifier_groups (
  menu_item_id uuid not null references public.food_menu_items (id) on delete cascade,
  group_id     uuid not null references public.food_modifier_groups (id) on delete cascade,
  sort         integer not null default 0,
  primary key (menu_item_id, group_id)
);

create table public.food_promos (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  subtitle      text,
  image_url     text,
  restaurant_id uuid references public.food_restaurants (id) on delete set null,
  badge_text    text,
  active        boolean not null default true,
  sort          integer not null default 0,
  starts_at     timestamptz,
  ends_at       timestamptz
);

create index food_menu_categories_restaurant_idx on public.food_menu_categories (restaurant_id);
create index food_menu_items_restaurant_idx on public.food_menu_items (restaurant_id);
create index food_menu_items_category_idx on public.food_menu_items (category_id);
create index food_modifier_options_group_idx on public.food_modifier_options (group_id);
create index food_promos_restaurant_idx on public.food_promos (restaurant_id);

alter table public.food_restaurants         enable row level security;
alter table public.food_menu_categories     enable row level security;
alter table public.food_menu_items          enable row level security;
alter table public.food_modifier_groups     enable row level security;
alter table public.food_modifier_options    enable row level security;
alter table public.food_item_modifier_groups enable row level security;
alter table public.food_promos              enable row level security;

create policy "public read" on public.food_restaurants          for select using (true);
create policy "public read" on public.food_menu_categories      for select using (true);
create policy "public read" on public.food_menu_items           for select using (true);
create policy "public read" on public.food_modifier_groups      for select using (true);
create policy "public read" on public.food_modifier_options     for select using (true);
create policy "public read" on public.food_item_modifier_groups  for select using (true);
create policy "public read" on public.food_promos               for select using (true);

grant select on public.food_restaurants          to anon, authenticated;
grant select on public.food_menu_categories      to anon, authenticated;
grant select on public.food_menu_items           to anon, authenticated;
grant select on public.food_modifier_groups      to anon, authenticated;
grant select on public.food_modifier_options     to anon, authenticated;
grant select on public.food_item_modifier_groups to anon, authenticated;
grant select on public.food_promos               to anon, authenticated;

comment on table public.food_restaurants is 'Fake restaurants for food delivery browse (CMS).';
comment on column public.food_modifier_groups.min_select is '0 = optional group; 1 with max_select=1 = required pick-one.';
