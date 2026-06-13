# When? (กี่โมง?) — Parody Super App — Design Spec

**Date:** 2026-06-11
**Brand:** When? (EN) / กี่โมง? (TH) — package slug `geemong`
**Status:** Approved design, pending implementation planning

## 1. Overview

When? is a parody of Thai super apps (Grab et al.) where every rider, parcel, and
date is doomed to never arrive — หลงทาง, ง่วงจอดงีบ, ตกคลอง. The product is the
comedy; the business is brands paying for tie-in exposure. Every failed delivery
ends in a consolation voucher from a tie-in brand, and vouchers are the currency
of a pop-up merch shop where users claim real physical merchandise.

**Revenue model:** brands pay for placement (vouchers, fake-catalog product
placement, dateable mascot personas, pop-up shop drops). Users never pay real
money for anything, ever.

**Language:** Thai only. The jokes are written natively in Thai; no i18n plumbing.

## 2. Product principles

1. **Everything looks real until it isn't.** Browse, confirm, and track screens
   are production-Grab-grade. Nothing tips the joke until the rider acts strange.
2. **Nothing costs real money.** Every "purchase" in any service succeeds for ฿0.
   The only real-goods flow is: suffer → voucher → merch claim → physical pickup.
3. **Every failure stays in character.** Technical errors degrade into jokes
   (LLM down = "อ่านแล้วไม่ตอบ"), never error dialogs where avoidable.
4. **Suffering is the universal currency.** Failed orders, ghosted dates, and
   even swipe rejections grant loyalty XP.
5. **Jokes are content, not code.** Gag scripts, personas, catalogs, campaigns
   are database rows; new comedy ships from Supabase Studio without app releases.

## 3. Architecture

Two deployables only:

- **Expo app (React Native)** — all five services, the gag engine, the dating
  sim, the LLM connector, the merch shop, and brand-mode management screens.
- **Supabase** — auth, Postgres (with RLS as the security boundary), Storage
  (images), two SQL RPC functions (`grant_voucher`, `claim_merch`), and one Edge
  Function (Discord webhook relay for tie-in registrations).

There is no custom server. The CMS is Supabase Studio, used by the internal team.
External brands manage their own content through role-gated screens in the app.

LLM traffic for the dating sim goes **directly from device to provider** (or
stays on-device); it never touches Supabase. No chat logs are stored server-side.

**Mobile stack:** Expo Router (tabs + modals), Zustand (order/gag state),
react-native-maps (real tiles), Reanimated (fail animations), supabase-js,
expo-secure-store (LLM credentials).

## 4. Sub-project decomposition

Implementation proceeds as four sub-projects, each getting its own
implementation plan. Order:

1. **Backend foundation** — Supabase schema, RLS policies, RPCs, Edge Function,
   seed data (gag anchors, sample scripts/personas/campaigns).
2. **App core + gag engine** — auth, tabs, shared order pipeline for the four
   delivery services, tracking map, gag engine, voucher wallet, loyalty tiers,
   tie-in registration form.
3. **Dating sim** — swipe deck, match engine, persona chat, LLM connector,
   story beats, date-tracking integration.
4. **Merch shop + brand mode** — pop-up shop, claims, brand management screens.

## 5. Mobile app structure

Tab bar (Grab-style): **หน้าแรก** (service grid 🍜🏍️📦🛒💘 + tie-in promo
banners + pop-up shop entry) · **กิจกรรม** (order history — all failures) ·
**คูปอง** (voucher wallet + claim codes) · **โปรไฟล์** (account, loyalty tier,
LLM connect, "ร่วมเป็นพาร์ทเนอร์" tie-in form, brand-mode entry when flagged).

### Shared order pipeline

One `OrderFlow` feature module parameterized by `ServiceConfig` (theme, icon
set, catalog renderer, gag script pool). Five steps for every service:

**Browse → Confirm (฿0) → Track (the gag) → Fail → Voucher payoff**

- Browse is full production realism: photos, ratings, delivery fees, promos,
  search. Catalog content lives in `catalog_items` (CMS-editable), so brands can
  product-place inside fake catalogs (real noodle brand in the fake 7-11).
- Per-service catalog forms: Food = fake restaurants; Ride = destination picker;
  Parcel = sender/receiver form; Mart = aisle grid; Dating enters the pipeline
  at Track (a booked date travels to you and fails like a rider).

