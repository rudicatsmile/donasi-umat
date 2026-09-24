"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileCheck2,
  UploadCloud,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { DUMMY_CAMPAIGNS } from "@/lib/dummy-data";
import { formatRupiah } from "@/lib/utils";
import { toast } from "sonner";
import { submitTransparencyReportAction } from "@/app/actions/disbursement-and-updates";

export default function SubmitTransparencyReportPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const campaign = DUMMY_CAMPAIGNS.find((c) => c.id === id) || DUMMY_CAMPAIGNS[0];

  const [title, setTitle] = React.useState("");
  const [amountUsed, setAmountUsed] = React.useState("15000000");
  const [disbursementDate, setDisbursementDate] = React.useState("2026-09-20");
  const [description, setDescription] = React.useState("");
  const [beneficiaries, setBeneficiaries] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !amountUsed) {
      toast.error("Harap lengkapi semua kolom wajib!");
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("campaign_id", campaign.id);
      formData.append("title", title);
      formData.append("amount_used", amountUsed);
      formData.append("disbursement_date", disbursementDate);
      formData.append("description", description);
      if (beneficiaries) formData.append("beneficiaries", beneficiaries);
      formData.append("photo_urls", "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800");

      const res = await submitTransparencyReportAction(formData);
      if (res.success) {
        toast.success(res.message);
        router.push(`/kampanye/${campaign.slug}`);
      } else {
        toast.error(res.error || "Gagal mengajukan laporan");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-2">
      <Link
        href="/galang-dana/kampanye-saya"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Kampanye Saya
      </Link>

      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
          Unggah Laporan Transparansi Penyaluran Dana
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Pertanggungjawaban penggunaan dana untuk: <strong>{campaign.title}</strong>
        </p>
      </div>

      <div className="rounded-xl border border-emerald-300 bg-emerald-50/80 p-4 text-xs text-emerald-800 space-y-1">
        <p className="font-bold flex items-center gap-1.5 text-emerald-950">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Kewajiban Akuntabilitas Publik
        </p>
        <p>
          Setiap dana yang dicairkan wajib dilaporkan secara terbuka dengan kuitansi/nota dan foto bukti penyerahan. Laporan yang disetujui admin akan tampil di tab Transparansi pada halaman detail kampanye.
        </p>
      </div>

      <Card className="p-6 sm:p-8 space-y-6 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Judul Laporan Penyaluran <span className="text-red-500">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Penyaluran Dana Tahap 1: Pelunasan Biaya Operasi Bedah"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Jumlah Dana yang Telah Digunakan <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-sm font-bold text-muted-foreground">Rp</span>
                <Input
                  type="text"
                  value={amountUsed ? Number(amountUsed).toLocaleString("id-ID") : ""}
                  onChange={(e) => setAmountUsed(e.target.value.replace(/\D/g, ""))}
                  className="pl-11 font-heading font-bold"
                  placeholder="15.000.000"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Tanggal Penyaluran <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={disbursementDate}
                onChange={(e) => setDisbursementDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Penerima Manfaat Langsung
            </label>
            <Input
              value={beneficiaries}
              onChange={(e) => setBeneficiaries(e.target.value)}
              placeholder="Contoh: Pasien Ibu Siti & Kasir RSUD Al Ihsan Bandung"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Rincian Penggunaan Anggaran <span className="text-red-500">*</span>
            </label>
            <Textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Uraikan item pengeluaran: biaya obat, sewa ambulans, paket nutrisi, dan perlengkapan pasca rawat inap..."
              required
            />
          </div>

          {/* Upload foto bukti wajib */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-foreground">
              Foto Bukti Kuitansi & Dokumentasi Penyerahan (Wajib Min. 1 Foto) <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center bg-slate-50 cursor-pointer hover:border-primary">
              <UploadCloud className="h-8 w-8 mx-auto text-emerald-600" />
              <p className="text-xs font-medium text-foreground mt-2">
                Pilih atau seret foto kuitansi/nota bertandatangan & dokumentasi serah terima
              </p>
              <p className="text-[11px] text-muted-foreground">Format JPG atau PNG (maks 5MB per foto)</p>
            </div>
          </div>

          <Button type="submit" size="lg" disabled={isSubmitting} className="w-full font-bold gap-2">
            <FileCheck2 className="h-4 w-4" />
            {isSubmitting ? "Mengunggah Laporan..." : "Kirim Laporan Transparansi"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
