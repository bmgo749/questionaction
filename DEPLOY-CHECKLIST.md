# 📋 Checklist Deploy Vercel - Queit Platform

## Pre-Deployment ✅

### Repository Setup
- [ ] Code di-push ke GitHub/GitLab
- [ ] Branch `main` adalah branch utama
- [ ] Tidak ada file rahasia di repository
- [ ] `.gitignore` sudah benar

### File Konfigurasi
- [ ] `vercel.json` ada dan configured
- [ ] `package.json` scripts build tersedia
- [ ] `server/config.ts` hardcoded credentials
- [ ] Environment variables siap

## Vercel Configuration ⚙️

### Project Setup
- [ ] Project imported dari Git
- [ ] Framework preset: **Other**
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist/public`
- [ ] Root directory: `./`

### Environment Variables
- [ ] `DATABASE_URL` - PostgreSQL/MongoDB
- [ ] `MONGODB_ATLAS_URL` - MongoDB Atlas
- [ ] `SESSION_SECRET` - Session encryption
- [ ] `GOOGLE_CLIENT_ID` - OAuth Google
- [ ] `GOOGLE_CLIENT_SECRET` - OAuth Google
- [ ] `DISCORD_CLIENT_ID` - OAuth Discord  
- [ ] `DISCORD_CLIENT_SECRET` - OAuth Discord
- [ ] `EMAIL_USER` - Gmail username
- [ ] `email_pass` - Gmail app password (16 digit)
- [ ] `DEPLOYMENT_DOMAIN` - Production domain

### Environment Scope
- [ ] Production ✅
- [ ] Preview ✅  
- [ ] Development ✅

## OAuth Configuration 🔐

### Google Console
- [ ] Client ID created
- [ ] Authorized domains: `queit.site`
- [ ] Redirect URIs:
  - [ ] `https://queit.site/api/auth/google/callback`
  - [ ] `https://your-project.vercel.app/api/auth/google/callback`

### Discord Developer Portal  
- [ ] Application created
- [ ] Client ID & Secret obtained
- [ ] Redirect URIs:
  - [ ] `https://queit.site/`
  - [ ] `https://your-project.vercel.app/`

## Email Configuration 📧

### Gmail Setup
- [ ] 2-Step Verification enabled
- [ ] App Password generated (16 characters)
- [ ] App Password tested dengan nodemailer
- [ ] Email templates configured

### Test Email
```bash
curl -X POST https://queit.site/api/test-email
```
- [ ] Response: 200 OK
- [ ] Email received successfully

## Database Configuration 🗄️

### MongoDB Atlas
- [ ] Cluster created
- [ ] Database user configured
- [ ] Network access (0.0.0.0/0) untuk Vercel
- [ ] Connection string tested

### PostgreSQL (Optional)
- [ ] Database hosted (DigitalOcean/Railway)
- [ ] Connection string configured
- [ ] SSL mode enabled

## Deployment Process 🚀

### Build & Deploy
- [ ] Initial deployment successful
- [ ] Build logs no errors
- [ ] Function logs accessible
- [ ] All routes responding

### Domain Setup
- [ ] Custom domain added (optional)
- [ ] DNS configured
- [ ] SSL certificate active
- [ ] Redirects working

## Post-Deployment Testing 🧪

### Core Functionality
- [ ] Homepage loads
- [ ] Navigation works
- [ ] Responsive design
- [ ] Dark/light mode toggle

### Authentication
- [ ] Google OAuth login
- [ ] Discord OAuth login  
- [ ] Email signup/signin
- [ ] Password reset flow
- [ ] Session persistence

### Features
- [ ] Article creation
- [ ] Page posts
- [ ] Comments system
- [ ] File uploads
- [ ] Search functionality
- [ ] Categories working

### API Endpoints
```bash
# Test core APIs
curl https://queit.site/api/stats
curl https://queit.site/api/articles  
curl https://queit.site/api/categories/counts
```
- [ ] All APIs responding
- [ ] Database queries working
- [ ] Real-time features active

### Email Features
```bash
# Test forgot password
curl -X POST https://queit.site/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```
- [ ] Forgot password emails sent
- [ ] Verification emails working
- [ ] Email templates formatted correctly

## Performance & Monitoring 📊

### Vercel Analytics
- [ ] Analytics enabled
- [ ] Performance monitoring
- [ ] Function metrics
- [ ] Error tracking

### Speed Tests
- [ ] First page load < 3s
- [ ] API response times < 1s
- [ ] Image optimization working
- [ ] CDN caching active

## Security Checklist 🔒

### Environment Security
- [ ] No secrets in code
- [ ] Environment variables encrypted
- [ ] API keys restricted
- [ ] CORS configured properly

### Authentication Security
- [ ] OAuth scopes minimal
- [ ] Session timeouts configured
- [ ] Password hashing (bcrypt)
- [ ] CSRF protection

## Backup & Recovery 💾

### Database Backups
- [ ] MongoDB Atlas automated backups
- [ ] PostgreSQL backups scheduled
- [ ] Data export tested

### Deployment Rollback
- [ ] Previous deployment accessible
- [ ] Rollback procedure tested
- [ ] Configuration versioned

## Final Verification ✨

### User Journey
- [ ] New user signup flow
- [ ] Existing user login
- [ ] Password reset process
- [ ] Content creation/editing
- [ ] Social features working

### Cross-Browser Testing
- [ ] Chrome ✅
- [ ] Firefox ✅
- [ ] Safari ✅
- [ ] Mobile browsers ✅

### Load Testing (Optional)
- [ ] Concurrent user handling
- [ ] Database performance
- [ ] API rate limiting
- [ ] Error handling

---

## 🎉 Deployment Complete!

Semua checklist ✅ = Ready for production!

**Live URLs:**
- Production: https://queit.site
- Vercel URL: https://your-project.vercel.app

**Admin Access:**
- Vercel Dashboard: https://vercel.com/dashboard
- MongoDB Atlas: https://cloud.mongodb.com
- Google Console: https://console.developers.google.com
- Discord Portal: https://discord.com/developers/applications

---

**Next Steps:**
1. Monitor function logs
2. Set up uptime monitoring  
3. Configure domain analytics
4. Plan scaling strategy

Happy deploying! 🚀