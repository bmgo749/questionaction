# Gmail App Password Troubleshooting Guide

## Masalah yang Terjadi
App Password Gmail `gtuwwujwnhqxdgzl` untuk `bmgobmgo749@gmail.com` tidak dapat diautentikasi oleh server Gmail SMTP.

**Error yang muncul:**
```
535-5.7.8 Username and Password not accepted
https://support.google.com/mail/?p=BadCredentials
```

## Solusi Langkah demi Langkah

### 1. Periksa 2-Step Verification
1. Buka https://myaccount.google.com/security
2. Pastikan "2-Step Verification" dalam status **ON**
3. Jika belum aktif, aktifkan terlebih dahulu

### 2. Buat App Password Baru
1. Buka https://myaccount.google.com/apppasswords
2. Login dengan akun `bmgobmgo749@gmail.com`
3. Pilih "Mail" sebagai aplikasi
4. Pilih "Other (custom name)" untuk device, ketik "QuestionAction"
5. Klik "Generate"
6. **Penting:** Salin App Password 16 karakter yang baru (contoh: `abcd efgh ijkl mnop`)
7. Simpan tanpa spasi: `abcdefghijklmnop`

### 3. Update Konfigurasi Email
App Password yang baru harus diupdate di file berikut:
- `.env` file (untuk development)
- `vercel.json` (untuk deployment)
- `.github/workflows/deploy.yml` (untuk GitHub Actions)
- `.github/workflows/deploy-simple.yml` (untuk deployment sederhana)
- `deploy.config.js` (untuk konfigurasi global)

### 4. Verifikasi Akun Gmail
Pastikan akun Gmail memenuhi syarat:
- ✅ 2-Step Verification aktif
- ✅ App Passwords dapat dibuat
- ✅ Tidak ada pembatasan pada akun
- ✅ Gmail account dalam status normal (bukan suspended)

### 5. Test Alternatif
Jika masih gagal, coba:

#### Opsi A: Buat App Password baru dengan nama berbeda
1. Hapus App Password lama di Google Account
2. Buat App Password baru dengan nama "Queit-Email"
3. Update semua konfigurasi dengan password baru

#### Opsi B: Gunakan akun Gmail berbeda
Jika akun `bmgobmgo749@gmail.com` bermasalah:
1. Buat akun Gmail baru
2. Aktifkan 2-Step Verification
3. Buat App Password
4. Update konfigurasi email

## Konfigurasi Saat Ini

**Email User:** bmgobmgo749@gmail.com
**App Password:** gtuwwujwnhqxdgzl (16 karakter)
**Status:** ❌ Tidak dapat diautentikasi

## Format App Password yang Benar

App Password Gmail biasanya diberikan dalam format dengan spasi:
```
gtuw wujw nhqx dgzl
```

Tapi harus disimpan tanpa spasi di aplikasi:
```
gtuwwujwnhqxdgzl
```

## Test Koneksi Manual

Untuk memverifikasi App Password, Anda bisa test secara manual:

```bash
# Test SMTP connection dengan telnet
telnet smtp.gmail.com 587

# Atau gunakan openssl
openssl s_client -connect smtp.gmail.com:465 -crlf
```

## Next Steps

1. **Segera buat App Password baru** di https://myaccount.google.com/apppasswords
2. **Update semua file konfigurasi** dengan App Password yang baru
3. **Test email** menggunakan `/api/test-email` endpoint
4. **Verifikasi email sign up** akan otomatis berfungsi setelah konfigurasi benar

## Status Email Features

- ✅ Konfigurasi nodemailer sudah benar
- ✅ Endpoint test email sudah tersedia
- ✅ Email verification untuk sign up sudah diimplementasi
- ❌ **App Password perlu diperbaiki**

Setelah App Password diperbaiki, semua fitur email akan langsung berfungsi:
- Email verifikasi saat sign up
- Test email ke bmgobmgo749@gmail.com
- Password reset email (jika diimplementasi)