# Autentikasi — Masuk

Halaman login mengautentikasi pengguna melalui sesi Laravel Sanctum SPA. Modul bertanggung jawab untuk form, indikator proses, pesan kegagalan, dan permintaan API. Hak akses tidak ditentukan oleh UI.

## Alur

1. Ambil cookie CSRF dari `GET /sanctum/csrf-cookie` pada base URL backend.
2. Baca cookie `XSRF-TOKEN` lalu kirim `POST /api/v1/auth/login` dengan JSON `{ "username": "...", "password": "..." }`, header `X-XSRF-TOKEN`, serta `credentials: include`.
3. Setelah login berhasil, navigasi ke `/`. Shell mengambil profil dengan `GET /api/v1/auth/user`.
4. Keluar menggunakan `POST /api/v1/auth/logout` dengan cookie dan header CSRF.

Base URL API diset dengan `VITE_API_BASE_URL` (contoh lokal: `http://localhost:8010`). Jangan mencampur `localhost` dan `127.0.0.1`, karena cookie tidak akan berbagi host.

## Kode terkait

- `src/modules/auth/LoginPage.vue` — form responsif dan feedback.
- `src/modules/auth/api/auth.ts` — sesi, cookie CSRF, login, profil, dan logout.
- `src/app/App.vue` — pemeriksaan sesi untuk rute awal.
- `src/shared/api/navigation.ts` — mengambil menu dan submenu yang diizinkan dari API.
- API sumber kebenaran: `udev-api/routes/api/v1/auth.php` dan `AuthController`.

Kontrak profil backend membungkus data pengguna dengan properti `user` dan menyertakan `id`, `name`, `username`, `email`, serta `role`. Username tidak peka huruf besar/kecil; email tetap menjadi alamat kontak.
