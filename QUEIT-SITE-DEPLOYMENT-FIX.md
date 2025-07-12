# 🔧 Queit.site Deployment Fix Guide

## Current Issue
Your website is showing "not found" errors on Vercel because:
1. ✅ **Fixed**: Routing configuration updated for `/v2/` secure paths
2. ❌ **Need to fix**: OAuth redirect URLs need to be updated for queit.site domain
3. ❌ **Need to fix**: Google Console and Discord Developer portal settings

## ✅ Already Fixed in This Session
1. **Updated vercel.json routing** to handle `/v2/` paths properly
2. **Updated deployment domain** to queit.site in configuration
3. **Fixed routing handlers** to serve index.html for all client routes

## 🔧 OAuth Configuration Updates Needed

### Google OAuth Console
You need to update your Google OAuth settings at https://console.cloud.google.com:

1. Go to **APIs & Services** → **Credentials**
2. Edit your OAuth 2.0 client ID: `693608051666-kpemam0j804vf5fl8v2h1edg8jgjh3g5.apps.googleusercontent.com`
3. **Authorized redirect URIs** - Add these URLs:
   ```
   https://queit.site/api/auth/google/callback
   https://www.queit.site/api/auth/google/callback
   ```
4. **Authorized JavaScript origins** - Add these URLs:
   ```
   https://queit.site
   https://www.queit.site
   ```

### Discord Developer Portal
You need to update your Discord app settings at https://discord.com/developers/applications:

1. Go to your Discord app ID: `1344311791177564202`
2. Navigate to **OAuth2** → **General**
3. **Redirects** - Add these URLs:
   ```
   https://queit.site/api/auth/discord/callback
   https://www.queit.site/api/auth/discord/callback
   ```

## 🚀 Deployment Steps

### 1. Push Updated Code to GitHub
```bash
git add .
git commit -m "Fix routing for queit.site domain"
git push origin main
```

### 2. Redeploy on Vercel
- Go to your Vercel dashboard
- Find your project and click "Redeploy"
- Or push to GitHub will trigger automatic deployment

### 3. Configure Custom Domain on Vercel
1. Go to **Settings** → **Domains**
2. Add custom domain: `queit.site`
3. Add custom domain: `www.queit.site`
4. Configure DNS as instructed by Vercel

## 🛠️ DNS Configuration
You'll need to update your DNS settings at your domain registrar:

### For queit.site:
- **Type**: CNAME
- **Name**: @ (or blank)
- **Value**: cname.vercel-dns.com

### For www.queit.site:
- **Type**: CNAME  
- **Name**: www
- **Value**: cname.vercel-dns.com

## 🧪 Testing After Deployment
Once deployed, test these URLs:
- ✅ https://queit.site (should load home page)
- ✅ https://www.queit.site (should load home page)
- ✅ https://queit.site/api/stats (should return JSON)
- ✅ https://queit.site/v2/?code=test&errorCode=test# (should handle secure routing)

## 📋 Current Configuration Summary
- **Domain**: https://queit.site
- **Database**: MongoDB Atlas (ready)
- **Email**: Gmail App Password (ready)
- **OAuth**: Google & Discord (needs URL updates)
- **Routing**: Fixed for /v2/ paths

## 🔍 Debug Commands
If still having issues:
```bash
# Test API endpoints
curl https://queit.site/api/stats

# Check routing
curl https://queit.site/v2/?code=test

# Test OAuth
curl https://queit.site/api/auth/google
```

## 📞 Next Steps
1. Update OAuth redirect URLs in Google Console and Discord Developer portal
2. Add custom domain on Vercel
3. Configure DNS at your domain registrar
4. Test all functionality

The routing and deployment configuration is now fixed. The main remaining step is updating the OAuth redirect URLs in the respective developer consoles.