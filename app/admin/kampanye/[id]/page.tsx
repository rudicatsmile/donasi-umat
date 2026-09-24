"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Building,
  MapPin,
  Calendar,
  AlertCircle,
  ShieldCheck,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { formatRupiah, formatDateIndo } from "@/lib/utils";
import { toast } from "sonner";
import {
  approveCampaignAction,
  rejectCampaignAction,
  getCampaignDetailForAdminAction,
} from "@/app/actions/campaigns";

export default function AdminCampaignDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [campaign, setCampaign] = React.useState<any | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [adminNote, setAdminNote] = React.useState("");
  const [isProcessing, setIsProcessing] = React.useState(false);

  React.useEffect(() => {
    async function loadCampaign() {
      if (!id) return;
      setIsLoading(true);
      try {
        const res = await getCampaignDetailForAdminAction(id);
        if (res.success && res.data) {
          setCampaign(res.data);
        } else {
          toast.error(res.error || "Kampanye tidak ditemukan");
        }
      } catch (err: any) {
        toast.error(err.message || "Gagal memuat detail kampanye");
      } finally {
        setIsLoading(false);
      }
    }
    loadCampaign();
  }, [id]);

  const handleApprove = async () => {
    if (!campaign) return;
    setIsProcessing(true);
    try {
      const res = await approveCampaignAction(campaign.id);
      if (res.success) {
        toast.success(res.message);
        router.push("/admin/kampanye");
      } else {
        toast.error(res.error || "Gagal menyetujui kampanye");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan sistem");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!campaign) return;
    if (!adminNote || adminNote.trim().length < 5) {
      toast.error("Harap tuliskan catatan alasan penolakan minimal 5 karakter!");
      return;
    }
    setIsProcessing(true);
    try {
      const res = await rejectCampaignAction(campaign.id, adminNote.trim());
      if (res.success) {
        toast.success(res.message);
        router.push("/admin/kampanye");
      } else {
        toast.error(res.error || "Gagal menolak kampanye");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan sistem");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs font-medium">Memuat proposal kampanye dari Supabase...</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="font-heading font-bold text-lg text-foreground">Kampanye Tidak Ditemukan</h2>
        <p className="text-xs text-muted-foreground">
          Kampanye dengan ID tersebut tidak ditemukan di database.
        </p>
        <Link href="/admin/kampanye">
          <Button size="sm" variant="outline">
            Kembali ke Daftar Kampanye
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link
        href="/admin/kampanye"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Kelola Kampanye
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-extrabold text-foreground">
              Review Proposal Kampanye
            </h1>
            <Badge variant="outline" className="text-xs">
              {campaign.status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Dibuat oleh <strong>{campaign.fundraiser?.fullName || "Inisiator"}</strong> pada {formatDateIndo(campaign.createdAt)}
          </p>
        </div>

        {campaign.slug && (
          <Link href={`/kampanye/${campaign.slug}`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              Pratinjau Halaman Publik
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </Link>
        )}
      </div>

      {/* Campaign Details Preview Card */}
      <Card className="p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="space-y-2">
          <Badge variant="default">{campaign.categoryName}</Badge>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-foreground">
            {campaign.title}
          </h2>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-emerald-600" />
            {campaign.beneficiaryLocation}
          </p>
        </div>

        <img
          src={campaign.coverImageUrl || "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&q=80&w=800"}
          alt={campaign.title}
          className="aspect-video w-full rounded-2xl object-cover shadow-xs"
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-border text-center text-xs">
          <div>
            <span className="text-muted-foreground">Target Dana</span>
            <p className="font-heading font-bold text-sm text-primary tabular-nums mt-0.5">
              {formatRupiah(campaign.targetAmount)}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Terkumpul</span>
            <p className="font-heading font-bold text-sm text-foreground tabular-nums mt-0.5">
              {formatRupiah(campaign.collectedAmount)}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Jumlah Donatur</span>
            <p className="font-heading font-bold text-sm text-foreground tabular-nums mt-0.5">
              {campaign.donorCount} Donatur
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Batas Akhir</span>
            <p className="font-heading font-bold text-sm text-foreground tabular-nums mt-0.5">
              {campaign.deadline}
            </p>
          </div>
        </div>

        <div className="space-y-2 border-t border-border pt-4">
          <h3 className="font-heading font-bold text-sm text-foreground">
            Kisah & Alasan Penggalangan Dana
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-border">
            {campaign.story}
          </p>
        </div>

        {/* Admin Decision Panel */}
        <div className="border-t border-border pt-6 space-y-4">
          <h3 className="font-heading font-bold text-base text-foreground">
            Panel Keputusan Verifikator Admin
          </h3>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Catatan Keputusan / Alasan Revisi untuk Penggalang
            </label>
            <Textarea
              rows={3}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Tuliskan catatan verifikasi (opsional jika approve, wajib jika meminta revisi/menolak)..."
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="destructive"
              disabled={isProcessing}
              onClick={handleReject}
              className="gap-1.5"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
              Tolak / Minta Revisi
            </Button>
            <Button
              type="button"
              disabled={isProcessing}
              onClick={handleApprove}
              className="gap-1.5 font-bold"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Setujui & Publikasikan (Approve)
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
