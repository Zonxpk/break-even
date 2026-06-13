# Food Delivery Deep Browse Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Grab-parody-real food ordering — restaurant list → menu → modifier sheet → cart → ฿0 confirm — with full CMS tables in Supabase Studio.

**Architecture:** New normalized `food_*` Postgres tables (public-read). Pure cart/search math in `mobile/src/food/` (TDD). Zustand cart store. Dedicated Expo routes under `mobile/src/app/order/food/`. Ride/parcel/mart keep generic `catalog_items` browse. Gag engine / track / fail / voucher unchanged.

**Tech Stack:** Expo Router v56, supabase-js, Zustand, jest-expo, pgTAP.

**Spec:** `docs/superpowers/specs/2026-06-13-food-delivery-design.md`

**Conventions:** Thai UI strings inline. Pure modules never import `react-native`. Run mobile commands from `mobile/`.

---

## File structure

```
supabase/
  migrations/20260613000009_food_tables.sql
  tests/0009_food_tables_test.sql
  seed.sql                                    # modify: food content, drop food catalog_items

mobile/src/
  types/db.ts                                 # Food* row types
  food/cartMath.ts                            # pure: totals, validation, payload
  food/search.ts                              # pure: filterRestaurants
  food/__tests__/cartMath.test.ts
  food/__tests__/search.test.ts
  state/foodCart.ts                           # Zustand cart
  api/food.ts                                 # Supabase fetchers
  app/order/food/index.tsx                    # restaurant list
  app/order/food/[restaurantId]/index.tsx     # menu + floating cart bar
  app/order/food/[restaurantId]/item/[itemId].tsx  # modifier modal
  app/order/food/cart.tsx
  app/order/food/confirm.tsx
  app/(tabs)/index.tsx                        # food tile → /order/food
  app/order/[service]/index.tsx               # redirect food → /order/food
  __tests__/foodBrowse.smoke.test.tsx
```

---

### Task 1: Food tables migration

**Files:**
- Create: `supabase/migrations/20260613000009_food_tables.sql`
- Create: `supabase/tests/0009_food_tables_test.sql`

- [ ] **Step 1: Create migration**

```sql
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
```

- [ ] **Step 2: Create pgTAP test** `supabase/tests/0009_food_tables_test.sql`

```sql
begin;
create extension if not exists pgtap with schema extensions;
select plan(16);

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
```

- [ ] **Step 3: Apply locally and run tests**

```bash
cd /Users/pakawat/Projects/labs/geemong
supabase db reset
supabase test db
```

Expected: all tests pass including `0009_food_tables_test`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260613000009_food_tables.sql supabase/tests/0009_food_tables_test.sql
git commit -m "feat(db): add food CMS tables for deep browse"
```

---

### Task 2: Seed food content

**Files:**
- Modify: `supabase/seed.sql`

- [ ] **Step 1: Remove food rows from `catalog_items` insert** — delete the two `('food', ...)` lines; keep ride/parcel/mart.

- [ ] **Step 2: Add shared modifier groups** (reused across dishes):

```sql
-- Food delivery CMS (see spec 2026-06-13-food-delivery-design)
insert into public.food_modifier_groups (id, name, min_select, max_select, sort) values
  ('f0000001-0000-4000-8000-000000000001', 'ระดับความเผ็ด', 1, 1, 1),
  ('f0000001-0000-4000-8000-000000000002', 'ท็อปปิ้ง', 0, 3, 2),
  ('f0000001-0000-4000-8000-000000000003', 'ระดับความหวาน', 1, 1, 1);

insert into public.food_modifier_options (group_id, name, price_delta, sort) values
  ('f0000001-0000-4000-8000-000000000001', 'เผ็ดน้อย', 0, 1),
  ('f0000001-0000-4000-8000-000000000001', 'ปกติ', 0, 2),
  ('f0000001-0000-4000-8000-000000000001', 'เผ็ดมาก', 0, 3),
  ('f0000001-0000-4000-8000-000000000002', 'ไข่ดาว', 10, 1),
  ('f0000001-0000-4000-8000-000000000002', 'ไม่ใส่ผักชี', 0, 2),
  ('f0000001-0000-4000-8000-000000000002', 'เพิ่มเนื้อ', 20, 3),
  ('f0000001-0000-4000-8000-000000000003', 'หวานน้อย', 0, 1),
  ('f0000001-0000-4000-8000-000000000003', 'หวานปกติ', 0, 2),
  ('f0000001-0000-4000-8000-000000000003', 'หวานมาก', 0, 3);
