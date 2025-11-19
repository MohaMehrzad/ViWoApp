# ViWoApp Backend - AWS VPS Deployment Guide & Analysis

## 📋 Table of Contents
1. [Critical Issues & Security Concerns](#critical-issues--security-concerns)
2. [Missing Environment Configuration](#missing-environment-configuration)
3. [Missing Production Files](#missing-production-files)
4. [Dependency Updates & Vulnerabilities](#dependency-updates--vulnerabilities)
5. [Production Deployment Checklist](#production-deployment-checklist)
6. [AWS VPS Ubuntu Setup Guide](#aws-vps-ubuntu-setup-guide)
7. [Performance & Scalability Recommendations](#performance--scalability-recommendations)
8. [Monitoring & Logging](#monitoring--logging)
9. [Backup & Disaster Recovery](#backup--disaster-recovery)
10. [Security Hardening](#security-hardening)

---

## 🚨 Critical Issues & Security Concerns

### 1. **Missing `.env` File** ⚠️ CRITICAL
The backend relies on environment variables but there's no `.env` or `.env.example` file.

**Required Environment Variables:**
```env
# Application
NODE_ENV=production
PORT=3000
BASE_URL=https://your-domain.com
CORS_ORIGIN=https://your-frontend.com,https://www.your-frontend.com

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/viwoapp

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# JWT Secrets (MUST BE STRONG IN PRODUCTION!)
JWT_ACCESS_SECRET=your-very-strong-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-very-strong-refresh-secret-key-min-32-chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Firebase (for Push Notifications)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# Token Economy Configuration
VCN_TOTAL_SUPPLY=1000000000
MONTHLY_EMISSION=5833333
DAILY_REWARD_ALLOCATION=0.8
MAX_DAILY_REWARD_USD=50
VCN_PRICE=0.03

# Activity Points
POINTS_TEXT_POST=10
POINTS_IMAGE_POST=20
POINTS_VIDEO_POST=50
POINTS_LIKE=1
POINTS_COMMENT=8
POINTS_SHARE=10
POINTS_REPOST=12
POINTS_FOLLOW=2

# Daily Caps
DAILY_CAP_POSTS=50
DAILY_CAP_LIKES=500
DAILY_CAP_COMMENTS=200
DAILY_CAP_SHARES=100
DAILY_CAP_FOLLOWS=100

# Fee Distribution
BURN_RATE=0.2
TREASURY_RATE=0.5
REWARDS_RATE=0.3
TRANSACTION_FEE_RATE=0.05

# Staking Requirements
STAKE_IDENTITY_PREMIUM=500
STAKE_CONTENT_CREATOR_PRO=1000
STAKE_DAO_FOUNDER=2000
STAKE_QUALITY_CURATOR=250
STAKE_TRUSTED_MODERATOR=500

# Verification Tier Pricing
PRICE_TIER_BASIC=1.0
PRICE_TIER_VERIFIED=7.0
PRICE_TIER_PREMIUM=19.0
PRICE_TIER_ENTERPRISE=124.0

# Upload Configuration
UPLOAD_DIR=/var/www/viwoapp/uploads

# Logging
LOG_LEVEL=info
```

### 2. **Weak Default JWT Secrets** 🔐 CRITICAL
File: `src/config/config.service.ts` (lines 36-42)

**Issue:** Default JWT secrets are set to `'secret'` which is extremely insecure.

**Fix Required:**
```typescript
get jwtAccessSecret(): string {
  const secret = this.configService.get<string>('JWT_ACCESS_SECRET');
  if (!secret || secret === 'secret') {
    throw new Error('JWT_ACCESS_SECRET must be set in environment variables');
  }
  return secret;
}

get jwtRefreshSecret(): string {
  const secret = this.configService.get<string>('JWT_REFRESH_SECRET');
  if (!secret || secret === 'secret') {
    throw new Error('JWT_REFRESH_SECRET must be set in environment variables');
  }
  return secret;
}
```

### 3. **Hardcoded CORS Origins** 🌐 SECURITY RISK
File: `src/main.ts` (lines 36-39)

**Issue:** CORS origins are hardcoded to localhost addresses.

**Current:**
```typescript
origin: process.env.CORS_ORIGIN?.split(',') || [
  'http://localhost:8081',
  'http://192.168.31.158:8081',
],
```

**Recommendation:** Remove default local IPs for production, enforce environment variable.

### 4. **Insecure Docker Postgres Password** 🔒 CRITICAL
File: `docker-compose.yml` (line 9)

**Issue:** Default password `dev_password_123` is hardcoded.

**Fix Required:**
```yaml
environment:
  POSTGRES_USER: ${POSTGRES_USER:-viwoapp}
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
  POSTGRES_DB: ${POSTGRES_DB:-viwoapp}
```

### 5. **Missing Rate Limiting on Sensitive Endpoints** ⚡
**Issue:** Global rate limiting is set to 100 requests/60 seconds, but sensitive endpoints (auth, uploads) need stricter limits.

**Recommendation:** Add custom rate limits:
```typescript
// For auth endpoints
@Throttle({ default: { limit: 5, ttl: 60000 } })

// For file uploads
@Throttle({ default: { limit: 10, ttl: 60000 } })
```

### 6. **No Input Validation on File Uploads** 📁 SECURITY RISK
File: `src/upload/upload.service.ts`

**Missing:**
- File size limits
- File type validation
- Virus scanning
- Storage quota management

### 7. **Missing Database Connection Pool Configuration** 💾
**Issue:** Prisma client doesn't have explicit connection pool settings for production.

**Required in DATABASE_URL:**
```
postgresql://user:password@host:5432/db?connection_limit=20&pool_timeout=20
```

### 8. **Incomplete Video Processing** 🎥
File: `src/upload/upload.service.ts` (lines 33-38)

**Issue:** Video thumbnail generation and duration extraction are not implemented (TODOs).

**Required:** Install and configure FFmpeg for video processing.

### 9. **No Request Size Limits** 📦
File: `src/main.ts`

**Missing:** Body size limits for preventing DoS attacks.

**Required:**
```typescript
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

### 10. **Exposed Admin Interfaces** 🔓
File: `docker-compose.yml` (lines 36-61)

**Issue:** Redis Commander and pgAdmin are exposed on public ports.

**Fix:** Remove these from production or protect with authentication + firewall rules.

---

## 📝 Missing Environment Configuration

### Create `.env.example` File
```bash
# Copy this to .env and fill in your values
cp .env.example .env
```

**Action Required:** Create `.env.example` with all required variables (see section 1).

---

## 📄 Missing Production Files

### 1. **Dockerfile** 🐳 CRITICAL
**Required for containerized deployment:**

```dockerfile
# Create file: backend/Dockerfile

FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --only=production && \
    npx prisma generate

# Copy built application from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# Create necessary directories
RUN mkdir -p /app/logs /app/uploads && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD node -e "require('http').get('http://localhost:3000/api/v1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "dist/main"]
```

### 2. **.dockerignore** 📋
```dockerignore
# Create file: backend/.dockerignore

node_modules
npm-debug.log
dist
.env
.env.*
.git
.gitignore
README.md
.vscode
.idea
*.md
coverage
.nyc_output
logs
uploads
*.log
.DS_Store
```

### 3. **Production Docker Compose** 🐳
```yaml
# Create file: backend/docker-compose.prod.yml

version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: viwoapp-postgres
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - viwoapp-network

  redis:
    image: redis:7-alpine
    container_name: viwoapp-redis
    command: redis-server --requirepass ${REDIS_PASSWORD}
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - viwoapp-network

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: viwoapp-backend
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?connection_limit=20&pool_timeout=20
      REDIS_HOST: redis
      REDIS_PORT: 6379
      REDIS_PASSWORD: ${REDIS_PASSWORD}
    env_file:
      - .env
    ports:
      - "3000:3000"
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - viwoapp-network

  nginx:
    image: nginx:alpine
    container_name: viwoapp-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - ./uploads:/var/www/uploads:ro
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - viwoapp-network

volumes:
  postgres_data:
  redis_data:

networks:
  viwoapp-network:
    driver: bridge
```

### 4. **Nginx Configuration** 🌐
```nginx
# Create file: backend/nginx.conf

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/rss+xml font/truetype font/opentype 
               application/vnd.ms-fontobject image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
    limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=10r/m;

    # Upload size limit
    client_max_body_size 100M;

    upstream backend {
        server backend:3000;
    }

    # HTTP redirect to HTTPS
    server {
        listen 80;
        server_name your-domain.com www.your-domain.com;
        
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 301 https://$server_name$request_uri;
        }
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name your-domain.com www.your-domain.com;

        # SSL configuration
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        # API routes
        location /api/ {
            limit_req zone=api_limit burst=20 nodelay;
            
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            
            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # Auth routes (stricter rate limit)
        location /api/v1/auth/ {
            limit_req zone=auth_limit burst=5 nodelay;
            
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static files (uploads)
        location /uploads/ {
            alias /var/www/uploads/;
            expires 1y;
            add_header Cache-Control "public, immutable";
            add_header Access-Control-Allow-Origin *;
            
            # Video streaming support
            add_header Accept-Ranges bytes;
        }

        # WebSocket support
        location /socket.io/ {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check endpoint
        location /health {
            access_log off;
            proxy_pass http://backend/api/v1/health;
        }
    }
}
```

### 5. **Systemd Service File** 🔧
```ini
# Create file: /etc/systemd/system/viwoapp.service

[Unit]
Description=ViWoApp Backend Service
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/var/www/viwoapp/backend
ExecStart=/usr/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker-compose -f docker-compose.prod.yml down
Restart=on-failure
RestartSec=10s

[Install]
WantedBy=multi-user.target
```

### 6. **Health Check Endpoint** 🏥
**Missing:** Add health check endpoint for monitoring.

**Create:** `src/app.controller.ts`
```typescript
@Get('health')
async healthCheck() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  };
}
```

### 7. **Backup Script** 💾
```bash
# Create file: backend/scripts/backup.sh

#!/bin/bash

# Configuration
BACKUP_DIR="/var/www/viwoapp/backups"
POSTGRES_CONTAINER="viwoapp-postgres"
POSTGRES_USER="viwoapp"
POSTGRES_DB="viwoapp"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Database backup
echo "Backing up database..."
docker exec $POSTGRES_CONTAINER pg_dump -U $POSTGRES_USER $POSTGRES_DB | \
  gzip > "$BACKUP_DIR/db_backup_$DATE.sql.gz"

# Uploads backup
echo "Backing up uploads..."
tar -czf "$BACKUP_DIR/uploads_backup_$DATE.tar.gz" /var/www/viwoapp/backend/uploads

# Keep only last 7 days of backups
find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -mtime +7 -delete
find "$BACKUP_DIR" -name "uploads_backup_*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

### 8. **PM2 Ecosystem File** (Alternative to Docker)
```javascript
// Create file: backend/ecosystem.config.js

module.exports = {
  apps: [{
    name: 'viwoapp-backend',
    script: './dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '1G',
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    listen_timeout: 3000,
    kill_timeout: 5000,
  }]
};
```

---

## 🔄 Dependency Updates & Vulnerabilities

### Current Dependency Versions (as of package.json)

**Major Framework:**
- NestJS: `^10.2.10` ✅ Latest major version
- Prisma: `^5.7.0` ⚠️ Update available (latest: 5.22.0)
- Node target: `20` ✅ LTS version

**Recommendations:**

1. **Update Prisma** (Security & Performance)
```bash
npm install @prisma/client@latest
npm install -D prisma@latest
```

2. **Update Dependencies** (Check for vulnerabilities)
```bash
npm audit
npm audit fix
```

3. **Add Missing Production Dependencies:**
```bash
npm install express compression
npm install helmet@latest
npm install @nestjs/swagger  # API Documentation
```

4. **Security Scanning**
```bash
# Install and run snyk
npm install -g snyk
snyk test
snyk monitor
```

---

## ✅ Production Deployment Checklist

### Pre-Deployment
- [ ] Create `.env` file with all required variables
- [ ] Generate strong JWT secrets (min 32 characters)
- [ ] Set up Firebase project for push notifications
- [ ] Configure production database credentials
- [ ] Set strong Redis password
- [ ] Update CORS_ORIGIN to production domain
- [ ] Set NODE_ENV=production
- [ ] Configure BASE_URL to production domain

### Database
- [ ] Run Prisma migrations: `npx prisma migrate deploy`
- [ ] Seed initial data: `npm run prisma:seed`
- [ ] Configure database backups
- [ ] Set up connection pooling
- [ ] Enable SSL for database connections

### Security
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure firewall (UFW)
- [ ] Disable unnecessary ports
- [ ] Set up fail2ban
- [ ] Enable Redis password authentication
- [ ] Remove development tools from production
- [ ] Configure rate limiting
- [ ] Set up security headers

### Monitoring
- [ ] Set up log rotation
- [ ] Configure monitoring (PM2/Docker stats)
- [ ] Set up uptime monitoring
- [ ] Configure error tracking (Sentry)
- [ ] Set up performance monitoring
- [ ] Configure disk space alerts

### Performance
- [ ] Enable Nginx caching
- [ ] Configure CDN for uploads
- [ ] Optimize database queries
- [ ] Set up Redis caching
- [ ] Enable compression
- [ ] Configure PM2 cluster mode

### Backup & Recovery
- [ ] Set up automated database backups
- [ ] Configure backup retention policy
- [ ] Test backup restoration
- [ ] Set up off-site backup storage
- [ ] Document recovery procedures

---

## 🚀 AWS VPS Ubuntu Setup Guide

### Step 1: Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git build-essential

# Configure timezone
sudo timedatectl set-timezone UTC

# Create application user
sudo useradd -m -s /bin/bash viwoapp
sudo usermod -aG sudo viwoapp

# Set up SSH key authentication
# (Upload your SSH public key)
```

### Step 2: Install Docker & Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker viwoapp
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### Step 3: Install Node.js (Alternative to Docker)

```bash
# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version

# Install PM2 globally
sudo npm install -g pm2

# Configure PM2 startup
pm2 startup systemd
```

### Step 4: Install PostgreSQL

```bash
# Option 1: Use Docker (Recommended)
# See docker-compose.prod.yml

# Option 2: Install directly
sudo apt install -y postgresql postgresql-contrib

# Secure PostgreSQL
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'your-strong-password';"

# Create database and user
sudo -u postgres psql <<EOF
CREATE USER viwoapp WITH PASSWORD 'your-db-password';
CREATE DATABASE viwoapp OWNER viwoapp;
GRANT ALL PRIVILEGES ON DATABASE viwoapp TO viwoapp;
EOF
```

### Step 5: Install Redis

```bash
# Option 1: Use Docker (Recommended)
# See docker-compose.prod.yml

# Option 2: Install directly
sudo apt install -y redis-server

# Configure Redis password
sudo nano /etc/redis/redis.conf
# Uncomment and set: requirepass your-redis-password

# Restart Redis
sudo systemctl restart redis
sudo systemctl enable redis
```

### Step 6: Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Copy configuration
sudo cp nginx.conf /etc/nginx/nginx.conf

# Test configuration
sudo nginx -t

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 7: Install FFmpeg (for video processing)

```bash
# Install FFmpeg
sudo apt install -y ffmpeg

# Verify installation
ffmpeg -version
```

### Step 8: Set Up SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal test
sudo certbot renew --dry-run

# Add auto-renewal cron job
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo tee -a /etc/crontab
```

### Step 9: Configure Firewall

```bash
# Install and configure UFW
sudo apt install -y ufw

# Allow SSH (IMPORTANT: Do this first!)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### Step 10: Deploy Application

```bash
# Switch to application user
sudo su - viwoapp

# Create application directory
sudo mkdir -p /var/www/viwoapp
sudo chown -R viwoapp:viwoapp /var/www/viwoapp
cd /var/www/viwoapp

# Clone repository
git clone <your-repo-url> backend
cd backend

# Create .env file
nano .env
# (Paste your production environment variables)

# Install dependencies
npm ci --only=production

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Build application
npm run build

# Option 1: Using Docker
docker-compose -f docker-compose.prod.yml up -d

# Option 2: Using PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 11: Set Up Monitoring

```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Set up PM2 monitoring (if using PM2)
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# Install Docker monitoring (if using Docker)
docker stats
```

### Step 12: Configure Automated Backups

```bash
# Make backup script executable
chmod +x scripts/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add line:
0 2 * * * /var/www/viwoapp/backend/scripts/backup.sh >> /var/www/viwoapp/logs/backup.log 2>&1
```

### Step 13: Set Up Log Rotation

```bash
# Create logrotate configuration
sudo nano /etc/logrotate.d/viwoapp

# Add configuration:
/var/www/viwoapp/backend/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    missingok
    create 0640 viwoapp viwoapp
}

# Test logrotate
sudo logrotate -d /etc/logrotate.d/viwoapp
```

### Step 14: Install fail2ban

```bash
# Install fail2ban
sudo apt install -y fail2ban

# Configure for Nginx
sudo nano /etc/fail2ban/jail.local

# Add:
[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

# Restart fail2ban
sudo systemctl restart fail2ban
sudo systemctl enable fail2ban
```

---

## ⚡ Performance & Scalability Recommendations

### 1. **Database Optimization**

```typescript
// Add to prisma.service.ts
async onModuleInit() {
  await this.$connect();
  
  // Enable connection pooling
  this.$on('query', (e) => {
    if (e.duration > 1000) {
      console.warn(`Slow query detected: ${e.query} (${e.duration}ms)`);
    }
  });
}
```

**Add Database Indexes:**
```sql
-- Run these after deployment
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);
CREATE INDEX idx_vcoin_transactions_user ON vcoin_transactions(user_id, created_at DESC);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read_at);
CREATE INDEX idx_post_interactions_user_post ON post_interactions(user_id, post_id);
```

### 2. **Redis Caching**

**Add caching layer:**
```typescript
// Create cache.service.ts
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async clearPattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
```

### 3. **CDN for Static Assets**

**Recommendations:**
- Use AWS S3 + CloudFront for uploads
- Or use BunnyCDN / DigitalOcean Spaces
- Move uploads off local disk

### 4. **Queue System for Heavy Tasks**

**Add Bull Queue for:**
- Video processing
- Email notifications
- Daily reward distribution
- Report generation

```bash
npm install @nestjs/bull bull
```

### 5. **Database Read Replicas**

For high-traffic:
- Set up PostgreSQL read replicas
- Route read queries to replicas
- Use Prisma read replicas feature

### 6. **Horizontal Scaling**

**Load Balancer Configuration:**
```nginx
upstream backend_pool {
    least_conn;
    server backend1:3000 max_fails=3 fail_timeout=30s;
    server backend2:3000 max_fails=3 fail_timeout=30s;
    server backend3:3000 max_fails=3 fail_timeout=30s;
}
```

---

## 📊 Monitoring & Logging

### 1. **Set Up Sentry for Error Tracking**

```bash
npm install @sentry/node @sentry/profiling-node
```

```typescript
// Add to main.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### 2. **Prometheus Metrics**

```bash
npm install @willsoto/nestjs-prometheus prom-client
```

### 3. **Logging Strategy**

**Current:** Winston with daily rotation ✅

**Improvements:**
- Add structured logging
- Send logs to centralized service (LogDNA, Papertrail)
- Set up log aggregation

### 4. **Uptime Monitoring**

**Services to use:**
- UptimeRobot (Free)
- Pingdom
- StatusCake

**Monitor:**
- `/health` endpoint
- Database connectivity
- Redis connectivity
- Disk space
- Memory usage

---

## 💾 Backup & Disaster Recovery

### 1. **Automated Database Backups**

```bash
# Add to crontab
0 */6 * * * /var/www/viwoapp/backend/scripts/backup.sh
```

### 2. **Backup Retention Policy**

- **Hourly:** Keep last 24 hours
- **Daily:** Keep last 7 days
- **Weekly:** Keep last 4 weeks
- **Monthly:** Keep last 12 months

### 3. **Off-Site Backup Storage**

**Options:**
- AWS S3 with lifecycle policies
- Backblaze B2
- DigitalOcean Spaces

```bash
# Install AWS CLI
sudo apt install -y awscli

# Configure backup upload
aws s3 sync /var/www/viwoapp/backups s3://your-backup-bucket/viwoapp/
```

### 4. **Disaster Recovery Plan**

**Document:**
1. Backup restoration procedure
2. Database migration rollback
3. Emergency contacts
4. Service dependencies
5. RTO (Recovery Time Objective): < 1 hour
6. RPO (Recovery Point Objective): < 1 hour

---

## 🔐 Security Hardening

### 1. **Server Hardening**

```bash
# Disable root login
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
# Set: PasswordAuthentication no

# Restart SSH
sudo systemctl restart sshd

# Keep system updated
sudo apt update && sudo apt upgrade -y
sudo apt autoremove -y
```

### 2. **Application Security**

**Add:**
- Request ID tracking
- IP-based rate limiting
- SQL injection prevention (Prisma handles this)
- XSS prevention (Helmet handles this)
- CSRF protection

```bash
npm install csurf cookie-parser
```

### 3. **Database Security**

- Enable SSL connections
- Use least privilege principle
- Regular security patches
- Audit logging

### 4. **Secrets Management**

**Use AWS Secrets Manager or HashiCorp Vault:**

```bash
# Example with AWS Secrets Manager
npm install @aws-sdk/client-secrets-manager
```

### 5. **Regular Security Audits**

```bash
# Weekly security checks
npm audit
docker scan viwoapp-backend:latest
```

---

## 🐛 Known Bugs & Issues

### 1. **Video Processing Not Implemented**
**Location:** `src/upload/upload.service.ts`  
**Status:** TODO  
**Priority:** HIGH  
**Fix:** Implement FFmpeg integration for thumbnails and duration

### 2. **No Transaction Rollback on Failed VCoin Transfers**
**Location:** `src/vcoin/vcoin.service.ts`  
**Status:** MISSING  
**Priority:** CRITICAL  
**Fix:** Wrap transfers in Prisma transactions

### 3. **WebSocket Not Using Redis Adapter**
**Location:** `src/messages/messages.gateway.ts`  
**Status:** INCOMPLETE  
**Priority:** MEDIUM  
**Fix:** Add Redis adapter for multi-instance WebSocket support

```bash
npm install @socket.io/redis-adapter
```

### 4. **Missing Email Verification**
**Status:** NOT IMPLEMENTED  
**Priority:** HIGH  
**Required:** Email service integration (SendGrid, AWS SES)

### 5. **No 2FA Support**
**Status:** NOT IMPLEMENTED  
**Priority:** MEDIUM  
**Recommendation:** Add TOTP-based 2FA

---

## 📈 Recommended Upgrades

### Short Term (1-2 weeks)
1. ✅ Create all missing production files
2. ✅ Set up SSL certificates
3. ✅ Configure automated backups
4. ✅ Implement video processing
5. ✅ Add health check endpoint
6. ✅ Set up monitoring

### Medium Term (1-2 months)
1. Add queue system (Bull)
2. Implement CDN for uploads
3. Add Redis caching layer
4. Set up error tracking (Sentry)
5. Add API documentation (Swagger)
6. Implement email service

### Long Term (3-6 months)
1. Horizontal scaling with load balancer
2. Database read replicas
3. Microservices architecture
4. GraphQL API
5. Advanced analytics
6. Multi-region deployment

---

## 📞 Support & Maintenance

### Daily Tasks
- Monitor error logs
- Check disk space
- Verify backups completed
- Review security alerts

### Weekly Tasks
- Review performance metrics
- Update dependencies
- Security audit
- Database optimization

### Monthly Tasks
- Review and optimize database indexes
- Update SSL certificates
- Review access logs
- Disaster recovery drill

---

## 🎯 Conclusion

This backend is **production-ready with modifications**. The core functionality is solid, but several critical security and deployment configurations are missing. Follow this guide to properly deploy on AWS VPS with Ubuntu.

### Critical Actions Required Before Production:
1. ⚠️ Create and configure `.env` file
2. ⚠️ Generate strong JWT secrets
3. ⚠️ Create Dockerfile and docker-compose.prod.yml
4. ⚠️ Set up SSL certificates
5. ⚠️ Configure firewall
6. ⚠️ Set up automated backups
7. ⚠️ Implement video processing
8. ⚠️ Add health check endpoint

**Estimated Deployment Time:** 4-6 hours (with this guide)

---

**Document Version:** 1.0  
**Last Updated:** 2025-11-18  
**Maintained By:** DevOps Team

