"use client";

import * as React from "react";
import Link from "next/link";
import { Wallet, CheckCircle2, Clock, FileCheck, ArrowRight, ExternalLink, Loader2, RefreshCw, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { formatRupiah, formatDateIndo } from "@/lib/utils";
import { getFundraiserWithdrawalsAction } from "@/app/actions/disbursement-and-updates";
import { toast } from "sonner";

export default function FundraiserWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const loadWithdrawals = React.useCallback(async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    else setIsRefreshing(true);
    try {
      const res = await getFundraiserWithdrawalsAction();
      if (res.success && res.data) {
        setWithdrawals(res.data);
      } else {
        toast.error(res.error || "Gagal memuat riwayat pencairan");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan memuat data");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    loadWithdrawals();
  }, [loadWithdrawals]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
            Riwayat Pencairan Dana
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Data real-time penarikan dana donasi terhimpun ke rekening bank resmi Anda.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadWithdrawals(true)}
            disabled={isLoading || isRefreshing}
            className="gap-2 text-xs font-semibold"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Memperbarui..." : "Segarkan"}
          </Button>
          <Link href="/galang-dana/kampanye-saya">
            <Button className="text-xs font-bold">
              Pilih Kampanye untuk Pencairan
            </Button>
          </Link>
        </div>
      </div>

      <Card className="shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs font-medium">Memuat riwayat pencairan dana dari database...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode & Tanggal</TableHead>
                <TableHead>Kampanye</TableHead>
                <TableHead>Jumlah Diajukan</TableHead>
                <TableHead>Rekening Tujuan</TableHead>
                <TableHead>Status Pencairan</TableHead>
                <TableHead className="text-right">Bukti Transfer Admin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.length > 0 ? (
                withdrawals.map((wd) => (
                  <TableRow key={wd.id}>
                    <TableCell>
                      <p className="font-mono font-bold text-xs text-foreground">{wd.withdrawalCode}</p>
                      <p className="text-[11px] text-muted-foreground">{formatDateIndo(wd.createdAt)}</p>
                    </TableCell>
                    <TableCell className="max-w-[240px]">
                      <p className="font-heading font-semibold text-xs text-foreground line-clamp-1">
                        {wd.campaignTitle}
                      </p>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{wd.purposeDescription}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-heading font-black text-xs text-primary tabular-nums">
                        {formatRupiah(wd.requestedAmount)}
                      </p>
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className="font-semibold text-foreground">{wd.bankName}</span>
                      <p className="font-mono text-[11px] text-muted-foreground">{wd.bankAccountNumber}</p>
                      <p className="text-[10px] text-slate-500">a.n {wd.bankAccountHolder}</p>
                    </TableCell>
                    <TableCell>
                      {wd.status === "transferred" && (
                        <Badge variant="success">Dana Telah Ditransfer</Badge>
                      )}
                      {wd.status === "approved" && (
                        <Badge variant="default">Disetujui Admin</Badge>
                      )}
                      {wd.status === "pending" && (
                        <Badge variant="accent">Menunggu Verifikasi Admin</Badge>
                      )}
                      {wd.status === "rejected" && (
                        <Badge variant="destructive">Ditolak</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {wd.transferProofUrl ? (
                        <a
                          href={wd.transferProofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-semibold"
                        >
                          <FileCheck className="h-3.5 w-3.5" />
                          Lihat Bukti Bank
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16 text-muted-foreground text-xs">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <FolderOpen className="h-10 w-10 text-slate-300" />
                      <p className="font-medium text-slate-600">Belum ada riwayat permohonan pencairan dana.</p>
                      <Link href="/galang-dana/kampanye-saya">
                        <Button size="sm" variant="outline" className="text-xs mt-1">
                          Lihat Kampanye Saya
                        </Button>
                      </Link>
                    </div>
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
