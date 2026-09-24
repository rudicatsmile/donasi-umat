"use client";

import * as React from "react";
import Link from "next/link";
import {
  Wallet,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  FileCheck2,
  AlertCircle,
  ArrowRight,
  Clock,
  CheckCircle2,
  Users,
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
  DUMMY_TRANSACTIONS,
  DUMMY_IDENTITIES,
  DUMMY_WITHDRAWALS,
  DUMMY_AUDIT_LOGS,
  PLATFORM_STATISTICS,
} from "@/lib/dummy-data";
import { formatRupiah, formatDateIndo } from "@/lib/utils";

export default function AdminDashboardPage() {
  const pendingTransactions = DUMMY_TRANSACTIONS.filter((t) => t.status === "waiting_verification");
  const pendingIdentities = DUMMY_IDENTITIES.filter((i) => i.status === "pending");
  const pendingWithdrawals = DUMMY_WITHDRAWALS.filter((w) => w.status === "pending");

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
              Dasbor Manajemen Platform
            </h1>
            <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200 text-xs">
              Portal Admin
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Ikhtisar operasional harian, transaksi tertunda, moderasi kampanye, dan pengawasan audit log.
          </p>
        </div>
      </div>

      {/* Critical Action Cards (Pending Attention) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="p-5 border-amber-200 bg-amber-50/50 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Bukti Transfer Menunggu Verifikasi
            </span>
            <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <ReceiptText className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="font-heading font-black text-3xl text-amber-800 tabular-nums">
              {pendingTransactions.length}
            </p>
            <Link href="/admin/transaksi">
              <Button size="sm" variant="outline" className="text-xs border-amber-300 hover:bg-amber-100">
                Verifikasi Bukti
              </Button>
            </Link>
          </div>
          <p className="text-[11px] text-amber-800/80">Maksimal SLA verifikasi: 1x24 jam</p>
        </Card>

        <Card className="p-5 border-sky-200 bg-sky-50/50 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-900 uppercase tracking-wider">
              Pengajuan Identitas KTP (KYC)
            </span>
            <div className="h-8 w-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="font-heading font-black text-3xl text-sky-800 tabular-nums">
              {pendingIdentities.length}
            </p>
            <Link href="/admin/verifikasi-identitas">
              <Button size="sm" variant="outline" className="text-xs border-sky-300 hover:bg-sky-100">
                Review KTP
              </Button>
            </Link>
          </div>
          <p className="text-[11px] text-sky-800/80">Calon penggalang dana menunggu approval</p>
        </Card>

        <Card className="p-5 border-emerald-200 bg-emerald-50/50 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
              Permohonan Pencairan Dana
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="font-heading font-black text-3xl text-emerald-800 tabular-nums">
              {pendingWithdrawals.length}
            </p>
            <Link href="/admin/pencairan">
              <Button size="sm" variant="outline" className="text-xs border-emerald-300 hover:bg-emerald-100">
                Proses Transfer
              </Button>
            </Link>
          </div>
          <p className="text-[11px] text-emerald-800/80">Penggalang menunggu transfer dana ke rekening</p>
        </Card>
      </div>

      {/* KPI Overview Metrics Bar */}
      <div className="rounded-2xl border border-border bg-white p-6 shadow-xs">
        <h3 className="font-heading font-bold text-base text-foreground mb-4">
          Statistik Platform Keseluruhan
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-border">
          <div className="pt-2 md:pt-0">
            <p className="font-heading font-black text-2xl text-primary tabular-nums">
              {formatRupiah(PLATFORM_STATISTICS.totalDonationDisbursed)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Total Donasi Dihimpun</p>
          </div>
          <div className="pt-2 md:pt-0">
            <p className="font-heading font-black text-2xl text-foreground tabular-nums">
              {PLATFORM_STATISTICS.totalCampaignsFunded}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Kampanye Lolos Moderasi</p>
          </div>
          <div className="pt-2 md:pt-0">
            <p className="font-heading font-black text-2xl text-foreground tabular-nums">
              {PLATFORM_STATISTICS.totalVerifiedDonors.toLocaleString("id-ID")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Total Donatur Terdaftar</p>
          </div>
          <div className="pt-2 md:pt-0">
            <p className="font-heading font-black text-2xl text-emerald-600">
              {PLATFORM_STATISTICS.verificationAvgHours}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Rata-rata Waktu Verifikasi</p>
          </div>
        </div>
      </div>

      {/* Quick Audit Log Feed */}
      <Card className="shadow-xs overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-foreground">
              Aktivitas Audit Log Terkini (Immutable)
            </h3>
            <p className="text-xs text-muted-foreground">Catatan riwayat aksi penting pada entitas sistem.</p>
          </div>
          <Link href="/admin/audit-log">
            <Button variant="outline" size="sm" className="gap-1 text-xs">
              Buka Semua Log
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="divide-y divide-border">
          {DUMMY_AUDIT_LOGS.map((log) => (
            <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono text-muted-foreground bg-slate-100 px-2 py-0.5 rounded">
                  {new Date(log.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                </span>
                <div>
                  <p className="font-medium text-foreground">{log.description}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Aktor: <strong>{log.actorName}</strong> ({log.actorRole}) • IP: {log.ipAddress}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] uppercase font-mono w-fit">
                {log.action}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
