# Food Delivery Deep Browse — Design Spec

**Date:** 2026-06-13  
**Status:** Approved — implementation plan at `docs/superpowers/plans/2026-06-13-food-delivery.md`  
**Parent spec:** `docs/superpowers/specs/2026-06-11-when-geemong-design.md` §5 (Browse → Confirm pipeline)  
**Prerequisite:** App core shipped (`docs/superpowers/RESUME-app-core.md`)

## Goal

Replace the shallow flat `catalog_items` food browse (shop name baked into dish rows, tap-to-checkout) with a Grab-parody-real food ordering flow: restaurant list → menu → modifier sheet → cart → confirm. All restaurant, menu, and modifier content is CMS-editable in Supabase Studio.

## Non-goals

- Map or device geolocation on browse screens (unchanged — seeded endpoints at track time)
- Real payment methods or non-zero charges (confirm stays ฿0)
- Ride/parcel/mart bespoke browse (keep generic `catalog_items` renderer)
- Favorites, reorder history, loyalty perks on food browse
- Brand self-service write access to food tables (Studio-only for v1, same as other content tables)

## User decisions (brainstorming)

| Question | Choice |
|----------|--------|
| Primary pain | Selecting a shop skips straight to payment — no menu step |
| Menu depth | C — Full parody-real: search, promos, dish modifiers, notes |
| Content model | A — Full CMS: restaurants, menu items, modifier groups all in Studio |
| Schema approach | A — Dedicated `food_*` tables (recommended over extending `catalog_items`) |

## Architecture

Food gets its own normalized CMS tables and dedicated Expo routes. The shared order pipeline (confirm → track → fail → voucher) is unchanged; only the browse/cart path and `items_json` shape evolve for food.

```
food_restaurants ──┬── food_menu_categories
                   └── food_menu_items ── food_item_modifier_groups ── food_modifier_groups
                                                                              └── food_modifier_options
food_promos (optional restaurant_id)

mobile/src/api/food.ts          — fetch restaurants, promos, menu+modifiers
mobile/src/state/foodCart.ts    — Zustand cart (client-only until checkout)
mobile/src/food/cartMath.ts     — totals, modifier validation (pure, TDD)
mobile/src/app/order/food/      — restaurant list, menu, item sheet, cart
mobile/src/app/order/[service]/confirm.tsx — food reads cart store; others keep URL params
```

Ride/parcel/mart continue using `mobile/src/app/order/[service]/index.tsx` and `fetchCatalog`.

---

## 1. User flow

```
หน้าแรก → สั่งอาหาร
  → ① ร้านแนะนำ (restaurant list + search + promo banners)
  → ② เมนูร้าน (restaurant header: rating, ETA, delivery fee, categories)
  → ③ รายละเอียดเมนู (bottom sheet: modifiers, notes, qty, add to cart)
  → ④ ตะกร้า (floating bar on ②, full screen on tap)
  → ⑤ สรุปคำสั่งซื้อ (existing confirm — ฿0, gag unchanged)
  → track → fail → voucher
```

**Key behaviors:**

- Tapping a **restaurant card** opens its menu — never skips to payment
- Tapping a **dish** opens a modifier sheet (not instant checkout)
- **Floating cart bar** shows item count + subtotal; tap to review before confirm
- **Search** on screen ① filters restaurants by name and `cuisine_tags`
- **Promo banners** on ① are CMS rows (`food_promos`); tap navigates to linked restaurant when `restaurant_id` is set
- Modifier rules enforced client-side from CMS: required groups block "เพิ่มลงตะกร้า" until satisfied
- **Notes field** free text per line item (e.g. "ไม่ใส่ผักชี")

---

## 2. Data model (CMS tables)

All tables: public-read (`anon`, `authenticated` SELECT grants), RLS enabled with `public read` policy, Studio-writable via service role. Existing `catalog_items` rows where `service = 'food'` are migrated into the new tables then deleted.

### `food_restaurants`

| Column | Type | Purpose |
|--------|------|---------|
| `id` | uuid PK | |
| `name` | text | |
| `photo_url` | text | Card thumbnail |
| `banner_url` | text | Menu header |
| `cuisine_tags` | text[] | Search/filter chips, e.g. `{'ก๋วยเตี๋ยว','อาหารตามสั่ง'}` |
| `rating` | numeric(2,1) | Display only |
| `review_count` | integer | Display only |
| `delivery_fee` | numeric(10,2) | Shown on card + menu header |
| `eta_minutes` | integer | Shown on card + menu header |
| `promo_badge` | text | Short label e.g. "ส่งฟรี", nullable |
| `tie_in_brand_id` | uuid FK → `brands` | Product placement, nullable |
| `active` | boolean | default true |
| `sort` | integer | List ordering |

### `food_menu_categories`

