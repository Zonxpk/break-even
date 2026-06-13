# When? (กี่โมง?) App Core + Gag Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the Expo mobile app for the four delivery services — Grab-grade browse/confirm flows, the deterministic client-side gag engine on a real map, the voucher payoff, loyalty tiers, and the tie-in partner form.

**Architecture:** One Expo Router app in `mobile/`. All comedy logic is pure TypeScript in `mobile/src/engine/` — `(script, seed, elapsed, sabotageLog) → state` — so it is unit-tested with Jest and survives app restarts. Screens are thin: a shared OrderFlow (browse → confirm → track → fail → voucher) parameterized by `ServiceConfig`. Supabase is the only backend (sub-project 1, merged): content reads, order inserts, `grant_voucher` RPC, `tiein-submit` Edge Function.

**Tech Stack:** Expo (Expo Router, TypeScript), supabase-js + AsyncStorage, Zustand, react-native-maps (bundled in Expo Go), OSRM public routing with offline fallback, jest-expo.

**Spec:** `docs/superpowers/specs/2026-06-11-when-geemong-design.md` (§5–§8, §11, §13). Backend contract facts the engineer must know:
- `orders` insert grant covers exactly `(user_id, service, items_json, script_id, seed)`; update grant covers `status` only.
- `vouchers` and `claims` are read-only for clients; vouchers are minted by `supabase.rpc('grant_voucher', { p_trigger, p_context })`. The RPC can raise `RATE_LIMITED` (fallback brakes) — the client MUST treat that as a handled, in-character outcome (spec §13 exception).
- Content tables (`catalog_items`, `gag_scripts`, `gag_anchors`, `voucher_campaigns`) are public-read.
- Anonymous guest sign-in is enabled (`supabase.auth.signInAnonymously()`); the signup trigger creates the `profiles` row; `profiles` update grant covers `(nickname, loyalty_xp, tier)`.
- Campaign `hour_range`/`day_of_week` conditions evaluate in Asia/Bangkok time.

**Testing philosophy for this plan:** everything that decides comedy or money (engine, path, route fallback, script picking, balance, voucher context) is pure and TDD'd. Screens are typechecked + one render smoke test + a manual simulator checklist in the final task; they contain no logic beyond wiring.

**Local env:** Supabase runs locally (`supabase start`). iOS simulator reaches it at `http://127.0.0.1:54321`; Android emulator at `http://10.0.2.2:54321`. The anon key comes from `supabase status`.

---

## File Structure

```
mobile/
  app/
    _layout.tsx                 # root stack + auth gate
    sign-in.tsx                 # guest / email auth
    partner.tsx                 # ร่วมเป็นพาร์ทเนอร์ tie-in form (modal)
    (tabs)/
      _layout.tsx               # 4 tabs: หน้าแรก กิจกรรม คูปอง โปรไฟล์
      index.tsx                 # service grid + promo banners
      activity.tsx              # order history (all failures)
      vouchers.tsx              # voucher wallet
      profile.tsx               # account, tier badge, partner link
    order/
      [service]/
        index.tsx               # browse (catalog, Grab-grade)
        confirm.tsx             # ฿0 summary → place order
    track/[orderId].tsx         # the gag: map, ETA, chat, sabotage
    fail/[orderId].tsx          # finale + voucher reveal
  src/
    lib/supabase.ts             # client singleton
    lib/rng.ts                  # mulberry32 seeded RNG
    types/db.ts                 # row types mirroring the schema
    engine/types.ts             # TimelineEvent, GagScript, EngineState
    engine/engine.ts            # engineStateAt — the pure core
    engine/path.ts              # buildDoomedPath + positionAt
    engine/route.ts             # OSRM fetch + deterministic fallback
    engine/pickScript.ts        # weighted script selection
    balance/balance.ts          # XP table, tier thresholds, match rates
    state/auth.ts               # Zustand: session + profile
    api/orders.ts               # placeOrder, failOrder (+ voucher grant)
    api/content.ts              # catalogs, scripts, anchors fetchers
    services/config.ts          # ServiceConfig registry (4 services)
    ui/theme.ts                 # colors, spacing, Thai-first text styles
  src/engine/__tests__/engine.test.ts
  src/engine/__tests__/path.test.ts
  src/engine/__tests__/route.test.ts
  src/engine/__tests__/pickScript.test.ts
  src/balance/__tests__/balance.test.ts
  src/api/__tests__/orders.test.ts
  src/__tests__/home.smoke.test.tsx
  .env.example                  # committed; .env gitignored
```

Conventions: all user-facing strings are Thai, inline (no i18n — spec §1). Pure modules never import react-native. `mobile/` has its own package.json; run all mobile commands from `mobile/`.

---

### Task 1: Expo scaffold + Jest

**Files:**
- Create: `mobile/` (via create-expo-app), `mobile/.env.example`, `mobile/jest.config.js`
- Modify: `.gitignore`, `mobile/package.json`

- [ ] **Step 1: Scaffold**

From repo root:

```bash
npx create-expo-app@latest mobile --template default --no-install
cd mobile && npm install
```

The default template ships Expo Router with an `app/` directory and example screens. Reset the example code:

```bash
node scripts/reset-project.js 2>/dev/null || true   # newer templates ship this; if absent, skip
```

If `reset-project.js` doesn't exist, manually delete example screens so `app/` contains only `_layout.tsx` and `index.tsx` (keep them minimal — they'll be replaced in later tasks).

- [ ] **Step 2: Install dependencies**

```bash
cd mobile
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill react-native-maps
npm install zustand
npx expo install jest-expo jest @types/jest -- --save-dev
npm install --save-dev @testing-library/react-native typescript
```

- [ ] **Step 3: Configure Jest**

Create `mobile/jest.config.js`:

```js
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|@supabase/.*|zustand))',
  ],
};
```

Add to `mobile/package.json` scripts:

```json
"test": "jest",
"typecheck": "tsc --noEmit"
```

- [ ] **Step 4: Env scaffolding**

Create `mobile/.env.example`:

```
# iOS simulator: http://127.0.0.1:54321 — Android emulator: http://10.0.2.2:54321
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=get-from-supabase-status
```

Copy it to `mobile/.env` and fill the anon key from `supabase status` (it is a publishable key — safe in env, but keep .env out of git anyway). Append to the ROOT `.gitignore`:

```gitignore
mobile/.env
```

(`mobile/.gitignore` from the template already ignores node_modules, .expo, etc.)

- [ ] **Step 5: Verify**

```bash
cd mobile && npm run typecheck && npx jest --passWithNoTests
```

Expected: both exit 0. Optionally `npx expo start` and confirm the blank app boots in the simulator.

- [ ] **Step 6: Commit**

```bash
git add mobile .gitignore
git commit -m "chore: scaffold expo app with jest"
```

---

### Task 2: Supabase client, DB types, seeded RNG

**Files:**
- Create: `mobile/src/lib/supabase.ts`, `mobile/src/lib/rng.ts`, `mobile/src/types/db.ts`
- Test: `mobile/src/__tests__/rng.test.ts`

- [ ] **Step 1: Write the failing RNG test**

Create `mobile/src/__tests__/rng.test.ts`:

```ts
import { mulberry32 } from '../lib/rng';

test('same seed yields same sequence', () => {
  const a = mulberry32(42), b = mulberry32(42);
  const seqA = [a(), a(), a()], seqB = [b(), b(), b()];
  expect(seqA).toEqual(seqB);
});

test('different seeds diverge', () => {
  expect(mulberry32(1)()).not.toEqual(mulberry32(2)());
});

test('outputs in [0,1)', () => {
  const r = mulberry32(7);
  for (let i = 0; i < 1000; i++) {
    const v = r();
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThan(1);
  }
});
```

- [ ] **Step 2: Run to verify failure**

```bash
cd mobile && npx jest rng
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `mobile/src/lib/rng.ts`:

```ts
// Deterministic 32-bit PRNG. The gag engine's whole resume-after-restart
// promise rests on this being stable across platforms — do not swap for
// Math.random.
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

Create `mobile/src/lib/supabase.ts`:

```ts
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !anonKey) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY — copy .env.example to .env');
}

export const supabase = createClient(url, anonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

Create `mobile/src/types/db.ts` (mirrors sub-project 1's schema):

```ts
export type Service = 'food' | 'ride' | 'parcel' | 'mart';
export type Tier = 'silver' | 'gold' | 'platinum' | 'vip';

export interface Profile {
  id: string;
  nickname: string | null;
  loyalty_xp: number;
  tier: Tier;
}

export interface CatalogItem {
  id: string;
  service: Service;
  name: string;
  photo_url: string | null;
  price: number;
  rating: number | null;
  tie_in_brand_id: string | null;
  active: boolean;
  sort: number;
}

export interface GagScriptRow {
  id: string;
  service: Service | 'date' | null; // null = any service
  timeline: import('../engine/types').GagScript;
  weight: number;
  active: boolean;
  season_tag: string | null;
}

export type AnchorType = 'canal' | 'seven_eleven' | 'temple' | 'market';

export interface GagAnchor {
  id: string;
  type: AnchorType;
  name: string;
  lat: number;
  lng: number;
}

export type OrderStatus = 'tracking' | 'failed_hilariously' | 'cancelled';

export interface OrderRow {
  id: string;
  user_id: string;
  service: Service | 'date';
  items_json: unknown[];
  script_id: string;
  seed: number;
  status: OrderStatus;
  created_at: string;
}

export interface VoucherRow {
  id: string;
  user_id: string;
  campaign_id: string;
  code: string | null;
  status: 'active' | 'spent' | 'redeemed' | 'expired';
  context: Record<string, unknown>;
  granted_at: string;
}

export interface VoucherCampaign {
  id: string;
  brand_id: string | null;
  title: string;
  image_url: string | null;
  terms: string | null;
  redeem_info: string | null;
  is_fallback: boolean;
}
```

- [ ] **Step 4: Verify**

```bash
cd mobile && npx jest rng && npm run typecheck
```

Expected: 3 tests pass; typecheck clean.

- [ ] **Step 5: Commit**

```bash
git add mobile/src
git commit -m "feat: supabase client, db types, seeded rng"
```

---

### Task 3: Balance table (XP, tiers, match rates)

**Files:**
- Create: `mobile/src/balance/balance.ts`
- Test: `mobile/src/balance/__tests__/balance.test.ts`

- [ ] **Step 1: Write the failing test**

Create `mobile/src/balance/__tests__/balance.test.ts`:

```ts
import { TIERS, XP, MATCH_BASE, TIER_MATCH_MULT, MATCH_CAP, tierForXp, matchChance } from '../balance';

test('tier thresholds are strictly monotonic from 0', () => {
  expect(TIERS[0].minXp).toBe(0);
  for (let i = 1; i < TIERS.length; i++) {
    expect(TIERS[i].minXp).toBeGreaterThan(TIERS[i - 1].minXp);
  }
});

test('tierForXp picks the highest threshold reached', () => {
  expect(tierForXp(0)).toBe('silver');
  expect(tierForXp(TIERS[1].minXp)).toBe('gold');
  expect(tierForXp(TIERS[3].minXp + 9999)).toBe('vip');
  expect(tierForXp(TIERS[1].minXp - 1)).toBe('silver');
});

test('all XP grants are positive', () => {
  Object.values(XP).forEach((v) => expect(v).toBeGreaterThan(0));
});

