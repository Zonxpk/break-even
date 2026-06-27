# Break E'wen (เบรค, อีเวน) — Parody Landing Page

Date: 2026-06-28
Status: approved
Source of truth: `wiki/concepts/doodle-design-language.md`, `wiki/overview.md`

## Goal

A parody **showcase** landing page that sells the bit: a super app whose rider
never arrives, reframed as **"ที่พักของคนที่ลืมพัก"** (a rest stop for people who
forgot to rest). Brand it as **เบรค, อีเวน / Break E'wen** (not กี่โมง?).

## Output

- Single self-contained HTML file: `prototypes/landing/breakeven-landing.html`
- Inline CSS, Google Fonts `Mali`, inline SVG wobble filter. No build, no JS
  framework. Opens in any browser. Matches the existing Doodle prototypes in
  `prototypes/dating-sim/`.

## Visual system (faithful to Doodle, not invented)

- Palette: `--paper #FBF8F0`, `--paper-2 #F4EFE2`, `--ink #3A3530`,
  `--ink-soft #7C746A`; accents `--crayon-coral #F2664B` (primary CTA),
  `--crayon-blue #4D8FC0`, `--crayon-yellow #F4C24A`, `--crayon-mint #6FBE9B`,
  `--crayon-grape #9B6FC0`; washes coral/blue/mint/yellow.
- Font: `Mali`, cursive fallback.
- Techniques: dotted-paper radial-gradient background; SVG
  `feTurbulence`+`feDisplacementMap` wobble border via `.sketch`; hard offset
  crayon shadows (`4px 5px 0`, no blur); slight `rotate()` on cards;
  asymmetric border-radius (`16px 22px 14px 20px`); `.circled` /
  highlighter-underline annotations.

## Sections

1. **Hero** — wordmark "เบรค, อีเวน / Break E'wen"; hook headline "กี่โมง?";
   tagline *ที่พักของคนที่ลืมพัก*; primary CTA **สั่งของที่ไม่มีวันถึง →**;
   sleeping-rider 🛵💤 doodle.
2. **Services grid** — 6 wobbly tiles: อาหาร · เรียกรถ · ส่งพัสดุ · มาร์ท · หาคู่ ·
   นอนเฉยๆ. Joke pricing: ฿0 / ∞, "ค่าส่ง ฟรี เพราะไม่ส่ง".
3. **How it works** — 4 hand-drawn steps with dashed arrow flow:
   สั่ง → ไรเดอร์หลับ → คุณได้พัก → คูปองปลอบใจ.
4. **Fake testimonials** — 3 rotated note-cards from "สมาคมคนตกคลอง" members
   (the fell-in-the-canal club), self-aware and rested.
5. **Footer** — torn-paper consolation voucher `BM-7X2K` +
   "ของแถม: ลมหายใจเฮือกใหญ่".

## Scope (YAGNI)

- Static. No real signup, no analytics, no router. CTAs are decorative.
- One file. Hover states only; no interactive JS beyond that.
- Out of scope: responsive breakpoints beyond a single mobile-friendly column,
  i18n, real links.

## Success criteria

- Opens in a browser and renders the Doodle look (wobble borders, dotted paper,
  Mali font, crayon palette).
- All 5 sections present with the copy above.
- Reads as a coherent parody of a super-app landing page in Thai.
