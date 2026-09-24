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
  Loader2,
  RefreshCw,
  FolderOpen,
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
import { formatRupiah, formatDateIndo } from "@/lib/utils";
import { toast } from "sonner";
import {
  getAdminWithdrawalsAction,
  markWithdrawalTransferredAction,
  rejectWithdrawalAction,
} from "@/app/actions/disbursement-and-updates";

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [selectedWd, setSelectedWd] = React.useState<any | null>(null);
  const [proofFile, setProofFile] = React.useState<File | null>(null);
  const [proofPreview, setProofPreview] = React.useState<string | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const loadWithdrawals = React.useCallback(async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    else setIsRefreshing(true);
    try {
      const res = await getAdminWithdrawalsAction();
      if (res.success && res.data) {
        setWithdrawals(res.data);
      } else {
        toast.error(res.error || "Gagal memuat permohonan pencairan");
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 5MB!");
        return;
      }
      setProofFile(file);
      setProofPreview(URL.createObjectURL(file));
      toast.success("File bukti transfer bank berhasil dipilih");
    }
  };

  const handleMarkTransferred = async (id: string) => {
    if (!proofFile && !proofPreview) {
      toast.error("Harap lampirkan bukti transfer perbankan!");
      return;
    }
    setIsProcessing(true);
    try {
      const formData = new FormData();
      if (proofFile) formData.append("proof_file", proofFile);
      if (proofPreview) formData.append("proof_url", proofPreview);

      const res = await markWithdrawalTransferredAction(id, formData);
      if (res.success) {
        toast.success(res.message);
        setSelectedWd(null);
        setProofFile(null);
        setProofPreview(null);
        loadWithdrawals(true);
      } else {
        toast.error(res.error || "Gagal memperbarui status transfer");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan sistem");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
            Kelola Pencairan Dana Donasi
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Data real-time pencairan dari database. Verifikasi permohonan penarikan dana dan unggah bukti transfer antarbank.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadWithdrawals(true)}
          disabled={isLoading || isRefreshing}
          className="gap-2 text-xs font-semibold self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Memperbarui..." : "Segarkan Data"}
        </Button>
      </div>

      <Card className="shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs font-medium">Memuat data pencairan dana dari database...</p>
          </div>
        ) : (
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
              {withdrawals.length > 0 ? (
                withdrawals.map((w) => (
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
                      {w.status === "transferred" && (
                        <Badge variant="success">Dana Ditransfer</Badge>
                      )}
                      {w.status === "approved" && (
                        <Badge variant="default">Disetujui Admin</Badge>
                      )}
                      {w.status === "pending" && (
                        <Badge variant="accent">Menunggu Transfer</Badge>
                      )}
                      {w.status === "rejected" && (
                        <Badge variant="destructive">Ditolak</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {w.status === "pending" || w.status === "approved" ? (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedWd(w);
                            setProofFile(null);
                            setProofPreview(null);
                          }}
                          className="text-xs font-bold gap-1"
                        >
                          <Wallet className="h-3.5 w-3.5" />
                          Proses Transfer
                        </Button>
                      ) : (
                        <Badge variant="outline" className="text-xs text-emerald-700">
                          Selesai Ditransfer
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16 text-muted-foreground text-xs">
                    Belum ada pengajuan pencairan dana donasi yang tercatat di database.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
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
                {proofPreview ? (
                  <div className="space-y-3 text-center border-2 border-dashed border-emerald-500 bg-emerald-50/40 rounded-xl p-4">
                    <img
                      src={proofPreview}
                      alt="Pratinjau Bukti"
                      className="max-h-48 mx-auto rounded-lg object-contain shadow-xs"
                    />
                    <label className="cursor-pointer inline-block text-xs text-primary underline font-medium">
                      Ganti File Bukti Transfer
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,application/pdf"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                ) : (
                  <label className="border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors block border-border bg-slate-50 hover:border-primary">
                    <UploadCloud className="h-8 w-8 mx-auto text-slate-400" />
                    <p className="text-xs font-semibold text-foreground mt-2">
                      Klik untuk memilih file bukti transfer perbankan
                    </p>
                    <p className="text-[11px] text-muted-foreground">Format JPG, PNG, atau PDF (maks. 5MB)</p>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,application/pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </div>

              <DialogFooter className="pt-4 border-t border-border">
                <Button variant="outline" disabled={isProcessing} onClick={() => setSelectedWd(null)}>
                  Batal
                </Button>
                <Button
                  disabled={(!proofFile && !proofPreview) || isProcessing}
                  onClick={() => handleMarkTransferred(selectedWd.id)}
                  className="font-bold gap-1"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
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
