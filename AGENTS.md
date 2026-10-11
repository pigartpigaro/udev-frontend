# Aturan Frontend UDev

## 1. Aturan yang berlaku

- Ikuti `D:/APP/Docker/AGENTS.md` dan `../AGENTS.md`.
- Sebelum mengubah backend, baca juga `../udev-api/AGENTS.md`.
- Gunakan Vue 3, TypeScript, dan Vite. Jangan mengganti teknologi tanpa alasan yang disepakati.

## 2. Struktur proyek dan modul

- Ikuti struktur modular bertingkat:
  - Fitur: `src/modules/<menu>/<submenu>/`
  - Autentikasi: `src/modules/auth/`
  - Komponen dan layanan lintas fitur: `src/shared/`
  - Router, layout, dan tema aplikasi: `src/app/`
- Pisahkan halaman, form, daftar data, modal, API, dan tipe sesuai tanggung jawab. Pola umum submenu:

  ```text
  src/modules/<menu>/<submenu>/
  |-- pages/<Submenu>Page.vue
  |-- components/
  |   |-- form/<Submenu>Form.vue
  |   |-- list-data/<Submenu>List.vue
  |   `-- modal/<Submenu>Modal.vue
  |-- api/<submenu>.ts
  `-- types/<submenu>.ts
  ```

- Buat folder `form/`, `list-data/`, atau `modal/` bila fitur memilikinya. Jangan menumpuk halaman, form, daftar, dan modal dalam satu file.
- Halaman submenu mengoordinasikan state, API, daftar, dan modal. Komponen anak menerima props dan mengirim aksi melalui event.
- Bila form ditampilkan dalam modal, modal harus menjadi komponen tersendiri di `components/modal/`; pemanggil mengatur kapan modal dibuka atau ditutup.
- Gunakan nama file/komponen yang spesifik terhadap submenu. Komponen lintas submenu diletakkan di `src/shared/components/`, bukan diduplikasi.

## 3. Daftar data, pencarian, dan kode master

- Gunakan infinite scroll sebagai pola default daftar; hindari pagination bernomor kecuali ada kebutuhan khusus yang disepakati.
- Muat batch awal, lalu ambil batch berikutnya saat mendekati bagian bawah daftar. Tambahkan hasil tanpa menghapus item sebelumnya dan cegah permintaan ganda saat loading.
- Tampilkan status loading, error, dan akhir daftar. Reset daftar ke batch awal saat query pencarian berubah.
- Gunakan pagination/cursor yang disediakan API. Backend tidak perlu diubah jika API sudah mendukung batch lanjutan; jika belum, dokumentasikan perubahan kontrak yang diperlukan.
- Untuk daftar yang memerlukan pencarian, gunakan search global di `AppHeader` melalui `src/shared/composables/useGlobalSearch.ts`. Jangan menambah search kedua di toolbar tanpa kebutuhan UX khusus.
- Halaman daftar mengatur placeholder kontekstual dan meneruskan query ke parameter pencarian API. Bersihkan query saat berpindah submenu agar pencarian lama tidak terbawa.
- `WorkspaceLayout` memiliki header dan state search global. Halaman submenu membaca/menulis query melalui composable yang sama; pencarian hanya memengaruhi halaman aktif dan backend tetap menjadi sumber data filter.
- Tampilkan kode bisnis master sebagai identitas yang dapat dicari/dibaca. Jangan gunakan kode tampilan sebagai foreign key atau mengirim perubahan kode dari form; relasi memakai `id` dan backend membuat kodenya.

## 4. Integrasi API dan keamanan

- Backend adalah sumber kebenaran untuk autentikasi, validasi, otorisasi, navigasi, dan permission. UI boleh memberi feedback, tetapi tidak menggantikan pemeriksaan server.
- Untuk sesi Laravel Sanctum SPA, sertakan credentials dan token CSRF.
- Gunakan hostname yang sama secara konsisten untuk frontend dan API (`localhost` atau `127.0.0.1`) agar cookie Sanctum berfungsi.
- Simpan URL API di `VITE_API_BASE_URL`. Jangan menyimpan password, token, atau rahasia di kode maupun local storage.

## 5. UI dan aksesibilitas

- Buat UI mobile-first dan responsif untuk ponsel, tablet, dan desktop.
- Jaga aksesibilitas form: label yang terhubung ke input, pesan error, fokus keyboard, dan status loading.
- Gunakan komponen field bersama dari `src/shared/components/form/`: `FormField` untuk label/status validasi, `FormInput` untuk input biasa, `FormDateInput` untuk tanggal/periode, `FormTextarea` untuk teks panjang, dan `FormSelect` untuk pilihan satu nilai. Hindari menyalin markup serta style kontrol yang sama ke setiap submenu.
- Jangan gunakan elemen `<select>` native; `FormSelect` menjaga popup tetap di batas viewport desktop/mobile serta mendukung label, navigasi keyboard, dan status disabled.
- Untuk combobox/pencarian pilihan, batasi lebar ke kontainer/viewport dan tinggi berdasarkan viewport, aktifkan scroll di daftar opsi, bungkus teks panjang, dan buka ke atas bila ruang bawah tidak cukup. Jangan biarkan popup tertutup clipping modal atau keluar dari layar.
- Ikuti komponen, tema, dan gaya yang sudah digunakan; hindari perubahan UI yang tidak terkait dengan tugas.

