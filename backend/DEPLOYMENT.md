# 🚀 ViWoApp Backend - Quick Deployment Guide

## 📋 Prerequisites

Before deployment, ensure you have:
- ✅ Ubuntu VPS (20.04 LTS or higher)
- ✅ Domain name with DNS configured
- ✅ SSH access to server
- ✅ Minimum 2GB RAM, 2 CPU cores, 20GB storage

## ⚡ Quick Start (5 Minutes)

### 1. Connect to Your Server
```bash
ssh your-user@your-server-ip
```

### 2. Install Docker & Docker Compose
```bash
# Run as root or with sudo
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 3. Clone Repository
```bash
# Create application directory
sudo mkdir -p /var/www/viwoapp
sudo chown -R $USER:$USER /var/www/viwoapp

# Clone repository
cd /var/www/viwoapp
git clone <your-repo-url> backend
cd backend
```

### 4. Configure Environment
```bash
# Create .env file from example
nano .env

# CRITICAL: Set these values:
# - NODE_ENV=production
# - Strong JWT secrets (use: openssl rand -base64 32)
# - Database password
# - Redis password
# - Your domain name
# - Firebase credentials (if using push notifications)
```

**Minimum Required Environment Variables:**
```env
NODE_ENV=production
PORT=3000
BASE_URL=https://your-domain.com
CORS_ORIGIN=https://your-frontend.com

DATABASE_URL=postgresql://viwoapp:YOUR_PASSWORD@postgres:5432/viwoapp
POSTGRES_USER=viwoapp
POSTGRES_PASSWORD=YOUR_STRONG_PASSWORD
POSTGRES_DB=viwoapp

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=YOUR_REDIS_PASSWORD

JWT_ACCESS_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
```

### 5. Deploy with Docker
```bash
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f backend
```

### 6. Run Database Migrations
```bash
# Enter backend container
docker exec -it viwoapp-backend sh

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed

# Exit container
exit
```

### 7. Configure SSL (Let's Encrypt)
```bash
# Install Certbot
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# Stop Nginx temporarily
docker-compose -f docker-compose.prod.yml stop nginx

# Obtain certificate
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Copy certificates to project
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/

# Update nginx.conf with your domain
nano nginx.conf

# Restart Nginx
docker-compose -f docker-compose.prod.yml start nginx
```

### 8. Configure Firewall
```bash
# Install and configure UFW
sudo apt install -y ufw

# Allow SSH (IMPORTANT!)
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### 9. Verify Deployment
```bash
# Test health endpoint
curl http://localhost:3000/api/v1/health

# Should return:
# {"status":"ok","timestamp":"...","uptime":123,"environment":"production","version":"1.0.0"}

# Test from outside
curl https://your-domain.com/api/v1/health
```

### 10. Set Up Automated Backups
```bash
# Make backup script executable
chmod +x scripts/backup.sh

# Test backup
./scripts/backup.sh

# Add to crontab (runs daily at 2 AM)
crontab -e

# Add this line:
0 2 * * * /var/www/viwoapp/backend/scripts/backup.sh >> /var/www/viwoapp/logs/backup.log 2>&1
```

## 🔧 Alternative: Deploy Without Docker

### 1. Install Node.js 20
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Should be v20.x
```

### 2. Install PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib

# Create database
sudo -u postgres psql <<EOF
CREATE USER viwoapp WITH PASSWORD 'your-password';
CREATE DATABASE viwoapp OWNER viwoapp;
GRANT ALL PRIVILEGES ON DATABASE viwoapp TO viwoapp;
EOF
```

### 3. Install Redis
```bash
sudo apt install -y redis-server
sudo nano /etc/redis/redis.conf
# Set: requirepass your-redis-password
sudo systemctl restart redis
```

### 4. Install FFmpeg
```bash
sudo apt install -y ffmpeg
```

### 5. Install & Configure PM2
```bash
# Install PM2
sudo npm install -g pm2

# Build and start application
cd /var/www/viwoapp/backend
npm ci --only=production
npx prisma generate
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup
```

