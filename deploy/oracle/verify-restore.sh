#!/usr/bin/env bash
set -euo pipefail
[[ $# -eq 1 && -f "$1" ]] || { echo "Usage: bash deploy/oracle/verify-restore.sh BACKUP.dump" >&2; exit 2; }
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
compose=(docker compose --env-file "$ROOT/deploy/oracle/.env" -f "$ROOT/deploy/oracle/compose.yaml")
database="ts_restore_$(date -u +%s)_$$"
cleanup() { "${compose[@]}" exec -T db dropdb --if-exists -U talentsphere "$database" >/dev/null || true; }
trap cleanup EXIT
"${compose[@]}" exec -T db createdb -U talentsphere "$database"
"${compose[@]}" exec -T db pg_restore --exit-on-error --no-owner --no-acl -U talentsphere -d "$database" < "$1"
"${compose[@]}" exec -T db psql -U talentsphere -d "$database" -At -v ON_ERROR_STOP=1 -c 'SELECT COUNT(*) FROM public.schema_migrations;' >/dev/null
echo "Isolated database restore succeeded. This is not a full disaster recovery rehearsal."
