---
type: "meta"
title: "Hot Cache"
updated: "2026-06-28"
---

# Recent Context

## Last Updated
2026-06-28. Created the **product+growth roadmap** ([[roadmap]] + Doodle HTML `prototypes/roadmap.html`): เล่นสนุก → ไวรัล → รับสปอนเซอร์. Sponsors framed as downstream of virality; brand-booth sponsor infra is half-built already.

## Key Recent Facts
- **geemong** is a parody super app (When? / กี่โมง?) — rider never arrives
- Monorepo: Supabase backend + Expo React Native + dating sim + merch shop
- **Current design direction**: [[concepts/doodle-design-language|Doodle (เบรค, อีเวน)]] — full hand-drawn sketchbook look: crayon palette, `Mali` font, SVG `feTurbulence`/`feDisplacementMap` wobble borders, dotted paper. Framed as "a rest stop for people who forgot to rest."
- **Not yet built** — design prototype only; shipped UI still uses `theme.ts` (Tinder/pink for [[components/dating-ui-polish]])
- Dating deck is Tinder-style (commit `706fb84`); food has deep browse (`food_*` tables)

## Recent Changes
- [[roadmap]] — **new**: phased roadmap Phase 0 (baseline) → 1 fun → 2 viral → 3 sponsor; Doodle HTML at `prototypes/roadmap.html`. 3 sponsor models ranked by brand-fit (brand booth / sponsored gag / consolation voucher); guardrail: anything needing delivery to succeed = Skip.
- [[marketing/landing-page]] — **new**: built `prototypes/landing/breakeven-landing.html`, a Doodle parody one-pager. **เบรค E'Wen** main title (กี่โมง? headline removed). 5 sections: hero / 6-tile services / how-it-works (never-arrives loop) / สมาคมคนตกคลอง testimonials / `BM-7X2K` voucher. Spec in `docs/superpowers/specs/`.
- [[marketing/marketing-plan]] — 13-section AARRR plan written in-character as geemong's marketing dept. North-star = "นาทีที่ผู้ใช้ได้พัก" (minutes rested); never-arrives = the marketing asset. Fictional metrics, real features; the one real eng deliverable surfaced is the Doodle theme reconciliation. Linked into [[index]] under a new Marketing section.
- [[concepts/dating-experience-variants]] — 3 Doodle HTML prototypes in `prototypes/dating-sim/` (Ghost-dex / VN / Delulu Radar); shared swipe entry, then diverge. % removed; ◀/▶ + swipe step nav added
- [[concepts/doodle-design-language]] — current visual language (from `.raw/designs/breakeven-doodle-2026-06-28.html`)
- [[components/dating-ui-polish]] — flagged: pink Tinder theme predates the Doodle direction

## Active Threads
- Reconcile shipped `theme.ts` / `theme.tinder.*` tokens with the Doodle palette + `Mali` font if Doodle is built (now also open decision #1 in [[marketing/marketing-plan]])
- Wiki is the persistent layer on top of the Understand Anything graph; re-run `/understand` after major refactors
