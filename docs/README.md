# Pusat Dokumentasi Platform DonasiUmat 📖

Selamat datang di repositori dokumentasi resmi **DonasiUmat** — platform galang dana dan donasi online berbasis transfer manual dengan transparansi berlapis dan verifikasi bertingkat.

Folder ini berisi panduan lengkap untuk kebutuhan teknis (pengembang) maupun operasional pengguna dari seluruh level peran.

---

## 📚 Daftar Buku Panduan (Manual Books)

| Dokumen | Target Pembaca | Deskripsi Utama |
| :--- | :--- | :--- |
| [**DEVELOPER_GUIDE.md**](./DEVELOPER_GUIDE.md) | Software Engineers, Architects, DevOps | Arsitektur teknis, panduan instalasi lokal, skema database Supabase, konfigurasi RLS, Server Actions, sistem enkripsi AES-256, WhatsApp gateway, dan panduan deployment Vercel. |
| [**USER_MANUAL.md**](./USER_MANUAL.md) | Donatur, Penggalang Dana, Admin Yayasan | Panduan operasional langkah-demi-langkah antarmuka untuk 3 peran: cara berdonasi transfer manual, verifikasi KYC, galang dana baru, laporan transparansi berfoto, dan verifikasi admin. |

---

## 🎯 Prinsip Utama Sistem DonasiUmat

1. **Transfer Manual dengan 3-Digit Kode Unik**:
   - Sistem tidak bergantung pada payment gateway pihak ketiga pihak luar berbiaya tinggi.
   - Menggunakan kode unik 100–999 untuk pencocokan mutasi perbankan otomatis/semi-otomatis.
2. **Verifikasi Bertingkat (Multi-Tier Verification)**:
   - **Tier 1 (Identitas)**: Validasi KTP, selfie identitas, dan rekening bank inisiator.
   - **Tier 2 (Kampanye)**: Kurasi mendalam proposal, urgensi, anggaran, dan dokumen medis/surat legal.
   - **Tier 3 (Transparansi Penyaluran)**: Kewajiban upload kuitansi/nota riil dan foto serah terima bantuan.
3. **Aturan Transparansi Ketat (*Subsequent Disbursement Blocker*)**:
   - Inisiator **tidak dapat mengajukan pencairan dana berikutnya** sebelum laporan transparansi berfoto atas pencairan dana sebelumnya disetujui kurator.
4. **Jejak Audit Kekal (*Immutable Audit Trail*)**:
   - Seluruh mutasi, verifikasi, penolakan, dan postingan tercatat secara permanen di tabel `audit_logs`.

---

## ⚡ Panduan Cepat Menjalankan Aplikasi

```bash
# 1. Clone & install dependencies
git clone https://github.com/your-org/donasiumat.git
cd donasiumat
npm install

# 2. Siapkan file environment
cp .env.example .env.local

# 3. Jalankan development server
npm run dev

# 4. Buka di browser
# http://localhost:3000
```
