# Aplikasi Android dengan Capacitor

## Tujuan dan cakupan

Frontend Vue/Vite dibungkus sebagai aplikasi Android menggunakan Capacitor 8. Project Android native ada di `android/`; aplikasi web yang berjalan di browser dan stack Docker tetap menggunakan jalur yang sama seperti sebelumnya.

Kerangka Capacitor, platform Android, dan plugin `@delicity/capacitor-thermal-printer` (Capacitor 8) sudah ditambahkan. Plugin mendukung Bluetooth Classic/SPP serta BLE dan ESC/POS generik. Android `minSdkVersion` adalah 26 sesuai kebutuhan plugin. Perilaku tetap harus diuji pada printer dan perangkat Android sebenarnya.

## Persyaratan

- Node.js 22 atau lebih baru dan npm.
- JDK 21 untuk plugin printer Android.
- Android Studio serta Android SDK. Capacitor 8 memerlukan Android Studio versi 2025.2.1 atau lebih baru.
- Perangkat Android atau emulator untuk menjalankan aplikasi. Bluetooth printer nyata harus diuji pada perangkat fisik.

## Alur build Android

Dari folder `udev-frontend/`:

```powershell
npm ci
npm run cap:sync
npm run cap:open:android
```

`cap:sync` menjalankan build Vite lalu menyalin hasil `dist/` ke project Android. Di Android Studio, pilih perangkat/emulator dan tekan Run. Alternatif dari terminal setelah platform/perangkat siap:

```powershell
npm run cap:run:android
```

Perintah `npx cap add android` hanya diperlukan saat membuat ulang platform Android, bukan pada setup normal anggota tim.

## Koneksi API

Di Android, `localhost` menunjuk ke perangkat itu sendiri, bukan komputer yang menjalankan backend. Sebelum build untuk perangkat lokal, set `VITE_API_BASE_URL` ke alamat backend yang dapat dijangkau ponsel melalui jaringan, misalnya alamat IP LAN komputer pengembang dengan port API `8010`. Pastikan firewall Windows, CORS, konfigurasi Sanctum, dan cookie sesi mengizinkan origin aplikasi Capacitor. Jangan commit alamat LAN atau kredensial dalam `.env`.

Untuk uji tampilan web melalui browser HP (tanpa memasang APK), komputer dan HP harus di Wi-Fi yang sama. Atur `DEV_BIND_IP` di `udev-api/.env` ke IPv4 Wi-Fi komputer, tambahkan origin `http://<IP>:5173` ke `CORS_ALLOWED_ORIGINS`, dan `<IP>:5173` ke `SANCTUM_STATEFUL_DOMAINS`. Pertahankan `VITE_API_BASE_URL` kosong agar API memakai host yang sama. Jalankan `docker compose up -d app frontend` dari `udev-api/`, lalu buka `http://<IP>:5173` di HP. Port hanya perlu di-bind ke IP Wi-Fi tersebut; jangan expose ke jaringan publik.

Login berbasis cookie Sanctum dari origin native perlu diverifikasi tersendiri; konfigurasi browser localhost tidak otomatis mencakup origin Capacitor. Untuk rilis gunakan API HTTPS dengan konfigurasi origin/session yang sesuai.

## Printer thermal Bluetooth

Printer yang ditargetkan saat ini adalah VSC MP-58C, kertas 58 mm. Spesifikasi yang tersedia menyebut Bluetooth dan ESC/POS, tetapi tidak memastikan apakah setiap unit/varian memakai Bluetooth Classic/SPP atau BLE. Aplikasi Android mencoba menemukan keduanya. Plugin meminta izin Bluetooth runtime; printer perlu lebih dulu dipasangkan dari Pengaturan Bluetooth Android. Plugin pihak ketiga ini masih berstatus pengembangan aktif dan belum tervalidasi pada MP-58C, sehingga koneksi dan hasil cetak harus diuji sebelum dipakai operasional.

Pada halaman kuitansi pembayaran tersedia dua tampilan: **Kuitansi biasa** (dokumen formal untuk printer umum/A4) dan **Pratinjau struk POS** (layout ringkas seperti struk belanja untuk printer thermal 58 mm). Tombol cetak mengikuti tampilan yang sedang dipilih: A4 mencetak dokumen formal, sedangkan POS mencetak layout struk. Di aplikasi Android native dengan printer default, POS dikirim langsung sebagai ESC/POS; di browser, layout POS dibuka lewat dialog cetak browser.

Pada halaman kuitansi pembayaran di aplikasi Android:

1. Nyalakan MP-58C dan pasangkan dari Pengaturan Bluetooth Android (gunakan PIN pada label/manual bila diminta).
2. Tekan **Pilih printer**, izinkan Bluetooth, lalu pilih MP-58C dari daftar.
3. Aplikasi menghubungkan printer dan mencetak struk uji. Jika berhasil, printer disimpan sebagai default pada perangkat tersebut.
4. Tekan **Cetak POS** untuk kuitansi yang sah. Kuitansi yang dikoreksi/dibatalkan tidak dapat dicetak sebagai bukti sah.

Profil default disimpan lokal oleh plugin di perangkat, tidak di database/server. Jika MP-58C tidak muncul, pastikan sudah paired dan Bluetooth menyala; jika muncul tetapi koneksi gagal, varian perangkat mungkin memakai protokol berbeda dan perlu dicek manual/label unit. Cetak nyata belum dapat diverifikasi tanpa perangkat fisik.

## Berkas utama

- `capacitor.config.ts` — app ID, nama aplikasi, dan direktori web build.
- `android/` — project native Android Capacitor.
- `package.json` — perintah `cap:sync`, `cap:open:android`, dan `cap:run:android`.
