# Master Jenis Proyek

Halaman `Master > Jenis Proyek` mengelola kategori aplikasi sebagai master data. Kode jenis proyek dibuat otomatis backend dengan prefix `U-TP`, misalnya `U-TP0001`, dan tidak dapat diedit. Relasi tetap menggunakan `id` internal.

Tipe awal: Aplikasi Web, Aplikasi Mobile, Aplikasi Desktop, dan Pengembangan Aplikasi Lainnya. Kategori terakhir dipakai untuk pekerjaan aplikasi di luar tiga platform tersebut. Backend menambahkan tipe awal melalui seeder secara idempoten.

Daftar memakai pencarian global pada header dan infinite scroll. Tampilan desktop menggunakan tabel, sedangkan layar kecil menggunakan kartu seperti daftar pelanggan. Form tambah/edit memakai modal layar penuh di ponsel dengan tombol simpan yang tetap mudah dijangkau. API menggunakan `GET /api/v1/master/project-types?search=&page=1&per_page=20`; kata kunci mencari kode/nama/deskripsi. Tambah dan edit memakai `POST` dan `PATCH` pada endpoint yang sama. Status tipe bisa dinonaktifkan tanpa menghapus riwayat.

Kode terkait:

- `pages/ProjectTypesPage.vue` mengatur pencarian, pemuatan batch, modal, dan API.
- `components/list-data/ProjectTypeList.vue` menampilkan kode, nama, deskripsi, status, dan aksi edit.
- `components/form/ProjectTypeForm.vue` serta `components/modal/ProjectTypeFormModal.vue` mengelola tambah/edit.
- `api/projectTypes.ts` dan `types/projectType.ts` mendefinisikan kontrak frontend.
