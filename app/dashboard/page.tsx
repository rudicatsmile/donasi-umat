import Link from "next/link";
import {
  Wallet,
  Heart,
  Clock,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  ReceiptText,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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

export default function DonorDashboardPage() {
  const myTransactions = DUMMY_TRANSACTIONS;
  const verifiedTransactions = myTransactions.filter((t) => t.status === "verified");
  const pendingTransactions = myTransactions.filter(
    (t) => t.status === "waiting_verification" || t.status === "pending"
  );
  const totalDonated = verifiedTransactions.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-800 via-primary to-teal-700 p-6 sm:p-8 text-white relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-2xl space-y-2">
          <Badge variant="outline" className="text-emerald-100 border-emerald-400/40 bg-white/10 text-xs">
            Selamat Datang, Sahabat Umat
          </Badge>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">
            Dimas Nugraha
          </h1>
          <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed">
            Terima kasih telah membersamai langkah kebaikan para penerima manfaat. Setiap donasi Anda mengalirkan harapan baru.
          </p>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total Donasi Terverifikasi</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <p className="font-heading font-black text-2xl sm:text-3xl text-primary tabular-nums">
            {formatRupiah(totalDonated)}
          </p>
          <p className="text-xs text-muted-foreground">Dari {verifiedTransactions.length} transaksi kebaikan</p>
        </Card>

        <Card className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Kampanye Yang Didukung</span>
            <div className="h-8 w-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <Heart className="h-4 w-4" />
            </div>
          </div>
          <p className="font-heading font-black text-2xl sm:text-3xl text-foreground tabular-nums">
            4
          </p>
          <p className="text-xs text-muted-foreground">Kesehatan, Pendidikan, dan Bencana</p>
        </Card>

        <Card className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Menunggu Verifikasi Admin</span>
            <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="font-heading font-black text-2xl sm:text-3xl text-amber-700 tabular-nums">
            {pendingTransactions.length}
          </p>
          <p className="text-xs text-muted-foreground">Verifikasi maksimal 1x24 jam</p>
        </Card>
      </div>

      {/* Recent Donations Table */}
      <Card className="shadow-xs overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-foreground">
              Donasi Terbaru Anda
            </h3>
            <p className="text-xs text-muted-foreground">Daftar transaksi donasi yang baru saja Anda salurkan.</p>
          </div>
          <Link href="/dashboard/riwayat-donasi">
            <Button variant="outline" size="sm" className="gap-1 text-xs font-semibold">
              Lihat Semua
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode & Tanggal</TableHead>
              <TableHead>Kampanye</TableHead>
              <TableHead>Total Transfer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {myTransactions.slice(0, 4).map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>
                  <p className="font-mono font-bold text-xs text-foreground">{tx.donationCode}</p>
                  <p className="text-[11px] text-muted-foreground">{formatDateIndo(tx.createdAt)}</p>
                </TableCell>
                <TableCell className="max-w-[240px]">
                  <p className="font-heading font-semibold text-xs text-foreground line-clamp-1">
                    {tx.campaignTitle}
                  </p>
                  <span className="text-[11px] text-muted-foreground">{tx.bankDestination.split(" ")[0]}</span>
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
                  {tx.status === "pending" && (
                    <Badge variant="outline">Belum Upload</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/dashboard/riwayat-donasi/${tx.id}`}>
                    <Button variant="ghost" size="sm" className="text-xs text-primary font-semibold">
                      Detail
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
