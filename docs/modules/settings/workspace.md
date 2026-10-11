# Pengaturan workspace

Halaman `/settings/workspace` menampilkan nama dan slug workspace aktif. Admin dapat memperbarui nama; slug hanya ditampilkan karena berfungsi sebagai identitas tetap. API membutuhkan membership workspace aktif dan permission `workspaces.manage`.

Pemilihan workspace tetap dilakukan melalui pemilih di header. Pembuatan workspace baru masih melalui command operator backend `udev:workspace:create`; halaman ini hanya mengatur workspace yang sedang dipilih.
