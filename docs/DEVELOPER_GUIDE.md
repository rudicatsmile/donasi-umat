# Buku Panduan Developer: DonasiUmat (Developer Guide) 💻

Buku panduan ini ditujukan bagi **Software Engineers, Fullstack Architects, dan DevOps** yang memelihara atau mengembangkan platform **DonasiUmat**.

---

## 1. Arsitektur & Teknologi (Tech Stack)

| Komponen | Pilihan Teknologi | Versi / Rincian |
| :--- | :--- | :--- |
| **Framework Utama** | Next.js (App Router) | v16.3+ (Turbopack, Server Components, Server Actions) |
| **Runtime & Language** | Node.js + TypeScript | Strict Mode enabled, Node 20+ LTS |
| **Styling & Design System** | Tailwind CSS v4 | HSL token variables, Plus Jakarta Sans, Inter, JetBrains Mono |
| **UI Components** | Radix UI / shadcn/ui | Button, Card, Badge, Dialog, Sheet, Tabs, Table, Progress, Avatar |
| **Database & Auth** | Supabase (PostgreSQL) | Supabase SSR Client, Postgres Triggers, RLS, Storage Buckets |
| **Validasi Skema** | Zod | Runtime type safety pada seluruh Server Actions |
| **Notifikasi Gateway** | WhatsApp Provider API | Integrasi HTTP (Fonnte/Wablas) dengan mekanisme 3x retry backoff |
| **Keamanan Kriptografi** | Node `crypto` bawaan | AES-256-GCM untuk NIK & PII, SHA-256 hash pencegah NIK ganda |
| **Deployment & Cron** | Vercel Serverless | Native Cron Jobs (`vercel.json`) setiap 1 jam untuk auto-expiry |

---

## 2. Struktur Direktori Proyek

```text
donasi/
├── app/
│   ├── (auth)/                    # Autentikasi (login, register, forgot-password)
│   ├── (public)/                  # Halaman publik (beranda, kampanye, legal, detail)
│   │   ├── kampanye/
│   │   │   ├── page.tsx           # Katalog kampanye (search, filter, sort)
│   │   │   ├── [slug]/
│   │   │   │   ├── page.tsx       # Detail kampanye + JSON-LD DonateAction
│   │   │   │   └── donasi/        # Wizard donasi transfer manual 3 tahap
│   │   │   └── layout.tsx         # Navbar publik, footer, & JSON-LD Organization
│   ├── actions/                   # Server Actions Next.js (Zod + Audit Logs)
│   │   ├── auth.ts                # Login, Register, Logout, Reset Password
│   │   ├── campaigns.ts           # Buat, edit, kurasi, approve, reject kampanye
│   │   ├── donations.ts           # Buat donasi, upload bukti, verifikasi, reject, expire
│   │   ├── identity.ts            # Submit KYC Tier 1, kurasi approve/reject
│   │   ├── disbursement-and-updates.ts # Pencairan dana, laporan transparansi, update kabar
│   │   └── profile-and-category.ts# Update profil donatur & CRUD kategori admin
│   ├── admin/                     # Portal Administrator Yayasan
│   ├── dashboard/                 # Portal Donatur (riwayat, doa, kuitansi, notifikasi)
│   ├── galang-dana/               # Portal Inisiator Penggalang Dana
│   ├── api/
│   │   ├── cron/expire-donations/ # Endpoint auto-expiry donasi >24 jam
│   │   └── notifications/whatsapp/# API webhook / trigger notifikasi WhatsApp
│   ├── robots.ts                  # Dynamic robots.txt
│   ├── sitemap.ts                 # Dynamic sitemap.xml
│   └── globals.css                # Tailwind CSS v4 & theme variables
├── components/
│   ├── campaign/                  # Komponen kartu kampanye, detail content, wizard
│   ├── layouts/                   # Navbar, footer, dashboard shell adaptif 3 peran
│   └── ui/                        # Komponen atomik shadcn/ui
├── docs/                          # Dokumentasi & manual book
├── lib/
│   ├── data/                      # Data access layer (Supabase query + mock fallback)
│   ├── notifications/             # WhatsApp dispatcher, templates, dan in-app helper
│   ├── supabase/                  # SSR server client, browser client, admin service role
│   ├── audit.ts                   # Modul pencatatan audit log immutable
│   ├── crypto.ts                  # Enkripsi AES-256-GCM, masking NIK & rekening
│   ├── dummy-data.ts              # Data mock kontekstual Indonesia lengkap
│   ├── rate-limit.ts              # In-memory sliding window rate limiter
│   ├── sanitize.ts                # Pembersih XSS untuk konten cerita & doa
│   └── utils.ts                   # Helper format Rupiah, tanggal, slug, cn
├── supabase/
│   ├── migrations/                # Skema DDL SQL & RLS policies
│   └── seed.sql                   # Data permulaan (admin, kategori, kampanye)
├── vercel.json                    # Konfigurasi Vercel Cron
└── package.json
```

