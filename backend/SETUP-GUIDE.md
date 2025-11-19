# 🎯 ViWoApp Backend - Essential Setup Commands

## 🔧 Generate Strong Secrets

```bash
# Generate JWT Access Secret
openssl rand -base64 32

# Generate JWT Refresh Secret
openssl rand -base64 32

# Generate Database Password
openssl rand -base64 24

# Generate Redis Password
openssl rand -base64 24
```

## 📝 Create .env File

```bash
cd /Users/moha/Desktop/ViWoApp/backend

# Create .env file
cat > .env << 'EOF'
NODE_ENV=production
PORT=3000
BASE_URL=https://your-domain.com
CORS_ORIGIN=https://your-frontend.com

# Database
DATABASE_URL=postgresql://viwoapp:PASTE_DB_PASSWORD@postgres:5432/viwoapp?connection_limit=20&pool_timeout=20
POSTGRES_USER=viwoapp
POSTGRES_PASSWORD=PASTE_DB_PASSWORD
POSTGRES_DB=viwoapp

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=PASTE_REDIS_PASSWORD

# JWT Secrets
JWT_ACCESS_SECRET=PASTE_ACCESS_SECRET
JWT_REFRESH_SECRET=PASTE_REFRESH_SECRET
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Token Economy
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

# Staking
STAKE_IDENTITY_PREMIUM=500
STAKE_CONTENT_CREATOR_PRO=1000
STAKE_DAO_FOUNDER=2000
STAKE_QUALITY_CURATOR=250
STAKE_TRUSTED_MODERATOR=500

# Pricing
PRICE_TIER_BASIC=1.0
PRICE_TIER_VERIFIED=7.0
PRICE_TIER_PREMIUM=19.0
PRICE_TIER_ENTERPRISE=124.0

# Uploads
UPLOAD_DIR=/app/uploads

# Logging
LOG_LEVEL=info
EOF

# Edit the file and replace placeholders
nano .env
```

## 🚀 Local Development Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Start Docker services (PostgreSQL & Redis)
docker-compose up -d

# Run database migrations
npx prisma migrate dev

# Seed database with test data
npx prisma db seed

# Start development server
npm run start:dev

# View API at: http://localhost:3000/api/v1
```

## 🌐 Production Deployment (AWS VPS)

### One-Command Setup Script

```bash
#!/bin/bash
# Save as: setup-production.sh

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install FFmpeg
sudo apt install -y ffmpeg

# Install Nginx
sudo apt install -y nginx

# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Configure firewall
sudo apt install -y ufw
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Create application directory
sudo mkdir -p /var/www/viwoapp
sudo chown -R $USER:$USER /var/www/viwoapp

echo "✅ Server setup complete!"
echo "Next steps:"
echo "1. Clone your repository to /var/www/viwoapp/backend"
echo "2. Create .env file with production values"
echo "3. Run: cd /var/www/viwoapp/backend && docker-compose -f docker-compose.prod.yml up -d"
```

### Manual Production Deployment

```bash
# 1. Connect to server
ssh your-user@your-server-ip

# 2. Clone repository
cd /var/www/viwoapp
git clone <your-repo> backend
cd backend

# 3. Create .env file (see above)
nano .env

# 4. Create SSL directory
mkdir -p ssl

# 5. Update nginx.conf with your domain
nano nginx.conf

# 6. Deploy
docker-compose -f docker-compose.prod.yml up -d

# 7. Run migrations
docker exec viwoapp-backend npx prisma migrate deploy

# 8. Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 9. Copy SSL certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/

# 10. Restart Nginx
docker-compose -f docker-compose.prod.yml restart nginx

# 11. Verify deployment
curl https://your-domain.com/api/v1/health
```

## 🔄 Common Operations

### Start Services
```bash
# Development
docker-compose up -d
npm run start:dev

# Production
docker-compose -f docker-compose.prod.yml up -d
```

### Stop Services
```bash
# Development
docker-compose down

# Production
docker-compose -f docker-compose.prod.yml down
```

### View Logs
```bash
# Development
npm run start:dev  # built-in logging

# Production - All services
docker-compose -f docker-compose.prod.yml logs -f