test('match chance stays within (0, cap] for every tier × rarity', () => {
  (['silver', 'gold', 'platinum', 'vip'] as const).forEach((tier) => {
    (['common', 'rare', 'legendary'] as const).forEach((rarity) => {
      const c = matchChance(tier, rarity);
      expect(c).toBeGreaterThan(0);
      expect(c).toBeLessThanOrEqual(MATCH_CAP[rarity]);
    });
  });
});

test('higher tier never lowers match chance', () => {
  const order = ['silver', 'gold', 'platinum', 'vip'] as const;
  (['common', 'rare', 'legendary'] as const).forEach((rarity) => {
    for (let i = 1; i < order.length; i++) {
      expect(matchChance(order[i], rarity)).toBeGreaterThanOrEqual(matchChance(order[i - 1], rarity));
    }
  });
});

test('legendary stays special even for VIP', () => {
  expect(matchChance('vip', 'legendary')).toBeLessThanOrEqual(0.3);
});
```

- [ ] **Step 2: Run to verify failure**

```bash
cd mobile && npx jest balance
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `mobile/src/balance/balance.ts`:

```ts
import type { Tier } from '../types/db';

// ── BALANCE TABLE ───────────────────────────────────────────────────────────
// Tuning values, not architecture (spec §8). Adjust in playtesting; the tests
// only pin invariants (monotonic tiers, capped match rates), not the numbers.

export const XP = {
  order_failed: 25,
  date_ghosted: 40,
  story_beat: 10,
  daily_checkin: 5,
  swipe_rejected: 2,
} as const;

export const TIERS: ReadonlyArray<{ tier: Tier; minXp: number }> = [
  { tier: 'silver', minXp: 0 },
  { tier: 'gold', minXp: 200 },
  { tier: 'platinum', minXp: 600 },
  { tier: 'vip', minXp: 1500 },
];

export type Rarity = 'common' | 'rare' | 'legendary';

export const MATCH_BASE: Record<Rarity, number> = { common: 0.7, rare: 0.25, legendary: 0.03 };
export const TIER_MATCH_MULT: Record<Tier, number> = { silver: 1, gold: 1.3, platinum: 1.7, vip: 2.2 };
export const MATCH_CAP: Record<Rarity, number> = { common: 0.95, rare: 0.6, legendary: 0.3 };

export function tierForXp(xp: number): Tier {
  let current: Tier = 'silver';
  for (const t of TIERS) if (xp >= t.minXp) current = t.tier;
  return current;
}

export function matchChance(tier: Tier, rarity: Rarity): number {
  return Math.min(MATCH_BASE[rarity] * TIER_MATCH_MULT[tier], MATCH_CAP[rarity]);
}
```

- [ ] **Step 4: Verify**

```bash
cd mobile && npx jest balance
```

Expected: 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add mobile/src/balance
git commit -m "feat: balance table — xp, tiers, match rates"
```

---

### Task 4: Gag engine core

**Files:**
- Create: `mobile/src/engine/types.ts`, `mobile/src/engine/engine.ts`
- Test: `mobile/src/engine/__tests__/engine.test.ts`

- [ ] **Step 1: Define the types**

Create `mobile/src/engine/types.ts` (mirrors the `gag_scripts.timeline` JSON schema documented in migration `20260611000002_content_tables.sql`):

```ts
export type MoveMode = 'route_to_user' | 'wrong_turn' | 'wrong_direction';

export type TimelineEvent =
  | { t: number; type: 'eta'; minutes: number }
  | { t: number; type: 'move'; mode: MoveMode }
  | { t: number; type: 'chat'; text: string }
  | { t: number; type: 'incident'; kind: string; anchor?: string; eta_minutes?: number }
  | {
      t: number;
      type: 'sabotage';
      action: string;
      label: string;
      backfire: { chat?: string; move?: MoveMode; eta_minutes?: number };
    }
  | { t: number; type: 'finale'; kind: string; anchor?: string; status_text: string };

export interface GagScript {
  duration_s: number;
  events: TimelineEvent[];
}

export interface SabotageAction {
  action: string;
  atS: number; // elapsed seconds when the user tapped it
}

export interface ChatMessage {
  text: string;
  atS: number;
}

export interface EngineState {
  phase: 'tracking' | 'failed';
  etaMinutes: number;
  chat: ChatMessage[];
  currentMove: MoveMode;
  incident: { kind: string; anchor?: string } | null;
  // sabotage button currently offered (null once used or after finale)
  activeSabotage: { action: string; label: string } | null;
  finale: { kind: string; anchor?: string; statusText: string } | null;
  progress: number; // 0..1 of duration
}
```

- [ ] **Step 2: Write the failing tests**

Create `mobile/src/engine/__tests__/engine.test.ts`:

```ts
import { engineStateAt } from '../engine';
import type { GagScript } from '../types';

const SCRIPT: GagScript = {
  duration_s: 240,
  events: [
    { t: 0, type: 'eta', minutes: 14 },
    { t: 0, type: 'move', mode: 'route_to_user' },
    { t: 40, type: 'move', mode: 'wrong_turn' },
    { t: 45, type: 'chat', text: 'พี่ขับผ่านซอยไปนิดนึงครับ' },
    { t: 90, type: 'incident', kind: 'sleepy', anchor: 'seven_eleven', eta_minutes: 45 },
    {
      t: 90, type: 'sabotage', action: 'call', label: 'โทรปลุกไรเดอร์',
      backfire: { chat: 'ใกล้ถึงแล้วครับพี่', move: 'wrong_direction', eta_minutes: 87 },
    },
    { t: 210, type: 'finale', kind: 'canal', anchor: 'canal', status_text: 'ไรเดอร์ตกคลอง' },
  ],
};

test('state is a pure function of elapsed time', () => {
  const a = engineStateAt({ script: SCRIPT, elapsedS: 100, sabotageLog: [] });
  const b = engineStateAt({ script: SCRIPT, elapsedS: 100, sabotageLog: [] });
  expect(a).toEqual(b);
});

test('start: normal-looking tracking', () => {
  const s = engineStateAt({ script: SCRIPT, elapsedS: 5, sabotageLog: [] });
  expect(s.phase).toBe('tracking');
  expect(s.etaMinutes).toBe(14);
  expect(s.currentMove).toBe('route_to_user');
  expect(s.chat).toHaveLength(0);
  expect(s.activeSabotage).toBeNull();
});

test('mid-run: incident applied, ETA grown, sabotage offered', () => {
  const s = engineStateAt({ script: SCRIPT, elapsedS: 100, sabotageLog: [] });
  expect(s.incident?.kind).toBe('sleepy');
  expect(s.etaMinutes).toBe(45);
  expect(s.currentMove).toBe('wrong_turn');
  expect(s.chat.map((c) => c.text)).toEqual(['พี่ขับผ่านซอยไปนิดนึงครับ']);
  expect(s.activeSabotage).toEqual({ action: 'call', label: 'โทรปลุกไรเดอร์' });
});

test('sabotage backfires: chat appended chronologically, ETA worsens, move overridden', () => {
  const s = engineStateAt({ script: SCRIPT, elapsedS: 120, sabotageLog: [{ action: 'call', atS: 110 }] });
  expect(s.chat.map((c) => c.text)).toEqual(['พี่ขับผ่านซอยไปนิดนึงครับ', 'ใกล้ถึงแล้วครับพี่']);
  expect(s.etaMinutes).toBe(87);
  expect(s.currentMove).toBe('wrong_direction');
  expect(s.activeSabotage).toBeNull(); // used up
});

test('sabotage not yet taken at queried time has no effect', () => {
  const s = engineStateAt({ script: SCRIPT, elapsedS: 100, sabotageLog: [{ action: 'call', atS: 110 }] });
  expect(s.etaMinutes).toBe(45);
  expect(s.activeSabotage).not.toBeNull();
});

test('finale fires and ends the run', () => {
  const s = engineStateAt({ script: SCRIPT, elapsedS: 239, sabotageLog: [] });
  expect(s.phase).toBe('failed');
  expect(s.finale).toEqual({ kind: 'canal', anchor: 'canal', statusText: 'ไรเดอร์ตกคลอง' });
  expect(s.activeSabotage).toBeNull();
});

test('every event eventually reaches a finale at duration end', () => {
  const s = engineStateAt({ script: SCRIPT, elapsedS: SCRIPT.duration_s + 1, sabotageLog: [] });
  expect(s.phase).toBe('failed');
  expect(s.progress).toBe(1);
});
```

- [ ] **Step 3: Run to verify failure**

```bash
cd mobile && npx jest engine.test
```

Expected: FAIL — `engine` module not found.

- [ ] **Step 4: Implement**

Create `mobile/src/engine/engine.ts`:

```ts
import type { EngineState, GagScript, SabotageAction, TimelineEvent } from './types';

interface EngineInput {
  script: GagScript;
  elapsedS: number;
  sabotageLog: SabotageAction[];
}

// The heart of the joke: a pure fold over (baseline events ≤ t) merged with
// (user sabotage actions ≤ t), in chronological order. Reopening the app at
// any elapsed time reproduces the exact same doomed journey.
export function engineStateAt({ script, elapsedS, sabotageLog }: EngineInput): EngineState {
  const state: EngineState = {
    phase: 'tracking',
    etaMinutes: 0,
    chat: [],
    currentMove: 'route_to_user',
    incident: null,
    activeSabotage: null,
    finale: null,
    progress: Math.min(elapsedS / script.duration_s, 1),
  };

  const sabotageDefs = new Map(
    script.events
      .filter((e): e is Extract<TimelineEvent, { type: 'sabotage' }> => e.type === 'sabotage')
      .map((e) => [e.action, e]),
  );

  type Step =
    | { atS: number; kind: 'event'; event: TimelineEvent }
    | { atS: number; kind: 'backfire'; action: string };

  const steps: Step[] = [
    ...script.events.filter((e) => e.t <= elapsedS).map((e) => ({ atS: e.t, kind: 'event' as const, event: e })),
    ...sabotageLog.filter((s) => s.atS <= elapsedS).map((s) => ({ atS: s.atS, kind: 'backfire' as const, action: s.action })),
  ].sort((a, b) => a.atS - b.atS);

  for (const step of steps) {
    if (state.phase === 'failed') break;
    if (step.kind === 'event') {
      const ev = step.event;
      switch (ev.type) {
        case 'eta':
          state.etaMinutes = ev.minutes;
          break;
        case 'move':
          state.currentMove = ev.mode;
          break;
        case 'chat':
          state.chat.push({ text: ev.text, atS: ev.t });
          break;
        case 'incident':
          state.incident = { kind: ev.kind, anchor: ev.anchor };
          if (ev.eta_minutes != null) state.etaMinutes = ev.eta_minutes;
          break;
        case 'sabotage':
          state.activeSabotage = { action: ev.action, label: ev.label };
          break;
        case 'finale':
          state.finale = { kind: ev.kind, anchor: ev.anchor, statusText: ev.status_text };
          state.phase = 'failed';
          state.activeSabotage = null;
          break;
      }
    } else {
      const def = sabotageDefs.get(step.action);
      if (!def) continue;
      if (def.backfire.chat) state.chat.push({ text: def.backfire.chat, atS: step.atS });
      if (def.backfire.move) state.currentMove = def.backfire.move;
      if (def.backfire.eta_minutes != null) state.etaMinutes = def.backfire.eta_minutes;
      if (state.activeSabotage?.action === step.action) state.activeSabotage = null;
    }
  }

  return state;
}
```

- [ ] **Step 5: Verify**

```bash
cd mobile && npx jest engine.test
```

Expected: 7 tests pass.

- [ ] **Step 6: Commit**

```bash
git add mobile/src/engine
git commit -m "feat: deterministic gag engine core"
```

---

### Task 5: Doomed path (map keyframes + interpolation)

**Files:**
- Create: `mobile/src/engine/path.ts`
- Test: `mobile/src/engine/__tests__/path.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `mobile/src/engine/__tests__/path.test.ts`:

