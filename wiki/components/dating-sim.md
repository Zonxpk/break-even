---
type: "component"
status: "active"
title: "Dating Sim"
tags: ["component", "dating-sim"]
created: "2026-06-13"
updated: "2026-06-13"
---

# Dating Sim

Swipe deck, chat, affection, LLM replies, date orders.

## Key files

- `mobile/src/app/dating/chat/[matchId].tsx` — Dating chat screen combining message history, scripted story beats, affection drip on send, XP grants on beat choices, and date-order placement via SpotPicker.
- `mobile/src/app/dating/index.tsx` — Expo Router dating deck screen where users swipe through a daily persona stack, earn loyalty XP on rejection, and create matches via tier-weighted RNG.
- `mobile/src/app/dating/matches.tsx` — Dating matches list screen showing matched personas with affection percentage and navigation into per-match chat.
- `mobile/src/dating/__tests__/affectionDrip.test.ts` — Parameterized unit tests verifying chatAffectionGain drip cadence and session cap behavior.
- `mobile/src/dating/__tests__/chat.test.ts` — Tests story-beat selection order and affection deltas for nextBeat and applyBeatChoice against fixture persona beats.
- `mobile/src/dating/__tests__/deck.test.ts` — Tests daily deck seed stability per user and date, deterministic persona shuffling, and the rule capping legendary personas to at most one per deck.
- `mobile/src/dating/__tests__/distanceJoke.test.ts` — Jest tests verifying fakeDistanceKm and anchorDistanceKm produce stable Thai-labeled distance strings with the expected format and seed behavior.
- `mobile/src/dating/__tests__/swipe.test.ts` — Statistical tests for resolveSwipe verifying legendary personas rarely match at silver tier while common personas usually match at VIP tier.
- `mobile/src/dating/affectionDrip.ts` — Defines chat affection drip constants and computes whether a user message should grant +1 affection within a capped session budget.
- `mobile/src/dating/bookDate.ts` — Dating feature adapter that places a 'date' service order with match, persona, and meetup spot metadata.
- `mobile/src/dating/chat.ts` — Pure dating chat helpers for canned scripted replies, selecting the next story beat by affection threshold, and applying beat choice deltas.
- `mobile/src/dating/chatSession.ts` — AsyncStorage-backed chat session tracker storing per-match message counts, affection gained, and TTL-based expiry for drip calculations.
- `mobile/src/dating/chatStorage.ts` — Local AsyncStorage chat log for dating matches, appending user/persona messages and delegating persona replies to the LLM layer with scripted fallback.
- `mobile/src/dating/deck.ts` — Builds a deterministic daily persona deck by hashing user ID and date into a seed, shuffling with mulberry32, and capping legendary cards to one of ten slots.
- `mobile/src/dating/distanceJoke.ts` — Generates humorous fake kilometer distances for dating personas and meetup anchors using seeded mulberry32 output, always suffixing results with a Thai '(lying)' label.
- `mobile/src/dating/llm.ts` — Optional BYO Anthropic API integration for dating replies with AsyncStorage key persistence and scriptedReply fallback when the key or network fails.
- `mobile/src/dating/swipe.ts` — Resolves a right swipe as match or reject by rolling mulberry32 against the tier- and rarity-adjusted match probability from the balance module.
