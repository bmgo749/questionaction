# 🛠️ Vercel Deployment Troubleshooting Guide - Queit

## 🚨 Common Build Errors & Solutions

### 1. UUID Import Error
**Error:**
```
Rollup failed to resolve import "uuid" from "client/src/lib/security.ts"
```

**Solution:**
✅ **FIXED** - UUID dependency telah dihapus dan diganti dengan browser-native crypto.randomUUID()

**What was changed:**
- Removed `import { v4 as uuidv4 } from 'uuid'` 
- Added browser-compatible UUID generator function
- Uses `crypto.randomUUID()` with fallback for older browsers

### 2. Build Command Issues
**Error:**
```
Build failed - packages external error
```

**Solution:**
Use the corrected build command:
```bash
vite build && esbuild server/index.ts --bundle --platform=node --target=node18 --outfile=dist/index.js --external:@mongodb-js/zstd --external:kerberos --external:@aws-sdk/credential-providers --external:mongodb-client-encryption --external:snappy --external:socks --external:aws4 --external:bson-ext
```

### 3. MongoDB Dependencies Error
**Error:**
```
Cannot resolve @mongodb-js/zstd
Cannot resolve kerberos
```

**Solution:**
External dependencies sudah ditambahkan ke build command:
- `--external:@mongodb-js/zstd`
- `--external:kerberos` 
- `--external:mongodb-client-encryption`
- Dan lainnya

### 4. Environment Variables Not Loading
**Error:**
```
EMAIL_PASS is undefined
DATABASE_URL is undefined
```

**Solution:**
1. **Vercel Dashboard** - Check Environment Variables section
2. **Scope** - Ensure set for Production, Preview, Development
3. **Names** - Verify exact variable names (case-sensitive)

Example configuration:
```bash
EMAIL_USER=bmgobmgo749@gmail.com
email_pass=uxujqtkuhldurifo  # Note: lowercase
EMAIL_PASS=uxujqtkuhldurifo  # Backup uppercase
```

### 5. OAuth Redirect URI Mismatch
**Error:**
```
OAuth error: redirect_uri_mismatch
```

**Solution:**
Update OAuth providers:

**Google Console:**
- Add `https://your-project.vercel.app/api/auth/google/callback`
- Add `https://queit.site/api/auth/google/callback`

**Discord Developer:**
- Add `https://your-project.vercel.app/`
- Add `https://queit.site/`

### 6. Function Timeout Errors
**Error:**
```
Function execution timed out
```

**Solution:**
1. **Optimize Database Queries** - Add indexes
2. **Connection Pooling** - Configure MongoDB Atlas
3. **Function Limits** - Check Vercel plan limits

### 7. CORS Issues
**Error:**
```
Access-Control-Allow-Origin error
```

**Solution:**
Domain configuration in `server/config.ts`:
```typescript
DEPLOYMENT_DOMAIN: 'https://queit.site'
```

## 📋 Debug Checklist

### Pre-Deployment
- [ ] Local build successful: `npm run build`
- [ ] No TypeScript errors: `npm run check`
- [ ] All environment variables set
- [ ] OAuth redirects updated

### During Deployment
- [ ] Build logs show no errors
- [ ] Function deployment successful
- [ ] Static files deployed
- [ ] Domain routing working

### Post-Deployment
- [ ] Homepage loads
- [ ] API endpoints responding
- [ ] Authentication working
- [ ] Database connected
- [ ] Email system functional

## 🔍 Debugging Commands

### Test Local Build
```bash
# Test frontend build
cd client && npm run build

# Test server build  
esbuild server/index.ts --bundle --platform=node --target=node18 --outfile=dist/index.js

# Test full build
npm run build
```

### Test API Endpoints
```bash
# Test basic API
curl https://your-project.vercel.app/api/stats

# Test authentication
curl https://your-project.vercel.app/api/auth/user

# Test forgot password
curl -X POST https://your-project.vercel.app/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### Vercel CLI Debug
```bash
# Install Vercel CLI
npm i -g vercel

# Local development
vercel dev

# Deploy with debug
vercel --debug

# View logs
vercel logs your-project
```

## 📊 Vercel Function Limits

| Plan | Function Size | Execution Time | Memory |
|------|---------------|----------------|---------|
| Hobby | 50MB | 10s | 1024MB |
| Pro | 50MB | 60s | 1024MB |
| Enterprise | 250MB | 900s | 3008MB |

## 🚑 Emergency Fixes

### 1. Quick Rollback
```bash
# Via Vercel Dashboard
Settings > Deployments > Previous > Promote to Production
```

### 2. Bypass Build Issues
```bash
# Temporary: Use minimal build
Build Command: vite build
Output Directory: dist/public
```

### 3. Environment Variable Override
Add to `vercel.json`:
```json
{
  "env": {
    "NODE_ENV": "production",
    "DATABASE_URL": "your-connection-string"
  }
}
```

### 4. Force Dependencies
Add to build command:
```bash
npm install --force && vite build
```

## 🔗 Resources

- **Vercel Docs:** https://vercel.com/docs
- **Function Logs:** Vercel Dashboard > Functions
- **Build Logs:** Vercel Dashboard > Deployments > Build Logs
- **Edge Network:** https://vercel.com/docs/edge-network

## 💡 Pro Tips

1. **Always test locally first** - `npm run build`
2. **Use Vercel CLI** for debugging - `vercel dev`
3. **Monitor function logs** in real-time
4. **Set up alerts** for deployment failures
5. **Keep environment variables in sync** across environments

---

## 🎯 Final Build Configuration

**Framework:** Other
**Build Command:** 
```bash
vite build && esbuild server/index.ts --bundle --platform=node --target=node18 --outfile=dist/index.js --external:@mongodb-js/zstd --external:kerberos --external:@aws-sdk/credential-providers --external:mongodb-client-encryption --external:snappy --external:socks --external:aws4 --external:bson-ext
```
**Output Directory:** `dist/public`
**Root Directory:** `./`

With these fixes, your Queit platform should deploy successfully to Vercel! 🚀