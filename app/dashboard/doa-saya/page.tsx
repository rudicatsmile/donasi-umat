"use client";

import * as React from "react";
import Link from "next/link";
import { Heart, Edit3, Trash2, Clock, MessageSquare, CheckCircle2 } from "lucide-react";
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

interface MyPrayer {
  id: string;
  campaignTitle: string;
  campaignSlug: string;
  message: string;
  createdAt: string;
  isEditable: boolean;
  likes: number;
}

const INITIAL_PRAYERS: MyPrayer[] = [
  {
    id: "mp-1",
    campaignTitle: "Bantu Pengobatan Bu Siti, Janda Tunanetra di Bandung Berjuang Melawan Tumor",
    campaignSlug: "bantu-pengobatan-bu-siti-bandung",
    message: "Semoga lekas sembuh ya Bu Siti, Allah angkat penyakitnya dan beri keberkahan selalu. Aamiin ya Rabbal Alamin.",
    createdAt: "2026-09-23T14:20:00Z",
    isEditable: true, // within 24 hours
    likes: 12,
  },
  {
    id: "mp-2",
    campaignTitle: "Renovasi Ruang Kelas SDN 004 Pulau Tidung Kepulauan Seribu",
    campaignSlug: "renovasi-ruang-kelas-sdn-004-pulau-tidung",
    message: "Semangat belajar untuk adik-adik di Pulau Tidung, raih cita-cita setinggi langit!",
    createdAt: "2026-09-10T10:00:00Z",
    isEditable: false, // past 24 hours
    likes: 7,
  },
];

export default function MyPrayersPage() {
  const [prayers, setPrayers] = React.useState<MyPrayer[]>(INITIAL_PRAYERS);
  const [editingPrayer, setEditingPrayer] = React.useState<MyPrayer | null>(null);
  const [editMessage, setEditMessage] = React.useState("");

  const handleOpenEdit = (prayer: MyPrayer) => {
    setEditingPrayer(prayer);
    setEditMessage(prayer.message);
  };

  const handleSaveEdit = () => {
    if (!editingPrayer) return;
    setPrayers((prev) =>
      prev.map((p) =>
        p.id === editingPrayer.id ? { ...p, message: editMessage } : p
      )
    );
    setEditingPrayer(null);
    toast.success("Doa berhasil diperbarui!");
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus doa ini?")) {
      setPrayers((prev) => prev.filter((p) => p.id !== id));
      toast.success("Doa berhasil dihapus.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
          Doa & Pesan Kebaikan Saya
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Kumpulan untaian doa tulus yang telah Anda sematkan pada kampanye yang Anda dukung.
        </p>
      </div>

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
                {prayer.isEditable ? (
                  <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50 border-emerald-200">
                    Bisa Diedit (&lt;24 Jam)
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] text-slate-400">
                    Terkunci
                  </Badge>
                )}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 italic bg-slate-50 p-4 rounded-xl border border-slate-200/80 leading-relaxed">
              &ldquo;{prayer.message}&rdquo;
            </p>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                <span>{prayer.likes} Sahabat Mengaminkan</span>
              </div>

              {prayer.isEditable && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(prayer)}
                    className="gap-1 text-xs"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Ubah
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(prayer.id)}
                    className="gap-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Hapus
                  </Button>
                </div>
              )}
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

      {/* Edit Modal Dialog */}
      <Dialog open={!!editingPrayer} onOpenChange={(open) => !open && setEditingPrayer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Pesan Doa Anda</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-xs text-muted-foreground">
              Anda dapat mengedit isi doa ini dalam jangka waktu 24 jam pertama sejak donasi dikirimkan.
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
            <Button variant="outline" onClick={() => setEditingPrayer(null)}>
              Batal
            </Button>
            <Button onClick={handleSaveEdit} className="font-semibold">
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
