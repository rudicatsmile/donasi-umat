"use client";

import * as React from "react";
import {
  ShieldCheck,
  UploadCloud,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  Building,
  CreditCard,
  User,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { submitIdentityVerificationAction } from "@/app/actions/identity";

export default function IdentityVerificationPage() {
  const [status, setStatus] = React.useState<"verified" | "pending" | "none">("verified");
  const [idType, setIdType] = React.useState("ktp");
  const [idNumber, setIdNumber] = React.useState("3273010508820001");
  const [fullName, setFullName] = React.useState("AHMAD SYAFI'I");
  const [address, setAddress] = React.useState("Komplek Pesantren Al-Hidayah, Desa Sukamaju, Kec. Cililin, Kab. Bandung Barat");
  const [bankName, setBankName] = React.useState("Bank Mandiri");
  const [bankAccountNumber, setBankAccountNumber] = React.useState("1310019283746");
  const [bankAccountHolder, setBankAccountHolder] = React.useState("YAYASAN SAHABAT INSAN AMANAH");

  const [idPhoto, setIdPhoto] = React.useState<string | null>(
    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80"
  );
  const [selfiePhoto, setSelfiePhoto] = React.useState<string | null>(
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80"
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("id_type", idType);
      formData.append("id_number", idNumber);
      formData.append("full_name_on_id", fullName);
      formData.append("address", address);
      formData.append("bank_name", bankName);
      formData.append("bank_account_number", bankAccountNumber);
      formData.append("bank_account_holder", bankAccountHolder);
      if (idPhoto) formData.append("id_photo_url", idPhoto);
      if (selfiePhoto) formData.append("selfie_photo_url", selfiePhoto);

      const res = await submitIdentityVerificationAction(formData);
      if (res.success) {
        setStatus("pending");
        toast.success(res.message);
      } else {
        toast.error(res.error || "Gagal mengajukan verifikasi");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
          Verifikasi Identitas Penggalang (Tier 1)
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Tahapan wajib kepatuhan hukum sebelum membuat kampanye dan menerima pencairan dana donatur.
        </p>
      </div>

      {/* Current Status Banner */}
      {status === "verified" && (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50/80 p-5 flex items-start gap-4 shadow-xs">
          <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-base text-emerald-950">
                Identitas Anda Telah Terverifikasi (Tier 1)
              </h3>
              <Badge variant="success">Aktif & Sah</Badge>
            </div>
            <p className="text-xs text-emerald-800/90 leading-relaxed">
              Selamat! Akun Anda telah memenuhi seluruh syarat verifikasi hukum DonasiUmat. Anda memiliki hak penuh untuk membuat kampanye baru dan mengajukan pencairan dana.
            </p>
          </div>
        </div>
      )}

      {status === "pending" && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50/80 p-5 flex items-start gap-4 shadow-xs">
          <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-base text-amber-950">
                Pengajuan Sedang Ditinjau Admin
              </h3>
              <Badge variant="accent">Pending Review</Badge>
            </div>
            <p className="text-xs text-amber-900/80 leading-relaxed">
              Dokumen KTP dan foto selfie Anda sedang diperiksa manual oleh tim verifikasi kami. Proses ini memakan waktu maksimal 1x24 jam kerja.
            </p>
          </div>
        </div>
      )}

      {/* Verification Form Card */}
      <Card className="p-6 sm:p-8 space-y-6 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-b border-border pb-4 space-y-1">
            <h3 className="font-heading font-bold text-base text-foreground">
              1. Data Dokumen Kependudukan
            </h3>
            <p className="text-xs text-muted-foreground">
              Pastikan data sama persis dengan yang tertera pada kartu identitas resmi Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Jenis Identitas</label>
              <select
                aria-label="Jenis Identitas"
                value={idType}
                onChange={(e) => setIdType(e.target.value)}
                disabled={status === "verified"}
                className="w-full h-11 rounded-lg border border-border bg-white px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs disabled:bg-slate-50"
              >
                <option value="ktp">KTP (Kartu Tanda Penduduk)</option>
                <option value="sim">SIM (Surat Izin Mengemudi)</option>
                <option value="passport">Paspor RI</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Nomor Induk Kependudukan (NIK)
              </label>
              <Input
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                disabled={status === "verified"}
                placeholder="16 digit NIK"
                required
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-foreground">
                Nama Lengkap Sesuai Dokumen
              </label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={status === "verified"}
                placeholder="NAMA LENGKAP KAPITAL"
                required
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-foreground">Alamat Domisili KTP</label>
              <Textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={status === "verified"}
                placeholder="Nama jalan, RT/RW, Kelurahan, Kecamatan, Kota, Provinsi"
                required
              />
            </div>
          </div>

          {/* Section 2: Rekening Pencairan */}
          <div className="border-t border-b border-border py-4 space-y-1">
            <h3 className="font-heading font-bold text-base text-foreground">
              2. Rekening Bank Tujuan Pencairan Dana
            </h3>
            <p className="text-xs text-muted-foreground">
              Nama pemilik rekening bank wajib selaras dengan nama identitas penggalang / lembaga berbadan hukum.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Nama Bank</label>
              <Input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                disabled={status === "verified"}
                placeholder="Contoh: BCA / Mandiri / BSI"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Nomor Rekening</label>
              <Input
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                disabled={status === "verified"}
                placeholder="Nomor rekening"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Nama Pemilik Rekening</label>
              <Input
                value={bankAccountHolder}
                onChange={(e) => setBankAccountHolder(e.target.value)}
                disabled={status === "verified"}
                placeholder="Atas nama buku tabungan"
                required
              />
            </div>
          </div>

          {/* Section 3: Foto Dokumen */}
          <div className="border-t border-border pt-4 space-y-3">
            <h3 className="font-heading font-bold text-base text-foreground">
              3. Unggahan Foto Dokumen
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Foto KTP */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  Foto KTP Asli (Jelas & Tidak Buram)
                </label>
                <div className="rounded-xl border border-border p-3 bg-slate-50 text-center">
                  {idPhoto ? (
                    <img
                      src={idPhoto}
                      alt="Foto KTP"
                      className="h-36 w-full rounded-lg object-cover mx-auto"
                    />
                  ) : (
                    <div className="py-8">
                      <UploadCloud className="h-8 w-8 mx-auto text-slate-400" />
                      <p className="text-xs text-muted-foreground mt-2">Pilih foto KTP</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Foto Selfie */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  Foto Selfie Memegang KTP
                </label>
                <div className="rounded-xl border border-border p-3 bg-slate-50 text-center">
                  {selfiePhoto ? (
                    <img
                      src={selfiePhoto}
                      alt="Foto Selfie KTP"
                      className="h-36 w-full rounded-lg object-cover mx-auto"
                    />
                  ) : (
                    <div className="py-8">
                      <UploadCloud className="h-8 w-8 mx-auto text-slate-400" />
                      <p className="text-xs text-muted-foreground mt-2">Pilih foto selfie KTP</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {status !== "verified" && (
            <Button type="submit" size="lg" className="w-full font-bold shadow-md">
              Ajukan Verifikasi Identitas
            </Button>
          )}
        </form>
      </Card>
    </div>
  );
}