## 6. Gag engine (client-side)

A deterministic state machine: **(script, seed, elapsed time) → screen state.**

- **Scripts are CMS rows** (`gag_scripts`): JSON timelines of events —
  `move`, `eta`, `chat` (with reply choices), `incident` (animation id),
  `sabotage` (action → backfire mapping), `finale`. Weighted random selection
  per order, filterable by service and season tag.
- **Real roads, fake fate:** initial route fetched from OSRM so it looks
  legitimate; detours are real routes to wrong destinations; incidents snap to
  `gag_anchors` (seeded Bangkok canals, 7-11s, temples) nearest the route.
- **Determinism:** script id + seed stored on the order row at creation. State
  at any moment is a pure function of elapsed time — closing/reopening the app
  resumes the same doomed journey; the engine is unit-testable.
- **Interactive sabotage:** script-defined actions (โทรปลุก, ส่งพิกัด, เร่ง)
  whose outcomes always backfire; branches recorded locally to keep determinism.
- **Ending:** finale fires (e.g. ตกคลองแสนแสบ + splash animation), client marks
  order `failed_hilariously`, calls `grant_voucher` RPC, shows the voucher
  reveal + social share card. Orders left unattended resolve lazily on next
  launch. A typical run is ~3–5 minutes.

## 7. Dating sim (💘)

**Entry: Tinder-parody swipe deck.**

- Daily deck: a shuffled hand from the `personas` pool, seeded per user per day.
- Profile cards are parody-real (photo, age, bio, "ห่างจากคุณ 1.2 กม. (โกหก)").
- Personas have rarity tiers (common/rare/legendary) — legendary encounters are
  rare gacha moments. Brand mascots slot in as encounter cards.
- **Match rate = f(loyalty tier, persona rarity).** Base chance per rarity
  scaled by tier multiplier with a cap (legendary stays special). Rolled
  client-side with seeded random. Rejection is content ("เขาปัดซ้ายคุณ 💔") and
  grants a little XP. Multiple simultaneous matches allowed.

**Game loop:** free LLM chat (small affection drip from engagement) + scripted
visual-novel story beats (choice cards carrying the big affection swings —
progression stays deterministic and balanced regardless of LLM quality) →
affection threshold unlocks นัดเดท → user picks the spot on the map → the date
enters the standard tracking gag with date-specific scripts → ghosted → voucher
+ in-character apology that keeps the chat alive. The ghosting is the retention
loop.

**LLM connector** (โปรไฟล์ → เชื่อมต่อ AI), priority chain:
1. OAuth sign-in to provider (Claude / ChatGPT subscription)
2. On-device OS model (Apple Foundation Models / Gemini Nano)
3. BYO API key
4. Scripted-dialogue fallback (story beats fully playable; chat replies canned)

Credentials in expo-secure-store; chat history local-only; Supabase stores only
affection state + completed beats. Persona wrapper: character personality +
Thai-only + PG-13 brand-safe guardrails + "always agrees to a date, something
always comes up."

## 8. Loyalty tiers (parody of Grab rewards)

🥈 Silver → 🥇 Gold → 💎 Platinum → 👑 VIP, earned from failed orders, ghosted
dates, story beats, daily check-ins, and swipe rejections. `loyalty_xp` and
`tier` live on `profiles`.

Perks: match-rate multiplier, extra daily swipes, boosted legendary odds,
tier-gated voucher campaigns (e.g. VIP-only). Tier thresholds, XP grants, match
base rates, and multipliers live in **one bundled balance table** — explicitly a
tuning artifact, to be adjusted in playtesting, not architecture.

## 9. Voucher campaign engine

One row in `voucher_campaigns` = one marketing campaign:

- **WHAT:** brand_id, title, image, terms, code_mode (none / static /
  unique-per-grant), redemption info.
- **WHEN:** trigger_event (`order_failed`, `date_ghosted`, `tier_up`, `signup`,
  `share`) + JSON conditions (all must pass): service, finale_type (ตกคลอง-only
  campaigns), min_tier, nth_fail, persona_rarity, day_of_week, hour_range,
  first_time_event.
