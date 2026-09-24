"use client";

import * as React from "react";
import Link from "next/link";
import { Wallet, CheckCircle2, Clock, FileCheck, ArrowRight, ExternalLink } from "lucide-react";
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
import { DUMMY_WITHDRAWALS } from "@/lib/dummy-data";
import { formatRupiah, formatDateIndo } from "@/lib/utils";

export default function FundraiserWithdrawalsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
            Riwayat Pencairan Dana
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Daftar pengajuan penarikan dana donasi terhimpun ke rekening bank Anda.
          </p>
        </div>
        <Link href="/galang-dana/kampanye-saya">
          <Button variant="outline" className="text-xs">
            Pilih Kampanye untuk Pencairan
          </Button>
        </Link>
      </div>

      <Card className="shadow-xs overflow-hidden">
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
            {DUMMY_WITHDRAWALS.map((wd) => (
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
                </TableCell>
                <TableCell>
                  {wd.status === "approved" && (
                    <Badge variant="success">Dana Ditransfer</Badge>
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
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
