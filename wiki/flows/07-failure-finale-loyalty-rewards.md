---
type: "flow"
status: "active"
order: 7
title: "Failure Finale & Loyalty Rewards"
tags: ["flow", "tour"]
created: "2026-06-13"
updated: "2026-06-13"
---

# Failure Finale & Loyalty Rewards

When the gag script reaches its finale, tracking redirects to `fail/[orderId].tsx`, which calls `failOrder` to grant XP, update tier, and issue consolation vouchers. The activity tab (`(tabs)/activity.tsx`) lists past orders with Thai status labels; the vouchers tab (`(tabs)/vouchers.tsx`) shows earned campaigns and merch claims. `balance/balance.ts` defines the loyalty tier ladder, XP reward constants, and the match-probability formula that ties delivery failures into the dating sim economy.

## Files in this step

- `mobile/src/app/fail/[orderId].tsx` — Order failure finale screen that calls failOrder, optionally posts a persona apology into chat storage for date orders, and displays consolation vouchers or rate-limit messaging.
- `mobile/src/app/(tabs)/activity.tsx` — Activity tab screen listing past orders with Thai status labels; tapping in-progress orders navigates to live tracking.
- `mobile/src/app/(tabs)/vouchers.tsx` — Vouchers tab listing earned voucher campaigns and redeemed merch claims with Thai status labels, refreshing on tab focus.
- `mobile/src/balance/balance.ts` — Defines loyalty XP reward constants, tier ladder thresholds, and a match-chance formula that scales by user tier and persona rarity with hard caps.
