---
type: "concept"
status: "exploration"
title: "Dating Experience Variants"
tags: ["concept", "design", "dating-sim", "prototype", "doodle"]
created: "2026-06-28"
updated: "2026-06-28"
---

# Dating Experience Variants

Three HTML design prototypes exploring **how the dating-sim experience could differ** — not just restyled, but different *interaction models*. All rendered in the current [[concepts/doodle-design-language|Doodle design language]]. Built via brainstorming → `generate-variations`.

Files: `prototypes/dating-sim/` (open `index.html`).

> [!key-insight] Swipe is the shared entry, not a variant
> Every variant opens on the same Doodle swipe deck (card, fake age, "X.X กม. (โกหก)", rarity badge, LIKE/NOPE/SUPER stamps, ↺✕★♥⚡ bar). After the match, each diverges.

> [!note] Interaction refinements (all three)
> **No visible percentages** — every affection/match-odds % is replaced by qualitative wording ("เริ่มชอบ", "พอเริ่มสนิทกัน", "ไล่ระดับตามแรร์"); V2's affection fill-bar was dropped entirely (a meter is still a meter). The real 70/25/3 × tier odds remain the *mechanic* under the hood, just unsurfaced. **Step navigation** — ◀/▶ crayon arrows flank the phone and swipe-on-frame (left = next, right = prev, 50px threshold, wraps) advances the flow, alongside the top tabs. Kept: km distance, XP, the `n/10` swipe count.

## The three variants

| # | Concept | After the swipe | Screens |
|---|---------|-----------------|---------|
| **V1** | **Ghost-dex** (dating app + Registry) | A dating app that keeps a *passive permanent Registry* of everyone you matched — **not** a collection game. No %/completion, no milestones, no keep-button. Living **Matches** tab + **Registry** archive (all lifecycle states; ghosted/no-showed/unmatched kept forever). Discovery = obscured→reveal per entry. Float parody **achievements** fire on state transitions only. See `docs/adr/0001-registry-not-collection-game.md`. | ปัด → แมตช์(living) → Ghost-dex(registry) → เปิดเอนทรี → ป้ายรางวัล |
| **V2** | **Visual Novel** (dating-sim game) | Match opens a VN route: scene + portrait + branching dialogue choices (reuses the real `beats[]`/`choices[]` engine, affection deltas), every ending doomed/ghosted. | ปัด → แมตช์ → ฉาก+ตัวเลือก → เส้นเรื่อง → ตอนจบ |
| **V3** | **Delulu Radar** | Matches are blips on a sonar sweep; they vanish as you approach and the "(โกหก)" distance resets/grows. Chat a blip before it fades out. | ปัด → แมตช์ → เรดาร์ → แชตกำลังจาง → หายไป |

## Grounding (real values from `mobile/src/dating`)

Prototypes use true mechanics so they read honest — but surface them qualitatively, not numerically: affection starts low and the date unlocks "เมื่อสนิทพอ" (real gate 30%), rarity labels ทั่วไป/หายาก/✨ตำนาน, match odds 70/25/3 × tier (shown as "ไล่ระดับตามแรร์"), `date_ghosted` **+40 XP**, fake distance "(โกหก)". See [[components/dating-sim]] and [[components/dating-ui-polish]].

## Status

Design exploration only — pick a direction before any code. V2 reuses the most existing logic (`beats[]`/`choices[]`). All three would need the Doodle tokens adopted into `mobile/src/ui/theme.ts` per [[concepts/doodle-design-language]].

## Related

- [[concepts/doodle-design-language|Doodle Design Language]] — the locked visual language
- [[components/dating-sim|Dating Sim]] — domain logic these prototypes are grounded in
- [[components/dating-ui-polish|Dating UI Polish]] — current shipped (Tinder/pink) UI
