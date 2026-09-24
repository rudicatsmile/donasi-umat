import Link from "next/link";
import { HandHeart, ShieldCheck, Heart, Users, Target, Award, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="py-12 lg:py-20 space-y-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl space-y-16">
        {/* Header Hero */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge variant="default" className="text-xs">Mengenal DonasiUmat</Badge>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
            Menghubungkan Hati yang Peduli dengan Mereka yang Menanti Harapan
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            DonasiUmat lahir dari sebuah tekad sederhana: menghadirkan platform galang dana dan sedekah online yang benar-benar transparan, amanah, dan dapat dipertanggungjawabkan hingga rupiah terakhir.
          </p>
        </div>

        {/* Visi & Misi Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-2xl border border-border bg-white p-8 shadow-xs space-y-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center text-primary">
              <Target className="h-6 w-6" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-foreground">Visi Kami</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Menjadi ekosistem crowdfunding sosial dan filantropi Islam/kemanusiaan paling tepercaya di Indonesia yang mengedepankan asas keterbukaan, akuntabilitas berbasis bukti, dan pemberdayaan berkelanjutan bagi kaum dhuafa.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-8 shadow-xs space-y-4">
            <div className="h-12 w-12 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600">
              <Award className="h-6 w-6" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-foreground">Misi Kami</h2>
            <ul className="text-sm text-muted-foreground space-y-2.5">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Memastikan 100% penggalang dana terverifikasi identitas hukumnya secara ketat.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Mewajibkan pelaporan penyaluran dana dengan foto bukti kuitansi nyata sebelum pencairan berikutnya.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Membangun jembatan silaturahmi melalui kolom doa dan kehangatan sesama umat manusia.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Nilai Utama Kami */}
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
              Nilai Utama & Etika Amanah
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Tiga pilar moral yang kami pegang teguh dalam setiap baris kode dan proses verifikasi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-border bg-white p-6 space-y-3 shadow-xs">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-heading font-black">
                01
              </div>
              <h3 className="font-heading font-bold text-lg text-foreground">Integritas & Kejujuran</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Kami menolak eksploitasi kesedihan (*no poverty porn*). Setiap narasi kampanye disajikan secara bermartabat dan objektif sesuai kondisi nyata di lapangan.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-white p-6 space-y-3 shadow-xs">
              <div className="h-10 w-10 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center font-heading font-black">
                02
              </div>
              <h3 className="font-heading font-bold text-lg text-foreground">Transparansi Mutlak</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Donatur berhak mengetahui ke mana dana mereka bermuara. Laporan pertanggungjawaban di DonasiUmat bukan sekadar formalitas, melainkan kewajiban hukum dan syar&apos;i.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-white p-6 space-y-3 shadow-xs">
              <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-heading font-black">
                03
              </div>
              <h3 className="font-heading font-bold text-lg text-foreground">Kecepatan Respons</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Untuk pasien darurat medis dan korban bencana, waktu adalah nyawa. Tim kami siaga memvalidasi kampanye dan bukti transfer dalam hitungan jam.
              </p>
            </div>
          </div>
        </div>

        {/* Tim Pengelola & Dewan Pengawas */}
        <div className="rounded-2xl border border-border bg-white p-8 shadow-xs space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="font-heading text-2xl font-bold text-foreground">Dewan Pembina & Pengelola</h2>
            <p className="text-xs text-muted-foreground">
              Dikelola oleh para profesional filantropi, akademisi, dan relawan kemanusiaan berpengalaman di Indonesia.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
            <div className="text-center space-y-2">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80"
                alt="Ir. H. Gunawan Wibisono"
                className="h-24 w-24 rounded-full mx-auto object-cover ring-4 ring-emerald-50"
              />
              <h4 className="font-heading font-bold text-sm text-foreground">Ir. H. Gunawan Wibisono, M.M.</h4>
              <p className="text-xs text-primary font-medium">Ketua Dewan Pembina</p>
            </div>
            <div className="text-center space-y-2">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80"
                alt="Ayu Kartika Sari"
                className="h-24 w-24 rounded-full mx-auto object-cover ring-4 ring-emerald-50"
              />
              <h4 className="font-heading font-bold text-sm text-foreground">Ayu Kartika Sari, S.Sos.</h4>
              <p className="text-xs text-primary font-medium">Direktur Eksekutif</p>
            </div>
            <div className="text-center space-y-2">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80"
                alt="Ustadz Dr. Salman Al-Farisi"
                className="h-24 w-24 rounded-full mx-auto object-cover ring-4 ring-emerald-50"
              />
              <h4 className="font-heading font-bold text-sm text-foreground">Dr. H. Salman Al-Farisi, M.A.</h4>
              <p className="text-xs text-primary font-medium">Dewan Pengawas Syariah</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4 pt-4">
          <h3 className="font-heading text-xl font-bold text-foreground">Siap Bergabung Menebar Kebaikan?</h3>
          <div className="flex justify-center gap-3">
            <Link href="/kampanye">
              <Button size="lg" className="font-bold">Mulai Berdonasi</Button>
            </Link>
            <Link href="/kontak">
              <Button size="lg" variant="outline">Hubungi Kami</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
