# When? (กี่โมง?) Merch Shop + Brand Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the pop-up merch shop (user claims via `claim_merch` RPC) and brand-mode management screens for `brand_members`, per spec §10.

**Architecture:** Pure `shopSchedule.ts` for window math (Asia/Bangkok). Thin API in `mobile/src/api/shop.ts`. User routes: home teaser → `/merch` overlay stack. Brand routes: `/brand` gated by `brand_members` lookup. Backend RPCs already exist — no new migrations.

**Tech Stack:** Expo Router, supabase-js, Jest (pure modules), existing `theme.ts` patterns.

**Spec:** `docs/superpowers/specs/2026-06-11-when-geemong-design.md` §10. **Prerequisite:** sub-project 2 app core (voucher wallet).

---

### Task 1: Shop schedule utilities (TDD)

**Files:**
- Create: `mobile/src/shop/schedule.ts`
- Create: `mobile/src/shop/__tests__/schedule.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
import { isShopOpen, msUntilNextOpen, type ShopSchedule } from '../schedule';

const SCHEDULE: ShopSchedule = {
  windows: [{ from: '2026-06-01', to: '2026-06-30', days_of_week: [5], open: '18:00', close: '22:00' }],
};

test('open on scheduled Friday evening', () => {
  const now = new Date('2026-06-13T19:00:00+07:00'); // Friday
  expect(isShopOpen(SCHEDULE, now)).toBe(true);
});

test('closed outside window hours', () => {
  const now = new Date('2026-06-13T12:00:00+07:00');
  expect(isShopOpen(SCHEDULE, now)).toBe(false);
});

test('countdown positive when closed', () => {
  const now = new Date('2026-06-13T12:00:00+07:00');
  expect(msUntilNextOpen(SCHEDULE, now)).toBeGreaterThan(0);
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `cd mobile && npx jest src/shop/__tests__/schedule.test.ts -v`

- [ ] **Step 3: Implement `schedule.ts`** with Bangkok TZ via `Intl` offset parsing; export `ShopSchedule`, `isShopOpen`, `msUntilNextOpen`, `formatCountdown(ms)`.

- [ ] **Step 4: Run test — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add mobile/src/shop/
git commit -m "feat: shop schedule utilities with Bangkok window math"
```

---

### Task 2: Shop types + content API

**Files:**
- Modify: `mobile/src/types/db.ts`
- Create: `mobile/src/api/shop.ts`
- Create: `mobile/src/api/__tests__/shop.test.ts`

- [ ] **Step 1: Add types** `ShopRow`, `MerchItemRow`, `ClaimRow` mirroring `shops`, `merch_items`, `claims`.

- [ ] **Step 2: API functions** `fetchActiveShops()`, `fetchMerchForShop(shopId)`, `claimMerchItem(itemId)`, `listMyClaims()`, `fetchBrandMemberships()`.

- [ ] **Step 3: Unit test** mock supabase for `claimMerchItem` error mapping (`INSUFFICIENT_VOUCHERS`, `OUT_OF_STOCK`).

- [ ] **Step 4: Run** `cd mobile && npm test && npm run typecheck`

- [ ] **Step 5: Commit**

```bash
git add mobile/src/types/db.ts mobile/src/api/shop.ts mobile/src/api/__tests__/shop.test.ts
git commit -m "feat: shop API and DB row types"
```

---

### Task 3: Home merch teaser

**Files:**
- Modify: `mobile/src/app/(tabs)/index.tsx`

- [ ] **Step 1:** Fetch shops on mount; show teaser card below service grid.
- [ ] **Step 2:** Open state → green pill "เปิดอยู่!"; closed → countdown via `formatCountdown`.
- [ ] **Step 3:** Tap navigates to `/merch`.
- [ ] **Step 4:** `npm run typecheck`
- [ ] **Step 5: Commit**

```bash
git add mobile/src/app/(tabs)/index.tsx
git commit -m "feat: home merch pop-up teaser with open/closed state"
```

---

### Task 4: Merch shop screen

**Files:**
- Create: `mobile/src/app/merch/index.tsx`
- Modify: `mobile/src/app/_layout.tsx` (register stack screen)

- [ ] **Step 1:** List merch items for first active shop; show name, voucher price, stock.
- [ ] **Step 2:** Claim button calls `claimMerchItem`; handle errors in Thai (insufficient vouchers, out of stock).
- [ ] **Step 3:** On success navigate to `/merch/claim/[claimId]` with redemption code.
- [ ] **Step 4:** Closed shop shows countdown + disabled grid.
- [ ] **Step 5: Commit**

```bash
git add mobile/src/app/merch/ mobile/src/app/_layout.tsx
git commit -m "feat: pop-up merch shop screen with claim flow"
```

---

### Task 5: Claim detail screen

**Files:**
- Create: `mobile/src/app/merch/claim/[claimId].tsx`

- [ ] **Step 1:** Show redemption code large, instructions from merch item, status.
- [ ] **Step 2:** Link back to vouchers tab.
- [ ] **Step 3: Commit**

```bash
git add mobile/src/app/merch/claim/
git commit -m "feat: merch claim redemption code screen"
```

---

### Task 6: My claims in vouchers tab

**Files:**
- Modify: `mobile/src/app/(tabs)/vouchers.tsx`

- [ ] **Step 1:** Section "ของที่แลกแล้ว" listing claims with codes + status.
- [ ] **Step 2: Commit**

```bash
git add mobile/src/app/(tabs)/vouchers.tsx
git commit -m "feat: show merch claims alongside vouchers"
```

---

### Task 7: Brand mode — gate + redeem scanner

**Files:**
- Create: `mobile/src/app/brand/index.tsx`
- Create: `mobile/src/app/brand/redeem.tsx`
- Modify: `mobile/src/app/(tabs)/profile.tsx`

- [ ] **Step 1:** Profile shows "จัดการร้าน" when `fetchBrandMemberships()` non-empty.
- [ ] **Step 2:** Brand home lists shop stats (item count, claim count).
- [ ] **Step 3:** Redeem screen: text input for code → `supabase.rpc('redeem_claim', { p_code })`.
- [ ] **Step 4: Commit**

```bash
git add mobile/src/app/brand/ mobile/src/app/(tabs)/profile.tsx mobile/src/app/_layout.tsx
git commit -m "feat: brand mode entry and claim redemption for staff"
```

---

### Task 8: Verification + docs

**Files:**
- Modify: `README.md`
- Create: `docs/superpowers/RESUME-merch-shop.md`

- [ ] **Step 1:** `cd mobile && npm run typecheck && npm test`
- [ ] **Step 2:** Manual: home teaser → merch → claim (needs vouchers) → code screen; brand member redeems code.
- [ ] **Step 3: Commit**

```bash
git add README.md docs/superpowers/RESUME-merch-shop.md
git commit -m "docs: merch shop quickstart and resume"
```

---

## Self-Review Notes

- **Spec coverage:** windowed shop surface ✓, voucher-priced claims ✓, `claim_merch` RPC ✓, redemption code display ✓, brand redeem via `redeem_claim` ✓. Brand product editing / Storage uploads deferred (Studio-first for v1; brand screen is stats + redeem only).
- **Dependency order:** 1 → 2 → {3,4} → 5 → 6 → 7 → 8.
