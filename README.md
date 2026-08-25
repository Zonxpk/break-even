# When? / กี่โมง?

**A parody Thai super app where every service works—except the outcome.**

When? looks like a delivery / mobility / lifestyle super app, then turns familiar product patterns into an intentionally unreliable comedy system: food that never arrives, rides from another dimension, dating orders, timed merch drops, vouchers, partner campaigns, and a shared tracking engine that always finds a new way to fail.

**Live:** https://break-even-beta.vercel.app

## Why this project exists

This is a product-engineering playground for exploring how far a coherent system can stretch a joke without becoming a collection of disconnected screens. The core challenge was to make every feature feel like part of one believable consumer app while sharing the same data model, failure logic, visual language, and operational backend.

## What I built

- **Expo + React Native client** with Expo Router for mobile-first and web delivery.
- **Reusable gag engine** for deterministic routes, scripted incidents, progress states, and failure finales.
- **Food ordering flow** with browsing, cart math, order creation, tracking, and failure states.
- **Dating simulation** with swipe decks, matches, chat beats, affection progression, and date orders that reuse the same tracking/failure pipeline.
- **Merch pop-up shop** with opening schedules, voucher claims, stock handling, and brand redemption flow.
- **Supabase backend** with Postgres migrations, RLS-oriented data access, seed data, RPCs, and Deno Edge Functions.
- **Partner campaign workflow** backed by an Edge Function with optional Discord notification delivery.
- **Automated tests** across the domain engine, API modules, state, UI smoke paths, database migrations, and RPC hardening.

## Product architecture

The app is deliberately layered so the comedy is not hard-coded into screens:

```text
Expo Router screens / reusable doodle UI
                ↓
Feature modules + Zustand state
(food · dating · merch · auth)
                ↓
Shared domain engine
(route · path · scripts · deterministic RNG)
                ↓
Typed data/API layer
                ↓
Supabase
(Postgres · RLS · RPC · Edge Functions)
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full system walkthrough.

## Design language

The interface uses a hand-drawn notebook / sticker aesthetic instead of a generic delivery-app UI. Shared primitives such as `Sketch`, `PaperBackground`, rough borders, rotated cards, warm paper tones, and the Mali typeface keep the experience intentionally imperfect while preserving a consistent component system.

The visual goal is **"polished enough to trust, weird enough to suspect."**

## Repository map

```text
mobile/                  Expo / React Native application
  src/app/               Expo Router screens
  src/engine/            shared gag/tracking engine
  src/dating/            swipe, chat, affection, date-order logic
  src/food/              food search + cart domain logic
  src/shop/              merch schedule logic
  src/api/               typed Supabase-facing data modules
  src/state/             auth and client state
  src/ui/                shared UI + doodle primitives

supabase/
  migrations/            schema + RPC changes
  functions/             Deno Edge Functions
  tests/                 pgTAP database tests
  seed.sql               development content

prototypes/              early interaction / visual explorations
wiki/                    generated architecture knowledge base
docs/superpowers/        design specs, plans, and implementation handoffs
```

## Local setup

### Mobile / web client

```bash
cd mobile
npm install
cp .env.example .env
```

Set the two public client values in `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Then run:

```bash
npm run web        # Expo web
npm start          # Expo dev server for device / simulator
npm test           # Jest suite
npm run typecheck  # TypeScript
npm run build      # static web export
```

### Supabase backend

Requires Docker Desktop and Supabase CLI 2.x+.

```bash
./scripts/local-stack.sh start
supabase db reset
supabase test db
```

For the partner Edge Function:

```bash
echo 'DISCORD_WEBHOOK_URL=' > supabase/functions/.env
supabase functions serve tiein-submit --env-file supabase/functions/.env
cd supabase/functions/tiein-submit && deno test
```

## Engineering notes

- Anonymous auth is the default consumer path; email/password is also supported.
- The client degrades into a data-less guest state if Supabase is unreachable instead of crashing on boot.
- Business features are isolated from the shared route/failure engine so new parody services can reuse the same lifecycle.
- Web and native map implementations are split behind platform-specific components.
- Database behavior is migration-driven and covered by pgTAP tests, including security-hardening cases.

## Portfolio summary

**Role:** Product design + full-stack implementation  
**Focus:** Mobile product architecture, reusable domain systems, playful interaction design, Supabase backend, automated testing  
**Stack:** React Native, Expo Router, TypeScript, Zustand, Supabase/Postgres, Deno, Jest, pgTAP

The project is less about a one-off joke and more about proving that a deliberately absurd product can still be engineered like a real one.