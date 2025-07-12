# 🚀 Solusi Cepat Deploy Vercel

## Masalah yang Ditemukan:
Dari log error Vercel Anda: `Error! Unexpected error. Please try again later. ()`

Ini biasanya terjadi karena:
1. Build command tidak kompatibel dengan Vercel
2. Dependencies tidak terinstall dengan benar
3. Environment variables tidak ter-set

## ✅ Solusi Tercepat:

### Opsi 1: Deploy Manual via Vercel Dashboard (RECOMMENDED)

1. **Buka Vercel Dashboard**: https://vercel.com/dashboard
2. **Import Project**: 
   - Click "New Project"
   - Connect GitHub dan pilih repository Anda
3. **Configure Settings**:
   ```
   Framework Preset: Other
   Build Command: npm run build
   Output Directory: dist/public
   Install Command: npm install
   Root Directory: ./
   ```
4. **Add Environment Variables** di Settings > Environment Variables:
   Copy semua env vars dari vercel.json ke dashboard

### Opsi 2: Perbaiki GitHub Actions 

Ganti isi file `.github/workflows/deploy.yml` dengan yang sederhana:

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: Eh21Bq1332cmFI2pKOqLVueG
          vercel-org-id: team_m9qh00IACWJhdRUEimwit93n
          vercel-project-id: prj_sPnN4A76B6NnWF8DaUmahsQimNX7
          vercel-args: '--prod --yes'
```

### Opsi 3: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy langsung tanpa build manual
vercel --prod
```

## 🔧 Jika Masih Error:

### Cek Project ID dan Org ID
Pastikan ID di workflow match dengan project Vercel:
- Project ID: `prj_sPnN4A76B6NnWF8DaUmahsQimNX7`
- Org ID: `team_m9qh00IACWJhdRUEimwit93n`

### Regenerate Vercel Token
1. Buka https://vercel.com/account/tokens
2. Regenerate token baru
3. Update di GitHub secrets atau workflow file

## 💡 Tips:
- Gunakan Opsi 1 (Manual via Dashboard) untuk hasil paling reliable
- Vercel otomatis detect build settings untuk React apps
- Environment variables di vercel.json sudah lengkap
- Database MongoDB Atlas sudah configured dan ready

## 🎯 Expected Result:
Setelah deploy sukses, app akan accessible di:
- https://[project-name].vercel.app
- OAuth sudah configured untuk domain baru
- Database connection sudah ready