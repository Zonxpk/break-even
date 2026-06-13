---
type: "flow"
status: "active"
order: 4
title: "Order Lifecycle API"
tags: ["flow", "tour"]
created: "2026-06-13"
updated: "2026-06-13"
---

# Order Lifecycle API

`api/orders.ts` is the core order lifecycle module. `placeOrder` picks a weighted gag script with a deterministic seed, `getOrder` and `listOrders` power tracking and the activity tab, and `failOrder` marks an order as failed_hilariously while granting loyalty XP and voucher rewards via Supabase RPC. Shared row types in `types/db.ts` mirror the Postgres schema and are imported across API, engine, and UI layers.

## Files in this step

- `mobile/src/api/orders.ts` — Core order lifecycle API: place orders with scripted failure paths, track status, fail hilariously with XP grants and voucher rewards via Supabase RPC.
- `mobile/src/types/db.ts` — Shared TypeScript domain types mirroring Supabase tables and app entities: profiles, orders, vouchers, shop, personas, and matches.
