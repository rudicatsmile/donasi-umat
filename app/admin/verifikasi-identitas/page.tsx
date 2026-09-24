"use client";

import * as React from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  FileCheck2,
  AlertCircle,
  Building,
  User,
  Clock,
  RefreshCw,
  Loader2,
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
import { Textarea } from "@/components/ui/textarea";
import { IdentityVerification } from "@/lib/dummy-data";
import { formatDateIndo } from "@/lib/utils";
import { toast } from "sonner";
import {
  getAdminIdentityVerificationsAction,
  approveIdentityAction,
  rejectIdentityAction,
} from "@/app/actions/identity";

export default function AdminIdentityVerificationPage() {
  const [identities, setIdentities] = React.useState<IdentityVerification[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedIdentity, setSelectedIdentity] = React.useState<IdentityVerification | null>(null);
  const [rejectReason, setRejectReason] = React.useState("");
  const [showRejectDialog, setShowRejectDialog] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const loadIdentities = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAdminIdentityVerificationsAction();
      if (res.success) {
        setIdentities(res.data);
      } else {
        toast.error(res.error || "Gagal memuat data verifikasi");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal menghubungi database");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadIdentities();
  }, [loadIdentities]);

  const handleApprove = async (id: string) => {
    const target = identities.find((i) => i.id === id);
    if (!target) return;

    setIsProcessing(true);
    try {
      const res = await approveIdentityAction(id, target.userId);
      if (res.success) {
        setIdentities((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: "verified",
                  reviewedBy: "Admin",
                  reviewedAt: new Date().toISOString(),
                }
              : item
          )
        );
        setSelectedIdentity(null);
        toast.success(res.message);
      } else {
        toast.error(res.error || "Gagal menyetujui verifikasi");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan sistem");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedIdentity || !rejectReason.trim()) {
      toast.error("Harap isi alasan penolakan!");
      return;
    }
    setIsProcessing(true);
    try {
      const res = await rejectIdentityAction(selectedIdentity.id, selectedIdentity.userId, rejectReason);
      if (res.success) {
        setIdentities((prev) =>
          prev.map((item) =>
            item.id === selectedIdentity.id
              ? {
                  ...item,
                  status: "rejected",
                  rejectionReason: rejectReason,
                  reviewedBy: "Admin",
                  reviewedAt: new Date().toISOString(),
                }
              : item
          )
        );
        setShowRejectDialog(false);
        setSelectedIdentity(null);
        setRejectReason("");
        toast.success(res.message);
      } else {
        toast.error(res.error || "Gagal menolak verifikasi");
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
            Verifikasi Identitas Penggalang (Tier 1)
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Pemeriksaan kepatuhan hukum: cocokkan KTP asli, foto selfie memegang identitas, dan buku tabungan.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadIdentities}
          disabled={isLoading}
          className="gap-2 text-xs self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Segarkan Data
        </Button>
      </div>

      <Card className="shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Memuat data pengajuan KYC dari database...</p>
          </div>
        ) : identities.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <ShieldCheck className="h-10 w-10 text-muted-foreground mx-auto stroke-1" />
            <p className="font-bold text-sm text-foreground">Belum Ada Pengajuan Identitas</p>
            <p className="text-xs text-muted-foreground">Semua permohonan verifikasi penggalang dana telah selesai diproses.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pemohon & Tanggal</TableHead>
                <TableHead>Jenis & Nomor NIK</TableHead>
                <TableHead>Rekening Pencairan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi Moderasi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {identities.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <p className="font-heading font-bold text-xs text-foreground">{item.userName}</p>
                    <p className="text-[11px] text-muted-foreground">{item.userEmail}</p>
                    <p className="text-[10px] text-slate-400">{formatDateIndo(item.createdAt)}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono">
                      {item.idType}
                    </Badge>
                    <p className="font-mono text-xs font-bold text-slate-700 mt-1">
                      {item.idNumberMasked}
                    </p>
                  </TableCell>
                  <TableCell className="text-xs">
                    <span className="font-semibold">{item.bankName}</span>
                    <p className="font-mono text-[11px] text-muted-foreground">{item.bankAccountNumber}</p>
                    <p className="text-[10px] text-slate-500">a.n {item.bankAccountHolder}</p>
                  </TableCell>
                  <TableCell>
                    {item.status === "verified" && (
                      <Badge variant="success">Terverifikasi</Badge>
                    )}
                    {item.status === "pending" && (
                      <Badge variant="accent">Menunggu Review</Badge>
                    )}
                    {item.status === "rejected" && (
                      <Badge variant="destructive">Ditolak</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedIdentity(item)}
                      className="gap-1.5 text-xs font-semibold"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Review Dokumen
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Detail KYC Review Modal */}
      <Dialog open={!!selectedIdentity && !showRejectDialog} onOpenChange={(open) => !open && setSelectedIdentity(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Verifikasi Berkas Kependudukan (Tier 1)</DialogTitle>
          </DialogHeader>

          {selectedIdentity && (
            <div className="space-y-6 py-2">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground">Nama Pemohon:</span>
                  <p className="font-bold text-foreground text-sm">{selectedIdentity.fullNameOnId}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Nomor Identitas:</span>
                  <p className="font-mono font-bold text-foreground text-sm">{selectedIdentity.idNumberMasked}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Alamat Domisili KTP:</span>
                  <p className="text-slate-700">{selectedIdentity.address}</p>
                </div>
                <div className="col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-semibold text-slate-700">Rekening Tujuan Pencairan:</span>
                  <p className="text-foreground font-mono mt-0.5">
                    {selectedIdentity.bankName} - {selectedIdentity.bankAccountNumber} (a.n {selectedIdentity.bankAccountHolder})
                  </p>
                </div>
                {selectedIdentity.rejectionReason && (
                  <div className="col-span-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                    <span className="font-semibold">Alasan Penolakan:</span>
                    <p className="text-xs mt-0.5">{selectedIdentity.rejectionReason}</p>
                  </div>
                )}
              </div>

              {/* Photos Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-foreground">1. Foto KTP Asli</p>
                  <img
                    src={selectedIdentity.idPhotoUrl}
                    alt="KTP"
                    className="h-48 w-full object-cover rounded-xl border border-border"
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-foreground">2. Foto Selfie Memegang KTP</p>
                  <img
                    src={selectedIdentity.selfiePhotoUrl}
                    alt="Selfie KTP"
                    className="h-48 w-full object-cover rounded-xl border border-border"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-border">
                {selectedIdentity.status === "pending" ? (
                  <>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={isProcessing}
                      onClick={() => setShowRejectDialog(true)}
                    >
                      Tolak Pengajuan
                    </Button>
                    <Button
                      size="sm"
                      disabled={isProcessing}
                      onClick={() => handleApprove(selectedIdentity.id)}
                      className="gap-1 font-bold"
                    >
                      {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      Setujui Identitas
                    </Button>
                  </>
                ) : (
                  <div className="flex justify-end w-full">
                    <Button variant="outline" onClick={() => setSelectedIdentity(null)}>
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
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alasan Penolakan Identitas</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-xs text-muted-foreground">
              Tuliskan alasan mengapa dokumen identitas penggalang ini ditolak (misal: foto buram, NIK tidak cocok, atau selfie terpotong).
            </p>
            <Textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Contoh: Foto KTP buram dan nomor NIK tidak terbaca dengan jelas. Harap unggah ulang foto yang fokus..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={isProcessing}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Konfirmasi Tolak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