```ts
import { buildDoomedPath, positionAt, nearestAnchor } from '../path';
import type { GagScript } from '../types';
import type { GagAnchor } from '../../types/db';

const ANCHORS: GagAnchor[] = [
  { id: '1', type: 'canal', name: 'คลอง', lat: 13.75, lng: 100.54 },
  { id: '2', type: 'seven_eleven', name: '7-11', lat: 13.76, lng: 100.50 },
];

const BASE = [
  { lat: 13.70, lng: 100.50 },
  { lat: 13.72, lng: 100.51 },
  { lat: 13.74, lng: 100.52 },
];

const SCRIPT: GagScript = {
  duration_s: 100,
  events: [
    { t: 0, type: 'move', mode: 'route_to_user' },
    { t: 50, type: 'incident', kind: 'sleepy', anchor: 'seven_eleven' },
    { t: 90, type: 'finale', kind: 'canal', anchor: 'canal', status_text: 'x' },
  ],
};

test('nearestAnchor picks the closest of the requested type', () => {
  const a = nearestAnchor(ANCHORS, 'canal', { lat: 13.74, lng: 100.52 });
  expect(a?.id).toBe('1');
  expect(nearestAnchor(ANCHORS, 'temple', { lat: 0, lng: 0 })).toBeNull();
});

test('path starts at route start and ends at the finale anchor', () => {
  const path = buildDoomedPath({ base: BASE, script: SCRIPT, anchors: ANCHORS, seed: 7 });
  expect(path[0].pos).toEqual(BASE[0]);
  const last = path[path.length - 1];
  expect(last.f).toBe(1);
  expect(last.pos).toEqual({ lat: 13.75, lng: 100.54 }); // canal anchor
});

test('incident parks the rider at its anchor', () => {
  const path = buildDoomedPath({ base: BASE, script: SCRIPT, anchors: ANCHORS, seed: 7 });
  const atIncident = positionAt(path, 0.5);
  expect(atIncident.lat).toBeCloseTo(13.76, 5);
  expect(atIncident.lng).toBeCloseTo(100.5, 5);
});

test('positionAt interpolates between keyframes and clamps', () => {
  const path = buildDoomedPath({ base: BASE, script: SCRIPT, anchors: ANCHORS, seed: 7 });
  expect(positionAt(path, -1)).toEqual(path[0].pos);
  expect(positionAt(path, 2)).toEqual(path[path.length - 1].pos);
  const mid = positionAt(path, 0.25);
  expect(Number.isFinite(mid.lat)).toBe(true);
  expect(Number.isFinite(mid.lng)).toBe(true);
});

test('same seed → same path; different seed may differ', () => {
  const p1 = buildDoomedPath({ base: BASE, script: SCRIPT, anchors: ANCHORS, seed: 7 });
  const p2 = buildDoomedPath({ base: BASE, script: SCRIPT, anchors: ANCHORS, seed: 7 });
  expect(p1).toEqual(p2);
});
```

- [ ] **Step 2: Run to verify failure**

```bash
cd mobile && npx jest path.test
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `mobile/src/engine/path.ts`:

```ts
import { mulberry32 } from '../lib/rng';
import type { GagAnchor, AnchorType } from '../types/db';
import type { GagScript } from './types';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Keyframe {
  f: number; // fraction of script duration, 0..1
  pos: LatLng;
}

// Equirectangular approximation — plenty for "mood over accuracy" (spec).
function dist2(a: LatLng, b: LatLng): number {
  const dx = (a.lng - b.lng) * Math.cos(((a.lat + b.lat) / 2) * (Math.PI / 180));
  const dy = a.lat - b.lat;
  return dx * dx + dy * dy;
}

export function nearestAnchor(anchors: GagAnchor[], type: AnchorType | string, ref: LatLng): GagAnchor | null {
  const pool = anchors.filter((a) => a.type === type);
  if (pool.length === 0) return null;
  return pool.reduce((best, a) =>
    dist2({ lat: a.lat, lng: a.lng }, ref) < dist2({ lat: best.lat, lng: best.lng }, ref) ? a : best,
  );
}

function alongRoute(base: LatLng[], frac: number): LatLng {
  if (base.length === 0) return { lat: 0, lng: 0 };
  const idx = Math.min(base.length - 1, Math.max(0, frac) * (base.length - 1));
  const lo = Math.floor(idx);
  const hi = Math.min(base.length - 1, lo + 1);
  const t = idx - lo;
  return {
    lat: base[lo].lat + (base[hi].lat - base[lo].lat) * t,
    lng: base[lo].lng + (base[hi].lng - base[lo].lng) * t,
  };
}

// Build the rider's doomed journey as keyframes over the script duration.
// Movement intent comes from the script's move/incident/finale events; the
// real route supplies plausible geometry for the early, hopeful phase.
export function buildDoomedPath(opts: {
  base: LatLng[];
  script: GagScript;
  anchors: GagAnchor[];
  seed: number;
}): Keyframe[] {
  const { base, script, anchors, seed } = opts;
  const rnd = mulberry32(seed);
  const frames: Keyframe[] = [{ f: 0, pos: base[0] ?? { lat: 13.7563, lng: 100.5018 } }];
  let routeProgress = 0; // how far along the real route the rider got (0..1)

  const timed = [...script.events].sort((a, b) => a.t - b.t);
  for (const ev of timed) {
    const f = Math.min(ev.t / script.duration_s, 1);
    if (ev.type === 'move') {
      if (ev.mode === 'route_to_user') {
        routeProgress = Math.min(routeProgress + 0.5 + rnd() * 0.2, 0.85);
        frames.push({ f: Math.min(f + 0.15, 0.98), pos: alongRoute(base, routeProgress) });
      } else {
        // wrong_turn / wrong_direction: drift off-route with seeded jitter
        const off = alongRoute(base, routeProgress);
        frames.push({
          f: Math.min(f + 0.1, 0.98),
          pos: { lat: off.lat + (rnd() - 0.5) * 0.02, lng: off.lng + (rnd() - 0.5) * 0.02 },
        });
      }
    } else if (ev.type === 'incident' && ev.anchor) {
      const ref = frames[frames.length - 1].pos;
      const a = nearestAnchor(anchors, ev.anchor, ref);
      if (a) {
        frames.push({ f, pos: { lat: a.lat, lng: a.lng } });
        // park there for a beat (sleepy rider)
        frames.push({ f: Math.min(f + 0.12, 0.99), pos: { lat: a.lat, lng: a.lng } });
      }
    } else if (ev.type === 'finale') {
      const ref = frames[frames.length - 1].pos;
      const a = ev.anchor ? nearestAnchor(anchors, ev.anchor, ref) : null;
      frames.push({ f: 1, pos: a ? { lat: a.lat, lng: a.lng } : ref });
    }
  }

  if (frames[frames.length - 1].f !== 1) frames.push({ f: 1, pos: frames[frames.length - 1].pos });
  return frames;
}

export function positionAt(path: Keyframe[], f: number): LatLng {
  const clamped = Math.min(Math.max(f, 0), 1);
  let prev = path[0];
  for (const kf of path) {
    if (kf.f >= clamped) {
      const span = kf.f - prev.f;
      const t = span === 0 ? 1 : (clamped - prev.f) / span;
      return {
        lat: prev.pos.lat + (kf.pos.lat - prev.pos.lat) * t,
        lng: prev.pos.lng + (kf.pos.lng - prev.pos.lng) * t,
      };
    }
    prev = kf;
  }
  return path[path.length - 1].pos;
}
```

- [ ] **Step 4: Verify**

```bash
cd mobile && npx jest path.test
```

Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add mobile/src/engine
git commit -m "feat: doomed path keyframes and interpolation"
```

---

### Task 6: Route layer (OSRM + fallback) and script picking

**Files:**
- Create: `mobile/src/engine/route.ts`, `mobile/src/engine/pickScript.ts`
- Test: `mobile/src/engine/__tests__/route.test.ts`, `mobile/src/engine/__tests__/pickScript.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `mobile/src/engine/__tests__/route.test.ts`:

```ts
import { fetchRoute, fallbackRoute } from '../route';

afterEach(() => jest.restoreAllMocks());

const FROM = { lat: 13.70, lng: 100.50 };
const TO = { lat: 13.75, lng: 100.55 };

test('parses OSRM geojson into latlng list', async () => {
  jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => ({
      routes: [{ geometry: { coordinates: [[100.50, 13.70], [100.52, 13.72], [100.55, 13.75]] } }],
    }),
  } as Response);
  const route = await fetchRoute(FROM, TO);
  expect(route).toEqual([
    { lat: 13.70, lng: 100.50 },
    { lat: 13.72, lng: 100.52 },
    { lat: 13.75, lng: 100.55 },
  ]);
});

test('falls back when OSRM errors', async () => {
  jest.spyOn(global, 'fetch').mockRejectedValue(new Error('down'));
  const route = await fetchRoute(FROM, TO);
  expect(route.length).toBeGreaterThanOrEqual(2);
  expect(route[0]).toEqual(FROM);
  expect(route[route.length - 1]).toEqual(TO);
});

test('falls back on non-ok response', async () => {
  jest.spyOn(global, 'fetch').mockResolvedValue({ ok: false } as Response);
  const route = await fetchRoute(FROM, TO);
  expect(route[0]).toEqual(FROM);
});

test('fallbackRoute is deterministic and wandery', () => {
  const a = fallbackRoute(FROM, TO, 42);
  const b = fallbackRoute(FROM, TO, 42);
  expect(a).toEqual(b);
  expect(a.length).toBeGreaterThan(4); // not a straight line
});
```

Create `mobile/src/engine/__tests__/pickScript.test.ts`:

```ts
import { pickScript } from '../pickScript';
import type { GagScriptRow } from '../../types/db';

const mk = (id: string, service: GagScriptRow['service'], weight: number, active = true): GagScriptRow =>
  ({ id, service, weight, active, timeline: { duration_s: 10, events: [] }, season_tag: null });

test('only considers active scripts matching the service (null = any)', () => {
  const scripts = [mk('a', 'food', 1), mk('b', 'ride', 1), mk('c', null, 1), mk('d', 'food', 1, false)];
  for (let seed = 0; seed < 50; seed++) {
    const picked = pickScript(scripts, 'food', seed);
    expect(['a', 'c']).toContain(picked.id);
  }
});

test('same seed picks the same script', () => {
  const scripts = [mk('a', 'food', 1), mk('b', null, 3)];
  expect(pickScript(scripts, 'food', 123).id).toBe(pickScript(scripts, 'food', 123).id);
});

test('weight skews selection', () => {
  const scripts = [mk('a', null, 1), mk('b', null, 99)];
  let bCount = 0;
  for (let seed = 0; seed < 200; seed++) if (pickScript(scripts, 'food', seed).id === 'b') bCount++;
  expect(bCount).toBeGreaterThan(150);
});

test('throws when the pool is empty', () => {
  expect(() => pickScript([mk('a', 'ride', 1)], 'food', 1)).toThrow('NO_SCRIPT_AVAILABLE');
});
```

- [ ] **Step 2: Run to verify failure**

```bash
cd mobile && npx jest route.test pickScript
```

Expected: FAIL — modules not found.

- [ ] **Step 3: Implement**

Create `mobile/src/engine/route.ts`:

```ts
import { mulberry32 } from '../lib/rng';
import type { LatLng } from './path';

