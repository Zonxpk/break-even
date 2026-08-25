# Architecture — When? / กี่โมง?

This document explains the architecture behind **When?**, a parody Thai super app whose features share one deliberately unreliable delivery lifecycle.

The important design decision is that the joke is a **domain system**, not a screen effect. Food, dating, merch, partner campaigns, and future services can reuse the same routing, progress, incident, and failure concepts without duplicating the core behavior.

## 1. System at a glance

```text
┌────────────────────────────────────────────────────┐
│                  Expo / React Native               │
│                                                    │
│  Expo Router screens                              │
│  Home · Food · Dating · Merch · Tracking · Brand  │
│                      │                             │
│                      ▼                             │
│  UI system + feature state                        │
│  Doodle primitives · Zustand · feature modules    │
│                      │                             │
│            ┌─────────┴─────────┐                   │
│            ▼                   ▼                   │
│      Domain engine       Feature domains          │
│  route/path/scripts     food/dating/shop          │
│            │                   │                   │
│            └─────────┬─────────┘                   │
│                      ▼                             │
│              Typed API layer                      │
└──────────────────────┬─────────────────────────────┘
                       ▼
┌────────────────────────────────────────────────────┐
│                    Supabase                        │
│                                                    │
│ Postgres · Auth · RPCs · Edge Functions · seeds   │
│ pgTAP tests · partner notification integration     │
└────────────────────────────────────────────────────┘
```

## 2. Presentation layer

`mobile/src/app/` is the route surface. Expo Router keeps the consumer flows explicit and makes the same app navigable on native and web.

Key route groups:

- `(tabs)/` — home, activity, vouchers, profile
- `order/` — service-specific ordering flows
- `track/[orderId]` — shared live tracking experience
- `fail/[orderId]` — shared failure finale
- `dating/` — swipe deck, matches, chat, date-order path
- `merch/` — timed pop-up shop and claims
- `brand/` — brand-side redemption tools
- `partner.tsx` — partner campaign submission

The route layer is intentionally thin. Screens compose domain functions, API calls, state, and shared visual primitives instead of embedding the product rules directly in JSX.

## 3. Visual system

The app has a reusable hand-drawn design language under `mobile/src/ui/`.

Important primitives include:

- `PaperBackground` — paper-like base surface
- `Sketch` — rough bordered / filled container used for cards, notes, and CTA blocks
- `CrayonCta` — expressive call-to-action treatment
- `theme.ts` — shared colors, type, radii, spacing, and web shell width
- platform-specific `TrackingMap` and `SpotPicker` implementations

The visual layer deliberately introduces controlled imperfection—small rotations, rough strokes, sticker-like washes—while keeping the component boundaries systematic.

## 4. Shared gag engine

`mobile/src/engine/` contains the reusable lifecycle mechanics.

```text
service/order
    ↓
route generation
    ↓
path / progress
    ↓
script selection
    ↓
incidents / delays
    ↓
final failure state
```

Core responsibilities:

- `route.ts` — route construction and service movement model
- `path.ts` — path/progress calculations
- `pickScript.ts` — deterministic incident/failure script selection
- `engine.ts` — orchestration of lifecycle state
- `types.ts` — engine contracts

A seeded RNG utility in `mobile/src/lib/rng.ts` keeps scripted behavior reproducible for testing and predictable replays.

This separation is what lets a date order reuse the same underlying tracking/failure experience as a food order without turning dating into a copy-pasted mini app.

## 5. Feature domains

### Food

`mobile/src/food/` owns local product behavior such as search and cart math. `mobile/src/api/food.ts` and `orders.ts` handle persistence-facing operations.

The food flow is:

```text
browse → cart → create order → shared tracking → shared failure
```

### Dating

`mobile/src/dating/` is a larger domain with its own internal model:

- swipe deck generation
- match decisions
- chat sessions and scripted beats
- affection progression
- distance jokes
- date booking
- local chat persistence

