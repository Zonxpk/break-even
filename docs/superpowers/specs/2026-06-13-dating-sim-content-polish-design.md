# Dating Sim Content & Polish — Design Spec

**Date:** 2026-06-13  
**Status:** Draft — awaiting review  
**Parent spec:** `docs/superpowers/specs/2026-06-11-when-geemong-design.md` §7  
**Prerequisite:** v1 dating sim loop shipped (`docs/superpowers/RESUME-dating-sim.md`)

## Goal

Polish the dating sim content layer and UI gaps deferred from v1: rich story beat arcs for all three personas, generous chat affection drip, hybrid date spot picker, and swipe card presentation details.

## Non-goals

- OAuth / on-device LLM connector (spec §7 steps 1–2)
- `expo-secure-store` for API keys
- Tier perks (extra daily swipes, boosted legendary odds)
- New personas beyond the three seeded characters

## User decisions (brainstorming)

| Question | Choice |
|----------|--------|
| Direction | A — Content & polish |
| Beat depth | C — 4–5 beats per persona, full arc toward date threshold |
| Spot picker | C — Hybrid list + optional map |
| Chat affection drip | C — +1 every 2 messages, max +15 per session |

## Architecture

Content-first, then UI (approach A). Pure modules in `mobile/src/dating/` stay testable; UI components in `mobile/src/ui/` and `mobile/src/app/dating/`.

```
seed.sql (personas.beats JSON)
       ↓
chat.ts (nextBeat, applyBeatChoice) — unchanged interface
       ↓
chat/[matchId].tsx — drip + beat XP + SpotPicker
       ↓
affectionDrip.ts, distanceJoke.ts — new pure modules (TDD)
       ↓
SpotPicker.tsx — hybrid list/map modal
       ↓
dating/index.tsx — card meta + rarity styling
```

---

## 1. Story beat library

### Structure

Five beats per persona. Thresholds spaced so chat drip (+15 max) plus good beat choices reach the 30% date unlock without forcing every beat.

| Beat | Affection gate | Role |
|------|----------------|------|
| b1 | 8 | Icebreaker — persona-specific hook |
| b2 | 15 | Personal reveal — choice swing ±3–5 |
| b3 | 22 | Tension / comedy — choice swing ±5–8 |
| b4 | 28 | Almost ready to meet — vulnerability |
| b5 | 35 | Post-date-unlock fluff (date button still at 30%) |

Each beat: `id`, `at_affection`, `scene` (Thai), `choices` array of `{ text, affection }` with deltas from −2 to +8.

### Persona themes

**น้องใบเตย** (common) — Extend existing b1 (`ชวนคุยเรื่องแมวที่ร้าน`). Arc: cat shop chaos → bubble tea opinions → jealous cat drama → "let's meet at the shop" → post-date cat gossip.

**พี่ภูผา** (rare) — Engineer who gets lost. Arc: GPS fails on first message → work site story → wrong-turn confession → quiet sincerity → engineer apology foreshadowing ghost date.

**คุณหมีโต** (legendary, brand mascot) — Ends sentences with ครับโต. Arc: mascot meet-cute → bubble tea loyalty card → fan encounter interruption → soft moment under the costume → legendary "ครับโต promises to come" beat.

### XP grant

When `beats_done` grows (new beat id appended), grant `XP.story_beat` (+10) to profile via existing Supabase profile update pattern. One grant per beat id, never double-grant.

### Storage

Update `supabase/seed.sql` `personas.beats` JSON only. No schema migration. Existing `StoryBeat` type in `mobile/src/types/db.ts` is sufficient.

### Tests

- `chat.test.ts` (new): `nextBeat` ordering, skip completed beats, `applyBeatChoice` bounds
- Seed beat ids are unique per persona (`b1`–`b5` scoped by persona in JSON)

---

## 2. Chat affection drip

### Module: `mobile/src/dating/affectionDrip.ts`

```ts
export const CHAT_DRIP_EVERY_N = 2;
export const CHAT_DRIP_MAX = 15;

/** Returns additional affection to grant (0 or 1) given session state after this send. */
export function chatAffectionGain(
  userMsgCount: number,
  sessionGained: number,
): number;
```

Rules:
- +1 affection when `userMsgCount % CHAT_DRIP_EVERY_N === 0` and `sessionGained < CHAT_DRIP_MAX`
- Beat choice affection deltas bypass the drip cap
- `replyToUser` in chat screen currently grants +1 unconditionally — replace with drip logic

### Session storage

Key: `dating:chat-session:{matchId}` in AsyncStorage.

```ts
interface ChatSession {
  userMsgCount: number;
  gained: number;
  startedAt: string; // ISO
}
```

- Load on chat screen mount; save after each send
- Reset on screen unmount (`useEffect` cleanup) or when `startedAt` is older than 30 minutes
- Corrupt JSON → reset to `{ userMsgCount: 0, gained: 0, startedAt: now }`

### Tests: `affectionDrip.test.ts`

