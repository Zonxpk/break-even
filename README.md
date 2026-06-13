# When? (กี่โมง?) — backend

Parody super app where the rider never arrives. This repo currently contains
the Supabase backend (sub-project 1 of 4). Spec:
`docs/superpowers/specs/2026-06-11-when-geemong-design.md`.

## Prereqs
- Docker Desktop
- Supabase CLI ≥ 2.x

## Develop

```bash
supabase start          # boot local stack
supabase db reset       # apply all migrations + seed.sql
supabase test db        # run pgTAP tests in supabase/tests/
```

## Edge Function

Create the env file first: `echo 'DISCORD_WEBHOOK_URL=' > supabase/functions/.env` (set a real webhook URL to test Discord pings).

```bash
supabase functions serve tiein-submit --env-file supabase/functions/.env
cd supabase/functions/tiein-submit && deno test  # unit tests
```

Secrets (production): `supabase secrets set DISCORD_WEBHOOK_URL=...`
