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

> [!key-insight] thesis: ตัวสินค้า *คือ* คอนเทนต์
> ทุก order ที่ล้มเหลวสร้าง "ของแชร์" อยู่แล้ว (finale + เส้นทางตกคลอง). งานของ Phase นี้ = ทำให้การแชร์ลื่น + ไปวางถูกช่องทางคนไทย. ไม่ต้องผลิตคอนเทนต์แยก — เก็บเกี่ยวมุกที่แอปสร้างเอง.

### 2.1 หน่วยไวรัล (viral unit) — อะไรที่คนจะแชร์
สิ่งที่ "พร้อมแคป" อยู่แล้วในแอป — ทำให้แต่ละอันเป็น asset:
- **finale card** "ตกคลองแสนแสบ! พักครบแล้ว เริ่ด!" → ทำเป็นภาพ export ได้ มีลายน้ำ @handle + #เบรคอีเวน
- **notebook-map clip** — ไรเดอร์ 🛵💤 ขับวน/ตกคลอง (จาก [[components/gag-engine|gag-engine]] route+path) → อัดหน้าจอ 10–15 วิ
- **ETA ที่ไร้สาระ** "87 นาที+" และแชต "ใกล้ถึงแล้วว! (โกหก)" → screenshot relatable
- **ราคา ฿0 / ∞** → มุก quote-tweet

### 2.2 ช่องทาง (เรียงตาม leverage สำหรับไทย)
| ช่อง | ทำอะไร | ทำไมเวิร์กในไทย |
|------|--------|-----------------|
| **TikTok** | คลิป notebook-map fail + เสียงพากย์ไทย, ออกสัปดาห์ละคลิป | engine การ discovery ที่แรงสุด, มุก visual เข้าใจไม่ต้องแปล |
| **X (Twitter ไทย)** | screenshot finale + คำคม burnout "สั่งข้าว 87 นาที มันตกคลอง"; reply ใต้ทวีตบ่นเดลิเวอรีจริง | วัฒนธรรม screenshot + dunk + relatable หมดไฟ |
| **Facebook กลุ่ม/เพจ** | เพจมีม + กลุ่มบ่นเดลิเวอรี → เปลี่ยนความหงุดหงิดจริงเป็นมุก | กลุ่มไทยใหญ่มาก, แชร์ต่อง่าย |
| **LINE** | finale card แชร์เข้ากลุ่มแชต | surface แชร์ default ของคนไทย |
| **Pantip / Reddit r/Thailand** | ตั้งกระทู้ "แอปที่ของไม่เคยมาถึง" | seed คนช่างเล่า |

