# 🚀 Vercel + Hostinger Domain Setup Guide

## Setup Architecture
```
GitHub Repository → Vercel Deployment → Hostinger Domain
     (Code)           (App Running)        (Domain Only)
```

## 📋 Current Configuration Status

### ✅ Already Configured
- **Vercel.json**: Updated with correct routing and environment variables
- **OAuth Settings**: Google & Discord configured for queit.site
- **Database**: MongoDB Atlas connected
- **Email System**: Gmail configured with app password

### 🔧 Next Steps Required

## 1. GitHub Repository Setup
```bash
# Add all files to git
git add .
git commit -m "Add Vercel deployment configuration"
git push origin main
```

## 2. Vercel Deployment
1. **Login to Vercel**: https://vercel.com
2. **Import Project**: Connect your GitHub repository
3. **Configure Build Settings**:
   - Framework Preset: **Other**
   - Build Command: `npm run build`
   - Output Directory: `dist/public`
   - Install Command: `npm install`

## 3. Vercel Environment Variables
Add these in **Vercel Dashboard > Settings > Environment Variables**:

```bash
# Database
DATABASE_URL=postgresql://queit_user:strong_password_123@db-postgresql-sgp1-47891-do-user-16486936-0.c.db.ondigitalocean.com:25060/queit_db?sslmode=require

# Session
SESSION_SECRET=super_secret_session_key_for_production_use_only_2025

# OAuth - Google
GOOGLE_CLIENT_ID=693608051666-kpemam0j804vf5fl8v2h1edg8jgjh3g5.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# OAuth - Discord
DISCORD_CLIENT_ID=1344311791177564202
DISCORD_CLIENT_SECRET=RuT-QizmyKCAJ_eaUyPEJActwst8Ws32

# Email
EMAIL_USER=bmgobmgo749@gmail.com
email_pass=uxujqtkuhldurifo

# Deployment
DEPLOYMENT_DOMAIN=https://queit.site
VERCEL_URL=https://queit-two.vercel.app
```

## 4. Hostinger Domain Configuration

### DNS Settings at Hostinger
1. **Login to Hostinger Control Panel**
2. **Go to DNS Zone Editor**
3. **Add/Edit these records**:

```dns
# Main domain
Type: CNAME
Name: @
Value: cname.vercel-dns.com

# WWW subdomain
Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

### Alternative DNS Settings
If CNAME for @ doesn't work, use A records:
```dns
# Main domain
Type: A
Name: @
Value: 76.76.21.21

# WWW subdomain
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

## 5. Vercel Custom Domain Setup
1. **Vercel Dashboard > Settings > Domains**
2. **Add Domain**: `queit.site`
3. **Add Domain**: `www.queit.site`
4. **Follow DNS instructions** provided by Vercel

## 6. OAuth Redirect URLs Update

### Google Console (console.cloud.google.com)
Update **Authorized redirect URIs**:
```
https://queit.site/api/auth/google/callback
https://www.queit.site/api/auth/google/callback
https://queit-two.vercel.app/api/auth/google/callback
```

### Discord Developer Portal
Update **Redirect URIs**:
```
https://queit.site/api/auth/discord/callback
https://www.queit.site/api/auth/discord/callback
https://queit-two.vercel.app/api/auth/discord/callback
```

## 🧪 Testing Deployment

### Test URLs
After deployment, test these URLs:
- ✅ https://queit.site
- ✅ https://www.queit.site
- ✅ https://queit-two.vercel.app
- ✅ https://queit.site/api/stats
- ✅ https://queit.site/categories

### Test Features
- ✅ Navigation between pages
- ✅ Page refresh (no 404)
- ✅ Direct URL access
- ✅ Login/OAuth
- ✅ API endpoints
- ✅ Database operations

## 📊 Expected Timeline
- **GitHub Push**: 2 minutes
- **Vercel Import**: 5 minutes
- **DNS Configuration**: 10-30 minutes
- **DNS Propagation**: 2-24 hours
- **SSL Certificate**: Automatic

## 🔍 Troubleshooting

### Common Issues
1. **DNS Propagation**: Wait 2-24 hours for DNS changes
2. **SSL Certificate**: Vercel handles automatically
3. **Build Errors**: Check Vercel function logs
4. **OAuth Errors**: Verify redirect URIs
5. **API Errors**: Check environment variables

### Debug Commands
```bash
# Check DNS propagation
nslookup queit.site

# Test API endpoints
curl https://queit.site/api/stats

# Check SSL certificate
curl -I https://queit.site
```

## 🎯 Final Configuration

With this setup:
- **Vercel**: Handles application hosting and serverless functions
- **Hostinger**: Provides the custom domain (queit.site)
- **GitHub**: Source code repository with auto-deployment
- **MongoDB Atlas**: Database (already configured)
- **Gmail**: Email service (already configured)

This is the most reliable and professional setup for your Queit platform.