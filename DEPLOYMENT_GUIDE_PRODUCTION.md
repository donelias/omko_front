# Hostinger Production Deployment Guide

## Overview
This guide explains how to deploy OMKO changes from GitHub to the Hostinger production server.

## Prerequisites
- SSH access to Hostinger server
- Git configured with SSH keys
- Node.js and npm installed
- PHP and Composer installed
- Both `omko_admin` and `omko_front` repositories cloned

## Deployment Methods

### Method 1: Automated Deployment Script (Recommended)

#### Step 1: Upload the deployment script
```bash
scp deploy-production.sh user@hostinger.com:/path/to/omko/
```

#### Step 2: Make the script executable
```bash
ssh user@hostinger.com "chmod +x /path/to/omko/deploy-production.sh"
```

#### Step 3: Run the deployment
```bash
ssh user@hostinger.com "/path/to/omko/deploy-production.sh"
```

### Method 2: Manual Deployment

#### Backend Deployment
```bash
ssh user@hostinger.com

# Navigate to backend directory
cd /path/to/real_estate_admin

# Pull latest changes
git pull origin master

# Clear Laravel caches
php artisan cache:clear
php artisan config:clear
php artisan view:clear

# Run migrations (if needed)
php artisan migrate --force

# Restart any queue workers if using them
php artisan queue:restart
```

#### Frontend Deployment
```bash
# Navigate to frontend directory
cd /path/to/Web-omko

# Pull latest changes
git pull origin master

# Install dependencies (production only)
npm install --production

# Build Next.js application
npm run build

# Restart the Node application (if using PM2)
pm2 restart omko-frontend
# Or manually restart your Node process
```

## Deployment Steps Summary

1. **Pull Latest Code**
   - Backend: `git pull origin master` in real_estate_admin
   - Frontend: `git pull origin master` in Web-omko

2. **Backend Tasks**
   - Clear Laravel cache and config
   - Run database migrations
   - Verify .env file is configured correctly

3. **Frontend Tasks**
   - Install npm dependencies
   - Build the Next.js application
   - Verify build output
   - Restart application process

4. **Verification**
   - Test backend APIs
   - Test frontend pages
   - Check logs for any errors

## Environment Variables

### Backend (.env)
Ensure these are set correctly in production:
```
APP_ENV=production
APP_DEBUG=false
DB_CONNECTION=mysql
```

### Frontend (.env.production)
Ensure API endpoints are pointing to production:
```
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

## Rollback Plan

If deployment fails:

```bash
# Backend rollback
cd real_estate_admin
git revert HEAD
git push origin master

# Frontend rollback
cd ../Web-omko
git revert HEAD
npm run build
npm run start
```

## Monitoring After Deployment

1. Check application logs
2. Monitor error tracking
3. Verify all main features working
4. Check database for any issues
5. Monitor server resources

## Common Issues

### Issue: "npm: command not found"
- Ensure Node.js is installed
- Check PATH environment variable
- Run `which node` to verify installation

### Issue: Build fails
- Clear node_modules: `rm -rf node_modules package-lock.json`
- Reinstall: `npm install`
- Try build again: `npm run build`

### Issue: Database migration errors
- Check database connection in .env
- Verify database user permissions
- Check migration files for syntax errors

## Support

For issues or questions:
1. Check logs in `/logs` directory
2. Review recent git commits
3. Contact server administrator

---

**Last Updated:** February 1, 2026
**Version:** 1.0
