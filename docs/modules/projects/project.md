# Project

Menu `Project > Daftar Project` menyediakan daftar project dengan infinite scroll dan search global di header. Form tambah/edit memuat pelanggan serta jenis project aktif dari master melalui pilihan yang dapat dicari dengan mengetik kode atau nama; nilai yang dikirim tetap foreign key `customer_id`/`project_type_id`. Tabel menampilkan kode bisnis relasi untuk dibaca, bukan mengganti ID relasi.

Kode project dibuat backend dalam format `U-PR-YYYY-NNNN`, status awal `Draft`, dan status lain: `Berjalan`, `Ditunda`, `Selesai`, serta `Dibatalkan`. Project tidak dihapus dari UI; gunakan status pembatalan.

Daftar desktop memakai tabel dan berubah menjadi kartu di layar kecil mengikuti pola daftar pelanggan. Modal tambah/edit memenuhi layar ponsel; tombol simpan tetap terlihat saat form digulir.

Kode terkait: `pages/ProjectPage.vue` mengatur API, pilihan master, modal, pencarian, dan infinite scroll. `components/list-data/ProjectList.vue`, `components/form/ProjectForm.vue`, dan `components/modal/ProjectFormModal.vue` dipisah sesuai tugas. Kontrak request/response ada di `api/projects.ts` dan `types/project.ts`.
