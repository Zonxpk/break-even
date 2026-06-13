---
type: "flow"
status: "active"
order: 10
title: "Merch Pop-Up Shop"
tags: ["flow", "tour"]
created: "2026-06-13"
updated: "2026-06-13"
---

# Merch Pop-Up Shop

Sub-project 4 is the merch shop — a limited-time pop-up gated by Bangkok-timezone schedule logic in `shop/schedule.ts`. `merch/index.tsx` lists claimable items priced in vouchers, shows open/closed status with a live countdown, and calls `claimMerchItem` from `api/shop.ts`. Successful claims navigate to `merch/claim/[claimId].tsx`, which displays the WHEN- redemption code and booth pickup instructions. Vouchers earned from failed orders are the currency.

## Files in this step

- `mobile/src/app/merch/index.tsx` — Merch pop-up shop screen listing claimable items with voucher prices, live open/closed schedule badge, and claim flow that navigates to the claim detail screen.
- `mobile/src/app/merch/claim/[claimId].tsx` — Claim detail screen displaying the redemption code and booth instructions after a successful merch claim, with a shortcut back to the vouchers tab.
- `mobile/src/api/shop.ts` — Supabase API layer for the merch shop — manages shops, merch items, voucher-based claims, brand memberships, and booth redemption via RPC calls with typed ShopError codes.
- `mobile/src/shop/schedule.ts` — Bangkok-timezone shop schedule utilities that evaluate open windows, compute milliseconds until next opening, and format Thai countdown strings for the merch pop-up.
