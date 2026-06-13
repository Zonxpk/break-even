---
type: "meta"
title: "Overview"
status: "active"
tags: ["overview"]
created: "2026-06-13"
updated: "2026-06-13"
---

# geemong (When? / กี่โมง?)

Parody super app where the rider never arrives. Monorepo with a Supabase backend (Postgres migrations, pgTAP tests, Deno Edge Functions), an Expo React Native mobile client, and feature modules for merch shop and dating sim. Note: this project has over 100 source files; consider scoping analysis to a subdirectory for faster results.

## Sub-projects

1. **Supabase backend** — migrations, seed, edge functions, pgTAP tests
2. **Expo mobile client** — parody super-app UI
3. **Dating sim** — swipe, chat, date orders
4. **Merch shop** — voucher claims, brand redemption

## Architecture layers

- [[modules/presentation-layer|Presentation Layer]] — Expo Router screens and shared UI
- [[modules/domain-logic-layer|Domain Logic Layer]] — gag engine, dating, shop, balance
- [[modules/data-access-layer|Data Access Layer]] — Supabase client, API modules, auth
- [[modules/types-layer|Types Layer]] — shared TypeScript contracts
- [[modules/backend-layer|Backend Layer]] — migrations, seed, edge functions
- [[modules/test-layer|Test Layer]] — Jest + pgTAP tests
- [[modules/documentation-layer|Documentation Layer]] — specs, plans, RESUME docs
- [[modules/configuration-layer|Configuration Layer]] — Expo/TS/Jest config
- [[modules/infrastructure-layer|Infrastructure Layer]] — local dev stack scripts

## Start here

Follow [[flows/_index|the guided tour]] or read [[components/gag-engine|Gag Tracking Engine]] for the core mechanic.

## Source

Imported from [[sources/understand-knowledge-graph|Understand graph]] (`.understand-anything/knowledge-graph.json`). Re-run `/understand` to refresh.
