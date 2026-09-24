# DonasiUmat 💚

> **Platform Galang Dana & Donasi Online Terpercaya dengan Transparansi 100% dan Verifikasi Bertingkat.**

DonasiUmat adalah sistem crowdfunding sosial berbasis transfer manual langsung ke rekening bank yayasan tanpa perantara payment gateway komersial, dilengkapi penomoran **3-digit kode unik verifikasi**, **notifikasi otomatis WhatsApp Gateway**, serta **kewajiban laporan transparansi berfoto** di setiap tahap penyaluran dana.

---

## 📚 Buku Panduan & Dokumentasi (Manual Books)

Seluruh dokumentasi teknis dan panduan operasional pengguna telah disusun secara mendalam di direktori [`docs/`](./docs/):

1. **[Developer Guide (`docs/DEVELOPER_GUIDE.md`)](./docs/DEVELOPER_GUIDE.md)**:
   - Arsitektur sistem (Next.js 16 App Router, TypeScript, Tailwind CSS v4, Supabase SSR & RLS).
   - Skema database (12 tabel relasional), triggers, dan RLS policies.
   - Logika bisnis kode unik (100–999) & cron job auto-expiry donasi 24 jam.
   - Sistem keamanan: Enkripsi AES-256-GCM NIK, masking PII, pencegahan Stored XSS, rate limiting, dan Signed URLs 5 menit.
   - Integrasi WhatsApp Gateway dengan mekanisme 3x retry exponential backoff.
   - Panduan konfigurasi `.env.local` dan deployment ke Vercel.

2. **[User Manual (`docs/USER_MANUAL.md`)](./docs/USER_MANUAL.md)**:
   - **Panduan Donatur**: Cara mencari kampanye, alur 3 langkah donasi transfer manual, memantau kuitansi digital, mengelola doa/pesan dukungan, dan membaca notifikasi WhatsApp.
   - **Panduan Penggalang Dana**: Syarat KYC Tier 1 (KTP + selfie), wizard 6 langkah membuat kampanye baru, menerbitkan kabar terbaru (*updates*), mengajukan pencairan dana, dan kewajiban mengunggah Laporan Transparansi Berfoto Tier 3.
   - **Panduan Admin Yayasan**: Verifikasi identitas KYC, verifikasi mutasi transfer donasi, kurasi proposal kampanye baru, persetujuan pencairan + upload bukti transfer bank, moderasi laporan transparansi, dan pengawasan log audit *immutable*.

3. **[Pusat Indeks Dokumentasi (`docs/README.md`)](./docs/README.md)**:
   - Ringkasan navigasi dan prinsip utama platform.

---

## 🚀 Memulai (Quick Start)

### 1. Kloning & Instalasi
```bash
git clone <url-repository>
cd donasi
npm install
```

### 2. Konfigurasi Environment
Salin file `.env.example` ke `.env.local`:
```bash
cp .env.example .env.local
```
Sesuaikan URL dan Key Supabase serta kredensial WhatsApp Gateway Anda.

### 3. Jalankan Server Pengembangan
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) pada peramban Anda.

### 4. Build Produksi
```bash
npm run build
npm run start
```

---

## 🛡️ Hak Cipta & Lisensi
Dikembangkan untuk **Yayasan DonasiUmat Indonesia**. Seluruh hak cipta dilindungi undang-undang.
