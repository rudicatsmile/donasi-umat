"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Wallet,
  Building,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DUMMY_CAMPAIGNS } from "@/lib/dummy-data";
import { formatRupiah } from "@/lib/utils";
import { toast } from "sonner";
import { requestWithdrawalAction } from "@/app/actions/disbursement-and-updates";

export default function RequestDisbursementPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const campaign = DUMMY_CAMPAIGNS.find((c) => c.id === id) || DUMMY_CAMPAIGNS[0];

  const availableBalance = campaign.collectedAmount - 15000000; // contoh setelah dikurangi pencairan sebelumnya
  const [requestedAmount, setRequestedAmount] = React.useState<string>("10000000");
  const [purpose, setPurpose] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(requestedAmount);
    if (amountNum < 50000) {
      toast.error("Nominal pencairan minimal Rp 50.000!");
      return;
    }
    if (amountNum > availableBalance) {
      toast.error("Nominal pencairan melebihi sisa saldo terkumpul!");
      return;
    }
    if (!purpose || purpose.trim().length < 15) {
      toast.error("Harap isi tujuan dan rincian penggunaan dana minimal 15 karakter!");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("campaign_id", campaign.id);
      formData.append("requested_amount", requestedAmount);
      formData.append("purpose_description", purpose);
      formData.append("bank_name", "Bank Syariah Indonesia (BSI)");
      formData.append("bank_account_number", "7123456789");
      formData.append("bank_account_holder", "Yayasan / Inisiator Berkah");

      const res = await requestWithdrawalAction(formData);
      if (res.success) {
        toast.success(res.message);
        router.push("/galang-dana/riwayat-pencairan");
      } else {
        toast.error(res.error || "Gagal mengajukan pencairan dana");
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
          Pengajuan Pencairan Dana Donasi
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Kampanye: <strong>{campaign.title}</strong>
        </p>
      </div>

      {/* Saldo Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-slate-50">
          <span className="text-[11px] text-muted-foreground">Total Dana Terkumpul</span>
          <p className="font-heading font-black text-lg text-foreground tabular-nums">
            {formatRupiah(campaign.collectedAmount)}
          </p>
        </Card>
        <Card className="p-4 bg-slate-50">
          <span className="text-[11px] text-muted-foreground">Telah Dicairkan Sebelumnya</span>
          <p className="font-heading font-black text-lg text-slate-600 tabular-nums">
            {formatRupiah(15000000)}
          </p>
        </Card>
        <Card className="p-4 bg-emerald-50 border-emerald-200">
          <span className="text-[11px] text-emerald-800 font-semibold">Sisa Saldo Dapat Dicairkan</span>
          <p className="font-heading font-black text-lg text-primary tabular-nums">
            {formatRupiah(availableBalance)}
          </p>
        </Card>
      </div>

      <Card className="p-6 sm:p-8 space-y-6 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Nominal Pencairan yang Diajukan (Min. Rp 100.000) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-sm font-bold text-muted-foreground">Rp</span>
              <Input
                type="text"
                value={requestedAmount ? Number(requestedAmount).toLocaleString("id-ID") : ""}
                onChange={(e) => setRequestedAmount(e.target.value.replace(/\D/g, ""))}
                className="pl-11 font-heading font-bold"
                placeholder="10.000.000"
                required
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Maksimal yang dapat dicairkan saat ini: {formatRupiah(availableBalance)}
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Tujuan & Rencana Penggunaan Dana <span className="text-red-500">*</span>
            </label>
            <Textarea
              rows={4}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Contoh: Pembayaran deposit kamar rawat inap bedah di RSUD Al Ihsan dan penebusan obat non-BPJS tahap 2..."
              required
            />
          </div>

          {/* Rekening Tujuan Pencairan */}
          <div className="pt-2 border-t border-border space-y-2">
            <span className="text-xs font-semibold text-foreground">Rekening Tujuan Pencairan:</span>
            <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/70 text-xs space-y-1">
              <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                <Building className="h-4 w-4 text-emerald-600" />
                Bank Mandiri — 1310019283746
              </p>
              <p className="text-slate-600">a.n YAYASAN SAHABAT INSAN AMANAH</p>
              <Badge variant="success" className="text-[10px] mt-1">
                Rekening Resmi Terdaftar
              </Badge>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
            Admin akan mereview pengajuan pencairan dalam waktu 1x24 jam. Setelah disetujui, dana akan ditransfer langsung ke rekening Anda dan bukti transfer admin akan dilampirkan.
          </div>

          <Button type="submit" size="lg" disabled={isSubmitting} className="w-full font-bold gap-2">
            <Wallet className="h-4 w-4" />
            {isSubmitting ? "Mengajukan Pencairan..." : "Kirim Pengajuan Pencairan Dana"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
