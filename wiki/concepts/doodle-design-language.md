---
type: "concept"
status: "current"
title: "Doodle Design Language (เบรค, อีเวน)"
tags: ["concept", "design", "ui", "visual-language", "current"]
created: "2026-06-28"
updated: "2026-06-28"
---

# Doodle Design Language — "เบรค, อีเวน"

> [!key-insight] Current visual direction
> **Doodle** is the active design language for the When? (กี่โมง?) app — a full hand-drawn / sketchbook look where the entire UI appears scribbled in a notebook. It belongs to the **"เบรค, อีเวน" (Break, Even)** family and continues an earlier *hybrid-hand-drawn* prototype.

The name puns on burnout: *เบรค* (brake/break) + *อีเวน* (break **even**). The whole app is framed as **"ที่พักของคนที่ลืมพัก"** — a rest stop for people who forgot to rest. This reframes the core gag (the rider never arrives → forced rest) as a *feature*, and the sketchbook aesthetic sells "you're doodling in a notebook, take a breath."

Source: [[sources/breakeven-doodle-prototype|เบรค, อีเวน — Doodle prototype]] (`.raw/designs/breakeven-doodle-2026-06-28.html`).

## Design tokens

Font: **Mali** (Google Fonts, Thai handwriting), `cursive`.

```
/* sketchbook paper */
--paper:    #FBF8F0   --paper-2: #F4EFE2   --grid: #E4DCC8
/* crayon ink */
--ink:      #3A3530   --ink-soft: #7C746A  --pencil: #5A5450
/* crayon accents */
--crayon-coral:  #F2664B   (primary CTA)
--crayon-blue:   #4D8FC0
--crayon-yellow: #F4C24A   (highlighter)
--crayon-mint:   #6FBE9B
--crayon-grape:  #9B6FC0
/* pastel washes (tile backgrounds) */
--coral-wash: #FCE0DA  --blue-wash: #DCEAF4
--mint-wash:  #DCEFE6  --yellow-wash: #FBEFC9
```

App chrome sits on dark `#26241f`; phone bezel `#17150f`. Paper screens are light.

## Signature techniques

- **Wobble border engine** — hidden SVG `<filter>` (`feTurbulence` fractalNoise + `feDisplacementMap`) applied via `.sketch` (scale 3.2) / `.sketch-2` (scale 2.4). Any element gets jittered hand-drawn edges for ~free.
- **Dotted paper** — `radial-gradient` dot grid (18px) + fractal-noise grain overlay on `.doodle::before/::after`.
- **Crayon shadows** — hard offset `box-shadow` (e.g. `4px 5px 0`), no blur.
- **Imperfect everything** — slight `rotate()` on tiles/cards/CTAs; asymmetric border-radius (`16px 22px 14px 20px`) so corners look hand-drawn.
- **Annotation marks** — `.circled` (hand-drawn ellipse around a word), `.scrib-ul` (highlighter underline), `.scribble-tag` (rotated crayon pill badges), doodled arrows (`↩︎`), tilted rubber `.stamp`.
- **Notebook map** — tracking screen uses a dashed hand-drawn SVG `<path>` route with a sleeping rider 🛵💤 and a 🏠 flag, instead of a real map tile.

## Screens in the prototype

| Screen | Mode | Notes |
|--------|------|-------|
| **Home** | doodle | 6-tile service grid (อาหาร, เรียกรถ, ส่งพัสดุ, มาร์ท, หาคู่, นอนเฉยๆ), nudge note, "สั่งของที่ไม่มีวันถึง →" CTA |
| **Order** | doodle | Hand-drawn menu rows, tilted "สาขาอารมณ์ดี" stamp, joke prices ฿0 / ∞, "87 นาที+" ETA |
| **Track** | notebook | Dashed SVG route, sleeping rider, chat bubbles ("ใกล้ถึงแล้วว! (โกหก)") |
| **Payoff** | doodle | "ตกคลองแสนแสบ! พักครบแล้ว เริ่ด!" + torn-paper consolation voucher (`BM-7X2K`), off-ramp CTAs |

Bottom tabbar (doodled icons): หน้าแรก · กิจกรรม · คูปอง · โปรไฟล์.

## Brand voice

Playful, self-aware Thai; leans into the never-arrives gag as comfort. Examples: prices of ฿0 / ∞ as jokes, "ค่าส่ง ฟรี (เพราะไม่ส่ง)", "ของแถม: ลมหายใจเฮือกใหญ่", payoff = consolation voucher from "สมาคมคนตกคลอง" (the falling-in-the-canal club). Closes the loop back to resting, not to a successful delivery.

## Relationship to shipped UI

> [!note] Direction vs. implementation
> This is a **design-language prototype**, not yet built. The shipped mobile UI uses `mobile/src/ui/theme.ts` tokens, and [[components/dating-ui-polish|Dating UI Polish]] ships a Tinder-style pink deck (`theme.tinder.*`) — a different visual language. Adopting Doodle "as current" means reconciling these: the crayon/sketchbook palette and `Mali` font would replace the current theme tokens. See cross-ref on [[components/dating-ui-polish]].

## Related

- [[sources/breakeven-doodle-prototype|Source: Doodle prototype HTML]]
- [[components/gag-engine|Gag Tracking Engine]] — the never-arrives mechanic the voice is built around
- [[components/dating-ui-polish|Dating UI Polish]] — current shipped visual style (to reconcile)
- [[modules/presentation-layer|Presentation Layer]] — where these tokens would land
