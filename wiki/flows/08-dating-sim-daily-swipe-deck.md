---
type: "flow"
status: "active"
order: 8
title: "Dating Sim: Daily Swipe Deck"
tags: ["flow", "tour"]
created: "2026-06-13"
updated: "2026-06-13"
---

# Dating Sim: Daily Swipe Deck

The dating sim is sub-project 3, surfaced from the home screen. `dating/index.tsx` renders a daily persona deck — users swipe right or left on Thai delivery-rider personas. `dating/deck.ts` builds a deterministic daily stack (seeded by user ID + date, capped to one legendary card). `dating/swipe.ts` resolves right swipes against tier- and rarity-adjusted match odds from the balance module. `api/personas.ts` fetches personas and creates match records in Supabase.

## Files in this step

- `mobile/src/app/dating/index.tsx` — Expo Router dating deck screen where users swipe through a daily persona stack, earn loyalty XP on rejection, and create matches via tier-weighted RNG.
- `mobile/src/dating/deck.ts` — Builds a deterministic daily persona deck by hashing user ID and date into a seed, shuffling with mulberry32, and capping legendary cards to one of ten slots.
- `mobile/src/dating/swipe.ts` — Resolves a right swipe as match or reject by rolling mulberry32 against the tier- and rarity-adjusted match probability from the balance module.
- `mobile/src/api/personas.ts` — Supabase API layer for dating personas and user matches — fetches active personas, lists matches with joined persona data, and creates or updates match records.
