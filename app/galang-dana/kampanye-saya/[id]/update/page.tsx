"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, UploadCloud, MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { DUMMY_CAMPAIGNS } from "@/lib/dummy-data";
import { toast } from "sonner";
import { createCampaignUpdateAction } from "@/app/actions/disbursement-and-updates";

export default function PostCampaignUpdatePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const campaign = DUMMY_CAMPAIGNS.find((c) => c.id === id) || DUMMY_CAMPAIGNS[0];

  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      toast.error("Harap isi judul dan konten kabar terbaru!");
      return;
    }
    setIsSending(true);
    try {
      const formData = new FormData();
      formData.append("campaign_id", campaign.id);
      formData.append("title", title);
      formData.append("content", content);

      const res = await createCampaignUpdateAction(formData);
      if (res.success) {
        toast.success(res.message);
        router.push(`/kampanye/${campaign.slug}`);
      } else {
        toast.error(res.error || "Gagal mempublikasikan kabar");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan sistem");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-2">
      <Link
        href="/galang-dana/kampanye-saya"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Kampanye Saya
      </Link>

      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
          Kirim Kabar Terbaru untuk Donatur
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Kampanye: <strong>{campaign.title}</strong>
        </p>
      </div>

      <Card className="p-6 sm:p-8 space-y-6 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Judul Kabar Perkembangan <span className="text-red-500">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Operasi Tahap Pertama Berjalan Sukses, Pasien Mulai Membaik"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Rincian Kabar & Pesan Donatur <span className="text-red-500">*</span>
            </label>
            <Textarea
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ceritakan kondisi terkini penerima manfaat, tindakan medis yang baru dilakukan, atau ucapan terima kasih kepada para Sahabat Umat..."
              required
            />
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-foreground">
              Foto Dokumentasi Pendukung (Opsional)
            </label>
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center bg-slate-50 cursor-pointer hover:border-primary">
              <UploadCloud className="h-8 w-8 mx-auto text-slate-400" />
              <p className="text-xs font-medium text-foreground mt-2">
                Klik untuk mengunggah foto progres medis/lapangan
              </p>
              <p className="text-[11px] text-muted-foreground">Format JPG atau PNG (maks 5MB)</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-800 leading-relaxed">
            Update kabar ini akan otomatis dikirimkan via WhatsApp Gateway ke <strong>{campaign.donorCount} donatur</strong> yang telah berdonasi pada kampanye ini.
          </div>

          <Button type="submit" size="lg" disabled={isSending} className="w-full font-bold gap-2">
            <Send className="h-4 w-4" />
            {isSending ? "Mempublikasikan Kabar..." : "Publikasikan Kabar Sekarang"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