const OSRM = 'https://router.project-osrm.org/route/v1/driving';

// Real roads make the joke land (spec §6: "real roads, fake fate"). When OSRM
// is down we degrade to a seeded zigzag that still wanders convincingly.
export async function fetchRoute(from: LatLng, to: LatLng, seed = 1): Promise<LatLng[]> {
  try {
    const res = await fetch(
      `${OSRM}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`,
    );
    if (!res.ok) throw new Error(`osrm ${('status' in res && (res as Response).status) || 'error'}`);
    const j = await res.json();
    const coords: [number, number][] = j.routes[0].geometry.coordinates;
    return coords.map(([lng, lat]) => ({ lat, lng }));
  } catch {
    return fallbackRoute(from, to, seed);
  }
}

export function fallbackRoute(from: LatLng, to: LatLng, seed: number): LatLng[] {
  const rnd = mulberry32(seed);
  const points: LatLng[] = [from];
  const STEPS = 8;
  for (let i = 1; i < STEPS; i++) {
    const t = i / STEPS;
    points.push({
      lat: from.lat + (to.lat - from.lat) * t + (rnd() - 0.5) * 0.006,
      lng: from.lng + (to.lng - from.lng) * t + (rnd() - 0.5) * 0.006,
    });
  }
  points.push(to);
  return points;
}
```

Create `mobile/src/engine/pickScript.ts`:

```ts
import { mulberry32 } from '../lib/rng';
import type { GagScriptRow, Service } from '../types/db';

export function pickScript(scripts: GagScriptRow[], service: Service | 'date', seed: number): GagScriptRow {
  const pool = scripts.filter((s) => s.active && (s.service == null || s.service === service));
  if (pool.length === 0) throw new Error('NO_SCRIPT_AVAILABLE');
  const total = pool.reduce((sum, s) => sum + Math.max(s.weight, 1), 0);
  let r = mulberry32(seed)() * total;
  for (const s of pool) {
    r -= Math.max(s.weight, 1);
    if (r <= 0) return s;
  }
  return pool[pool.length - 1];
}
```

- [ ] **Step 4: Verify**

```bash
cd mobile && npx jest route.test pickScript
```

Expected: 8 tests pass.

- [ ] **Step 5: Commit**

```bash
git add mobile/src/engine
git commit -m "feat: osrm route with seeded fallback, weighted script picking"
```

---

### Task 7: Auth store + sign-in screen + root layout

**Files:**
- Create: `mobile/src/state/auth.ts`, `mobile/app/sign-in.tsx`, `mobile/src/ui/theme.ts`
- Modify: `mobile/app/_layout.tsx`
- Test: `mobile/src/__tests__/auth.test.ts`

- [ ] **Step 1: Write the failing store test**

Create `mobile/src/__tests__/auth.test.ts`:

```ts
import { act } from '@testing-library/react-native';

jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signInAnonymously: jest.fn().mockResolvedValue({ data: { user: { id: 'u1' } }, error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: { user: { id: 'u1' } }, error: null }),
      signUp: jest.fn().mockResolvedValue({ data: { user: { id: 'u1' } }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'u1', nickname: 'ทดสอบ', loyalty_xp: 30, tier: 'silver' },
            error: null,
          }),
        }),
      }),
    }),
  },
}));

import { useAuth } from '../state/auth';

test('guest sign-in loads the profile', async () => {
  await act(async () => {
    await useAuth.getState().signInGuest('ทดสอบ');
  });
  expect(useAuth.getState().profile?.nickname).toBe('ทดสอบ');
  expect(useAuth.getState().userId).toBe('u1');
});

test('signOut clears state', async () => {
  await act(async () => {
    await useAuth.getState().signOut();
  });
  expect(useAuth.getState().userId).toBeNull();
  expect(useAuth.getState().profile).toBeNull();
});
```

- [ ] **Step 2: Run to verify failure**

```bash
cd mobile && npx jest auth.test
```

Expected: FAIL — `state/auth` not found.

- [ ] **Step 3: Implement the store**

Create `mobile/src/state/auth.ts`:

```ts
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/db';

interface AuthState {
  userId: string | null;
  profile: Profile | null;
  loading: boolean;
  init: () => Promise<void>;
  signInGuest: (nickname: string) => Promise<void>;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (email: string, password: string, nickname: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

async function loadProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
  return (data as Profile) ?? null;
}

export const useAuth = create<AuthState>((set, get) => ({
  userId: null,
  profile: null,
  loading: true,

  init: async () => {
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user.id ?? null;
    set({ userId, profile: userId ? await loadProfile(userId) : null, loading: false });
    supabase.auth.onAuthStateChange((_event, session) => {
      const id = session?.user.id ?? null;
      set({ userId: id });
      if (id) loadProfile(id).then((profile) => set({ profile }));
      else set({ profile: null });
    });
  },

  signInGuest: async (nickname) => {
    const { data, error } = await supabase.auth.signInAnonymously({ options: { data: { nickname } } });
    if (error) throw error;
    const userId = data.user!.id;
    set({ userId, profile: await loadProfile(userId), loading: false });
  },

  signInEmail: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const userId = data.user!.id;
    set({ userId, profile: await loadProfile(userId), loading: false });
  },

  signUpEmail: async (email, password, nickname) => {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { nickname } } });
    if (error) throw error;
    const userId = data.user!.id;
    set({ userId, profile: await loadProfile(userId), loading: false });
  },

  refreshProfile: async () => {
    const { userId } = get();
    if (userId) set({ profile: await loadProfile(userId) });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ userId: null, profile: null });
  },
}));
```

- [ ] **Step 4: Verify the store test passes**

```bash
cd mobile && npx jest auth.test
```

Expected: 2 tests pass.

- [ ] **Step 5: Theme + screens**

Create `mobile/src/ui/theme.ts`:

```ts
// Grab-grade production look: confident green, clean whites. The realism IS
// the setup for the joke (spec §2.1).
export const theme = {
  green: '#00B14F',
  greenDark: '#009245',
  bg: '#FFFFFF',
  surface: '#F7F7F7',
  text: '#1C1C1C',
  textMuted: '#707070',
  danger: '#E5484D',
  gold: '#D4A017',
  radius: 12,
  pad: 16,
} as const;
```

Replace `mobile/app/_layout.tsx`:

```tsx
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuth } from '../src/state/auth';

export default function RootLayout() {
  const { userId, loading, init } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (loading) return;
    const onAuthScreen = segments[0] === 'sign-in';
    if (!userId && !onAuthScreen) router.replace('/sign-in');
    if (userId && onAuthScreen) router.replace('/');
  }, [userId, loading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="partner" options={{ presentation: 'modal', headerShown: true, title: 'ร่วมเป็นพาร์ทเนอร์' }} />
    </Stack>
  );
}
```

Create `mobile/app/sign-in.tsx`:

```tsx
import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../src/state/auth';
import { theme } from '../src/ui/theme';

export default function SignIn() {
  const { signInGuest, signInEmail, signUpEmail } = useAuth();
  const [mode, setMode] = useState<'guest' | 'email'>('guest');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } catch (e: unknown) {
      Alert.alert('เข้าสู่ระบบไม่สำเร็จ', e instanceof Error ? e.message : 'ลองใหม่อีกครั้ง');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={s.root}>
      <Text style={s.logo}>เมื่อไหร่จะถึง?</Text>
      <Text style={s.brand}>When? — ส่งทุกอย่าง ถึงสักวัน</Text>

      {mode === 'guest' ? (
        <>
          <TextInput style={s.input} placeholder="ชื่อเล่นของคุณ" value={nickname} onChangeText={setNickname} />
          <Pressable
            style={[s.btn, busy && s.btnDisabled]}
            disabled={busy || nickname.trim().length === 0}
            onPress={() => run(() => signInGuest(nickname.trim()))}
          >
            <Text style={s.btnText}>เริ่มเลย (ไม่ต้องสมัคร)</Text>
          </Pressable>
          <Pressable onPress={() => setMode('email')}>
            <Text style={s.link}>หรือใช้อีเมล</Text>
          </Pressable>
        </>
      ) : (
        <>
          <TextInput style={s.input} placeholder="อีเมล" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <TextInput style={s.input} placeholder="รหัสผ่าน" secureTextEntry value={password} onChangeText={setPassword} />
          <Pressable style={[s.btn, busy && s.btnDisabled]} disabled={busy} onPress={() => run(() => signInEmail(email.trim(), password))}>
            <Text style={s.btnText}>เข้าสู่ระบบ</Text>
          </Pressable>
          <Pressable disabled={busy} onPress={() => run(() => signUpEmail(email.trim(), password, email.split('@')[0]))}>
            <Text style={s.link}>สมัครใหม่ด้วยอีเมลนี้</Text>
          </Pressable>
          <Pressable onPress={() => setMode('guest')}>
            <Text style={s.link}>กลับไปแบบไม่สมัคร</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: theme.bg, gap: 12 },
  logo: { fontSize: 40, fontWeight: '800', color: theme.green, textAlign: 'center' },
  brand: { fontSize: 14, color: theme.textMuted, textAlign: 'center', marginBottom: 24 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: theme.radius, padding: 14, fontSize: 16 },
  btn: { backgroundColor: theme.green, borderRadius: theme.radius, padding: 16, alignItems: 'center' },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  link: { color: theme.green, textAlign: 'center', padding: 8 },
});
```

- [ ] **Step 6: Verify**

```bash
cd mobile && npm run typecheck && npx jest auth.test
```

Expected: clean + 2 pass. (`(tabs)` doesn't exist yet — if typecheck/router complains about the missing group, create a placeholder `mobile/app/(tabs)/_layout.tsx` exporting an empty `<Stack />`... do NOT — Task 8 creates it next; instead temporarily keep the template's `app/index.tsx` as a stub and ignore the router warning, or implement Task 8 before manual boot. Typecheck does not validate route existence, so this passes.)

- [ ] **Step 7: Commit**

```bash
git add mobile/app mobile/src
git commit -m "feat: auth store, sign-in screen, root layout gate"
```

---

### Task 8: Tab shell + home service grid

**Files:**
- Create: `mobile/app/(tabs)/_layout.tsx`, `mobile/app/(tabs)/index.tsx`, `mobile/app/(tabs)/activity.tsx` (stub), `mobile/app/(tabs)/vouchers.tsx` (stub), `mobile/app/(tabs)/profile.tsx` (stub), `mobile/src/api/content.ts`
- Delete: `mobile/app/index.tsx` (template leftover, replaced by the tabs group)
- Test: `mobile/src/__tests__/home.smoke.test.tsx`

- [ ] **Step 1: Content API**

Create `mobile/src/api/content.ts`:

```ts
import { supabase } from '../lib/supabase';
import type { CatalogItem, GagAnchor, GagScriptRow, Service, VoucherCampaign } from '../types/db';

export async function fetchCatalog(service: Service): Promise<CatalogItem[]> {
  const { data, error } = await supabase
    .from('catalog_items')
    .select('*')
    .eq('service', service)
    .eq('active', true)
    .order('sort');
  if (error) throw error;
  return data as CatalogItem[];
}

export async function fetchScripts(): Promise<GagScriptRow[]> {
  const { data, error } = await supabase.from('gag_scripts').select('*').eq('active', true);
  if (error) throw error;
  return data as GagScriptRow[];
}

