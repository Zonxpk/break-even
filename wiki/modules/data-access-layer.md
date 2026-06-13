---
type: "module"
status: "active"
title: "Data Access Layer"
layer_id: "layer:data-access"
tags: ["module", "data-access-layer"]
created: "2026-06-13"
updated: "2026-06-13"
---

# Data Access Layer

Supabase client wiring, Zustand auth state, and typed API modules that query and mutate backend tables and RPCs for orders, personas, shop, and content.

## Files

- `mobile/src/api/content.ts` — Supabase-backed content API fetching catalog items, gag scripts, map anchors, and active voucher campaigns for the mobile app.
- `mobile/src/api/orders.ts` — Core order lifecycle API: place orders with scripted failure paths, track status, fail hilariously with XP grants and voucher rewards via Supabase RPC.
- `mobile/src/api/personas.ts` — Supabase API layer for dating personas and user matches — fetches active personas, lists matches with joined persona data, and creates or updates match records.
- `mobile/src/api/shop.ts` — Supabase API layer for the merch shop — manages shops, merch items, voucher-based claims, brand memberships, and booth redemption via RPC calls with typed ShopError codes.
- `mobile/src/lib/rng.ts` — Exports mulberry32, a deterministic 32-bit PRNG whose cross-platform stability is required for replayable gag-engine and dating outcomes.
- `mobile/src/lib/supabase.ts` — Singleton Supabase client configured with AsyncStorage auth persistence on native/browser and SSR-safe noop storage during Expo Router server rendering.
- `mobile/src/state/auth.ts` — Zustand auth store wrapping Supabase anonymous and email auth, profile loading, session listeners, and automatic guest re-sign-in after sign-out.
