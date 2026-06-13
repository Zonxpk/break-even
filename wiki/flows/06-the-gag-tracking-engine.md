---
type: "flow"
status: "active"
order: 6
title: "The Gag Tracking Engine"
tags: ["flow", "tour"]
created: "2026-06-13"
updated: "2026-06-13"
---

# The Gag Tracking Engine

The engine in `mobile/src/engine/` is pure domain logic — no React, no Supabase. `pickScript.ts` selects a weighted gag script using a mulberry32 seed from `lib/rng.ts`. `route.ts` fetches an OSRM driving route (with seeded fallback). `path.ts` builds a doomed rider path that snaps to gag anchors for incidents and finales. `engine.ts` is a reducer that replays the script timeline plus player sabotage backfires into live UI state. `types.ts` defines the timeline, state snapshot, and sabotage action contracts.

## Files in this step

- `mobile/src/engine/engine.ts` — Pure reducer that derives live tracking UI state from a gag script timeline, elapsed seconds, and player sabotage actions — powering the order-tracking screen.
- `mobile/src/engine/path.ts` — Builds a doomed rider path from a base route and gag-script events, snapping to map anchors for incidents and finales with seeded random wander.
- `mobile/src/engine/route.ts` — Fetches driving routes from the public OSRM API and falls back to a deterministic seeded polyline when the network request fails.
- `mobile/src/engine/pickScript.ts` — Deterministic weighted random selector that picks an active gag script for a given service using a mulberry32 seed.
- `mobile/src/engine/types.ts` — TypeScript type definitions for the gag-script timeline, engine state snapshot, sabotage actions, and move modes used across the tracking engine.
- `mobile/src/lib/rng.ts` — Exports mulberry32, a deterministic 32-bit PRNG whose cross-platform stability is required for replayable gag-engine and dating outcomes.
