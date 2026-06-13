---
type: "flow"
status: "active"
order: 3
title: "Browse & Place a Doomed Order"
tags: ["flow", "tour"]
created: "2026-06-13"
updated: "2026-06-13"
---

# Browse & Place a Doomed Order

Tapping a service tile opens the order flow. `order/[service]/index.tsx` loads catalog items from Supabase via `api/content.ts` and lets users multi-select items. `order/[service]/confirm.tsx` shows the satirical free-pricing checkout summary, then calls `placeOrder` and redirects to live tracking. Every order is doomed from the start — the app just hasn't told you yet.

## Files in this step

- `mobile/src/app/order/[service]/index.tsx` — Service-specific catalog browse screen where users multi-select items and proceed to order confirmation.
- `mobile/src/app/order/[service]/confirm.tsx` — Order confirmation screen showing cart summary with satirical free-pricing copy, then submits the order and redirects to tracking.
- `mobile/src/api/content.ts` — Supabase-backed content API fetching catalog items, gag scripts, map anchors, and active voucher campaigns for the mobile app.
