---
type: "module"
status: "active"
title: "Infrastructure Layer"
layer_id: "layer:infrastructure"
tags: ["module", "infrastructure-layer"]
created: "2026-06-13"
updated: "2026-06-13"
---

# Infrastructure Layer

Local development stack orchestration scripts that bootstrap the Supabase backend alongside the Expo mobile client.

## Files

- `scripts/local-stack.sh` — Bash wrapper around supabase start/stop that also disables Docker restart=unless-stopped on geemong containers so a manual Docker Desktop stop keeps the local stack down.
