---
type: "component"
status: "active"
title: "Gag Tracking Engine"
tags: ["component", "gag-engine"]
created: "2026-06-13"
updated: "2026-06-13"
---

# Gag Tracking Engine

Pure domain logic for doomed delivery tracking — script picker, route, path, reducer.

## Key files

- `mobile/src/engine/__tests__/engine.test.ts` — Jest tests for the gag-script engine reducer, covering pure state derivation, incident/sabotage timeline events, backfire effects, and finale transitions.
- `mobile/src/engine/__tests__/path.test.ts` — Jest tests for doomed delivery path generation, verifying anchor snapping, keyframe interpolation, deterministic seeding, and boundary clamping.
- `mobile/src/engine/__tests__/pickScript.test.ts` — Tests for weighted gag script selection: service filtering, seed determinism, weight skew, and empty-pool error handling.
- `mobile/src/engine/__tests__/route.test.ts` — Jest tests for OSRM route fetching with mocked fetch, validating GeoJSON parsing and seeded fallback route generation when the API fails.
- `mobile/src/engine/engine.ts` — Pure reducer that derives live tracking UI state from a gag script timeline, elapsed seconds, and player sabotage actions — powering the order-tracking screen.
- `mobile/src/engine/path.ts` — Builds a doomed rider path from a base route and gag-script events, snapping to map anchors for incidents and finales with seeded random wander.
- `mobile/src/engine/pickScript.ts` — Deterministic weighted random selector that picks an active gag script for a given service using a mulberry32 seed.
- `mobile/src/engine/route.ts` — Fetches driving routes from the public OSRM API and falls back to a deterministic seeded polyline when the network request fails.
- `mobile/src/engine/types.ts` — TypeScript type definitions for the gag-script timeline, engine state snapshot, sabotage actions, and move modes used across the tracking engine.