| userMsgCount | sessionGained | expected gain |
|--------------|---------------|---------------|
| 1 | 0 | 0 |
| 2 | 0 | 1 |
| 4 | 1 | 1 |
| 30 | 14 | 1 |
| 30 | 15 | 0 |
| 32 | 15 | 0 |

---

## 3. Hybrid spot picker

### Component: `mobile/src/ui/SpotPicker.tsx`

Modal opened from "นัดเดท" button. Replaces direct `placeDateOrder(spots[0])` in `chat/[matchId].tsx`.

**List view (default):**
- Anchors from `fetchAnchors()`, grouped by `type`
- Emoji headers: 🌊 canal, 🏪 seven_eleven, 🛕 temple, 🛒 market
- Row subtitle: `anchorDistanceKm(personaId, anchorId)` → e.g. `1.4 กม. (โกหก)`
- Tap row → highlight; confirm bar at bottom

**Map view (toggle):**
- "ดูบนแผนที่" expands `MapView` below list (react-native-maps, same stack as `TrackingMap`)
- Marker per anchor; tap pin syncs list selection
- Bidirectional: list tap pans map to pin

**Confirm flow:**
- Button: "ยืนยันนัดเดทที่ {name}"
- Calls `onConfirm(spot)` → parent runs `placeDateOrder` → `router.push(/track/[orderId])`

**Props:**

```ts
type SpotPickerProps = {
  visible: boolean;
  anchors: GagAnchor[];
  personaId: string;
  onConfirm: (spot: GagAnchor) => void;
  onDismiss: () => void;
};
```

### Helpers: `mobile/src/dating/distanceJoke.ts`

```ts
/** Spot picker rows — stable per persona + anchor */
export function anchorDistanceKm(personaId: string, anchorId: string): string;

/** Swipe card — stable per persona per calendar day */
export function fakeDistanceKm(personaId: string, dateStr: string): string;
```

Both return strings like `1.4 กม. (โกหก)` via mulberry32; ranges [0.5, 3.0] km.

### Tests: `distanceJoke.test.ts`

- Both helpers deterministic for same inputs
- `fakeDistanceKm` may differ across dates; `anchorDistanceKm` differs across anchor ids
- SpotPicker: manual QA only (no map snapshot tests)

---

## 4. Swipe card polish

Display on deck card (via `fakeDistanceKm` in `distanceJoke.ts`):

```
ห่างจากคุณ {fakeDistanceKm(persona.id, today)}
```

### Bio cleanup

Remove embedded distance from ใบเตย bio in seed (`ห่างจากคุณ 1.2 กม. (โกหก)`). Distance is UI-owned for all personas.

### Rarity styling (`dating/index.tsx`)

| Rarity | Treatment |
|--------|-----------|
| common | Existing muted green badge |
| rare | Gold-tinted badge background `#FEF3C7` |
| legendary | `✨` prefix on name, `theme.greenDark` card border |

### Deck progress

Above card stack when `index > 0`: `วันนี้ปัดไปแล้ว {index}/10`

(See `distanceJoke.test.ts` in §3.)

---

## Error handling

| Case | Behavior |
|------|----------|
| Anchors loading | SpotPicker spinner, confirm disabled |
| Anchor fetch fails | Alert: `โหลดจุดนัดไม่ได้ ลองใหม่` |
| Beat already in `beats_done` | `nextBeat` skips (existing) |
| Session storage corrupt | Reset session, drip from zero |
| Affection < 30 on date tap | Existing alert unchanged |

---

## Affection economy (balance check)

Starting affection: 0. Date unlock: 30.

| Source | Max contribution |
|--------|------------------|
| Chat drip | +15 (30 user messages at 2-msg cadence) |
| 5 beats (good choices) | ~+25–35 cumulative |
| Combined | Reach 30 without perfect play; beats remain primary story path |

---

## Files to create/modify

| Action | Path |
|--------|------|
| Modify | `supabase/seed.sql` — beats for all personas, bio cleanup |
| Create | `mobile/src/dating/affectionDrip.ts` |
| Create | `mobile/src/dating/__tests__/affectionDrip.test.ts` |
| Create | `mobile/src/dating/distanceJoke.ts` |
| Create | `mobile/src/dating/__tests__/distanceJoke.test.ts` |
| Create | `mobile/src/dating/__tests__/chat.test.ts` |
| Create | `mobile/src/ui/SpotPicker.tsx` |
| Modify | `mobile/src/app/dating/chat/[matchId].tsx` |
| Modify | `mobile/src/app/dating/index.tsx` |
| Modify | `docs/superpowers/RESUME-dating-sim.md` |

---

## Verification

```bash
cd mobile && npm run typecheck && npm test
```

Manual checklist:
1. Swipe deck shows distance + rarity styling; progress counter increments
2. Match → chat: every 2 messages +1 affection until +15 cap; beats still grant large swings
3. Beat completion grants +10 XP on profile
4. All three personas surface beats b1–b5 at correct thresholds
5. นัดเดท → list picker → map toggle → confirm → track screen
6. Full arc: chat + beats → 30% → date → ghost → apology in chat