export async function fetchAnchors(): Promise<GagAnchor[]> {
  const { data, error } = await supabase.from('gag_anchors').select('*');
  if (error) throw error;
  return data as GagAnchor[];
}

export async function fetchPromoCampaigns(): Promise<VoucherCampaign[]> {
  const { data, error } = await supabase
    .from('voucher_campaigns')
    .select('id, brand_id, title, image_url, terms, redeem_info, is_fallback')
    .eq('status', 'active')
    .eq('is_fallback', false)
    .limit(5);
  if (error) throw error;
  return data as VoucherCampaign[];
}
```

- [ ] **Step 2: Tabs layout**

Create `mobile/app/(tabs)/_layout.tsx`:

```tsx
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { theme } from '../../src/ui/theme';

function Icon({ glyph }: { glyph: string }) {
  return <Text style={{ fontSize: 20 }}>{glyph}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: theme.green, headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'หน้าแรก', tabBarIcon: () => <Icon glyph="🏠" /> }} />
      <Tabs.Screen name="activity" options={{ title: 'กิจกรรม', tabBarIcon: () => <Icon glyph="📋" /> }} />
      <Tabs.Screen name="vouchers" options={{ title: 'คูปอง', tabBarIcon: () => <Icon glyph="🎟️" /> }} />
      <Tabs.Screen name="profile" options={{ title: 'โปรไฟล์', tabBarIcon: () => <Icon glyph="👤" /> }} />
    </Tabs>
  );
}
```

- [ ] **Step 3: Home screen**

Create `mobile/app/(tabs)/index.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { fetchPromoCampaigns } from '../../src/api/content';
import { useAuth } from '../../src/state/auth';
import { theme } from '../../src/ui/theme';
import type { VoucherCampaign } from '../../src/types/db';

const SERVICES = [
  { key: 'food', label: 'อาหาร', glyph: '🍜' },
  { key: 'ride', label: 'เรียกรถ', glyph: '🏍️' },
  { key: 'parcel', label: 'ส่งพัสดุ', glyph: '📦' },
  { key: 'mart', label: 'มาร์ท', glyph: '🛒' },
] as const;

