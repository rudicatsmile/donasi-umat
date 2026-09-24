import Link from "next/link";
import {
  HandHeart,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Heart,
  TrendingUp,
  FileText,
  AlertCircle,
  Users,
  Search,
  Building,
  HeartPulse,
  GraduationCap,
  Flame,
  Home,
  Landmark,
  Accessibility,
  Trees,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CampaignCard } from "@/components/campaign/campaign-card";
import { getCampaigns, getCategories } from "@/lib/data/campaigns";
import { getAdminPlatformStats } from "@/lib/data/admin";
import { formatRupiah } from "@/lib/utils";

// Icon mapping helper
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  HeartPulse,
  GraduationCap,
  Flame,
  Home,
  Landmark,
  Accessibility,
  Users,
  Trees,
};

export default async function HomePage() {
  const [urgentCampaigns, featuredCampaigns, categories, stats] = await Promise.all([
    getCampaigns({ isUrgent: true, limit: 3 }),
    getCampaigns({ limit: 6 }),
    getCategories(),
    getAdminPlatformStats(),
  ]);

  return (
    <div className="space-y-16 lg:space-y-24 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-white to-background pt-10 pb-16 lg:pt-16 lg:pb-24">
        {/* Soft background accents */}
        <div className="absolute top-10 right-0 -mr-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100/80 px-4 py-1.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-600/20 shadow-xs">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Platform Galang Dana Amanah #1 dengan Foto Bukti Penyaluran</span>
              </div>

              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
                Berbagi Mudah, <br />
                <span className="text-primary bg-gradient-to-r from-emerald-700 via-primary to-teal-600 bg-clip-text text-transparent">
                  Amanah Terjaga
                </span> Sampai ke Penerima
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Hubungkan niat baik Anda dengan saudara yang membutuhkan. Setiap donasi diverifikasi dengan aman, dilengkapi doa tulus, dan wajib dilaporkan dengan dokumentasi foto nyata.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link href="/kampanye" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto gap-2 text-base font-bold shadow-md shadow-primary/20">
                    <HandHeart className="h-5 w-5" />
                    Donasi Sekarang
                  </Button>
                </Link>
                <Link href="/galang-dana" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 text-base font-semibold border-slate-300">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    Mulai Galang Dana
                  </Button>
                </Link>
              </div>

              {/* Trust micro-indicators */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Verifikasi KTP Penggalang</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Transfer Manual Rekening Resmi</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Audit Trail Transparan</span>
                </div>
              </div>
            </div>

            {/* Right Card Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative rounded-2xl bg-white p-3 shadow-xl ring-1 ring-border/80">
                  <CampaignCard campaign={urgentCampaigns[0]} />
                </div>
                {/* Floating Stat Pill */}
                <div className="absolute -bottom-5 -left-4 sm:-left-6 rounded-xl bg-white p-3.5 shadow-lg border border-border flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground font-medium">Donasi Terkumpul Hari Ini</p>
                    <p className="font-heading font-extrabold text-sm text-foreground">Rp 42.850.000+</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Platform Statistics Bar */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="rounded-2xl bg-white p-6 sm:p-8 border border-border shadow-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-border">
            <div className="pt-4 md:pt-0">
              <p className="font-heading font-black text-2xl sm:text-3xl text-primary tabular-nums">
                {formatRupiah(stats.totalCollected || 12450000000)}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">Total Dana Tersalurkan</p>
            </div>
            <div className="pt-4 md:pt-0">
              <p className="font-heading font-black text-2xl sm:text-3xl text-foreground tabular-nums">
                {stats.activeCampaigns || 342}+
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">Kampanye Berhasil</p>
            </div>
            <div className="pt-4 md:pt-0">
              <p className="font-heading font-black text-2xl sm:text-3xl text-foreground tabular-nums">
                {(stats.totalDonors || 48210).toLocaleString("id-ID")}+
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">Sahabat Umat Berdonasi</p>
            </div>
            <div className="pt-4 md:pt-0">
              <p className="font-heading font-black text-2xl sm:text-3xl text-emerald-600">
                100%
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">Laporan Transparansi Berfoto</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Kampanye Mendesak / Urgent Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />
              <Badge variant="destructive" className="font-semibold text-xs">
                Butuh Bantuan Segera
              </Badge>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
              Kampanye Darurat & Kritis
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Pasien kritis dan korban bencana membutuhkan uluran tangan Anda hari ini.
            </p>
          </div>
          <Link href="/kampanye?filter=mendesak">
            <Button variant="ghost" className="gap-1.5 text-primary hover:text-primary-hover font-semibold">
              Lihat Semua Mendesak
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {urgentCampaigns.slice(0, 3).map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      </section>

      {/* 4. Kategori Populer */}
      <section className="bg-slate-50/70 border-y border-border py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
              Pilih Kategori Kebaikan
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Salurkan kepedulian Anda pada sektor yang paling dekat di hati Anda.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
            {categories.map((cat: any) => {
              const iconKey = cat.icon || cat.iconName || "HeartPulse";
              const IconComp = CATEGORY_ICONS[iconKey] || Heart;
              return (
                <Link
                  key={cat.id}
                  href={`/kampanye?kategori=${cat.slug}`}
                  className="group rounded-xl border border-border bg-white p-5 text-center shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-sm"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-primary transition-colors group-hover:bg-primary group-hover:text-white mb-3">
                    <IconComp className="h-6 w-6" />
                  </div>
                  <h3 className="font-heading font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {cat.campaignCount || 0} Kampanye Aktif
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Kampanye Pilihan Lainnya */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <Badge variant="default" className="mb-2">Program Unggulan</Badge>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
              Bantu Mereka Tersenyum Kembali
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Setiap donasi disalurkan amanah dan diawasi ketat oleh dewan pengawas DonasiUmat.
            </p>
          </div>
          <Link href="/kampanye">
            <Button variant="outline" className="gap-1.5 font-semibold">
              Jelajahi Semua Kampanye
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCampaigns.slice(0, 6).map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      </section>

      {/* 6. Mengapa DonasiUmat? (Trust & Features) */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-8 sm:p-12 lg:p-16 text-white relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-6">
            <Badge variant="outline" className="border-emerald-400/40 text-emerald-300 bg-emerald-950/40">
              Prinsip Keterbukaan
            </Badge>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold leading-tight">
              Mengapa Berdonasi di DonasiUmat Lebih Tenang & Terpercaya?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Kami percaya bahwa amanah adalah ruh dari setiap sedekah dan donasi. Oleh karenanya, sistem kami dibangun dengan standar akuntabilitas tanpa kompromi.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-xs border border-white/10 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white">Verifikasi Identitas Ketat</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Setiap penggalang dana wajib mengunggah KTP asli dan selfie identitas yang diverifikasi manual oleh tim kepatuhan kami sebelum kampanye boleh diterbitkan.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-xs border border-white/10 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-sky-500 flex items-center justify-center text-white">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white">Laporan Wajib Berfoto</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Penggalang dana tidak dapat mencairkan dana tahap berikutnya sebelum mengunggah laporan penggunaan dana yang disertai bukti kuitansi dan dokumentasi foto nyata.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-xs border border-white/10 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center text-white">
                <Heart className="h-5 w-5" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white">Kolom Doa & Komunitas</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Setiap donatur dapat menyematkan doa yang menghangatkan hati penerima manfaat. Terdapat juga opsi donasi anonim sebagai &ldquo;Hamba Allah&rdquo; demi menjaga keikhlasan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Call To Action (Galang Dana) */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
              Punya Saudara atau Tetangga yang Butuh Bantuan?
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Jangan biarkan mereka berjuang sendirian. Buat kampanye galang dana sosial gratis dan salurkan bantuan kepada yang berhak dengan cepat dan transparan.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link href="/galang-dana">
              <Button size="lg" className="w-full md:w-auto font-bold shadow-md">
                Mulai Galang Dana Sekarang
              </Button>
            </Link>
            <Link href="/cara-kerja">
              <Button size="lg" variant="outline" className="w-full md:w-auto font-semibold">
                Pelajari Alurnya
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
