# 🚀 Panduan Deploy Queit ke Vercel

## Prasyarat
- Akun Vercel (https://vercel.com)
- Repository GitHub dengan kode Queit
- Gmail dengan App Password untuk email
- Database MongoDB Atlas atau PostgreSQL

## Langkah 1: Persiapan Repository

### 1.1 Push ke GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 1.2 Verifikasi File Konfigurasi
Pastikan file-file berikut ada dan sudah dikonfigurasi:
- ✅ `vercel.json` - Konfigurasi build dan routing
- ✅ `package.json` - Dependencies dan scripts
- ✅ `server/config.ts` - Konfigurasi hardcoded
- ✅ `deploy.config.js` - Global deployment config

## Langkah 2: Setup Vercel Project

### 2.1 Import Project dari GitHub
1. Login ke https://vercel.com
2. Klik "New Project"
3. Import repository GitHub Anda
4. Pilih repository "queit" atau nama repository Anda

### 2.2 Konfigurasi Build Settings
```
Framework Preset: Other
Build Command: npm run build
Output Directory: dist/public
Install Command: npm install
```

### 2.3 Root Directory
```
Root Directory: ./
```

## Langkah 3: Environment Variables

### 3.1 Tambahkan Environment Variables di Vercel Dashboard
Masuk ke **Settings > Environment Variables** dan tambahkan:

```bash
# Database Configuration
DATABASE_URL=postgresql://queit_user:strong_password_123@db-postgresql-sgp1-47891-do-user-16486936-0.c.db.ondigitalocean.com:25060/queit_db?sslmode=require
MONGODB_ATLAS_URL=mongodb+srv://Aldan:SANDI980@queit-replit.7n37zmp.mongodb.net/queit?retryWrites=true&w=majority

# Session Secret
SESSION_SECRET=super_secret_session_key_for_production_use_only_2025

# OAuth Credentials
GOOGLE_CLIENT_ID=693608051666-kpemam0j804vf5fl8v2h1edg8jgjh3g5.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
DISCORD_CLIENT_ID=1344311791177564202
DISCORD_CLIENT_SECRET=RuT-QizmyKCAJ_eaUyPEJActwst8Ws32

# Email Configuration
EMAIL_USER=bmgobmgo749@gmail.com
email_pass=uxujqtkuhldurifo

# Deployment Domain
DEPLOYMENT_DOMAIN=https://queit.site
```

### 3.2 Set Environment untuk Production
Pastikan semua environment variables di-set untuk **Production**, **Preview**, dan **Development**.

## Langkah 4: Domain Configuration

### 4.1 Custom Domain (Opsional)
1. Masuk ke **Settings > Domains**
2. Tambahkan domain `queit.site`
3. Update DNS records sesuai instruksi Vercel

### 4.2 Update OAuth Redirect URLs
Update redirect URLs di:
- **Google Console**: https://console.developers.google.com
- **Discord Developer Portal**: https://discord.com/developers/applications

Tambahkan domain:
- `https://queit.site/api/auth/google/callback`
- `https://queit.site/api/auth/discord/callback`
- `https://queit.site/` (untuk Discord root callback)

## Langkah 5: Deploy

### 5.1 Manual Deploy
1. Klik **Deploy** di Vercel dashboard
2. Tunggu proses build selesai (5-10 menit)
3. Cek build logs untuk error

### 5.2 Automatic Deploy
Setiap push ke branch `main` akan trigger auto-deploy.

## Langkah 6: Verifikasi Deployment

### 6.1 Test Website
- ✅ Homepage loading
- ✅ Login dengan Google/Discord
- ✅ Forgot password email
- ✅ Database operations
- ✅ File uploads

### 6.2 Test Email System
```bash
curl -X POST https://queit.site/api/test-email \
  -H "Content-Type: application/json"
```

### 6.3 Test Forgot Password
```bash
curl -X POST https://queit.site/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## Langkah 7: Troubleshooting

### 7.1 Build Errors
```bash
# Local test build
npm run build

# Check build logs di Vercel
# Settings > Functions > View Function Logs
```

### 7.2 Environment Variables
```bash
# Verify di runtime
console.log('EMAIL_PASS:', process.env.email_pass ? 'Set' : 'Not set');
```

### 7.3 Database Connection
```bash
# Test MongoDB connection
curl https://queit.site/api/stats
```

### 7.4 OAuth Issues
- Pastikan redirect URLs sama persis
- Cek client ID dan secret
- Verify domain di OAuth providers

## Langkah 8: Monitoring & Maintenance

### 8.1 Vercel Analytics
1. Enable di **Settings > Analytics**
2. Monitor traffic dan performance

### 8.2 Function Logs
1. **Settings > Functions**
2. View real-time logs
3. Monitor API responses

### 8.3 Deployment History
1. **Deployments** tab
2. Rollback jika diperlukan
3. Compare deployment versions

## File Konfigurasi Penting

### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist/public"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/public/$1"
    }
  ]
}
```

### Build Command Fix
**Current build command may fail due to UUID dependency. Use this instead:**

```bash
# Vercel Build Settings
Build Command: vite build && esbuild server/index.ts --bundle --platform=node --target=node18 --outfile=dist/index.js --external:@mongodb-js/zstd --external:kerberos --external:@aws-sdk/credential-providers --external:mongodb-client-encryption --external:snappy --external:socks --external:aws4 --external:bson-ext --outdir=dist
Output Directory: dist/public
```

### Build Issue Resolution
If you encounter UUID build errors:
1. **UUID dependency removed** from frontend - now uses browser-native crypto.randomUUID()
2. **Build optimized** for Vercel deployment with proper externals
3. **MongoDB dependencies** properly excluded from bundle

## Checklist Deployment

- [ ] Repository pushed ke GitHub
- [ ] Vercel project created dan linked
- [ ] Environment variables configured
- [ ] OAuth redirect URLs updated
- [ ] Custom domain added (opsional)
- [ ] Deployment successful
- [ ] Website accessible
- [ ] Authentication working
- [ ] Email system working
- [ ] Database connected
- [ ] All API endpoints responding

## Support

Jika mengalami masalah:
1. Cek Vercel function logs
2. Test endpoints dengan curl
3. Verify environment variables
4. Check OAuth configuration
5. Monitor database connections

---

🎉 **Deployment Complete!** 

Website Queit sekarang live di domain Vercel atau custom domain Anda.