### Standar tampilan desktop dan mobile

- Jadikan halaman Pelanggan sebagai acuan pola responsif modul: desktop memakai tabel, sedangkan layar kecil mengganti tabel menjadi kartu yang mudah dibaca dan dioperasikan. Terapkan pola ini pada daftar master dan transaksi; jangan mengandalkan tabel yang harus digeser mendatar di ponsel.
- Pertahankan informasi dan aksi penting yang tersedia di tabel desktop pada kartu mobile. Susun data sekunder sebagai detail ringkas, bungkus tombol aksi bila ruang sempit, dan cegah nama/kode panjang mendorong lebar layar.
- Gunakan breakpoint daftar `760px` untuk berpindah dari tabel ke kartu, breakpoint halaman `600px` untuk menghilangkan offset sidebar dan merapikan heading, serta breakpoint form/modal `520px` untuk tata letak ponsel. Perubahan breakpoint boleh mengikuti kebutuhan komponen, tetapi harus konsisten dan diuji pada rentang di sekitar breakpoint.
- Pertahankan shell yang sama: desktop memakai sidebar rail yang dapat melebar; mobile memakai sidebar drawer di bawah header, tertutup secara default, dengan backdrop dan penutupan setelah navigasi. Header mobile harus menjaga tombol menu dan profil tetap terlihat serta memberi kolom pencarian ruang menyusut tanpa bertumpuk.
- Pada mobile, modal form menjadi layar penuh dan kontennya dapat digulir. Header modal tetap mudah dijangkau; tombol simpan dibuat sticky bila form panjang. Modal konfirmasi dapat memakai bottom sheet. Beri ruang `safe-area-inset` untuk perangkat ber-notch/home indicator.
- Gunakan viewport dinamis (`dvh`) dengan fallback yang sesuai untuk tinggi modal/layar. Jangan mengunci scroll halaman atau modal hingga konten dan tombol aksi tidak bisa dijangkau saat keyboard virtual terbuka.
- Cegah overflow horizontal pada lebar minimum `320px`; scroll horizontal hanya dipakai untuk konten yang memang tidak dapat diringkas dan tidak menggantikan kartu pada daftar mobile. Pertahankan jarak, heading, tombol, dan permukaan kartu agar seirama dengan halaman Pelanggan.
- Periksa tampilan di lebar sekitar `320`, `360`, `390`, `600`, `760`, `768`, `1024` (tablet landscape), dan desktop sebelum menyatakan responsif. Cek header khususnya agar workspace, notifikasi, profil, dan pencarian tidak bertumpuk pada tablet landscape; cek drawer, daftar kosong/berisi, modal panjang, aksi, serta halaman yang memiliki tabel. Catat bila yang dijalankan hanya build dan belum verifikasi visual di browser/perangkat.

## 6. Menjalankan secara lokal dan berbagi lewat Git

- README dan rules harus membedakan dua alur yang didukung: Docker Compose seluruh stack (dijalankan dari `../udev-api/`) dan frontend lokal tanpa Docker.
- Untuk alur npm lokal, dokumentasikan versi Node yang didukung, `npm ci`, penyalinan `.env.example` menjadi `.env`, `npm run dev`, URL lokal, serta pengaturan `VITE_API_BASE_URL` menuju backend yang berjalan.
- Pastikan setup dapat diikuti dari clone Git yang bersih. Commit `package-lock.json` dan `.env.example`; jangan commit `.env`, `node_modules/`, `dist/`, cache, atau rahasia.
- Hindari ketergantungan pada path absolut mesin pengembang atau file lokal yang tidak dilacak Git.

## 7. Android Capacitor

- Target mobile Android menggunakan Capacitor 8 di `android/`; pertahankan alur browser/Docker agar tetap berjalan mandiri.
- Build/sinkronisasi dengan `npm run cap:sync`, buka project native dengan `npm run cap:open:android`, dan jalankan dengan `npm run cap:run:android`.
- Atur `VITE_API_BASE_URL` ke host API yang dapat dijangkau perangkat untuk build native; `localhost` pada ponsel menunjuk ke ponsel itu sendiri. Verifikasi cookie Sanctum, CORS, dan origin native sebelum menyatakan login mobile berfungsi.
- Cetak Bluetooth memerlukan plugin native yang dipilih berdasarkan model/protokol printer. Pertahankan cetak/PDF browser dan uji hasil thermal pada perangkat fisik.
- Baca `docs/modules/mobile/capacitor.md` sebelum mengubah konfigurasi native atau integrasi printer.

## 8. Dokumentasi dan pemeriksaan

- Dokumentasikan fitur kompleks di `docs/modules/<menu>/<submenu>.md` mengikuti hierarki backend. Perbarui README jika langkah setup atau menjalankan proyek berubah.
- Jangan menambahkan dependency tanpa kebutuhan jelas.
- Jalankan pemeriksaan build/typecheck yang tersedia setelah perubahan. Jangan menyatakan test suite dijalankan jika tidak.
