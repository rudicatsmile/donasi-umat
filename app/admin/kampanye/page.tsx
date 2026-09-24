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
import { DUMMY_CAMPAIGNS, Campaign } from "@/lib/dummy-data";
import { formatRupiah, formatDateIndo } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = React.useState<Campaign[]>(DUMMY_CAMPAIGNS);
  const [filterStatus, setFilterStatus] = React.useState("all");
  const [search, setSearch] = React.useState("");

  const filtered = campaigns.filter((c) => {
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.fundraiser.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.beneficiaryLocation.toLowerCase().includes(search.toLowerCase());
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
            Review kelayakan proposal kampanye galang dana sosial sebelum dipublikasikan.
          </p>
        </div>
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
              onClick={() => setFilterStatus("active")}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filterStatus === "active" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Aktif Publik
            </button>
            <button
              onClick={() => setFilterStatus("completed")}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filterStatus === "completed" ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Selesai
            </button>
          </div>
        </div>
      </Card>

      {/* Campaigns Table */}
      <Card className="shadow-xs overflow-hidden">
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
            {filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="max-w-[260px]">
                  <p className="font-heading font-bold text-xs text-foreground line-clamp-1">
                    {c.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{c.categoryName} • {c.beneficiaryLocation}</p>
                </TableCell>
                <TableCell>
                  <p className="font-heading font-semibold text-xs text-foreground">
                    {c.fundraiser.fullName}
                  </p>
                  <p className="text-[10px] text-slate-500">@{c.fundraiser.username}</p>
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
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/admin/kampanye/${c.id}`}>
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs font-semibold">
                      <Eye className="h-3.5 w-3.5" />
                      Detail Review
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
