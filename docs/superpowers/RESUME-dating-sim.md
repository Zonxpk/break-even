# Resume — dating sim (updated 2026-06-13)

## Done

- Plans written: `docs/superpowers/plans/2026-06-13-when-dating-sim.md`
- Persona/match API + daily deck shuffle + swipe match rolls (TDD)
- Home 💘 tile → swipe deck → matches list → chat with story beats
- Scripted chat + optional BYO API key (Anthropic) with fallback
- Date booking → `service: 'date'` order → existing track/fail pipeline
- `date_ghosted` voucher trigger + XP + in-chat apology on fail
- **46/46 Jest tests** pass; typecheck clean

## Deferred (v1)

- OAuth / on-device LLM providers (spec §7 chain steps 1–2)
- expo-secure-store for API keys (AsyncStorage for now — document in profile UI)
- Full visual-novel beat library (seed has one beat on ใบเตย)

## Manual checklist

1. Home → 💘 → swipe right until match → matches list → chat
2. Reach 30% affection → นัดเดท → tracking → fail → voucher + apology in chat
3. Swipe left → +2 XP on profile
