---
type: "module"
status: "active"
title: "Test Layer"
layer_id: "layer:test"
tags: ["module", "test-layer"]
created: "2026-06-13"
updated: "2026-06-13"
---

# Test Layer

Unit, integration, and smoke tests covering mobile domain logic, API error mapping, and Supabase schema/RPC behavior via Jest and pgTAP.

## Files

- `mobile/src/__tests__/auth.test.ts` — Jest tests for the Zustand auth store covering anonymous guest bootstrap, guest sign-in with nickname, and sign-out that immediately starts a fresh guest session.
- `mobile/src/__tests__/home.smoke.test.tsx` — Smoke test that renders the Home tab and asserts the greeting and all four core service tiles (food, ride, parcel, mart) appear.
- `mobile/src/__tests__/rng.test.ts` — Jest tests that verify mulberry32 produces deterministic sequences for equal seeds, diverges across seeds, and always returns values in [0, 1).
- `mobile/src/api/__tests__/orders.test.ts` — Unit tests for order failure context building, verifying service, finale type, and nth_fail counter semantics.
- `mobile/src/api/__tests__/shop.test.ts` — Unit tests for claimMerchItem that mock Supabase RPC responses and verify ShopError mapping for insufficient vouchers and successful claim returns.
- `mobile/src/balance/__tests__/balance.test.ts` — Unit tests asserting monotonic tier thresholds, positive XP grants, bounded match probabilities, and tier upgrades that never reduce match chance.
- `mobile/src/dating/__tests__/affectionDrip.test.ts` — Parameterized unit tests verifying chatAffectionGain drip cadence and session cap behavior.
- `mobile/src/dating/__tests__/chat.test.ts` — Tests story-beat selection order and affection deltas for nextBeat and applyBeatChoice against fixture persona beats.
- `mobile/src/dating/__tests__/deck.test.ts` — Tests daily deck seed stability per user and date, deterministic persona shuffling, and the rule capping legendary personas to at most one per deck.
- `mobile/src/dating/__tests__/distanceJoke.test.ts` — Jest tests verifying fakeDistanceKm and anchorDistanceKm produce stable Thai-labeled distance strings with the expected format and seed behavior.
- `mobile/src/dating/__tests__/swipe.test.ts` — Statistical tests for resolveSwipe verifying legendary personas rarely match at silver tier while common personas usually match at VIP tier.
- `mobile/src/engine/__tests__/engine.test.ts` — Jest tests for the gag-script engine reducer, covering pure state derivation, incident/sabotage timeline events, backfire effects, and finale transitions.
- `mobile/src/engine/__tests__/path.test.ts` — Jest tests for doomed delivery path generation, verifying anchor snapping, keyframe interpolation, deterministic seeding, and boundary clamping.
- `mobile/src/engine/__tests__/pickScript.test.ts` — Tests for weighted gag script selection: service filtering, seed determinism, weight skew, and empty-pool error handling.
- `mobile/src/engine/__tests__/route.test.ts` — Jest tests for OSRM route fetching with mocked fetch, validating GeoJSON parsing and seeded fallback route generation when the API fails.
- `mobile/src/shop/__tests__/schedule.test.ts` — Unit tests for pop-up shop schedule logic covering Friday evening open windows, closed states, countdown milliseconds, and Thai countdown formatting.
- `supabase/functions/tiein-submit/validate_test.ts` — Deno unit tests for validateTiein covering complete payloads, missing fields, blank strings, oversized values, and non-object bodies.
- `supabase/tests/0001_profiles_test.sql` — pgTAP suite (7 assertions) verifying the profiles table defaults, auth.users signup trigger nickname copy, owner-scoped RLS read/update, and cross-user write filtering.
- `supabase/tests/0002_content_tables_test.sql` — pgTAP suite (14 assertions) confirming CMS tables exist, anon role holds explicit SELECT grants on every content table, anonymous reads succeed, and anon INSERT is denied.
- `supabase/tests/0003_user_tables_test.sql` — pgTAP suite (10 assertions) exercising owner-scoped RLS on orders and matches, blocking cross-user inserts, rejecting direct voucher minting, and allowing match delete by owner.
- `supabase/tests/0004_shop_tables_test.sql` — pgTAP suite (10 assertions) validating brand-member shop updates, RLS filtering on foreign-brand writes, WITH CHECK on shop/merch inserts, and blocking direct claim minting.
- `supabase/tests/0005_tiein_requests_test.sql` — pgTAP suite (3 assertions) ensuring authenticated users cannot SELECT or INSERT into tiein_requests, leaving intake to the tiein-submit Edge Function service role only.
- `supabase/tests/0006_grant_voucher_test.sql` — pgTAP suite (12 assertions) end-to-end testing grant_voucher campaign matching, JSON condition filters, quota exhaustion fallback, per_user_max and cooldown brakes, WHEN- code format, and anon execute denial.
- `supabase/tests/0007_claim_merch_test.sql` — pgTAP suite (11 assertions) covering claim_merch voucher spend and stock decrement, OUT_OF_STOCK guard, redeem_claim by brand staff, campaign-gated merch, and double-redemption rejection.
- `supabase/tests/0008_hardening_test.sql` — pgTAP suite (6 assertions) verifying TRUNCATE, REFERENCES, TRIGGER, and MAINTAIN privileges are revoked from anon and authenticated on sensitive public tables after the hardening migration.
