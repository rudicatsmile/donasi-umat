import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  FileCheck2,
  Users,
  CheckCircle2,
  ArrowRight,
  HeartHandshake,
  HelpCircle,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function FundraiserLandingPage() {
  return (
    <div className="space-y-12 max-w-5xl mx-auto py-4">
      {/* Hero Card */}
      <div className="rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 p-8 sm:p-12 text-white relative overflow-hidden shadow-md">
        <div className="relative z-10 max-w-2xl space-y-4">
          <Badge variant="outline" className="border-emerald-300/40 text-emerald-200 bg-white/10 text-xs">
            Portal Penggalang Dana Amanah
          </Badge>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
            Mulai Galang Dana untuk Mereka yang Membutuhkan
          </h1>
          <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
            Bantu tetangga sakit kronis, renovasi sekolah rusak, atau korban bencana alam. Platform DonasiUmat memfasilitasi penggalangan dana Anda secara tertib, sah, dan transparan.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link href="/galang-dana/kampanye-baru">
              <Button size="lg" className="w-full sm:w-auto font-bold bg-white text-emerald-900 hover:bg-emerald-50">
                Buat Kampanye Baru
              </Button>
            </Link>
            <Link href="/galang-dana/verifikasi-identitas">
              <Button size="lg" variant="outline" className="w-full sm:w-auto font-semibold border-white/30 text-white hover:bg-white/10">
                Verifikasi Identitas Saya
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 3 Steps To Fundraise */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="font-heading text-2xl font-bold text-foreground">
            3 Langkah Memulai Galang Dana
          </h2>
          <p className="text-xs text-muted-foreground">
            Alur verifikasi berjenjang untuk memastikan amanah donatur senantiasa terjaga.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-3 shadow-xs">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-heading font-black text-sm">
              01
            </div>
            <h3 className="font-heading font-bold text-base text-foreground">
              Verifikasi Identitas (Tier 1)
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Upload foto KTP asli, selfie memegang KTP, dan rekening bank pencairan Anda. Admin akan memverifikasi dalam 1x24 jam.
            </p>
          </Card>

          <Card className="p-6 space-y-3 shadow-xs">
            <div className="h-10 w-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-heading font-black text-sm">
              02
            </div>
            <h3 className="font-heading font-bold text-base text-foreground">
              Susun Kampanye (Tier 2)
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tulis cerita kondisi penerima manfaat, tentukan target dana serta batas waktu, dan lampirkan foto dokumentasi asli.
            </p>
          </Card>

          <Card className="p-6 space-y-3 shadow-xs">
            <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-heading font-black text-sm">
              03
            </div>
            <h3 className="font-heading font-bold text-base text-foreground">
              Salurkan & Unggah Laporan
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ajukan pencairan dana ke rekening Anda, salurkan bantuan, dan laporkan dengan foto bukti kuitansi kepada donatur.
            </p>
          </Card>
        </div>
      </div>

      {/* Quick Links Card */}
      <Card className="p-6 sm:p-8 bg-slate-50/70 border-border shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-heading font-bold text-base text-foreground">
              Sudah Pernah Membuat Kampanye Sebelumnya?
            </h3>
            <p className="text-xs text-muted-foreground">
              Kelola kabar update, ajukan pencairan dana, atau upload laporan transparansi.
            </p>
          </div>
          <Link href="/galang-dana/kampanye-saya">
            <Button variant="default" className="font-bold">
              Buka Kampanye Saya
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
