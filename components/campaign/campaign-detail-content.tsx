"use client";

import * as React from "react";
import Link from "next/link";
import {
  MapPin,
  Clock,
  CheckCircle2,
  Share2,
  Heart,
  HandHeart,
  ShieldCheck,
  AlertCircle,
  FileCheck2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatRupiah, formatDateIndo, getDaysLeft } from "@/lib/utils";
import { toast } from "sonner";
import type {
  Campaign,
  CampaignUpdate,
  DonationTransaction,
  TransparencyReport,
} from "@/lib/dummy-data";

interface CampaignDetailContentProps {
  campaign: Campaign;
  updates: CampaignUpdate[];
  donations: DonationTransaction[];
  reports: TransparencyReport[];
}

export function CampaignDetailContent({
  campaign,
  updates,
  donations,
  reports,
}: CampaignDetailContentProps) {
  const [copied, setCopied] = React.useState(false);
  const [activeImageIndex, setActiveImageIndex] = React.useState(0);

  const percentage = Math.min(
    Math.round((campaign.collectedAmount / campaign.targetAmount) * 100),
    100
  );
  const daysLeft = getDaysLeft(campaign.deadline);
  const isCompleted = percentage >= 100;

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Tautan kampanye berhasil disalin!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const allImages = [campaign.coverImageUrl, ...(campaign.galleryUrls || [])];
  const prayers = donations.filter((d) => d.prayerMessage && d.prayerMessage.trim().length > 0);

  return (
    <div className="py-8 lg:py-12 bg-slate-50/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Beranda</Link>
          <span>/</span>
          <Link href="/kampanye" className="hover:text-primary transition-colors">Kampanye</Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-md">
            {campaign.title}
          </span>
        </nav>

        {/* 2-Column Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Media, Story & Tabs (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Title & Badges */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="default" className="text-xs">{campaign.categoryName}</Badge>
                {campaign.isUrgent && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Mendesak
                  </Badge>
                )}
                {isCompleted && (
                  <Badge className="bg-emerald-600 text-white">Target Tercapai</Badge>
                )}
                <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{campaign.beneficiaryLocation}</span>
                </div>
              </div>

              <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground leading-tight">
                {campaign.title}
              </h1>
            </div>

            {/* Media Showcase */}
            <div className="rounded-2xl overflow-hidden border border-border bg-white shadow-xs">
              <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                <img
                  src={allImages[activeImageIndex] || campaign.coverImageUrl}
                  alt={campaign.title}
                  className="h-full w-full object-cover transition-all duration-300"
                />
              </div>

              {allImages.length > 1 && (
                <div className="flex items-center gap-2 p-3 overflow-x-auto bg-slate-50 border-t border-border">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative h-16 w-24 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                        activeImageIndex === idx ? "border-primary ring-2 ring-primary/20" : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${idx}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fundraiser Info Bar */}
            <div className="rounded-xl border border-border bg-white p-4 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <img
                  src={campaign.fundraiser.avatarUrl}
                  alt={campaign.fundraiser.fullName}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-primary/20"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-heading font-bold text-sm text-foreground">
                      {campaign.fundraiser.fullName}
                    </span>
                    {campaign.fundraiser.isVerified && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" />
                        Terverifikasi
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Penggalang Dana Terpercaya • DonasiUmat
                  </p>
                </div>
              </div>
              <Link href={`/penggalang/${campaign.fundraiser.username || campaign.fundraiser.id}`}>
                <Button variant="ghost" size="sm" className="text-xs text-primary font-semibold">
                  Lihat Profil
                </Button>
              </Link>
            </div>

            {/* Interactive Module Tabs */}
            <div className="rounded-2xl border border-border bg-white p-6 shadow-xs">
              <Tabs defaultValue="cerita" className="w-full">
                <TabsList className="grid w-full grid-cols-4 h-12 rounded-xl bg-slate-100 p-1">
                  <TabsTrigger value="cerita" className="text-xs sm:text-sm font-semibold">
                    Cerita
                  </TabsTrigger>
                  <TabsTrigger value="kabar" className="text-xs sm:text-sm font-semibold">
                    Kabar ({updates.length})
                  </TabsTrigger>
                  <TabsTrigger value="doa" className="text-xs sm:text-sm font-semibold">
                    Doa ({prayers.length})
                  </TabsTrigger>
                  <TabsTrigger value="transparansi" className="text-xs sm:text-sm font-semibold">
                    Transparansi ({reports.length})
                  </TabsTrigger>
                </TabsList>

                {/* Tab 1: Cerita */}
                <TabsContent value="cerita" className="mt-6 space-y-6">
                  <div className="prose max-w-none text-slate-700 leading-relaxed text-sm sm:text-base space-y-4 whitespace-pre-line">
                    {campaign.story}
                  </div>

                  <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-4 text-xs text-emerald-800 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      Komitmen Amanah DonasiUmat
                    </div>
                    <p>
                      Seluruh donasi pada kampanye ini ditampung sementara di rekening resmi yayasan dan baru disalurkan setelah pengajuan pencairan diverifikasi oleh tim kurator.
                    </p>
                  </div>
                </TabsContent>

                {/* Tab 2: Kabar Terbaru */}
                <TabsContent value="kabar" className="mt-6 space-y-6">
                  {updates.length > 0 ? (
                    <div className="space-y-6">
                      {updates.map((update) => (
                        <div key={update.id} className="relative pl-6 pb-6 border-l-2 border-primary/30 last:border-0 last:pb-0">
                          <span className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-primary ring-4 ring-emerald-50" />
                          <div className="space-y-2">
                            <span className="text-xs font-semibold text-primary">
                              {formatDateIndo(update.createdAt)}
                            </span>
                            <h4 className="font-heading font-bold text-base text-foreground">
                              {update.title}
                            </h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                              {update.content}
                            </p>
                            {update.imageUrl && (
                              <img
                                src={update.imageUrl}
                                alt={update.title}
                                className="rounded-xl border border-border mt-3 max-h-72 w-full object-cover"
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-muted-foreground text-sm space-y-2">
                      <Clock className="h-8 w-8 mx-auto text-slate-300" />
                      <p>Belum ada update kabar terbaru dari penggalang dana.</p>
                      <p className="text-xs">Pembaruan kondisi penerima manfaat akan diposting di sini.</p>
                    </div>
                  )}
                </TabsContent>

                {/* Tab 3: Doa & Donatur */}
                <TabsContent value="doa" className="mt-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <div>
                      <h4 className="font-heading font-bold text-base text-foreground">
                        Doa & Pesan Sahabat Umat
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Doa tulus dari para dermawan untuk penerima manfaat.
                      </p>
                    </div>
                    <Link href={`/kampanye/${campaign.slug}/donasi`}>
                      <Button size="sm" variant="outline" className="gap-1 text-xs">
                        <Heart className="h-3.5 w-3.5 text-red-500" />
                        Beri Doa
                      </Button>
                    </Link>
                  </div>

                  {prayers.length > 0 ? (
                    <div className="space-y-4">
                      {prayers.map((d) => (
                        <div key={d.id} className="rounded-xl border border-border bg-slate-50/60 p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                <AvatarFallback className="bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                  {d.donorName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-heading font-bold text-xs text-foreground">
                                {d.donorName}
                              </span>
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                              {d.isAmountHidden ? "Berdonasi" : `Berdonasi ${formatRupiah(d.amount)}`}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-700 italic bg-white p-3 rounded-lg border border-border/80">
                            &ldquo;{d.prayerMessage}&rdquo;
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-muted-foreground text-sm space-y-2">
                      <Heart className="h-8 w-8 mx-auto text-slate-300" />
                      <p>Belum ada doa tertulis. Jadilah orang pertama yang mendoakan!</p>
                    </div>
                  )}
                </TabsContent>

                {/* Tab 4: Laporan Transparansi Penyaluran */}
                <TabsContent value="transparansi" className="mt-6 space-y-6">
                  <div className="border-b border-border pb-4">
                    <div className="flex items-center gap-2">
                      <FileCheck2 className="h-5 w-5 text-emerald-600" />
                      <h4 className="font-heading font-bold text-base text-foreground">
                        Laporan Transparansi Penggunaan Dana
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Setiap rupiah yang disalurkan diverifikasi dengan bukti kuitansi dan dokumentasi foto nyata.
                    </p>
                  </div>

                  {reports.length > 0 ? (
                    <div className="space-y-6">
                      {reports.map((report) => (
                        <div key={report.id} className="rounded-xl border border-border p-5 bg-slate-50/50 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <span className="text-[11px] text-muted-foreground">
                                Tanggal Penyaluran: {formatDateIndo(report.disbursementDate)}
                              </span>
                              <h5 className="font-heading font-bold text-base text-foreground">
                                {report.title}
                              </h5>
                            </div>
                            <div className="text-left sm:text-right">
                              <span className="text-[11px] text-muted-foreground">Dana Digunakan</span>
                              <p className="font-heading font-black text-base text-emerald-700 tabular-nums">
                                {formatRupiah(report.amountUsed)}
                              </p>
                            </div>
                          </div>

                          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                            {report.description}
                          </p>

                          {report.beneficiaries && (
                            <p className="text-xs text-muted-foreground">
                              <strong>Penerima Manfaat:</strong> {report.beneficiaries}
                            </p>
                          )}

                          {report.photoUrls && report.photoUrls.length > 0 && (
                            <div className="space-y-1.5">
                              <p className="text-xs font-semibold text-foreground">Foto Bukti Penyaluran:</p>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {report.photoUrls.map((pUrl, pIdx) => (
                                  <img
                                    key={pIdx}
                                    src={pUrl}
                                    alt={`Bukti Penyaluran ${pIdx}`}
                                    className="rounded-lg border border-border h-32 w-full object-cover"
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-emerald-800">
                            <span className="flex items-center gap-1 font-semibold">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              Laporan telah diverifikasi Tim Audit DonasiUmat
                            </span>
                            <span>Status: Publik</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-muted-foreground text-sm space-y-2">
                      <FileCheck2 className="h-8 w-8 mx-auto text-slate-300" />
                      <p>Belum ada laporan penyaluran dana yang dipublikasikan.</p>
                      <p className="text-xs">Laporan penyaluran akan terbit setelah pencairan dana pertama dilakukan.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Right Column: Sticky Donation Card (4 cols) */}
          <div className="lg:col-span-4 sticky top-22 space-y-4">
            <Card className="shadow-md border-border/80 p-6 space-y-6">
              {/* Progress & Amount Metrics */}
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Dana Terkumpul</p>
                    <p className="font-heading font-black text-2xl text-primary tabular-nums">
                      {formatRupiah(campaign.collectedAmount)}
                    </p>
                  </div>
                  <span className="font-heading font-extrabold text-sm text-foreground bg-slate-100 px-2.5 py-1 rounded-full">
                    {percentage}%
                  </span>
                </div>

                <Progress value={percentage} className="h-3" />

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                  <span>Target: <strong>{formatRupiah(campaign.targetAmount)}</strong></span>
                  <span>Sisa: <strong>{isCompleted ? "Selesai" : `${daysLeft} hari`}</strong></span>
                </div>
              </div>

              {/* Counter badges */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-center">
                <div>
                  <p className="font-heading font-bold text-base text-foreground tabular-nums">
                    {campaign.donorCount}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Sahabat Berdonasi</p>
                </div>
                <div>
                  <p className="font-heading font-bold text-base text-foreground tabular-nums">
                    {daysLeft}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Hari Tersisa</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link href={`/kampanye/${campaign.slug}/donasi`} className="block w-full">
                  <Button size="lg" className="w-full text-base font-bold shadow-md shadow-primary/20 gap-2">
                    <HandHeart className="h-5 w-5" />
                    Donasi Sekarang
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  size="default"
                  onClick={handleShare}
                  className="w-full gap-2 text-xs font-semibold"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
                  {copied ? "Tautan Tersalin!" : "Bagikan Kampanye"}
                </Button>
              </div>

              {/* Guarantee Box */}
              <div className="rounded-xl border border-border bg-slate-50/70 p-3.5 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Jaminan Donasi 100% Aman
                </div>
                <p className="text-[11px] leading-relaxed">
                  Semua transaksi menggunakan transfer manual ke rekening berbadan hukum Yayasan DonasiUmat dan diverifikasi langsung oleh admin.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
