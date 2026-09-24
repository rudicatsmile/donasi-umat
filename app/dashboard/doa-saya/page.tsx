"use client";

import * as React from "react";
import Link from "next/link";
import { Heart, Edit3, Trash2, Clock, MessageSquare, CheckCircle2, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { formatDateIndo } from "@/lib/utils";
import {
  getUserPrayersAction,
  updateUserPrayerAction,
  deleteUserPrayerAction,
} from "@/app/actions/profile-and-category";

interface MyPrayer {
  id: string;
  campaignTitle: string;
  campaignSlug: string;
  message: string;
  createdAt: string;
  isEditable: boolean;
  likes: number;
}

export default function MyPrayersPage() {
  const [prayers, setPrayers] = React.useState<MyPrayer[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [editingPrayer, setEditingPrayer] = React.useState<MyPrayer | null>(null);
  const [editMessage, setEditMessage] = React.useState("");
  const [isProcessing, setIsProcessing] = React.useState(false);

  const loadPrayers = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getUserPrayersAction();
      if (res.success) {
        setPrayers(res.data);
      } else {
        toast.error(res.error || "Gagal memuat doa");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal menghubungi database");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadPrayers();
  }, [loadPrayers]);

  const handleOpenEdit = (prayer: MyPrayer) => {
    setEditingPrayer(prayer);
    setEditMessage(prayer.message);
  };

  const handleSaveEdit = async () => {
    if (!editingPrayer || !editMessage.trim()) return;

    setIsProcessing(true);
    try {
      const res = await updateUserPrayerAction(editingPrayer.id, editMessage.trim());
      if (res.success) {
        setPrayers((prev) =>
          prev.map((p) =>
            p.id === editingPrayer.id ? { ...p, message: editMessage.trim() } : p
          )
        );
        setEditingPrayer(null);
        toast.success(res.message);
      } else {
        toast.error(res.error || "Gagal memperbarui doa");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan sistem");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus doa ini dari kampanye?")) {
      setIsProcessing(true);
      try {
        const res = await deleteUserPrayerAction(id);
        if (res.success) {
          setPrayers((prev) => prev.filter((p) => p.id !== id));
          toast.success(res.message);
        } else {
          toast.error(res.error || "Gagal menghapus doa");
        }
      } catch (err: any) {
        toast.error(err.message || "Terjadi kesalahan sistem");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
            Doa & Pesan Kebaikan Saya
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Kumpulan untaian doa tulus yang telah Anda sematkan pada kampanye yang Anda dukung.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadPrayers}
          disabled={isLoading}
          className="gap-2 text-xs self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Segarkan Data
        </Button>
      </div>

      {isLoading ? (
        <Card className="p-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Memuat doa kebaikan Anda dari database...</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {prayers.map((prayer) => (
            <Card key={prayer.id} className="p-6 space-y-3 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                <Link
                  href={`/kampanye/${prayer.campaignSlug}`}
                  className="font-heading font-bold text-sm text-foreground hover:text-primary transition-colors line-clamp-1"
                >
                  {prayer.campaignTitle}
                </Link>
                <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>{formatDateIndo(prayer.createdAt)}</span>
                  <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50 border-emerald-200">
                    Tersimpan di Database
                  </Badge>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 italic bg-slate-50 p-4 rounded-xl border border-slate-200/80 leading-relaxed">
                &ldquo;{prayer.message}&rdquo;
              </p>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                  <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
                  <span>{prayer.likes} Sahabat Mengaminkan</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(prayer)}
                    disabled={isProcessing}
                    className="gap-1 text-xs"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Ubah
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(prayer.id)}
                    disabled={isProcessing}
                    className="gap-1 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Hapus
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {prayers.length === 0 && (
            <div className="text-center py-12 rounded-2xl border border-dashed border-border bg-white text-muted-foreground space-y-3">
              <Heart className="h-8 w-8 mx-auto text-slate-300" />
              <p className="text-sm font-semibold">Anda belum mengirimkan doa pada kampanye apapun.</p>
              <Link href="/kampanye">
                <Button size="sm">Berdonasi & Kirim Doa</Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal Dialog */}
      <Dialog open={!!editingPrayer} onOpenChange={(open) => !open && setEditingPrayer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Pesan Doa Anda</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-xs text-muted-foreground">
              Perubahan pesan doa akan langsung diperbarui pada halaman rincian kampanye publik.
            </p>
            <Textarea
              rows={4}
              value={editMessage}
              onChange={(e) => setEditMessage(e.target.value)}
              className="text-sm"
              placeholder="Tuliskan doa Anda..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPrayer(null)} disabled={isProcessing}>
              Batal
            </Button>
            <Button onClick={handleSaveEdit} disabled={isProcessing} className="font-semibold">
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
