---
type: "flow"
status: "active"
order: 11
title: "Brand Booth & Partner Tie-Ins"
tags: ["flow", "tour"]
created: "2026-06-13"
updated: "2026-06-13"
---

# Brand Booth & Partner Tie-Ins

Brand operators use `brand/index.tsx` to view shop inventory and claim counts, then `brand/redeem.tsx` to confirm physical pickup by entering a WHEN- code (via the `redeem_claim` RPC). The partner modal (`partner.tsx`) submits marketing tie-in requests to the `tiein-submit` Supabase Edge Function with JWT auth — validated server-side in `supabase/functions/tiein-submit/validate.ts` and forwarded to Discord.

## Files in this step

- `mobile/src/app/brand/index.tsx` — Brand operator home screen showing shop inventory and claim counts for brand members, with navigation to the booth redemption flow.
- `mobile/src/app/brand/redeem.tsx` — Brand booth redemption screen where operators enter a WHEN- redemption code to confirm physical merch pickup via the redeem_claim RPC.
- `mobile/src/app/partner.tsx` — Partner marketing tie-in request form that submits company and campaign details to the Supabase tiein-submit edge function with JWT auth.
- `supabase/functions/tiein-submit/index.ts` — Supabase Deno Edge Function that accepts authenticated POST tie-in partner registrations, validates the payload, inserts into tiein_requests with the service role, and optionally pings Discord.
- `supabase/functions/tiein-submit/validate.ts` — Pure validation module for tie-in partner form payloads, enforcing required string fields with per-field max lengths and returning a typed success or error result.
