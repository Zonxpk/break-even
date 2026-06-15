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

The dating sim is sub-project 3, surfaced from the home screen. `dating/index.tsx` renders a **Tinder-style** daily persona deck — users **drag** cards left/right/up or tap the action bar (✕ / ♥ / ★). `TinderDeck.tsx` handles pan gestures and fly-off animations; `TinderCard.tsx` shows full-bleed cards with fake age, distance, and bio overlay. Under the hood, `dating/deck.ts` still builds a deterministic daily stack (seeded by user ID + date, capped to one legendary card) and `dating/swipe.ts` resolves match odds from the balance module. See [[components/dating-ui-polish|Dating UI Polish]] for UI details.

## Files in this step

- `mobile/src/app/dating/index.tsx` — Deck screen wiring: swipe handlers, XP on reject, match creation, custom header.
- `mobile/src/dating/ui/TinderDeck.tsx` — Gesture + animation layer (card stack, LIKE/NOPE/SUPER stamps).
- `mobile/src/dating/ui/TinderCard.tsx` — Persona card presentation.
- `mobile/src/dating/ui/TinderActionBar.tsx` — Bottom action buttons.
- `mobile/src/dating/ui/personaVisual.ts` — Fake age, card color, emoji from persona id.
- `mobile/src/dating/deck.ts` — Builds a deterministic daily persona deck by hashing user ID and date into a seed, shuffling with mulberry32, and capping legendary cards to one of ten slots.
- `mobile/src/dating/swipe.ts` — Resolves a right swipe as match or reject by rolling mulberry32 against the tier- and rarity-adjusted match probability from the balance module.
- `mobile/src/api/personas.ts` — Supabase API layer for dating personas and user matches — fetches active personas, lists matches with joined persona data, and creates or updates match records.