The key integration point is date booking: once a date becomes an order-like event, it re-enters the shared tracking engine instead of inventing a separate progress system.

### Merch

`mobile/src/shop/` contains schedule logic, while API modules and Supabase RPCs handle inventory / voucher behavior.

The consumer side exposes timed availability and claims; the brand side exposes redemption. This makes the feature a small two-sided workflow rather than a decorative store screen.

## 6. State and authentication

Zustand is used for lightweight client state in `mobile/src/state/`.

`auth.ts` supports:

- automatic anonymous guest sign-in
- email/password sign-in and sign-up
- profile hydration
- session refresh
- sign-out back into a fresh guest session

A deliberate resilience choice is built into `init()`: if Supabase is unavailable, startup falls back to a data-less guest state rather than leaving the application in a rejected initialization path.

## 7. Data access

`mobile/src/api/` is the boundary between UI/domain code and Supabase.

Modules are split by responsibility:

- `content.ts`
- `food.ts`
- `orders.ts`
- `personas.ts`
- `shop.ts`

The Supabase client is centralized in `mobile/src/lib/supabase.ts`, including browser-safe auth storage behavior for Expo Router web/SSR contexts.

This keeps infrastructure imports out of most feature code and makes API behavior independently testable.

## 8. Backend architecture

`supabase/` is migration-driven.

```text
migrations/
  profiles
  content
  user/order data
  shop
  partner tie-ins
  voucher + merch RPCs
  security hardening
  food domain

functions/
  tiein-submit/

tests/
  pgTAP coverage per migration / RPC area
```

The backend provides:

- authentication-backed profiles
- content and campaign tables
- order / user records
- merch and voucher tables
- partner submission storage
- database RPCs for sensitive state transitions
- seeded development content
- database-level regression tests

## 9. Edge Function boundary

`supabase/functions/tiein-submit/` handles partner submission orchestration that does not belong in the client.

It is responsible for server-side validation / persistence and can emit a Discord webhook notification when configured. Keeping that integration at the edge avoids exposing server credentials to the Expo client.

## 10. Testing strategy

The project uses two complementary test layers.

### Client / domain

Jest covers:

- engine behavior
- route/path generation
- script selection
- balance logic
- food cart/search logic
- dating deck/chat/affection/swipe behavior
- shop scheduling
- API modules
- auth utilities
- selected React Native smoke paths

### Database

pgTAP tests under `supabase/tests/` verify schema behavior, RPCs, and hardening cases close to the database boundary.

This split keeps deterministic product rules fast to test in TypeScript while validating database invariants where they actually execute.

## 11. Why this architecture works for the product

The project intentionally looks unserious while being structured seriously.

The architecture creates three useful forms of leverage:

1. **New joke, same lifecycle.** A new service can plug into the shared engine instead of rebuilding tracking and failure mechanics.
2. **New visual expression, same product rules.** The doodle system can evolve without changing domain behavior.
3. **Backend changes stay behind contracts.** Screens consume typed API/domain functions rather than depending on raw Supabase queries everywhere.

That makes the codebase extensible enough to keep adding absurd product ideas without the app collapsing into unrelated prototypes.

## 12. Deployment shape

The current web build is deployed at:

**https://break-even-beta.vercel.app**

The Expo app can also run through native development targets. Supabase supplies the hosted data/auth backend, with environment configuration passed through Expo public variables for the client and server-only secrets reserved for Edge Functions.

## 13. Portfolio takeaway

When? demonstrates a combination of:

- product concept development
- React Native / Expo architecture
- cross-platform UI systems
- reusable domain modeling
- state and authentication design
- Supabase/Postgres backend work
- serverless integration boundaries
- automated client + database testing
- playful interaction design without sacrificing engineering structure

The strongest technical idea in the project is simple: **make the parody mechanic reusable enough that the product can grow like a real platform.**