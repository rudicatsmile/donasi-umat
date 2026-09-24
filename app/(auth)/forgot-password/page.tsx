"use client";

import * as React from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
      toast.success("Tautan atur ulang kata sandi telah dikirimkan ke email Anda.");
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Halaman Masuk
      </Link>

      <div className="space-y-2">
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
          Lupa Kata Sandi?
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Masukkan alamat email terdaftar Anda. Kami akan mengirimkan tautan pemulihan kata sandi.
        </p>
      </div>

      {submitted ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-emerald-100 text-primary flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading font-bold text-base text-foreground">
              Periksa Kotak Masuk Email Anda
            </h3>
            <p className="text-xs text-muted-foreground">
              Kami telah mengirimkan instruksi ke <strong>{email}</strong>. Silakan klik tautan tersebut untuk membuat kata sandi baru.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
            Kirim Ulang Tautan
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Alamat Email Terdaftar</label>
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

          <Button
            type="submit"
            size="lg"
            disabled={isLoading}
            className="w-full font-bold shadow-md shadow-primary/20 gap-2"
          >
            {isLoading ? "Mengirim Tautan..." : "Kirim Tautan Pemulihan"}
            <Send className="h-4 w-4" />
          </Button>
        </form>
      )}
    </div>
  );
}
