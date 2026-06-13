---
type: "component"
status: "active"
title: "Mobile API Layer"
tags: ["component", "mobile-api"]
created: "2026-06-13"
updated: "2026-06-13"
---

# Mobile API Layer

Supabase queries and RPCs for orders, content, personas, shop.

## Key files

- `mobile/src/api/__tests__/orders.test.ts` — Unit tests for order failure context building, verifying service, finale type, and nth_fail counter semantics.
- `mobile/src/api/__tests__/shop.test.ts` — Unit tests for claimMerchItem that mock Supabase RPC responses and verify ShopError mapping for insufficient vouchers and successful claim returns.
- `mobile/src/api/content.ts` — Supabase-backed content API fetching catalog items, gag scripts, map anchors, and active voucher campaigns for the mobile app.
- `mobile/src/api/orders.ts` — Core order lifecycle API: place orders with scripted failure paths, track status, fail hilariously with XP grants and voucher rewards via Supabase RPC.
- `mobile/src/api/personas.ts` — Supabase API layer for dating personas and user matches — fetches active personas, lists matches with joined persona data, and creates or updates match records.
- `mobile/src/api/shop.ts` — Supabase API layer for the merch shop — manages shops, merch items, voucher-based claims, brand memberships, and booth redemption via RPC calls with typed ShopError codes.
