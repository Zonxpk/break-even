---
type: "component"
status: "active"
title: "Dating UI Polish"
tags: ["component", "dating-sim", "mobile", "ui"]
created: "2026-06-13"
updated: "2026-06-13"
commit: "706fb84"
branch: "develop"
---

# Dating UI Polish

Tinder-parody-real presentation layer for the 💘 dating sim. **Game logic unchanged** — daily deck seeding, tier-weighted match rolls, affection drip, story beats, and date orders work exactly as before.

Shipped in commit `706fb84` on `develop` (merged from `feat/dating-ui-polish`).

## What changed

### Swipe deck (`/dating`)

| Before | After |
|--------|-------|
| Static card, tap ✕/♥ buttons | **Pan gestures** — drag left/right/up with rotation |
| Single flat card | **Card stack** — next persona scaled behind |
| No drag feedback | **LIKE / NOPE / SUPER** stamps fade in while dragging |
| Default nav header | Custom pink 💘 header + matches shortcut |
| Two buttons | **5-button Tinder bar** — rewind, ✕, ★, ♥, ⚡ (premium buttons are parody alerts) |

### Matches (`/dating/matches`)

- Avatar glyph, affection % pill, chevron row
- Improved empty state copy

### Chat (`/dating/chat/[id]`)

- `AffectionBar` — fill bar + hint until 30% for date booking
- `ChatBubble` — user vs persona bubble tails
- Beat panel styling; disabled send when empty / sending

## New files

```
mobile/src/dating/ui/
  TinderDeck.tsx      — Reanimated pan + fly-off animations
  TinderCard.tsx      — full-bleed card (photo band, name+age, bio overlay)
  TinderActionBar.tsx — bottom action buttons
  personaVisual.ts    — fake age, card color, emoji per persona
  MatchRow.tsx
  AffectionBar.tsx
  ChatBubble.tsx
  rarity.ts           — Thai rarity labels for badges
```

## Config / infra

- `mobile/babel.config.js` — `react-native-reanimated/plugin`
- `mobile/src/app/_layout.tsx` — `GestureHandlerRootView` wrapper
- `mobile/src/ui/theme.ts` — `theme.dating.*` + `theme.tinder.*` tokens
- `mobile/jest.setup.js` — mocks for reanimated + gesture-handler

## Design docs

- Spec: `docs/superpowers/specs/2026-06-13-dating-ui-polish-design.md`
- Resume: `docs/superpowers/RESUME-dating-ui-polish.md`

## Try it

```bash
cd mobile && npx expo start -c
```

Home → 💘. Drag cards or use bottom buttons. Swipe up (or ★) for super-like parody.

## Verification

- 68/68 Jest tests pass
- `npm run typecheck` clean

> [!note] Different from the current design direction
> This screen's Tinder-style pink theme (`theme.tinder.*`) predates the [[concepts/doodle-design-language|Doodle design language]] now set as the current visual direction. Adopting Doodle would re-skin this deck in the crayon/sketchbook palette and `Mali` font.

## Related

- [[concepts/doodle-design-language|Doodle Design Language]] — current visual direction (to reconcile)
- [[components/dating-sim|Dating Sim]] — domain logic and API
- [[flows/08-dating-sim-daily-swipe-deck|Flow 8: Daily swipe deck]]
- [[flows/09-dating-sim-chat-beats-date-orders|Flow 9: Chat & date orders]]
- [[modules/presentation-layer|Presentation Layer]]
