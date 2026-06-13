# Dating Sim UI Polish — Design Spec

**Date:** 2026-06-13  
**Status:** Approved for prototype → production fold-in  
**Branch:** `feat/dating-ui-polish` (worktree)

## Goal

Make the 💘 dating flow feel **Grab-parody-real** — intentional hierarchy, press feedback, and Thai dating-app tropes — without changing game logic (swipe rolls, affection drip, beats, date booking).

## Screens in scope

| Screen | Route | Pain today |
|--------|-------|------------|
| Swipe deck | `/dating` | Flat card, emoji photo, tiny action buttons, hardcoded hex |
| Matches | `/dating/matches` | Plain rows, no avatar/last-message preview |
| Chat | `/dating/chat/[id]` | Basic bubbles, weak affection bar, beat panel blends in |

## Aesthetic direction

- **Tone:** Playful Thai super-app parody — confident green primary, soft rose for romance actions, amber for rare/legendary
- **Density:** Mobile-first; one hero element per screen (card, match row, chat thread)
- **Tokens:** Extend `theme.ts` with `dating.*` — no scattered `#FEF3C7` in screens

## Three prototype variants (swipe deck)

Evaluated on `/dating/prototype?variant=A|B|C`:

| Variant | Name | Structure |
|---------|------|-----------|
| **A** | Stack | Full card: photo band → chips → name/bio → labeled ✕ / ♥ actions with press states |
| **B** | Editorial | Left-aligned type, slim inset card, text+icon actions |
| **C** | Sticker | Parody badges (verified, “ออนไลน์”), stacked chips, chunky sticker actions |

**Pick for production:** **A + C hybrid** — Stack layout (A) with parody badge row (C). B too quiet for When? tone.

## Production components

```
mobile/src/dating/ui/
  rarity.ts           — rarity badge + card border from theme
  DeckProgress.tsx    — “วันนี้ปัดไปแล้ว n/10” + thin progress bar
  SwipeCard.tsx       — hero card (winner layout)
  SwipeActions.tsx    — ✕ / ♥ with pressed + accessibilityLabel
  MatchRow.tsx        — avatar glyph, name, affection pill, chevron
  AffectionBar.tsx    — % + fill bar for chat header
  ChatBubble.tsx      — user vs persona bubbles + timestamp optional skip
  PrototypeSwitcher.tsx — __DEV__ only bottom bar
  SwipeCardVariants.tsx — A/B/C for prototype route
```

## Interaction states (polish-pass)

- All `Pressable`: `opacity` or `scale(0.96)` on `pressed`
- Swipe buttons: min 64×64 hit targets (already); add `accessibilityRole="button"` + Thai labels
- Send button: `disabled` style when `sending` or empty input
- Match rows: pressed background darken

## Non-goals

- Real photos / image upload
- Swipe gestures (keep tap buttons)
- Animation libraries
- Logic changes to deck, swipe, chat, beats

## Verification

```bash
cd mobile && npm test && npm run typecheck
```

Manual: Home → 💘 → deck polish; matches list; chat affection bar + bubbles.
