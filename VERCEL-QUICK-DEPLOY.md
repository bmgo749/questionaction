# ⚡ Quick Deploy Queit ke Vercel (5 Menit)

## Step 1: Prepare Repository
```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

## Step 2: Import ke Vercel
1. Go to https://vercel.com
2. Click **"New Project"**
3. Import from GitHub
4. Select your repository

## Step 3: Configure Build
```
Framework: Other
Build Command: vite build && esbuild server/index.ts --bundle --platform=node --target=node18 --outfile=dist/index.js --external:@mongodb-js/zstd --external:kerberos --external:@aws-sdk/credential-providers --external:mongodb-client-encryption --external:snappy --external:socks --external:aws4 --external:bson-ext
Output Directory: dist/public
```

## Step 4: Environment Variables
Copy-paste di Vercel Settings > Environment Variables:

```bash
DATABASE_URL=postgresql://queit_user:strong_password_123@db-postgresql-sgp1-47891-do-user-16486936-0.c.db.ondigitalocean.com:25060/queit_db?sslmode=require
MONGODB_ATLAS_URL=mongodb+srv://Aldan:SANDI980@queit-replit.7n37zmp.mongodb.net/queit?retryWrites=true&w=majority
SESSION_SECRET=super_secret_session_key_for_production_use_only_2025
GOOGLE_CLIENT_ID=693608051666-kpemam0j804vf5fl8v2h1edg8jgjh3g5.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
DISCORD_CLIENT_ID=1344311791177564202
DISCORD_CLIENT_SECRET=RuT-QizmyKCAJ_eaUyPEJActwst8Ws32
EMAIL_USER=bmgobmgo749@gmail.com
email_pass=uxujqtkuhldurifo
DEPLOYMENT_DOMAIN=https://queit.site
```

## Step 5: Deploy
1. Click **"Deploy"**
2. Wait 5-10 minutes
3. Done! 🎉

## Quick Tests
```bash
# Test website
curl https://your-project.vercel.app

# Test forgot password
curl -X POST https://your-project.vercel.app/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## Update OAuth Redirects
- Google Console: Add `https://your-domain.vercel.app/api/auth/google/callback`
- Discord Portal: Add `https://your-domain.vercel.app/`

---
✅ **Ready to go!** Your Queit platform is now live on Vercel.