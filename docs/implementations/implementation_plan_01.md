# Implementation Plan: DonasiUmat — Platform Galang Dana & Donasi Online

Platform crowdfunding sosial dan galang dana online berbasis komunitas yang memprioritaskan transparansi, akuntabilitas, verifikasi berlapis, dan pelaporan penggunaan dana terverifikasi.

## User Review Required

> [!IMPORTANT]
> **Mode Eksekusi: PHASE (Fase per Fase)**
> Eksekusi dilakukan tuntas per fase. Sesi ini akan memfokuskan pengerjaan **Fase 1 (Task 1.1 — 1.7)**: Membangun 100% seluruh antarmuka visual (Public Area, Donatur Area, Penggalang Area, Admin Area), design system, komponen reusable, navigasi, dan data dummy Indonesia berkualitas tinggi tanpa menyentuh backend/database sebelum Fase 1 disetujui.

> [!NOTE]
> Metode pembayaran yang diimplementasikan pada versi MVP adalah **Transfer Manual** (donatur transfer via bank dengan 3-digit kode unik, lalu mengunggah bukti transfer yang diverifikasi admin secara manual). Tidak menggunakan payment gateway otomatis di MVP.

---

## 1. Pemahaman & Arsitektur Proyek

### A. Peran Pengguna (User Roles)
1. **Pengunjung (Publik)**: Menjelajahi katalog kampanye, membaca kisah penerima manfaat, transparansi penyaluran, dan cara kerja.
2. **Donatur**: Berdonasi via transfer manual, mengirim doa/pesan (opsi anonim "Hamba Allah"), melacak status verifikasi donasi, melihat riwayat kuitansi donasi di dashboard.
3. **Penggalang Dana**: Wajib verifikasi identitas (KTP/SIM/Passport + selfie) sebelum membuat kampanye, membuat kampanye (multi-step form), mengirim kabar terkini (timeline update), mengunggah laporan transparansi penggunaan dana (bukti foto), dan mengajukan pencairan dana.
4. **Admin**: Memverifikasi identitas penggalang, memoderasi & mempublikasikan kampanye, memverifikasi bukti transfer donasi donatur, menyetujui & mencatat transfer pencairan dana, memoderasi laporan transparansi, mengelola kategori & pengguna, memantau *immutable audit log*, dan konfigurasi platform.

### B. Tech Stack & Arsitektur Fondasi
- **Framework**: Next.js 15 (App Router, React 19, Server Components & Server Actions)
- **Bahasa**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v3.4 + Custom Color Tokens (Emerald Primary, Sky Secondary, Amber Accent)
- **UI Component Library**: `shadcn/ui` (Button, Card, Input, Textarea, Dialog, Sheet, Table, Badge, DropdownMenu, Tabs, Accordion, Progress, Form, Sonner/Toast, Avatar, Skeleton)
- **Typography**: Google Fonts via `next/font`:
  - Heading & Angka Donasi: **Plus Jakarta Sans** (dengan `tabular-nums` untuk angka)
  - Body: **Inter**
  - Kode Transaksi & Audit: **JetBrains Mono**
- **Icons & Micro-animations**: `lucide-react`, `framer-motion`
- **Backend & Database** *(Fase 2)*: Supabase PostgreSQL (RLS aktif di semua tabel), Supabase Auth (Email & Password), Supabase Storage (5 buckets)
- **Integrasi Pihak Ketiga** *(Fase 3)*: WhatsApp Gateway (Fonnte/Wablas) via Route Handler `/api/notifications/whatsapp`, Audit Logging Engine (`audit_logs`)

---

## 2. Rencana Rinci Eksekusi Fase 1 (Task 1.1 — 1.7)

### Task 1.1: Foundations & Design System Setup
- Inisialisasi struktur project Next.js 15 App Router dengan TypeScript dan Tailwind CSS di direktori workspace `d:\project\web\donasi`.
- Konfigurasi `tailwind.config.ts` dan `globals.css` dengan token warna HSL sesuai Bab 4 PRD:
  - Primary (Emerald Trust): `158 78% 38%`
  - Secondary (Sky Blue): `199 89% 48%`
  - Accent (Amber Warmth): `38 92% 50%`
  - Border, Card, Muted, Danger, Success tokens
- Setup font `Plus Jakarta Sans`, `Inter`, dan `JetBrains Mono` di `app/layout.tsx`.
- Instalasi dependensi UI (`clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-react`, `framer-motion`, `sonner`, `@radix-ui/react-*`).
- Siapkan komponen dasar UI (`components/ui/*`): Button, Badge, Card, Progress, Input, Textarea, Dialog, Sheet, Table, Tabs, Accordion, Avatar, Skeleton, DropdownMenu.
- Buat mock data generator & constants data dummy Indonesia (`lib/dummy-data.ts`) mencakup kategori, kampanye, donatur, transaksi, update, laporan transparansi, doa, dan audit logs (sesuai Bab 9 PRD).

