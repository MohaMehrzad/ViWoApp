# ✅ ViWoApp Backend - Pre-Deployment Checklist

Use this checklist to ensure your backend is production-ready before deploying to AWS VPS.

## 📋 Critical Security Items

### Environment Configuration
- [ ] `.env` file created with all required variables
- [ ] Strong JWT secrets generated (minimum 32 characters)
  ```bash
  openssl rand -base64 32  # Run this twice for ACCESS and REFRESH secrets
  ```
- [ ] Strong database password set (minimum 16 characters)
- [ ] Strong Redis password set (minimum 16 characters)
- [ ] `NODE_ENV=production` set
- [ ] `CORS_ORIGIN` set to production frontend URLs only
- [ ] `BASE_URL` set to production API domain
- [ ] Firebase credentials configured (if using push notifications)
- [ ] `.env` file NOT committed to git (verify with `git status`)

### Database Security
- [ ] Database user has limited privileges (not superuser)
- [ ] Database accessible only from localhost or trusted IPs
- [ ] Database backups configured
- [ ] Connection pooling configured (`connection_limit=20` in DATABASE_URL)
- [ ] SSL connection to database enabled (if remote)

### Application Security
- [ ] Default passwords removed from `docker-compose.yml`
- [ ] Rate limiting configured and tested
- [ ] CORS properly configured (no wildcards in production)
- [ ] Input validation enabled (ValidationPipe)
- [ ] Security headers enabled (Helmet)
- [ ] File upload limits configured
- [ ] Request size limits set

### Server Security
- [ ] SSH key authentication enabled
- [ ] Password authentication disabled for SSH
- [ ] Root login disabled
- [ ] Firewall (UFW) configured
  - [ ] SSH port allowed (22)
  - [ ] HTTP port allowed (80)
  - [ ] HTTPS port allowed (443)
  - [ ] All other ports blocked
- [ ] Fail2ban installed and configured
- [ ] System updates applied (`sudo apt update && sudo apt upgrade`)

