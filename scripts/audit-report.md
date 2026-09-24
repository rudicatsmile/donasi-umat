Berdasarkan audit menyeluruh terhadap seluruh *route*, komponen, dan *data fetching layer* di dalam proyek ini, berikut adalah laporan lengkap mengenai halaman-halaman yang masih bergantung pada **data DUMMY**:

---

## 📌 Ringkasan Hasil Audit

| Kategori | Jumlah Halaman | Status Ketergantungan Data |
| :--- | :---: | :--- |
| **Admin Panel** | **10 Halaman** | **Hardcoded State** (hanya membaca array lokal memori) |
| **Penggalang Dana (Fundraiser)** | **8 Halaman** | **Hardcoded State** (membaca `DUMMY_CAMPAIGNS`, `DUMMY_WITHDRAWALS`) |
| **Donatur (Donor Dashboard)** | **6 Halaman** | **Hardcoded State** (membaca `DUMMY_TRANSACTIONS`, `INITIAL_PRAYERS`, dll) |
| **Publik (Katalog & Detail)** | **3 Halaman** | **Hybrid / Fallback** (Mencoba DB, namun fallback ke dummy jika tabel kosong) |
| **Sudah Full Real DB** | **3 Halaman** | ✅ `/admin/kategori`, `/dashboard/sedekah-subuh`, `/zakat` |

---

## 📋 Daftar Rinci Halaman yang Masih Bergantung pada Data DUMMY

### 1. Area Administrator (Admin Portal)

#### A. Dasbor Admin
- **Route:** `/admin/dashboard`
- **File:** [app/admin/dashboard/page.tsx](file:///d:/project/web/donasi/app/admin/dashboard/page.tsx)
- **Jenis Data Dummy:** `DUMMY_TRANSACTIONS`, `DUMMY_IDENTITIES`, `DUMMY_WITHDRAWALS`, `DUMMY_AUDIT_LOGS`, `PLATFORM_STATISTICS`
- **Bukti Kode:**
  ```tsx
  const pendingTransactions = DUMMY_TRANSACTIONS.filter((t) => t.status === "waiting_verification");
  const pendingIdentities = DUMMY_IDENTITIES.filter((i) => i.status === "pending");
  const pendingWithdrawals = DUMMY_WITHDRAWALS.filter((w) => w.status === "pending");
  ```
- **Seharusnya Pakai Data Real?** **Ya, Wajib.**
- **Risiko Jika Dibiarkan:** Admin melihat statistik fiktif (bukan transaksi dan permintaan pencairan dana nyata dari donatur/penggalang).

#### B. Moderasi & Detail Kampanye Admin
- **Route:** `/admin/kampanye` dan `/admin/kampanye/[id]`
- **File:** [app/admin/kampanye/page.tsx](file:///d:/project/web/donasi/app/admin/kampanye/page.tsx) & [app/admin/kampanye/[id]/page.tsx](file:/
<truncated 11233 bytes>
t fundraiser = DUMMY_FUNDRAISERS.find((f) => f.username === username) || DUMMY_FUNDRAISERS[0];
  ```
- **Seharusnya Pakai Data Real?** **Ya.**
- **Risiko Jika Dibiarkan:** Penggalang dana resmi yang memiliki akun di platform tidak memiliki halaman profil publik yang valid.

#### C. Katalog Publik (Beranda & Daftar Kampanye)
- **Routes:** `/` dan `/kampanye`
- **File:** [lib/data/campaigns.ts](file:///d:/project/web/donasi/lib/data/campaigns.ts)
- **Jenis Data Dummy:** `DUMMY_CAMPAIGNS` sebagai *Graceful Fallback*
- **Kondisi:** Kodenya sebenarnya sudah memanggil `supabase.from("campaigns")`. Namun karena saat ini tabel `campaigns` di database Supabase masih 0 baris, fungsi otomatis mengembalikan data dari `DUMMY_CAMPAIGNS`.
- **Seharusnya Pakai Data Real?** **Ya, ketika ada data kampanye di DB.** Begitu ada kampanye berstatus `active` di Supabase, halaman ini akan otomatis menampilkan data asli.

---

## 🎯 Rekomendasi Prioritas Perbaikan

Jika ingin menghubungkan halaman-halaman tersebut secara bertahap ke database Supabase, berikut adalah urutan prioritas berdasarkan urgensinya:

1. **Prioritas 1 (Paling Kritis - Transaksi & Alur Donasi):**
   - `/kampanye/[slug]/donasi` (Agar donasi masuk ke campaign ID Supabase yang benar).
   - `/admin/transaksi` (Agar admin bisa memverifikasi transfer riil donatur).
   - `/dashboard/riwayat-donasi` & `/dashboard` (Agar donatur melihat transaksi aslinya).
2. **Prioritas 2 (Manajemen Kampanye & Pencairan):**
   - `/galang-dana/kampanye-saya` & `/galang-dana/kampanye-baru`.
   - `/admin/kampanye` (Moderasi proposal kampanye asli).
   - `/admin/pencairan` & `/galang-dana/riwayat-pencairan`.
3. **Prioritas 3 (Profil, Verifikasi & Pengaturan):**
   - `/galang-dana/verifikasi-identitas` & `/admin/verifikasi-identitas`.
   - `/admin/pengguna` (Tabel `profiles`).
   - `/admin/pengaturan` (Tabel `platform_settings`).
   - `/dashboard/profil`, `/dashboard/notifikasi`, `/dashboard/doa-saya`.

*Catatan: Sesuai aturan Anda, belum ada perubahan kode yang dilakukan dalam sesi audit ini.*