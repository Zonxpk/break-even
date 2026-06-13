---
type: "flow"
status: "active"
order: 5
title: "Live Tracking: The Gag Experience"
tags: ["flow", "tour"]
created: "2026-06-13"
updated: "2026-06-13"
---

# Live Tracking: The Gag Experience

`track/[orderId].tsx` is the central integration point — it loads the order and gag script, ticks the engine every second, renders the map, exposes sabotage actions, and navigates to the failure finale when the script ends. `ui/TrackingMap.native.tsx` (re-exported through `TrackingMap.tsx`) draws the doomed polyline, user pin, and rider marker with incident-aware emoji on react-native-maps.

## Files in this step

- `mobile/src/app/track/[orderId].tsx` — Live order tracking screen orchestrating the gag engine, doomed path animation, sabotage actions, and redirect to the failure finale.
- `mobile/src/ui/TrackingMap.tsx` — Platform barrel file re-exporting the native TrackingMap implementation and its props type for cross-platform imports.
- `mobile/src/ui/TrackingMap.native.tsx` — React Native map component using react-native-maps to render the doomed delivery polyline, user pin, and rider marker with incident-aware emoji.
