import Link from "next/link";
import { HandHeart, ShieldCheck, Heart, Mail, Phone, MapPin, CheckCircle2 } from "lucide-react";
import { OFFICIAL_BANK_ACCOUNTS } from "@/lib/dummy-data";

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-slate-900 text-slate-200">
      {/* Trust bar */}
      <div className="border-b border-slate-800 bg-slate-950/60 py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Verifikasi Identitas Penggalang</h4>
                <p className="text-xs text-slate-400">Review KTP & keabsahan proposal oleh admin</p>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">100% Penyaluran Transparan</h4>
                <p className="text-xs text-slate-400">Wajib upload kuitansi & dokumentasi foto</p>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                <Heart className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Kolom Doa & Komunitas Hangat</h4>
                <p className="text-xs text-slate-400">Saling menguatkan antar sesama hamba Allah</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-md">
                <HandHeart className="h-6 w-6" />
              </div>
              <span className="font-heading text-2xl font-extrabold tracking-tight text-white">
                Donasi<span className="text-emerald-400">Umat</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              DonasiUmat adalah platform crowdfunding sosial yang menghubungkan para penggalang dana amanah dengan para donatur dermawan melalui laporan penyaluran dana yang dapat dipertanggungjawabkan dengan bukti foto nyata.
            </p>
            <div className="pt-2 text-xs text-slate-400 space-y-1.5">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Jl. RS Fatmawati No. 88, Cilandak, Jakarta Selatan, DKI Jakarta 12430</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>WhatsApp Pengaduan / CS: +62 812-3456-7890</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>bantuan@donasiumat.id</span>
              </div>
            </div>
          </div>

          {/* Navigasi Kategori */}
          <div>
            <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-white mb-4">
              Kategori Donasi
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/kampanye?kategori=kesehatan" className="hover:text-emerald-400 transition-colors">
                  Kesehatan & Medis
                </Link>
              </li>
              <li>
                <Link href="/kampanye?kategori=pendidikan" className="hover:text-emerald-400 transition-colors">
                  Pendidikan & Beasiswa
                </Link>
              </li>
              <li>
                <Link href="/kampanye?kategori=bencana-alam" className="hover:text-emerald-400 transition-colors">
                  Bencana Alam
                </Link>
              </li>
              <li>
                <Link href="/kampanye?kategori=panti-asuhan" className="hover:text-emerald-400 transition-colors">
                  Panti Asuhan & Yatim
                </Link>
              </li>
              <li>
                <Link href="/kampanye?kategori=rumah-ibadah" className="hover:text-emerald-400 transition-colors">
                  Rumah Ibadah & Pondok
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigasi Platform */}
          <div>
            <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-white mb-4">
              Tentang & Bantuan
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/sedekah-subuh" className="hover:text-emerald-400 transition-colors">
                  Sedekah Subuh Rutin
                </Link>
              </li>
              <li>
                <Link href="/zakat" className="hover:text-emerald-400 transition-colors">
                  Kalkulator Zakat & BSZ
                </Link>
              </li>
              <li>
                <Link href="/tentang" className="hover:text-emerald-400 transition-colors">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="/cara-kerja" className="hover:text-emerald-400 transition-colors">
                  Cara Kerja & Alur Donasi
                </Link>
              </li>
              <li>
                <Link href="/galang-dana" className="hover:text-emerald-400 transition-colors">
                  Panduan Galang Dana
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-emerald-400 transition-colors">
                  Pusat Pertanyaan (FAQ)
                </Link>
              </li>
              <li>
                <Link href="/kontak" className="hover:text-emerald-400 transition-colors">
                  Hubungi Layanan Donatur
                </Link>
              </li>
            </ul>
          </div>

          {/* Rekening Resmi */}
          <div>
            <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-white mb-4">
              Rekening Resmi Yayasan
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Transfer manual resmi hanya disalurkan ke nomor rekening berbadan hukum berikut:
            </p>
            <div className="space-y-2">
              {OFFICIAL_BANK_ACCOUNTS.slice(0, 3).map((bank) => (
                <div key={bank.bankName} className="rounded-lg bg-slate-800/80 p-2.5 border border-slate-700/60">
                  <div className="flex justify-between items-center text-xs font-semibold text-white">
                    <span>{bank.bankName}</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">
                      {bank.badge}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-amber-300 font-bold mt-1">
                    {bank.accountNumber}
                  </p>
                  <p className="text-[10px] text-slate-400">a.n {bank.accountHolder}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} DonasiUmat Indonesia. Seluruh hak cipta dilindungi undang-undang.</p>
          <div className="flex gap-6">
            <Link href="/syarat-ketentuan" className="hover:text-white transition-colors">
              Syarat & Ketentuan
            </Link>
            <Link href="/kebijakan-privasi" className="hover:text-white transition-colors">
              Kebijakan Privasi
            </Link>
            <Link href="/admin/dashboard" className="text-slate-500 hover:text-slate-300 transition-colors">
              Portal Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
