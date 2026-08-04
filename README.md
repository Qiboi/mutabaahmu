# Mutabaah Student Monitoring System — Stage 1–18 (+ Stage 19 draft, belum diverifikasi)

**Stage 1–17** (lihat riwayat di bawah) dan **Stage 18** (konsistensi penuh toast & konfirmasi
ke Kenaikan Kelas, Pengumuman, Tahun Ajaran) sudah selesai dan terverifikasi penuh.

**Stage 19** (theming, redesign login, fix layout sidebar, upgrade UX) sudah dikerjakan tapi
**belum diverifikasi** — lihat catatan di bagian bawah sebelum menganggapnya selesai.

## Stage 19 — Theming, Redesign Login, Fix Layout, Upgrade UX (DRAFT — BELUM DIVERIFIKASI)

> ⚠️ **Catatan jujur**: seluruh perubahan di stage ini dikerjakan lewat sesi chat berbasis kode
> yang di-paste manual, **bukan** dengan akses langsung ke repo asli. Belum ada satu pun dari
> `tsc --noEmit`, `eslint .`, atau `npm run build` yang benar-benar dijalankan terhadap perubahan
> ini. Jangan tandai stage ini selesai sampai ketiganya dijalankan dan lolos secara langsung di
> mesin Anda.

**Theming brand (selaras nurulhasan.sch.id)**:
- Token warna `gold` ditambahkan penuh (50/100/400/500/600/700) di `globals.css`, direservasi
  khusus untuk elemen "Berprestasi" (bukan pengganti emerald/blue/amber yang sudah semantik)
- Varian `gold` di `Badge`
- `prayer_30_days` di `constants/achievements.ts` jadi achievement tier gold (satu-satunya,
  hasil keputusan eksplisit, bukan tebakan)
- Badge streak "hari beruntun" di `TeacherClassOverview` pakai gold

**Redesign halaman login** (`app/login/page.tsx`): split-screen di layar besar — panel kiri
gradient emerald dengan pola geometris Islami 8-sudut + 3 highlight fitur, panel kanan form.
Mobile: panel kiri collapse jadi header ringkas, tetap satu kolom.

**Fix layout sidebar** (`DashboardShell`): sidebar desktop sebelumnya ikut memanjang mengikuti
tinggi konten (tabel panjang → tombol logout ikut turun jauh dari viewport). Diperbaiki dengan
`sticky top-0 h-screen` — sidebar sekarang terkunci ke tinggi viewport, nav internal yang
scroll sendiri kalau perlu. Header juga dibuat sticky.

**Upgrade UX 4 komponen prioritas tinggi**:
- `ReportCalendar` — animasi transisi bulan, hover-lift hari terisi, ring gold untuk "hari ini"
- `StatCard` — icon container gradient, hover lift, prop `trend` opsional (belum di-wire ke data)
- `DailyReportForm` — checkbox sholat/kebiasaan diganti jadi chip toggle dengan ikon kontekstual
  (Sunrise/Sun/SunMedium/Sunset/Moon untuk 5 waktu sholat)
- `AchievementBadge`/`AchievementGallery` — entrance animation staggered, glow pulsing untuk
  badge gold

**Fix aksesibilitas** (regresi dari perubahan di atas, ditemukan & diperbaiki di sesi yang sama):
`ToggleChip` pada `DailyReportForm` awalnya menyembunyikan checkbox asli (`sr-only`) tanpa
indikator fokus visual pengganti untuk pengguna keyboard. Diperbaiki dengan
`has-[:focus-visible]:ring-2` di wrapper label.

**Konsistensi toast di 4 dialog create/edit** yang sebelumnya menutup diam-diam tanpa
konfirmasi: `ClassFormDialog`, `StudentFormDialog`, `UserFormDialog`, `UserEditDialog`.
(`AcademicYearFormDialog` dan `SchoolSettingsForm` ternyata sudah punya feedback sukses
sebelumnya, jadi tidak disentuh.)

**Fix `tsconfig.json`**: `baseUrl` dihapus (dideprecate, akan berhenti berfungsi di TS 7.0),
digantikan path relative eksplisit (`./app/*`, dst.) di setiap entri `paths` — perilaku alias
`@/...` tidak berubah, tapi sekarang future-proof.

**Belum dikerjakan di stage ini** (dari daftar 5 prioritas UX yang diidentifikasi, cuma 1 yang
dipilih untuk dikerjakan): notifikasi belum bisa diklik ke halaman terkait, laporan ganda masih
baru ketahuan setelah submit (bukan proaktif), belum ada "Pilih Semua/Kosongkan" di kenaikan
kelas, search belum punya tombol clear.

**Verifikasi**: ⚠️ **belum dijalankan** — `tsc --noEmit`, `eslint .`, dan `npm run build` perlu
dijalankan manual sebelum stage ini dianggap selesai dan aman untuk di-deploy.

## Stage 18 — Konsistensi Toast & Konfirmasi

Menutup gap yang ditemukan di review Stage 17: pola toast/konfirmasi yang dibangun sebelumnya
baru diterapkan ke 3 halaman list, belum ke fitur lain yang juga butuh.