### 6. Install & Configure Nginx
```bash
sudo apt install -y nginx

# Copy configuration
sudo cp nginx.conf /etc/nginx/nginx.conf

# Test configuration
sudo nginx -t

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## 📊 Monitoring

### Check Service Status
```bash
# Docker
docker-compose -f docker-compose.prod.yml ps

# PM2 (if not using Docker)
pm2 status
pm2 monit
```

### View Logs
```bash
# Docker
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f postgres
docker-compose -f docker-compose.prod.yml logs -f redis

# PM2
pm2 logs viwoapp-backend
```

### Check Resource Usage
```bash
# Docker
docker stats

# System
htop
df -h
```

## 🔄 Updating Application

### Using Deployment Script
```bash
cd /var/www/viwoapp/backend
./scripts/deploy.sh production
```

### Manual Update
```bash
cd /var/www/viwoapp/backend

# Pull latest code
git pull origin master

# Backup database
./scripts/backup.sh

# Rebuild and restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

# Or with PM2:
npm ci --only=production
npm run build
pm2 reload ecosystem.config.js
```

## 🐛 Troubleshooting

### Application Won't Start
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs backend

# Check environment variables
docker exec viwoapp-backend env | grep NODE_ENV

# Verify database connection
docker exec viwoapp-backend npx prisma migrate status
```

### Database Connection Failed
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check PostgreSQL logs
docker logs viwoapp-postgres

# Test connection
docker exec -it viwoapp-postgres psql -U viwoapp -d viwoapp
```

### Redis Connection Failed
```bash
# Check if Redis is running
docker ps | grep redis

# Test Redis connection
docker exec -it viwoapp-redis redis-cli -a YOUR_PASSWORD ping
```

### Nginx 502 Bad Gateway
```bash
# Check if backend is running
curl http://localhost:3000/api/v1/health

# Check Nginx configuration
docker exec viwoapp-nginx nginx -t

# Check Nginx logs
docker logs viwoapp-nginx
```

### Out of Disk Space
```bash
# Check disk usage
df -h

# Clean up Docker
docker system prune -a

# Remove old logs
find logs -name "*.log" -mtime +30 -delete

# Remove old backups
find backups -name "*.gz" -mtime +7 -delete
```

## 🔐 Security Checklist

- [ ] Strong passwords for database and Redis
- [ ] Strong JWT secrets (minimum 32 characters)
- [ ] SSL/TLS enabled (HTTPS)
- [ ] Firewall configured (UFW)
- [ ] SSH key authentication (disable password auth)
- [ ] Fail2ban installed and configured
- [ ] Regular security updates (`sudo apt update && sudo apt upgrade`)
- [ ] Automated backups configured
- [ ] Environment variables secured (not in git)
- [ ] Database access restricted to localhost
- [ ] Redis password authentication enabled
- [ ] Nginx rate limiting configured
- [ ] CORS properly configured
- [ ] Security headers enabled

## 📈 Performance Optimization

### Enable Nginx Caching
```nginx
# Add to nginx.conf
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m inactive=60m;

location /api/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    proxy_cache_key "$scheme$request_method$host$request_uri";
}
```

### Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);
CREATE INDEX idx_vcoin_transactions_user ON vcoin_transactions(user_id, created_at DESC);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read_at);
```

### Enable PM2 Cluster Mode
```javascript
// In ecosystem.config.js
instances: 'max',  // Use all CPU cores
exec_mode: 'cluster'
```

## 📞 Support

For detailed information, see:
- **backend.md** - Comprehensive deployment guide and analysis
- **package.json** - Available scripts and dependencies
- **prisma/schema.prisma** - Database schema
- **docker-compose.prod.yml** - Production Docker configuration

## 🎯 Next Steps After Deployment

1. **Test all endpoints** - Use the TEST_API.http file
2. **Set up monitoring** - Install uptime monitoring service
3. **Configure CDN** - For serving uploads/static files
4. **Set up error tracking** - Sentry or similar service
5. **Load testing** - Test with expected traffic
6. **Backup verification** - Test backup restoration
7. **Documentation** - Document any custom configurations

---

**Need Help?** Check the comprehensive `backend.md` file for detailed instructions and troubleshooting.