```

- [ ] **Step 3: Add 8 restaurants** with stable UUIDs, varied `cuisine_tags`, `promo_badge`, ratings. Minimum set:

| id suffix | name | tags |
|-----------|------|------|
| ...aa01 | ครัวป้าแมว | อาหารตามสั่ง |
| ...aa02 | เจ๊ติ๋มท่าน้ำ | ก๋วยเตี๋ยว |
| ...aa03 | ส้มตำป้าแดง | อีสาน,ส้มตำ |
| ...aa04 | ข้าวมันไก่เจ๊จู | ข้าวมันไก่ |
| ...aa05 | ปิ้งย่างซอยลับ | ปิ้งย่าง,เที่ยงคืน |
| ...aa06 | ชานมไข่มุกพี่หมีโต | ชานม,ของหวาน |
| ...aa07 | กะเพราถาดยักษ์ | อาหารตามสั่ง |
| ...aa08 | ราเมนซอยหลังบ้าน | ญี่ปุ่น,ก๋วยเตี๋ยว |

Each restaurant: 2 categories (`เมนูแนะนำ`, `เครื่องดื่ม`), 4–5 active items. Attach spice group to savory dishes, sweetness group to drinks, toppings where appropriate via `food_item_modifier_groups`.

Migrate legacy catalog names:
- `ข้าวกะเพราไก่ไข่ดาว — ครัวป้าแมว` → item under ครัวป้าแมว (฿65)
- `ก๋วยเตี๋ยวเรือเข้มข้น — เจ๊ติ๋มท่าน้ำ` → item under เจ๊ติ๋มท่าน้ำ (฿50)

- [ ] **Step 4: Add 3 promos**

```sql
insert into public.food_promos (title, subtitle, restaurant_id, badge_text, sort) values
  ('ส่งฟรีทุกออเดอร์*', '(*ส่งไม่ถึงอยู่ดี)', null, 'ส่งฟรี', 1),
  ('กะเพรา ฿49', 'เฉพาะครัวป้าแมว', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01', 'โปร', 2),
  ('ชานม 1 แถม 0', 'พี่หมีโตใจดี', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa06', '1 แถม 0', 3);
```

- [ ] **Step 5: Verify seed**

```bash
supabase db reset
supabase db query --local "SELECT count(*) FROM food_restaurants WHERE active;"
supabase db query --local "SELECT count(*) FROM food_menu_items WHERE active;"
```

Expected: 8 restaurants, ≥32 menu items.

- [ ] **Step 6: Commit**

```bash
git add supabase/seed.sql
git commit -m "feat(db): seed food restaurants, menus, modifiers, promos"
```

---

### Task 3: TypeScript types

**Files:**
- Modify: `mobile/src/types/db.ts`

- [ ] **Step 1: Append food types** (after `CatalogItem`):

```ts
export interface FoodRestaurant {
  id: string;
  name: string;
  photo_url: string | null;
  banner_url: string | null;
  cuisine_tags: string[];
  rating: number | null;
  review_count: number;
  delivery_fee: number;
  eta_minutes: number;
  promo_badge: string | null;
  tie_in_brand_id: string | null;
  active: boolean;
  sort: number;
}

export interface FoodMenuCategory {
  id: string;
  restaurant_id: string;
  name: string;
  sort: number;
}

export interface FoodMenuItem {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description: string | null;
  photo_url: string | null;
  price: number;
  rating: number | null;
  active: boolean;
  sort: number;
}

export interface FoodModifierGroup {
  id: string;
  name: string;
  min_select: number;
  max_select: number;
  active: boolean;
  sort: number;
  options: FoodModifierOption[];
}

export interface FoodModifierOption {
  id: string;
  group_id: string;
  name: string;
  price_delta: number;
  active: boolean;
  sort: number;
}

export interface FoodPromo {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  restaurant_id: string | null;
  badge_text: string | null;
  active: boolean;
  sort: number;
  starts_at: string | null;
  ends_at: string | null;
}

export interface FoodMenuBundle {
  restaurant: FoodRestaurant;
  categories: FoodMenuCategory[];
  items: FoodMenuItem[];
  modifierGroupsByItemId: Record<string, FoodModifierGroup[]>;
}

export interface FoodOrderLinePayload {
  restaurant_id: string;
  restaurant_name: string;
  menu_item_id: string;
  name: string;
  quantity: number;
  modifiers: Array<{ group: string; option: string }>;
  notes: string | null;
  line_total: number;
}
```

- [ ] **Step 2: Typecheck**

```bash
cd mobile && npm run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add mobile/src/types/db.ts
git commit -m "feat(mobile): add food CMS TypeScript types"
```

---

### Task 4: cartMath + search (TDD)

**Files:**
- Create: `mobile/src/food/cartMath.ts`
- Create: `mobile/src/food/search.ts`
- Create: `mobile/src/food/__tests__/cartMath.test.ts`
- Create: `mobile/src/food/__tests__/search.test.ts`

- [ ] **Step 1: Write failing tests** `cartMath.test.ts`

```ts
import {
  cartLineTotal,
  cartSubtotal,
  validateModifierSelection,
  buildFoodOrderPayload,
  type CartLineInput,
  type ModifierGroupInput,
} from '../cartMath';

const line: CartLineInput = {
  lineId: '1',
  menuItemId: 'm1',
  restaurantId: 'r1',
  restaurantName: 'ครัวป้าแมว',
  name: 'กะเพรา',
  unitPrice: 65,
  quantity: 2,
  modifiers: [{ groupId: 'g1', groupName: 'ระดับความเผ็ด', optionId: 'o1', optionName: 'เผ็ดน้อย', priceDelta: 0 }],
  notes: 'ไม่ใส่ผักชี',
};

test('cartLineTotal includes modifiers and quantity', () => {
  expect(cartLineTotal(line)).toBe(130);
});

test('cartSubtotal sums lines', () => {
  expect(cartSubtotal([line])).toBe(130);
});

test('validateModifierSelection rejects under min', () => {
  const groups: ModifierGroupInput[] = [{ id: 'g1', min_select: 1, max_select: 1, options: [{ id: 'o1' }] }];
  expect(validateModifierSelection({}, groups).ok).toBe(false);
});

test('validateModifierSelection accepts valid radio', () => {
  const groups: ModifierGroupInput[] = [{ id: 'g1', min_select: 1, max_select: 1, options: [{ id: 'o1' }, { id: 'o2' }] }];
  expect(validateModifierSelection({ g1: ['o1'] }, groups).ok).toBe(true);
});

test('validateModifierSelection rejects over max', () => {
  const groups: ModifierGroupInput[] = [{ id: 'g1', min_select: 0, max_select: 1, options: [{ id: 'o1' }, { id: 'o2' }] }];
  expect(validateModifierSelection({ g1: ['o1', 'o2'] }, groups).ok).toBe(false);
});

test('buildFoodOrderPayload shape', () => {
  const payload = buildFoodOrderPayload([line]);
  expect(payload[0]).toMatchObject({
    restaurant_id: 'r1',
    menu_item_id: 'm1',
    quantity: 2,
    modifiers: [{ group: 'ระดับความเผ็ด', option: 'เผ็ดน้อย' }],
    notes: 'ไม่ใส่ผักชี',
    line_total: 130,
  });
});
```

- [ ] **Step 2: Write failing tests** `search.test.ts`

```ts
import { filterRestaurants } from '../search';
import type { FoodRestaurant } from '../../types/db';

const restaurants: FoodRestaurant[] = [
  { id: '1', name: 'ครัวป้าแมว', cuisine_tags: ['อาหารตามสั่ง'], photo_url: null, banner_url: null,
    rating: 4.8, review_count: 200, delivery_fee: 0, eta_minutes: 25, promo_badge: null,
    tie_in_brand_id: null, active: true, sort: 1 },
  { id: '2', name: 'เจ๊ติ๋มท่าน้ำ', cuisine_tags: ['ก๋วยเตี๋ยว'], photo_url: null, banner_url: null,
    rating: 4.6, review_count: 150, delivery_fee: 15, eta_minutes: 30, promo_badge: null,
    tie_in_brand_id: null, active: true, sort: 2 },
];

test('filter by query on name', () => {
  expect(filterRestaurants(restaurants, 'ป้าแมว', []).map((r) => r.id)).toEqual(['1']);
});

test('filter by cuisine tag', () => {
  expect(filterRestaurants(restaurants, '', ['ก๋วยเตี๋ยว']).map((r) => r.id)).toEqual(['2']);
});
```

- [ ] **Step 3: Run tests — expect FAIL**

```bash
cd mobile && npm test -- cartMath search
```

- [ ] **Step 4: Implement** `cartMath.ts`

```ts
export interface CartLineInput {
  lineId: string;
  menuItemId: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  unitPrice: number;
  quantity: number;
  modifiers: Array<{
    groupId: string;
    groupName: string;
    optionId: string;
    optionName: string;
    priceDelta: number;
  }>;
  notes: string | null;
}

export interface ModifierGroupInput {
  id: string;
  min_select: number;
  max_select: number;
  options: Array<{ id: string }>;
}

export function cartLineTotal(line: CartLineInput): number {
  const modifierSum = line.modifiers.reduce((s, m) => s + m.priceDelta, 0);
  return (line.unitPrice + modifierSum) * line.quantity;
}

export function cartSubtotal(lines: CartLineInput[]): number {
  return lines.reduce((s, l) => s + cartLineTotal(l), 0);
}

export function validateModifierSelection(
  selected: Record<string, string[]>,
  groups: ModifierGroupInput[],
): { ok: boolean; message?: string } {
  for (const g of groups) {
    const picks = selected[g.id] ?? [];
    if (picks.length < g.min_select) {
      return { ok: false, message: `เลือก${g.min_select}ตัวเลือกในกลุ่ม` };
    }
    if (picks.length > g.max_select) {
      return { ok: false, message: `เลือกได้ไม่เกิน${g.max_select}ตัวเลือก` };
    }
    const validIds = new Set(g.options.map((o) => o.id));
    if (picks.some((id) => !validIds.has(id))) {
      return { ok: false, message: 'ตัวเลือกไม่ถูกต้อง' };
    }
  }
  return { ok: true };
}

export function buildFoodOrderPayload(lines: CartLineInput[]) {
  return lines.map((l) => ({
    restaurant_id: l.restaurantId,
    restaurant_name: l.restaurantName,
    menu_item_id: l.menuItemId,
    name: l.name,
    quantity: l.quantity,
    modifiers: l.modifiers.map((m) => ({ group: m.groupName, option: m.optionName })),
    notes: l.notes,
    line_total: cartLineTotal(l),
  }));
}
```

- [ ] **Step 5: Implement** `search.ts`

```ts
import type { FoodRestaurant } from '../types/db';

export function filterRestaurants(
  restaurants: FoodRestaurant[],
  query: string,
  tags: string[],
): FoodRestaurant[] {
  const q = query.trim().toLowerCase();
  return restaurants.filter((r) => {
    const matchesQuery =
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.cuisine_tags.some((t) => t.toLowerCase().includes(q));
    const matchesTags = tags.length === 0 || tags.some((t) => r.cuisine_tags.includes(t));
    return matchesQuery && matchesTags;
  });
}
```

- [ ] **Step 6: Run tests — expect PASS**

```bash
cd mobile && npm test -- cartMath search
```

- [ ] **Step 7: Commit**

```bash
git add mobile/src/food/
git commit -m "feat(mobile): add food cart math and search filters"
```

---

### Task 5: Zustand food cart store

**Files:**
- Create: `mobile/src/state/foodCart.ts`

- [ ] **Step 1: Implement store**

```ts
import { create } from 'zustand';
import type { CartLineInput } from '../food/cartMath';
import { cartLineTotal, cartSubtotal, buildFoodOrderPayload } from '../food/cartMath';

interface FoodCartState {
  restaurantId: string | null;
  restaurantName: string | null;
  deliveryFee: number;
  lines: CartLineInput[];
  addLine: (line: CartLineInput) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeLine: (lineId: string) => void;
  clear: () => void;
  setRestaurant: (id: string, name: string, deliveryFee: number) => void;
  lineCount: () => number;
  subtotal: () => number;
  orderPayload: () => ReturnType<typeof buildFoodOrderPayload>;
}

export const useFoodCart = create<FoodCartState>((set, get) => ({
  restaurantId: null,
  restaurantName: null,
  deliveryFee: 0,
  lines: [],

  setRestaurant: (id, name, deliveryFee) =>
    set({ restaurantId: id, restaurantName: name, deliveryFee }),

  addLine: (line) =>
    set((s) => {
      if (s.restaurantId && s.restaurantId !== line.restaurantId) {
        return s; // caller must clear first after user confirms
      }
      return {
        restaurantId: line.restaurantId,
        restaurantName: line.restaurantName,
        lines: [...s.lines, line],
      };
    }),

  updateQuantity: (lineId, quantity) =>
    set((s) => ({
      lines:
        quantity <= 0
          ? s.lines.filter((l) => l.lineId !== lineId)
          : s.lines.map((l) => (l.lineId === lineId ? { ...l, quantity } : l)),
    })),

  removeLine: (lineId) => set((s) => ({ lines: s.lines.filter((l) => l.lineId !== lineId) })),

  clear: () => set({ restaurantId: null, restaurantName: null, deliveryFee: 0, lines: [] }),

  lineCount: () => get().lines.reduce((n, l) => n + l.quantity, 0),
  subtotal: () => cartSubtotal(get().lines),
  orderPayload: () => buildFoodOrderPayload(get().lines),
}));
```

Export helper `canAddToCart(restaurantId: string): boolean` that returns true if cart empty or same restaurant.

- [ ] **Step 2: Typecheck**

```bash
cd mobile && npm run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add mobile/src/state/foodCart.ts
git commit -m "feat(mobile): add Zustand food cart store"
```

---

### Task 6: Food API fetchers

**Files:**
- Create: `mobile/src/api/food.ts`

- [ ] **Step 1: Implement fetchers**

```ts
import { supabase } from '../lib/supabase';
import type {
  FoodMenuBundle,
  FoodMenuCategory,
  FoodMenuItem,
  FoodModifierGroup,
  FoodModifierOption,
  FoodPromo,
  FoodRestaurant,
} from '../types/db';

export async function fetchFoodRestaurants(query?: string): Promise<FoodRestaurant[]> {
  let q = supabase.from('food_restaurants').select('*').eq('active', true).order('sort');
  if (query?.trim()) {
    const term = `%${query.trim()}%`;
    q = q.or(`name.ilike.${term}`);
  }
  const { data, error } = await q;
  if (error) throw error;
  return data as FoodRestaurant[];
}

export async function fetchFoodPromos(): Promise<FoodPromo[]> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('food_promos')
    .select('*')
    .eq('active', true)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .order('sort');
  if (error) throw error;
  return data as FoodPromo[];
}

export async function fetchRestaurantMenu(restaurantId: string): Promise<FoodMenuBundle> {
  const { data: restaurant, error: rErr } = await supabase
    .from('food_restaurants')
    .select('*')
    .eq('id', restaurantId)
    .single();
  if (rErr) throw rErr;

  const { data: categories, error: cErr } = await supabase
    .from('food_menu_categories')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('sort');
  if (cErr) throw cErr;

  const { data: items, error: iErr } = await supabase
    .from('food_menu_items')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('active', true)
    .order('sort');
  if (iErr) throw iErr;

  const itemIds = (items as FoodMenuItem[]).map((i) => i.id);
  const modifierGroupsByItemId: Record<string, FoodModifierGroup[]> = {};

  if (itemIds.length > 0) {
    const { data: links, error: lErr } = await supabase
      .from('food_item_modifier_groups')
      .select('menu_item_id, group_id, sort')
      .in('menu_item_id', itemIds)
      .order('sort');
    if (lErr) throw lErr;

    const groupIds = [...new Set((links ?? []).map((l) => l.group_id))];
    if (groupIds.length > 0) {
      const { data: groups, error: gErr } = await supabase
        .from('food_modifier_groups')
        .select('*')
        .in('id', groupIds)
        .eq('active', true)
        .order('sort');
      if (gErr) throw gErr;

      const { data: options, error: oErr } = await supabase
        .from('food_modifier_options')
        .select('*')
        .in('group_id', groupIds)
        .eq('active', true)
        .order('sort');
      if (oErr) throw oErr;

      const optionsByGroup = new Map<string, FoodModifierOption[]>();
      for (const o of options as FoodModifierOption[]) {
        const arr = optionsByGroup.get(o.group_id) ?? [];
        arr.push(o);
        optionsByGroup.set(o.group_id, arr);
      }

      const groupMap = new Map(
        (groups as FoodModifierGroup[]).map((g) => [
          g.id,
          { ...g, options: optionsByGroup.get(g.id) ?? [] },
        ]),
      );

      for (const itemId of itemIds) modifierGroupsByItemId[itemId] = [];
      for (const link of links ?? []) {
        const g = groupMap.get(link.group_id);
        if (g) modifierGroupsByItemId[link.menu_item_id].push(g);
      }
      for (const id of itemIds) {
        modifierGroupsByItemId[id].sort((a, b) => a.sort - b.sort);
      }
    }
  }

  return {
    restaurant: restaurant as FoodRestaurant,
    categories: categories as FoodMenuCategory[],
    items: items as FoodMenuItem[],
    modifierGroupsByItemId,
  };
}
```

Note: client-side `filterRestaurants` handles cuisine tag chips after fetch (simpler than PostgREST array overlap).

- [ ] **Step 2: Typecheck**

```bash
cd mobile && npm run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add mobile/src/api/food.ts
git commit -m "feat(mobile): add food Supabase API fetchers"
```

---

### Task 7: Restaurant list screen

**Files:**
- Create: `mobile/src/app/order/food/index.tsx`

- [ ] **Step 1: Build screen** with:
  - `TextInput` search (debounce 300ms optional)
  - Horizontal `ScrollView` cuisine tag chips derived from all restaurants' tags
  - Promo `ScrollView` horizontal — `Pressable` navigates to `/order/food/[restaurantId]` when `restaurant_id` set
  - `FlatList` restaurant cards: photo/emoji fallback, name, ★ rating (review_count), ETA, delivery fee, promo_badge
  - `onPress` → `router.push(/order/food/${id})`
  - Loading: `ActivityIndicator`; error: Thai text + retry `Pressable`; empty: "ยังไม่มีร้านเปิดในพื้นที่นี้"
  - Use `filterRestaurants` from `search.ts` on fetched data
  - `Stack.Screen` title `สั่งอาหาร`, accent `#00B14F`

- [ ] **Step 2: Manual smoke** — open `/order/food`, see ≥8 restaurants

- [ ] **Step 3: Commit**

```bash
git add mobile/src/app/order/food/index.tsx
git commit -m "feat(mobile): food restaurant list with search and promos"
```

---

### Task 8: Menu screen + floating cart bar

**Files:**
- Create: `mobile/src/app/order/food/[restaurantId]/index.tsx`

- [ ] **Step 1: Build screen** with:
  - Fetch `fetchRestaurantMenu(restaurantId)` on mount
  - Header: banner, name, rating, ETA, delivery fee
  - On load call `useFoodCart.getState().setRestaurant(id, name, delivery_fee)` if cart empty or same id
  - Category sections: map categories → items in category
  - Dish row: photo, name, description (1 line), price, `+` button → `router.push(/order/food/${restaurantId}/item/${itemId})`
  - Empty items: "ร้านนี้ปิดเมนูชั่วคราว"
  - Floating bottom bar when `lineCount() > 0`: `ดูตะกร้า · ${n} รายการ · ฿${subtotal + deliveryFee}` → `/order/food/cart`

- [ ] **Step 2: Commit**

```bash
git add mobile/src/app/order/food/[restaurantId]/index.tsx
git commit -m "feat(mobile): restaurant menu screen with cart bar"
```

---

### Task 9: Item modifier sheet (modal)

**Files:**
- Create: `mobile/src/app/order/food/[restaurantId]/item/[itemId].tsx`

- [ ] **Step 1: Configure modal** in file:

```tsx
<Stack.Screen options={{ presentation: 'modal', headerShown: true, title: 'รายละเอียด' }} />
```

- [ ] **Step 2: Build sheet** with:
  - Load menu via `fetchRestaurantMenu` (or pass minimal params — prefer fetch for single source of truth)
  - Find item + `modifierGroupsByItemId[itemId]`
  - State: `selected: Record<string, string[]>`, `notes`, `quantity` (default 1)
  - Render groups: `max_select === 1` → radio (`Pressable` toggles single); else checkboxes capped at `max_select`
  - `validateModifierSelection` gates CTA
  - Required hint text in red when invalid
  - CTA label: `เพิ่มลงตะกร้า · ฿${cartLineTotal({...})}`
  - On add: if different restaurant in cart, `Alert.alert` confirm clear; else `addLine` with `lineId: crypto.randomUUID()` (use `expo-crypto` or `Date.now().toString()` if no crypto — `import * as Crypto from 'expo-crypto'` if available, else `` `${itemId}-${Date.now()}` ``)
  - `router.back()` after add

- [ ] **Step 3: Commit**

```bash
git add mobile/src/app/order/food/[restaurantId]/item/[itemId].tsx
git commit -m "feat(mobile): food item modifier sheet"
```

---

### Task 10: Cart + confirm screens

**Files:**
- Create: `mobile/src/app/order/food/cart.tsx`
- Create: `mobile/src/app/order/food/confirm.tsx`

- [ ] **Step 1: Cart screen**
  - List lines with modifiers + notes
  - Quantity stepper, remove
  - Subtotal, delivery fee, grand display total (struck) + note about ฿0 at checkout
  - CTA `ไปชำระเงิน` → `/order/food/confirm` (disabled if empty)

- [ ] **Step 2: Confirm screen** — copy structure from `order/[service]/confirm.tsx` but:
  - Read `useFoodCart()` lines via `orderPayload()`
  - Display each line: `name × qty`, modifier sub-lines, notes
  - Subtotal struck, payable ฿0, gag fine print
  - `placeOrder({ service: 'food', items: orderPayload() })`
  - On success: `clear()` cart, `router.replace(/track/${order.id})`

- [ ] **Step 3: Commit**

```bash
git add mobile/src/app/order/food/cart.tsx mobile/src/app/order/food/confirm.tsx
git commit -m "feat(mobile): food cart and confirm screens"
```

---

### Task 11: Routing integration

**Files:**
- Modify: `mobile/src/app/(tabs)/index.tsx`
- Modify: `mobile/src/app/order/[service]/index.tsx`

- [ ] **Step 1: Home food tile** — change food service `onPress` to `router.push('/order/food')` instead of `/order/food` via template. Easiest: add optional `route` to SERVICES like dating:

```ts
{ key: 'food', label: 'อาหาร', glyph: '🍜', route: '/order/food' as const },
```

- [ ] **Step 2: Generic browse redirect** — top of `Browse` component:

```tsx
const router = useRouter();
useEffect(() => {
  if (service === 'food') router.replace('/order/food');
}, [service]);
```

- [ ] **Step 3: Commit**

```bash
git add mobile/src/app/(tabs)/index.tsx mobile/src/app/order/[service]/index.tsx
git commit -m "feat(mobile): route food service to deep browse flow"
```

---

### Task 12: Smoke tests + verification

**Files:**
- Create: `mobile/src/__tests__/foodBrowse.smoke.test.tsx`

- [ ] **Step 1: Mock API and test restaurant list renders**

```tsx
jest.mock('../api/food', () => ({
  fetchFoodRestaurants: jest.fn().mockResolvedValue([
    { id: 'r1', name: 'ครัวป้าแมว', cuisine_tags: ['อาหารตามสั่ง'], photo_url: null, banner_url: null,
      rating: 4.8, review_count: 100, delivery_fee: 0, eta_minutes: 25, promo_badge: null,
      tie_in_brand_id: null, active: true, sort: 1 },
  ]),
  fetchFoodPromos: jest.fn().mockResolvedValue([]),
}));
```

Render food index, expect `ครัวป้าแมว` text.

- [ ] **Step 2: Full verification**

```bash
cd mobile && npm run typecheck && npm test
cd .. && supabase test db
```

Expected: all Jest + pgTAP green.

- [ ] **Step 3: Manual checklist** (simulator)

1. Home → อาหาร → 8 restaurants visible
2. Search "ป้าแมว" filters list
3. Tap restaurant → menu categories + dishes
4. Tap dish → modifier sheet → pick spice → add notes → add to cart
5. Floating bar appears → cart → confirm ฿0 → track → fail → voucher

- [ ] **Step 4: Commit**

```bash
git add mobile/src/__tests__/foodBrowse.smoke.test.tsx
git commit -m "test(mobile): food browse smoke test"
```

---

## Self-Review Notes

| Spec requirement | Task |
|------------------|------|
| §1 five-screen flow | Tasks 7–10 |
| §2 CMS tables | Tasks 1–2 |
| §3 cart + payload + routes | Tasks 4–5, 10–11 |
| §4 Grab UI polish | Tasks 7–9 |
| §5 error handling | Tasks 6–7 (no silent catch) |
| §6 testing | Tasks 4, 12 |
| §7 migration rollout | Tasks 1–2 |
| Single-restaurant cart rule | Task 5, 9 |
| Food leaves catalog_items | Task 2 |
| Gag pipeline unchanged | confirm calls same `placeOrder` |

**Migration number:** uses `20260613000009` because `00008` is `revoke_truncate`.

**Deferred (explicit):** device geolocation, favorites, reorder, brand write RLS on food tables.