# Production - Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f postgres
docker-compose -f docker-compose.prod.yml logs -f redis
```

### Database Operations
```bash
# Create migration
npx prisma migrate dev --name description

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (development only!)
npx prisma migrate reset

# Seed database
npx prisma db seed

# Open Prisma Studio
npx prisma studio
```

### Backup & Restore
```bash
# Create backup
./scripts/backup.sh

# Manual database backup
docker exec viwoapp-postgres pg_dump -U viwoapp viwoapp | gzip > backup.sql.gz

# Restore database
gunzip < backup.sql.gz | docker exec -i viwoapp-postgres psql -U viwoapp viwoapp
```

### Update Application
```bash
# Using deployment script
./scripts/deploy.sh production

# Manual update
git pull origin master
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
docker exec viwoapp-backend npx prisma migrate deploy
```

## 🔍 Monitoring & Debugging

### Check Service Health
```bash
# Application health
curl http://localhost:3000/api/v1/health

# Docker services
docker-compose -f docker-compose.prod.yml ps

# System resources
docker stats
```

### Database Shell
```bash
# Connect to PostgreSQL
docker exec -it viwoapp-postgres psql -U viwoapp -d viwoapp

# Common SQL commands:
# \dt              - List tables
# \d table_name    - Describe table
# \du              - List users
# \l               - List databases
# \q               - Quit
```

### Redis Shell
```bash
# Connect to Redis
docker exec -it viwoapp-redis redis-cli -a YOUR_PASSWORD

# Common Redis commands:
# PING             - Test connection
# KEYS *           - List all keys
# GET key          - Get value
# FLUSHALL         - Clear all data (careful!)
# QUIT             - Exit
```

### Application Shell
```bash
# Enter backend container
docker exec -it viwoapp-backend sh

# Or with bash (if available)
docker exec -it viwoapp-backend bash

# Run commands inside container
node -v
npm -v
npx prisma migrate status
```

## 🐛 Quick Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>
```

### Docker Disk Space Issues
```bash
# Clean up everything
docker system prune -a --volumes

# Remove specific containers
docker rm -f $(docker ps -aq)

# Remove specific images
docker rmi $(docker images -q)
```

### Permission Issues
```bash
# Fix ownership
sudo chown -R $USER:$USER /var/www/viwoapp

# Fix uploads directory
sudo chmod -R 755 uploads
```

### Reset Everything (Development)
```bash
# Stop all services
docker-compose down -v

# Remove database
docker volume rm backend_postgres_data

# Restart and rebuild
docker-compose up -d --build
npx prisma migrate dev
npx prisma db seed
```

## 📊 Performance Testing

### Load Testing with Apache Bench
```bash
# Install Apache Bench
sudo apt install -y apache2-utils

# Test health endpoint
ab -n 1000 -c 10 http://localhost:3000/api/v1/health

# Test with authentication
ab -n 1000 -c 10 -H "Authorization: Bearer TOKEN" http://localhost:3000/api/v1/posts
```

### Database Performance
```bash
# Enable query logging in Prisma
# Add to main.ts:
# prisma.$on('query', (e) => console.log('Query: ' + e.query))

# Monitor slow queries in PostgreSQL
docker exec viwoapp-postgres psql -U viwoapp -d viwoapp -c "
  SELECT query, calls, total_time, mean_time 
  FROM pg_stat_statements 
  ORDER BY mean_time DESC 
  LIMIT 10;
"
```

## 🎯 Useful Commands Reference

```bash
# Build TypeScript
npm run build

# Format code
npm run format

# Lint code
npm run lint

# Run tests
npm run test

# Generate Prisma client
npx prisma generate

# Create new migration
npx prisma migrate dev --name migration_name

# View migration status
npx prisma migrate status

# Open Prisma Studio
npx prisma studio

# Distribute daily rewards (manual)
npm run rewards:distribute

# Check Docker logs
docker logs viwoapp-backend --tail 100 -f

# Restart specific service
docker-compose -f docker-compose.prod.yml restart backend

# Execute command in container
docker exec viwoapp-backend npm run build
```

---

**📚 For more information, see:**
- `backend.md` - Comprehensive deployment guide
- `DEPLOYMENT.md` - Quick deployment instructions
- `README.md` - Project overview



