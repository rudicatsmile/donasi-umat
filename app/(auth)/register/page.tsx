"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, User, Phone, ArrowRight, ShieldCheck, HeartHandshake, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { registerAction } from "@/app/actions/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = React.useState<"donor" | "fundraiser">("donor");
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !password) {
      toast.error("Harap lengkapi semua kolom pendaftaran!");
      return;
    }
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("full_name", fullName);
      formData.append("email", email);
      formData.append("phone_wa", phone);
      formData.append("password", password);
      formData.append("role", role);

      const res = await registerAction(formData);
      if (res.success) {
        toast.success(res.message);
        if (role === "fundraiser") {
          router.push("/galang-dana/verifikasi-identitas");
        } else {
          router.push("/dashboard");
        }
      } else {
        toast.info(res.error || "Pendaftaran offline/demo berhasil!");
        if (role === "fundraiser") {
          router.push("/galang-dana/verifikasi-identitas");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat mendaftar");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
          Daftar Akun Baru
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Mulai langkah kebaikan Anda bersama ribuan Sahabat Umat di seluruh nusantara.
        </p>
      </div>

      {/* Role Selector Tabs */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-foreground">
          Mendaftar Sebagai:
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole("donor")}
            className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
              role === "donor"
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border bg-white hover:bg-slate-50"
            }`}
          >
            <HeartHandshake className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-heading font-bold text-xs sm:text-sm text-foreground">Donatur</p>
              <p className="text-[10px] text-muted-foreground">Berdonasi & pantau penyaluran</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setRole("fundraiser")}
            className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
              role === "fundraiser"
                ? "border-sky-500 bg-sky-50/50 ring-1 ring-sky-500"
                : "border-border bg-white hover:bg-slate-50"
            }`}
          >
            <Sparkles className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-heading font-bold text-xs sm:text-sm text-foreground">Penggalang</p>
              <p className="text-[10px] text-muted-foreground">Galang dana & buat kampanye</p>
            </div>
          </button>
        </div>
      </div>

      <form onSubmit={handleRegister} className="space-y-3.5">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Nama Lengkap Sesuai KTP</label>
          <div className="relative">
            <User className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Contoh: Dimas Nugraha"
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Alamat Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Nomor WhatsApp (+62) <span className="text-[10px] text-muted-foreground font-normal">(untuk notifikasi status)</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="081234567890"
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Kata Sandi <span className="text-[10px] text-muted-foreground font-normal">(Min. 8 karakter, huruf & angka)</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="pl-10"
              required
              minLength={8}
            />
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Dengan mendaftar, Anda menyetujui{" "}
          <Link href="/syarat-ketentuan" className="text-primary underline">Syarat & Ketentuan</Link>{" "}
          serta{" "}
          <Link href="/kebijakan-privasi" className="text-primary underline">Kebijakan Privasi</Link> DonasiUmat.
        </p>

        <Button
          type="submit"
          size="lg"
          disabled={isLoading}
          className="w-full font-bold shadow-md shadow-primary/20 gap-2 mt-2"
        >
          {isLoading ? "Mendaftarkan Akun..." : "Buat Akun Sekarang"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <div className="text-center text-xs text-muted-foreground pt-2 border-t border-border">
        Sudah memiliki akun terdaftar?{" "}
        <Link href="/login" className="text-primary font-bold hover:underline">
          Masuk di Sini
        </Link>
      </div>
    </div>
  );
}
