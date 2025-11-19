#!/bin/bash

# ============================================
# VIWOAPP BACKEND BACKUP SCRIPT
# ============================================
# Automated backup script for database and uploads
# 
# Usage:
#   ./scripts/backup.sh
#   
# Add to crontab for automated backups:
#   0 2 * * * /var/www/viwoapp/backend/scripts/backup.sh >> /var/www/viwoapp/logs/backup.log 2>&1

set -e  # Exit on error

# ==========================================
# CONFIGURATION
# ==========================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${PROJECT_DIR}/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# Load environment variables
if [ -f "${PROJECT_DIR}/.env" ]; then
    export $(cat "${PROJECT_DIR}/.env" | grep -v '^#' | xargs)
fi

# Docker configuration (change these if not using docker-compose)
POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-viwoapp-postgres}"
POSTGRES_USER="${POSTGRES_USER:-viwoapp}"
POSTGRES_DB="${POSTGRES_DB:-viwoapp}"

# ==========================================
# FUNCTIONS
# ==========================================

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

error() {
    log "ERROR: $1" >&2
    exit 1
}

# ==========================================
# PRE-FLIGHT CHECKS
# ==========================================

log "Starting backup process..."

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR" || error "Failed to create backup directory"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    error "Docker is not running"
fi

# Check if postgres container exists
if ! docker ps -a --format '{{.Names}}' | grep -q "^${POSTGRES_CONTAINER}$"; then
    error "PostgreSQL container not found: $POSTGRES_CONTAINER"
fi

# Check available disk space (require at least 1GB free)
AVAILABLE_SPACE=$(df -BG "$BACKUP_DIR" | awk 'NR==2 {print $4}' | sed 's/G//')
if [ "$AVAILABLE_SPACE" -lt 1 ]; then
    error "Insufficient disk space. Available: ${AVAILABLE_SPACE}GB"
fi

# ==========================================
# DATABASE BACKUP
# ==========================================

log "Backing up PostgreSQL database..."

DB_BACKUP_FILE="${BACKUP_DIR}/db_backup_${DATE}.sql.gz"

if docker exec "$POSTGRES_CONTAINER" pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "$DB_BACKUP_FILE"; then
    DB_SIZE=$(du -h "$DB_BACKUP_FILE" | cut -f1)
    log "Database backup completed: $DB_BACKUP_FILE ($DB_SIZE)"
else
    error "Database backup failed"
fi

# ==========================================
# UPLOADS BACKUP
# ==========================================

log "Backing up uploads directory..."

UPLOADS_DIR="${PROJECT_DIR}/uploads"
UPLOADS_BACKUP_FILE="${BACKUP_DIR}/uploads_backup_${DATE}.tar.gz"

if [ -d "$UPLOADS_DIR" ] && [ "$(ls -A $UPLOADS_DIR)" ]; then
    if tar -czf "$UPLOADS_BACKUP_FILE" -C "$PROJECT_DIR" uploads/; then
        UPLOADS_SIZE=$(du -h "$UPLOADS_BACKUP_FILE" | cut -f1)
        log "Uploads backup completed: $UPLOADS_BACKUP_FILE ($UPLOADS_SIZE)"
    else
        log "WARNING: Uploads backup failed (non-critical)"
    fi
else
    log "Skipping uploads backup (directory empty or not found)"
fi

# ==========================================
# LOGS BACKUP (Optional)
# ==========================================

log "Backing up logs directory..."

LOGS_DIR="${PROJECT_DIR}/logs"
LOGS_BACKUP_FILE="${BACKUP_DIR}/logs_backup_${DATE}.tar.gz"

if [ -d "$LOGS_DIR" ] && [ "$(ls -A $LOGS_DIR)" ]; then
    if tar -czf "$LOGS_BACKUP_FILE" -C "$PROJECT_DIR" logs/; then
        LOGS_SIZE=$(du -h "$LOGS_BACKUP_FILE" | cut -f1)
        log "Logs backup completed: $LOGS_BACKUP_FILE ($LOGS_SIZE)"
    else
        log "WARNING: Logs backup failed (non-critical)"
    fi
else
    log "Skipping logs backup (directory empty or not found)"
fi

# ==========================================
# CLEANUP OLD BACKUPS
# ==========================================

log "Cleaning up old backups (retention: $RETENTION_DAYS days)..."

# Delete database backups older than retention period
DELETED_DB=$(find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l)
log "Deleted $DELETED_DB old database backup(s)"

# Delete uploads backups older than retention period
DELETED_UPLOADS=$(find "$BACKUP_DIR" -name "uploads_backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l)
log "Deleted $DELETED_UPLOADS old uploads backup(s)"

# Delete logs backups older than retention period
DELETED_LOGS=$(find "$BACKUP_DIR" -name "logs_backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l)
log "Deleted $DELETED_LOGS old logs backup(s)"

# ==========================================
# BACKUP VERIFICATION
# ==========================================

log "Verifying backup integrity..."

# Verify database backup
if gzip -t "$DB_BACKUP_FILE" 2>/dev/null; then
    log "Database backup verified successfully"
else
    error "Database backup verification failed"
fi

# ==========================================
# OPTIONAL: UPLOAD TO CLOUD STORAGE
# ==========================================

# Uncomment and configure for S3 upload
# if command -v aws &> /dev/null; then
#     log "Uploading backups to S3..."
#     S3_BUCKET="s3://your-backup-bucket/viwoapp"
#     aws s3 cp "$DB_BACKUP_FILE" "$S3_BUCKET/database/" || log "WARNING: S3 upload failed"
#     aws s3 cp "$UPLOADS_BACKUP_FILE" "$S3_BUCKET/uploads/" || log "WARNING: S3 upload failed"
#     log "Cloud backup completed"
# fi

# ==========================================
# BACKUP SUMMARY
# ==========================================

log "=========================================="
log "Backup completed successfully!"
log "=========================================="
log "Date: $(date '+%Y-%m-%d %H:%M:%S')"
log "Location: $BACKUP_DIR"
log "Database: $DB_BACKUP_FILE"
log "Uploads: $UPLOADS_BACKUP_FILE"
log "Retention: $RETENTION_DAYS days"
log "Disk usage: $(du -sh $BACKUP_DIR | cut -f1)"
log "=========================================="

# ==========================================
# SEND NOTIFICATION (Optional)
# ==========================================

# Example: Send notification via webhook
# curl -X POST "https://your-monitoring-service.com/webhook" \
#     -H "Content-Type: application/json" \
#     -d "{\"message\": \"Backup completed successfully\", \"timestamp\": \"$DATE\"}"

exit 0



