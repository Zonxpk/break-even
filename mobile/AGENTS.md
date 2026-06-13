# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

## Geemong context

- **Product:** When? (กี่โมง?) — parody Thai super app; delivery browse must look real until the gag engine runs.
- **Status:** `docs/superpowers/RESUME-*.md` and specs in `docs/superpowers/specs/`.
- **Supabase:** linked cloud (`sgxdoukyzaluwkbaxqvy`) — use `--linked` CLI flags; don't assume local `db reset`.
- **Auth:** guest/anonymous by default; no forced sign-up screen.
- **Food delivery:** dedicated `food_*` CMS tables and `/order/food/*` routes (see `2026-06-13-food-delivery-design.md`). Ride/parcel/mart still use flat `catalog_items` browse.
- **New features:** brainstorm → spec → plan → implement (superpowers skills). Don't ship shallow browse as a shortcut.
