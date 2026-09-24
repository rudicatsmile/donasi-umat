"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Filter, Download, ExternalLink, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { DUMMY_TRANSACTIONS } from "@/lib/dummy-data";
import { formatRupiah, formatDateIndo } from "@/lib/utils";

export default function DonationHistoryPage() {
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [search, setSearch] = React.useState("");

  const filteredTransactions = DUMMY_TRANSACTIONS.filter((tx) => {
    const matchStatus = statusFilter === "all" || tx.status === statusFilter;
    const matchSearch =
      tx.donationCode.toLowerCase().includes(search.toLowerCase()) ||
      tx.campaignTitle.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
            Riwayat Donasi Saya
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Pantau seluruh status transfer manual, bukti transaksi, dan kuitansi donasi Anda.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari kode donasi atau kampanye..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                statusFilter === "all"
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Semua ({DUMMY_TRANSACTIONS.length})
            </button>
            <button
              onClick={() => setStatusFilter("verified")}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                statusFilter === "verified"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Terverifikasi
            </button>
            <button
              onClick={() => setStatusFilter("waiting_verification")}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                statusFilter === "waiting_verification"
                  ? "bg-amber-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Menunggu Verifikasi
            </button>
            <button
              onClick={() => setStatusFilter("rejected")}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                statusFilter === "rejected"
                  ? "bg-red-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Ditolak
            </button>
          </div>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card className="shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No. Donasi & Tanggal</TableHead>
              <TableHead>Kampanye Penerima</TableHead>
              <TableHead>Bank Tujuan</TableHead>
              <TableHead>Total Transfer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    <p className="font-mono font-bold text-xs text-foreground">{tx.donationCode}</p>
                    <p className="text-[11px] text-muted-foreground">{formatDateIndo(tx.createdAt)}</p>
                  </TableCell>
                  <TableCell className="max-w-[280px]">
                    <p className="font-heading font-semibold text-xs text-foreground line-clamp-1">
                      {tx.campaignTitle}
                    </p>
                    {tx.prayerMessage && (
                      <p className="text-[11px] text-muted-foreground italic line-clamp-1 mt-0.5">
                        &ldquo;{tx.prayerMessage}&rdquo;
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    {tx.bankDestination.split(" ")[0]}
                  </TableCell>
                  <TableCell>
                    <p className="font-heading font-bold text-xs text-foreground tabular-nums">
                      {formatRupiah(tx.totalTransfer)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Kode unik: +{tx.uniqueCode}</p>
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
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/riwayat-donasi/${tx.id}`}>
                      <Button variant="outline" size="sm" className="text-xs">
                        Lihat Kuitansi
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-xs">
                  Tidak ada transaksi donasi yang sesuai dengan filter ini.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
