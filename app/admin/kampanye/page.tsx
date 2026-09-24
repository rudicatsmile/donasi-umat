"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  Filter,
  AlertCircle,
  Clock,
  Loader2,
  RefreshCw,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { formatRupiah, formatDateIndo } from "@/lib/utils";
import { toast } from "sonner";
import { getAdminCampaignsAction } from "@/app/actions/campaigns";

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [filterStatus, setFilterStatus] = React.useState("all");
  const [search, setSearch] = React.useState("");

  const loadCampaigns = React.useCallback(async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    else setIsRefreshing(true);
    try {
      const res = await getAdminCampaignsAction();
      if (res.success && res.data) {
        setCampaigns(res.data);
      } else {
        toast.error(res.error || "Gagal memuat kampanye admin");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan memuat data");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  const filtered = campaigns.filter((c) => {
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    const matchSearch =
      (c.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.fundraiser?.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.beneficiaryLocation || "").toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
            Moderasi & Kelola Kampanye
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Data real-time kampanye dari database. Review kelayakan proposal kampanye sebelum dipublikasikan.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadCampaigns(true)}
          disabled={isLoading || isRefreshing}
          className="gap-2 text-xs font-semibold self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Memperbarui..." : "Segarkan Data"}
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari judul, penggalang, atau lokasi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filterStatus === "all" ? "bg-primary text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Semua ({campaigns.length})
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
              onClick={() => setFilterStatus("active")}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filterStatus === "active" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Aktif Publik ({campaigns.filter((c) => c.status === "active").length})
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
        </div>
      </Card>

      {/* Campaigns Table */}
      <Card className="shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs font-medium">Memuat data kampanye dari database Supabase...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kampanye</TableHead>
                <TableHead>Penggalang Dana</TableHead>
                <TableHead>Target & Terkumpul</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi Review</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length > 0 ? (
                filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="max-w-[260px]">
                      <p className="font-heading font-bold text-xs text-foreground line-clamp-1">
                        {c.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{c.categoryName} • {c.beneficiaryLocation}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-heading font-semibold text-xs text-foreground">
                        {c.fundraiser?.fullName}
                      </p>
                      <p className="text-[10px] text-slate-500">@{c.fundraiser?.username}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-heading font-bold text-xs text-primary tabular-nums">
                        {formatRupiah(c.collectedAmount)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Target: {formatRupiah(c.targetAmount)}</p>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {c.deadline}
                    </TableCell>
                    <TableCell>
                      {c.status === "active" && (
                        <Badge variant="success">Aktif Publik</Badge>
                      )}
                      {c.status === "completed" && (
                        <Badge variant="default">Tercapai</Badge>
                      )}
                      {c.status === "pending_review" && (
                        <Badge variant="accent">Menunggu Review</Badge>
                      )}
                      {c.status === "draft" && (
                        <Badge variant="outline">Draft Inisiator</Badge>
                      )}
                      {c.status === "rejected" && (
                        <Badge variant="destructive">Ditolak / Revisi</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/kampanye/${c.id}`}>
                        <Button
                          size="sm"
                          variant={c.status === "pending_review" ? "default" : "outline"}
                          className="gap-1.5 text-xs font-semibold"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Detail Review
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16 text-muted-foreground text-xs">
                    Tidak ada kampanye yang sesuai dengan kriteria pencarian/filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