### 2.3 กลไกแชร์ในแอป (สิ่งที่ต้อง build)
- ปุ่ม **"แชร์ความล้มเหลว"** บนหน้า finale → gen การ์ดภาพ branded อัตโนมัติ (#เบรคอีเวน + @handle + ลิงก์/QR ติดตั้ง)
- ลายน้ำ + handle ทุกภาพ เพื่อให้ทุก share ดึง install กลับ (นี่คือ loop, ไม่ใช่แค่โพสต์)
- หมุน **gag-engine scripts** เป็นชุดๆ เพื่อกันมุกซ้ำ/มุกตาย (rotate ทุก 2–3 สัปดาห์)

### 2.4 seeding & amplify
- **micro-influencer** สาย comedy/relatable ไทย — ส่วนใหญ่เล่นมุกให้ฟรีถ้ามุกดีพอ
- **reply-guy** ใต้คลิป/ทวีต "เดลิเวอรีพัง" ที่กำลังดัง — แปะมุกเรา
- **"สมาคมคนตกคลอง"** เป็น running bit: แถลงข่าวเล่นๆ ทุกครั้งที่ยอดตกคลองครบหลักหมื่น (สร้าง event ให้สื่อหยิบ)
- **UGC**: ชวนผู้ใช้โพสต์ "ETA ที่แย่ที่สุดที่เคยเจอ"

### 2.5 metric gates (ต้องเห็นก่อนไป Phase 3)
| ตัวชี้วัด | proxy | ทำไมสำคัญ |
|-----------|-------|-----------|
| **shares / finale** | k-factor หยาบๆ | บอกว่า loop แชร์ทำงานจริงไหม |
| **installs / share** | ลายน้ำ→ติดตั้ง | บอกว่า share ดึงคนใหม่จริง |
| **DAU บน daily deck** | retention | บอกว่าคน *อยู่* ไม่ใช่แค่ดูแล้วไป |
| **มีม ≥1 ออกนอกวง** | reach อินทรีย์ | หลักฐานชิ้นแรกที่ขายแบรนด์ได้ |

> [!warning] ความเสี่ยง
> (1) มุกตาย → หมุน script. (2) คนเข้าใจผิดว่าเป็นแอปจริงที่พัง → คุมด้วย copy self-aware ("เรารู้ มันไม่ส่ง"). (3) ไวรัลครั้งเดียวแล้วเงียบ → ต้องมี content cadence ไม่ใช่หวังลุ้นทีเดียว.

**Exit gate → Phase 3:** มีตัวเลข reach/redemption ที่ "เล่าเป็น story ให้สปอนเซอร์" ได้ + มี cadence คอนเทนต์ที่ทำซ้ำได้.

---

## Phase 3 — รับสปอนเซอร์ (Finding & accepting sponsors)

**เป้า:** monetize โดย**ไม่ทำลายมุกไม่ส่ง**.

> [!key-insight] thesis: ไม่ได้ขายพื้นที่โฆษณา — ขาย "redemption story + reach"
> แบรนด์ไม่จ่ายเพื่อ impression. แบรนด์จ่ายเพื่อ (ก) ตัวเลข reach จาก Phase 2 และ (ข) funnel ที่พาคนเดินมารับของจริงที่บูธ. brand booth ใน [[components/merch-shop|merch-shop]] + `redeem_claim` มีอยู่แล้ว — นี่คือ native ad unit ที่ build ไว้ครึ่งทาง.

### 3.1 เมนูสปอนเซอร์ (เรียงตาม brand-fit, ดีสุดก่อน)
| Tier | สินค้า | กลไก | สถานะ infra |
|------|--------|------|-------------|
| **A — Brand booth** *(flagship)* | แบรนด์ stock ของจริงในป๊อปอัป | claim โค้ด `WHEN-` → เดินไปรับเองที่บูธ | ✅ มี operator + `redeem_claim` |
| **B — Sponsored gag** | แบรนด์เป็นตัวละครในมุก | persona สปอนเซอร์ใน [[components/dating-sim\|dating-sim]] หรือ sabotage incident ใน [[components/gag-engine\|gag-engine]] ("ไรเดอร์แวะซื้อ X ก่อน แล้วลืมทาง") | ต้อง tag sponsored |
| **C — Consolation voucher** | แบรนด์ออกทุนคูปองปลอบใจหลัง finale | คูปองหลัง "ตกคลองแสนแสบ" มาจากแบรนด์ | ✅ มี voucher flow |

on-brand เพราะ Tier A ตอกย้ำมุก: "ของถึงเมื่อคุณหยุดรอให้คนอื่นส่ง — แล้วเดินไปเอาเอง". แบรนด์เป็น **punchline ไม่ใช่ banner**.

### 3.2 หาแบรนด์ไหน (ideal sponsor profile)
**ใช่:** แบรนด์ที่ self-aware พอจะเป็นมุก และธีมตรงกับ "ที่พักของคนที่ลืมพัก" —
- กาแฟ / คาเฟ่ / ชา (ธีมพักตรงเป๊ะ), ขนม/snack, เครื่องดื่ม, co-working, แอป wellness/สุขภาพจิต, ที่นอน/หมอน
- **แบรนด์ไทยในเมืองเดียวกับบูธก่อน** (warm, โลจิสติกส์ง่าย)

**ไม่ใช่ (Skip):** แบรนด์ที่ต้องการสัญญา "ส่งตรงเวลา", luxury ที่กลัวภาพเสีย, แบรนด์ที่ไม่มีอารมณ์ขัน, ใครก็ตามที่อยากได้ banner ปกติ.

### 3.3 pitch / sponsor one-pager (ใส่อะไรบ้าง)
1. **the bit** — 1 บรรทัด: "ซูเปอร์แอปที่ของไม่เคยมาถึง คนเลยได้พัก"
2. **the numbers** — reach/มีม/installs จาก Phase 2 (หลักฐาน ไม่ใช่คำสัญญา)
3. **the redemption story** — claim ในแอป → เดินมาบูธ → ได้ของจริง (funnel ที่วัดได้)
4. **slot menu** — Tier A/B/C + ราคา/แพ็กเกจ
5. **brand-safety line** — "มุกอยู่ที่ geemong เสมอ ไม่เคยอยู่ที่สินค้าคุณ" (ดู 3.6)
6. **proof clip** — แนบคลิปไวรัลที่ดังที่สุด
ส่งเป็น one-pager + คลิป. ใช้ทักษะ `marketing-skills:co-marketing`, `offers`, `public-relations`.

### 3.4 outreach motion
- **warm ก่อน:** คาเฟ่/แบรนด์ใกล้ตัว/ใกล้บูธ — เสนอเป็น "design partner รายแรก"
- **inbound:** พอไวรัล แบรนด์จะ DM เอง → ต้องมีเมนู (3.1) พร้อมตอบทันที
- **tie-in:** flow 11 (brand booth & partner) มีอยู่แล้ว — ต่อยอดเป็นดีลจริง

### 3.5 pricing (ตามจริงสำหรับ prototype)
เริ่มจาก **1 design-partner แบบ barter**: แบรนด์ stock บูธ + ออกของ, เราให้ reach แบบตลก → พิสูจน์ว่า redemption funnel เวิร์ก → ค่อยตั้งราคา.
โมเดลราคาเมื่อพร้อม: **slot fee + ต่อ redemption** หรือ **เหมาแคมเปญตามช่วงเวลา** (ผูกกับ pop-up window ของ [[components/merch-shop|merch-shop]]).

### 3.6 guardrails (กันทั้งสองทาง)
- **กัน geemong:** ห้าม messaging แนว "ตอนนี้ส่งถึงแล้วนะ" — มุกไม่ส่งคือ asset ทั้งหมด
- **กันสปอนเซอร์:** มุกอยู่ที่ความล้มเหลวของ geemong เสมอ ไม่เคยล้อสินค้าของแบรนด์
- มี **redemption cap** + ช่วงแคมเปญชัดเจนในสัญญา

### 3.7 ของจริงที่ต้อง build ใน Phase นี้
- **dashboard นับ redemption ต่อแบรนด์** — มี `redeem_claim` แล้ว เหลือ aggregate + report
- **tag sponsored** สำหรับ persona ([[components/dating-sim|dating-sim]]) / incident ([[components/gag-engine|gag-engine]])
- **สัญญาสปอนเซอร์แบบเบาๆ** — ช่วงเวลา, slot, redemption cap, brand-safety = มุกยังเป็นมุก

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
