# 🚀 Panduan Deploy Queit ke Hostinger

## Masalah yang Telah Diidentifikasi
1. ✅ **SPA Routing**: Aplikasi React memerlukan `.htaccess` untuk routing client-side
2. ✅ **Secure Path Handling**: Path `/v2/` perlu dikonfigurasi dengan benar
3. ❌ **Backend API**: Hostinger mungkin tidak mendukung Node.js backend
4. ❌ **Database Connection**: Koneksi MongoDB mungkin terblokir

## ✅ File yang Telah Dibuat
- `public/.htaccess` - Konfigurasi Apache untuk SPA routing
- Routing configuration untuk `/v2/` paths
- HTTPS redirect dan caching headers

## 🔧 Langkah-langkah Deploy di Hostinger

### 1. Build Application
```bash
# Build frontend
npm run build

# File hasil build ada di: dist/public/
```

### 2. Upload ke Hostinger
Upload semua file dari folder `dist/public/` ke folder `public_html/` di Hostinger:
- ✅ index.html
- ✅ assets/ (folder dengan CSS, JS)
- ✅ .htaccess (file konfigurasi Apache)

### 3. Konfigurasi Database
Hostinger shared hosting tidak mendukung Node.js backend. Anda perlu:

**Opsi A: Gunakan Hostinger VPS/Cloud**
- Upgrade ke VPS atau Cloud hosting
- Install Node.js dan MongoDB
- Deploy backend terpisah

**Opsi B: Backend Terpisah (Recommended)**
- Deploy backend ke Vercel/Railway/Heroku
- Frontend di Hostinger
- Update API endpoints di frontend

### 4. Update API Configuration
Edit file `client/src/lib/queryClient.ts`:
```typescript
// Ganti dengan URL backend terpisah
const API_BASE_URL = 'https://your-backend.vercel.app';
```

## 🛠️ Konfigurasi .htaccess yang Telah Dibuat

File `.htaccess` sudah dikonfigurasi untuk:
- ✅ Handle client-side routing (React Router)
- ✅ Handle secure paths `/v2/`
- ✅ Redirect ke HTTPS
- ✅ Set correct MIME types
- ✅ Enable compression
- ✅ Set cache headers

## 📊 Arsitektur Deployment

### Current Architecture (Fullstack)
```
Frontend (React) + Backend (Node.js) + Database (MongoDB)
```

### Recommended for Hostinger
```
Frontend (Hostinger) → Backend (Vercel/Railway) → Database (MongoDB Atlas)
```

## 🔍 Troubleshooting

### Masalah 1: 404 pada Refresh
**Solved**: File `.htaccess` sudah mengatasi ini dengan:
```apache
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### Masalah 2: API Tidak Respond
**Cause**: Hostinger shared hosting tidak mendukung Node.js
**Solution**: Deploy backend terpisah

### Masalah 3: Secure Path `/v2/` Error
**Solved**: Configured dalam `.htaccess`:
```apache
RewriteCond %{REQUEST_URI} ^/v2/
RewriteRule ^v2/(.*)$ /index.html [QSA,L]
```

## 🚀 Alternative Solutions

### Option 1: Frontend Only di Hostinger
1. Deploy frontend ke Hostinger (static files)
2. Deploy backend ke Vercel/Railway/Heroku
3. Update API endpoints di frontend

### Option 2: Full Migration ke Vercel
1. Tetap gunakan Vercel untuk fullstack
2. Custom domain queit.site ke Vercel
3. Lebih mudah dan fully supported

### Option 3: Hostinger VPS
1. Upgrade ke VPS/Cloud
2. Install Node.js dan MongoDB
3. Deploy fullstack di VPS

## 📋 Next Steps

1. **Test `.htaccess`**: Upload dan test routing
2. **Separate Backend**: Deploy backend ke Vercel
3. **Update API URLs**: Point frontend ke backend URL
4. **Test Full Flow**: Verify all functionality

## 💡 Recommendation

Untuk kemudahan, saya sarankan:
1. **Frontend**: Hostinger (static files dengan .htaccess)
2. **Backend**: Vercel (sudah dikonfigurasi)
3. **Database**: MongoDB Atlas (sudah terhubung)

Ini akan memberikan performance terbaik dan setup yang paling mudah.