import Link from "next/link";
import Image from "next/image";
import { Clock, Users, MapPin, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatRupiah, getDaysLeft } from "@/lib/utils";
import { Campaign } from "@/lib/dummy-data";

interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const percentage = Math.min(
    Math.round((campaign.collectedAmount / campaign.targetAmount) * 100),
    100
  );
  const daysLeft = getDaysLeft(campaign.deadline);
  const isCompleted = campaign.status === "completed" || percentage >= 100;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      {/* Cover Image & Badges */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
        <img
          src={campaign.coverImageUrl}
          alt={campaign.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <Badge variant="outline" className="bg-white/90 backdrop-blur-xs font-medium text-xs shadow-xs">
            {campaign.categoryName}
          </Badge>
          {campaign.isUrgent && (
            <Badge variant="urgent" className="gap-1 shadow-xs">
              <AlertCircle className="h-3 w-3" />
              Mendesak
            </Badge>
          )}
          {isCompleted && (
            <Badge variant="success" className="bg-emerald-600 text-white border-0 shadow-xs">
              Target Tercapai 🎉
            </Badge>
          )}
        </div>

        {/* Location chip */}
        <div className="absolute bottom-2.5 left-3 flex items-center gap-1 text-white/90 text-xs font-medium drop-shadow-sm">
          <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span className="truncate max-w-[220px]">{campaign.beneficiaryLocation}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Fundraiser Info */}
        <div className="flex items-center gap-2 mb-2.5">
          <img
            src={campaign.fundraiser.avatarUrl}
            alt={campaign.fundraiser.fullName}
            className="h-5 w-5 rounded-full object-cover ring-1 ring-emerald-500/30"
          />
          <span className="text-xs text-muted-foreground truncate font-medium">
            {campaign.fundraiser.fullName}
          </span>
          {campaign.fundraiser.isVerified && (
            <span title="Penggalang Terverifikasi">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            </span>
          )}
        </div>

        {/* Campaign Title */}
        <Link href={`/kampanye/${campaign.slug}`} className="group-hover:text-primary transition-colors">
          <h3 className="font-heading font-bold text-base line-clamp-2 leading-snug text-foreground mb-3">
            {campaign.title}
          </h3>
        </Link>

        {/* Progress Section */}
        <div className="mt-auto space-y-2 pt-2">
          <Progress value={percentage} className="h-2.5" />

          {/* Amount Metrics */}
          <div className="flex items-baseline justify-between pt-1">
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">Terkumpul</p>
              <p className="font-heading font-extrabold text-sm text-primary tabular-nums">
                {formatRupiah(campaign.collectedAmount)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-muted-foreground font-medium">Target</p>
              <p className="font-heading font-semibold text-xs text-foreground/80 tabular-nums">
                {formatRupiah(campaign.targetAmount)}
              </p>
            </div>
          </div>

          {/* Bottom Meta */}
          <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 font-medium">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              <span>{campaign.donorCount} Donatur</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>{isCompleted ? "Selesai" : `${daysLeft} hari lagi`}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
