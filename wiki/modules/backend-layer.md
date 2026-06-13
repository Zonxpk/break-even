---
type: "module"
status: "active"
title: "Backend Layer"
layer_id: "layer:backend"
tags: ["module", "backend-layer"]
created: "2026-06-13"
updated: "2026-06-13"
---

# Backend Layer

Supabase Postgres schema (migrations, seed data, patches), edge functions (tie-in submit), RPC definitions, and pgTAP database tests that enforce RLS and business rules server-side.

## Files

- `supabase/config.toml` — Supabase CLI local stack configuration for project geemong — Postgres 17 ports, enabled auth with anonymous sign-in, seed.sql on db reset, edge runtime for Deno functions, and verify_jwt pinned on tiein-submit.
- `supabase/functions/tiein-submit/index.ts` — Supabase Deno Edge Function that accepts authenticated POST tie-in partner registrations, validates the payload, inserts into tiein_requests with the service role, and optionally pings Discord.
- `supabase/functions/tiein-submit/validate.ts` — Pure validation module for tie-in partner form payloads, enforcing required string fields with per-field max lengths and returning a typed success or error result.
- `supabase/migrations/20260611000001_profiles.sql` — One row per auth user storing nickname, loyalty XP, and tier (silver–vip) with a foreign key to auth.users.
- `supabase/migrations/20260611000001_profiles.sql` — Initial migration creating the profiles table with loyalty tier columns, owner-only RLS, column-scoped grants, and an auth.users trigger that auto-inserts a profile on signup.
- `supabase/migrations/20260611000002_content_tables.sql` — Partner brand records with logo, contact info, and active/inactive status for tie-in merchandising and mascot personas.
- `supabase/migrations/20260611000002_content_tables.sql` — Browsable menu items per delivery service (food, ride, parcel, mart) with display price, optional brand tie-in, and sort order for the parody order flow.
- `supabase/migrations/20260611000002_content_tables.sql` — CMS migration defining brands, catalog items, gag scripts/anchors, dating personas, and voucher campaigns with public read policies and documented JSONB schemas for timelines and trigger conditions.
- `supabase/migrations/20260611000002_content_tables.sql` — Named map anchor points (canal, 7-Eleven, temple, market) with lat/lng used by the path engine for doomed-route gags.
- `supabase/migrations/20260611000002_content_tables.sql` — Weighted gag timelines (JSONB) consumed by the client engine to choreograph fake delivery tracking, chat beats, and finales.
- `supabase/migrations/20260611000002_content_tables.sql` — Dating-sim character definitions with rarity, system prompt, story beats JSON, and optional brand mascot linkage.
- `supabase/migrations/20260611000002_content_tables.sql` — Configurable prize campaigns with trigger events, JSON conditions, quotas, code modes, and fallback evergreen consolation prizes.
- `supabase/migrations/20260611000003_user_tables.sql` — Dating matches pairing a user to a persona with affection score and completed story beats, unique per user-persona pair.
- `supabase/migrations/20260611000003_user_tables.sql` — Per-user gag delivery orders linking a service, cart JSON, chosen gag script, RNG seed, and tracking/failed status.
- `supabase/migrations/20260611000003_user_tables.sql` — User-owned transactional tables for gag orders, RPC-minted vouchers, and dating matches with strict owner RLS and column-level grants limiting client writes.
- `supabase/migrations/20260611000003_user_tables.sql` — User voucher wallet rows minted only via grant_voucher RPC; clients have select-only access with campaign and code metadata.
- `supabase/migrations/20260611000004_shop_tables.sql` — Maps authenticated users to brands they may edit in brand self-service mode.
- `supabase/migrations/20260611000004_shop_tables.sql` — Merch redemption claims recording spent voucher IDs and a unique WHEN- prefixed pickup code; written only by claim_merch/redeem_claim RPCs.
- `supabase/migrations/20260611000004_shop_tables.sql` — Shop inventory items priced in vouchers with optional campaign requirement, stock count, and redemption instructions.
- `supabase/migrations/20260611000004_shop_tables.sql` — Pop-up merch shop schema with brand membership, scheduled shops, voucher-priced items, and claims; RLS lets brand editors manage only their brand's inventory.
- `supabase/migrations/20260611000004_shop_tables.sql` — Time-windowed pop-up shops per brand with JSON schedule windows consumed by the client schedule module.
- `supabase/migrations/20260611000005_tiein_requests.sql` — Locked-down tie-in partner intake table with RLS enabled but no client policies; only the tiein-submit Edge Function (service role) may insert rows.
- `supabase/migrations/20260611000005_tiein_requests.sql` — Stores brand partnership form submissions (company, contact, merch description, budget range) with no anon/authenticated access.
- `supabase/migrations/20260611000006_grant_voucher.sql` — Defines the grant_voucher security-definer RPC that atomically selects a matching campaign, increments quota, mints a voucher row, and falls back to an evergreen campaign when no rules match.
- `supabase/migrations/20260611000007_claim_merch.sql` — Merch redemption RPCs that lock inventory and vouchers, spend the required voucher count, decrement stock, and mint claims with pickup codes in one transaction.
- `supabase/migrations/20260611000008_revoke_truncate.sql` — Security hardening migration revoking TRUNCATE, REFERENCES, TRIGGER, and MAINTAIN privileges on all public tables from anon and authenticated roles, including default privileges for future tables.
- `supabase/patches/2026-06-13-persona-beats.sql` — Idempotent content-polish patch that updates story beats JSON and bios for all three seeded personas (ใบเตย, ภูผา, หมีโต) by fixed UUID, safe to re-run on cloud without re-seeding.
- `supabase/seed.sql` — Two active demo partner brands (น้ำพริกแม่ประนอม, ชานมไข่มุกพี่หมีโต) used for tie-in catalog items and mascot personas.
- `supabase/seed.sql` — Six browsable menu entries across food, mart, ride, and parcel services including one brand tie-in product placement.
- `supabase/seed.sql` — Seven Bangkok-themed map anchors (canals, 7-Eleven, temple, market) with approximate lat/lng coordinates for the doomed-route engine.
- `supabase/seed.sql` — Two weighted gag timelines — a full food delivery run and a date ghosting script — with ETA, chat, incident, sabotage, and canal finale events.
- `supabase/seed.sql` — Two voucher-priced merch SKUs (เสื้อยืดตกคลอง, หมวกไรเดอร์หลงทาง) tied to the demo pop-up shop with stock and QR redemption instructions.
- `supabase/seed.sql` — Three dating personas (common, rare, legendary) with Thai bios, system prompts, five-beat story JSON, and optional brand mascot linkage for หมีโต.
- `supabase/seed.sql` — Development seed script populating Bangkok gag anchors, demo brands, catalog items, food/date gag scripts, dating personas with beats, voucher campaigns, and a Friday pop-up merch shop with two claimable items.
- `supabase/seed.sql` — Demo pop-up shop for brand หมีโต with a Friday 18:00–22:00 Bangkok schedule window in June 2026.
- `supabase/seed.sql` — Three prize campaigns — food failure coupon, canal-exclusive bubble tea, and evergreen consolation fallback with cooldown spam brakes documented inline.
