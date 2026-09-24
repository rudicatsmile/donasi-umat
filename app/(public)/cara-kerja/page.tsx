import Link from "next/link";
import {
  HandHeart,
  FileCheck,
  Building,
  UploadCloud,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Send,
  MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function HowItWorksPage() {
  return (
    <div className="py-12 lg:py-20 space-y-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl space-y-16">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge variant="default" className="text-xs">Panduan Lengkap</Badge>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
            Bagaimana Cara Kerja DonasiUmat?
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Proses donasi dan penggalangan dana dirancang sederhana, aman, dan mematuhi tata kelola amanah demi menjaga kepercayaan para pihak.
          </p>
        </div>

        {/* ALUR 1: Untuk Donatur */}
        <div className="rounded-2xl border border-border bg-white p-8 sm:p-10 shadow-xs space-y-8">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-primary">
              <HandHeart className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground">
                Alur Donasi untuk Sahabat Umat
              </h2>
              <p className="text-xs text-muted-foreground">4 langkah mudah berdonasi secara amanah</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-3">
              <div className="h-8 w-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="font-heading font-bold text-base text-foreground">Pilih Kampanye</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Jelajahi ratusan kampanye medis, beasiswa, atau bencana alam yang telah lolos verifikasi kepatuhan.
              </p>
            </div>

            <div className="space-y-3">
              <div className="h-8 w-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="font-heading font-bold text-base text-foreground">Transfer Manual</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Transfer nominal donasi beserta 3-digit kode unik ke rekening resmi yayasan (BCA, Mandiri, BNI, BRI, BSI).
              </p>
            </div>

            <div className="space-y-3">
              <div className="h-8 w-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="font-heading font-bold text-base text-foreground">Unggah Bukti</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Foto atau screenshot bukti transfer Anda, lalu unggah pada form donasi untuk diverifikasi admin kami.
              </p>
            </div>

            <div className="space-y-3">
              <div className="h-8 w-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h3 className="font-heading font-bold text-base text-foreground">Pantau Penyaluran</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Terima notifikasi WhatsApp saat donasi terverifikasi, kirim doa, dan pantau laporan foto penyaluran dana.
              </p>
            </div>
          </div>
        </div>

        {/* ALUR 2: Untuk Penggalang Dana */}
        <div className="rounded-2xl border border-border bg-white p-8 sm:p-10 shadow-xs space-y-8">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="h-10 w-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground">
                Alur Galang Dana untuk Fundraiser
              </h2>
              <p className="text-xs text-muted-foreground">Tahapan penggalangan dana yang transparan dan terukur</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-3">
              <div className="h-8 w-8 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="font-heading font-bold text-base text-foreground">Verifikasi KTP (Tier 1)</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Unggah KTP asli dan foto selfie memegang identitas. Tim admin memverifikasi keabsahan data pemohon.
              </p>
            </div>

            <div className="space-y-3">
              <div className="h-8 w-8 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="font-heading font-bold text-base text-foreground">Buat Kampanye (Tier 2)</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Isi cerita, rincian kebutuhan biaya, foto kondisi penerima manfaat, dan tanggal batas akhir kampanye.
              </p>
            </div>

            <div className="space-y-3">
              <div className="h-8 w-8 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="font-heading font-bold text-base text-foreground">Pencairan Bertahap</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ajukan pencairan dana terkumpul sesuai kebutuhan medis atau logistik untuk diverifikasi admin.
              </p>
            </div>

            <div className="space-y-3">
              <div className="h-8 w-8 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h3 className="font-heading font-bold text-base text-foreground">Wajib Lapor Berfoto</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Unggah kuitansi dan foto penyerahan bantuan. Pencairan berikutnya hanya dibuka jika laporan telah disetujui.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Quick Link */}
        <div className="text-center p-8 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-4">
          <h3 className="font-heading text-xl font-bold text-foreground">Masih Punya Pertanyaan Lain?</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Pelajari pertanyaan umum seputar verifikasi identitas, kode unik, dan keamanan data di pusat bantuan kami.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/faq">
              <Button className="font-bold">Buka Pusat FAQ</Button>
            </Link>
            <Link href="/kontak">
              <Button variant="outline">Kontak Tim Bantuan</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
