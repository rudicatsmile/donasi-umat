import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export default function TermsConditionsPage() {
  return (
    <div className="py-12 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Beranda
        </Link>

        <div className="space-y-3">
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Syarat & Ketentuan Layanan
          </h1>
          <p className="text-xs text-muted-foreground">
            Terakhir diperbarui: 24 September 2026 • Versi 1.2
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-white p-8 sm:p-10 shadow-xs prose max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-6">
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-foreground">1. Ketentuan Umum</h2>
            <p>
              Selamat datang di DonasiUmat. Dengan mengakses, mendaftar, atau menggunakan layanan platform ini baik sebagai Donatur maupun Penggalang Dana, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh isi Syarat & Ketentuan ini secara sadar tanpa paksaan.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-foreground">2. Verifikasi Identitas Penggalang Dana</h2>
            <p>
              Seluruh penggalang dana wajib melewati Verifikasi Identitas Tier 1 dengan menyerahkan data KTP/SIM/Paspor asli yang sah serta foto selfie. DonasiUmat berhak menolak, menangguhkan, atau membatalkan pengajuan kampanye apabila dokumen terindikasi tidak valid, kedaluwarsa, atau memuat unsur manipulasi.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-foreground">3. Tata Cara Donasi & Transfer Manual</h2>
            <p>
              Donatur menyetujui bahwa seluruh proses penyaluran donasi pada versi MVP ini dilakukan melalui metode transfer bank manual ke rekening resmi Yayasan DonasiUmat Indonesia. Donatur bertanggung jawab memastikan transfer dilakukan tepat sesuai nominal donasi ditambah 3-digit kode unik verifikasi.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-foreground">4. Kewajiban Laporan Transparansi</h2>
            <p>
              Penggalang dana yang telah mencairkan dana donasi berkewajiban secara mutlak untuk mengunggah Laporan Transparansi Penyaluran Dana yang disertai bukti nota, kuitansi, atau foto penyerahan bantuan dalam tempo selambat-lambatnya 30 (tiga puluh) hari kalender sejak dana ditransfer. Pelanggaran atas klausul ini berakibat pemblokiran akun dan tindakan hukum sesuai perundang-undangan yang berlaku di Republik Indonesia.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-foreground">5. Larangan Konten & Anti-Penipuan</h2>
            <p>
              Dilarang keras membuat kampanye yang berkaitan dengan pendanaan terorisme, pencucian uang, kegiatan politik praktis, produk terlarang, atau eksploitasi anak yang melanggar norma hukum dan syariah.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
