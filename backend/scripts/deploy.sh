#!/bin/bash

# ============================================
# VIWOAPP BACKEND DEPLOYMENT SCRIPT
# ============================================
# Automated deployment script for AWS VPS
# 
# Usage:
#   ./scripts/deploy.sh [environment]
#   
# Examples:
#   ./scripts/deploy.sh production
#   ./scripts/deploy.sh staging

set -e  # Exit on error

# ==========================================
# CONFIGURATION
# ==========================================

ENVIRONMENT="${1:-production}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ==========================================
# FUNCTIONS
# ==========================================

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" >&2
    exit 1
}

# ==========================================
# PRE-DEPLOYMENT CHECKS
# ==========================================

log "Starting deployment for environment: $ENVIRONMENT"

cd "$PROJECT_DIR" || error "Failed to change to project directory"

# Check if .env file exists
if [ ! -f ".env" ]; then
    error ".env file not found. Please create it from .env.example"
fi

# Check if required commands are available
command -v node >/dev/null 2>&1 || error "Node.js is not installed"
command -v npm >/dev/null 2>&1 || error "npm is not installed"
command -v docker >/dev/null 2>&1 || error "Docker is not installed"
command -v docker-compose >/dev/null 2>&1 || error "docker-compose is not installed"

# Verify Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    error "Node.js version 18 or higher is required (current: $(node -v))"
fi

log "Pre-deployment checks passed"

# ==========================================
# BACKUP CURRENT STATE
# ==========================================

log "Creating backup before deployment..."

if [ -f "scripts/backup.sh" ]; then
    bash scripts/backup.sh || warn "Backup failed (continuing anyway)"
else
    warn "Backup script not found, skipping backup"
fi

# ==========================================
# PULL LATEST CODE
# ==========================================

if [ -d ".git" ]; then
    log "Pulling latest code from repository..."
    
    # Stash any local changes
    git stash || true
    
    # Pull latest changes
    git pull origin master || error "Failed to pull latest code"
    
    log "Code updated successfully"
else
    warn "Not a git repository, skipping git pull"
fi

# ==========================================
# INSTALL DEPENDENCIES
# ==========================================

log "Installing dependencies..."

npm ci --only=production || error "Failed to install dependencies"

log "Dependencies installed successfully"

# ==========================================
# GENERATE PRISMA CLIENT
# ==========================================

log "Generating Prisma client..."

npx prisma generate || error "Failed to generate Prisma client"

log "Prisma client generated successfully"

# ==========================================
# BUILD APPLICATION
# ==========================================

log "Building application..."

npm run build || error "Failed to build application"

log "Build completed successfully"

# ==========================================
# DATABASE MIGRATION
# ==========================================

log "Running database migrations..."

# Create backup before migration
log "Creating database backup before migration..."
DATE=$(date +%Y%m%d_%H%M%S)
docker exec viwoapp-postgres pg_dump -U viwoapp viwoapp | gzip > "backups/pre_migration_${DATE}.sql.gz" || warn "Pre-migration backup failed"

# Run migrations
npx prisma migrate deploy || error "Database migration failed"

log "Database migrations completed successfully"

# ==========================================
# STOP SERVICES
# ==========================================

log "Stopping existing services..."

if [ "$ENVIRONMENT" = "production" ]; then
    docker-compose -f docker-compose.prod.yml down || warn "Failed to stop services"
else
    docker-compose down || warn "Failed to stop services"
fi

# ==========================================
# START SERVICES
# ==========================================

log "Starting services..."

if [ "$ENVIRONMENT" = "production" ]; then
    docker-compose -f docker-compose.prod.yml up -d --build || error "Failed to start services"
else
    docker-compose up -d --build || error "Failed to start services"
fi

# ==========================================
# WAIT FOR SERVICES
# ==========================================

log "Waiting for services to be ready..."

# Wait for backend to be healthy
RETRIES=30
RETRY_INTERVAL=2

for i in $(seq 1 $RETRIES); do
    if docker ps | grep -q "viwoapp-backend"; then
        if docker inspect --format='{{.State.Health.Status}}' viwoapp-backend 2>/dev/null | grep -q "healthy"; then
            log "Backend is healthy"
            break
        fi
    fi
    
    if [ $i -eq $RETRIES ]; then
        error "Backend failed to start within timeout"
    fi
    
    log "Waiting for backend to be ready... ($i/$RETRIES)"
    sleep $RETRY_INTERVAL
done

# ==========================================
# POST-DEPLOYMENT CHECKS
# ==========================================

log "Running post-deployment checks..."

# Check if containers are running
if ! docker ps | grep -q "viwoapp-backend"; then
    error "Backend container is not running"
fi

if ! docker ps | grep -q "viwoapp-postgres"; then
    error "PostgreSQL container is not running"
fi

if ! docker ps | grep -q "viwoapp-redis"; then
    error "Redis container is not running"
fi

# Test API health endpoint
log "Testing API health endpoint..."
sleep 5

if curl -f http://localhost:3000/api/v1/health > /dev/null 2>&1; then
    log "API health check passed"
else
    warn "API health check failed (may take longer to start)"
fi

# ==========================================
# CLEANUP
# ==========================================

log "Cleaning up..."

# Remove old Docker images
docker image prune -f || warn "Failed to prune Docker images"

# Clean npm cache
npm cache clean --force || warn "Failed to clean npm cache"

# ==========================================
# DEPLOYMENT SUMMARY
# ==========================================

log "=========================================="
log "Deployment completed successfully!"
log "=========================================="
log "Environment: $ENVIRONMENT"
log "Date: $(date '+%Y-%m-%d %H:%M:%S')"
log "Node version: $(node -v)"
log "npm version: $(npm -v)"
log "=========================================="
log "Services running:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
log "=========================================="
log "Logs: docker-compose logs -f"
log "Stop: docker-compose -f docker-compose.prod.yml down"
log "=========================================="

# ==========================================
# SEND NOTIFICATION (Optional)
# ==========================================

# Example: Send notification via webhook
# curl -X POST "https://your-monitoring-service.com/webhook" \
#     -H "Content-Type: application/json" \
#     -d "{\"message\": \"Deployment completed successfully\", \"environment\": \"$ENVIRONMENT\", \"timestamp\": \"$(date --iso-8601=seconds)\"}"

exit 0



