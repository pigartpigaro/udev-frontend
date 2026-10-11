# Dashboard

Halaman beranda (`/`) menampilkan ringkasan keuangan bulan berjalan dan kartu akses menu yang dikirim backend melalui navigasi.

## Ringkasan keuangan

- Data memakai `GET /api/v1/projects/reports/financial` dengan rentang tanggal dari hari pertama bulan ini sampai hari ini.
- Kartu menampilkan invoice terbit, penerimaan sah, pengeluaran (termasuk operasional), sisa tagihan terkini, dan arus kas bersih. Perhitungan mengikuti endpoint laporan agar konsisten dengan menu `Laporan > Laporan Keuangan`.
- Ringkasan hanya dimuat jika navigasi akun memuat `reports.financial.index` (permission laporan). Akun tanpa akses tetap dapat menggunakan kartu menu yang tersedia.
- Tombol `Lihat laporan` membuka halaman laporan rinci. Jika pemuatan gagal, dashboard menyediakan aksi coba lagi.
- Jika akun memiliki menu `projects.index`, dashboard meminta total status `completed`, `active`, dan `on_hold` dari endpoint daftar project. `Masih proses` menjumlahkan project berjalan dan ditunda; draft dan dibatalkan tidak dihitung.

## Komponen dan pemeriksaan

- `src/modules/home/HomePage.vue` mengelola akses, pemuatan data, status, filter menu, dan kartu workspace.
- `src/modules/home/components/summary/FinancialDashboardSummary.vue` menampilkan KPI dan perbandingan visual penerimaan/pengeluaran secara responsif.
- `src/modules/home/components/summary/ProjectDashboardSummary.vue` menampilkan jumlah project selesai dan jumlah project berjalan/ditunda.
- Periksa dengan `npm run build`; validasi tampilan langsung pada lebar mobile dan desktop setelah server frontend berjalan.
