---
type: "meta"
title: "Wiki Log"
tags: ["log"]
updated: "2026-06-28"
---

# Wiki Log

## 2026-06-28 — Variant prototypes: drop percentages + add step nav

- Stripped every user-facing affection/odds **%** from all 3 prototypes → qualitative wording; removed V2's affection fill-bar (a meter is still a meter)
- Added **step navigation** to all 3: ◀/▶ crayon arrows + swipe-on-frame (left=next, right=prev, wraps), alongside top tabs
- Real 70/25/3 × tier odds + 30% gate remain the *mechanic*, just unsurfaced; kept km / XP / `n/10` count
- Updated [[concepts/dating-experience-variants]]
- Key insight: parody dating app shows *feeling* ("เริ่มชอบ"), not numbers — meters undercut the self-aware tone

## 2026-06-28 — Dating experience variant prototypes (Doodle)

- Brainstormed → built 3 self-contained HTML prototypes in `prototypes/dating-sim/`
- V1 Ghost-dex (Tinder × Pokédex), V2 Visual Novel, V3 Delulu Radar — all share a Doodle swipe-deck entry, then diverge
- Grounded in real `mobile/src/dating` values (5% start, 30% gate, 70/25/3 rarity, +40 XP, "(โกหก)")
- New wiki page: [[concepts/dating-experience-variants]]; updated [[index]], [[hot]]
- Key insight: variants differ by *experience/interaction model*, not just skin; swipe is the shared entry feature, not a variant

## 2026-06-28 ingest — Doodle design language (เบรค, อีเวน)

- Source: `.raw/designs/breakeven-doodle-2026-06-28.html` (archived from Downloads)
- Summary: [[sources/breakeven-doodle-prototype]]
- Pages created: [[concepts/doodle-design-language]], [[sources/breakeven-doodle-prototype]]
- Pages updated: [[index]], [[components/dating-ui-polish]], [[hot]]
- Key insight: Hand-drawn "sketchbook" visual language set as the **current** design direction — crayon palette, `Mali` font, SVG wobble borders. Reframes the never-arrives gag as "a rest stop for people who forgot to rest." Differs from the shipped Tinder/pink UI, which would need re-skinning.

## 2026-06-13 — Dating UI polish (`706fb84`)

- Merged `feat/dating-ui-polish` → `develop`
- Tinder-style swipe deck: pan gestures, card stack, action bar, Reanimated
- Polished matches list + chat bubbles/affection bar
- New wiki page: [[components/dating-ui-polish]]
- Updated flows [[flows/08-dating-sim-daily-swipe-deck|8]] and [[flows/09-dating-sim-chat-beats-date-orders|9]]

## 2026-06-13 — Initial scaffold from /understand

- Created Mode B repository wiki structure
- Imported knowledge graph (275 nodes, 902 edges)
- Created 9 module pages (architectural layers)
- Created 12 flow pages (guided tour)
- Created 5 component pages (feature areas)
- Copied graph snapshot to `.raw/understand-knowledge-graph.json`
