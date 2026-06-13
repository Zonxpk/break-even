---
type: "module"
status: "active"
title: "Documentation Layer"
layer_id: "layer:documentation"
tags: ["module", "documentation-layer"]
created: "2026-06-13"
updated: "2026-06-13"
---

# Documentation Layer

Product specs, implementation plans, RESUME handoff guides, design prototypes, and README files documenting the geemong monorepo and mobile app.

## Files

- `README.md` — Root project guide for the When? (กี่โมง?) parody super-app monorepo — covers Supabase local stack commands, db reset/tests, tiein-submit Edge Function, Expo mobile setup, merch shop, and dating sim entry points.
- `docs/superpowers/RESUME-app-core.md` — Feature resume tracking app-core delivery status — records completed Tasks 1–14 in mobile routes, 34 passing Jest tests, linked Supabase migrations, and remaining optional work (Discord webhook secret, Task 15 simulator checklist, uncommitted git state).
- `docs/superpowers/RESUME-dating-sim.md` — Feature resume for the dating sim module — documents swipe deck, matches, scripted/LLM chat, date booking through the order pipeline, content polish (story beats, affection drip, SpotPicker), and deferred v1 items like OAuth and secure API key storage.
- `docs/superpowers/RESUME-merch-shop.md` — Feature resume for the merch shop module — covers Bangkok shop schedule utilities, shop API with claim/redeem RPCs, home teaser, merch screens, vouchers claims section, brand mode, and deferred v1 brand editing and QR scanning.
- `docs/superpowers/plans/2026-06-11-when-app-core.md` — Master implementation plan for the Expo mobile app core — 15 TDD tasks covering scaffold, Supabase client, loyalty balance, pure gag engine, auth, tab shell, order flow screens, tracking/fail payoff, activity/profile tabs, partner tie-in form, and final verification.
- `docs/superpowers/plans/2026-06-11-when-backend-foundation.md` — Supabase backend foundation plan — ten tasks for CLI scaffolding, profiles trigger, content and user tables, shop RLS, tie-in requests, grant_voucher and claim_merch RPCs, tiein-submit Edge Function, and seed data with pgTAP coverage.
- `docs/superpowers/plans/2026-06-13-dating-sim-content-polish.md` — Follow-up polish plan for the dating sim — seven tasks adding distance jokes, affection drip with chat sessions, story beat seed content, chat screen wiring, SpotPicker UI, swipe deck polish, and resume doc updates.
- `docs/superpowers/plans/2026-06-13-when-dating-sim.md` — Dating sim feature plan — ten tasks for persona API, deterministic daily deck, tier-scaled swipe resolution, match list, scripted chat with story beats, date booking into the gag pipeline, ghosted voucher payoff, and LLM connector stub.
- `docs/superpowers/plans/2026-06-13-when-merch-shop.md` — Merch shop and brand mode plan — eight tasks for Bangkok shop schedule utilities, shop API types, home teaser, merch claim screens, vouchers claims section, brand gate with redeem scanner, and verification docs.
- `docs/superpowers/specs/2026-06-11-when-geemong-design.md` — Approved master design spec for When? (กี่โมง?) — defines product principles, two-deployable architecture (Expo + Supabase), four sub-project decomposition, shared order pipeline, client-side gag engine, dating sim loop, loyalty tiers, voucher campaigns, merch shop, brand mode, data model, and testing strategy.
- `docs/superpowers/specs/2026-06-13-dating-sim-content-polish-design.md` — Follow-up design spec for dating sim content polish — five-beat persona arcs in seed data, chat affection drip with session caps, hybrid SpotPicker list/map modal, swipe card rarity styling, and affection economy balance targeting the 30% date unlock threshold.
- `mobile/AGENTS.md` — Agent coding directive for the mobile app — mandates reading Expo SDK v56 versioned docs before writing any code, reflecting breaking changes in the current Expo generation.
- `mobile/CLAUDE.md` — Claude-specific pointer file that includes AGENTS.md via @AGENTS.md, delegating all mobile coding rules to the shared agent guidance document.
- `mobile/README.md` — Standard Expo create-expo-app getting-started guide covering npm install, expo start, file-based routing in the app directory, reset-project script, and links to ESLint, Jest, and TypeScript setup docs.
- `docs/superpowers/specs/2026-06-11-when-geemong-design.html` — Self-contained interactive HTML prototype of the When? super app — phone-frame UI with tab shell, five-service order flow, gag-engine timeline demo, dating swipe deck, merch shop, tie-in form, and LLM connector, persisting demo state in localStorage.
