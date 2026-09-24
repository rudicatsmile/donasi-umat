"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Building, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { DUMMY_CAMPAIGNS, DUMMY_CATEGORIES } from "@/lib/dummy-data";
import { toast } from "sonner";

export default function EditCampaignPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const campaign = DUMMY_CAMPAIGNS.find((c) => c.id === id) || DUMMY_CAMPAIGNS[0];

  const [title, setTitle] = React.useState(campaign.title);
  const [categoryId, setCategoryId] = React.useState(campaign.categoryId);
  const [location, setLocation] = React.useState(campaign.beneficiaryLocation);
  const [story, setStory] = React.useState(campaign.story);
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Perubahan kampanye berhasil disimpan!");
      router.push("/galang-dana/kampanye-saya");
    }, 800);
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
          Edit Informasi Kampanye
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Ubah judul, narasi cerita, atau lokasi penerima manfaat.
        </p>
      </div>

      <Card className="p-6 sm:p-8 space-y-6 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Judul Kampanye</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Kategori</label>
              <select
                aria-label="Kategori Kampanye"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-11 rounded-lg border border-border bg-white px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
              >
                {DUMMY_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Lokasi Penerima Manfaat</label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Cerita Lengkap</label>
            <Textarea
              rows={8}
              value={story}
              onChange={(e) => setStory(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Link href="/galang-dana/kampanye-saya">
              <Button type="button" variant="outline">Batal</Button>
            </Link>
            <Button type="submit" disabled={isSaving} className="gap-2 font-bold">
              <Save className="h-4 w-4" />
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
