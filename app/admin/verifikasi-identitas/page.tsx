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
import { DUMMY_IDENTITIES, IdentityVerification } from "@/lib/dummy-data";
import { formatDateIndo } from "@/lib/utils";
import { toast } from "sonner";
import { approveIdentityAction, rejectIdentityAction } from "@/app/actions/identity";

export default function AdminIdentityVerificationPage() {
  const [identities, setIdentities] = React.useState<IdentityVerification[]>(DUMMY_IDENTITIES);
  const [selectedIdentity, setSelectedIdentity] = React.useState<IdentityVerification | null>(null);
  const [rejectReason, setRejectReason] = React.useState("");
  const [showRejectDialog, setShowRejectDialog] = React.useState(false);

  const handleApprove = async (id: string) => {
    const target = identities.find((i) => i.id === id);
    try {
      const res = await approveIdentityAction(id, target?.userId || "user-mock-id");
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
    }
  };

  const handleReject = async () => {
    if (!selectedIdentity || !rejectReason) {
      toast.error("Harap isi alasan penolakan!");
      return;
    }
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
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
          Verifikasi Identitas Penggalang (Tier 1)
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Pemeriksaan kepatuhan hukum: cocokkan KTP asli, foto selfie memegang identitas, dan buku tabungan.
        </p>
      </div>

      <Card className="shadow-xs overflow-hidden">
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
                      onClick={() => setShowRejectDialog(true)}
                    >
                      Tolak Pengajuan
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(selectedIdentity.id)}
                      className="gap-1 font-bold"
                    >
                      <CheckCircle2 className="h-4 w-4" />
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
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Konfirmasi Tolak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
