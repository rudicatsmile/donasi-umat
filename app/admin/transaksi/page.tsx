"use client";

import * as React from "react";
import Link from "next/link";
import {
  ReceiptText,
  CheckCircle2,
  XCircle,
  Eye,
  FileCheck,
  Search,
  Filter,
  Check,
  AlertCircle,
  ZoomIn,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { DonationTransaction } from "@/lib/dummy-data";
import { formatRupiah, formatDateIndo } from "@/lib/utils";
import { toast } from "sonner";
import {
  getAdminDonationsAction,
  verifyDonationAction,
  rejectDonationAction,
} from "@/app/actions/donations";

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = React.useState<DonationTransaction[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [filterStatus, setFilterStatus] = React.useState<string>("all");
  const [search, setSearch] = React.useState("");
  const [selectedTx, setSelectedTx] = React.useState<DonationTransaction | null>(null);
  const [rejectReason, setRejectReason] = React.useState("");
  const [showRejectModal, setShowRejectModal] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const fetchTransactions = React.useCallback(async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    else setIsRefreshing(true);
    try {
      const res = await getAdminDonationsAction();
      if (res.success && res.data) {
        setTransactions(res.data as unknown as DonationTransaction[]);
      } else {
        toast.error(res.error || "Gagal memuat data transaksi");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan memuat data transaksi");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filtered = transactions.filter((t) => {
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    const matchSearch =
      (t.donationCode || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.donorName || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.campaignTitle || "").toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleApprove = async (id: string) => {
    setIsProcessing(true);
    try {
      const res = await verifyDonationAction(id);
      if (res.success) {
        setTransactions((prev) =>
          prev.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: "verified",
                  verifiedAt: new Date().toISOString(),
                  verifiedBy: "Admin",
                }
              : t
          )
        );
        setSelectedTx(null);
        toast.success(res.message);
        fetchTransactions(true);
      } else {
        toast.error(res.error || "Gagal memverifikasi donasi");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan sistem");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedTx || !rejectReason.trim()) {
      toast.error("Harap masukkan alasan penolakan!");
      return;
    }
    setIsProcessing(true);
    try {
      const res = await rejectDonationAction(selectedTx.id, rejectReason.trim());
      if (res.success) {
        setTransactions((prev) =>
          prev.map((t) =>
            t.id === selectedTx.id
              ? {
                  ...t,
                  status: "rejected",
                  rejectionReason: rejectReason,
                }
              : t
          )
        );
        setShowRejectModal(false);
        setSelectedTx(null);
        setRejectReason("");
        toast.success(res.message);
        fetchTransactions(true);
      } else {
        toast.error(res.error || "Gagal menolak donasi");
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
            Kelola & Verifikasi Bukti Transfer Donasi
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Data real-time dari database Supabase. Cocokkan bukti transfer struk/m-banking donatur dengan kode unik mutasi rekening.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchTransactions(true)}
          disabled={isLoading || isRefreshing}
          className="gap-2 text-xs font-semibold self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Memperbarui..." : "Segarkan Data"}
        </Button>
      </div>

      {/* Filter and Search */}
      <Card className="p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari kode donasi, nama, atau kampanye..."
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
              Semua ({transactions.length})
            </button>
            <button
              onClick={() => setFilterStatus("waiting_verification")}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filterStatus === "waiting_verification" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Menunggu Verifikasi ({transactions.filter((t) => t.status === "waiting_verification").length})
            </button>
            <button
              onClick={() => setFilterStatus("verified")}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filterStatus === "verified" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Terverifikasi ({transactions.filter((t) => t.status === "verified").length})
            </button>
            <button
              onClick={() => setFilterStatus("rejected")}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filterStatus === "rejected" ? "bg-red-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Ditolak ({transactions.filter((t) => t.status === "rejected").length})
            </button>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs font-medium">Memuat data transaksi dari Supabase...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode & Waktu</TableHead>
                <TableHead>Donatur & WhatsApp</TableHead>
                <TableHead>Kampanye</TableHead>
                <TableHead>Total Transfer (+Kode)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Verifikasi Bukti</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length > 0 ? (
                filtered.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <p className="font-mono font-bold text-xs text-foreground">{tx.donationCode}</p>
                      <p className="text-[11px] text-muted-foreground">{formatDateIndo(tx.createdAt)}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-heading font-semibold text-xs text-foreground">
                        {tx.donorName}
                      </p>
                      <p className="font-mono text-[11px] text-muted-foreground">{tx.donorPhone}</p>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <p className="font-heading font-semibold text-xs text-foreground line-clamp-1">
                        {tx.campaignTitle}
                      </p>
                      <span className="text-[11px] text-muted-foreground">{(tx.bankDestination || "").split(" ")[0]}</span>
                    </TableCell>
                    <TableCell>
                      <p className="font-heading font-black text-xs text-primary tabular-nums">
                        {formatRupiah(tx.totalTransfer)}
                      </p>
                      <p className="font-mono text-[10px] text-amber-700">Kode unik: +{tx.uniqueCode}</p>
                    </TableCell>
                    <TableCell>
                      {tx.status === "verified" && (
                        <Badge variant="success">Terverifikasi</Badge>
                      )}
                      {tx.status === "waiting_verification" && (
                        <Badge variant="accent">Menunggu Verifikasi</Badge>
                      )}
                      {tx.status === "rejected" && (
                        <Badge variant="destructive">Ditolak</Badge>
                      )}
                      {tx.status === "pending" && (
                        <Badge variant="outline">Belum Upload Bukti</Badge>
                      )}
                      {tx.status === "expired" && (
                        <Badge variant="outline" className="text-slate-400">Kedaluwarsa</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant={tx.status === "waiting_verification" ? "default" : "outline"}
                        onClick={() => setSelectedTx(tx)}
                        className="gap-1.5 text-xs font-semibold"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Periksa Bukti
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16 text-muted-foreground text-xs">
                    Tidak ada transaksi donasi yang sesuai dengan kriteria pencarian/filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Proof Inspection Dialog */}
      <Dialog open={!!selectedTx && !showRejectModal} onOpenChange={(open) => !open && setSelectedTx(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Verifikasi Bukti Transfer Manual</DialogTitle>
          </DialogHeader>

          {selectedTx && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-border text-xs">
                <div>
                  <span className="text-muted-foreground">Kode Transaksi:</span>
                  <p className="font-mono font-bold text-foreground">{selectedTx.donationCode}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Nominal Pokok + Kode Unik:</span>
                  <p className="font-heading font-black text-primary text-sm tabular-nums">
                    {formatRupiah(selectedTx.totalTransfer)} (Kode: +{selectedTx.uniqueCode})
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Nama Donatur:</span>
                  <p className="font-semibold text-foreground">{selectedTx.donorName} ({selectedTx.donorPhone})</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tujuan Rekening:</span>
                  <p className="font-semibold text-foreground">{selectedTx.bankDestination}</p>
                </div>
              </div>

              {selectedTx.prayerMessage && (
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-xs">
                  <span className="font-semibold text-amber-800">Doa / Pesan Donatur:</span>
                  <p className="italic text-amber-900 mt-0.5">&ldquo;{selectedTx.prayerMessage}&rdquo;</p>
                </div>
              )}

              {/* Transfer Proof Image */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <ZoomIn className="h-3.5 w-3.5" />
                  Foto Bukti Transfer Donatur:
                </span>
                <div className="rounded-xl border border-border bg-slate-900 p-2 text-center">
                  {selectedTx.proofUrl ? (
                    <img
                      src={selectedTx.proofUrl}
                      alt="Bukti Transfer"
                      className="max-h-72 mx-auto rounded-lg object-contain"
                    />
                  ) : (
                    <div className="py-12 text-slate-400 text-xs flex flex-col items-center gap-2">
                      <AlertCircle className="h-8 w-8 text-slate-500" />
                      <span>Donatur belum mengunggah foto bukti transfer.</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-border">
                {selectedTx.status === "waiting_verification" ? (
                  <>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={isProcessing}
                      onClick={() => setShowRejectModal(true)}
                    >
                      Tolak Bukti
                    </Button>
                    <Button
                      size="sm"
                      disabled={isProcessing}
                      onClick={() => handleApprove(selectedTx.id)}
                      className="gap-1 font-bold"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      Sahkan Donasi (Approve)
                    </Button>
                  </>
                ) : (
                  <div className="flex justify-between items-center w-full">
                    <span className="text-xs text-muted-foreground">
                      Status saat ini: <strong>{selectedTx.status}</strong>
                    </span>
                    <Button variant="outline" onClick={() => setSelectedTx(null)}>
                      Tutup
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alasan Penolakan Bukti Transfer</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-xs text-muted-foreground">
              Jelaskan alasan penolakan (misal: nominal transfer tidak menyertakan kode unik, mutasi bank belum masuk, atau foto struk tidak jelas).
            </p>
            <Textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Contoh: Nominal transfer pada bukti foto tidak sesuai dengan kode unik yang tertera pada transaksi..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" disabled={isProcessing} onClick={() => setShowRejectModal(false)}>
              Batal
            </Button>
            <Button variant="destructive" disabled={isProcessing} onClick={handleReject}>
              {isProcessing ? "Memproses..." : "Konfirmasi Tolak Donasi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
