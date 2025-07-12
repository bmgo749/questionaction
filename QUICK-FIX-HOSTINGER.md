# 🚨 Quick Fix untuk Hostinger 404 Error

## Masalah yang Terjadi
- ✅ Website loading di home page
- ❌ 404 error saat pindah ke page lain
- ❌ 404 error saat refresh page
- ❌ Routing tidak berfungsi

## 🔧 Solusi Cepat (5 Menit)

### 1. Upload file .htaccess
File `.htaccess` sudah dibuat di folder `public/`. Upload file ini ke folder `public_html/` di Hostinger.

### 2. Verifikasi isi file .htaccess
Pastikan file `.htaccess` berisi:
```apache
Options -MultiViews
RewriteEngine On

# Handle client-side routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(?!api/) . [NC,L]

# Handle /v2/ secure routes
RewriteCond %{REQUEST_URI} ^/v2/
RewriteRule ^v2/(.*)$ /index.html [QSA,L]

# Fallback to index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### 3. Set Permission File
Di Hostinger File Manager:
- Klik kanan pada file `.htaccess`
- Pilih "Change Permissions"
- Set ke `644` (rw-r--r--)

### 4. Test Immediate
Setelah upload `.htaccess`:
1. Buka https://queit.site
2. Klik menu "Category" atau "Trending"
3. Refresh halaman
4. Coba URL langsung seperti https://queit.site/categories

## 🔍 Jika Masih Error

### Option A: Buat file .htaccess Manual
Buat file baru bernama `.htaccess` di `public_html/` dengan isi:
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### Option B: Gunakan 404.html
Buat file `404.html` di `public_html/` dengan isi yang sama seperti `index.html`.

## 🚀 Untuk Backend API

Aplikasi Anda butuh backend untuk fitur-fitur seperti:
- Login/Register
- Database
- Upload file
- Email

### Deploy Backend Terpisah
1. **Vercel** (Recommended): Deploy backend ke `https://queit-api.vercel.app`
2. **Railway**: Deploy backend ke Railway
3. **Heroku**: Deploy backend ke Heroku

### Update Frontend
Edit file konfigurasi API untuk point ke backend terpisah.

## 📋 Checklist Cepat
- [ ] Upload file `.htaccess` ke `public_html/`
- [ ] Set permission `.htaccess` ke `644`
- [ ] Test routing di website
- [ ] Deploy backend terpisah (optional)

## 💡 Why This Happens
Hostinger shared hosting menggunakan Apache server yang perlu konfigurasi khusus untuk Single Page Application (SPA) seperti React. File `.htaccess` memberitahu Apache untuk mengarahkan semua request ke `index.html` sehingga React Router bisa handle routing.

## 📞 Hasil yang Diharapkan
Setelah upload `.htaccess`:
- ✅ Home page tetap working
- ✅ Navigation menu working
- ✅ Page refresh tidak 404
- ✅ Direct URL access working
- ✅ /v2/ secure paths working

Ini adalah solusi paling cepat dan mudah untuk mengatasi masalah 404 di Hostinger.