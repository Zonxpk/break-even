# Resume — dating sim (updated 2026-06-13)

## Done

- Plans written: `docs/superpowers/plans/2026-06-13-when-dating-sim.md`
- Persona/match API + daily deck shuffle + swipe match rolls (TDD)
- Home 💘 tile → swipe deck → matches list → chat with story beats
- Scripted chat + optional BYO API key (Anthropic) with fallback
- Date booking → `service: 'date'` order → existing track/fail pipeline
- `date_ghosted` voucher trigger + XP + in-chat apology on fail
- **Content polish slice** (`docs/superpowers/specs/2026-06-13-dating-sim-content-polish-design.md`):
  - 5 story beats × 3 personas in seed
  - Chat affection drip (+1/2 msgs, max +15/session) via `affectionDrip.ts` + `chatSession.ts`
  - Beat completion grants `XP.story_beat` (+10)
  - Hybrid `SpotPicker` (list + map toggle)
  - Swipe card distance line, rarity styling, deck progress counter
- Jest + typecheck clean

## Deferred (v1)

- OAuth / on-device LLM providers (spec §7 chain steps 1–2)
- expo-secure-store for API keys (AsyncStorage for now — document in profile UI)
- Tier perks (extra daily swipes, boosted legendary odds)

## Manual checklist

1. Home → 💘 → swipe deck shows distance + rarity → progress counter
2. Match → chat: drip affection every 2 messages (cap 15); beats at thresholds
3. Beat choice grants +10 XP on profile
4. นัดเดท → spot list → map toggle → confirm → tracking → ghost → apology
5. Swipe left → +2 XP on profile
