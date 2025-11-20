# Deployment Guide - Performance Updates

## 📦 Step 1: Push to GitHub

### Local Machine Commands:

```bash
# Navigate to project directory
cd /Users/moha/Desktop/ViWoApp

# Check current status
git status

# Add all changes
git add .

# Commit with descriptive message
git commit -m "Performance optimizations: FlatList optimization, remove Image.getSize(), non-blocking contexts, aspectRatio support"

# Push to GitHub
git push origin master
```

---

## 🚀 Step 2: Deploy to AWS VPS

### Connect to VPS:

```bash
# SSH into your AWS VPS (replace with your details)
ssh ubuntu@your-vps-ip
# or
ssh -i /path/to/your-key.pem ubuntu@your-vps-ip
```

### On the VPS - Update Backend:

```bash
# Navigate to backend directory
cd /path/to/ViWoApp/backend
# Usually: cd ~/ViWoApp/backend or cd /var/www/ViWoApp/backend

# Pull latest changes from GitHub
git pull origin master

# Make sure .env file is properly configured
# Verify it has DATABASE_URL, POSTGRES_USER, POSTGRES_PASSWORD, etc.
cat .env

# Stop current containers
docker-compose -f docker-compose.prod.yml down

# Run database migration
docker-compose -f docker-compose.prod.yml run --rm backend npx prisma migrate deploy

# Rebuild and restart all services
docker-compose -f docker-compose.prod.yml up -d --build

# Check if services are running
docker-compose -f docker-compose.prod.yml ps

# View logs to verify everything started correctly
docker-compose -f docker-compose.prod.yml logs -f backend

# Press Ctrl+C to stop viewing logs

# Check backend health
curl http://localhost:3000/health
# or
curl http://localhost:3000/api/health
```

---

## 🔍 Verification Commands

### Check Database Migration:

```bash
# Connect to PostgreSQL container
docker-compose -f docker-compose.prod.yml exec postgres psql -U viwoapp -d viwoapp

# Inside PostgreSQL, check if aspect_ratio column exists
\d posts

# You should see aspect_ratio | double precision | 
# Type \q to exit
```

### Check Backend Logs:

```bash
# View backend logs
docker-compose -f docker-compose.prod.yml logs backend --tail=100

# Check for any errors
docker-compose -f docker-compose.prod.yml logs backend | grep -i error

# Monitor logs in real-time
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Check Container Status:

```bash
# List all containers
docker ps

# Check resource usage
docker stats

# Restart a specific service if needed
docker-compose -f docker-compose.prod.yml restart backend
docker-compose -f docker-compose.prod.yml restart postgres
```

---

## 🧪 Test API Endpoints

```bash
# Test health endpoint
curl http://your-domain.com/health

# Test posts endpoint (should include aspectRatio now)
curl http://your-domain.com/api/posts

# Test image upload (should return aspectRatio)
# Upload test done via app or Postman
```

---

## 🔄 Rollback Plan (If Something Goes Wrong)

```bash
# Stop containers
docker-compose -f docker-compose.prod.yml down

# Checkout previous commit
git log --oneline -5  # View last 5 commits
git checkout <previous-commit-hash>

# Rebuild and start
docker-compose -f docker-compose.prod.yml up -d --build

# Rollback database migration (if needed)
docker-compose -f docker-compose.prod.yml run --rm backend npx prisma migrate resolve --rolled-back 20251120165430_add_aspect_ratio_to_posts
```

---

## 📊 Performance Monitoring

After deployment, monitor:

```bash
# CPU and Memory usage
docker stats

# Backend response times
docker-compose -f docker-compose.prod.yml logs backend | grep "GET /api/posts"

# Database connections
docker-compose -f docker-compose.prod.yml exec postgres psql -U viwoapp -d viwoapp -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'viwoapp';"

# Check for errors in last 1 hour
docker-compose -f docker-compose.prod.yml logs --since 1h backend | grep -i error
```

---

## 🛠️ Troubleshooting

### If migration fails:

```bash
# Check database connection
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U viwoapp

# Manually run migration
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# If migration is stuck, check status
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate status
```

### If backend won't start:

```bash
# Check logs for errors
docker-compose -f docker-compose.prod.yml logs backend

# Check if ports are available
sudo netstat -tulpn | grep 3000

# Restart services in order
docker-compose -f docker-compose.prod.yml restart postgres
docker-compose -f docker-compose.prod.yml restart redis
docker-compose -f docker-compose.prod.yml restart backend
```

### If images don't have aspectRatio:

```bash
# Old posts won't have aspectRatio (will use 16:9 default)
# New uploads should include it

# Test new upload via API or app
# Check response includes aspectRatio field
```

---

## 📱 Frontend Deployment (If Needed)

### For Expo/EAS Build:

```bash
# On local machine after pushing to GitHub
cd /Users/moha/Desktop/ViWoApp

# Pull latest changes (if you pushed from different location)
git pull origin master

# Install dependencies if needed
npm install

# Build for Android
eas build --platform android --profile production

# Or build locally
npx expo run:android --variant release

# Submit to Play Store (when ready)
eas submit --platform android
```

---

## ✅ Post-Deployment Checklist

- [ ] All containers are running (`docker ps`)
- [ ] Database migration successful (aspect_ratio column exists)
- [ ] Backend health check passes
- [ ] Posts API returns data with aspectRatio field
- [ ] Image upload returns aspectRatio in response
- [ ] No errors in backend logs
- [ ] App loads in < 2 seconds
- [ ] Feed scrolling is smooth
- [ ] Images display with correct aspect ratios

---

## 📞 Quick Reference

### Essential Commands:

```bash
# Update backend on VPS
cd ~/ViWoApp/backend
git pull origin master
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml run --rm backend npx prisma migrate deploy
docker-compose -f docker-compose.prod.yml up -d --build

# View logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Restart backend
docker-compose -f docker-compose.prod.yml restart backend

# Stop everything
docker-compose -f docker-compose.prod.yml down

# Clean up (careful - removes volumes!)
docker-compose -f docker-compose.prod.yml down -v
```

---

**Deployment Date:** November 20, 2025  
**Changes:** Performance optimizations (17 files modified)  
**Breaking Changes:** None (backward compatible)

