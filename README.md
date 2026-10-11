# UDev Frontend

Frontend internal Udumbara Informatika menggunakan Vue 3, TypeScript, Vite, Vue Router, dan ikon Lucide. Aplikasi menyediakan halaman masuk berbasis sesi Laravel Sanctum serta workspace responsif. Target Android disiapkan dengan Capacitor 8.

## Menjalankan dengan Docker Compose

Pastikan `.env` tersedia (buat dari `.env.example` bila belum ada), lalu jalankan semua service dari `udev-api/`:

```powershell
docker compose up -d --build
```

Buka `http://localhost:5173` atau `http://127.0.0.1:5173`. Jika `VITE_API_BASE_URL` kosong, frontend memakai hostname yang sama untuk API di port `8010`; tetap buka frontend dengan satu hostname secara konsisten agar cookie Sanctum sesuai. Untuk backend berbeda, isi `VITE_API_BASE_URL` dan sesuaikan CORS, Sanctum stateful domains, serta domain cookie session. Vite memakai polling agar perubahan file dari bind mount terdeteksi Docker Desktop di Windows. Log frontend: `docker compose logs -f frontend`.

Untuk menguji tampilan lewat browser HP pada Wi-Fi yang sama, atur `DEV_BIND_IP` di `udev-api/.env` ke alamat IPv4 Wi-Fi komputer dan tambahkan `http://<IP>:5173` ke `CORS_ALLOWED_ORIGINS` serta `<IP>:5173` ke `SANCTUM_STATEFUL_DOMAINS`. Biarkan `VITE_API_BASE_URL` kosong agar browser HP memakai host yang sama untuk API. Dari `udev-api/`, jalankan `docker compose up -d app frontend`, lalu buka `http://<IP>:5173` di HP. Jangan gunakan Wi-Fi publik; binding ini membuka port development ke perangkat lain pada interface tersebut.

Jika dependency frontend berubah (misalnya setelah menambah package), perbarui volume `node_modules` yang dipakai container lalu restart Vite dari `udev-api/`:

```powershell
docker compose exec frontend npm ci
docker compose restart frontend
```

Untuk menjalankan frontend tanpa Docker, diperlukan Node.js 20.19+ atau 22.12+ dan npm; gunakan `npm ci` lalu `npm run dev` dari folder ini.

## Aplikasi Android (Capacitor)

Untuk build Android diperlukan Node.js 22+, Android Studio, dan Android SDK. Project native berada di `android/`. Jalankan `npm ci`, lalu `npm run cap:sync` untuk build frontend dan menyalin aset ke project Android. Buka dengan `npm run cap:open:android`, atau jalankan ke perangkat/emulator tersambung dengan `npm run cap:run:android`.

Untuk mengakses backend dari ponsel, `VITE_API_BASE_URL` saat build harus menunjuk ke alamat backend yang dapat dijangkau perangkat (bukan `localhost` perangkat). Cetak POS Bluetooth native ditujukan untuk VSC MP-58C 58 mm melalui ESC/POS; pasangkan printer di pengaturan Android lalu pilih dan uji dari halaman kuitansi. Model/varian dan cetak fisik tetap perlu diverifikasi pada perangkat yang digunakan. Detail ada di `docs/modules/mobile/capacitor.md`.

## Struktur

- `src/modules/master/customers/` â€” halaman daftar pelanggan, form/modal, dan API master pelanggan.

- `src/app/` — router, aplikasi, dan tema global.
- `src/modules/auth/` — halaman masuk memakai username dan integrasi autentikasi.
- `src/modules/settings/users/` — halaman admin untuk membuat akun Anggota pada workspace aktif.
- `src/modules/home/` — shell dashboard awal.
- `src/shared/api/` — API menu dan utilitas lintas fitur.
- `src/shared/components/layout/` — komponen reusable header, pencarian, sidebar, dan ikon.
- `docs/modules/auth/login.md` — alur dan kontrak API login.
- `docs/modules/layout/shell.md` — aturan shell responsive dan penggunaan komponen layout.

Login mendapatkan cookie CSRF dari `/sanctum/csrf-cookie`, lalu mengirim username dan password ke `POST /api/v1/auth/login` beserta cookie dan header CSRF. Sesi tidak disimpan di local storage. Akun dibuat oleh admin di menu **Pengaturan > Pengguna**; pendaftaran publik tidak tersedia. Otorisasi dan validasi tetap menjadi tanggung jawab backend. Halaman daftar yang membutuhkan pencarian menggunakan kolom search global pada header; detail master pelanggan ada di `docs/modules/master/customers.md`.

Setelah login, frontend memuat daftar workspace dari `GET /api/v1/workspaces`, menyediakan pemilih workspace pada header, dan mengirim `X-Workspace-ID` pada request API berikutnya. ID aktif disimpan di local storage hanya sebagai preferensi tampilan; backend tetap memvalidasi membership pada setiap request. Detail alur ada di backend `docs/modules/workspaces.md`.

Master jenis proyek berada di `src/modules/master/project-types/`; dokumentasinya ada di `docs/modules/master/project-types.md`.

Modul Project berada di `src/modules/projects/project/`; dokumentasinya ada di `docs/modules/projects/project.md`.

Pengaturan nama workspace aktif tersedia di `src/modules/settings/workspace/`, sedangkan konfigurasi izin role Member tersedia di `src/modules/access-control/roles/`. Detailnya ada di `docs/modules/settings/workspace.md` dan `docs/modules/access-control/roles.md`.

Admin membuat akun anggota melalui `src/modules/settings/users/`; username digunakan untuk login dan akun baru hanya tergabung ke workspace aktif. Detail alur login dan API ada di `docs/modules/auth/login.md` dan `../udev-api/docs/modules/authentication.md`.

Pemeriksaan produksi: `npm.cmd run build`.

### Deploy production dengan Vue Router

Frontend memakai Vue Router history mode. Saat membuka URL submenu secara langsung atau me-reload halaman, web server harus mengarahkan path yang bukan file ke `index.html`; tanpa aturan ini server akan memberi 404 sebelum Vue sempat memuat router. Pada aaPanel, pastikan document root mengarah ke folder `dist/` hasil build dan pasang aturan SPA untuk site frontend. Panduan Nginx/Apache ada di [`docs/spa-routing.md`](docs/spa-routing.md).
