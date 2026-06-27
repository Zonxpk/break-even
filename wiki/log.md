---
type: "meta"
title: "Wiki Log"
tags: ["log"]
updated: "2026-06-28"
---

# Wiki Log

## 2026-06-28 — Roadmap (เล่นสนุก → ไวรัล → สปอนเซอร์)

- New page: [[roadmap]] — phased product+growth roadmap (Phase 0 baseline → 1 fun → 2 viral → 3 sponsor)
- Built Doodle-styled HTML version `prototypes/roadmap.html` (reuses เบรค,อีเวน palette/Mali/wobble engine)
- Sponsor strategy grounded in existing [[components/merch-shop]] brand booth + `redeem_claim`; guardrail = never sell out the never-arrives gag
- Updated [[index]] (Navigation), [[hot]]
- Key insight: sponsors are downstream of virality; sponsor surface is half-built already (brand booth)

## 2026-06-28 — Landing page (Break E'Wen, Doodle parody)

- Built `prototypes/landing/breakeven-landing.html` — single self-contained Doodle one-pager
- **Brand decision:** removed the กี่โมง? hook headline; main title is now **เบรค E'Wen** for outward marketing
- 5 sections: hero / 6-tile services / how-it-works (never-arrives loop) / สมาคมคนตกคลอง testimonials / consolation voucher `BM-7X2K`
- Grounded in [[concepts/doodle-design-language]] tokens + voice; spec at `docs/superpowers/specs/2026-06-28-breakeven-landing-design.md`
- New page: [[marketing/landing-page]]; updated [[index]], [[hot]]

## 2026-06-28 — Marketing plan (in-world satire, AARRR)

- Combined `marketing-skills:marketing-plan` (13-section AARRR spine) with the wiki's 6 features + Doodle bible
- New page: [[marketing/marketing-plan]] — written in-character as geemong's marketing dept; never-arrives mechanic as the central marketing asset; fictional metrics, real features
- Grounded in [[concepts/doodle-design-language]] voice ("ที่พักของคนที่ลืมพัก", "ค่าส่ง ฟรี เพราะไม่ส่ง", "สมาคมคนตกคลอง", ฿0/∞) and all 6 components
- Updated [[index]] (new Marketing section), [[hot]]
- Key insight: parody product → real plan structure as the joke's deadpan frame; only real eng deliverable surfaced is Doodle theme reconciliation

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
