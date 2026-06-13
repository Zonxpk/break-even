---
type: "flow"
status: "active"
order: 1
title: "Entry Point: Boot the Parody Super App"
tags: ["flow", "tour"]
created: "2026-06-13"
updated: "2026-06-13"
---

# Entry Point: Boot the Parody Super App

When? (กี่โมง?) is a parody super app where the rider never arrives. The monorepo ships four sub-projects — Supabase backend, Expo mobile client, dating sim, and merch shop — but every user journey starts here. `mobile/src/app/_layout.tsx` is the Expo Router root: it calls `useAuth().init()` on mount, registers the stack routes (tabs, orders, tracking, dating, merch), and wraps the app in a phone-width shell on web. Auth lives in `mobile/src/state/auth.ts` (Zustand + Supabase anonymous guest sessions), and `mobile/src/lib/supabase.ts` is the singleton client that wires AsyncStorage persistence. Unauthenticated users land on `sign-in.tsx` for frictionless guest nickname login.

## Files in this step

- `mobile/src/app/_layout.tsx` — Root Expo Router layout that initializes auth on mount, redirects signed-in users away from sign-in, and wraps the stack in a centered web shell on web.
- `mobile/src/state/auth.ts` — Zustand auth store wrapping Supabase anonymous and email auth, profile loading, session listeners, and automatic guest re-sign-in after sign-out.
- `mobile/src/lib/supabase.ts` — Singleton Supabase client configured with AsyncStorage auth persistence on native/browser and SSR-safe noop storage during Expo Router server rendering.
- `mobile/src/app/sign-in.tsx` — Authentication screen supporting frictionless guest nickname sign-in and email/password sign-in or sign-up modes.