export default function Home() {
  const router = useRouter();
  const { profile } = useAuth();
  const [promos, setPromos] = useState<VoucherCampaign[]>([]);

  useEffect(() => {
    fetchPromoCampaigns().then(setPromos).catch(() => {});
  }, []);

  return (
    <ScrollView style={s.root} contentContainerStyle={{ padding: theme.pad }}>
      <Text style={s.hello} testID="greeting">
        สวัสดี {profile?.nickname ?? 'คุณลูกค้า'} 👋
      </Text>
      <Text style={s.tagline}>วันนี้อยากให้อะไรไปไม่ถึงดี?</Text>

      <View style={s.grid}>
        {SERVICES.map((svc) => (
          <Pressable key={svc.key} style={s.tile} testID={`svc-${svc.key}`} onPress={() => router.push(`/order/${svc.key}`)}>
            <Text style={s.tileGlyph}>{svc.glyph}</Text>
            <Text style={s.tileLabel}>{svc.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={s.section}>โปรโมชั่นพาร์ทเนอร์</Text>
      {promos.map((p) => (
        <View key={p.id} style={s.promo}>
          <Text style={s.promoTitle}>{p.title}</Text>
          {p.terms ? <Text style={s.promoTerms}>{p.terms}</Text> : null}
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  hello: { fontSize: 22, fontWeight: '700', color: theme.text, marginTop: 40 },
  tagline: { fontSize: 14, color: theme.textMuted, marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: {
    width: '47%', backgroundColor: theme.surface, borderRadius: theme.radius,
    padding: 20, alignItems: 'center', gap: 8,
  },
  tileGlyph: { fontSize: 36 },
  tileLabel: { fontSize: 16, fontWeight: '600', color: theme.text },
  section: { fontSize: 16, fontWeight: '700', marginTop: 28, marginBottom: 10, color: theme.text },
  promo: { backgroundColor: '#E8F7EE', borderRadius: theme.radius, padding: 14, marginBottom: 10 },
  promoTitle: { fontWeight: '700', color: theme.greenDark },
  promoTerms: { color: theme.textMuted, fontSize: 12, marginTop: 4 },
});
```

- [ ] **Step 4: Stub the other tabs** (filled in Tasks 11–13)

Create `mobile/app/(tabs)/activity.tsx`, `mobile/app/(tabs)/vouchers.tsx`, `mobile/app/(tabs)/profile.tsx`, each for now:

```tsx
import { View, Text } from 'react-native';

export default function Placeholder() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>เร็วๆ นี้</Text>
    </View>
  );
}
```

Delete the template's `mobile/app/index.tsx` if it still exists (it would shadow the tabs group).

- [ ] **Step 5: Write the smoke test**

Create `mobile/src/__tests__/home.smoke.test.tsx`:

```tsx
import { render } from '@testing-library/react-native';

jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('../api/content', () => ({ fetchPromoCampaigns: jest.fn().mockResolvedValue([]) }));
jest.mock('../state/auth', () => ({
  useAuth: () => ({ profile: { nickname: 'ทดสอบ', loyalty_xp: 0, tier: 'silver', id: 'u1' } }),
}));

import Home from '../../app/(tabs)/index';

test('home renders greeting and all four service tiles', () => {
  const { getByTestId } = render(<Home />);
  expect(getByTestId('greeting')).toBeTruthy();
  ['food', 'ride', 'parcel', 'mart'].forEach((k) => expect(getByTestId(`svc-${k}`)).toBeTruthy());
});
```

- [ ] **Step 6: Verify**

```bash
cd mobile && npx jest home.smoke && npm run typecheck
```

Expected: 1 test passes; typecheck clean. Then boot the app (`npx expo start`, press i or a): sign-in renders → guest sign-in works against local Supabase → home grid shows.

- [ ] **Step 7: Commit**

```bash
git add mobile/app mobile/src
git rm mobile/app/index.tsx 2>/dev/null || true
git commit -m "feat: tab shell and home service grid"
```

---

### Task 9: Orders API (place, resume, fail + voucher grant)

**Files:**
- Create: `mobile/src/api/orders.ts`
- Test: `mobile/src/api/__tests__/orders.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `mobile/src/api/__tests__/orders.test.ts`:

```ts
import { buildFailContext } from '../orders';

test('fail context carries service, finale kind, and nth_fail', () => {
  const ctx = buildFailContext({
    service: 'food',
    finaleKind: 'canal',
    priorFailCount: 4,
  });
  expect(ctx).toEqual({ service: 'food', finale_type: 'canal', nth_fail: 5 });
});

test('nth_fail counts THIS failure (prior + 1)', () => {
  expect(buildFailContext({ service: 'mart', finaleKind: 'lost', priorFailCount: 0 }).nth_fail).toBe(1);
});
```

- [ ] **Step 2: Run to verify failure**

```bash
cd mobile && npx jest orders.test
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `mobile/src/api/orders.ts`:

```ts
import { supabase } from '../lib/supabase';
import { pickScript } from '../engine/pickScript';
import { fetchScripts } from './content';
import { XP, tierForXp } from '../balance/balance';
import type { OrderRow, Service, VoucherRow } from '../types/db';

export async function placeOrder(opts: { service: Service; items: unknown[] }): Promise<OrderRow> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error('NOT_SIGNED_IN');

  const scripts = await fetchScripts();
  const seed = Math.floor(Math.random() * 2 ** 31); // the ONE non-deterministic moment; persisted on the row
  const script = pickScript(scripts, opts.service, seed);

  const { data, error } = await supabase
    .from('orders')
    .insert({ user_id: userId, service: opts.service, items_json: opts.items, script_id: script.id, seed })
    .select()
    .single();
  if (error) throw error;
  return data as OrderRow;
}

export async function getOrder(orderId: string): Promise<OrderRow> {
  const { data, error } = await supabase.from('orders').select('*').eq('id', orderId).single();
  if (error) throw error;
  return data as OrderRow;
}

export async function listOrders(): Promise<OrderRow[]> {
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as OrderRow[];
}

export function buildFailContext(opts: { service: string; finaleKind: string; priorFailCount: number }) {
  return { service: opts.service, finale_type: opts.finaleKind, nth_fail: opts.priorFailCount + 1 };
}

export interface FailResult {
  voucher: VoucherRow | null; // null when the fallback brake said RATE_LIMITED
  rateLimited: boolean;
}

// Finale fired: mark the order failed, claim the prize, bank the suffering.
// Safe to re-run (lazy resolution on next launch): the status update is
// idempotent and we skip the grant when the order is already failed.
export async function failOrder(order: { id: string; service: string; status: string }, finaleKind: string): Promise<FailResult> {
  if (order.status === 'failed_hilariously') return { voucher: null, rateLimited: false };

  const { count } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'failed_hilariously');

  await supabase.from('orders').update({ status: 'failed_hilariously' }).eq('id', order.id);

  // Suffering is the universal currency (spec §8) — v1 client-trust.
  const { data: prof } = await supabase.from('profiles').select('loyalty_xp').single();
  if (prof) {
    const xp = prof.loyalty_xp + XP.order_failed;
    await supabase.from('profiles').update({ loyalty_xp: xp, tier: tierForXp(xp) }).gte('loyalty_xp', 0);
  }

  const context = buildFailContext({ service: order.service, finaleKind, priorFailCount: count ?? 0 });
  const { data, error } = await supabase.rpc('grant_voucher', { p_trigger: 'order_failed', p_context: context });
  if (error) {
    if (error.message.includes('RATE_LIMITED')) return { voucher: null, rateLimited: true };
    throw error;
  }
  return { voucher: data as VoucherRow, rateLimited: false };
}

export async function listVouchers(): Promise<(VoucherRow & { voucher_campaigns: { title: string; terms: string | null; redeem_info: string | null } })[]> {
  const { data, error } = await supabase
    .from('vouchers')
    .select('*, voucher_campaigns(title, terms, redeem_info)')
    .order('granted_at', { ascending: false });
  if (error) throw error;
  return data as never;
}
```

- [ ] **Step 4: Verify**

```bash
cd mobile && npx jest orders.test && npm run typecheck
```

Expected: 2 tests pass; typecheck clean.

- [ ] **Step 5: Commit**

```bash
git add mobile/src/api
git commit -m "feat: orders api — place, resume, fail with voucher grant"
```

---

### Task 10: Service configs + Browse + Confirm screens

**Files:**
- Create: `mobile/src/services/config.ts`, `mobile/app/order/[service]/index.tsx`, `mobile/app/order/[service]/confirm.tsx`

- [ ] **Step 1: Service registry**

Create `mobile/src/services/config.ts`:

```ts
import type { Service } from '../types/db';

export interface ServiceConfig {
  key: Service;
  title: string;       // header
  catalogTitle: string;
  confirmCta: string;
  trackingNoun: string; // "ไรเดอร์" / "คนขับ" / "เมสเซนเจอร์"
  accent: string;
}

export const SERVICE_CONFIGS: Record<Service, ServiceConfig> = {
  food: { key: 'food', title: 'สั่งอาหาร', catalogTitle: 'ร้านแนะนำ', confirmCta: 'สั่งเลย', trackingNoun: 'ไรเดอร์', accent: '#00B14F' },
  ride: { key: 'ride', title: 'เรียกรถ', catalogTitle: 'เลือกบริการ', confirmCta: 'เรียกรถ', trackingNoun: 'คนขับ', accent: '#1E88E5' },
  parcel: { key: 'parcel', title: 'ส่งพัสดุ', catalogTitle: 'เลือกบริการส่ง', confirmCta: 'ส่งพัสดุ', trackingNoun: 'เมสเซนเจอร์', accent: '#F4511E' },
  mart: { key: 'mart', title: 'มาร์ท', catalogTitle: 'สินค้าแนะนำ', confirmCta: 'สั่งซื้อ', trackingNoun: 'ไรเดอร์', accent: '#8E24AA' },
};
```

- [ ] **Step 2: Browse screen**

Create `mobile/app/order/[service]/index.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { View, Text, Pressable, FlatList, Image, StyleSheet } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { fetchCatalog } from '../../../src/api/content';
import { SERVICE_CONFIGS } from '../../../src/services/config';
import { theme } from '../../../src/ui/theme';
import type { CatalogItem, Service } from '../../../src/types/db';

export default function Browse() {
  const { service } = useLocalSearchParams<{ service: Service }>();
  const router = useRouter();
  const cfg = SERVICE_CONFIGS[service as Service];
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [picked, setPicked] = useState<CatalogItem[]>([]);

  useEffect(() => {
    if (cfg) fetchCatalog(cfg.key).then(setItems).catch(() => {});
  }, [service]);

  if (!cfg) return null;

  const toggle = (item: CatalogItem) =>
    setPicked((p) => (p.some((i) => i.id === item.id) ? p.filter((i) => i.id !== item.id) : [...p, item]));

  return (
    <View style={s.root}>
      <Stack.Screen options={{ headerShown: true, title: cfg.title }} />
      <Text style={s.section}>{cfg.catalogTitle}</Text>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => {
          const selected = picked.some((i) => i.id === item.id);
          return (
            <Pressable style={[s.card, selected && { borderColor: cfg.accent, borderWidth: 2 }]} onPress={() => toggle(item)}>
              {item.photo_url ? (
                <Image source={{ uri: item.photo_url }} style={s.photo} />
              ) : (
                <View style={[s.photo, s.photoFallback]}>
                  <Text style={{ fontSize: 28 }}>🍱</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{item.name}</Text>
                <Text style={s.meta}>
                  {item.rating ? `★ ${item.rating}  · ` : ''}฿{item.price.toFixed(0)} · ส่งฟรี
                </Text>
              </View>
            </Pressable>
          );
        }}
      />
      <Pressable
        style={[s.cta, { backgroundColor: cfg.accent }, picked.length === 0 && { opacity: 0.4 }]}
        disabled={picked.length === 0}
        onPress={() =>
          router.push({ pathname: `/order/${cfg.key}/confirm`, params: { items: JSON.stringify(picked) } })
        }
      >
        <Text style={s.ctaText}>ไปหน้าสรุป ({picked.length})</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg, padding: theme.pad },
  section: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  card: {
    flexDirection: 'row', gap: 12, padding: 12, borderRadius: theme.radius,
    backgroundColor: theme.surface, marginBottom: 10, alignItems: 'center',
    borderWidth: 2, borderColor: 'transparent',
  },
  photo: { width: 64, height: 64, borderRadius: 8 },
  photoFallback: { backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' },
  name: { fontWeight: '600', fontSize: 15 },
  meta: { color: theme.textMuted, fontSize: 13, marginTop: 2 },
  cta: { borderRadius: theme.radius, padding: 16, alignItems: 'center', marginTop: 8 },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
```

- [ ] **Step 3: Confirm screen**

Create `mobile/app/order/[service]/confirm.tsx`:

```tsx
import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { placeOrder } from '../../../src/api/orders';
import { SERVICE_CONFIGS } from '../../../src/services/config';
import { theme } from '../../../src/ui/theme';
import type { CatalogItem, Service } from '../../../src/types/db';

export default function Confirm() {
  const { service, items: itemsParam } = useLocalSearchParams<{ service: Service; items: string }>();
  const router = useRouter();
  const cfg = SERVICE_CONFIGS[service as Service];
  const items: CatalogItem[] = itemsParam ? JSON.parse(itemsParam) : [];
  const [busy, setBusy] = useState(false);

  if (!cfg) return null;
  const subtotal = items.reduce((sum, i) => sum + Number(i.price), 0);

  const submit = async () => {
    setBusy(true);
    try {
      const order = await placeOrder({ service: cfg.key, items });
      router.replace(`/track/${order.id}`);
    } catch {
      Alert.alert('ขออภัย', 'สั่งไม่สำเร็จ ลองใหม่อีกครั้ง');
      setBusy(false);
    }
  };

  return (
    <View style={s.root}>
      <Stack.Screen options={{ headerShown: true, title: 'สรุปคำสั่งซื้อ' }} />
      {items.map((i) => (
        <View key={i.id} style={s.row}>
          <Text style={s.name}>{i.name}</Text>
          <Text style={s.price}>฿{Number(i.price).toFixed(0)}</Text>
        </View>
      ))}
      <View style={s.divider} />
      <View style={s.row}>
        <Text style={s.name}>รวม</Text>
        <Text style={s.strike}>฿{subtotal.toFixed(0)}</Text>
      </View>
      <View style={s.row}>
        <Text style={[s.name, { fontWeight: '800' }]}>ยอดชำระ (โปรเปิดตัว)</Text>
        <Text style={s.free}>฿0</Text>
      </View>
      <Text style={s.fine}>* ทุกออเดอร์ฟรีตลอดไป เพราะเราไม่เคยส่งถึงใครเลย</Text>
      <Pressable style={[s.cta, { backgroundColor: cfg.accent }, busy && { opacity: 0.5 }]} disabled={busy} onPress={submit}>
        <Text style={s.ctaText}>{busy ? 'กำลังหา' + cfg.trackingNoun + '...' : cfg.confirmCta}</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg, padding: theme.pad },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  name: { fontSize: 15 },
  price: { fontSize: 15, color: theme.textMuted },
  strike: { fontSize: 15, color: theme.textMuted, textDecorationLine: 'line-through' },
  free: { fontSize: 18, fontWeight: '800', color: theme.green },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 8 },
  fine: { fontSize: 11, color: '#bbb', marginTop: 4 },
  cta: { borderRadius: theme.radius, padding: 16, alignItems: 'center', marginTop: 24 },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
```

- [ ] **Step 4: Verify**

```bash
cd mobile && npm run typecheck && npx jest
```

Expected: typecheck clean, all existing tests still pass. Boot the app: home → food → select items → confirm shows ฿0 → tapping สั่งเลย inserts an order row (it will navigate to `/track/<id>` which 404s until Task 11 — that's expected; check Studio that the order row exists with script_id and seed).

- [ ] **Step 5: Commit**

```bash
git add mobile/app mobile/src
git commit -m "feat: browse and confirm screens for all four services"
```

---

### Task 11: Tracking screen (the gag)

**Files:**
- Create: `mobile/app/track/[orderId].tsx`

- [ ] **Step 1: Implement the screen**

Create `mobile/app/track/[orderId].tsx`:

```tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { engineStateAt } from '../../src/engine/engine';
import { buildDoomedPath, positionAt, type LatLng } from '../../src/engine/path';
import { fetchRoute } from '../../src/engine/route';
import { fetchAnchors } from '../../src/api/content';
import { getOrder } from '../../src/api/orders';
import { supabase } from '../../src/lib/supabase';
import { SERVICE_CONFIGS } from '../../src/services/config';
import { theme } from '../../src/ui/theme';
import type { GagScriptRow, OrderRow, Service } from '../../src/types/db';
import type { Keyframe, SabotageAction } from '../../src/engine/types';

// Origin/destination: mood over accuracy (spec). The "restaurant" is a seeded
// jitter near Siam; the user pin a seeded jitter ~2km away. Sub-project 3+ can
// wire real geolocation without touching the engine.
function fakeEndpoints(seed: number): { from: LatLng; to: LatLng } {
  const j = (n: number) => ((seed >> n) % 100) / 100 - 0.5;
  return {
    from: { lat: 13.7463 + j(3) * 0.02, lng: 100.5348 + j(5) * 0.02 },
    to: { lat: 13.7463 + 0.018 + j(7) * 0.01, lng: 100.5348 + 0.015 + j(11) * 0.01 },
  };
}

export default function Track() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [script, setScript] = useState<GagScriptRow | null>(null);
  const [path, setPath] = useState<Keyframe[] | null>(null);
  const [userPin, setUserPin] = useState<LatLng | null>(null);
  const [sabotageLog, setSabotageLog] = useState<SabotageAction[]>([]);
  const [nowMs, setNowMs] = useState(Date.now());
  const navigated = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const o = await getOrder(orderId!);
      const { data: sc } = await supabase.from('gag_scripts').select('*').eq('id', o.script_id).single();
      const anchors = await fetchAnchors();
      const { from, to } = fakeEndpoints(o.seed);
      const base = await fetchRoute(from, to, o.seed);
      if (cancelled) return;
      setOrder(o);
      setScript(sc as GagScriptRow);
      setUserPin(to);
      setPath(buildDoomedPath({ base, script: (sc as GagScriptRow).timeline, anchors, seed: o.seed }));
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const elapsedS = order ? (nowMs - new Date(order.created_at).getTime()) / 1000 : 0;

  const state = useMemo(
    () => (script ? engineStateAt({ script: script.timeline, elapsedS, sabotageLog }) : null),
    [script, elapsedS, sabotageLog],
  );

  useEffect(() => {
    if (state?.phase === 'failed' && !navigated.current) {
      navigated.current = true;
      const kind = state.finale?.kind ?? 'lost';
      setTimeout(() => router.replace({ pathname: `/fail/${orderId}`, params: { kind } }), 1600);
    }
  }, [state?.phase]);

  if (!order || !script || !path || !state || !userPin) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={theme.green} size="large" />
        <Text style={{ marginTop: 10, color: theme.textMuted }}>กำลังตามหาไรเดอร์...</Text>
      </View>
    );
  }

  const cfg = SERVICE_CONFIGS[order.service as Service] ?? SERVICE_CONFIGS.food;
  const rider = positionAt(path, state.progress);
  const lastChat = state.chat[state.chat.length - 1];

  return (
    <View style={s.root}>
      <Stack.Screen options={{ headerShown: true, title: `ติดตาม${cfg.trackingNoun}` }} />
      <MapView
        style={s.map}
        initialRegion={{ latitude: userPin.lat, longitude: userPin.lng, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
      >
        <Polyline coordinates={path.map((k) => ({ latitude: k.pos.lat, longitude: k.pos.lng }))} strokeColor={cfg.accent} strokeWidth={3} lineDashPattern={[8, 6]} />
        <Marker coordinate={{ latitude: userPin.lat, longitude: userPin.lng }} title="คุณ">
          <Text style={{ fontSize: 26 }}>📍</Text>
        </Marker>
        <Marker coordinate={{ latitude: rider.lat, longitude: rider.lng }} title={cfg.trackingNoun}>
          <Text style={{ fontSize: 28 }}>{state.incident?.kind === 'sleepy' ? '🛵💤' : '🛵'}</Text>
        </Marker>
      </MapView>

      <View style={s.panel}>
        <Text style={s.eta}>ถึงใน {Math.round(state.etaMinutes)} นาที{state.etaMinutes > 30 ? ' (โดยประมาณ... มากๆ)' : ''}</Text>
        {state.incident ? <Text style={s.incident}>⚠️ {incidentText(state.incident.kind)}</Text> : null}
        {lastChat ? (
          <View style={s.chatBubble}>
            <Text style={s.chatText}>💬 {lastChat.text}</Text>
          </View>
        ) : null}
        {state.activeSabotage ? (
          <Pressable
            style={[s.sabotage, { borderColor: cfg.accent }]}
            onPress={() => setSabotageLog((l) => [...l, { action: state.activeSabotage!.action, atS: elapsedS }])}
          >
            <Text style={[s.sabotageText, { color: cfg.accent }]}>📞 {state.activeSabotage.label}</Text>
          </Pressable>
        ) : null}
        {state.phase === 'failed' ? <Text style={s.failText}>{state.finale?.statusText}</Text> : null}
      </View>
    </View>
  );
}

function incidentText(kind: string): string {
  switch (kind) {
    case 'sleepy': return 'ไรเดอร์แวะพัก (นานผิดปกติ)';
    case 'lost': return 'ไรเดอร์ดูจะหลงทาง';
    default: return 'เกิดเหตุการณ์ไม่คาดฝัน';
  }
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  map: { flex: 1 },
  panel: { padding: theme.pad, gap: 10, backgroundColor: theme.bg, borderTopLeftRadius: 20, borderTopRightRadius: 20, marginTop: -20 },
  eta: { fontSize: 18, fontWeight: '800' },
  incident: { color: '#B8860B', fontWeight: '600' },
  chatBubble: { backgroundColor: theme.surface, borderRadius: theme.radius, padding: 12 },
  chatText: { fontSize: 14 },
  sabotage: { borderWidth: 2, borderRadius: theme.radius, padding: 14, alignItems: 'center' },
  sabotageText: { fontWeight: '700' },
  failText: { fontSize: 16, fontWeight: '800', color: theme.danger, textAlign: 'center', paddingVertical: 6 },
});
```

NOTE on sabotage persistence: the sabotage log is in-memory only. If the user kills the app mid-run, the resumed run shows the un-sabotaged baseline — acceptable v1 (documented in spec §6 as locally recorded; full persistence can use AsyncStorage later without engine changes).

- [ ] **Step 2: Verify**

```bash
cd mobile && npm run typecheck && npx jest
```

Expected: clean + all tests pass. Boot the app, place a food order, watch: rider follows a plausible route, takes the wrong turn, parks at the 7-11 with 💤, ETA balloons; tapping โทรปลุกไรเดอร์ makes it worse; at ~3.5 min the canal finale text shows; the screen auto-navigates to `/fail/<id>` (404 until Task 12 — expected).

- [ ] **Step 3: Commit**

```bash
git add mobile/app/track
git commit -m "feat: tracking screen — map, engine ticker, sabotage"
```

---

### Task 12: Fail screen + voucher reveal + wallet tab

**Files:**
- Create: `mobile/app/fail/[orderId].tsx`
- Modify: `mobile/app/(tabs)/vouchers.tsx` (replace stub)

- [ ] **Step 1: Fail + voucher reveal screen**

Create `mobile/app/fail/[orderId].tsx`:

```tsx
import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { failOrder, getOrder, type FailResult } from '../../src/api/orders';
import { useAuth } from '../../src/state/auth';
import { supabase } from '../../src/lib/supabase';
import { theme } from '../../src/ui/theme';

export default function Fail() {
  const { orderId, kind } = useLocalSearchParams<{ orderId: string; kind: string }>();
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const [result, setResult] = useState<FailResult | null>(null);
  const [campaignTitle, setCampaignTitle] = useState<string>('');

  useEffect(() => {
    (async () => {
      const order = await getOrder(orderId!);
      const r = await failOrder(order, kind ?? 'lost').catch(() => ({ voucher: null, rateLimited: false }));
      if (r.voucher) {
        const { data } = await supabase
          .from('voucher_campaigns')
          .select('title')
          .eq('id', r.voucher.campaign_id)
          .single();
        setCampaignTitle(data?.title ?? 'คูปองปลอบใจ');
      }
      setResult(r);
      refreshProfile();
    })();
  }, [orderId]);

  if (!result) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={theme.green} size="large" />
      </View>
    );
  }

  return (
    <View style={s.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={s.splash}>🛶</Text>
      <Text style={s.headline}>{finaleHeadline(kind ?? 'lost')}</Text>
      <Text style={s.sub}>ขออภัยในความไม่สะดวก (อีกแล้ว)</Text>

      {result.voucher ? (
        <View style={s.voucher}>
          <Text style={s.voucherLabel}>🎟️ คูปองปลอบใจจากพาร์ทเนอร์</Text>
          <Text style={s.voucherTitle}>{campaignTitle}</Text>
          {result.voucher.code ? <Text style={s.voucherCode}>{result.voucher.code}</Text> : null}
        </View>
      ) : result.rateLimited ? (
        <Text style={s.rateLimited}>ความเสียใจของคุณถี่เกินระบบจะปลอบไหว 🙏{'\n'}พักสักครู่แล้วค่อยผิดหวังใหม่</Text>
      ) : (
        <Text style={s.rateLimited}>ครั้งนี้ไม่มีคูปอง แต่มีความทรงจำ</Text>
      )}

      <Pressable style={s.cta} onPress={() => router.replace('/(tabs)/vouchers')}>
        <Text style={s.ctaText}>ดูคูปองของฉัน</Text>
      </Pressable>
      <Pressable onPress={() => router.replace('/')}>
        <Text style={s.again}>สั่งใหม่ (เผื่อรอบนี้จะถึง)</Text>
      </Pressable>
    </View>
  );
}

function finaleHeadline(kind: string): string {
  switch (kind) {
    case 'canal': return 'ไรเดอร์ตกคลอง';
    case 'sleepy': return 'ไรเดอร์หลับลึกเกินปลุก';
    case 'lost': return 'ไรเดอร์หลงทางถาวร';
    default: return 'ออเดอร์ไปไม่ถึงฝั่งฝัน';
  }
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0E2A47', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0E2A47' },
  splash: { fontSize: 72 },
  headline: { fontSize: 26, fontWeight: '900', color: '#fff', textAlign: 'center' },
  sub: { color: '#9FB8D0', marginBottom: 18 },
  voucher: { backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', gap: 6, width: '100%' },
  voucherLabel: { fontSize: 12, color: theme.textMuted },
  voucherTitle: { fontSize: 17, fontWeight: '800', textAlign: 'center' },
  voucherCode: { fontSize: 20, fontWeight: '900', letterSpacing: 2, color: theme.greenDark, marginTop: 6 },
  rateLimited: { color: '#9FB8D0', textAlign: 'center', lineHeight: 22 },
  cta: { backgroundColor: theme.green, borderRadius: theme.radius, padding: 16, alignItems: 'center', width: '100%', marginTop: 20 },
  ctaText: { color: '#fff', fontWeight: '700' },
  again: { color: '#9FB8D0', padding: 10 },
});
```

- [ ] **Step 2: Wallet tab**

Replace `mobile/app/(tabs)/vouchers.tsx`:

```tsx
import { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { listVouchers } from '../../src/api/orders';
import { theme } from '../../src/ui/theme';

type Row = Awaited<ReturnType<typeof listVouchers>>[number];

export default function Vouchers() {
  const [rows, setRows] = useState<Row[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    listVouchers().then(setRows).catch(() => {});
  }, []);

  useFocusEffect(load);

  return (
    <View style={s.root}>
      <Text style={s.title}>คูปองของฉัน</Text>
      <FlatList
        data={rows}
        keyExtractor={(r) => r.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); setRefreshing(false); }} />}
        ListEmptyComponent={<Text style={s.empty}>ยังไม่มีคูปอง — ลองสั่งอะไรสักอย่างสิ รับรองผิดหวัง</Text>}
        renderItem={({ item }) => (
          <View style={[s.card, item.status !== 'active' && { opacity: 0.45 }]}>
            <Text style={s.cardTitle}>{item.voucher_campaigns?.title}</Text>
            {item.code ? <Text style={s.code}>{item.code}</Text> : null}
            {item.voucher_campaigns?.redeem_info ? <Text style={s.terms}>{item.voucher_campaigns.redeem_info}</Text> : null}
            <Text style={s.status}>{statusText(item.status)}</Text>
          </View>
        )}
      />
    </View>
  );
}

