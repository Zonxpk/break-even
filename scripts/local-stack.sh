#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_ID="$(awk -F'"' '/^project_id/ { print $2; exit }' "$ROOT/supabase/config.toml")"

fix_restart_policy() {
  local ids
  ids="$(docker ps -aq --filter "name=${PROJECT_ID}")"
  if [[ -z "$ids" ]]; then
    echo "No ${PROJECT_ID} containers found."
    return 0
  fi

  # Supabase CLI sets unless-stopped; use "no" so Docker Desktop stop stays stopped.
  docker update --restart=no $ids >/dev/null
  echo "Set restart policy to \"no\" for ${PROJECT_ID} containers."
}

usage() {
  cat <<EOF
Usage: $(basename "$0") <start|stop|fix-restart>

  start        Run supabase start, then disable auto-restart on containers
  stop         Run supabase stop (preferred way to shut down the stack)
  fix-restart  Disable auto-restart on already-running containers

Use this instead of stopping containers one-by-one in Docker Desktop.
EOF
}

cmd="${1:-}"
shift || true

case "$cmd" in
  start)
    cd "$ROOT"
    supabase start "$@"
    fix_restart_policy
    ;;
  stop)
    cd "$ROOT"
    supabase stop "$@"
    ;;
  fix-restart)
    fix_restart_policy
    ;;
  *)
    usage
    exit 1
    ;;
esac