### Task 1.2: Persistent Layouts & Navigation Architecture
- **Root Layout** (`app/layout.tsx`): Load fonts, toast provider, styling global.
- **Public Layout** (`components/layouts/public-layout.tsx` & `app/(public)/layout.tsx`):
  - Sticky Navbar: Logo DonasiUmat, menu (Beranda, Kampanye, Cara Kerja, Tentang, Kontak), CTA "Galang Dana" & "Masuk / Daftar", mobile drawer sheet.
  - Footer: Brand overview, navigasi kategori cepat, tautan legal (Syarat & Ketentuan, Kebijakan Privasi), info rekening resmi yayasan, kontak CS WhatsApp.
- **Auth Layout** (`app/(auth)/layout.tsx`):
  - Split screen: Sisi kiri berupa hero card inspiratif dengan kutipan/nilai amanah; sisi kanan form kontainer clean.
- **Dashboard Layout** (`components/layouts/dashboard-layout.tsx` & `app/dashboard/layout.tsx`):
  - Sidebar tetap (fixed) dengan navigasi adaptif peran (Donatur vs Penggalang vs Admin switch switcher).
  - Header mini: Search bar, notifikasi bell (badge unread), profil avatar dropdown, mode switcher.
  - Mobile responsive drawer sidebar.
- **Campaign Detail Layout** (`app/(public)/kampanye/[slug]/layout.tsx`):
  - 2 Kolom responsif: Kiri konten utama (galeri, cerita, tab modul); Kanan sticky card ringkasan target, progress bar, nominal terkumpul, tombol CTA "Donasi Sekarang".

### Task 1.3: Public Area Pages (Full UI dengan Data Dummy Indonesia)
- **Beranda** (`app/(public)/page.tsx`):
  - Hero Section interaktif dengan CTA "Donasi Sekarang" & "Mulai Galang Dana".
  - Metrics Bar (Total Donasi Tersalurkan, Total Kampanye Selesai, Jumlah Sahabat Umat).
  - Section Kampanye Darurat & Mendesak (urgency badge, timer sisa hari, progress bar).
  - Section Kategori Populer (Kesehatan, Bencana Alam, Pendidikan, Yatim & Dhuafa, dll).
  - Grid Kampanye Pilihan (card 16:9, progress bar, nominal tabular, author verified badge).
  - Section "Mengapa DonasiUmat?" (Transparansi Foto, Verifikasi KTP, Laporan Penyaluran).
  - Testimoni Penerima Manfaat & CTA Galang Dana.
- **Daftar Kampanye** (`app/(public)/kampanye/page.tsx`):
  - Search bar interaktif + filter multi-kategori pill + dropdown pengurutan (Terbaru, Hampir Tercapai, Terbanyak Didonasikan) + filter lokasi.
  - Grid 3 kolom kartu kampanye responsif dengan pagination interaktif dan empty state ramah.
- **Detail Kampanye** (`app/(public)/kampanye/[slug]/page.tsx`):
  - Header detail: cover 16:9, badge kategori, badge verified fundraiser, judul, lokasi.
  - Tab interaktif:
    1. *Cerita*: Kisah penerima manfaat lengkap, foto rincian kondisi, breakdown kebutuhan.
    2. *Kabar Terbaru*: Timeline update dari penggalang dilengkapi foto progres dan tanggal.
    3. *Doa & Pesan*: Kolom doa Sahabat Umat (termasuk anonim "Hamba Allah") dan tombol kirim doa.
    4. *Daftar Donatur*: List donatur, waktu donasi, nominal (atau opsi sembunyikan).
    5. *Laporan Transparansi*: Rincian penyaluran dana yang telah dilakukan penggalang beserta foto kuitansi/dokumentasi penyerahan.
  - Sticky sidebar: Progress bar persentase, nominal terkumpul vs target, sisa hari, tombol CTA.
- **Form Donasi Transfer Manual** (`app/(public)/kampanye/[slug]/donasi/page.tsx`):
  - Step 1: Pemilihan nominal cepat (Rp 10.000, 25.000, 50.000, 100.000, 250.000, 500.000, atau nominal bebas).
  - Step 2: Input doa & opsi donasi sebagai anonim ("Hamba Allah").
  - Step 3: Pilihan rekening bank tujuan (BCA, Mandiri, BNI, BRI) + generate 3-digit kode unik (misal Rp 100.123).
  - Step 4: Layar instruksi transfer (copy no. rekening, copy nominal tepat, timer 24 jam) + dropzone upload bukti transfer.
  - Step 5: State sukses terkirim & menanti verifikasi admin.
