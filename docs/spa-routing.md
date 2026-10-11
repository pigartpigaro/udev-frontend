# Deploy Vue Router di aaPanel

Frontend UDev memakai Vue Router dengan `createWebHistory()`. Karena URL seperti `/projects/payments` ditangani oleh Vue di browser, web server harus mengirim `index.html` untuk URL aplikasi yang tidak menunjuk ke file fisik. Jika tidak, buka dari menu bisa berhasil tetapi reload atau membuka tautan langsung menghasilkan 404.

## Nginx (umum di aaPanel)

1. Build frontend dengan `npm run build` dan unggah isi `udev-frontend/dist/` ke document root site frontend.
2. Di aaPanel, buka **Website > site frontend > Config** (atau **URL Rewrite** bila tersedia).
3. Tambahkan aturan fallback berikut di dalam konfigurasi `server` site frontend:

   ```nginx
   location / {
       try_files $uri $uri/ /index.html;
   }
   ```

4. Simpan/reload konfigurasi Nginx, lalu uji dengan membuka URL submenu langsung dan menekan reload.

Jangan memasang fallback ini pada site/API Laravel. Terapkan hanya pada site yang menyajikan hasil build Vue. Jika konfigurasi sudah punya `location /`, gabungkan `try_files` ke blok tersebut; jangan membuat blok duplikat.

## Apache

Jika site frontend memakai Apache, buat atau pastikan file `.htaccess` berikut tersedia di document root hasil build dan `mod_rewrite` diizinkan:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## Verifikasi

- Buka halaman utama, lalu navigasikan ke submenu, misalnya `/master/customers`.
- Reload halaman submenu. Hasil yang benar adalah halaman Vue tampil kembali, bukan halaman 404 dari Nginx/Apache.
- Buka URL submenu yang sama di tab baru untuk memastikan direct navigation juga berfungsi.

Aturan repository ini menyiapkan panduan saja; konfigurasi site production di aaPanel perlu diterapkan pada server yang aktif.