| Column | Type | Purpose |
|--------|------|---------|
| `id` | uuid PK | |
| `restaurant_id` | uuid FK → `food_restaurants` | |
| `name` | text | e.g. "เมนูแนะนำ", "เครื่องดื่ม" |
| `sort` | integer | Tab/section order |

### `food_menu_items`

| Column | Type | Purpose |
|--------|------|---------|
| `id` | uuid PK | |
| `restaurant_id` | uuid FK | |
| `category_id` | uuid FK → `food_menu_categories` | |
| `name` | text | |
| `description` | text | Nullable short blurb |
| `photo_url` | text | Nullable |
| `price` | numeric(10,2) | Display only — never charged |
| `rating` | numeric(2,1) | Nullable |
| `active` | boolean | default true |
| `sort` | integer | Within category |

### `food_modifier_groups`

| Column | Type | Purpose |
|--------|------|---------|
| `id` | uuid PK | |
| `name` | text | e.g. "ระดับความเผ็ด", "ท็อปปิ้ง" |
| `min_select` | integer | `0` = optional; `1` with `max_select=1` = required pick-one |
| `max_select` | integer | `1` = radio; `N` = checkbox cap |
| `active` | boolean | default true |
| `sort` | integer | Display order on item sheet |

Groups are reusable across dishes via junction table.

### `food_modifier_options`

| Column | Type | Purpose |
|--------|------|---------|
| `id` | uuid PK | |
| `group_id` | uuid FK → `food_modifier_groups` | |
| `name` | text | e.g. "เผ็ดน้อย", "ไม่ใส่ผักชี" |
| `price_delta` | numeric(10,2) | default 0; supports "+฿10 ไข่ดาว" |
| `active` | boolean | default true |
| `sort` | integer | |

### `food_item_modifier_groups` (junction)

| Column | Type |
|--------|------|
| `menu_item_id` | uuid FK → `food_menu_items` |
| `group_id` | uuid FK → `food_modifier_groups` |
| `sort` | integer |

Primary key: `(menu_item_id, group_id)`.

### `food_promos`

| Column | Type | Purpose |
|--------|------|---------|
| `id` | uuid PK | |
| `title` | text | Banner headline |
| `subtitle` | text | Nullable |
| `image_url` | text | Nullable |
| `restaurant_id` | uuid FK → `food_restaurants` | Nullable — null = platform-wide |
| `badge_text` | text | Optional chip on restaurant card |
| `active` | boolean | default true |
| `sort` | integer | |
| `starts_at` | timestamptz | Nullable — no start bound if null |
| `ends_at` | timestamptz | Nullable — no end bound if null |

### Seed target

- ~8 restaurants with varied `cuisine_tags`
- ~4–6 dishes per restaurant across 2–3 categories
- 2–3 modifier groups per dish type (spice level, toppings, etc.)
- 3 promo banners (mix of platform-wide and restaurant-linked)
- Migrate existing two food `catalog_items` seed rows into appropriate restaurants

### pgTAP

New test file `supabase/tests/0008_food_tables_test.sql`: tables exist, anon SELECT grants, anon can read seeded row.

---

## 3. Cart, order payload & routes

### Cart state (`mobile/src/state/foodCart.ts`)

```ts
interface CartLine {
  lineId: string;           // uuid per add-to-cart
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
```

**Rules:**

- Cart is **single-restaurant**. Adding from a different restaurant shows confirm: "ล้างตะกร้าและเปลี่ยนร้าน?"
- Line total = `(unitPrice + sum(priceDelta)) × quantity`
- Cart subtotal + restaurant `delivery_fee` displayed; confirm screen still shows **฿0** payable with existing gag copy

### Order payload (`orders.items_json`)

Snapshot at checkout — no server joins needed for display:

```json
[{
  "restaurant_id": "uuid",
  "restaurant_name": "ครัวป้าแมว",
  "menu_item_id": "uuid",
  "name": "ข้าวกะเพราไก่",
  "quantity": 2,
  "modifiers": [{ "group": "ระดับความเผ็ด", "option": "เผ็ดน้อย" }],
  "notes": "ไม่ใส่ผักชี",
  "line_total": 130
}]
```

`placeOrder({ service: 'food', items })` signature unchanged.

### Routes

| Path | Screen |
|------|--------|
| `/order/food/` | Restaurant list + search + promos |
| `/order/food/[restaurantId]/` | Menu with floating cart bar |
| `/order/food/[restaurantId]/item/[itemId]` | Modifier bottom sheet (modal) |
| `/order/food/cart` | Full cart review |
| `/order/food/confirm` | Food confirm (reads Zustand cart) |
| `/order/[service]/confirm` | Unchanged for ride/parcel/mart |

Home tile `svc-food` navigates to `/order/food` instead of `/order/food` via generic `[service]` — update `(tabs)/index.tsx` food tile route.