- **Halaman Statis & Legal**:
  - `/tentang`: Sejarah DonasiUmat, visi & misi amanah, tim pengurus, dewan syariah/pengawas.
  - `/cara-kerja`: Diagram alur untuk donatur dan alur untuk penggalang dana, FAQ singkat.
  - `/kontak`: Formulir pengaduan/pertanyaan, alamat kantor, jam operasional, tautan WhatsApp CS.
  - `/faq`: Accordion terorganisir per kategori (Donatur, Penggalang, Keamanan, Pembayaran).
  - `/syarat-ketentuan` & `/kebijakan-privasi`: Dokumen legal formal dan transparan.
- **Profil Penggalang Publik** (`app/(public)/penggalang/[username]/page.tsx`):
  - Avatar, badge verified, bio, statistik total kampanye dibuat, total dana tersalurkan, list kampanye aktif.

### Task 1.4: Donatur Area Pages (Full UI dengan Data Dummy Indonesia)
- **Dasbor Donatur** (`app/dashboard/page.tsx`):
  - Statistik donatur: Total Dana Didonasikan, Total Kebaikan Terdukung, Donasi Menunggu Verifikasi.
  - Tabel 5 donasi terakhir dengan status badge (Menunggu Verifikasi, Terverifikasi, Ditolak).
- **Riwayat Donasi** (`app/dashboard/riwayat-donasi/page.tsx` & `[id]/page.tsx`):
  - Filter pencarian, filter status, tabel lengkap transaksi dengan kode donasi (`DON-2024-xxxx`).
  - Halaman detail transaksi: nominal, kode unik, bank tujuan, preview foto bukti transfer yang diunggah, tombol "Unduh Kuitansi PDF (Mock)".
- **Doa Saya** (`app/dashboard/doa-saya/page.tsx`):
  - Daftar pesan dan doa yang pernah dikirimkan ke berbagai kampanye, modal edit doa (dalam 24 jam) dan hapus doa.
- **Profil Saya** (`app/dashboard/profil/page.tsx`):
  - Form data diri: nama lengkap, email, nomor WhatsApp (+62), upload foto avatar, form ganti kata sandi.
- **Notifikasi** (`app/dashboard/notifikasi/page.tsx`):
  - Daftar notifikasi in-app dan status notifikasi WhatsApp gateway (verified, kabar update, kampanye selesai).

### Task 1.5: Penggalang Dana Area Pages (Full UI dengan Data Dummy Indonesia)
- **Landing Galang Dana** (`app/galang-dana/page.tsx`):
  - Ajakan galang dana, tahapan 3 langkah (Verifikasi Identitas → Buat Kampanye → Salurkan & Laporkan), tombol "Mulai Galang Dana Sekarang".
- **Verifikasi Identitas Tier 1** (`app/galang-dana/verifikasi-identitas/page.tsx`):
  - Formulir KTP/SIM/Paspor, NIK/Nomor ID terenkripsi visual, nama sesuai KTP, rekening pencairan bank, upload foto KTP & selfie memegang KTP dengan dropzone preview interaktif.
- **Form Buat Kampanye Baru Tier 2** (`app/galang-dana/kampanye-baru/page.tsx`):
  - Stepper 6 langkah:
    1. Info Dasar (Judul, Kategori, Lokasi Penerima Manfaat)
    2. Cerita Lengkap (Rich Text editor dummy, urgensi, rincian biaya)
    3. Target & Deadline (Target dana minimal Rp 1jt, tanggal akhir)
    4. Foto & Video (Upload Cover 16:9 + Galeri pendukung)
    5. Rekening Penyaluran (Pilih rekening terverifikasi)
    6. Pratinjau (Preview kartu & halaman kampanye sebelum submit)
- **Kampanye Saya** (`app/galang-dana/kampanye-saya/page.tsx`):
  - Manajemen kampanye: tab Draft, Menunggu Review, Aktif, Selesai, Ditolak.
- **Kelola Kampanye Tertentu**:
  - `[id]/edit`: Form edit info kampanye yang masih draft/revisi.
  - `[id]/update`: Form kirim update kabar terbaru untuk donatur dengan foto progres.
  - `[id]/laporan-transparansi`: Form pelaporan penyaluran dana (nominal dana dipakai, foto kuitansi/dokumentasi, deskripsi).
  - `[id]/pencairan`: Form pengajuan pencairan dana terhimpun ke rekening penggalang.
- **Riwayat Pencairan** (`app/galang-dana/riwayat-pencairan/page.tsx`):
  - Tabel pengajuan pencairan, kode pencairan (`WD-2024-xxxx`), status (Pending, Disetujui, Ditransfer, Ditolak), dan bukti transfer admin.

