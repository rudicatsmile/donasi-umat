"use client";

import * as React from "react";
import { Bell, CheckCircle2, MessageSquare, Heart, Clock, ExternalLink, RefreshCw, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDateIndo } from "@/lib/utils";
import { toast } from "sonner";
import {
  getUserNotificationsAction,
  markAllNotificationsReadAction,
} from "@/app/actions/profile-and-category";

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

export default function NotificationsPage() {
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isMarking, setIsMarking] = React.useState(false);

  const loadNotifications = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getUserNotificationsAction();
      if (res.success) {
        setNotifications(res.data);
      } else {
        toast.error(res.error || "Gagal memuat notifikasi");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal menghubungi database");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAllRead = async () => {
    setIsMarking(true);
    try {
      const res = await markAllNotificationsReadAction();
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        toast.success("Semua notifikasi ditandai telah dibaca.");
      } else {
        toast.error(res.error || "Gagal memperbarui notifikasi");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan sistem");
    } finally {
      setIsMarking(false);
    }
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
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadNotifications}
            disabled={isLoading}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Segarkan
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={isMarking || notifications.length === 0}
            className="text-xs"
          >
            {isMarking ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
            Tandai Semua Dibaca
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Card className="p-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Memuat notifikasi Anda dari database...</p>
        </Card>
      ) : notifications.length === 0 ? (
        <Card className="p-12 text-center space-y-2">
          <Bell className="h-10 w-10 text-muted-foreground mx-auto stroke-1" />
          <p className="font-bold text-sm text-foreground">Belum Ada Notifikasi</p>
          <p className="text-xs text-muted-foreground">Setiap status verifikasi donasi dan kabar kampanye akan muncul di sini.</p>
        </Card>
      ) : (
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
      )}
    </div>
  );
}
