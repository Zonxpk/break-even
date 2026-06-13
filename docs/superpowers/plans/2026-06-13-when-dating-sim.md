# When? (กี่โมง?) Dating Sim Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the Tinder-parody dating loop — daily swipe deck, tier-scaled match rolls, match list, scripted chat + story beats, date booking into the existing gag tracking pipeline, ghosted payoff — per spec §7.

**Architecture:** Pure modules in `mobile/src/dating/` for deck shuffle, match rolls, beat progression. `matches` table syncs affection + beats_done. Chat uses scripted fallback first (LLM connector stub returns canned lines). Date orders use `service: 'date'` + existing track/fail screens.

**Tech Stack:** Expo Router, Zustand optional for chat draft, AsyncStorage for local chat history, existing `balance.matchChance`, mulberry32 RNG.

**Spec:** `docs/superpowers/specs/2026-06-11-when-geemong-design.md` §7. **Prerequisite:** app core + balance table (match rates already in `balance.ts`).

---

### Task 1: Persona types + fetch API

**Files:**
- Modify: `mobile/src/types/db.ts`
- Create: `mobile/src/api/personas.ts`
- Create: `mobile/src/api/__tests__/personas.test.ts`

- [ ] **Step 1:** Add `Persona`, `MatchRow`, `StoryBeat` types.
- [ ] **Step 2:** `fetchPersonas()`, `listMatches()`, `upsertMatch()`, `updateMatch()`.
- [ ] **Step 3: Tests + commit**

```bash
git commit -m "feat: persona and match API types"
```

---

### Task 2: Daily deck (seeded shuffle)

**Files:**
- Create: `mobile/src/dating/deck.ts`
- Create: `mobile/src/dating/__tests__/deck.test.ts`

- [ ] **Step 1:** `dailyDeckSeed(userId, dateStr)` → stable int; `shufflePersonas(personas, seed)` deterministic.
- [ ] **Step 2:** `deckForToday(personas, userId, now)` returns up to 10 cards, legendary capped at 1.
- [ ] **Step 3: TDD + commit**

```bash
git commit -m "feat: deterministic daily persona deck"
```

---

### Task 3: Swipe resolution

**Files:**
- Create: `mobile/src/dating/swipe.ts`
- Create: `mobile/src/dating/__tests__/swipe.test.ts`

- [ ] **Step 1:** `resolveSwipe({ tier, rarity, seed })` → `'match' | 'reject'` using `matchChance` + mulberry32.
- [ ] **Step 2:** Reject grants `XP.swipe_rejected` via profiles update helper.
- [ ] **Step 3: TDD + commit**

```bash
git commit -m "feat: swipe match roll with tier-scaled odds"
```

---

### Task 4: Dating entry + swipe UI

**Files:**
- Create: `mobile/src/app/dating/index.tsx`
- Modify: `mobile/src/app/(tabs)/index.tsx` (add 💘 tile)
- Modify: `mobile/src/app/_layout.tsx`

- [ ] **Step 1:** Card stack UI: photo placeholder, name, bio, distance joke.
- [ ] **Step 2:** Left = reject (toast + XP), right = match roll → insert `matches` row on success.
- [ ] **Step 3: Commit**

```bash
git commit -m "feat: dating swipe deck entry from home"
```

---

### Task 5: Matches list

**Files:**
- Create: `mobile/src/app/dating/matches.tsx`

- [ ] **Step 1:** List active matches with affection bar; tap opens chat.
- [ ] **Step 2: Commit**

```bash
git commit -m "feat: dating matches list"
```

---

### Task 6: Scripted chat + story beats

**Files:**
- Create: `mobile/src/dating/chat.ts`
- Create: `mobile/src/dating/beats.ts`
- Create: `mobile/src/app/dating/chat/[matchId].tsx`

- [ ] **Step 1:** Local chat history in AsyncStorage keyed by matchId.
- [ ] **Step 2:** `scriptedReply(persona, userText)` — 3 canned Thai lines rotating by hash.
- [ ] **Step 3:** `nextBeat(match, beats)` renders choice cards when affection threshold met; updates `beats_done` + affection on choice.
- [ ] **Step 4:** Chat grants +1 affection per 3 messages (cap per session).
- [ ] **Step 5: Commit**

```bash
git commit -m "feat: scripted dating chat and story beats"
```

---

### Task 7: Date booking → gag pipeline

**Files:**
- Create: `mobile/src/dating/bookDate.ts`
- Modify: `mobile/src/api/orders.ts` (accept `service: 'date'`)

- [ ] **Step 1:** When affection ≥ 30, show "นัดเดท" with fake map spot picker (seeded anchor list).
- [ ] **Step 2:** `placeDateOrder({ personaId, spot })` inserts order `service: 'date'`, picks script where `service = 'date'`.
- [ ] **Step 3:** Navigate to existing `/track/[orderId]`.
- [ ] **Step 4: Commit**

```bash
git commit -m "feat: book date into shared tracking gag pipeline"
```

---

### Task 8: Ghosted fail + voucher

**Files:**
- Modify: `mobile/src/api/orders.ts`

- [ ] **Step 1:** On date fail finale, call `grant_voucher` with `p_trigger: 'date_ghosted'` and persona context.
- [ ] **Step 2:** Grant `XP.date_ghosted` on profile.
- [ ] **Step 3:** Fail screen shows in-character apology line in chat AsyncStorage.
- [ ] **Step 4: Commit**

```bash
git commit -m "feat: date ghosted voucher grant and XP"
```

---

### Task 9: LLM connector stub

**Files:**
- Create: `mobile/src/dating/llm.ts`
- Modify: `mobile/src/app/(tabs)/profile.tsx`

- [ ] **Step 1:** Profile row "เชื่อมต่อ AI" → modal for BYO API key stored in AsyncStorage (not secure store yet — document).
- [ ] **Step 2:** `generateReply` tries key → fetch stub errors → falls back to `scriptedReply`.
- [ ] **Step 3: Commit**

```bash
git commit -m "feat: dating LLM connector stub with scripted fallback"
```

---

### Task 10: Verification + docs

**Files:**
- Create: `docs/superpowers/RESUME-dating-sim.md`
- Modify: `README.md`

- [ ] **Step 1:** `cd mobile && npm run typecheck && npm test`
- [ ] **Step 2:** Manual checklist: swipe → match → chat → beat → book date → track → ghost → voucher.
- [ ] **Step 3: Commit**

```bash
git commit -m "docs: dating sim quickstart and resume"
```

---

## Self-Review Notes

- **Spec coverage:** daily deck ✓, match rate by tier ✓, rejection XP ✓, scripted beats ✓, date→track→ghost→voucher ✓. OAuth/on-device LLM deferred; BYO key + scripted fallback satisfies §7 connector chain for v1.
- **Dependency order:** 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → {9} → 10.
