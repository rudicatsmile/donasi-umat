"use client";

import * as React from "react";
import { Bell, CheckCircle2, MessageSquare, Heart, Clock, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDateIndo } from "@/lib/utils";

interface NotificationItem {
  id: string;
  type: "donation_verified" | "campaign_update" | "whatsapp_sent" | "campaign_target";
  title: string;
  message: string;
  createdAt: string;
  linkUrl?: string;
  isRead: boolean;
  channel: "In-App" | "WhatsApp";
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    type: "donation_verified",
    channel: "WhatsApp",
    title: "Donasi Anda Telah Berhasil Diverifikasi!",
    message: "Halo Dimas Nugraha, donasi Anda sebesar Rp 100.123 untuk kampanye 'Bantu Pengobatan Bu Siti' telah diverifikasi oleh admin. Terima kasih atas kebaikan Anda.",
    createdAt: "2026-09-23T15:30:00Z",
    linkUrl: "/dashboard/riwayat-donasi/tx-1",
    isRead: false,
  },
  {
    id: "notif-2",
    type: "campaign_update",
    channel: "In-App",
    title: "Kabar Terbaru dari Kampanye 'Bantu Pengobatan Bu Siti'",
    message: "Penggalang dr. Nurul Annisa baru saja mengunggah kabar perkembangan: Bu Siti Telah Menjalani Pemeriksaan Darah Lengkap.",
    createdAt: "2026-09-18T10:00:00Z",
    linkUrl: "/kampanye/bantu-pengobatan-bu-siti-bandung",
    isRead: false,
  },
  {
    id: "notif-3",
    type: "campaign_target",
    channel: "WhatsApp",
    title: "Kampanye 'Wakaf Al-Quran Santri Lombok' Mencapai Target!",
    message: "Alhamdulillah! Kampanye yang Anda dukung telah mencapai 100% target dana sebesar Rp 25.000.000.",
    createdAt: "2026-09-10T12:00:00Z",
    linkUrl: "/kampanye/wakaf-al-quran-500-santri-yatim-lombok",
    isRead: true,
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = React.useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
            Pusat Notifikasi
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Pembaruan status verifikasi transfer dan laporan berkala kampanye kebaikan.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="text-xs">
          Tandai Semua Telah Dibaca
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.map((notif) => (
          <Card
            key={notif.id}
            className={`p-5 transition-all shadow-xs ${
              notif.isRead ? "bg-white border-border" : "bg-emerald-50/40 border-emerald-200"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                  notif.channel === "WhatsApp"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-sky-100 text-sky-700"
                }`}
              >
                {notif.channel === "WhatsApp" ? (
                  <MessageSquare className="h-5 w-5" />
                ) : (
                  <Bell className="h-5 w-5" />
                )}
              </div>

              <div className="flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-heading font-bold text-sm text-foreground">
                      {notif.title}
                    </h4>
                    {!notif.isRead && (
                      <span className="h-2 w-2 rounded-full bg-emerald-600 ring-2 ring-emerald-100" />
                    )}
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {notif.channel}
                  </Badge>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {notif.message}
                </p>

                <div className="flex items-center justify-between pt-2 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDateIndo(notif.createdAt)}
                  </span>
                  {notif.linkUrl && (
                    <Link
                      href={notif.linkUrl}
                      className="text-primary hover:underline font-semibold inline-flex items-center gap-1"
                    >
                      Buka Rincian
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
