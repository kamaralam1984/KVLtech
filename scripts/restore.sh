#!/usr/bin/env bash
# scripts/restore.sh
# Restore the KVL TECH PostgreSQL database from a backup file.
# Usage: ./scripts/restore.sh <path-to-backup.sql.gz>
# Make executable: chmod +x scripts/restore.sh
#
# Environment variables:
#   PGPASSWORD   — PostgreSQL password for kvluser (superuser required for DROP/CREATE)

set -euo pipefail

# ── Configuration ──────────────────────────────────────────────────────────────
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-kvltech}"
DB_USER="${DB_USER:-kvluser}"
MAINTENANCE_DB="${MAINTENANCE_DB:-postgres}"

# ── Helpers ───────────────────────────────────────────────────────────────────
log()  { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }
err()  { echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR $*" >&2; }

psql_cmd() {
  PGPASSWORD="$PGPASSWORD" psql \
    --host="$DB_HOST" \
    --port="$DB_PORT" \
    --username="$DB_USER" \
    --no-password \
    "$@"
}

# ── Argument validation ────────────────────────────────────────────────────────
if [ $# -ne 1 ]; then
  err "Usage: $0 <path-to-backup.sql.gz>"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  err "Backup file not found: $BACKUP_FILE"
  exit 1
fi

if [[ "$BACKUP_FILE" != *.sql.gz ]]; then
  err "Expected a .sql.gz file, got: $BACKUP_FILE"
  exit 1
fi

# ── Preflight checks ──────────────────────────────────────────────────────────
if [ -z "${PGPASSWORD:-}" ]; then
  err "PGPASSWORD environment variable is not set. Aborting."
  exit 1
fi

for cmd in psql gunzip; do
  if ! command -v "$cmd" &>/dev/null; then
    err "$cmd not found in PATH."
    exit 1
  fi
done

# ── Confirmation prompt ───────────────────────────────────────────────────────
echo ""
echo "================================================================"
echo "  WARNING: DATABASE RESTORE"
echo "================================================================"
echo "  This will DROP and RECREATE the '$DB_NAME' database on:"
echo "  Host : $DB_HOST:$DB_PORT"
echo "  User : $DB_USER"
echo "  File : $BACKUP_FILE"
echo ""
echo "  ALL EXISTING DATA WILL BE PERMANENTLY LOST."
echo "================================================================"
echo ""
read -r -p "Are you sure you want to continue? Type 'y' to proceed: " CONFIRM

if [ "$CONFIRM" != "y" ]; then
  log "Restore cancelled by user."
  exit 0
fi

# ── Drop and recreate database ─────────────────────────────────────────────────
log "Terminating active connections to '$DB_NAME'..."
psql_cmd -d "$MAINTENANCE_DB" -c \
  "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='$DB_NAME' AND pid <> pg_backend_pid();" \
  > /dev/null

log "Dropping database '$DB_NAME'..."
psql_cmd -d "$MAINTENANCE_DB" -c "DROP DATABASE IF EXISTS \"$DB_NAME\";"

log "Creating database '$DB_NAME'..."
psql_cmd -d "$MAINTENANCE_DB" -c "CREATE DATABASE \"$DB_NAME\" OWNER \"$DB_USER\";"

# ── Restore ───────────────────────────────────────────────────────────────────
log "Restoring from $BACKUP_FILE..."
if gunzip --stdout "$BACKUP_FILE" | psql_cmd -d "$DB_NAME" --quiet; then
  log "Database restore complete."
else
  err "Restore failed. The database may be in an inconsistent state."
  exit 1
fi

# ── Regenerate Prisma client ───────────────────────────────────────────────────
log "Running prisma generate to regenerate client..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

if command -v npx &>/dev/null; then
  (cd "$PROJECT_DIR" && npx prisma generate)
  log "Prisma client regenerated."
else
  log "WARN: npx not found — skipping prisma generate. Run it manually."
fi

log "Restore finished successfully."
exit 0
