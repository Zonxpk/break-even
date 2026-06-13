# When? (กี่โมง?) — backend

Parody super app where the rider never arrives. This repo currently contains
the Supabase backend (sub-project 1 of 4). Spec:
`docs/superpowers/specs/2026-06-11-when-geemong-design.md`.

## Prereqs
- Docker Desktop
- Supabase CLI ≥ 2.x

## Develop

```bash
./scripts/local-stack.sh start   # boot local stack (stays stopped when you close containers)
./scripts/local-stack.sh stop    # shut down the whole stack
supabase db reset                # apply all migrations + seed.sql
supabase test db                 # run pgTAP tests in supabase/tests/
```

If you already ran `supabase start`, disable auto-restart on running containers:

```bash
./scripts/local-stack.sh fix-restart
```

Supabase sets `restart=unless-stopped` by default, so containers come back after
Docker Desktop restarts. The wrapper sets `restart=no` so a manual stop in Docker
Desktop keeps them down.

## Edge Function

Create the env file first: `echo 'DISCORD_WEBHOOK_URL=' > supabase/functions/.env` (set a real webhook URL to test Discord pings).

```bash
supabase functions serve tiein-submit --env-file supabase/functions/.env
cd supabase/functions/tiein-submit && deno test  # unit tests
```

Secrets (production): `supabase secrets set DISCORD_WEBHOOK_URL=...`

## Mobile app (sub-project 2)

Cloud project: link with `supabase link --project-ref <ref>`, push schema with `supabase db push`, seed with `supabase db query --linked --file supabase/seed.sql`.

```bash
cd mobile
cp .env.example .env        # fill EXPO_PUBLIC_SUPABASE_URL + anon key from dashboard
npm install
npx expo start              # press i (iOS sim) or a (Android emulator)
npm test                    # jest: engine, path, route, balance, stores
npm run typecheck
```

Partner form calls the deployed Edge Function: `supabase functions deploy tiein-submit` (+ `DISCORD_WEBHOOK_URL` secret for Discord pings).

### Merch shop (sub-project 4)

Pop-up shop on home → `/merch`. Claims consume vouchers via `claim_merch` RPC. Brand staff redeem at `/brand/redeem`. See `docs/superpowers/RESUME-merch-shop.md`.

### Dating sim (sub-project 3)

Home 💘 tile → swipe deck → chat → book date → shared gag track/fail. See `docs/superpowers/RESUME-dating-sim.md`.
