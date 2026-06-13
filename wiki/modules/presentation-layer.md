---
type: "module"
status: "active"
title: "Presentation Layer"
layer_id: "layer:ui"
tags: ["module", "presentation-layer"]
created: "2026-06-13"
updated: "2026-06-13"
---

# Presentation Layer

Expo Router screens and reusable React Native UI components for the parody super-app surfaces — home tabs, order flows, dating chat, merch shop, and live tracking maps.

## Files

- `mobile/src/app/(tabs)/_layout.tsx` — Expo Router tab layout defining the four main tabs (home, activity, vouchers, profile) with Thai labels and emoji tab icons styled via the shared theme.
- `mobile/src/app/(tabs)/activity.tsx` — Activity tab screen listing past orders with Thai status labels; tapping in-progress orders navigates to live tracking.
- `mobile/src/app/(tabs)/index.tsx` — Home tab screen showing a personalized greeting, service tiles (food, ride, parcel, mart, dating), a merch pop-up teaser with open/closed status, and partner promo campaigns.
- `mobile/src/app/(tabs)/profile.tsx` — Profile tab screen showing loyalty tier, XP progress, partner and brand shortcuts, optional BYO LLM API key storage, and sign-out.
- `mobile/src/app/(tabs)/vouchers.tsx` — Vouchers tab listing earned voucher campaigns and redeemed merch claims with Thai status labels, refreshing on tab focus.
- `mobile/src/app/+html.tsx` — Expo Router web HTML root template that constrains the app to a phone-width frame on desktop browsers using theme tokens for background and max width.
- `mobile/src/app/_layout.tsx` — Root Expo Router layout that initializes auth on mount, redirects signed-in users away from sign-in, and wraps the stack in a centered web shell on web.
- `mobile/src/app/brand/index.tsx` — Brand operator home screen showing shop inventory and claim counts for brand members, with navigation to the booth redemption flow.
- `mobile/src/app/brand/redeem.tsx` — Brand booth redemption screen where operators enter a WHEN- redemption code to confirm physical merch pickup via the redeem_claim RPC.
- `mobile/src/app/dating/chat/[matchId].tsx` — Dating chat screen combining message history, scripted story beats, affection drip on send, XP grants on beat choices, and date-order placement via SpotPicker.
- `mobile/src/app/dating/index.tsx` — Expo Router dating deck screen where users swipe through a daily persona stack, earn loyalty XP on rejection, and create matches via tier-weighted RNG.
- `mobile/src/app/dating/matches.tsx` — Dating matches list screen showing matched personas with affection percentage and navigation into per-match chat.
- `mobile/src/app/fail/[orderId].tsx` — Order failure finale screen that calls failOrder, optionally posts a persona apology into chat storage for date orders, and displays consolation vouchers or rate-limit messaging.
- `mobile/src/app/merch/claim/[claimId].tsx` — Claim detail screen displaying the redemption code and booth instructions after a successful merch claim, with a shortcut back to the vouchers tab.
- `mobile/src/app/merch/index.tsx` — Merch pop-up shop screen listing claimable items with voucher prices, live open/closed schedule badge, and claim flow that navigates to the claim detail screen.
- `mobile/src/app/order/[service]/confirm.tsx` — Order confirmation screen showing cart summary with satirical free-pricing copy, then submits the order and redirects to tracking.
- `mobile/src/app/order/[service]/index.tsx` — Service-specific catalog browse screen where users multi-select items and proceed to order confirmation.
- `mobile/src/app/partner.tsx` — Partner marketing tie-in request form that submits company and campaign details to the Supabase tiein-submit edge function with JWT auth.
- `mobile/src/app/sign-in.tsx` — Authentication screen supporting frictionless guest nickname sign-in and email/password sign-in or sign-up modes.
- `mobile/src/app/track/[orderId].tsx` — Live order tracking screen orchestrating the gag engine, doomed path animation, sabotage actions, and redirect to the failure finale.
- `mobile/src/ui/SpotPicker.native.tsx` — Native React Native modal for choosing a gag anchor date spot, grouping anchors by type with an optional react-native-maps view and fake distance labels.
- `mobile/src/ui/SpotPicker.tsx` — Platform re-export barrel that resolves SpotPicker to the native implementation and exports SpotPickerProps from shared types.
- `mobile/src/ui/SpotPicker.types.ts` — Shared SpotPickerProps type describing modal visibility, anchor list, persona context, loading state, and confirm/dismiss callbacks.
- `mobile/src/ui/SpotPicker.web.tsx` — Web fallback SpotPicker modal that lists anchors by category with coordinate text instead of a native map, sharing the same Thai UI copy as the native variant.
- `mobile/src/ui/TrackingMap.native.tsx` — React Native map component using react-native-maps to render the doomed delivery polyline, user pin, and rider marker with incident-aware emoji.
- `mobile/src/ui/TrackingMap.tsx` — Platform barrel file re-exporting the native TrackingMap implementation and its props type for cross-platform imports.
- `mobile/src/ui/TrackingMap.types.ts` — Shared TrackingMapProps interface tying map UI to engine path keyframes and coordinate types for cross-platform implementations.
- `mobile/src/ui/TrackingMap.web.tsx` — Web fallback TrackingMap that renders a styled text summary of coordinates and path points when native maps are unavailable.
- `mobile/src/ui/theme.ts` — Shared design token object defining brand colors, spacing, border radius, and mobile web max width used across all screens.
