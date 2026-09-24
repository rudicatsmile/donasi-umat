import Link from "next/link";
import { cookies } from "next/headers";
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
  HeartHandshake,
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
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatRupiah, formatDateIndo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DonorDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const adminClient = createAdminClient();
  let donorId = user?.id;
  let donorProfile: any = null;

  if (donorId) {
    const { data: p } = await adminClient.from("profiles").select("*").eq("id", donorId).maybeSingle();
    donorProfile = p;
  }

  if (!donorProfile) {
    const cookieStore = await cookies();
    const demoEmail = cookieStore.get("donasiumat_demo_email")?.value;
    if (demoEmail) {
      const { data: p } = await adminClient.from("profiles").select("*").eq("email", demoEmail).maybeSingle();
      if (p) {
        donorProfile = p;
        donorId = p.id;
      }
    }
  }

  if (!donorProfile) {
    const { data: p } = await adminClient.from("profiles").select("*").eq("role", "donor").limit(1).maybeSingle();
    donorProfile = p;
    donorId = p?.id;
  }

  // Fetch real donations for this donor
  let donations: any[] = [];
  if (donorId) {
    const { data: dList } = await adminClient
      .from("donations")
      .select(`
        id,
        donation_code,
        campaign_id,
        donor_id,
        amount,
        unique_code,
        total_transfer,
        bank_destination,
        is_anonymous,
        is_amount_hidden,
        prayer_message,
        proof_url,
        status,
        rejection_reason,
        verified_by,
        verified_at,
        expires_at,
        created_at,
        campaigns (
          id,
          title,
          slug,
          cover_image_url
        )
      `)
      .eq("donor_id", donorId)
      .order("created_at", { ascending: false });

    donations = dList || [];
  }

  const verifiedDonations = donations.filter((t) => t.status === "verified");
  const pendingDonations = donations.filter(
    (t) => t.status === "waiting_verification" || t.status === "pending"
  );
  const totalDonated = verifiedDonations.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  // Unique campaigns supported
  const uniqueCampaigns = new Set(verifiedDonations.map((t) => t.campaign_id));

  const donorName = donorProfile?.full_name || "Sahabat Umat";

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-800 via-primary to-teal-700 p-6 sm:p-8 text-white relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-2xl space-y-2">
          <Badge variant="outline" className="text-emerald-100 border-emerald-400/40 bg-white/10 text-xs">
            Selamat Datang, Sahabat Umat
          </Badge>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">
            {donorName}
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
          <p className="text-xs text-muted-foreground">Dari {verifiedDonations.length} transaksi kebaikan</p>
        </Card>

        <Card className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Kampanye Yang Didukung</span>
            <div className="h-8 w-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <Heart className="h-4 w-4" />
            </div>
          </div>
          <p className="font-heading font-black text-2xl sm:text-3xl text-foreground tabular-nums">
            {uniqueCampaigns.size}
          </p>
          <p className="text-xs text-muted-foreground">Program galang dana aktif terverifikasi</p>
        </Card>

        <Card className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Menunggu Verifikasi Admin</span>
            <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="font-heading font-black text-2xl sm:text-3xl text-amber-700 tabular-nums">
            {pendingDonations.length}
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
            {donations.length > 0 ? (
              donations.slice(0, 5).map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    <p className="font-mono font-bold text-xs text-foreground">{tx.donation_code}</p>
                    <p className="text-[11px] text-muted-foreground">{formatDateIndo(tx.created_at)}</p>
                  </TableCell>
                  <TableCell className="max-w-[240px]">
                    <p className="font-heading font-semibold text-xs text-foreground line-clamp-1">
                      {tx.campaigns?.title || "Program Kebaikan"}
                    </p>
                    <span className="text-[11px] text-muted-foreground">{(tx.bank_destination || "").split(" ")[0]}</span>
                  </TableCell>
                  <TableCell>
                    <p className="font-heading font-bold text-xs text-foreground tabular-nums">
                      {formatRupiah(Number(tx.total_transfer))}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Kode unik: +{tx.unique_code}</p>
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
                    <Link href={`/dashboard/riwayat-donasi/${tx.id}`}>
                      <Button variant="ghost" size="sm" className="text-xs text-primary font-semibold">
                        Detail
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground text-xs">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <HeartHandshake className="h-8 w-8 text-slate-300" />
                    <span>Belum ada transaksi donasi yang tercatat di akun Anda.</span>
                    <Link href="/kampanye" className="mt-1">
                      <Button size="sm" className="font-bold text-xs">
                        Jelajahi Kampanye Kebaikan
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
