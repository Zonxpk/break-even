---
type: "flow"
status: "active"
order: 2
title: "The Super-App Home Screen"
tags: ["flow", "tour"]
created: "2026-06-13"
updated: "2026-06-13"
---

# The Super-App Home Screen

After sign-in, users enter the four-tab shell defined in `(tabs)/_layout.tsx` — home, activity, vouchers, and profile. The home tab (`(tabs)/index.tsx`) is the parody delivery-app façade: a personalized greeting, service tiles for food, ride, parcel, and mart, plus entry points into the dating sim and merch pop-up. Service labels and accent colors come from `services/config.ts`, and `ui/theme.ts` supplies the shared design tokens (brand green, spacing, mobile web max-width) used across every screen.

## Files in this step

- `mobile/src/app/(tabs)/_layout.tsx` — Expo Router tab layout defining the four main tabs (home, activity, vouchers, profile) with Thai labels and emoji tab icons styled via the shared theme.
- `mobile/src/app/(tabs)/index.tsx` — Home tab screen showing a personalized greeting, service tiles (food, ride, parcel, mart, dating), a merch pop-up teaser with open/closed status, and partner promo campaigns.
- `mobile/src/services/config.ts` — Static UI configuration map for each delivery service (food, ride, parcel, mart) with Thai labels, CTAs, and accent colors.
- `mobile/src/ui/theme.ts` — Shared design token object defining brand colors, spacing, border radius, and mobile web max width used across all screens.
