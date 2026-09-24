"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Printer,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Share2,
  ExternalLink,
  ShieldCheck,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DUMMY_TRANSACTIONS } from "@/lib/dummy-data";
import { formatRupiah, formatDateIndo } from "@/lib/utils";
import { toast } from "sonner";

export default function DonationDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const tx = DUMMY_TRANSACTIONS.find((t) => t.id === id) || DUMMY_TRANSACTIONS[0];

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link
        href="/dashboard/riwayat-donasi"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Riwayat Donasi
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-extrabold text-foreground">
              Kuitansi Donasi Digital
            </h1>
            <Badge variant="outline" className="font-mono text-xs">
              {tx.donationCode}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Diterbitkan oleh Yayasan DonasiUmat Indonesia pada {formatDateIndo(tx.createdAt)}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrintReceipt} className="gap-1.5 text-xs font-semibold">
            <Printer className="h-4 w-4" />
            Cetak Kuitansi
          </Button>
          <Link href={`/kampanye/${tx.campaignSlug}`}>
            <Button size="sm" className="gap-1.5 text-xs font-semibold">
              Lihat Kampanye
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Receipt Card */}
      <Card className="p-8 sm:p-10 shadow-sm border-border bg-white space-y-8 print:shadow-none print:border-none">
        {/* Receipt Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b border-border pb-6 gap-4">
          <div>
            <span className="font-heading text-2xl font-black text-primary">
              Donasi<span className="text-foreground">Umat</span>
            </span>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Platform Galang Dana Amanah Berbasis Komunitas Terdaftar Kemenkumham RI.
            </p>
          </div>
          <div className="text-left sm:text-right space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status Transaksi:</p>
            {tx.status === "verified" && (
              <Badge variant="success" className="text-xs font-bold px-3 py-1">
                ✓ Donasi Sah & Terverifikasi
              </Badge>
            )}
            {tx.status === "waiting_verification" && (
              <Badge variant="accent" className="text-xs font-bold px-3 py-1">
                ⏳ Menunggu Verifikasi Admin
              </Badge>
            )}
            {tx.status === "rejected" && (
              <Badge variant="destructive" className="text-xs font-bold px-3 py-1">
                ✕ Bukti Transfer Ditolak
              </Badge>
            )}
          </div>
        </div>

        {/* Transaction Meta Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm">
          <div className="space-y-3">
            <div>
              <p className="text-muted-foreground text-xs">Penyumbang (Sahabat Umat):</p>
              <p className="font-heading font-bold text-foreground text-sm">
                {tx.isAnonymous ? "Hamba Allah (Anonim)" : tx.donorName}
              </p>
              <p className="text-xs text-muted-foreground">{tx.donorEmail}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Rekening Bank Tujuan:</p>
              <p className="font-semibold text-foreground">{tx.bankDestination}</p>
            </div>
          </div>

          <div className="space-y-3 sm:text-right">
            <div>
              <p className="text-muted-foreground text-xs">Waktu Donasi Dibuat:</p>
              <p className="font-semibold text-foreground">{formatDateIndo(tx.createdAt)}</p>
            </div>
            {tx.verifiedAt && (
              <div>
                <p className="text-muted-foreground text-xs">Diverifikasi oleh Admin:</p>
                <p className="font-semibold text-emerald-700">
                  {tx.verifiedBy} pada {formatDateIndo(tx.verifiedAt)}
                </p>
              </div>
            )}
            {tx.rejectionReason && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-left sm:text-right text-xs text-red-700">
                <strong>Alasan Penolakan:</strong> {tx.rejectionReason}
              </div>
            )}
          </div>
        </div>

        {/* Items Breakdown Table */}
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="bg-slate-50 p-3.5 border-b border-border flex justify-between font-semibold text-xs text-foreground">
            <span>Rincian Pembayaran</span>
            <span>Jumlah</span>
          </div>
          <div className="p-4 space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Alokasi Donasi Pokok:</span>
              <span className="font-semibold tabular-nums">{formatRupiah(tx.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Kode Unik Verifikasi:</span>
              <span className="font-mono text-amber-600 font-bold tabular-nums">+{tx.uniqueCode}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-3 font-heading font-black text-base text-primary">
              <span>Total Transfer Diterima:</span>
              <span className="tabular-nums">{formatRupiah(tx.totalTransfer)}</span>
            </div>
          </div>
        </div>

        {/* Campaign Dedicated */}
        <div className="rounded-xl bg-slate-50/70 border border-border p-4 text-xs space-y-1">
          <span className="text-muted-foreground">Disalurkan untuk Kampanye:</span>
          <p className="font-heading font-bold text-sm text-foreground">
            {tx.campaignTitle}
          </p>
        </div>

        {/* Attached Proof of Transfer Preview */}
        {tx.proofUrl && (
          <div className="space-y-2 border-t border-border pt-6">
            <p className="font-heading font-bold text-xs uppercase tracking-wider text-muted-foreground">
              Lampiran Bukti Transfer yang Diunggah
            </p>
            <div className="rounded-xl border border-border p-3 bg-slate-50 inline-block">
              <img
                src={tx.proofUrl}
                alt="Bukti Transfer"
                className="max-h-56 rounded-lg object-contain shadow-xs"
              />
            </div>
          </div>
        )}

        {/* Signature stamp mock */}
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-muted-foreground gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <span>Dokumen ini sah sebagai tanda terima resmi donasi digital DonasiUmat.</span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">UUID: {tx.id}</span>
        </div>
      </Card>
    </div>
  );
}