function statusText(status: string): string {
  switch (status) {
    case 'active': return 'พร้อมใช้';
    case 'spent': return 'ใช้แลกของแล้ว';
    case 'redeemed': return 'ใช้แล้ว';
    default: return 'หมดอายุ';
  }
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg, padding: theme.pad },
  title: { fontSize: 22, fontWeight: '800', marginTop: 40, marginBottom: 14 },
  empty: { color: theme.textMuted, textAlign: 'center', marginTop: 60 },
  card: { backgroundColor: '#FFF8E7', borderRadius: theme.radius, padding: 16, marginBottom: 10, gap: 4 },
  cardTitle: { fontWeight: '800', fontSize: 15 },
  code: { fontSize: 18, fontWeight: '900', letterSpacing: 2, color: theme.greenDark },
  terms: { fontSize: 12, color: theme.textMuted },
  status: { fontSize: 12, color: theme.textMuted, marginTop: 4 },
});
```

- [ ] **Step 3: Verify**

```bash
cd mobile && npm run typecheck && npx jest
```

Expected: clean. Boot: run a full order to the finale → fail screen shows headline + a real voucher (check it matches a seeded campaign; a canal finale should usually win the ชานมแก้วฟรี canal-exclusive campaign) → wallet tab lists it.

- [ ] **Step 4: Commit**

```bash
git add mobile/app
git commit -m "feat: fail screen with voucher reveal and wallet tab"
```

---

### Task 13: Activity tab + profile tab (loyalty)

**Files:**
- Modify: `mobile/app/(tabs)/activity.tsx`, `mobile/app/(tabs)/profile.tsx` (replace stubs)

- [ ] **Step 1: Activity tab**

Replace `mobile/app/(tabs)/activity.tsx`:

```tsx
import { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { listOrders } from '../../src/api/orders';
import { SERVICE_CONFIGS } from '../../src/services/config';
import { theme } from '../../src/ui/theme';
import type { OrderRow, Service } from '../../src/types/db';

export default function Activity() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const router = useRouter();

  useFocusEffect(useCallback(() => { listOrders().then(setOrders).catch(() => {}); }, []));

  return (
    <View style={s.root}>
      <Text style={s.title}>กิจกรรมของฉัน</Text>
      <FlatList
        data={orders}
        keyExtractor={(o) => o.id}
        ListEmptyComponent={<Text style={s.empty}>ยังไม่เคยสั่งอะไรเลย ความผิดหวังรอคุณอยู่</Text>}
        renderItem={({ item }) => {
          const cfg = SERVICE_CONFIGS[item.service as Service];
          return (
            <Pressable
              style={s.card}
              onPress={() => item.status === 'tracking' && router.push(`/track/${item.id}`)}
            >
              <Text style={s.svc}>{cfg?.title ?? item.service}</Text>
              <Text style={s.when}>{new Date(item.created_at).toLocaleString('th-TH')}</Text>
              <Text style={[s.status, item.status === 'tracking' ? s.tracking : s.failed]}>
                {item.status === 'tracking' ? '🛵 กำลังเดินทาง (มั้ง) — แตะเพื่อติดตาม' :
                 item.status === 'failed_hilariously' ? '🛶 ไปไม่ถึง (ตามคาด)' : 'ยกเลิก'}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg, padding: theme.pad },
  title: { fontSize: 22, fontWeight: '800', marginTop: 40, marginBottom: 14 },
  empty: { color: theme.textMuted, textAlign: 'center', marginTop: 60 },
  card: { backgroundColor: theme.surface, borderRadius: theme.radius, padding: 14, marginBottom: 10, gap: 2 },
  svc: { fontWeight: '700', fontSize: 15 },
  when: { color: theme.textMuted, fontSize: 12 },
  status: { fontSize: 13, marginTop: 4, fontWeight: '600' },
  tracking: { color: theme.green },
  failed: { color: theme.textMuted },
});
```

- [ ] **Step 2: Profile tab**

Replace `mobile/app/(tabs)/profile.tsx`:

```tsx
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/state/auth';
import { TIERS } from '../../src/balance/balance';
import { theme } from '../../src/ui/theme';

const TIER_BADGE: Record<string, string> = { silver: '🥈', gold: '🥇', platinum: '💎', vip: '👑' };
const TIER_LABEL: Record<string, string> = {
  silver: 'Silver — ผู้เริ่มผิดหวัง', gold: 'Gold — ผู้ผิดหวังเป็นนิจ',
  platinum: 'Platinum — ผู้เชี่ยวชาญการรอ', vip: 'VIP — ตำนานแห่งความว่างเปล่า',
};

export default function Profile() {
  const router = useRouter();
  const { profile, signOut } = useAuth();
  if (!profile) return null;

  const nextTier = TIERS.find((t) => t.minXp > profile.loyalty_xp);

  return (
    <View style={s.root}>
      <Text style={s.title}>โปรไฟล์</Text>
      <View style={s.card}>
        <Text style={s.name}>{profile.nickname ?? 'ลูกค้านิรนาม'}</Text>
        <Text style={s.tier}>
          {TIER_BADGE[profile.tier]} {TIER_LABEL[profile.tier]}
        </Text>
        <Text style={s.xp}>
          {profile.loyalty_xp} แต้มความเจ็บปวด
          {nextTier ? ` · อีก ${nextTier.minXp - profile.loyalty_xp} แต้มถึงระดับถัดไป` : ' · สุดทางแล้ว'}
        </Text>
      </View>

      <Pressable style={s.row} onPress={() => router.push('/partner')}>
        <Text style={s.rowText}>🤝 ร่วมเป็นพาร์ทเนอร์กับเรา</Text>
      </Pressable>
      <Pressable style={s.row} onPress={() => signOut()}>
        <Text style={[s.rowText, { color: theme.danger }]}>ออกจากระบบ</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg, padding: theme.pad },
  title: { fontSize: 22, fontWeight: '800', marginTop: 40, marginBottom: 14 },
  card: { backgroundColor: theme.surface, borderRadius: theme.radius, padding: 18, gap: 6, marginBottom: 18 },
  name: { fontSize: 18, fontWeight: '800' },
  tier: { fontSize: 15, fontWeight: '600' },
  xp: { fontSize: 13, color: theme.textMuted },
  row: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  rowText: { fontSize: 15, fontWeight: '600' },
});
```

- [ ] **Step 3: Verify**

```bash
cd mobile && npm run typecheck && npx jest
```

Expected: clean. Boot: after a failed order, profile shows +25 แต้มความเจ็บปวด; activity lists the order as ไปไม่ถึง; an in-flight order is tappable back into tracking and resumes mid-journey (determinism in action).

- [ ] **Step 4: Commit**

```bash
git add mobile/app
git commit -m "feat: activity history and loyalty profile tabs"
```

---

### Task 14: Tie-in partner form

**Files:**
- Create: `mobile/app/partner.tsx`

- [ ] **Step 1: Implement**

Create `mobile/app/partner.tsx`:

```tsx
import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../src/lib/supabase';
import { theme } from '../src/ui/theme';

// Enterprise-credible styling on the same design system (spec §11): this form
// must look like it belongs to a company with a legal department.
export default function Partner() {
  const router = useRouter();
  const [company, setCompany] = useState('');
  const [contact, setContact] = useState('');
  const [merchDesc, setMerchDesc] = useState('');
  const [budget, setBudget] = useState('');
  const [busy, setBusy] = useState(false);

  const valid = [company, contact, merchDesc, budget].every((v) => v.trim().length > 0);

  const submit = async () => {
    setBusy(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      if (!token) throw new Error('NOT_SIGNED_IN');
      const res = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/tiein-submit`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${token}`,
          apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
        },
        body: JSON.stringify({
          company: company.trim(),
          contact: contact.trim(),
          merch_desc: merchDesc.trim(),
          budget_range: budget.trim(),
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      Alert.alert('ได้รับคำขอแล้ว', 'ทีมพาร์ทเนอร์ชิพจะติดต่อกลับภายใน 2 วันทำการ\n(อันนี้ถึงจริง สัญญา)', [
        { text: 'ตกลง', onPress: () => router.back() },
      ]);
    } catch (e: unknown) {
      Alert.alert('ส่งไม่สำเร็จ', e instanceof Error ? e.message : 'ลองใหม่อีกครั้ง');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={s.root} contentContainerStyle={{ padding: theme.pad, gap: 12 }}>
      <Text style={s.heading}>โปรแกรมพาร์ทเนอร์ทางการตลาด</Text>
      <Text style={s.sub}>
        เข้าถึงลูกค้าหลายแสนคนที่กำลังรออะไรบางอย่างที่ไม่มีวันมาถึง — พื้นที่โฆษณาที่ engagement สูงที่สุดคือใจที่ว่างเปล่า
      </Text>

      <Field label="ชื่อบริษัท / แบรนด์" value={company} onChange={setCompany} placeholder="บริษัท ตัวอย่าง จำกัด" />
      <Field label="ช่องทางติดต่อ" value={contact} onChange={setContact} placeholder="อีเมล / LINE / เบอร์โทร" />
      <Field label="สินค้าที่ต้องการ tie-in" value={merchDesc} onChange={setMerchDesc} placeholder="อธิบายสินค้าและรูปแบบแคมเปญ" multiline />
      <Field label="งบประมาณโดยประมาณ" value={budget} onChange={setBudget} placeholder="เช่น 50,000–100,000 บาท" />

      <Pressable style={[s.cta, (!valid || busy) && { opacity: 0.4 }]} disabled={!valid || busy} onPress={submit}>
        <Text style={s.ctaText}>{busy ? 'กำลังส่ง...' : 'ส่งคำขอพาร์ทเนอร์ชิพ'}</Text>
      </Pressable>
      <Text style={s.legal}>การส่งแบบฟอร์มนี้ถือว่ายอมรับเงื่อนไขการเป็นพาร์ทเนอร์ และเข้าใจว่าสินค้าของท่านจะถูกส่งถึงลูกค้าจริงเฉพาะช่องทางแลกรับเท่านั้น</Text>
    </ScrollView>
  );
}

function Field(props: { label: string; value: string; onChange: (v: string) => void; placeholder: string; multiline?: boolean }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={s.label}>{props.label}</Text>
      <TextInput
        style={[s.input, props.multiline && { height: 96, textAlignVertical: 'top' }]}
        value={props.value}
        onChangeText={props.onChange}
        placeholder={props.placeholder}
        multiline={props.multiline}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  heading: { fontSize: 20, fontWeight: '800', marginTop: 8 },
  sub: { fontSize: 13, color: theme.textMuted, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: '700', color: theme.text },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 15 },
  cta: { backgroundColor: '#0E2A47', borderRadius: theme.radius, padding: 16, alignItems: 'center', marginTop: 8 },
  ctaText: { color: '#fff', fontWeight: '700' },
  legal: { fontSize: 10, color: '#bbb', lineHeight: 15 },
});
```

- [ ] **Step 2: Verify**

```bash
cd mobile && npm run typecheck
```

Expected: clean. Boot: profile → ร่วมเป็นพาร์ทเนอร์ → fill the form → submit → success alert; row appears in `tiein_requests` (Studio); if `DISCORD_WEBHOOK_URL` secret is set on the served function, the Discord ping arrives. NOTE: the Edge Function must be served locally (`supabase functions serve tiein-submit --env-file supabase/functions/.env`) or the call 404s — that's environment, not code.

- [ ] **Step 3: Commit**

```bash
git add mobile/app/partner.tsx
git commit -m "feat: enterprise-styled tie-in partner form"
```

---

### Task 15: Full verification + README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Full automated pass**

```bash
cd mobile && npm run typecheck && npx jest
cd .. && supabase test db
```

Expected: typecheck clean; all Jest suites pass (rng 3, balance 6, engine 7, path 5, route 4, pickScript 4, auth 2, orders 2, home smoke 1 = 34); backend still 73/73.

- [ ] **Step 2: Manual simulator checklist**

Run through on iOS simulator (or Android emulator with the 10.0.2.2 env URL), local Supabase running and `tiein-submit` served:

1. Fresh install → sign-in screen → guest sign-in with Thai nickname → home greets by nickname
2. Each of the 4 service tiles opens a themed browse with seeded catalog content
3. Food order end-to-end: browse (photos/ratings look real) → confirm ฿0 → tracking (route drawn, rider moves, wrong turn, 💤 at 7-11, ETA balloons) → sabotage backfires → canal finale → voucher reveal → wallet shows it
4. Kill the app mid-tracking → reopen → activity → tap the in-flight order → rider is exactly where the timeline says (determinism)
5. Profile: XP increased by 25 per fail; tier badge correct
6. Partner form submits; row lands in Studio
7. Sign out → sign-in screen returns

Record any failures as issues; do not mark this task complete with a failing checklist item.

- [ ] **Step 3: Update README**

Add to `README.md` after the Edge Function section:

```markdown
## Mobile app (sub-project 2)

```bash
cd mobile
cp .env.example .env        # fill EXPO_PUBLIC_SUPABASE_ANON_KEY from `supabase status`
npm install
npx expo start              # press i (iOS sim) or a (Android emulator)
npm test                    # jest: engine, path, route, balance, stores
npm run typecheck
```

Android emulator: set `EXPO_PUBLIC_SUPABASE_URL=http://10.0.2.2:54321` in `mobile/.env`.
The tie-in form needs the Edge Function served: `supabase functions serve tiein-submit --env-file supabase/functions/.env`.
```

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: mobile app quickstart — app core complete"
```

---

## Self-Review Notes

- **Spec coverage (app-core scope):** §5 tabs + shared pipeline ✓ (Tasks 8, 10–12), browse realism ✓ (Task 10 + seeded catalog), §6 engine determinism/scripts/anchors/OSRM/sabotage/lazy-resolution ✓ (Tasks 4–6, 9, 11), §8 loyalty ✓ (Tasks 3, 9, 13), §9 client side of grant flow incl. RATE_LIMITED handling ✓ (Tasks 9, 12), §11 tie-in form ✓ (Task 14), §13 client-side error postures (OSRM fallback ✓ Task 6; offline write-queueing is NOT implemented — v1 ships fail-with-alert on order placement and lazy fail-resolution on reopen; full offline queueing deferred, documented here deliberately).
- **Deliberate v1 simplifications (not placeholders):** fake seeded endpoints instead of device geolocation (Task 11 note); in-memory sabotage log (Task 11 note); per-service browse uses one catalog renderer (ride/parcel get catalog rows from seed rather than bespoke destination/sender forms — bespoke forms are content polish, not pipeline architecture).
- **Type consistency:** `GagScript`/`TimelineEvent` shared between engine and DB row types via import; `SabotageAction`/`Keyframe` exported from engine modules and consumed by the tracking screen; `FailResult` exported from orders api and consumed by fail screen; balance `Tier` reuses `types/db`.
- **Dependency order:** Tasks 1→2→{3,4,5,6 in any order}→7→8→9→10→11→12→13→14→15.
```
