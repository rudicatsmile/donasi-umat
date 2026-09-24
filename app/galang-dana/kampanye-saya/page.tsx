"use client";

import * as React from "react";
import Link from "next/link";
import {
  PlusCircle,
  Sparkles,
  Edit,
  Send,
  FileCheck2,
  Wallet,
  Clock,
  Eye,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Loader2,
  RefreshCw,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatRupiah, getDaysLeft } from "@/lib/utils";
import { getFundraiserCampaignsAction } from "@/app/actions/campaigns";
import { toast } from "sonner";

export default function MyCampaignsPage() {
  const [campaigns, setCampaigns] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [filterStatus, setFilterStatus] = React.useState("all");

  const loadCampaigns = React.useCallback(async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    else setIsRefreshing(true);
    try {
      const res = await getFundraiserCampaignsAction();
      if (res.success && res.data) {
        setCampaigns(res.data);
      } else {
        toast.error(res.error || "Gagal memuat daftar kampanye");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan memuat data kampanye");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  const filteredCampaigns = campaigns.filter((c) =>
    filterStatus === "all" ? true : c.status === filterStatus
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
            Kampanye Saya
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Data real-time kampanye dari database. Kelola perkembangan, kirim kabar update, dan ajukan pencairan dana.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadCampaigns(true)}
            disabled={isLoading || isRefreshing}
            className="gap-2 text-xs font-semibold"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Memperbarui..." : "Segarkan"}
          </Button>
          <Link href="/galang-dana/kampanye-baru">
            <Button className="gap-2 font-bold shadow-sm text-xs">
              <PlusCircle className="h-4 w-4" />
              Buat Kampanye Baru
            </Button>
          </Link>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
        <button
          onClick={() => setFilterStatus("all")}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
            filterStatus === "all" ? "bg-primary text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Semua ({campaigns.length})
        </button>
        <button
          onClick={() => setFilterStatus("active")}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
            filterStatus === "active" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Aktif ({campaigns.filter((c) => c.status === "active").length})
        </button>
        <button
          onClick={() => setFilterStatus("pending_review")}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
            filterStatus === "pending_review" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Menunggu Review ({campaigns.filter((c) => c.status === "pending_review").length})
        </button>
        <button
          onClick={() => setFilterStatus("draft")}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
            filterStatus === "draft" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Draft ({campaigns.filter((c) => c.status === "draft").length})
        </button>
      </div>

      {/* Campaigns List */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs font-medium">Memuat daftar kampanye dari database...</p>
        </div>
      ) : filteredCampaigns.length > 0 ? (
        <div className="space-y-4">
          {filteredCampaigns.map((campaign) => {
            const percentage = Math.min(
              Math.round((campaign.collectedAmount / campaign.targetAmount) * 100),
              100
            );

            return (
              <Card key={campaign.id} className="p-5 shadow-xs transition-all hover:border-slate-300">
                <div className="flex flex-col md:flex-row gap-5">
                  {/* Thumbnail */}
                  <div className="relative aspect-video md:w-56 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={campaign.coverImageUrl || "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&q=80&w=800"}
                      alt={campaign.title}
                      className="h-full w-full object-cover"
                    />
                    <Badge variant="outline" className="absolute top-2 left-2 bg-white/90 text-[10px]">
                      {campaign.categoryName}
                    </Badge>
                  </div>

                  {/* Details */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-1">
                        <Link
                          href={`/kampanye/${campaign.slug}`}
                          className="font-heading font-bold text-base text-foreground hover:text-primary transition-colors line-clamp-1"
                        >
                          {campaign.title}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          Lokasi: {campaign.beneficiaryLocation}
                        </p>
                      </div>

                      {campaign.status === "active" && (
                        <Badge variant="success">Sedang Berjalan</Badge>
                      )}
                      {campaign.status === "completed" && (
                        <Badge variant="default">Selesai / Tercapai</Badge>
                      )}
                      {campaign.status === "pending_review" && (
                        <Badge variant="accent">Menunggu Verifikasi Kurator</Badge>
                      )}
                      {campaign.status === "draft" && (
                        <Badge variant="outline">Draft Belum Diajukan</Badge>
                      )}
                      {campaign.status === "rejected" && (
                        <Badge variant="destructive">Perlu Perbaikan</Badge>
                      )}
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1.5 max-w-lg">
                      <div className="flex justify-between text-xs">
                        <span className="font-heading font-bold text-primary tabular-nums">
                          {formatRupiah(campaign.collectedAmount)}
                        </span>
                        <span className="text-muted-foreground tabular-nums">
                          Target: {formatRupiah(campaign.targetAmount)} ({percentage}%)
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>

                    {/* Actions Bar */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
                      <Link href={`/galang-dana/kampanye-saya/${campaign.id}/update`}>
                        <Button size="sm" variant="outline" className="text-xs gap-1">
                          <Send className="h-3.5 w-3.5 text-sky-600" />
                          Kirim Kabar
                        </Button>
                      </Link>

                      <Link href={`/galang-dana/kampanye-saya/${campaign.id}/laporan-transparansi`}>
                        <Button size="sm" variant="outline" className="text-xs gap-1">
                          <FileCheck2 className="h-3.5 w-3.5 text-emerald-600" />
                          Laporan Transparansi
                        </Button>
                      </Link>

                      <Link href={`/galang-dana/kampanye-saya/${campaign.id}/pencairan`}>
                        <Button size="sm" variant="outline" className="text-xs gap-1">
                          <Wallet className="h-3.5 w-3.5 text-amber-600" />
                          Ajukan Pencairan
                        </Button>
                      </Link>

                      <div className="ml-auto">
                        <Link href={`/kampanye/${campaign.slug}`}>
                          <Button size="sm" variant="ghost" className="text-xs gap-1">
                            <Eye className="h-3.5 w-3.5" />
                            Halaman Publik
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-16 text-center shadow-xs">
          <div className="max-w-md mx-auto space-y-3">
            <FolderOpen className="h-10 w-10 text-slate-300 mx-auto" />
            <h3 className="font-heading font-bold text-base text-foreground">
              Belum Ada Kampanye
            </h3>
            <p className="text-xs text-muted-foreground">
              Anda belum memiliki program penggalangan dana dengan status yang dipilih.
            </p>
            <Link href="/galang-dana/kampanye-baru">
              <Button size="sm" className="font-bold text-xs mt-2">
                Buat Kampanye Pertama Anda
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
