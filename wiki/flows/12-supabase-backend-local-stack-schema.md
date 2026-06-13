---
type: "flow"
status: "active"
order: 12
title: "Supabase Backend: Local Stack & Schema"
tags: ["flow", "tour"]
created: "2026-06-13"
updated: "2026-06-13"
---

# Supabase Backend: Local Stack & Schema

Sub-project 1 is the Supabase backend that powers everything above. `scripts/local-stack.sh` wraps `supabase start/stop` and fixes Docker restart policies for local dev. The README documents `supabase db reset` (migrations + seed) and `supabase test db` for pgTAP tests. Schema is organized across migrations: profiles, content tables (catalog_items, gag_scripts, gag_anchors, personas, voucher_campaigns), user tables (orders, vouchers, matches), shop tables (shops, merch_items, claims, brand_members), tie-in requests, and RPCs for grant_voucher and claim_merch. The pgTAP test files in `supabase/tests/` enforce RLS and business rules server-side.

## Files in this step

- `scripts/local-stack.sh` — Bash wrapper around supabase start/stop that also disables Docker restart=unless-stopped on geemong containers so a manual Docker Desktop stop keeps the local stack down.
- `supabase/tests/0001_profiles_test.sql` — pgTAP suite (7 assertions) verifying the profiles table defaults, auth.users signup trigger nickname copy, owner-scoped RLS read/update, and cross-user write filtering.
- `supabase/tests/0002_content_tables_test.sql` — pgTAP suite (14 assertions) confirming CMS tables exist, anon role holds explicit SELECT grants on every content table, anonymous reads succeed, and anon INSERT is denied.
- `supabase/tests/0003_user_tables_test.sql` — pgTAP suite (10 assertions) exercising owner-scoped RLS on orders and matches, blocking cross-user inserts, rejecting direct voucher minting, and allowing match delete by owner.
- `supabase/tests/0004_shop_tables_test.sql` — pgTAP suite (10 assertions) validating brand-member shop updates, RLS filtering on foreign-brand writes, WITH CHECK on shop/merch inserts, and blocking direct claim minting.
- `supabase/tests/0005_tiein_requests_test.sql` — pgTAP suite (3 assertions) ensuring authenticated users cannot SELECT or INSERT into tiein_requests, leaving intake to the tiein-submit Edge Function service role only.
- `supabase/tests/0006_grant_voucher_test.sql` — pgTAP suite (12 assertions) end-to-end testing grant_voucher campaign matching, JSON condition filters, quota exhaustion fallback, per_user_max and cooldown brakes, WHEN- code format, and anon execute denial.
- `supabase/tests/0007_claim_merch_test.sql` — pgTAP suite (11 assertions) covering claim_merch voucher spend and stock decrement, OUT_OF_STOCK guard, redeem_claim by brand staff, campaign-gated merch, and double-redemption rejection.
- `supabase/tests/0008_hardening_test.sql` — pgTAP suite (6 assertions) verifying TRUNCATE, REFERENCES, TRIGGER, and MAINTAIN privileges are revoked from anon and authenticated on sensitive public tables after the hardening migration.