### Task 1.6: Admin Area Pages (Full UI dengan Data Dummy Indonesia)
- **Dasbor Admin** (`app/admin/dashboard/page.tsx`):
  - Kartu Metrik: Total Donasi Masuk, Transaksi Menunggu Verifikasi, Kampanye Menunggu Review, Verifikasi Identitas Pending, Pengajuan Pencairan Pending.
  - Grafik pertumbuhan donasi harian (SVG mock chart interaktif) & log aktivitas kilat.
- **Verifikasi Identitas Penggalang** (`app/admin/verifikasi-identitas/page.tsx`):
  - Tabel pengajuan KYC Tier 1, modal detail (zoom KTP & selfie pemohon, data bank), tombol "Setujui" & "Tolak dengan Catatan".
- **Kelola Kampanye & Review** (`app/admin/kampanye/page.tsx` & `[id]/page.tsx`):
  - Filter status kampanye, panel review detail kampanye, tombol Approve / Minta Revisi / Tolak.
- **Kelola Transaksi Donasi** (`app/admin/transaksi/page.tsx` & `[id]/page.tsx`):
  - Tabel transaksi, filter status verifikasi bukti transfer, modal zoom bukti transfer, tombol "Verifikasi Donasi (Approve)" dan "Tolak (Bukti Tidak Valid / Nominal Salah)".
- **Kelola Pencairan Dana** (`app/admin/pencairan/page.tsx`):
  - Tabel request penarikan dana, tombol verifikasi dan modal upload bukti transfer admin ke penggalang.
- **Kelola Laporan Transparansi** (`app/admin/laporan-transparansi/page.tsx`):
  - Moderasi laporan penyaluran dana sebelum tampil di halaman publik kampanye.
- **Kelola Pengguna** (`app/admin/pengguna/page.tsx`):
  - Daftar seluruh user (Donatur & Penggalang), status verifikasi, filter role, tombol Suspend/Aktifkan.
- **Kelola Kategori** (`app/admin/kategori/page.tsx`):
  - CRUD Kategori galang dana (nama, slug, ikon Lucide).
- **Audit Log** (`app/admin/audit-log/page.tsx`):
  - Tabel kronologis immutable audit logs: Aktor, Peran, Aksi (Create, Update, Approve, Reject, Verify), Entitas, Waktu, modal inspect Before Data vs After Data JSON.
- **Pengaturan Platform** (`app/admin/pengaturan/page.tsx`):
  - Konfigurasi rekening bank resmi yayasan, pengaturan rentang kode unik transfer, template notifikasi WhatsApp.

### Task 1.7: Polish UI/UX, Animations, & Responsiveness QA
- Audit responsivitas mobile & desktop di semua resolusi.
- Transisi halus `framer-motion` (fade-up, dialog entrance, tab indicator, toast notification).
- Empty state ramah dengan tombol CTA di setiap tabel dan grid.
- Loading skeleton states untuk kartu kampanye dan tabel.
- Validasi nol teks "Lorem Ipsum" — 100% data dummy kontekstual Indonesia.

---

## 3. Verification Plan

### Automated Verification
- Jalankan pemeriksaan tipe TypeScript dan bundling Next.js:
  ```bash
  npm run build
  ```
  *(Memastikan semua rute ter-generate dengan benar dan tidak ada missing imports atau type errors).*

### Manual Verification
1. **Navigasi Publik**:
   - Buka `/` (Beranda) dan jelajahi hero, statistik, kampanye darurat, kategori.
   - Buka `/kampanye` dan uji filter kategori, search, dan pagination.
   - Buka `/kampanye/[slug]` dan uji pergantian 5 tab (Cerita, Kabar Terbaru, Doa, Donatur, Transparansi).
   - Buka `/kampanye/[slug]/donasi` dan uji step input nominal, pilihan bank, instruksi kode unik, dan upload bukti.
2. **Navigasi Donatur**:
   - Buka `/dashboard`, `/dashboard/riwayat-donasi`, `/dashboard/doa-saya`, `/dashboard/profil`.
3. **Navigasi Penggalang**:
   - Buka `/galang-dana/verifikasi-identitas`, `/galang-dana/kampanye-baru` (uji 6 tahap wizard), `/galang-dana/kampanye-saya`.
4. **Navigasi Admin**:
   - Buka `/admin/dashboard`, `/admin/transaksi` (uji modal verifikasi bukti), `/admin/verifikasi-identitas`, `/admin/audit-log` (uji modal perbandingan JSON).
5. **Mobile Responsiveness**:
   - Uji drawer navigasi publik dan drawer sidebar dashboard.
