import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

export default function PrivacyPolicyPage() {
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
            Kebijakan Privasi & Perlindungan Data
          </h1>
          <p className="text-xs text-muted-foreground">
            Terakhir diperbarui: 24 September 2026 • Sesuai UU No. 27 Tahun 2022 (UU PDP)
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-white p-8 sm:p-10 shadow-xs prose max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-6">
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-foreground">1. Komitmen Privasi Kami</h2>
            <p>
              Yayasan DonasiUmat Indonesia berkomitmen melindungi privasi dan keamanan data pribadi seluruh pengguna platform, baik Donatur maupun Penggalang Dana, sesuai amanat Undang-Undang Perlindungan Data Pribadi (UU PDP).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-foreground">2. Data Pribadi yang Kami Kumpulkan</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-sm">
              <li><strong>Data Akun:</strong> Nama lengkap, alamat email, kata sandi terenkripsi, nomor WhatsApp aktif.</li>
              <li><strong>Data Verifikasi Penggalang (Tier 1):</strong> NIK, foto KTP/SIM/Paspor, foto selfie memegang identitas, data rekening bank pencairan.</li>
              <li><strong>Data Transaksi:</strong> Nominal donasi, kode unik, bukti transfer bank, doa/pesan yang Anda sematkan.</li>
              <li><strong>Data Teknis:</strong> Alamat IP, user-agent browser, dan log audit akses sistem demi keperluan keamanan.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-foreground">3. Perlindungan & Enkripsi Dokumen Sensitif</h2>
            <p>
              Foto KTP dan bukti transfer disimpan dalam server penyimpanan terenkripsi yang hanya dapat diakses melalui tautan sementara (*signed URL* dengan masa kedaluwarsa 5 menit) oleh verifikator berwenang. Nomor NIK pada sistem disamarkan (*masked*) untuk mencegah penyalahgunaan.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-foreground">4. Opsi Anonimitas Donatur</h2>
            <p>
              Donatur memiliki hak penuh untuk memilih opsi donasi sebagai &ldquo;Hamba Allah&rdquo;. Dalam opsi ini, nama asli dan identitas donatur tidak akan pernah ditampilkan pada halaman publik kampanye.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-foreground">5. Hubungi Pejabat Perlindungan Data (DPO)</h2>
            <p>
              Apabila Anda memiliki pertanyaan, keberatan, atau ingin meminta penghapusan data pribadi Anda dari sistem kami, silakan kirimkan permohonan ke surel resmi: <code>dpo@donasiumat.id</code>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
