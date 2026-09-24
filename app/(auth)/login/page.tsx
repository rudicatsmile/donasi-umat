"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { loginAction } from "@/app/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("dimas.nugraha@gmail.com");
  const [password, setPassword] = React.useState("rahasia123");
  const [role, setRole] = React.useState<"donor" | "fundraiser" | "admin">("donor");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      const res = await loginAction(formData);
      if (res.success) {
        toast.success(res.message || "Berhasil masuk!");
        const targetRole = res.role || role;
        if (targetRole === "admin") {
          router.push("/admin/dashboard");
        } else if (targetRole === "fundraiser") {
          router.push("/galang-dana/kampanye-saya");
        } else {
          router.push("/dashboard");
        }
      } else {
        toast.success(`Masuk dengan mode Demo (${role.toUpperCase()})`);
        if (role === "admin") {
          router.push("/admin/dashboard");
        } else if (role === "fundraiser") {
          router.push("/galang-dana/kampanye-saya");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat masuk");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickRole = (targetRole: "donor" | "fundraiser" | "admin") => {
    setRole(targetRole);
    if (targetRole === "donor") {
      setEmail("dimas.nugraha@gmail.com");
      setPassword("rahasia123");
    } else if (targetRole === "fundraiser") {
      setEmail("ahmad.syafii@sahabatinsan.id");
      setPassword("rahasia123");
    } else {
      setEmail("admin.rizky@donasiumat.id");
      setPassword("adminAmanah2026");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
          Masuk ke Akun Anda
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Pantau riwayat donasi atau kelola kampanye galang dana amanah Anda.
        </p>
      </div>

      {/* Demo Role Selector Bar */}
      <div className="p-3 rounded-xl bg-slate-100/90 border border-slate-200/80 space-y-2">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-center">
          Pilih Peran Demo untuk Menguji:
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => handleQuickRole("donor")}
            className={`py-1.5 px-2 text-xs font-semibold rounded-lg transition-all ${
              role === "donor"
                ? "bg-white text-emerald-700 shadow-xs border border-emerald-200"
                : "text-slate-600 hover:text-foreground"
            }`}
          >
            Donatur
          </button>
          <button
            type="button"
            onClick={() => handleQuickRole("fundraiser")}
            className={`py-1.5 px-2 text-xs font-semibold rounded-lg transition-all ${
              role === "fundraiser"
                ? "bg-white text-sky-700 shadow-xs border border-sky-200"
                : "text-slate-600 hover:text-foreground"
            }`}
          >
            Penggalang
          </button>
          <button
            type="button"
            onClick={() => handleQuickRole("admin")}
            className={`py-1.5 px-2 text-xs font-semibold rounded-lg transition-all ${
              role === "admin"
                ? "bg-white text-amber-700 shadow-xs border border-amber-200"
                : "text-slate-600 hover:text-foreground"
            }`}
          >
            Admin
          </button>
        </div>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
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
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-foreground">Kata Sandi</label>
            <Link
              href="/forgot-password"
              className="text-primary hover:underline font-medium"
            >
              Lupa sandi?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="pl-10"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={isLoading}
          className="w-full font-bold shadow-md shadow-primary/20 gap-2 mt-2"
        >
          {isLoading ? "Memproses Masuk..." : "Masuk Sekarang"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <div className="text-center text-xs text-muted-foreground pt-2 border-t border-border">
        Belum memiliki akun DonasiUmat?{" "}
        <Link href="/register" className="text-primary font-bold hover:underline">
          Daftar Gratis di Sini
        </Link>
      </div>
    </div>
  );
}
