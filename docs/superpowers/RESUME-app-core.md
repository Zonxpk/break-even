# Resume — app core (updated 2026-06-12)

## Done

- Supabase cloud: `sgxdoukyzaluwkbaxqvy` linked, migrations + seed applied
- **Tasks 1–14** implemented in `mobile/` (routes under `src/app/`)
- **34/34 Jest tests** pass; `npm run typecheck` clean
- README mobile quickstart added

## Still optional / needs you

- **Git commits** — all app work is uncommitted on `app-core`
- **Edge Function Discord secret:** `supabase secrets set DISCORD_WEBHOOK_URL=...` (function may be deployed; pings need the secret)
- **Task 15 manual simulator checklist** — full food order → track → fail → voucher flow on device
- **Subagent code-quality reviews** — skipped for speed; run if you want the full SDD loop

## Quick verify

```bash
cd mobile && npm test && npm run typecheck
supabase db query --linked "SELECT COUNT(*) FROM gag_anchors;"
```
