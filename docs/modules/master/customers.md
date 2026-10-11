# Master Pelanggan

Setiap pelanggan memiliki kode bisnis otomatis seperti `U-PL0001`, stabil, dan tidak diedit pengguna. Kode dapat dicari dan ditampilkan; relasi database tetap menggunakan `id`.

Halaman `Master Data > Pelanggan` menampilkan daftar pelanggan sebagai halaman utama submenu. Daftar menyesuaikan layar: tabel pada desktop dan kartu pada layar kecil. Tambah dan edit dilakukan melalui modal; komponen daftar, form, dan modal dipisah sesuai struktur frontend.

## Pencarian dan daftar

Pencarian memakai kolom global pada header (`useGlobalSearch`), bukan input duplikat di halaman. Placeholder berubah sesuai route aktif. Daftar memakai infinite scroll: frontend meminta batch melalui parameter `page` dan `per_page`, lalu menambahkan batch berikutnya saat penanda bawah daftar terlihat. Query dikirim sebagai parameter `search`; perubahan query menunggu jeda singkat dan memulai kembali dari batch pertama. Query dibersihkan saat berpindah halaman.

## API dan akses

- `GET /api/v1/customers?search=&page=1&per_page=20` untuk daftar batch terpaginasikan; tidak memerlukan perubahan backend untuk infinite scroll.
- `POST /api/v1/customers` untuk menambah pelanggan.
- `PATCH /api/v1/customers/{id}` untuk mengubah pelanggan.
- `DELETE /api/v1/customers/{id}` untuk menghapus pelanggan.

Request berjalan melalui klien API bersama yang menyertakan cookie sesi Sanctum dan token CSRF untuk operasi mutasi. Backend tetap memegang validasi dan otorisasi; halaman menampilkan error yang diterima dari API. Field payload: `name` (wajib), `contact_name`, `email`, `phone`, `address`, dan `is_active`.

## Kode terkait

- `pages/CustomersPage.vue` mengatur state, pencarian, infinite scroll, modal, dan pemanggilan API.
- `components/list-data/CustomerList.vue` menampilkan tabel/kartu serta aksi edit/hapus.
- `components/form/CustomerForm.vue` menangani input pelanggan.
- `components/modal/CustomerFormModal.vue` menjadi dialog tambah/edit.
- `api/customers.ts` dan `types/customer.ts` mendefinisikan kontrak API frontend.

Periksa kompilasi produksi dari folder frontend dengan `npm.cmd run build`.
