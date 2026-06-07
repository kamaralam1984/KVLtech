#!/usr/bin/env bash
# scripts/backup.sh
# PostgreSQL backup script for KVL TECH.
# Dumps the kvltech database, compresses it, and retains only the last 7 daily backups.
# Make executable: chmod +x scripts/backup.sh
#
# Environment variables (set before running):
#   PGPASSWORD   — PostgreSQL password for kvluser
#
# Cron example (daily at 2 AM):
#   0 2 * * * PGPASSWORD=secret /opt/kvltech/scripts/backup.sh

set -euo pipefail

# ── Configuration ──────────────────────────────────────────────────────────────
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-kvltech}"
DB_USER="${DB_USER:-kvluser}"
BACKUP_DIR="${BACKUP_DIR:-/backups}"
LOG_FILE="${LOG_FILE:-/var/log/kvltech-backup.log}"
RETENTION_DAYS=7

# ── Helpers ───────────────────────────────────────────────────────────────────
log()  { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"; }
err()  { echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR $*" | tee -a "$LOG_FILE" >&2; }

# ── Preflight ─────────────────────────────────────────────────────────────────
if [ -z "${PGPASSWORD:-}" ]; then
  err "PGPASSWORD environment variable is not set. Aborting."
  exit 1
fi

if ! command -v pg_dump &>/dev/null; then
  err "pg_dump not found in PATH. Please install postgresql-client."
  exit 1
fi

if ! command -v gzip &>/dev/null; then
  err "gzip not found in PATH."
  exit 1
fi

mkdir -p "$BACKUP_DIR"
touch "$LOG_FILE"

# ── Backup ────────────────────────────────────────────────────────────────────
TIMESTAMP="$(date '+%Y-%m-%d_%H-%M')"
BACKUP_FILE="$BACKUP_DIR/kvltech_${TIMESTAMP}.sql.gz"

log "Starting backup of database '$DB_NAME' on $DB_HOST:$DB_PORT..."

if pg_dump \
    --host="$DB_HOST" \
    --port="$DB_PORT" \
    --username="$DB_USER" \
    --no-password \
    --format=plain \
    --no-owner \
    --no-acl \
    "$DB_NAME" | gzip -9 > "$BACKUP_FILE"; then
  log "Backup written to: $BACKUP_FILE ($(du -sh "$BACKUP_FILE" | cut -f1))"
else
  err "pg_dump failed. Removing incomplete backup file."
  rm -f "$BACKUP_FILE"
  exit 1
fi

# ── Retention: keep last 7 daily backups ──────────────────────────────────────
log "Pruning backups older than $RETENTION_DAYS days in $BACKUP_DIR..."
DELETED=0
while IFS= read -r old_file; do
  rm -f "$old_file"
  log "Deleted old backup: $old_file"
  DELETED=$((DELETED + 1))
done < <(find "$BACKUP_DIR" -maxdepth 1 -name 'kvltech_*.sql.gz' -mtime +"$RETENTION_DAYS" -type f | sort)

log "Pruning complete. Removed $DELETED old backup(s)."
log "Backup finished successfully."
exit 0
