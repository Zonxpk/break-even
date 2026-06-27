---
type: "meta"
title: "Hot Cache"
updated: "2026-06-28"
---

# Recent Context

## Last Updated
2026-06-28. Built 3 dating-sim experience prototypes in the **Doodle** language (now the current visual direction).

## Key Recent Facts
- **geemong** is a parody super app (When? / กี่โมง?) — rider never arrives
- Monorepo: Supabase backend + Expo React Native + dating sim + merch shop
- **Current design direction**: [[concepts/doodle-design-language|Doodle (เบรค, อีเวน)]] — full hand-drawn sketchbook look: crayon palette, `Mali` font, SVG `feTurbulence`/`feDisplacementMap` wobble borders, dotted paper. Framed as "a rest stop for people who forgot to rest."
- **Not yet built** — design prototype only; shipped UI still uses `theme.ts` (Tinder/pink for [[components/dating-ui-polish]])
- Dating deck is Tinder-style (commit `706fb84`); food has deep browse (`food_*` tables)

## Recent Changes
- [[concepts/dating-experience-variants]] — 3 Doodle HTML prototypes in `prototypes/dating-sim/` (Ghost-dex / VN / Delulu Radar); shared swipe entry, then diverge. **Latest:** all % removed (qualitative wording, no meters); ◀/▶ arrows + swipe-on-frame step nav added to all 3
- [[concepts/doodle-design-language]] — current visual language (from `.raw/designs/breakeven-doodle-2026-06-28.html`)
- [[sources/breakeven-doodle-prototype]] — provenance for the prototype HTML
- [[components/dating-ui-polish]] — flagged: pink Tinder theme predates the Doodle direction

## Active Threads
- Reconcile shipped `theme.ts` / `theme.tinder.*` tokens with the Doodle palette + `Mali` font if Doodle is built
- Wiki is the persistent layer on top of the Understand Anything graph; re-run `/understand` after major refactors
