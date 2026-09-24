"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  UploadCloud,
  CheckCircle2,
  Calendar,
  Building,
  MapPin,
  Eye,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DUMMY_CATEGORIES, OFFICIAL_BANK_ACCOUNTS } from "@/lib/dummy-data";
import { formatRupiah } from "@/lib/utils";
import { toast } from "sonner";
import { createCampaignAction } from "@/app/actions/campaigns";

export default function CreateCampaignPage() {
  const router = useRouter();
  const [step, setStep] = React.useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  // Form states
  const [title, setTitle] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("cat-1");
  const [location, setLocation] = React.useState("");
  const [story, setStory] = React.useState("");
  const [targetAmount, setTargetAmount] = React.useState<string>("50000000");
  const [deadline, setDeadline] = React.useState("2026-11-30");
  const [coverUrl, setCoverUrl] = React.useState(
    "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80"
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const selectedCategoryName =
    DUMMY_CATEGORIES.find((c) => c.id === categoryId)?.name || "Kesehatan";

  const handleNext = () => {
    if (step === 1 && (!title || !location)) {
      toast.error("Harap lengkapi judul dan lokasi!");
      return;
    }
    if (step === 2 && story.length < 50) {
      toast.error("Cerita kampanye minimal 50 karakter!");
      return;
    }
    if (step === 3 && Number(targetAmount) < 1000000) {
      toast.error("Target dana minimal Rp 1.000.000!");
      return;
    }
    setStep((s) => Math.min(s + 1, 6) as 1 | 2 | 3 | 4 | 5 | 6);
  };

  const handlePrev = () => {
    setStep((s) => Math.max(s - 1, 1) as 1 | 2 | 3 | 4 | 5 | 6);
  };

  const handleSubmitCampaign = async (submitForReview: boolean = true) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("category_id", categoryId);
      formData.append("beneficiary_location", location);
      formData.append("story", story);
      formData.append("target_amount", targetAmount);
      formData.append("deadline", deadline);
      formData.append("cover_image_url", coverUrl);
      formData.append("submit_for_review", submitForReview ? "true" : "false");

      const res = await createCampaignAction(formData);
      if (res.success) {
        toast.success(res.message);
        router.push("/galang-dana/kampanye-saya");
      } else {
        toast.error(res.error || "Gagal membuat kampanye");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      <Link
        href="/galang-dana/kampanye-saya"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Kampanye Saya
      </Link>

      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
          Buat Kampanye Galang Dana Baru (Tier 2)
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Lengkapi tahapan wizard berikut secara bertahap untuk mempublikasikan kampanye amanah Anda.
        </p>
      </div>

      {/* Stepper Wizard Indicator */}
      <div className="rounded-2xl border border-border bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs font-semibold overflow-x-auto no-scrollbar py-1">
          <div className={`flex items-center gap-1.5 ${step >= 1 ? "text-primary font-bold" : "text-slate-400"}`}>
            <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? "bg-primary text-white" : "bg-slate-200"}`}>
              1
            </span>
            <span className="hidden sm:inline">Info Dasar</span>
          </div>
          <div className="h-0.5 w-6 bg-slate-200" />
          <div className={`flex items-center gap-1.5 ${step >= 2 ? "text-primary font-bold" : "text-slate-400"}`}>
            <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? "bg-primary text-white" : "bg-slate-200"}`}>
              2
            </span>
            <span className="hidden sm:inline">Cerita</span>
          </div>
          <div className="h-0.5 w-6 bg-slate-200" />
          <div className={`flex items-center gap-1.5 ${step >= 3 ? "text-primary font-bold" : "text-slate-400"}`}>
            <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? "bg-primary text-white" : "bg-slate-200"}`}>
              3
            </span>
            <span className="hidden sm:inline">Target</span>
          </div>
          <div className="h-0.5 w-6 bg-slate-200" />
          <div className={`flex items-center gap-1.5 ${step >= 4 ? "text-primary font-bold" : "text-slate-400"}`}>
            <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${step >= 4 ? "bg-primary text-white" : "bg-slate-200"}`}>
              4
            </span>
            <span className="hidden sm:inline">Foto Media</span>
          </div>
          <div className="h-0.5 w-6 bg-slate-200" />
          <div className={`flex items-center gap-1.5 ${step >= 5 ? "text-primary font-bold" : "text-slate-400"}`}>
            <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${step >= 5 ? "bg-primary text-white" : "bg-slate-200"}`}>
              5
            </span>
            <span className="hidden sm:inline">Rekening</span>
          </div>
          <div className="h-0.5 w-6 bg-slate-200" />
          <div className={`flex items-center gap-1.5 ${step === 6 ? "text-primary font-bold" : "text-slate-400"}`}>
            <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${step === 6 ? "bg-primary text-white" : "bg-slate-200"}`}>
              6
            </span>
            <span className="hidden sm:inline">Pratinjau</span>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <Card className="p-6 sm:p-8 space-y-6 shadow-xs">
        {/* Step 1: Info Dasar */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-lg text-foreground border-b border-border pb-3">
              Tahap 1: Informasi Dasar Kampanye
            </h3>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Judul Kampanye (15 – 120 Karakter) <span className="text-red-500">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Bantu Biaya Operasi Jantung Adik Fikri di Sukabumi"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Kategori Kampanye</label>
                <select
                  aria-label="Pilih Kategori Kampanye"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full h-11 rounded-lg border border-border bg-white px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                >
                  {DUMMY_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Lokasi Penerima Manfaat (Kota & Provinsi) <span className="text-red-500">*</span>
                </label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Contoh: Sukabumi, Jawa Barat"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Cerita & Narasi */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-lg text-foreground border-b border-border pb-3">
              Tahap 2: Cerita & Kebutuhan Dana
            </h3>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Cerita Lengkap & Latar Belakang (Min. 50 Karakter) <span className="text-red-500">*</span>
              </label>
              <Textarea
                rows={8}
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="Ceritakan siapa yang membutuhkan bantuan, riwayat sakit atau kondisi fasilitas, rincian biaya yang dibutuhkan, serta harapan keluarga..."
                required
              />
              <p className="text-[11px] text-muted-foreground">
                Tulis secara jujur, objektif, dan hindari eksploitasi kesedihan yang berlebihan.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Target & Deadline */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-lg text-foreground border-b border-border pb-3">
              Tahap 3: Target Dana & Batas Waktu
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Target Dana (Min. Rp 1.000.000) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-sm font-bold text-muted-foreground">Rp</span>
                  <Input
                    type="text"
                    value={targetAmount ? Number(targetAmount).toLocaleString("id-ID") : ""}
                    onChange={(e) => setTargetAmount(e.target.value.replace(/\D/g, ""))}
                    className="pl-11 font-heading font-bold"
                    placeholder="50.000.000"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Batas Akhir Kampanye (Deadline 7 - 90 Hari) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Foto & Media */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-lg text-foreground border-b border-border pb-3">
              Tahap 4: Foto Dokumentasi Asli
            </h3>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">
                Foto Sampul Utama (Rasio 16:9, Maks. 5MB) <span className="text-red-500">*</span>
              </label>
              <div className="rounded-xl border border-border p-4 bg-slate-50 text-center space-y-3">
                <img
                  src={coverUrl}
                  alt="Pratinjau Cover"
                  className="aspect-video w-full max-w-lg mx-auto rounded-xl object-cover shadow-xs"
                />
                <Button variant="outline" size="sm" type="button">
                  Ganti Foto Sampul
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Rekening Penyaluran */}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-lg text-foreground border-b border-border pb-3">
              Tahap 5: Rekening Penyaluran Terverifikasi
            </h3>
            <p className="text-xs text-muted-foreground">
              Dana yang terhimpun nantinya hanya dapat dicairkan ke rekening yang telah lolos verifikasi Tier 1 berikut:
            </p>
            <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/70 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-emerald-950">
                <Building className="h-4 w-4 text-emerald-600" />
                Bank Mandiri — 1310019283746
              </div>
              <p className="text-slate-600">
                Atas Nama: <strong>YAYASAN SAHABAT INSAN AMANAH</strong>
              </p>
              <Badge variant="success" className="text-[10px]">
                Rekening Sah Terverifikasi
              </Badge>
            </div>
          </div>
        )}

        {/* Step 6: Pratinjau & Submit */}
        {step === 6 && (
          <div className="space-y-6">
            <h3 className="font-heading font-bold text-lg text-foreground border-b border-border pb-3">
              Tahap 6: Pratinjau Sebelum Mengajukan
            </h3>

            <div className="rounded-2xl border border-border bg-slate-50 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline">{selectedCategoryName}</Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {location || "Lokasi belum diisi"}
                </span>
              </div>

              <h4 className="font-heading font-bold text-xl text-foreground">
                {title || "Judul Kampanye Belum Diisi"}
              </h4>

              <img
                src={coverUrl}
                alt="Cover"
                className="aspect-video w-full rounded-xl object-cover"
              />

              <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                <div>
                  <span className="text-muted-foreground">Target Dana:</span>
                  <p className="font-heading font-bold text-base text-primary">
                    {formatRupiah(Number(targetAmount) || 0)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Deadline:</span>
                  <p className="font-heading font-bold text-base text-foreground">
                    {deadline}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-border">
                <span className="text-xs font-semibold text-muted-foreground">Ringkasan Kisah:</span>
                <p className="text-xs text-slate-700 mt-1 line-clamp-3 leading-relaxed">
                  {story || "Belum ada deskripsi cerita."}
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900 leading-relaxed">
              Setelah dikirim, kampanye akan masuk status <strong>Menunggu Review Admin</strong>. Anda akan menerima notifikasi WhatsApp setelah kampanye disetujui untuk tayang publik.
            </div>
          </div>
        )}

        {/* Stepper Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          {step > 1 ? (
            <Button type="button" variant="outline" onClick={handlePrev}>
              Sebelumnya
            </Button>
          ) : (
            <div />
          )}

          {step < 6 ? (
            <Button type="button" onClick={handleNext} className="gap-1 font-bold">
              Lanjut
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmitCampaign(true)}
              className="gap-2 font-bold shadow-md shadow-primary/20"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? "Mengirimkan Kampanye..." : "Ajukan Kampanye Sekarang"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
