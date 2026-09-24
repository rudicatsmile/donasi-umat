import Link from "next/link";
import { HandHeart, ShieldCheck, HeartHandshake, CheckCircle } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">
      {/* Left Column: Inspirational Brand Showcase */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 p-12 text-white relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primary shadow-lg">
              <HandHeart className="h-6 w-6 text-primary" />
            </div>
            <span className="font-heading text-2xl font-black tracking-tight text-white">
              Donasi<span className="text-emerald-300">Umat</span>
            </span>
          </Link>
        </div>

        <div className="relative z-10 my-auto py-12 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-700/60 border border-emerald-500/40 px-3.5 py-1 text-xs text-emerald-200">
            <ShieldCheck className="h-4 w-4" />
            Platform Crowdfunding Amanah & Terbuka
          </div>
          <h1 className="font-heading text-3xl xl:text-4xl font-extrabold leading-tight">
            “Kebaikan sekecil apapun, bila dijaga amanahnya, akan mengalirkan sejuta harapan.”
          </h1>
          <p className="text-emerald-100/80 text-sm leading-relaxed">
            Bergabunglah bersama ribuan Sahabat Umat. Nikmati kemudahan berdonasi, pantau status verifikasi bukti transfer, dan saksikan penyaluran bantuan langsung melalui dokumentasi foto nyata.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-sm text-emerald-100">
              <CheckCircle className="h-5 w-5 text-emerald-300 shrink-0" />
              <span>Verifikasi berlapis untuk seluruh penggalang dana</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-emerald-100">
              <CheckCircle className="h-5 w-5 text-emerald-300 shrink-0" />
              <span>Laporan transparansi wajib berfoto & kuitansi asli</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-emerald-100">
              <CheckCircle className="h-5 w-5 text-emerald-300 shrink-0" />
              <span>Notifikasi pembaruan kampanye via WhatsApp resmi</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-6 border-t border-emerald-700/50 flex justify-between items-center text-xs text-emerald-200/70">
          <p>© {new Date().getFullYear()} DonasiUmat Indonesia</p>
          <div className="flex gap-4">
            <Link href="/syarat-ketentuan" className="hover:text-white">Syarat Ketentuan</Link>
            <Link href="/kebijakan-privasi" className="hover:text-white">Kebijakan Privasi</Link>
          </div>
        </div>
      </div>

      {/* Right Column: Form Container */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden flex justify-center mb-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-md">
                <HandHeart className="h-6 w-6" />
              </div>
              <span className="font-heading text-xl font-bold tracking-tight text-foreground">
                Donasi<span className="text-primary">Umat</span>
              </span>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