---

## 3. Setup Lingkungan & Instalasi Lokal

### 3.1 Prasyarat
- Node.js versi 20.x atau lebih baru.
- npm atau pnpm.
- Akun Supabase (opsional jika menggunakan development mock fallback).

### 3.2 Langkah Instalasi

```bash
# 1. Unduh repositori
git clone <url-repo-anda>
cd donasi

# 2. Instalasi modul node
npm install

# 3. Buat file konfigurasi lingkungan lokal
cp .env.example .env.local
```

### 3.3 Variabel Lingkungan (`.env.local`)

```ini
# Identitas Aplikasi
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=DonasiUmat

# Supabase API (Dapatkan dari Supabase Project Settings -> API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=super-secret-jwt-key-minimum-32-chars

# Supabase Storage Buckets
NEXT_PUBLIC_SUPABASE_BUCKET_CAMPAIGN=campaign-assets
SUPABASE_BUCKET_VERIFICATION=verification-docs
SUPABASE_BUCKET_PAYMENT=payment-proofs

# WhatsApp Gateway (Fonnte / Wablas)
WHATSAPP_GATEWAY_URL=https://api.fonnte.com/send
WHATSAPP_GATEWAY_TOKEN=your-wa-gateway-token
WHATSAPP_SENDER_NAME=DonasiUmat

# Rekening Resmi Yayasan (Transfer Manual)
NEXT_PUBLIC_DEFAULT_BANK_NAME=BSI (Bank Syariah Indonesia)
NEXT_PUBLIC_DEFAULT_BANK_ACCOUNT=7189 0123 45
NEXT_PUBLIC_DEFAULT_BANK_HOLDER=Yayasan DonasiUmat Indonesia

# Keamanan & Cron
ENCRYPTION_SECRET=super-secret-encryption-key-minimum-32-chars
CRON_SECRET=super-secret-for-cron-expire-donations
```

---

## 4. Skema Database & Migrasi Supabase

