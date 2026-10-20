#!/usr/bin/env bash
set -euo pipefail
umask 077
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
envfile="$ROOT/deploy/oracle/.env"
compose="$ROOT/deploy/oracle/compose.yaml"
[[ -f "$envfile" ]] || { echo "Missing deployment env file" >&2; exit 1; }
outdir="${BACKUP_DIR:-$ROOT/private-backups}"
mkdir -p "$outdir"
out="$outdir/talentsphere-$(date -u +%Y%m%dT%H%M%SZ).dump"
trap 'rm -f "$out.partial"' EXIT
docker compose --env-file "$envfile" -f "$compose" exec -T db pg_dump -U talentsphere -d talentsphere -Fc > "$out.partial"
test -s "$out.partial"
mv "$out.partial" "$out"
trap - EXIT
echo "Local backup: $out (must be encrypted and transferred off-host)"
