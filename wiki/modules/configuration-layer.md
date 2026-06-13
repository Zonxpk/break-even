---
type: "module"
status: "active"
title: "Configuration Layer"
layer_id: "layer:config"
tags: ["module", "configuration-layer"]
created: "2026-06-13"
updated: "2026-06-13"
---

# Configuration Layer

Mobile app build and runtime configuration — Expo app manifest, TypeScript/Jest setup, environment templates, Vercel deploy config, and analysis tooling metadata.

## Files

- `.understand-anything/config.json` — Understand-Anything project settings storing the output language preference (currently English) used for knowledge-graph summaries and tour text.
- `mobile/.claude/settings.json` — Claude Code workspace settings for the mobile sub-project, enabling the official Expo plugin for agent-assisted development.
- `mobile/.env.example` — Environment variable template for Supabase Cloud credentials — documents EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY required at build time for static web export on Vercel.
- `mobile/app.json` — Expo application manifest defining app identity, portrait orientation, platform icons, static web output, expo-router and splash-screen plugins, plus typedRoutes and React Compiler experiments.
- `mobile/assets/expo.icon/icon.json` — Expo liquid-glass app icon definition layering the Expo symbol SVG over a grid with translucency, shadow, and per-platform shape support (squares shared, circles for watchOS).
- `mobile/package.json` — Mobile package manifest with Expo SDK 56 dependencies — Supabase client, Zustand state, React Native Maps, Jest testing, and npm scripts for start, web export, lint, test, and typecheck.
- `mobile/tsconfig.json` — TypeScript configuration extending expo/tsconfig.base with strict mode, Jest types, and path aliases mapping @/* to ./src/* and @/assets/* to ./assets/*.
- `mobile/vercel.json` — Vercel deployment configuration for the mobile web export — runs npm run vercel-build, serves static output from dist/, and enables clean URLs without framework auto-detection.
- `.understand-anything/.understandignore` — Understand-Anything exclusion manifest listing suggested gitignore-derived patterns and test/doc directory globs; all entries are commented out so only built-in defaults apply during graph scans.
- `mobile/jest.config.js` — Jest configuration for the Expo mobile app using the jest-expo preset, loading jest.setup.js after env, and whitelisting React Native, Expo, Supabase, and Zustand packages for transformation.
- `mobile/jest.setup.js` — Jest global setup that mocks AsyncStorage and supplies default EXPO_PUBLIC_SUPABASE_URL and anon key env vars so unit tests run without a live Supabase instance.
- `mobile/scripts/reset-project.js` — Interactive Expo starter utility that archives or deletes existing src/ and scripts/ directories, then scaffolds a fresh src/app Expo Router layout with blank index and _layout screens.