- **HOW MUCH:** quota_total, per_user_max, cooldown_hours, active_from/to,
  status (draft/active/paused), priority, weight.

**Grant flow:** on a trigger event the app calls the `grant_voucher(event_type,
context)` Postgres RPC, which evaluates active campaigns, enforces quotas
atomically, picks by priority then weighted random, mints the code, inserts the
voucher, and returns it for the reveal animation. The gag is client-side; the
prize draw is server-arbitrated.

## 10. Pop-up merch shop + brand mode

**User side:** shop surface on หน้าแรก, visible only during scheduled opening
windows; closed shops show a countdown (scarcity as marketing). Merch is priced
in vouchers (optionally restricted to a specific campaign's vouchers) with
limited stock. Claiming calls `claim_merch(item)` RPC — consumes vouchers,
decrements stock, mints a redemption code + QR in one transaction (no
overselling). The user shows the code at the brand's shop/event to receive real
merchandise.

**Brand side (same app):** accounts listed in `brand_members` see a "จัดการร้าน"
section — edit products and photos (uploads to Storage), set opening windows
(date range + days-of-week + hours), view claim/redemption stats, and mark
codes redeemed at pickup. RLS restricts brand members to rows matching their
own brand_id. The internal team creates/flags brand accounts in Studio.

## 11. Tie-in registration

In-app "ร่วมเป็นพาร์ทเนอร์" form (enterprise-credible styling within the same
design system): company, contact, merch description, budget range. Submissions
insert into `tiein_requests` (insert-only for clients); an Edge Function relays
each submission to the team's Discord via webhook (URL stays server-side).
Negotiation happens offline; accepted brands get rows in `brands` +
`brand_members`.

## 12. Data model summary

**Content (✏️ = team-edited in Studio; public-read):** `catalog_items`,
`gag_scripts`, `gag_anchors`, `personas`, `voucher_campaigns`, `brands`,
`shops`*, `merch_items`* (*also brand-writable via RLS for own brand_id).

**User data (RLS owner-only):** `profiles` (nickname, loyalty_xp, tier),
`orders` (service, items_json, script_id, seed, status), `vouchers`,
`matches` (persona_id, affection, beats_done_json), `claims`.

**Write-only via client:** `tiein_requests` (insert-only; Discord hook).

**Membership:** `brand_members` (user ↔ brand role flags).

**Local-only on device (never synced):** chat history, LLM credentials,
sabotage branch logs, balance table (bundled).

**Auth:** Supabase Auth — phone/email, plus anonymous guest with nickname.
Free to order; account persists orders, vouchers, tier, and dating progress.

## 13. Error handling

- **Supabase unreachable:** gag engine runs regardless (pure client function);
  order/voucher writes queue locally and retry. The show always goes on.
- **LLM failure mid-chat:** fall down the connector chain; if all fail, persona
  goes "อ่านแล้วไม่ตอบ" and scripted replies take over. In character, always.
- **OSRM down:** bundled pre-recorded route polylines near the user.
- **Map tiles fail:** tracking degrades to status-feed + chat-only mode.
- **RPC quota race / campaign exhausted:** grant falls back to the default
  evergreen consolation voucher so the payoff never silently fails.

## 14. Testing

- **Gag engine (unit):** same (script, seed, t) → same state; every active
  script reaches a finale from any seed; all sabotage branches resolve.
- **Balance table (unit):** match rates within bounds per tier×rarity; tier
  thresholds monotonic.
- **RLS (integration):** user A cannot read user B's orders/vouchers/matches/
  claims; anonymous reads content tables only; brand member writes restricted
  to own brand; `tiein_requests` insert-only.
- **RPCs (integration):** quota atomicity under concurrent grants; claim cannot
  oversell stock or double-spend vouchers.
- **Order pipeline (component):** browse→confirm→track→fail→voucher per service
  using a 10-second mock script.
- **LLM connector (unit):** fallback chain with mocked providers; no real keys
  in CI.

## 15. Out of scope (v1)

- Real payments of any kind; real fulfillment by us
- Push notifications (shop-opening alerts are a natural v1.1)
- English localization
- Self-serve brand onboarding (accounts are admin-created)
- Server-side anti-cheat beyond RPC quota/stock enforcement (vouchers are
  marketing artifacts; modest client-trust risk is acceptable for v1)
