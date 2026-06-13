---
type: "component"
status: "active"
title: "Merch Shop"
tags: ["component", "merch-shop"]
created: "2026-06-13"
updated: "2026-06-13"
---

# Merch Shop

Pop-up shop schedule, voucher claims, brand redemption.

## Key files

- `mobile/src/app/brand/index.tsx` — Brand operator home screen showing shop inventory and claim counts for brand members, with navigation to the booth redemption flow.
- `mobile/src/app/brand/redeem.tsx` — Brand booth redemption screen where operators enter a WHEN- redemption code to confirm physical merch pickup via the redeem_claim RPC.
- `mobile/src/app/merch/claim/[claimId].tsx` — Claim detail screen displaying the redemption code and booth instructions after a successful merch claim, with a shortcut back to the vouchers tab.
- `mobile/src/app/merch/index.tsx` — Merch pop-up shop screen listing claimable items with voucher prices, live open/closed schedule badge, and claim flow that navigates to the claim detail screen.
- `mobile/src/shop/__tests__/schedule.test.ts` — Unit tests for pop-up shop schedule logic covering Friday evening open windows, closed states, countdown milliseconds, and Thai countdown formatting.
- `mobile/src/shop/schedule.ts` — Bangkok-timezone shop schedule utilities that evaluate open windows, compute milliseconds until next opening, and format Thai countdown strings for the merch pop-up.
