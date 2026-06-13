---
type: "module"
status: "active"
title: "Types Layer"
layer_id: "layer:types"
tags: ["module", "types-layer"]
created: "2026-06-13"
updated: "2026-06-13"
---

# Types Layer

Shared TypeScript contracts — generated Supabase database types and platform-specific module declarations used across the mobile client.

## Files

- `mobile/src/types/db.ts` — Shared TypeScript domain types mirroring Supabase tables and app entities: profiles, orders, vouchers, shop, personas, and matches.
- `mobile/src/types/declarations.d.ts` — Ambient TypeScript module declarations teaching the compiler how to import plain and CSS-module stylesheets as string record objects on web builds.
