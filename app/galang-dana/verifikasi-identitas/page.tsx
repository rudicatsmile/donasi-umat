"use client";

import * as React from "react";
import Link from "next/link";
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
  Loader2,
  RefreshCw,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  getUserIdentityVerificationAction,
  submitIdentityVerificationAction,
} from "@/app/actions/identity";

export default function IdentityVerificationPage() {
  const [status, setStatus] = React.useState<"verified" | "pending" | "rejected" | "none">("none");
  const [rejectionReason, setRejectionReason] = React.useState<string | null>(null);
  const [idType, setIdType] = React.useState("ktp");
  const [idNumber, setIdNumber] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [bankName, setBankName] = React.useState("Bank Mandiri");
  const [bankAccountNumber, setBankAccountNumber] = React.useState("");
  const [bankAccountHolder, setBankAccountHolder] = React.useState("");

  const [idPhoto, setIdPhoto] = React.useState<string | null>(null);
  const [selfiePhoto, setSelfiePhoto] = React.useState<string | null>(null);
  const [idPhotoFile, setIdPhotoFile] = React.useState<File | null>(null);
  const [selfiePhotoFile, setSelfiePhotoFile] = React.useState<File | null>(null);

  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const loadVerificationData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getUserIdentityVerificationAction();
      if (res.success) {
        if (res.verification) {
          const v = res.verification;
          setStatus(v.status);
          setRejectionReason(v.rejection_reason || null);
          setIdType(v.id_type || "ktp");
          setIdNumber(v.id_number_masked || "");
          setFullName(v.full_name_on_id || "");
          setAddress(v.address || "");
          setBankName(v.bank_name || "");
          setBankAccountNumber(v.bank_account_number || "");
          setBankAccountHolder(v.bank_account_holder || "");
          setIdPhoto(v.id_photo_url || null);
          setSelfiePhoto(v.selfie_photo_url || null);
        } else if (res.profile) {
          if (res.profile.is_verified) {
            setStatus("verified");
          } else {
            setStatus("none");
          }
          setFullName(res.profile.full_name || "");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal memuat status verifikasi");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadVerificationData();
  }, [loadVerificationData]);

  const handleIdFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdPhotoFile(file);
      const url = URL.createObjectURL(file);
      setIdPhoto(url);
    }
  };

  const handleSelfieFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelfiePhotoFile(file);
      const url = URL.createObjectURL(file);
      setSelfiePhoto(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idPhoto) {
      toast.error("Wajib mengunggah foto KTP / dokumen identitas");
      return;
    }
    if (!selfiePhoto) {
      toast.error("Wajib mengunggah foto selfie memegang identitas");
      return;
    }

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

      if (idPhotoFile) {
        formData.append("id_photo_file", idPhotoFile);
      } else if (idPhoto) {
        formData.append("id_photo_url", idPhoto);
      }

      if (selfiePhotoFile) {
        formData.append("selfie_photo_file", selfiePhotoFile);
      } else if (selfiePhoto) {
        formData.append("selfie_photo_url", selfiePhoto);
      }

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
            Verifikasi Identitas Penggalang (Tier 1)
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Tahapan wajib kepatuhan hukum sebelum membuat kampanye dan menerima pencairan dana donatur.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadVerificationData}
          disabled={isLoading}
          className="gap-2 text-xs self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Perbarui Status
        </Button>
      </div>

      {isLoading ? (
        <Card className="p-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Memeriksa status verifikasi identitas Anda...</p>
        </Card>
      ) : (
        <>
          {/* Current Status Banner */}
          {status === "verified" && (
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50/80 p-5 flex items-start gap-4 shadow-xs">
              <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-bold text-base text-emerald-950">
                    Identitas Anda Telah Terverifikasi (Tier 1)
                  </h3>
                  <Badge variant="success">Aktif & Sah</Badge>
                </div>
                <p className="text-xs text-emerald-800/90 leading-relaxed">
                  Selamat! Akun Anda telah memenuhi seluruh syarat verifikasi hukum DonasiUmat. Anda memiliki hak penuh untuk membuat kampanye baru dan mengajukan pencairan dana.
                </p>
                <div className="pt-1">
                  <Link href="/galang-dana/kampanye-baru">
                    <Button size="sm" className="gap-2 text-xs font-bold shadow-xs">
                      Buat Kampanye Sekarang
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
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
                    Pengajuan Sedang Ditinjau Tim Kurator
                  </h3>
                  <Badge variant="accent">Pending Review</Badge>
                </div>
                <p className="text-xs text-amber-900/80 leading-relaxed">
                  Dokumen KTP dan foto selfie Anda sedang diperiksa manual oleh tim verifikasi kami. Proses ini memakan waktu maksimal 1x24 jam kerja.
                </p>
              </div>
            </div>
          )}

          {status === "rejected" && (
            <div className="rounded-2xl border border-rose-300 bg-rose-50/80 p-5 flex items-start gap-4 shadow-xs">
              <div className="h-10 w-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-bold text-base text-rose-950">
                    Pengajuan Verifikasi Belum Disetujui
                  </h3>
                  <Badge variant="destructive">Perlu Perbaikan</Badge>
                </div>
                <p className="text-xs text-rose-900/90 leading-relaxed">
                  Catatan dari Kurator: <strong>{rejectionReason || "Dokumen belum memenuhi kriteria kejelasan data."}</strong>
                </p>
                <p className="text-xs text-rose-800/80">
                  Silakan periksa kembali foto dokumen dan data di bawah ini, lalu ajukan ulang.
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
                    disabled={status === "verified" || status === "pending"}
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
                    disabled={status === "verified" || status === "pending"}
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
                    disabled={status === "verified" || status === "pending"}
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
                    disabled={status === "verified" || status === "pending"}
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
                    disabled={status === "verified" || status === "pending"}
                    placeholder="Contoh: BCA / Mandiri / BSI"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Nomor Rekening</label>
                  <Input
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    disabled={status === "verified" || status === "pending"}
                    placeholder="Nomor rekening"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Nama Pemilik Rekening</label>
                  <Input
                    value={bankAccountHolder}
                    onChange={(e) => setBankAccountHolder(e.target.value)}
                    disabled={status === "verified" || status === "pending"}
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
                    <div className="rounded-xl border border-border p-3 bg-slate-50 text-center relative group">
                      {idPhoto ? (
                        <div className="space-y-2">
                          <img
                            src={idPhoto}
                            alt="Foto KTP"
                            className="h-36 w-full rounded-lg object-cover mx-auto"
                          />
                          {status !== "verified" && status !== "pending" && (
                            <label className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold cursor-pointer hover:underline">
                              <Camera className="h-3.5 w-3.5" />
                              Ganti Foto KTP
                              <input type="file" accept="image/*" className="hidden" onChange={handleIdFileChange} />
                            </label>
                          )}
                        </div>
                      ) : (
                        <label className="block py-8 cursor-pointer">
                          <UploadCloud className="h-8 w-8 mx-auto text-slate-400 group-hover:text-primary transition-colors" />
                          <p className="text-xs text-muted-foreground mt-2 font-medium">Klik untuk unggah foto KTP</p>
                          <input type="file" accept="image/*" className="hidden" onChange={handleIdFileChange} />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Foto Selfie */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground">
                      Foto Selfie Memegang KTP
                    </label>
                    <div className="rounded-xl border border-border p-3 bg-slate-50 text-center relative group">
                      {selfiePhoto ? (
                        <div className="space-y-2">
                          <img
                            src={selfiePhoto}
                            alt="Foto Selfie KTP"
                            className="h-36 w-full rounded-lg object-cover mx-auto"
                          />
                          {status !== "verified" && status !== "pending" && (
                            <label className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold cursor-pointer hover:underline">
                              <Camera className="h-3.5 w-3.5" />
                              Ganti Foto Selfie
                              <input type="file" accept="image/*" className="hidden" onChange={handleSelfieFileChange} />
                            </label>
                          )}
                        </div>
                      ) : (
                        <label className="block py-8 cursor-pointer">
                          <UploadCloud className="h-8 w-8 mx-auto text-slate-400 group-hover:text-primary transition-colors" />
                          <p className="text-xs text-muted-foreground mt-2 font-medium">Klik untuk unggah selfie KTP</p>
                          <input type="file" accept="image/*" className="hidden" onChange={handleSelfieFileChange} />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {status !== "verified" && status !== "pending" && (
                <Button type="submit" size="lg" disabled={isSubmitting} className="w-full font-bold shadow-md">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Mengirim Berkas Verifikasi...
                    </>
                  ) : (
                    "Ajukan Verifikasi Identitas (Tier 1)"
                  )}
                </Button>
              )}
            </form>
          </Card>
        </>
      )}
    </div>
  );
}
