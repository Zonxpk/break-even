---
type: "roadmap"
status: "active"
title: "geemong Roadmap — เล่นสนุก → ไวรัล → สปอนเซอร์"
tags: ["roadmap", "strategy", "marketing", "product"]
created: "2026-06-28"
updated: "2026-06-28"
---

# geemong Roadmap — จากเล่นสนุก สู่รับสปอนเซอร์

> [!key-insight] ทิศทาง
> สร้างเพื่อความสนุกก่อน. ถ้ามันไวรัลพอ → ค่อยรับสปอนเซอร์. **สปอนเซอร์เป็นผลพลอยได้ของไวรัล ไม่ใช่เป้าหมายตั้งต้น** — เงินอยู่ปลายน้ำของมีม. และพื้นผิวสปอนเซอร์ของเราถูก build ไว้ครึ่งหนึ่งแล้ว ([[components/merch-shop|brand booth]]).
> กรอบกลยุทธ์เต็มอยู่ที่ [[marketing/marketing-plan]]; วิชวลทั้งหมดอ้างอิง [[concepts/doodle-design-language|Doodle — เบรค, อีเวน]].

มี HTML เวอร์ชันวาดมือ (Doodle) ที่ `prototypes/roadmap.html`.

---

## Phase 0 — มันเล่นได้แล้ว (baseline ของจริง)

สิ่งที่ build แล้ว วันนี้ — ฐานที่ทุก phase ต่อยอด:

- [[components/gag-engine|Gag Engine]] — reducer + route + path + pickScript (มี Jest test ครบ)
- [[components/dating-sim|Dating Sim]] — swipe deck, chat story-beats, affection drip, LLM (BYO Anthropic)
- [[components/merch-shop|Merch Pop-Up]] — ตารางเวลา กทม., voucher claim, brand booth + `redeem_claim`
- [[components/mobile-api|Mobile API]] + [[components/supabase-backend|Supabase Backend]] (Postgres + Deno + pgTAP)
- ⚠️ หนี้ดีไซน์: UI ที่ ship ยังเป็นธีม Tinder/ชมพู ([[components/dating-ui-polish]]) — ยังไม่ใช่ Doodle

---

## Phase 1 — ทำให้สนุก (Build for fun)

**เป้า:** core loop สนุกพอที่คนเล่นจบแล้วอยากเล่าต่อ. ยังไม่คิดเรื่องเงิน.

| งาน | แตะอะไร | ทำไม |
|-----|---------|------|
| Reconcile ธีม Tinder → Doodle | `theme.ts` ↔ Doodle tokens, ฟอนต์ Mali | วิชวลเดียวทั้งแอป = brand จำได้ |
| Polish finale ("ตกคลองแสนแสบ! พักครบแล้ว") | [[components/gag-engine\|gag-engine]] | finale คือ moment ที่คนจะแชร์ |
| ทำหน้า finale ให้แชร์ได้ (export ภาพ/การ์ด) | finale screen | เปลี่ยน payoff เป็น asset |
| ปรับ daily deck ให้มีเหตุผลเปิดทุกวัน | [[components/dating-sim\|dating-sim]] | retention hook |

**Exit gate → Phase 2:** เพื่อนที่ลองเล่นหัวเราะและส่งต่อเองโดยไม่ต้องขอ; finale แชร์ได้สวยพอลงฟีดได้.

---

## Phase 2 — ทำให้ไวรัล (Go viral)

**เป้า:** สร้าง reach + ตัวเลขที่เอาไปคุยกับแบรนด์ได้. ยังไม่ขายสปอนเซอร์ — สะสมหลักฐาน.

- **Shareable finale loop** — "#เบรคอีเวน", การ์ด payoff ที่ลงฟีดได้ (Referral)
- **Meme content** — คลิป notebook-map ไรเดอร์ 🛵💤 ตกคลอง, ตัดสั้น 15 วิ (Acquisition)
- **App Store / ASO** — ขายมุก "สั่งของที่ไม่มีวันถึง →" (Acquisition)
- **"สมาคมคนตกคลอง"** — community รอบมุกไม่ส่ง; แถลงข่าวเล่นๆ ทุกหลักหมื่นที่ตกคลอง (Referral)

**Metric gates ที่ต้องเห็นก่อนไป Phase 3:**
- shares ต่อ finale > เกณฑ์ที่ตั้งไว้
- DAU บน daily deck โตต่อเนื่อง
- มีอย่างน้อย 1 มีมที่ออกนอกวง friends-of-friends

**Exit gate → Phase 3:** มีตัวเลข reach/redemption ที่ "เล่าเป็น story ให้สปอนเซอร์" ได้.

---

## Phase 3 — รับสปอนเซอร์ (Accept sponsors)

**เป้า:** monetize โดย**ไม่ทำลายมุกไม่ส่ง**. เรียงตาม brand-fit (ดีสุดก่อน):

1. **Brand booth / pop-up sponsor (native, มี infra แล้ว).**
   แบรนด์จริง stock ของในป๊อปอัป → ผู้ใช้ claim โค้ด `WHEN-` → เดินไปรับเองที่บูธ. on-brand เพราะ "ของถึงเมื่อคุณหยุดรอให้คนอื่นส่ง". ใช้ [[components/merch-shop|merch-shop]] brand operator + `redeem_claim` ที่มีอยู่.
2. **Sponsored gag content.** แบรนด์เป็นตัวละครในมุก — persona สปอนเซอร์ใน [[components/dating-sim|dating-sim]] หรือ sabotage incident ใน [[components/gag-engine|gag-engine]] ("ไรเดอร์แวะซื้อ X ก่อน แล้วลืมทาง"). แบรนด์เป็น punchline ไม่ใช่ banner.
3. **Consolation voucher sponsor.** แบรนด์ออกทุนคูปองปลอบใจหลัง finale. perfect emotionally: ไม่ได้ข้าว แต่ได้ของปลอบใจจริง.

> [!warning] เส้นที่ห้ามข้าม
> สปอนเซอร์ที่ต้องการให้ "ส่งสำเร็จ" หรืออยากได้ banner ปกติ = **Skip**. มุกไม่ส่งคือ asset ทั้งหมด — อย่าขายมันทิ้ง.

**ของจริงที่ต้อง build ใน Phase นี้:** dashboard นับ redemption ต่อแบรนด์ (มี `redeem_claim` แล้ว เหลือ aggregate + report); ช่อง persona/incident ที่ tag เป็น sponsored.

---

## สรุปการตัดสินใจที่ค้าง (open decisions)

1. **Doodle reconciliation** — รื้อ `theme.ts` เป็น Doodle เมื่อไร (บล็อก Phase 1) → [[components/dating-ui-polish]]
2. **Metric thresholds ของ Phase 2** — เลขจริงที่ถือว่า "ไวรัลพอ" ยังไม่ตั้ง
3. โค้ดคูปอง: prototype Doodle ใช้ `BM-7X2K` แต่ของจริง `WHEN-` — เลือก prefix เดียวก่อน launch

---

## Related

- [[marketing/marketing-plan|Marketing Plan (AARRR, in-world)]]
- [[concepts/doodle-design-language|Doodle — เบรค, อีเวน]]
- [[components/gag-engine]] · [[components/dating-sim]] · [[components/merch-shop]]
- [[overview]] · [[index]]
