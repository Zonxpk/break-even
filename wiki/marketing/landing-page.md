---
type: "component"
status: "current"
title: "Break E'Wen Landing Page"
tags: ["marketing", "landing", "doodle", "prototype", "current"]
created: "2026-06-28"
updated: "2026-06-28"
---

# Break E'Wen — Parody Landing Page

> [!key-insight] Brand decision
> The landing page is titled **เบรค E'Wen** (not กี่โมง?). The กี่โมง?/When?
> hook headline was **removed**; the [[concepts/doodle-design-language|เบรค, อีเวน (Break, Even)]]
> family name is now the main wordmark for outward-facing marketing.

Single self-contained HTML file: `prototypes/landing/breakeven-landing.html`.
Inline CSS, Google Fonts `Mali`, inline SVG wobble filter. No build, no JS
framework — opens in any browser. Built faithfully on the Doodle tokens.

## Goal

Parody **showcase** that sells the bit: a super app whose rider never arrives,
reframed as **"ที่พักของคนที่ลืมพัก"** (a rest stop for people who forgot to rest).

## Sections

1. **Hero** — wordmark **เบรค E'Wen**, tagline *ที่พักของคนที่ลืมพัก*, primary CTA
   "สั่งของที่ไม่มีวันถึง →", sleeping-rider 🛵💤. Subline circles "ไรเดอร์ไม่เคยมาถึง".
2. **Services grid** — 6 wobbly tiles (อาหาร · เรียกรถ · ส่งพัสดุ · มาร์ท · หาคู่ · นอนเฉยๆ)
   with joke pricing (฿0 / ฿∞, "ค่าส่ง ฟรี เพราะไม่ส่ง", "87 นาที+").
3. **How it works** — สั่ง → ไรเดอร์หลับ → คุณได้พัก → คูปองปลอบใจ (the never-arrives
   loop as a feature).
4. **Testimonials** — 3 rotated cards from "สมาคมคนตกคลอง" members.
5. **Footer** — torn-paper consolation voucher `BM-7X2K` + "ของแถม: ลมหายใจเฮือกใหญ่".

## Visual system

Reuses [[concepts/doodle-design-language]] verbatim: crayon palette
(`--paper #FBF8F0`, `--ink #3A3530`, `--crayon-coral #F2664B` CTA), `Mali`
font, dotted-paper background, SVG `feTurbulence`+`feDisplacementMap` wobble
borders via `.sketch`, hard offset crayon shadows, slight rotations,
asymmetric border-radius, `.circled` / highlighter annotations.

## Scope

Static. No real signup, analytics, router, or responsive breakpoints beyond a
single mobile-friendly column. CTAs are decorative.

## Source

- Spec: `docs/superpowers/specs/2026-06-28-breakeven-landing-design.md`
- Design language: [[concepts/doodle-design-language]]
- In-world marketing frame: [[marketing/marketing-plan]]
