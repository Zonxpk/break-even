# Resume — app core (updated 2026-06-13)

## Done

- Supabase **cloud only** (not local-only): `sgxdoukyzaluwkbaxqvy` linked — use `supabase db push` / `supabase db query --linked`
- **Tasks 1–14** implemented in `mobile/` (routes under `src/app/`)
- **34/34 Jest tests** pass; `npm run typecheck` clean
- README mobile quickstart added

## In progress

- **Food delivery deep browse** — spec + plan at `docs/superpowers/specs/2026-06-13-food-delivery-design.md` and `docs/superpowers/plans/2026-06-13-food-delivery.md` (Task 1 migration may be in flight)

## Still optional / needs you

- **Git commits** — check `git status` before assuming branch state
- **Edge Function Discord secret:** `supabase secrets set DISCORD_WEBHOOK_URL=...` (function may be deployed; pings need the secret)
- **Task 15 manual simulator checklist** — full food order → track → fail → voucher flow on device
- **Subagent code-quality reviews** — skipped for speed; run if you want the full SDD loop

## Quick verify

```bash
cd mobile && npm test && npm run typecheck
supabase db query --linked "SELECT COUNT(*) FROM gag_anchors;"
```
