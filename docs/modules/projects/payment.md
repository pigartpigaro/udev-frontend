# Pembayaran Project

Submenu `Project > Pembayaran` digunakan untuk mencatat uang masuk pada invoice yang telah terbit. Satu invoice dapat menerima DP/uang muka, beberapa termin/cicilan, dan pelunasan. Setiap penerimaan langsung sah saat disimpan; data tidak diedit/dihapus. Koreksi mewajibkan alasan, mempertahankan catatan penerimaan, dan mengembalikan nominal ke sisa invoice.

Halaman memakai pencarian global pada header, infinite scroll, tabel desktop, serta kartu pada layar hingga 760px. Form terpisah dari halaman dan dibuka sebagai modal; di ponsel modal menjadi layar penuh dengan tombol simpan tetap mudah dijangkau. API dan tipe berada di `src/modules/projects/payment/`; komponen halaman, daftar, form, dan modal dipisah menurut tanggung jawabnya.

API privat memerlukan permission `projects.payments.manage`. Jalankan migrasi backend setelah update, kemudian refresh permission/menu melalui `AccessControlSeeder` bila database telah di-seed sebelumnya.

## Kuitansi

Halaman kuitansi menyediakan pilihan tampilan **Kuitansi biasa** dan **Pratinjau struk POS**. Kuitansi biasa memakai dokumen formal untuk cetak umum/A4 dan tombol **Cetak kuitansi A4** selalu mencetak format tersebut. Pratinjau POS memakai layout struk belanja 58 mm; pada aplikasi Android native, **Cetak POS** mengirim struk ESC/POS ke printer Bluetooth default. Pratinjau dapat dilihat di browser, tetapi cetak Bluetooth memerlukan aplikasi Android Capacitor. Keduanya memuat nomor transaksi, tanggal, pelanggan, invoice/project, jenis dan metode pembayaran, jumlah, serta informasi koreksi bila kuitansi dibatalkan.