Skema database lengkap terdapat di [`supabase/migrations/20260924_initial_schema.sql`](file:///d:/project/web/donasi/supabase/migrations/20260924_initial_schema.sql).

### 4.1 Tabel-Tabel Utama (12 Tabel Relasional):
1. `profiles`: Profil pengguna (ID auth Supabase, nama, nomor telepon WhatsApp, avatar, peran `donor` | `fundraiser` | `admin`, status verifikasi).
2. `categories`: Kategori galang dana (Bencana Alam, Medis, Wakaf Masjid, dsb).
3. `campaigns`: Data kampanye (judul, slug, cerita, target dana, deadline, status: `draft` | `pending_review` | `active` | `completed` | `rejected`).
4. `donations`: Transaksi donasi transfer manual (`donation_code`, `unique_code`, nominal, total transfer, bank tujuan, bukti transfer URL, status: `pending` | `waiting_verification` | `verified` | `rejected` | `expired`).
5. `identity_verifications`: Berkas KYC Tier 1 inisiator (KTP/SIM/Paspor, NIK hash & masked, foto KTP, foto selfie).
6. `withdrawals`: Pengajuan pencairan dana inisiator (`requested_amount`, rekening bank, status: `pending` | `approved` | `transferred` | `rejected`, bukti transfer admin).
7. `transparency_reports`: Laporan penggunaan dana riil Tier 3 (nominal terpakai, tanggal penyaluran, dokumentasi foto nota/kuitansi asli, status: `pending_review` | `published`).
8. `campaign_updates`: Linimasa kabar terbaru kampanye bagi donatur.
9. `prayers`: Doa donatur dan pencatatan jumlah counter *aminkan*.
10. `prayer_amin`: Relasi unik pengguna yang mengaminkan doa (mencegah klik ganda).
11. `notifications`: Notifikasi *in-app* untuk pengguna.
12. `audit_logs`: Jejak audit kekal (*immutable log*) aksi pengguna dan sistem.
13. `whatsapp_logs`: Rekam jejak seluruh transmisi pesan WhatsApp Gateway.

### 4.2 Row Level Security (RLS)
Setiap tabel memiliki kebijakan RLS ketat:
- **Publik**: Hanya dapat membaca kampanye berstatus `active`, laporan transparansi `published`, kabar terbaru, dan kategori.
- **Donatur**: Hanya dapat membaca transaksi donasi dan notifikasi miliknya sendiri.
- **Penggalang**: Hanya dapat memanipulasi kampanye miliknya, melihat pencairan miliknya, dan mengajukan KYC miliknya.
- **Admin**: Akses penuh ke seluruh tabel melalui Service Role atau pemeriksaan role `admin` di tabel profiles.

---

## 5. Logika Bisnis Kritis (Core Business Logic)

### 5.1 Generator 3-Digit Kode Unik & Batas Waktu 24 Jam
- Setiap kali transaksi donasi diinisiasi, sistem menghasilkan kode unik acak 3 digit antara **100 hingga 999** yang belum aktif pada kampanye terkait dalam 24 jam terakhir.
- Total yang harus ditransfer adalah:
  $$\text{Total Transfer} = \text{Nominal Donasi} + \text{Kode Unik}$$
- Transaksi memiliki status `pending` dengan `expires_at = now() + 24 jam`.
- Jika donatur tidak mengunggah bukti transfer dalam 24 jam, cron otomatis akan mengubah status menjadi `expired`.

### 5.2 Auto-Expiry Cron Route
- Endpoint: `GET /api/cron/expire-donations`
- Dipanggil setiap jam oleh Vercel Cron.
- Memfilter donasi dengan status `pending` dan `expires_at < now()`.
- Mencatat aksi kedaluwarsa massal ke `audit_logs` dengan `actorRole: "system"`.

### 5.3 Aturan Transparansi Ketat (*Subsequent Disbursement Blocker*)
Sesuai Bab 6 PRD, inisiator tidak diperbolehkan mencairkan dana tahap berikutnya sebelum membuktikan amanah dana tahap sebelumnya:
```typescript
// Implementasi pada app/actions/disbursement-and-updates.ts
const previousWithdrawals = await getPreviousTransferredWithdrawals(campaignId);
const approvedReports = await getApprovedTransparencyReports(campaignId);

if (previousWithdrawals.length > 0 && approvedReports.length < previousWithdrawals.length) {
  return {
    success: false,
    error: "Pencairan berikutnya ditangguhkan: Anda belum melengkapi Laporan Transparansi untuk pencairan dana sebelumnya."
  };
}
```

### 5.4 Sedekah Subuh Rutin (Pre-Funded Pledge / Saldo Komitmen)
- **Tabel Basis**: `sedekah_subuh_pledges` menyimpan `balance`, `daily_amount`, `preferred_category`, dan `is_active`.
- **Top-up**: Donatur melakukan transfer manual dengan kode unik untuk menambah saldo komitmen.
- **Cron Fajar**: Endpoint `/api/cron/subuh-pledge` dieksekusi setiap jam 04:30 WIB.
- **Mekanisme Otomatis**:
  1. Menyeleksi pengguna berstatus `is_active: true` dan `balance >= daily_amount`.
  2. Memotong saldo harian dan mengalokasikan donasi terverifikasi ke kampanye darurat / kategori pilihan donatur.
  3. Memperbarui nominal terkumpul kampanye.
  4. Memicu notifikasi WhatsApp dan In-App berisi kuitansi fajar harian ke donatur.

### 5.5 Kalkulator Zakat Terpadu & Generator BSZ Digital
- **File Helper**: [`lib/zakat-constants.ts`](file:///d:/project/web/donasi/lib/zakat-constants.ts) memuat acuan nisab resmi BAZNAS (Harga Emas Rp 1.400.000/gr, Nisab 85 gr = Rp 119.000.000/tahun).
- **Rumus Perhitungan**:
  - **Zakat Profesi**: `(Gaji Pokok + Penghasilan Lain - Pengeluaran Pokok) * 2,5%` (jika $\ge$ Rp 9.916.667/bulan).
  - **Zakat Maal**: `(Tabungan + Investasi - Hutang Haul) * 2,5%` (jika $\ge$ Rp 119.000.000).
  - **Zakat Emas**: `(Total Gram * Harga Emas) * 2,5%` (jika $\ge$ 85 gram).
- **Sertifikat BSZ**: Fungsi `submitZakatPaymentAction` menerbitkan nomor unik `BSZ-YYYY-MM-XXXX` yang tersimpan di tabel `zakat_records` dan dapat diinspeksi publik melalui `/zakat/sertifikat/[bsz]`.

---

## 6. Keamanan, Enkripsi, & Sanitasi

### 6.1 Enkripsi AES-256-GCM & Masking NIK (`lib/crypto.ts`)
- Nomor identitas (NIK KTP) disamarkan untuk tampilan publik dan admin non-otoritas:
  - `maskIdentityNumber("3201123456780001")` &rarr; `"3201**********01"`
- NIK di-hash menggunakan SHA-256 (`id_number_hash`) untuk verifikasi keunikan akun tanpa menyimpan plaintext mentah.
- NIK dienkripsi menggunakan AES-256-GCM dengan *initialization vector* (IV) dan *authentication tag*.

### 6.2 Sanitasi Input XSS (`lib/sanitize.ts`)
- Form cerita kampanye dan kabar terbaru menggunakan fungsi `sanitizeHtml()` yang menghapus semua tag skrip, iframe, dan attribute event handler (`onerror`, `onload`, `javascript:`).
- Input nama, doa, dan nomor rekening dibersihkan menggunakan `sanitizePlainText()`.

### 6.3 Rate Limiting (`lib/rate-limit.ts`)
- Sliding window cache berbasis IP untuk mencegah penyerangan brute force pada endpoint otentikasi dan API notifikasi WhatsApp (dibatasi 20 panggilan per menit).

### 6.4 Supabase Storage Signed URLs 5 Menit (`lib/supabase/storage.ts`)
- Foto KTP, foto selfie, dan bukti transfer perbankan disimpan di *private bucket* Supabase (`verification-docs` dan `payment-proofs`).
- Dokumen privat hanya dapat diakses melalui **Temporary Signed URL** yang otomatis hangus setelah **300 detik (5 menit)**.

---

## 7. Integrasi WhatsApp Gateway (`lib/notifications/`)

Layanan WhatsApp Gateway bekerja secara asinkron dengan fitur:
1. **Sanitasi Nomor**: Mengonversi format `0812...`, `+62812...` secara otomatis ke format internasional standar `62812...`.
2. **3x Exponential Backoff Retry**: Jika penyedia gateway mengalami kegagalan jaringan, sistem mencoba kembali dengan jeda bertingkat (500ms, 1000ms).
3. **Audit Log WhatsApp**: Seluruh payload pesan dan respons provider disimpan ke tabel `whatsapp_logs`.

---

## 8. Menjalankan Build & Pengujian Produksi

```bash
# Validasi tipe data TypeScript & kompilasi produksi
npm run build

# Menjalankan server hasil build
npm run start
```
Seluruh 37 rute harus terkompilasi dengan indikator `Exit Code 0`.
