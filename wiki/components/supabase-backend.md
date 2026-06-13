---
type: "component"
status: "active"
title: "Supabase Backend"
tags: ["component", "supabase-backend"]
created: "2026-06-13"
updated: "2026-06-13"
---

# Supabase Backend

Postgres migrations, seed, edge functions, pgTAP tests.

## Key files

- `supabase/config.toml` — Supabase CLI local stack configuration for project geemong — Postgres 17 ports, enabled auth with anonymous sign-in, seed.sql on db reset, edge runtime for Deno functions, and verify_jwt pinned on tiein-submit.
- `supabase/functions/tiein-submit/index.ts` — Supabase Deno Edge Function that accepts authenticated POST tie-in partner registrations, validates the payload, inserts into tiein_requests with the service role, and optionally pings Discord.
- `supabase/functions/tiein-submit/validate_test.ts` — Deno unit tests for validateTiein covering complete payloads, missing fields, blank strings, oversized values, and non-object bodies.
- `supabase/functions/tiein-submit/validate.ts` — Pure validation module for tie-in partner form payloads, enforcing required string fields with per-field max lengths and returning a typed success or error result.
- `supabase/tests/0001_profiles_test.sql` — pgTAP suite (7 assertions) verifying the profiles table defaults, auth.users signup trigger nickname copy, owner-scoped RLS read/update, and cross-user write filtering.
- `supabase/tests/0002_content_tables_test.sql` — pgTAP suite (14 assertions) confirming CMS tables exist, anon role holds explicit SELECT grants on every content table, anonymous reads succeed, and anon INSERT is denied.
- `supabase/tests/0003_user_tables_test.sql` — pgTAP suite (10 assertions) exercising owner-scoped RLS on orders and matches, blocking cross-user inserts, rejecting direct voucher minting, and allowing match delete by owner.
- `supabase/tests/0004_shop_tables_test.sql` — pgTAP suite (10 assertions) validating brand-member shop updates, RLS filtering on foreign-brand writes, WITH CHECK on shop/merch inserts, and blocking direct claim minting.
- `supabase/tests/0005_tiein_requests_test.sql` — pgTAP suite (3 assertions) ensuring authenticated users cannot SELECT or INSERT into tiein_requests, leaving intake to the tiein-submit Edge Function service role only.
- `supabase/tests/0006_grant_voucher_test.sql` — pgTAP suite (12 assertions) end-to-end testing grant_voucher campaign matching, JSON condition filters, quota exhaustion fallback, per_user_max and cooldown brakes, WHEN- code format, and anon execute denial.
- `supabase/tests/0007_claim_merch_test.sql` — pgTAP suite (11 assertions) covering claim_merch voucher spend and stock decrement, OUT_OF_STOCK guard, redeem_claim by brand staff, campaign-gated merch, and double-redemption rejection.
- `supabase/tests/0008_hardening_test.sql` — pgTAP suite (6 assertions) verifying TRUNCATE, REFERENCES, TRIGGER, and MAINTAIN privileges are revoked from anon and authenticated on sensitive public tables after the hardening migration.
