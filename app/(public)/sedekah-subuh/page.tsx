import * as React from "react";
import { 
  Sunrise, 
  Heart, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  MessageSquare, 
  Coins, 
  Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function SedekahSubuhLandingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24 bg-gradient-to-b from-amber-500/10 via-emerald-500/5 to-transparent">
        <div className="container max-w-6xl mx-auto px-4 text-center space-y-6">
          <Badge className="px-4 py-1.5 bg-amber-500/15 text-amber-900 border-amber-500/30 gap-1.5 font-semibold text-xs mx-auto">
            <Sunrise className="h-4 w-4 text-amber-600" />
            Amalan Rutin Pembuka Pintu Rezeki & Penolak Bala
          </Badge>

          <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl font-extrabold text-foreground tracking-tight max-w-4xl mx-auto leading-tight">
            Iringi Awal Hari dengan Doa Malaikat Melalui <span className="text-emerald-700 underline decoration-amber-400 decoration-wavy underline-offset-8">Sedekah Subuh Rutin</span>
          </h1>

          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Tidak ada satu subuh pun yang terbit kecuali turun dua malaikat berdoa: <i>"Ya Allah, berikanlah pengganti bagi orang yang berinfak..."</i> (HR. Bukhari & Muslim).
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild size="lg" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 px-8 text-base shadow-lg shadow-emerald-600/20">
              <Link href="/dashboard/sedekah-subuh">
                Mulai Komitmen Sedekah Subuh
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-12 px-6 font-semibold">
              <Link href="#cara-kerja">
                Pelajari Cara Kerjanya
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Keutamaan Hadits Box */}
      <section className="py-10 bg-white border-y border-slate-100">
        <div className="container max-w-4xl mx-auto px-4">
          <Card className="p-6 sm:p-8 bg-gradient-to-r from-emerald-900 to-slate-900 text-white shadow-xl rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Sunrise className="h-48 w-48 text-amber-400" />
            </div>
            <div className="relative space-y-4">
              <Badge className="bg-amber-400/20 text-amber-300 border-amber-400/30 text-xs">
                Kalam Rasulullah ﷺ
              </Badge>
              <p className="font-serif text-lg sm:text-xl leading-relaxed text-emerald-50 italic">
                "Tidak ada suatu hari pun ketika seorang hamba memasuki waktu pagi hari melainkan dua malaikat turun. Salah satunya berdoa: 'Ya Allah, berikanlah ganti bagi orang yang berinfak.' Dan yang satunya lagi berdoa: 'Ya Allah, berikanlah kehancuran bagi orang yang menahan hartanya.'"
              </p>
              <div className="text-xs text-emerald-300 font-semibold">
                — Shahih Bukhari No. 1442 & Shahih Muslim No. 1010
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Cara Kerja Titipan Saldo Komitmen */}
      <section id="cara-kerja" className="py-16 md:py-20">
        <div className="container max-w-6xl mx-auto px-4 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-foreground">
              Bagaimana Sedekah Subuh Rutin Bekerja?
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Anda tidak perlu repot membuka m-Banking setiap hari pada jam 04:30 pagi. Sistem **Titipan Saldo Komitmen Amanah** DonasiUmat menyalurkannya tepat waktu untuk Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 bg-white border-slate-200 shadow-xs space-y-4 rounded-xl relative">
              <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl font-heading">
                1
              </div>
              <h3 className="font-heading font-bold text-lg text-foreground">
                Tentukan Komitmen & Isi Saldo
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Pilih target harian Anda (misal Rp 10.000 / hari) dan isi saldo komitmen untuk 30 hari ke depan (Rp 300.000) melalui transfer manual satu kali saja.
              </p>
            </Card>

            <Card className="p-6 bg-white border-slate-200 shadow-xs space-y-4 rounded-xl relative">
              <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xl font-heading">
                2
              </div>
              <h3 className="font-heading font-bold text-lg text-foreground">
                Penyaluran Otomatis Tiap Subuh
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Setiap adzan Subuh berkumandang (pukul 04:30 WIB), sistem memotong saldo komitmen Anda dan langsung mengalokasikannya ke pasien darurat atau santri yatim.
              </p>
            </Card>

            <Card className="p-6 bg-white border-slate-200 shadow-xs space-y-4 rounded-xl relative">
              <div className="h-12 w-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xl font-heading">
                3
              </div>
              <h3 className="font-heading font-bold text-lg text-foreground">
                Laporan Fajar Langsung ke WhatsApp
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Awali fajar Anda dengan notifikasi WhatsApp berisi nama kampanye penerima manfaat, kuitansi donasi hari itu, dan doa berkah untuk Anda sekeluarga.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="py-16 bg-emerald-900 text-white">
        <div className="container max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="font-heading text-2xl sm:text-4xl font-extrabold tracking-tight">
            Jadikan Sedekah Subuh Kebiasaan Terbaik Anda
          </h2>
          <p className="text-xs sm:text-base text-emerald-200 max-w-xl mx-auto leading-relaxed">
            Mulai dari Rp 5.000 per hari, hadirkan senyuman bagi dhuafa yang membutuhkan di saat fajar menyingsing.
          </p>
          <Button asChild size="lg" className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-extrabold h-12 px-8 text-base shadow-lg">
            <Link href="/dashboard/sedekah-subuh">
              Atur Sedekah Subuh Saya Sekarang
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

    </div>
  );
}
