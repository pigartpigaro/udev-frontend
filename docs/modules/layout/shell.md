# Layout — Workspace shell

Workspace mengikuti pola visual aplikasi konten: bar kategori horizontal, header tetap dengan blur saat halaman discroll, pencarian di tengah, sidebar kiri, dan kartu menu responsif. Tema shell memakai permukaan gelap; palet brand hijau dan kunyit menjadi aksen.

## Perilaku responsif

- Desktop: sidebar berupa rail ikon, melebar ketika pointer masuk atau fokus keyboard berada di dalamnya. Tombol menu di header mengunci atau melepas lebar sidebar.
- Ponsel: sidebar tersembunyi secara default. Tombol menu membukanya sebagai drawer berlabel di atas konten; tombol menu, backdrop, atau pilihan menu menutup drawer kembali.
- Header memakai latar semi-transparan dengan blur dan tetap berada di atas saat scroll. Di desktop kolom pencarian berada di tengah; pada tablet (601–1200px) grid memberi kolom pencarian sisa lebar yang tersedia dan menyembunyikan teks profil. Pada tablet lebih sempit (601–900px), workspace menjadi tombol ikon dan notifikasi disembunyikan agar aksi kanan tidak bertumpuk. Di ponsel, kolom tengah menyusut tanpa menimpa tombol menu/profil.
- Kartu workspace disusun tiga kolom di desktop, dua kolom di tablet, dan satu kolom horizontal ringkas di ponsel. Filter kategori dan pencarian bekerja pada menu yang diterima dari backend.

## Komponen reusable

- `src/shared/components/layout/AppIcon.vue` — registry satu pintu untuk nama ikon Lucide; gunakan `<AppIcon name="search" />`.
- `AppHeader.vue` — brand, pencarian, notifikasi, profil, dan aksi sidebar/logout.
- `SearchBar.vue` — kolom pencarian dengan binding `query`.
- `AppSidebar.vue` — navigasi yang dirender dari menu backend dan aksi bantuan/logout.
- `src/modules/home/HomePage.vue` — menyusun komponen tersebut dan menampilkan kartu menu.

Tambah ikon baru di registry `AppIcon.vue`; komponen lain cukup meminta nama ikon agar gaya, ukuran default, dan stroke tetap konsisten.
