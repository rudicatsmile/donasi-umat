"use client";

import * as React from "react";
import { User, Mail, Phone, Lock, Camera, CheckCircle2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

export default function DonorProfilePage() {
  const [fullName, setFullName] = React.useState("Dimas Nugraha");
  const [email] = React.useState("dimas.nugraha@gmail.com");
  const [phone, setPhone] = React.useState("+6281234567890");
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Profil dan nomor WhatsApp berhasil diperbarui!");
    }, 800);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      toast.error("Konfirmasi kata sandi baru tidak cocok!");
      return;
    }
    toast.success("Kata sandi berhasil diubah!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
          Profil Akun Saya
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Kelola data diri dan nomor WhatsApp untuk penerimaan bukti verifikasi donasi.
        </p>
      </div>

      {/* Main Profile Info Form */}
      <Card className="p-6 sm:p-8 space-y-6 shadow-xs">
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-border">
            <div className="relative">
              <Avatar className="h-24 w-24 ring-4 ring-emerald-50">
                <AvatarFallback className="bg-emerald-100 text-emerald-800 text-2xl font-bold">
                  DN
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-primary-hover"
                title="Ganti Foto Profil"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="font-heading font-bold text-lg text-foreground">{fullName}</h3>
              <p className="text-xs text-muted-foreground">{email}</p>
              <span className="inline-block text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 mt-1">
                Akun Donatur Terverifikasi
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Nama Lengkap</label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Alamat Email</label>
              <Input value={email} disabled className="bg-slate-50 cursor-not-allowed" />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Nomor WhatsApp Aktif</span>
                <span className="text-[11px] font-normal text-emerald-600">Digunakan untuk notifikasi WhatsApp Gateway</span>
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+6281234567890"
                required
              />
            </div>
          </div>

          <Button type="submit" disabled={isSaving} className="gap-2 font-bold">
            <Save className="h-4 w-4" />
            {isSaving ? "Menyimpan..." : "Simpan Perubahan Data"}
          </Button>
        </form>
      </Card>

      {/* Password Change Form */}
      <Card className="p-6 sm:p-8 space-y-4 shadow-xs">
        <h3 className="font-heading font-bold text-lg text-foreground border-b border-border pb-3">
          Ubah Kata Sandi
        </h3>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Kata Sandi Saat Ini</label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Kata Sandi Baru</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                required
                minLength={8}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Konfirmasi Kata Sandi Baru</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi kata sandi baru"
                required
                minLength={8}
              />
            </div>
          </div>

          <Button type="submit" variant="outline" className="font-semibold">
            Perbarui Kata Sandi
          </Button>
        </form>
      </Card>
    </div>
  );
}
