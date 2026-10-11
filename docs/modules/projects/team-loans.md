# Kasbon Tim

Halaman `/finance/team-loans` mencatat kasbon anggota workspace dan cicilan/pelunasannya. Saldo awal dianggap Rp0. Saldo kas tersedia dihitung dari penerimaan invoice sah + cicilan kasbon yang diterima - pengeluaran sah - kasbon yang dicairkan. Pencairan kasbon adalah piutang, bukan biaya project.

Daftar memakai infinite scroll dan pencarian global di header. Halaman menampilkan saldo kas, total piutang, sisa setiap pinjaman, serta ringkasan sisa kasbon per anggota. Form memakai komponen field bersama, tabel desktop dan kartu mobile. Permission serta validasi nominal tetap diperiksa API.

API yang dipakai: `GET /api/v1/team-loans`, `/summary`, `/members`, `GET /{id}`, `POST /`, `POST /{id}/repayments`, dan endpoint koreksi `/void`. Skema payload lengkap ada di `udev-api/docs/modules/projects/team-loans.md`.
