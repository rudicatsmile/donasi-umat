"use client";

import * as React from "react";
import {
  Wallet,
  CheckCircle2,
  XCircle,
  Eye,
  FileCheck2,
  UploadCloud,
  Building,
  Clock,
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { DUMMY_WITHDRAWALS, WithdrawalRequest } from "@/lib/dummy-data";
import { formatRupiah, formatDateIndo } from "@/lib/utils";
import { toast } from "sonner";
import { markWithdrawalTransferredAction } from "@/app/actions/disbursement-and-updates";

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = React.useState<WithdrawalRequest[]>(DUMMY_WITHDRAWALS);
  const [selectedWd, setSelectedWd] = React.useState<WithdrawalRequest | null>(null);
  const [transferProofUploaded, setTransferProofUploaded] = React.useState(false);

  const handleMarkTransferred = async (id: string) => {
    try {
      const proofUrl = "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80";
      const res = await markWithdrawalTransferredAction(id, proofUrl);
      if (res.success) {
        setWithdrawals((prev) =>
          prev.map((w) =>
            w.id === id
              ? {
                  ...w,
                  status: "transferred",
                  transferProofUrl: proofUrl,
                  transferredAt: new Date().toISOString(),
                }
              : w
          )
        );
        setSelectedWd(null);
        setTransferProofUploaded(false);
        toast.success(res.message);
      } else {
        toast.error(res.error || "Gagal memperbarui status transfer");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan sistem");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
          Kelola Pencairan Dana Donasi
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Verifikasi permohonan penarikan dana terkumpul dan unggah bukti transfer perbankan ke penggalang dana.
        </p>
      </div>

      <Card className="shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode & Tanggal</TableHead>
              <TableHead>Penggalang & Kampanye</TableHead>
              <TableHead>Nominal Diajukan</TableHead>
              <TableHead>Rekening Tujuan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi Transfer</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {withdrawals.map((w) => (
              <TableRow key={w.id}>
                <TableCell>
                  <p className="font-mono font-bold text-xs text-foreground">{w.withdrawalCode}</p>
                  <p className="text-[11px] text-muted-foreground">{formatDateIndo(w.createdAt)}</p>
                </TableCell>
                <TableCell className="max-w-[240px]">
                  <p className="font-heading font-semibold text-xs text-foreground line-clamp-1">
                    {w.fundraiserName}
                  </p>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">{w.campaignTitle}</p>
                </TableCell>
                <TableCell>
                  <p className="font-heading font-black text-xs text-primary tabular-nums">
                    {formatRupiah(w.requestedAmount)}
                  </p>
                </TableCell>
                <TableCell className="text-xs">
                  <span className="font-semibold">{w.bankName}</span>
                  <p className="font-mono text-[11px] text-muted-foreground">{w.bankAccountNumber}</p>
                  <p className="text-[10px] text-slate-500">a.n {w.bankAccountHolder}</p>
                </TableCell>
                <TableCell>
                  {w.status === "approved" || w.status === "transferred" ? (
                    <Badge variant="success">Dana Ditransfer</Badge>
                  ) : (
                    <Badge variant="accent">Menunggu Transfer</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {w.status === "pending" ? (
                    <Button
                      size="sm"
                      onClick={() => setSelectedWd(w)}
                      className="text-xs font-bold gap-1"
                    >
                      <Wallet className="h-3.5 w-3.5" />
                      Proses Transfer
                    </Button>
                  ) : (
                    <Badge variant="outline" className="text-xs text-emerald-700">
                      Selesai
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Modal Proses Transfer Admin */}
      <Dialog open={!!selectedWd} onOpenChange={(open) => !open && setSelectedWd(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Proses Transfer Pencairan Dana</DialogTitle>
          </DialogHeader>

          {selectedWd && (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-border text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Penggalang Dana:</span>
                  <span className="font-bold text-foreground">{selectedWd.fundraiserName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nominal yang Harus Ditransfer:</span>
                  <span className="font-heading font-black text-base text-primary tabular-nums">
                    {formatRupiah(selectedWd.requestedAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tujuan Rekening:</span>
                  <span className="font-mono font-bold text-foreground">
                    {selectedWd.bankName} - {selectedWd.bankAccountNumber} (a.n {selectedWd.bankAccountHolder})
                  </span>
                </div>
                <div className="pt-2 border-t border-border">
                  <span className="text-muted-foreground">Tujuan Penggunaan:</span>
                  <p className="text-slate-700 mt-0.5">{selectedWd.purposeDescription}</p>
                </div>
              </div>

              {/* Upload Bukti Transfer dari Admin */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-semibold text-foreground">
                  Unggah Bukti Transfer Bank Resmi ke Rekening Penggalang:
                </label>
                <div
                  onClick={() => setTransferProofUploaded(true)}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
                    transferProofUploaded
                      ? "border-emerald-500 bg-emerald-50/50"
                      : "border-border bg-slate-50 hover:border-primary"
                  }`}
                >
                  <UploadCloud className={`h-8 w-8 mx-auto ${transferProofUploaded ? "text-emerald-600" : "text-slate-400"}`} />
                  <p className="text-xs font-semibold text-foreground mt-2">
                    {transferProofUploaded
                      ? "✓ Bukti transfer bank yayasan siap dilampirkan"
                      : "Klik untuk memilih file bukti transfer perbankan"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Format JPG, PNG, atau PDF (maks. 5MB)</p>
                </div>
              </div>

              <DialogFooter className="pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setSelectedWd(null)}>
                  Batal
                </Button>
                <Button
                  disabled={!transferProofUploaded}
                  onClick={() => handleMarkTransferred(selectedWd.id)}
                  className="font-bold gap-1"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Tandai Dana Telah Ditransfer
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
