---
type: "flow"
status: "active"
order: 9
title: "Dating Sim: Chat, Beats & Date Orders"
tags: ["flow", "tour"]
created: "2026-06-13"
updated: "2026-06-13"
---

# Dating Sim: Chat, Beats & Date Orders

Matched personas appear in `dating/matches.tsx` and open into `dating/chat/[matchId].tsx` — the most complex screen in the app. Chat history persists locally via `chatStorage.ts` and `chatSession.ts`. Persona replies come from optional BYO Anthropic API (`llm.ts`) with `chat.ts` scripted fallback. Story beats unlock by affection threshold; `affectionDrip.ts` caps per-session gains. Users can book a 'date' service order through `bookDate.ts`, which reuses the doomed delivery engine — and failed date orders inject a persona apology back into chat.

## Files in this step

- `mobile/src/app/dating/matches.tsx` — Dating matches list screen showing matched personas with affection percentage and navigation into per-match chat.
- `mobile/src/app/dating/chat/[matchId].tsx` — Dating chat screen combining message history, scripted story beats, affection drip on send, XP grants on beat choices, and date-order placement via SpotPicker.
- `mobile/src/dating/chat.ts` — Pure dating chat helpers for canned scripted replies, selecting the next story beat by affection threshold, and applying beat choice deltas.
- `mobile/src/dating/affectionDrip.ts` — Defines chat affection drip constants and computes whether a user message should grant +1 affection within a capped session budget.
- `mobile/src/dating/chatStorage.ts` — Local AsyncStorage chat log for dating matches, appending user/persona messages and delegating persona replies to the LLM layer with scripted fallback.
- `mobile/src/dating/llm.ts` — Optional BYO Anthropic API integration for dating replies with AsyncStorage key persistence and scriptedReply fallback when the key or network fails.
- `mobile/src/dating/bookDate.ts` — Dating feature adapter that places a 'date' service order with match, persona, and meetup spot metadata.
