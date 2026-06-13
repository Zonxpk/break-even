# Dating Sim Content & Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rich story beats for all personas, generous chat affection drip, hybrid date spot picker, and swipe card polish per `docs/superpowers/specs/2026-06-13-dating-sim-content-polish-design.md`.

**Architecture:** Content-first pure modules in `mobile/src/dating/` (TDD), then `SpotPicker` UI, then screen wiring. Beat JSON in `supabase/seed.sql`; no migrations.

**Tech Stack:** Expo Router, AsyncStorage, react-native-maps, mulberry32, existing Supabase personas/matches API.

**Spec:** `docs/superpowers/specs/2026-06-13-dating-sim-content-polish-design.md`

---

### Task 1: distanceJoke helpers

**Files:**
- Create: `mobile/src/dating/distanceJoke.ts`
- Create: `mobile/src/dating/__tests__/distanceJoke.test.ts`

- [ ] **Step 1:** TDD `fakeDistanceKm` and `anchorDistanceKm`
- [ ] **Step 2:** Run `cd mobile && npm test -- distanceJoke`

---

### Task 2: affectionDrip + chat session

**Files:**
- Create: `mobile/src/dating/affectionDrip.ts`
- Create: `mobile/src/dating/chatSession.ts`
- Create: `mobile/src/dating/__tests__/affectionDrip.test.ts`

- [ ] **Step 1:** TDD `chatAffectionGain`
- [ ] **Step 2:** Session load/save/reset in `chatSession.ts`
- [ ] **Step 3:** Run `cd mobile && npm test -- affectionDrip`

---

### Task 3: chat beat tests + seed content

**Files:**
- Create: `mobile/src/dating/__tests__/chat.test.ts`
- Modify: `supabase/seed.sql`

- [ ] **Step 1:** Tests for `nextBeat` / `applyBeatChoice`
- [ ] **Step 2:** 5 beats × 3 personas in seed; clean ใบเตย bio

---

### Task 4: Chat screen wiring

**Files:**
- Modify: `mobile/src/app/dating/chat/[matchId].tsx`

- [ ] **Step 1:** Replace +1/msg with drip + session
- [ ] **Step 2:** Grant `XP.story_beat` on new beat completion
- [ ] **Step 3:** Open SpotPicker instead of auto-book

---

### Task 5: SpotPicker component

**Files:**
- Create: `mobile/src/ui/SpotPicker.tsx`
- Create: `mobile/src/ui/SpotPicker.web.tsx` (list-only fallback)

- [ ] **Step 1:** List grouped by anchor type + confirm bar
- [ ] **Step 2:** Map toggle with pin sync

---

### Task 6: Swipe deck polish

**Files:**
- Modify: `mobile/src/app/dating/index.tsx`

- [ ] **Step 1:** Distance line, rarity styling, progress counter

---

### Task 7: Docs + verification

**Files:**
- Modify: `docs/superpowers/RESUME-dating-sim.md`

- [ ] **Step 1:** `cd mobile && npm run typecheck && npm test`

---

## Self-Review Notes

- Spec §1 beats → Task 3
- Spec §2 drip → Tasks 2, 4
- Spec §3 picker → Tasks 4, 5
- Spec §4 cards → Task 6
- Beat XP → Task 4