### API (`mobile/src/api/food.ts`)

| Function | Behavior |
|----------|----------|
| `fetchFoodRestaurants(query?: string)` | Active restaurants ordered by `sort`; optional ilike on `name` + array overlap on `cuisine_tags` |
| `fetchFoodPromos()` | Active promos where `now()` within `starts_at`/`ends_at` window |
| `fetchRestaurantMenu(restaurantId)` | Restaurant row + categories + items + modifier groups/options via joins |

Errors propagate to UI — no silent `catch(() => {})`.

---

## 4. UI & Grab-grade polish

### Restaurant list

- Pinned search bar; cuisine tag chips below
- Promo carousel above list
- Cards: photo, name, rating + review count, ETA, delivery fee, promo badge
- Skeleton loaders while fetching

### Menu screen

- Sticky header: banner, name, rating, ETA, delivery fee
- Category tabs with scroll-synced sections
- Dish rows: photo, name, price, description, "+" opens item sheet
- Floating cart bar: `ดูตะกร้า · N รายการ · ฿XXX`

### Item sheet (modal)

- Photo, name, description, base price
- Modifier groups: radio (max_select=1), checkboxes (max_select>1)
- Required groups: red hint + disabled CTA until satisfied
- Notes `TextInput`, placeholder "หมายเหตุถึงร้าน เช่น ไม่ใส่ผักชี"
- Quantity stepper
- CTA: `เพิ่มลงตะกร้า · ฿XXX`

### Cart screen

- Lines with modifiers and notes expanded
- Edit quantity, remove line
- Subtotal + delivery fee + teaser matching confirm ฿0 copy

**Visual:** existing `theme.green` / food accent `#00B14F`. Real photos when `photo_url` set; emoji fallback only when null.

---

## 5. Error handling

| Situation | Behavior |
|-----------|----------|
| Supabase fetch fails | Thai message + retry button |
| Empty restaurant list | "ยังไม่มีร้านเปิดในพื้นที่นี้" |
| Restaurant with no active items | Header + "ร้านนี้ปิดเมนูชั่วคราว" |
| Required modifier group has no active options | Dish marked "ไม่พร้อมสั่ง" |
| Empty cart at checkout | Disabled CTA |
| Switch restaurant with cart items | Confirm "ล้างตะกร้าและเปลี่ยนร้าน?" |
| Expired promo | Filtered on fetch |

Food confirm reads cart from Zustand — no `items` JSON in route params (fixes fragile serialization limit).

---

## 6. Testing

### Pure/unit (Jest)

- `cartLineTotal(line)` — base + modifier deltas × quantity
- `validateModifierSelection(selection, groups)` — min/max/required
- `buildFoodOrderPayload(cart)` — `items_json` snapshot shape
- `filterRestaurants(list, query, tags)` — search/filter logic

### API

- Mocked `fetchFoodRestaurants`, `fetchRestaurantMenu` with fixtures

### Screen smoke

- Restaurant list renders cards from fixture
- Menu renders categories
- Cart bar appears after `addLine`

### Manual checklist

Restaurant → dish → modifiers → notes → qty → cart → confirm ฿0 → track → fail → voucher (gag path unchanged)

### Database

- pgTAP grants + anon read
- Seed integrity: every active restaurant has ≥1 category, ≥1 active item

---

## 7. Migration & rollout

1. Add migration `20260613000008_food_tables.sql` with tables, RLS, grants, comments for Studio editors
2. Update `supabase/seed.sql` with food content; remove food rows from `catalog_items`
3. Ship mobile food routes + cart; redirect home food tile
4. No app release needed for future content — Studio edits only

---

## 8. Files to create/modify (implementation hint)

**Create:**

- `supabase/migrations/20260613000008_food_tables.sql`
- `supabase/tests/0008_food_tables_test.sql`
- `mobile/src/api/food.ts`
- `mobile/src/state/foodCart.ts`
- `mobile/src/food/cartMath.ts`
- `mobile/src/food/__tests__/cartMath.test.ts`
- `mobile/src/app/order/food/index.tsx`
- `mobile/src/app/order/food/[restaurantId]/index.tsx`
- `mobile/src/app/order/food/[restaurantId]/item/[itemId].tsx`
- `mobile/src/app/order/food/cart.tsx`
- `mobile/src/app/order/food/confirm.tsx`

**Modify:**

- `supabase/seed.sql`
- `mobile/src/types/db.ts` — food row types
- `mobile/src/app/(tabs)/index.tsx` — food tile → `/order/food`
- `mobile/src/app/order/[service]/index.tsx` — redirect `service === 'food'` to `/order/food` (deep-link safety)

**Unchanged:**

- `mobile/src/engine/*`, track/fail/voucher flows
- `mobile/src/app/order/[service]/confirm.tsx` for non-food services
