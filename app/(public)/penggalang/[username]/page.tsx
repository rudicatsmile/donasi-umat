import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  Calendar,
  Sparkles,
  Award,
  ArrowLeft,
  Share2,
  Building,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CampaignCard } from "@/components/campaign/campaign-card";
import { DUMMY_FUNDRAISERS, DUMMY_CAMPAIGNS } from "@/lib/dummy-data";
import { formatRupiah, formatDateIndo } from "@/lib/utils";

interface FundraiserProfileProps {
  params: Promise<{ username: string }>;
}

export default async function FundraiserProfilePage({ params }: FundraiserProfileProps) {
  const { username } = await params;
  const fundraiser =
    DUMMY_FUNDRAISERS.find((f) => f.username === username) || DUMMY_FUNDRAISERS[0];

  // Campaigns created by this fundraiser
  const campaigns = DUMMY_CAMPAIGNS.filter(
    (c) => c.fundraiser.id === fundraiser.id
  );

  return (
    <div className="py-10 lg:py-16 bg-slate-50/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl space-y-8">
        <Link
          href="/kampanye"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Kampanye
        </Link>

        {/* Profile Header Card */}
        <div className="rounded-3xl border border-border bg-white p-6 sm:p-10 shadow-xs relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <div className="relative">
              <img
                src={fundraiser.avatarUrl}
                alt={fundraiser.fullName}
                className="h-28 w-28 rounded-full object-cover ring-4 ring-emerald-500/20 shadow-md"
              />
              {fundraiser.isVerified && (
                <div className="absolute bottom-1 right-1 h-7 w-7 rounded-full bg-emerald-600 text-white flex items-center justify-center ring-2 ring-white" title="Penggalang Terverifikasi">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
                      {fundraiser.fullName}
                    </h1>
                    {fundraiser.isVerified && (
                      <Badge variant="success" className="text-xs">
                        Terverifikasi KTP
                      </Badge>
                    )}
                  </div>
                  {fundraiser.institution && (
                    <p className="text-xs sm:text-sm font-semibold text-primary mt-1 flex items-center justify-center sm:justify-start gap-1.5">
                      <Building className="h-4 w-4" />
                      {fundraiser.institution}
                    </p>
                  )}
                </div>

                <Link href="/galang-dana">
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs font-semibold">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    Galang Dana Serupa
                  </Button>
                </Link>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                {fundraiser.bio}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-muted-foreground border-t border-border">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Bergabung sejak {formatDateIndo(fundraiser.joinedDate)}
                </span>
                <span>•</span>
                <span>ID Akun: @{fundraiser.username}</span>
              </div>
            </div>
          </div>

          {/* Stats Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 mt-6 border-t border-border text-center">
            <div className="p-3 rounded-xl bg-slate-50">
              <p className="font-heading font-black text-xl text-primary tabular-nums">
                {fundraiser.totalCampaigns}
              </p>
              <p className="text-[11px] text-muted-foreground font-medium">Total Kampanye</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50">
              <p className="font-heading font-black text-xl text-emerald-700 tabular-nums">
                {formatRupiah(fundraiser.totalFundsRaised)}
              </p>
              <p className="text-[11px] text-muted-foreground font-medium">Total Dana Dihimpun</p>
            </div>
            <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-slate-50">
              <p className="font-heading font-black text-xl text-foreground">
                100%
              </p>
              <p className="text-[11px] text-muted-foreground font-medium">Laporan Tervalidasi</p>
            </div>
          </div>
        </div>

        {/* Campaign List by this Fundraiser */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground">
              Kampanye dari Penggalang Ini ({campaigns.length})
            </h2>
          </div>

          {campaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((c) => (
                <CampaignCard key={c.id} campaign={c} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-white text-muted-foreground">
              Belum ada kampanye aktif dari penggalang ini saat ini.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
