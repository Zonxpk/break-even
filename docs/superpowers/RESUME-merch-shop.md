# Resume — merch shop (updated 2026-06-13)

## Done

- Plans written: `docs/superpowers/plans/2026-06-13-when-merch-shop.md`
- Shop schedule utilities (Bangkok windows) + tests
- `api/shop.ts` — fetch shops/merch, `claim_merch`, `listMyClaims`, `redeem_claim`, brand membership
- Home merch teaser (open / countdown)
- `/merch` shop screen + `/merch/claim/[id]` redemption code
- Claims section on vouchers tab
- Brand mode: profile gate → `/brand` stats + `/brand/redeem` code entry
- **46/46 Jest tests** pass; typecheck clean

## Deferred (v1)

- Brand product editing + Storage photo uploads (Studio-first per plan)
- QR scanner (text entry only for redeem)

## Manual checklist

1. Home → merch teaser → shop grid when open (seed shop: Fri 18:00–22:00 Bangkok)
2. Claim item with enough active vouchers → code screen → appears in vouchers tab
3. Brand member (seed `brand_members` in Studio) → profile → จัดการร้าน → redeem code
