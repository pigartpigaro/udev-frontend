# Pengaturan — Pengguna

Halaman ini dipakai admin workspace untuk membuat akun Anggota baru. Pendaftaran publik tidak tersedia.

## Alur

1. Admin memilih **Pengaturan > Pengguna** dari navigasi workspace. Halaman utama menampilkan anggota workspace aktif dan mendukung pencarian header serta infinite scroll.
2. Tab **Tambah pengguna** mengirim nama, username, email kontak, dan kata sandi awal ke `POST /api/v1/access-control/users`.
3. Backend memvalidasi nilai unik, memastikan role admin dan permission `users.manage`, lalu membuat akun sebagai Anggota pada workspace aktif saja.
4. Kolom **Role workspace** mengubah role keanggotaan melalui `PATCH /api/v1/access-control/users/{userId}/role`. Role hanya berlaku pada workspace aktif; akun sendiri dan pemilik workspace tidak bisa diubah dari daftar.
5. Kata sandi tidak pernah dikembalikan oleh API; admin membagikan kredensial awal melalui kanal aman.

## Kode terkait

- `src/modules/settings/users/pages/UsersPage.vue` — state halaman, status sukses/gagal, dan submit.
- `src/modules/settings/users/components/form/UserForm.vue` — form buat akun.
- `src/modules/settings/users/components/list-data/UsersList.vue` — tabel desktop dan kartu mobile dengan pemilih role.
- `src/modules/settings/users/api/users.ts` — kontrak API frontend.
- Backend: `udev-api/routes/api/v1/access-control/users.php` dan `UserController`.

Username yang dapat dipakai saat login panjangnya 3–32 karakter dan hanya berisi huruf, angka, titik, `_`, atau `-`. Password awal minimal 6 karakter. Role yang tersedia adalah Admin dan Anggota; hak fitur masing-masing role tetap diatur pada halaman **Hak Akses**.