### SSL/TLS
- [ ] Domain name configured and DNS pointing to server
- [ ] SSL certificates obtained (Let's Encrypt)
- [ ] SSL certificates configured in Nginx
- [ ] HTTP to HTTPS redirect enabled
- [ ] SSL certificate auto-renewal configured
- [ ] HTTPS tested and working

## 🏗️ Infrastructure Checklist

### Docker Setup
- [ ] Docker installed and running
- [ ] Docker Compose installed
- [ ] User added to docker group
- [ ] `docker-compose.prod.yml` configured
- [ ] Dockerfile present and tested
- [ ] `.dockerignore` file present
- [ ] Health checks configured in Docker

### Services
- [ ] PostgreSQL container configured
- [ ] Redis container configured
- [ ] Backend container configured
- [ ] Nginx container configured
- [ ] All containers have resource limits set
- [ ] All containers have restart policies
- [ ] Admin tools (pgAdmin, Redis Commander) disabled for production

### File System
- [ ] `/var/www/viwoapp` directory created
- [ ] Proper ownership set (`chown -R user:user`)
- [ ] Uploads directory created and writable
- [ ] Logs directory created and writable
- [ ] Backups directory created
- [ ] SSL directory created for certificates

### Network
- [ ] Domain name registered
- [ ] DNS A record pointing to server IP
- [ ] DNS configured for both apex and www
- [ ] Ports 80, 443, 22 accessible
- [ ] Other ports properly firewalled

## 🗄️ Database Checklist

### Setup
- [ ] Database created
- [ ] Database user created
- [ ] User permissions granted
- [ ] Connection tested
- [ ] Prisma schema reviewed
- [ ] Migrations ready

### Production Migrations
- [ ] All migrations tested in staging/development
- [ ] No data loss migrations
- [ ] Migration backup plan ready
- [ ] `npx prisma migrate deploy` command ready

### Data
- [ ] Initial seed data prepared (if needed)
- [ ] Test data removed
- [ ] Sensitive data encrypted
- [ ] Indexes created for performance

## 🚀 Application Checklist

### Build & Dependencies
- [ ] `npm audit` run and vulnerabilities fixed
- [ ] All dependencies up to date
- [ ] Production dependencies only in final image
- [ ] Build tested locally (`npm run build`)
- [ ] TypeScript compilation successful
- [ ] No TypeScript errors
- [ ] Prisma client generated

### Configuration
- [ ] All configuration in environment variables
- [ ] No hardcoded secrets in code
- [ ] No development configurations in production
- [ ] Logging level set appropriately (`info` or `warn`)
- [ ] Log rotation configured

### Features
- [ ] Health check endpoint working (`/api/v1/health`)
- [ ] All critical endpoints tested
- [ ] Authentication working
- [ ] File uploads working
- [ ] WebSocket connections working (if used)
- [ ] Push notifications configured (if used)
- [ ] Video processing configured (FFmpeg installed)

## 📊 Monitoring & Logging

### Logging
- [ ] Winston logger configured
- [ ] Log rotation enabled (daily, 14 days retention)
- [ ] Error logs separate from access logs
- [ ] Sensitive data not logged
- [ ] Log directory has enough space

### Monitoring
- [ ] Health check endpoint accessible
- [ ] Uptime monitoring configured (UptimeRobot, Pingdom, etc.)
- [ ] Error tracking configured (Sentry, optional)
- [ ] Performance monitoring planned
- [ ] Disk space monitoring planned
- [ ] Memory usage monitoring planned

### Alerts
- [ ] Alert for service down
- [ ] Alert for high CPU usage
- [ ] Alert for high memory usage
- [ ] Alert for disk space low
- [ ] Alert for failed backups

## 💾 Backup & Recovery

### Backup Configuration
- [ ] Backup script tested (`scripts/backup.sh`)
- [ ] Backup script scheduled in crontab
- [ ] Backup retention policy set (7 days recommended)
- [ ] Backup directory has enough space
- [ ] Off-site backup configured (S3, optional)

### Recovery Plan
- [ ] Database restore procedure documented
- [ ] Database restore tested
- [ ] Recovery Time Objective (RTO) defined
- [ ] Recovery Point Objective (RPO) defined
- [ ] Disaster recovery plan documented

## 🔄 Deployment Process

### Pre-Deployment
- [ ] All code changes committed
- [ ] Code pushed to repository
- [ ] README updated with production info
- [ ] API documentation updated
- [ ] Team notified of deployment

### Deployment
- [ ] Backup created before deployment
- [ ] Maintenance mode enabled (if applicable)
- [ ] Deployment script ready (`scripts/deploy.sh`)
- [ ] Rollback plan ready
- [ ] Deployment steps documented

### Post-Deployment
- [ ] All services running (`docker ps`)
- [ ] Health check returning 200 OK
- [ ] Database migrations successful
- [ ] No error logs
- [ ] Critical endpoints tested
- [ ] Performance acceptable
- [ ] SSL certificate valid
- [ ] Monitoring alerts working

## 🧪 Testing Checklist

### Functional Testing
- [ ] User registration working
- [ ] User login working
- [ ] Token refresh working
- [ ] Post creation working
- [ ] File upload working
- [ ] Video upload working (if implemented)
- [ ] Comments working
- [ ] VCoin transactions working
- [ ] WebSocket connections working
- [ ] Push notifications working (if configured)

### Performance Testing
- [ ] API response times acceptable (< 500ms for most endpoints)
- [ ] Database queries optimized
- [ ] Load testing completed
- [ ] Concurrent users tested
- [ ] Memory leaks checked

### Security Testing
- [ ] SQL injection tested (should be blocked)
- [ ] XSS attacks tested (should be blocked)
- [ ] CSRF protection verified
- [ ] Rate limiting tested
- [ ] Authentication bypasses tested
- [ ] File upload security tested

## 📝 Documentation

- [ ] README.md updated
- [ ] API endpoints documented
- [ ] Environment variables documented
- [ ] Deployment process documented
- [ ] Troubleshooting guide created
- [ ] Architecture diagram created (optional)
- [ ] Maintenance procedures documented

## 🎯 Final Checks

### Before Going Live
- [ ] All checklist items above completed
- [ ] Staging environment tested (if available)
- [ ] Load testing completed
- [ ] Security audit completed
- [ ] Backup and restore tested
- [ ] Team trained on deployment process
- [ ] Monitoring and alerts configured
- [ ] Support process defined

### Launch Day
- [ ] Team available for monitoring
- [ ] Rollback plan ready
- [ ] Emergency contacts available
- [ ] Monitoring dashboard open
- [ ] Communication plan ready

### Post-Launch (First 24 Hours)
- [ ] Monitor error logs continuously
- [ ] Monitor performance metrics
- [ ] Monitor user feedback
- [ ] Check backup completion
- [ ] Verify SSL certificate
- [ ] Check resource usage
- [ ] Document any issues

### Week 1
- [ ] Review logs daily
- [ ] Monitor performance trends
- [ ] Review security alerts
- [ ] Verify backups working
- [ ] Collect user feedback
- [ ] Plan improvements

## ⚠️ Red Flags - DO NOT DEPLOY IF:

- ❌ Using default/weak passwords
- ❌ JWT secrets are 'secret' or easily guessable
- ❌ No SSL/HTTPS configured
- ❌ Database accessible from internet
- ❌ No backups configured
- ❌ Firewall not configured
- ❌ `.env` file committed to git
- ❌ Development tools exposed (pgAdmin, etc.)
- ❌ No monitoring configured
- ❌ CORS set to allow all origins (`*`)
- ❌ Running as root user
- ❌ No error handling
- ❌ Untested migrations
- ❌ Critical vulnerabilities in dependencies

## 📊 Success Criteria

Your deployment is successful when:

✅ All services running and healthy  
✅ Health check returning 200 OK  
✅ HTTPS working with valid certificate  
✅ Authentication working correctly  
✅ Database connections working  
✅ Redis connections working  
✅ File uploads working  
✅ API responding within acceptable time  
✅ No errors in logs  
✅ Monitoring and alerts active  
✅ Backups completing successfully  
✅ Firewall properly configured  

---

## 📞 Getting Help

If you encounter issues:

1. **Check the logs**: `docker-compose -f docker-compose.prod.yml logs -f`
2. **Review documentation**: See `backend.md` for detailed troubleshooting
3. **Check service status**: `docker-compose -f docker-compose.prod.yml ps`
4. **Verify configuration**: Ensure `.env` has all required variables
5. **Test connections**: Use curl to test endpoints

## 🎉 Ready to Deploy?

Once all items are checked:

```bash
cd /var/www/viwoapp/backend
./scripts/deploy.sh production
```

Good luck! 🚀

---

**Remember**: Better safe than sorry. Take your time with each checklist item.



