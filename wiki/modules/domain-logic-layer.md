---
type: "module"
status: "active"
title: "Domain Logic Layer"
layer_id: "layer:domain"
tags: ["module", "domain-logic-layer"]
created: "2026-06-13"
updated: "2026-06-13"
---

# Domain Logic Layer

Core parody business rules: the order-tracking engine (routes, scripts, RNG paths), dating-sim mechanics (swipe, chat, affection), shop scheduling, and balance ledger calculations.

## Files

- `mobile/src/balance/balance.ts` — Defines loyalty XP reward constants, tier ladder thresholds, and a match-chance formula that scales by user tier and persona rarity with hard caps.
- `mobile/src/dating/affectionDrip.ts` — Defines chat affection drip constants and computes whether a user message should grant +1 affection within a capped session budget.
- `mobile/src/dating/bookDate.ts` — Dating feature adapter that places a 'date' service order with match, persona, and meetup spot metadata.
- `mobile/src/dating/chat.ts` — Pure dating chat helpers for canned scripted replies, selecting the next story beat by affection threshold, and applying beat choice deltas.
- `mobile/src/dating/chatSession.ts` — AsyncStorage-backed chat session tracker storing per-match message counts, affection gained, and TTL-based expiry for drip calculations.
- `mobile/src/dating/chatStorage.ts` — Local AsyncStorage chat log for dating matches, appending user/persona messages and delegating persona replies to the LLM layer with scripted fallback.
- `mobile/src/dating/deck.ts` — Builds a deterministic daily persona deck by hashing user ID and date into a seed, shuffling with mulberry32, and capping legendary cards to one of ten slots.
- `mobile/src/dating/distanceJoke.ts` — Generates humorous fake kilometer distances for dating personas and meetup anchors using seeded mulberry32 output, always suffixing results with a Thai '(lying)' label.
- `mobile/src/dating/llm.ts` — Optional BYO Anthropic API integration for dating replies with AsyncStorage key persistence and scriptedReply fallback when the key or network fails.
- `mobile/src/dating/swipe.ts` — Resolves a right swipe as match or reject by rolling mulberry32 against the tier- and rarity-adjusted match probability from the balance module.
- `mobile/src/engine/engine.ts` — Pure reducer that derives live tracking UI state from a gag script timeline, elapsed seconds, and player sabotage actions — powering the order-tracking screen.
- `mobile/src/engine/path.ts` — Builds a doomed rider path from a base route and gag-script events, snapping to map anchors for incidents and finales with seeded random wander.
- `mobile/src/engine/pickScript.ts` — Deterministic weighted random selector that picks an active gag script for a given service using a mulberry32 seed.
- `mobile/src/engine/route.ts` — Fetches driving routes from the public OSRM API and falls back to a deterministic seeded polyline when the network request fails.
- `mobile/src/engine/types.ts` — TypeScript type definitions for the gag-script timeline, engine state snapshot, sabotage actions, and move modes used across the tracking engine.
- `mobile/src/services/config.ts` — Static UI configuration map for each delivery service (food, ride, parcel, mart) with Thai labels, CTAs, and accent colors.
- `mobile/src/shop/schedule.ts` — Bangkok-timezone shop schedule utilities that evaluate open windows, compute milliseconds until next opening, and format Thai countdown strings for the merch pop-up.