**`ClassPromotionView` (Kenaikan Kelas)** — perubahan paling penting: sebelumnya tombol
"Pindahkan Siswa" **langsung eksekusi tanpa konfirmasi apa pun**, padahal ini aksi yang
memindahkan banyak siswa sekaligus (dampaknya lebih besar dari toggle status satu siswa).
Sekarang memakai `ConfirmDialog` yang menampilkan ringkasan jelas ("X siswa akan dipindahkan
dari kelas A ke kelas B") sebelum benar-benar dieksekusi, plus toast konfirmasi hasil.

**`AnnouncementForm`** — toast saat pengumuman berhasil dipublikasikan (menggantikan kotak
sukses inline yang redundan; kotak error tetap dipertahankan untuk visibilitas persisten).

**`AcademicYearList` & `AcademicYearFormDialog`** — toast saat tahun ajaran berhasil dibuat
maupun diaktifkan.

**Catatan teknis**: sempat hampir mengulangi kesalahan yang sama seperti sebelumnya (menambahkan
komentar `eslint-disable` untuk rule `react-hooks/exhaustive-deps` yang tidak terdaftar di
config ESLint minimal project ini) — disadari dan diperbaiki sebelum verifikasi, bukan setelah
lolos ke tahap berikutnya.

**Verifikasi**: `tsc --noEmit` ✅, `eslint .` ✅, `npm run build` production **berhasil lagi**
(41 route).

## Stage 17 — 9 Perbaikan UX

Dikerjakan berurutan dari yang paling mudah ke paling sulit:

1. **Autofocus dialog** — `Dialog` (komponen dasar) otomatis fokus ke field pertama saat dibuka,
   berlaku untuk **semua** dialog form tanpa perlu wiring manual per dialog.
2. **Touch target mobile** — varian ukuran `icon` baru di `Button` (44×44px, standar minimum
   WCAG/Apple HIG), diterapkan ke tombol Ubah dan navigasi Pagination/kalender yang sebelumnya
   di bawah standar.
3. **Debounce search** — hook baru `useDebouncedValue()`, diterapkan ke `StudentList`,
   `ClassList`, `UserList`. Sebelumnya tiap ketukan huruf langsung memicu request API baru;
   sekarang menunggu jeda ~350ms setelah berhenti mengetik.
4. **Loading per-route** — satu `app/dashboard/loading.tsx` otomatis berlaku untuk **seluruh**
   halaman dashboard (konvensi Next.js App Router — tidak perlu file terpisah per halaman).
5. **Konfirmasi aksi destruktif** — komponen `ConfirmDialog` baru, diterapkan ke tombol
   "Nonaktifkan" di `StudentList`, `ClassList`, `UserList` (hanya arah nonaktifkan yang perlu
   konfirmasi — mengaktifkan kembali tidak berisiko).
6. **Peringatan belum tersimpan** — helper `guardedClose()`, diterapkan ke kelima dialog form
   (Siswa, Kelas, Tahun Ajaran, Tambah Akun, Ubah Akun): menutup dialog dengan perubahan yang
   belum disimpan akan meminta konfirmasi terlebih dahulu.
7. **Sesi habis (401 global)** — `apiClient`/`uploadFile` sekarang mendeteksi status 401 dan
   redirect otomatis ke `/login?callbackUrl=...`, alih-alih membiarkan pesan error tercecer di
   tiap komponen.
8. **Toast notifikasi** — sistem baru dari nol (`ToastProvider`/`useToast`, context + portal),
   dipasang di root layout, dipakai untuk feedback aksi toggle status di 3 halaman list.
9. **Optimistic UI update** — `useUpdateStudent`/`useUpdateClass`/`useUpdateUser` sekarang
   memakai pola `onMutate`/`onError`/`onSettled` TanStack Query: UI berubah instan saat toggle
   status, otomatis rollback kalau server menolak.

**Detail teknis yang ditemukan saat implementasi #9**: `IStudent`/`IClassRoom` adalah interface
Mongoose Document penuh (mensyaratkan method seperti `.save()`), sementara objek hasil merge
optimistic update cuma objek JSON biasa — TypeScript menolak ini (benar secara teknis). Diatasi
dengan type assertion yang konsisten dengan pola yang sudah ada di seluruh app (data dari API
selalu diperlakukan sebagai `IStudent`/`IClassRoom` walau secara runtime cuma JSON polos, karena
tidak pernah dikonversi balik jadi Mongoose Document sungguhan di sisi client).

**Verifikasi berlapis**:
- `tsc --noEmit` ✅, `eslint .` ✅
- `npm run build` production **berhasil lagi** (41 route)
- **`guardedClose()` diuji langsung** dengan 4 skenario (dirty+konfirmasi, dirty+batal, tidak
  dirty, membuka dialog) — semua lolos
- **Debounce diuji langsung** dengan simulasi 5 ketukan cepat — hanya 1 nilai final yang
  ter-debounce, bukan 5
- **Optimistic update + rollback diuji langsung** dengan `QueryClient` sungguhan (bukan mock) —
  update optimis diterapkan, item lain tidak terpengaruh, rollback mengembalikan state semula —
  ketiganya lolos
- Fix export PDF dari sesi sebelumnya **dicek ulang, masih utuh**

> Catatan: seluruh "diuji langsung" di atas (dan di stage-stage lain) adalah verifikasi manual
> ad-hoc yang dijalankan sekali saat development — bukan automated test suite permanen yang
> tersimpan sebagai file test dan jalan otomatis di CI. Lihat bagian "Belum dibangun" di bawah.

## Stage 16 — Grafik per Kelas & Detail Kelas

**Halaman baru** `/dashboard/admin/classes/[id]` — diakses dengan klik nama kelas di halaman
Kelas. Menampilkan:
- **Info kelas**: tingkat, tahun ajaran, jumlah siswa, **wali kelas**, dan **guru pendamping**
- Stat card + daftar siswa belum lapor hari ini + konsistensi terbaik (pakai ulang komponen
  `TeacherClassOverview` yang sudah ada dari fitur dashboard guru)
- **Grafik tren 14 hari** khusus kelas ini (completion rate & rata-rata poin, dua sumbu Y)
- **Daftar seluruh siswa** di kelas tersebut (foto, nama, jenis kelamin)

**Backend baru**: `dashboardRepository.getClassTrend()` (aggregasi MongoDB per kelas),
route `/api/dashboard/class-trend`, dan `classRepository.findById()` diperluas untuk
mem-populate `teacherIds` (guru pendamping) dan `academicYearId` (label tahun ajaran) —
sebelumnya cuma `homeroomTeacherId` yang di-populate.

**Detail teknis yang diperhatikan**: sempat salah pakai hook `useClasses()` (list, tanpa
populate lengkap) untuk halaman detail — cepat disadari dan diperbaiki dengan hook baru
`useClass(id)` yang memakai endpoint `GET /api/classes/[id]` yang sudah punya populate penuh,
alih-alih memindai 100 baris list untuk mencari satu kelas yang cocok (juga lebih efisien).

**Verifikasi**: `tsc --noEmit` ✅, `eslint .` ✅, `npm run build` production **berhasil lagi**
(41 route), audit populate/toString ✅.

> ⚠️ **Perlu dicek ulang**: Stage 15 mencatat 40 route sebelum stage ini, dan stage ini
> menambahkan 2 route baru (`/dashboard/admin/classes/[id]` + `/api/dashboard/class-trend`).
> 40 + 2 seharusnya 42, bukan 41 seperti tertulis di atas. Kemungkinan salah hitung manual saat
> menulis catatan ini — jalankan `npm run build` dan pakai angka route yang benar-benar tampil
> di output, bukan angka di atas.

## Stage 15 — Menghilangkan Kebutuhan `--legacy-peer-deps`

**Penyebab asli**: `next-auth@5.0.0-beta.25` (versi yang dipakai sejak Stage 1) baru menyatakan
dukungan peer-dependency untuk Next.js `^14`/`^15` di `package.json`-nya — belum untuk Next 16,
meski secara fungsional 100% kompatibel. Ini bukan bug di project kita, tapi keterlambatan
metadata di package upstream.

**Solusi**: dicek langsung lewat `npm view next-auth versions` dan `npm view <versi> peerDependencies`
untuk setiap versi beta terbaru — ditemukan bahwa **`next-auth@5.0.0-beta.30` ke atas sudah
resmi menambahkan `^16.0.0`** ke peer-dependency range-nya. Project di-upgrade ke
`5.0.0-beta.32` (versi beta terbaru saat ini).

**Verifikasi paling ketat yang bisa dilakukan**: `node_modules` dan `package-lock.json` dihapus
total, lalu `npm install` dijalankan **tanpa flag apa pun** — berhasil sepenuhnya, nol error
ERESOLVE. Dilanjutkan `tsc --noEmit`, `eslint .`, `npm run build` production (40 route, berhasil),
dan re-verifikasi bahwa fix export PDF (trace manifest font `.afm`) dari Stage 14 tidak
ke-*regress* akibat upgrade ini — juga dicek ulang bahwa quirk type-augmentation Auth.js v5
(`@auth/core/types` alih-alih `next-auth`) masih berlaku sama di versi baru.

**Cara install sekarang** (perhatikan: tanpa flag):
```bash
npm install
```

**Catatan jujur soal `npm audit`**: setelah install bersih, `npm audit` melaporkan 23
vulnerability (naik dari yang sebelumnya terlihat 9 — audit database terus diperbarui seiring
waktu). Semua ditelusuri dan dikonfirmasi **bukan disebabkan oleh upgrade `next-auth` ini** —
semuanya dependency transitif dari `next` sendiri (postcss/sharp), `@vercel/blob` (undici), dan
`exceljs` (brace-expansion/minimatch lewat rantai `archiver`). Tidak dijalankan
`npm audit fix --force` karena solusinya akan men-downgrade `next` ke versi sangat lama
(`next@9.3.3`) yang jelas bukan pilihan wajar untuk project berbasis Next.js 16.

## Stage 14 — Perbaikan Detail

### 1. Privasi Poin di Riwayat Orang Tua
Kalender riwayat laporan (`ReportCalendar`) sekarang punya mode `hidePoints` yang aktif khusus
di halaman parent: semua hari yang sudah diisi laporan ditampilkan dengan **warna seragam**
(bukan gradien berdasarkan poin), dan dialog detail tidak lagi menampilkan angka "Total Poin".
Tujuannya: menghindari rasa kompetitif antar orang tua yang bisa mendorong pengisian laporan
yang tidak jujur demi skor tinggi. Guru tetap melihat poin seperti biasa (tidak berubah).

### 2. Fix Error Export PDF — Root Cause Ditemukan & Diperbaiki
**Bug**: `pdfkit` memuat font standar (Helvetica, dll.) lewat
`fs.readFileSync(__dirname + "/data/*.afm")` **saat runtime**, bukan lewat `import` statis.
Next.js tidak bisa mendeteksi pola ini secara otomatis saat men-*trace* dependency untuk build
production, sehingga file font tersebut **hilang diam-diam** dari bundle production/deployment
(walau ada dan bekerja normal di `node_modules` lokal). Ini menjelaskan kenapa export PDF bisa
gagal di deployment sungguhan padahal kode PDF-nya sendiri benar.

**Fix**: menambahkan `outputFileTracingIncludes` di `next.config.ts` untuk secara eksplisit
menyertakan `node_modules/pdfkit/js/data/**/*` pada trace route `/api/exports/**/*`.

**Verifikasi konkret** (bukan cuma baca dokumentasi): dicek langsung isi `.nft.json` (trace
manifest) hasil `next build` — **sebelum fix: 0 dari 627 file yang di-trace adalah font**,
**setelah fix: 14 file font `.afm` eksplisit tersertakan**. Diverifikasi ulang sekali lagi
setelah semua perubahan Stage 14 lainnya untuk memastikan fix tidak ke-*regress*.

### 3. Manajemen Akun — Bisa Diedit Penuh (Termasuk Password)
`UserEditDialog` baru: ubah nama, email, telepon, status, dan **ganti password** (opsional —
dikosongkan berarti password tidak berubah). Password baru ditampilkan/disembunyikan dengan
toggle mata. Email dicek keunikannya sebelum disimpan (tidak boleh bentrok dengan akun lain).

### 4. Navigasi: Top Nav → Sidebar
`DashboardShell` dirombak dari nav bar horizontal menjadi **sidebar kiri** dengan ikon per menu,
highlight otomatis untuk halaman aktif (`usePathname`), dan drawer mobile (tombol hamburger)
untuk layar kecil. Tetap satu komponen yang sama dipakai semua role — hanya daftar link yang
beda per role, seperti sebelumnya.

### 5. Toggle Status — Konsisten di Semua Halaman
Sebelumnya `StudentList` dan `ClassList` cuma punya tombol "Arsipkan" satu arah (begitu
diarsipkan, tidak ada cara mengaktifkan kembali dari UI!). Sekarang keduanya punya tombol
toggle "Aktifkan"/"Nonaktifkan" yang konsisten dengan pola yang sudah ada di `UserList`.
`ClassList` juga sekarang menampilkan kolom Status yang sebelumnya tidak ada sama sekali.

**Bug tersembunyi yang ditemukan sekaligus diperbaiki**: mengubah status `isActive` siswa lewat
endpoint update biasa **tidak memicu** `recomputeStudentCount()` di kelasnya — jadi jumlah siswa
per kelas bisa jadi tidak akurat setiap kali status di-toggle (bukan cuma saat pindah kelas).
Diperbaiki di `student.service.ts`.

### 6. Proteksi URL "/"
Sebelumnya `/` sama sekali tidak punya halaman (404). Sekarang `app/page.tsx` mengarahkan
otomatis: ke `/login` kalau belum login, atau ke dashboard sesuai role kalau sudah login.

**Verifikasi menyeluruh**: `tsc --noEmit` ✅, `eslint .` ✅, `npm run build` production
**berhasil lagi** (40 route, +1 untuk `/`), audit pola populate/toString ✅, verifikasi konkret
trace manifest PDF ✅ (dicek dua kali, sebelum & sesudah perubahan lain).

## Stage 13 — Pagination UI (Konsisten di Semua List)

**Audit menyeluruh** terhadap semua halaman list untuk menentukan mana yang benar-benar butuh
pagination (bukan asal ditempel di semua tempat):

| Halaman/Komponen | Sebelumnya | Sekarang |
|---|---|---|
| `StudentList` (admin) | `limit: 50` tetap, sisa data tersembunyi diam-diam | ✅ Pagination penuh |
| `ClassList` (admin) | `limit: 50` tetap | ✅ Pagination penuh |
| `UserList` (admin) | `limit: 50` tetap | ✅ Pagination penuh |
| `AnnouncementList` (semua role) | Backend cuma `limit(50)` hardcode, bukan pagination sungguhan | ✅ Backend diupgrade + Pagination UI |
| `ActivityTimeline` (admin) | Backend cuma `limit(100)` hardcode — paling berisiko karena log menumpuk terus tanpa batas | ✅ Backend diupgrade + Pagination UI |

**Sengaja TIDAK diberi pagination** (karena datanya secara alami terbatas jumlahnya, menambah
pagination di sini cuma menambah kompleksitas tanpa manfaat nyata): `AcademicYearList` (paling
banyak belasan baris seumur hidup sekolah), daftar laporan harian per kelas/hari di
`TeacherReportList` (dibatasi jumlah siswa per kelas), `ReportCalendar` (dibatasi jumlah hari
dalam sebulan), `AchievementGallery` (maksimal 5 jenis lencana).

**Komponen baru**: `components/ui/pagination.tsx` — nomor halaman dengan ellipsis pintar
(`1 … 4 5 6 … 20`), tombol prev/next, ringkasan "Menampilkan X–Y dari Z". Dipakai ulang identik
di semua 5 list di atas (satu sumber kebenaran, bukan implementasi berbeda-beda per halaman).

**Detail UX yang diperhatikan**: setiap kali filter/pencarian/tab berubah, halaman otomatis
di-reset ke halaman 1 — supaya user tidak "terdampar" di halaman kosong setelah mengganti
pencarian (bug UX yang sering luput di implementasi pagination lain).

**Verifikasi**:
- `tsc --noEmit` ✅, `eslint .` ✅
- `npm run build` production **berhasil lagi** (39 route)
- **Logika `buildPageList()` (pembuat daftar nomor halaman dengan ellipsis) diuji langsung**
  dengan 7 skenario nyata (halaman pertama, terakhir, tengah, dataset kecil tanpa ellipsis,
  dataset besar dengan ellipsis di kedua sisi) — semua lolos

## Stage 12 — Kelola Akun Guru/Orang Tua & Penugasan

Ini menutup gap operasional paling penting yang ditemukan saat review: sebelumnya **tidak ada
cara sama sekali** bagi admin untuk membuat akun guru/orang tua baru dari UI (hanya lewat
`scripts/seed.ts`), dan form kelas tidak punya input untuk assign guru meski backend-nya sudah
mendukung sejak awal.

**Manajemen Akun** (`/dashboard/admin/users`): tab Guru/Orang Tua, tambah akun baru (nama, email,
password awal, telepon), nonaktifkan/aktifkan akun. Password diset langsung oleh admin (bukan
sistem invite email — fitur ganti password sendiri oleh user belum ada).

**Assign Guru ke Kelas**: form Kelas sekarang punya dropdown Wali Kelas dan checklist Guru
Pendamping (mengambil daftar dari akun guru yang sudah dibuat).

**Link Orang Tua ke Siswa**: form Siswa sekarang punya checklist Orang Tua/Wali (bisa pilih lebih
dari satu — untuk kasus wali ganda), sehingga alur "orang tua login dan lihat data anaknya" bisa
benar-benar berfungsi ujung-ke-ujung.

### 🔒 Bug keamanan yang ditemukan & diperbaiki *sebelum* sempat jadi masalah

Saat menulis service ini, saya sadar `Model.create()` Mongoose punya perilaku berbeda dari
`find()`: field dengan `select: false` (seperti `passwordHash` di model `User`) **tetap muncul**
di hasil `.create()` kalau di-serialize langsung ke JSON — beda dengan hasil query biasa yang
memang menyaring field itu di level database. Saya buktikan ini secara empiris (bukan cuma baca
dokumentasi) sebelum memutuskan solusinya.

**Solusi**: dibuat `features/users/services/user.dto.ts` (`toUserDTO()`) yang secara eksplisit
whitelist field yang aman, dipakai di **setiap** jalur return (create/update/list) tanpa
terkecuali — sehingga risiko kebocoran tidak bergantung pada method Mongoose mana yang dipakai.
Diverifikasi langsung: DTO dites dengan objek yang sengaja disisipi `passwordHash` di memory,
dan hasil serialisasinya dipastikan tidak mengandung field tersebut sama sekali.

**Verifikasi**: `tsc --noEmit` ✅, `eslint .` ✅, `npm run build` production **berhasil lagi**
(39 halaman/route, 3 baru), audit pola `.populate()`/`.toString()` di semua file baru ✅, uji
langsung anti-kebocoran `passwordHash` ✅.

## Stage 11 — Vercel Blob (Upload Foto Profil Siswa & Logo Sekolah)

**Service upload terpusat** (`lib/blob/upload.ts`): validasi tipe file (JPG/PNG/WEBP saja),
validasi ukuran maksimal 5MB, upload via `put()` dari `@vercel/blob`, dan **best-effort cleanup**
file lama (`del()`) setiap kali foto diganti — supaya file lama tidak menumpuk tanpa terpakai
(kegagalan cleanup tidak pernah menggagalkan upload baru; kalau file lama sudah hilang/URL basi,
itu diabaikan).

**2 API route**: `POST /api/students/[id]/photo` dan `POST /api/schools/logo`, keduanya
menerima `multipart/form-data`, dibatasi admin/super-admin, punya rate limit sendiri
(20 upload per 5 menit per user — mencegah spam upload), dan tercatat di Activity Timeline.

**Komponen client reusable** (`components/shared/image-upload-field.tsx`): pratinjau gambar
saat ini (bulat untuk foto siswa, kotak membulat untuk logo), klik untuk ganti, overlay ikon
kamera saat hover, spinner saat mengunggah, error inline kalau validasi gagal. Terintegrasi di:
- **Form Ubah Siswa** (hanya muncul saat mode edit, karena upload butuh ID siswa yang sudah ada)
- **Pengaturan Sekolah** (hanya muncul setelah setup awal selesai)

**Thumbnail foto** juga ditambahkan ke tabel daftar siswa (`StudentList`) supaya foto benar-benar
terlihat di UI, bukan cuma tersimpan di database.

**Verifikasi**:
- `tsc --noEmit` ✅, `eslint .` ✅
- `npm run build` production **berhasil lagi** (37 halaman/route, 2 route baru untuk upload)
- **Logika validasi file diuji langsung** (bukan cuma dibaca): file non-image ditolak, file >5MB
  ditolak, file valid lolos validasi dan baru gagal di titik yang memang diharapkan (token Vercel
  Blob belum diset di sandbox ini — di deployment sungguhan Vercel akan otomatis menyediakan
  `BLOB_READ_WRITE_TOKEN` begitu Blob storage dihubungkan ke project)

**Catatan untuk deployment**: fitur ini butuh `BLOB_READ_WRITE_TOKEN` di environment variable.
Kalau di-deploy ke Vercel dan Blob storage dihubungkan lewat dashboard, token ini otomatis
tersedia. Untuk development lokal, generate token dari Vercel dashboard → Storage → Blob, lalu
isi di `.env.local`.

## Stage 10 — Rate Limiting

**Pendekatan**: in-memory sliding-window counter (`lib/rate-limit.ts`), bukan Redis — sesuai
skala aplikasi (satu sekolah, kemungkinan besar single-instance deployment). Trade-off ini
didokumentasikan langsung di kode: kalau nanti di-deploy multi-instance di belakang load
balancer, tinggal ganti implementasi `checkRateLimit()` dengan Redis/Vercel KV tanpa mengubah
satu pun call site.

**3 lapis proteksi**:

1. **Baseline per-IP di `proxy.ts`** — 300 request/menit untuk *semua* jalur `/api/*` (termasuk
   `/api/auth`). Ini jaring pengaman umum terhadap bug (misal `useEffect` yang salah dependency
   dan memicu fetch tanpa henti) maupun abuse umum, bukan proteksi spesifik.
2. **Login — 5 percobaan gagal per 5 menit per email** (`authService.verifyCredentials`). Counter
   di-reset begitu login berhasil, supaya user asli tidak "terkunci" gara-gara salah ketik
   sebelumnya. Pesan error spesifik ("terlalu banyak percobaan") **benar-benar sampai ke UI** —
   ini butuh trik khusus karena Auth.js v5 secara default menyembunyikan detail error Credentials
   provider demi keamanan (mencegah user enumeration). Solusinya: subclass `CredentialsSignin`
   dengan `code` kustom (`rate_limited`, `account_inactive`), dibaca di client lewat
   `result.code` dari `signIn()`.
3. **Register — 5 percobaan per jam per IP**, dan **Export (Excel/PDF) — 10 request per 5 menit
   per user** (karena generate file itu mahal secara komputasi/database).

**Verifikasi**: selain `tsc --noEmit` + `eslint .` + `npm run build` (production build penuh,
termasuk kompilasi ulang `proxy.ts` yang jalan di Edge runtime), logika counter-nya sendiri
diuji langsung dengan skenario nyata (bukan cuma dibaca) — batas terlampaui & diblokir, key
berbeda tidak saling memengaruhi, reset membersihkan counter, window kedaluwarsa mengizinkan
lagi — keempatnya lolos.

## Stage 9 — Perbaikan Arsitektur: Konstanta vs Model Mongoose

### Masalah yang diperbaiki

Beberapa file model (`models/Student.ts`, `models/Announcement.ts`, `models/AcademicYear.ts`,
dkk.) mendeklarasikan `export const X = [...] as const` (untuk dipakai sebagai Mongoose schema
`enum`) **di file yang sama** dengan `import { ... } from "mongoose"` dan registrasi Model.
Ketika konstanta seperti `GENDERS`, `ANNOUNCEMENT_AUDIENCES`, `SEMESTERS` di-*import sebagai
value* (bukan `import type`) oleh Zod schema yang dipakai komponen `"use client"`, Next.js ikut
membundel **seluruh file model — termasuk `mongoose`** — ke bundle JavaScript browser. `mongoose`
adalah library Node.js-only (pakai `fs`, `net`, `tls`, dll. yang tidak ada di browser), sehingga
konstanta tersebut jadi `undefined` di runtime browser, menyebabkan crash `object undefined`
tepat saat halaman form dibuka.

**3 titik bug konkret yang terkonfirmasi**: form Siswa (`GENDERS`), form Pengumuman
(`ANNOUNCEMENT_AUDIENCES`), form Tahun Ajaran (`SEMESTERS`).

### Perbaikan

Semua `export const`/`export type` metadata (bukan interface `IDocument` yang memang harus
tetap di model) dipindahkan ke file terpisah tanpa dependency ke `mongoose` sama sekali:

| Constant baru | Dipindah dari |
|---|---|
| `constants/gender.ts` | `models/Student.ts` |
| `constants/semester.ts` | `models/AcademicYear.ts` |
| `constants/report-status.ts` | `models/DailyReport.ts` |
| `constants/notification.ts` | `models/Notification.ts` |
| `constants/announcement.ts` | `models/Announcement.ts` |
| `constants/achievement-codes.ts` | `models/Achievement.ts` |
| `constants/activity-log.ts` | `models/ActivityLog.ts` |

Setiap file model sekarang cuma *import* konstanta ini untuk dipakai di schema `enum`, bukan
mendeklarasikannya sendiri. **12 file konsumen** (repositories, services, komponen client, hooks)
di seluruh codebase diperbarui untuk import dari `constants/` alih-alih `models/`. Re-export
`ROLES` yang berbahaya di `models/User.ts` juga dihapus (tidak dipakai siapa pun, tapi mengundang
bug yang sama kalau dipakai di masa depan).

**Prinsip untuk pengembangan selanjutnya**: file `models/*.ts` (yang meng-`import` `mongoose`)
hanya boleh diimpor oleh kode **server-only** (repositories, services, API routes). Kalau ada
komponen client atau schema Zod yang butuh union type/enum dari sebuah model, konstanta itu
harus hidup di `constants/`, bukan di file model.

## ⚠️ Bug penting yang ditemukan & diperbaiki di Stage 4

Saat membangun fitur-fitur di atas, ditemukan **kelas bug sistemik** dari pola
`someObjectIdField.toString()` yang dipakai pada field yang ternyata sudah di-`.populate()`
oleh Mongoose — sehingga `.toString()` tidak menghasilkan ID mentah, melainkan representasi
dokumen lengkap (`{ name: '...', _id: ObjectId(...) }` di server, `"[object Object]"` di client).
Ini bukan cuma kosmetik — beberapa di antaranya **benar-benar crash fitur inti**:

- **Submit laporan harian akan selalu gagal (CastError)** — `daily-report.service.ts` menyimpan
  `classId` dari `student.classId` yang sudah ter-populate.
- **Pindah kelas siswa akan gagal** — `student.service.ts` punya masalah serupa.
- **Notifikasi achievement terkirim ke user yang salah/tidak valid** — `gamification.service.ts`
  memakai `student.parentIds` yang ter-populate.
- **Kebocoran data**: parent yang tidak mengirim `studentId` di query bisa melihat **semua laporan
  se-sekolah**; guru bisa melihat/komentari laporan **kelas manapun** hanya dengan mengganti
  `classId` di query string. Sudah ditutup jadi deny-by-default dengan verifikasi kepemilikan.
- **2 dialog edit di client** (Ubah Kelas, Ubah Siswa) salah mem-prefill field karena masalah yang sama.

Semua sudah diperbaiki dengan helper terpusat `utils/object-id.ts` (`idOf()`) yang aman dipakai
baik field itu ter-populate maupun tidak, dan dipakai ulang secara konsisten di seluruh service,
route, dan komponen client yang relevan.

## Yang sudah ada (Stage 1)

- ✅ Struktur folder feature-first sesuai spesifikasi (tanpa `src/`)
- ✅ `proxy.ts` (pengganti `middleware.ts` di Next.js 16) — RBAC route protection
- ✅ Koneksi MongoDB via Mongoose singleton (`lib/db/connect.ts`)
- ✅ Auth.js v5 (Credentials provider, JWT session, password hashing via bcrypt)
- ✅ Halaman login (React Hook Form + Zod) dengan loading & error state
- ✅ 4 halaman dashboard placeholder (satu per role), diproteksi oleh proxy.ts
- ✅ Desain "Modern Islamic Minimalism" (Tailwind v4 `@theme` tokens: emerald/blue/white)

## Yang sudah ada (Stage 2 — Backend Core)

**10 Mongoose Models** (semua di `models/`): `School`, `AcademicYear`, `ClassRoom`, `Student`, `User`,
`DailyReport`, `Notification`, `Announcement`, `Achievement`, `ActivityLog` — lengkap dengan index
yang tepat (unique constraint per hari untuk `DailyReport`, compound index untuk query dashboard cepat).

**Repository Pattern** (`repositories/`) — satu repository per collection, satu-satunya lapisan
yang boleh memanggil Mongoose langsung. Termasuk `pagination.util.ts` untuk format `PaginatedResult<T>`
yang konsisten di semua list endpoint.

**Service Layer** (`features/*/services/`) — logic bisnis terpisah dari route handler:
- `daily-report.service.ts` — menghitung total poin harian berdasarkan `School.settings.scoreWeights`,
  menghitung streak (`currentStreakDays`/`longestStreakDays`), mengupdate stats siswa, mencegah
  duplikat laporan per hari
- `gamification.service.ts` — rule engine achievement: 7 hari beruntun, sholat 30 hari, 100 halaman
  tilawah, bangun pagi 14 hari, membantu orang tua 14 hari. Idempotent (aman dipanggil berulang)
  lewat unique index `(studentId, code)`, otomatis kirim notifikasi ke orang tua saat badge didapat
- `student.service.ts` — sinkronisasi `ClassRoom.studentCount` otomatis saat siswa ditambah/pindah/diarsipkan
- `school.service.ts`, `academic-year.service.ts`, `class.service.ts` — CRUD terstruktur

**Otorisasi terpusat** (`lib/auth/require-user.ts`) — helper `requireUser(allowedRoles?)` dipakai di
setiap API route; melempar `UnauthorizedError`/`ForbiddenError` yang otomatis dipetakan ke status
HTTP yang tepat oleh `lib/api/handle-error.ts` (401/403/404/409/422/500, format `ApiResponse<T>` konsisten).

**API Routes (REST)**:

| Method | Path | Deskripsi |
|---|---|---|
| GET/POST/PATCH | `/api/schools` | Profil & pengaturan sekolah (single-school) |
| GET/POST | `/api/academic-years` | Daftar & buat tahun ajaran |
| POST | `/api/academic-years/[id]/activate` | Aktifkan tahun ajaran |
| GET/POST | `/api/classes` | Daftar & buat kelas |
| GET/PATCH/DELETE | `/api/classes/[id]` | Detail, update, arsip kelas |
| GET/POST | `/api/students` | Daftar & tambah siswa (parent hanya lihat anak sendiri) |
| GET/PATCH/DELETE | `/api/students/[id]` | Detail, update, arsip siswa |
| GET/POST | `/api/reports` | Daftar laporan & submit laporan harian (parent only) |
| GET | `/api/reports/[id]` | Detail laporan |
| POST | `/api/reports/[id]/comment` | Komentar guru pada laporan |
| GET/PATCH | `/api/notifications` | Daftar notifikasi & tandai semua dibaca |
| PATCH | `/api/notifications/[id]/read` | Tandai satu notifikasi dibaca |
| GET | `/api/achievements` | Daftar badge milik siswa |
| GET/POST | `/api/announcements` | Daftar & buat pengumuman |

Semua route memvalidasi body/query dengan Zod (schema di `features/*/schemas/`) sebelum masuk ke service.

## Menjalankan secara lokal

1. Install dependencies:
   ```bash
   npm install
   ```
2. Salin env template dan isi `MONGODB_URI` (dari MongoDB Atlas) dan `AUTH_SECRET`:
   ```bash
   cp .env.example .env.local
   npx auth secret   # mengisi AUTH_SECRET otomatis, atau isi manual
   ```
3. Seed 4 user contoh, satu per role, password `Password123!`:
   ```bash
   npm run seed
   ```
   (setara dengan `npx tsx scripts/seed.ts` — `tsx` sudah ada di `devDependencies`, tidak perlu install manual)
4. Verifikasi kualitas kode:
   ```bash
   npx tsc --noEmit   # 0 errors
   npx eslint .       # 0 errors
   npm run build      # production build - paling akurat untuk menangkap masalah bundling
   ```
5. Jalankan dev server (Turbopack default di Next 16):
   ```bash
   npm run dev
   ```
6. Buka `http://localhost:3000/login`.

## Kredensial contoh (setelah seed)

| Role          | Email                     | Password       |
|---------------|---------------------------|----------------|
| Super Admin   | superadmin@mutabaah.dev   | Password123!   |
| School Admin  | admin@mutabaah.dev        | Password123!   |
| Teacher       | guru@mutabaah.dev         | Password123!   |
| Parent        | ortu@mutabaah.dev         | Password123!   |

## Struktur folder

```
app/                    # Route Handlers & pages (App Router)
  (auth)/login/         # Public auth pages
  dashboard/            # Protected, role-branched dashboards
  api/                  # REST API — auth, schools, academic-years, classes,
                         # students, reports, notifications, achievements, announcements
components/ui/          # Design-system primitives (shadcn-style)
components/shared/      # App-wide client wrappers (SessionProvider)
features/
  auth/                 # schema, service, hooks, components
  schools/              # School + AcademicYear schema/service
  classes/              # ClassRoom schema/service
  students/             # Student schema/service
  reports/              # DailyReport schema/service (core feature)
  achievements/          # Gamification rule engine
shared/layout/          # Cross-feature layout building blocks
lib/db/                 # Mongoose connection singleton
lib/auth/               # Auth.js v5 config + requireUser() guard
lib/api/                # Centralized error → HTTP response mapping
models/                 # 10 Mongoose models
repositories/           # Repository Pattern — sole DB access layer per collection
constants/              # ROLES, ROLE_HOME, achievement definitions
types/                  # Shared TS types + next-auth module augmentation
proxy.ts                # Next.js 16 network boundary (RBAC route protection)
scripts/seed.ts         # Local dev seed data
```

## Yang sudah ada (Stage 3 — Core UI)

**Design system tambahan** (`components/ui/`): `Label`, `Textarea`, `Select`, `Checkbox`, `Card`,
`Dialog` (modal dengan Framer Motion + focus trap dasar + Escape to close), `Table`, `Badge`,
`Skeleton`/`TableSkeleton`, `EmptyState` — semuanya pakai token warna emerald/blue dari tema.

**Data layer client**: `lib/api/client.ts` (wrapper `fetch` yang otomatis parse `ApiResponse<T>`
dan melempar `ApiClientError` dengan status code), `lib/query/provider.tsx` (TanStack Query
provider, sudah dipasang di root layout).

**Admin — Manajemen Sekolah** (`/dashboard/admin/school`): form profil sekolah yang otomatis
berganti antara mode "setup pertama kali" dan "edit pengaturan" tergantung apakah `School`
sudah ada, lengkap dengan loading skeleton, success/error state.

**Admin — Manajemen Kelas** (`/dashboard/admin/classes`): tabel kelas dengan pencarian, dialog
tambah/ubah kelas (pilih tahun ajaran dari `/api/academic-years`), tombol arsipkan, empty state.

**Admin — Manajemen Siswa** (`/dashboard/admin/students`): tabel siswa dengan pencarian, dialog
tambah/ubah siswa (pilih kelas dari `/api/classes`), badge status aktif/nonaktif, tombol arsipkan.

**Parent — Form Laporan Harian** (`/dashboard/parent/report`) — **fitur inti aplikasi**:
- Pilih anak (jika orang tua punya lebih dari satu anak yang terhubung)
- Checklist 5 waktu sholat + kebiasaan baik (sholat sunnah, infak, membantu orang tua, bangun pagi)
- Input jumlah halaman tilawah, menit murajaah, menit membaca, catatan bebas
- Validasi Zod penuh (React Hook Form + `zodResolver`), termasuk pesan error berbahasa Indonesia
- Menangani error 409 (laporan hari ini sudah pernah diisi) secara berbeda dari error lain (warna amber, bukan merah)
- Empty state jika orang tua belum punya anak yang tertaut ke akunnya

Navigasi role-aware ditambahkan ke `DashboardShell` (`shared/layout/dashboard-shell.tsx`) sehingga
admin dan orang tua punya tab menu ke halaman-halaman baru ini.

## Yang sudah ada (Stage 4 — Komentar Guru, Achievement, Notifikasi, Pengumuman)

**Komentar Guru** (`/dashboard/teacher`): pemilih kelas (otomatis kelas pertama yang diampu) +
pemilih tanggal, daftar laporan siswa hari itu dengan ringkasan sholat (badge X/5) dan status
"Sudah Dikomentari"/"Menunggu Komentar", form komentar inline yang berubah jadi tampilan-baca
setelah tersimpan (bisa diubah lagi).

**Achievement/Badge UI** (dashboard parent): galeri lencana dengan ikon & warna per jenis
(streak 7 hari, sholat 30 hari, tilawah 100 halaman, dst.), pemilih anak jika orang tua punya
lebih dari satu anak yang terhubung, empty state yang memotivasi.

**Notification Bell** (header semua dashboard): dropdown notifikasi dengan polling ringan (60 detik),
badge jumlah belum dibaca, klik notifikasi = tandai dibaca, tombol "tandai semua dibaca", ikon
berbeda per jenis notifikasi (achievement/komentar guru/pengumuman/pengingat).

**Announcement UI**: admin bisa membuat pengumuman (judul, isi, audiens: semua/guru saja/orang
tua saja) di `/dashboard/admin/announcements`; semua role punya halaman baca pengumuman
(`/dashboard/{admin,teacher,parent}/announcements`).

Navigasi di `DashboardShell` diperbarui untuk semua tautan baru ini.

## Yang sudah ada (Stage 5 — Dashboard Sungguhan)

**Admin & Super Admin Dashboard** (`/dashboard/admin`, `/dashboard/super-admin`) — data agregasi
nyata dari MongoDB (bukan mock):
- Stat card: total siswa, total kelas, completion rate hari ini, partisipasi orang tua (aktif
  mengisi laporan 7 hari terakhir)
- Line chart tren completion rate 7 hari terakhir (Recharts)
- Bar chart completion rate per kelas hari ini
- Kartu "Kelas Paling Aktif" & "Kelas Paling Perlu Perhatian" (dihitung dari completion rate per kelas)

**Teacher Dashboard** (`/dashboard/teacher`) — ditambahkan di atas daftar laporan yang sudah ada:
- Stat card: sudah lapor hari ini (X/Y), jumlah laporan 7 & 30 hari terakhir, jumlah belum lapor
- **Daftar siswa yang belum mengisi laporan hari ini** (bagian yang sebelumnya kosong)
- Daftar "Konsistensi Terbaik" (top 5 siswa berdasarkan `currentStreakDays`)

Semua angka dihitung lewat MongoDB aggregation (`repositories/dashboard.repository.ts`) — tidak
ada penggunaan `.populate()` di sini sama sekali, sehingga kelas bug dari Stage 4 (lihat di atas)
tidak berlaku untuk kode ini; sudah diverifikasi ulang secara eksplisit.

## Yang sudah ada (Stage 6 — Kalender Riwayat Laporan)

**`ReportCalendar`** (komponen inti, dipakai ulang oleh parent & teacher): grid bulan
(Senin–Minggu), navigasi bulan sebelum/sesudah, warna sel berdasarkan total poin (hijau tua
≥80, hijau muda 50-79, kuning <50, abu-abu = belum lapor), indikator kecil kalau ada komentar
guru, klik tanggal yang sudah lapor membuka dialog detail lengkap (checklist sholat, kebiasaan
baik, tilawah/murajaah/membaca, catatan orang tua, komentar guru, status review).

**Parent** (`/dashboard/parent/history`): pemilih anak (jika lebih dari satu) + kalender.

**Teacher** (`/dashboard/teacher/history`): pemilih kelas → pemilih siswa → kalender, dengan
`classId` dikirim eksplisit ke API agar konsisten dengan proteksi otorisasi "guru hanya boleh
lihat laporan kelas yang diampu" dari Stage 4.

## Yang sudah ada (Stage 7 — Tahun Ajaran, Kenaikan Kelas, Audit Log)

**Manajemen Tahun Ajaran** (`/dashboard/admin/academic-years`): tabel tahun ajaran, dialog tambah
(label, semester, tanggal mulai/selesai), tombol "Aktifkan" per baris (non-aktif → aktif,
otomatis menonaktifkan yang lain, sesuai `academicYearRepository.setActive` yang sudah ada
sejak Stage 2).

**Kenaikan Kelas** (`/dashboard/admin/promotion`): pilih kelas asal → kelas tujuan → daftar
siswa dengan checkbox (default semua tercentang, bisa dikecualikan satu-satu untuk siswa
tinggal kelas). Service `promotion.service.ts` **tidak mempercayai `studentIds` dari client
begitu saja** — diverifikasi ulang di server bahwa setiap ID benar-benar masih aktif di kelas
asal sebelum dipindah, mencegah kesalahan data kalau state client basi. `studentCount` kedua
kelas (asal & tujuan) disinkronkan otomatis setelah pemindahan.

**Audit Log / Activity Timeline** (`/dashboard/admin/activity`): sebelumnya model `ActivityLog`
sudah ada sejak Stage 2 tapi **tidak pernah ditulis oleh kode manapun** — sekarang sudah dikaitkan
ke semua aksi mutasi penting: create/update/archive Student, create/update/archive ClassRoom,
setup/update School, create/activate AcademicYear, create Announcement, kenaikan kelas, dan
login. UI timeline dengan ikon per jenis aksi, filter jenis entitas, dan waktu relatif
("5 menit lalu").

## Yang sudah ada (Stage 8 — Export PDF/Excel)

Library: **`exceljs`** (Excel) dan **`pdfkit`** (PDF) — keduanya pure JavaScript, tidak butuh
Chrome/binary native, aman dijalankan di Next.js Route Handler biasa.

**Export Bulanan per Kelas (Excel)** — `/api/exports/monthly-excel?classId=&year=&month=`:
satu baris per siswa, satu kolom per tanggal (poin harian), kolom rata-rata & jumlah lapor.
Tombol "Export Bulanan (Excel)" ada di halaman Laporan Guru (`/dashboard/teacher`), mengikuti
kelas & bulan yang sedang dipilih.

**Ringkasan Siswa (Excel & PDF)** — `/api/exports/student-summary-excel` dan
`/api/exports/student-summary-pdf` (`?studentId=&from=&to=`): rekap harian lengkap (sholat,
tilawah, murajaah, poin, komentar guru) untuk satu siswa dalam rentang tanggal. Tombol Excel
& PDF muncul di kalender riwayat laporan (`ReportCalendar`, dipakai parent & teacher), otomatis
memakai rentang bulan yang sedang ditampilkan.

**Otorisasi**: sama persis dengan pola yang sudah dipakai di seluruh app — parent hanya bisa
export anaknya sendiri, guru hanya kelas yang diampu, admin/super admin tanpa batas. Helper
`assertCanExportStudent()` (`lib/export/authorize-export.ts`) dipakai bersama oleh route Excel
maupun PDF agar tidak ada duplikasi logika otorisasi yang bisa saling berbeda.

**Perhatian khusus pada batas paginasi**: query laporan biasa (`/api/reports`) dibatasi maksimal
100 baris — cukup untuk tampilan UI, tapi *tidak cukup* untuk export bulanan penuh kelas (30 siswa
× 30 hari = 900 baris potensial). Ditambahkan method repository khusus tanpa batas
(`findAllForClassAndRange`, `findAllForStudentAndRange`) supaya data export tidak diam-diam
terpotong.

**Setiap export tercatat di Activity Timeline** (action `export`), sehingga admin bisa lihat
siapa mengekspor data siswa/kelas mana dan kapan.

**Verifikasi ekstra** (di luar `tsc`/`eslint`): karena `exceljs`/`pdfkit` adalah dependency baru
yang belum pernah dipakai di project ini, ketiga fungsi generator diuji langsung dengan data
dummy — filenya ditulis ke disk lalu **dibaca ulang** (PDF: cek magic header `%PDF-`; Excel: parse
ulang dengan ExcelJS dan verifikasi nama sheet/jumlah baris/isi sel) untuk memastikan file yang
dihasilkan benar-benar valid, bukan sekadar "tidak melempar error".

### Catatan keamanan dependency (`npm audit`)

`npm audit` melaporkan beberapa vulnerability, mayoritas **sudah ada sejak Stage 1** (bawaan
`next-auth`/`next`/`@vercel/blob`, bukan akibat perubahan di Stage 8) — 2 critical & beberapa high,
semuanya di transitive dependency, bukan di kode aplikasi ini sendiri. `exceljs` menyumbang 1
tambahan severity "moderate" (paket `uuid` versi lama). Saya **tidak** menjalankan
`npm audit fix --force` karena itu akan mendowngrade Next.js secara breaking. Rekomendasi: jalankan
`npm audit` sendiri secara berkala dan pertimbangkan upgrade `next-auth` ke versi stabil begitu
tersedia, sebagai langkah terpisah yang perlu pengujian auth ulang.

## Belum dibangun (tahap selanjutnya)

- Sorting UI & Bulk Actions
- Dark mode toggle
- Ganti password **oleh user sendiri saat sedang login** (saat ini password hanya bisa
  diset/direset oleh admin lewat halaman Akun Guru & Ortu — itu sudah selesai di Stage 14;
  yang belum ada adalah user login lalu ganti password sendiri dari halaman profilnya)
- Export "Semester Report" sebagai preset terpisah
- `error.tsx` per-route (App Router convention) — `loading.tsx` sudah ada di level dashboard
  (Stage 17) dan auth, tapi belum ada error boundary khusus per-route
- **Automated test suite** (Jest/Vitest/Playwright) — sejauh ini nol; setiap fitur diverifikasi
  lewat `tsc`/`eslint`/`npm run build` plus skrip verifikasi manual ad-hoc yang dijalankan sekali
  saat development (lihat catatan di tiap stage), bukan test permanen yang tersimpan sebagai file
  dan jalan otomatis tiap kali ada perubahan kode
- Belum pernah dites di browser sungguhan dengan mengklik-klik langsung — tapi sudah lolos
  `npm run build` production penuh berkali-kali beruntun (Stage 9–18)

Beri tahu fitur mana yang ingin dikerjakan berikutnya.