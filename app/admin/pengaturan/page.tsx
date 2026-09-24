"use client";

import * as React from "react";
import { Settings, Save, Building, MessageSquare, ShieldCheck, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [bankName, setBankName] = React.useState("BCA");
  const [bankAccountNumber, setBankAccountNumber] = React.useState("1234567890");
  const [bankAccountHolder, setBankAccountHolder] = React.useState("Yayasan DonasiUmat Indonesia");
  const [waVerificationTemplate, setWaVerificationTemplate] = React.useState(
    "Halo Sahabat Umat, donasi Anda sebesar {{amount}} untuk kampanye {{campaign_title}} telah diverifikasi. Terima kasih atas kebaikannya. — DonasiUmat"
  );
  const [waUpdateTemplate, setWaUpdateTemplate] = React.useState(
    "Sahabat Umat, penggalang kampanye {{campaign_title}} yang Anda dukung baru saja mengunggah kabar perkembangan terbaru: {{update_title}}. Cek selengkapnya di aplikasi DonasiUmat."
  );
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Pengaturan platform berhasil disimpan!");
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
          Pengaturan Sistem Platform
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Konfigurasi rekening resmi transfer manual, kode unik, dan template pesan WhatsApp Gateway.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Rekening Default */}
        <Card className="p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Building className="h-5 w-5 text-emerald-600" />
            <h3 className="font-heading font-bold text-lg text-foreground">
              Rekening Resmi Yayasan (Tujuan Transfer Donatur)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Nama Bank Utama</label>
              <Input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Nomor Rekening</label>
              <Input
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Atas Nama Rekening</label>
              <Input
                value={bankAccountHolder}
                onChange={(e) => setBankAccountHolder(e.target.value)}
                required
              />
            </div>
          </div>
        </Card>

        {/* WhatsApp Gateway Templates */}
        <Card className="p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <MessageSquare className="h-5 w-5 text-sky-600" />
            <h3 className="font-heading font-bold text-lg text-foreground">
              Template Notifikasi WhatsApp Gateway (Fonnte/Wablas)
            </h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Template: Donasi Terverifikasi (<code>donation_verified</code>)
              </label>
              <Textarea
                rows={3}
                value={waVerificationTemplate}
                onChange={(e) => setWaVerificationTemplate(e.target.value)}
                className="text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Template: Kabar Terbaru Kampanye (<code>campaign_update_posted</code>)
              </label>
              <Textarea
                rows={3}
                value={waUpdateTemplate}
                onChange={(e) => setWaUpdateTemplate(e.target.value)}
                className="text-xs font-mono"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isSaving} className="gap-2 font-bold shadow-sm">
            <Save className="h-4 w-4" />
            {isSaving ? "Menyimpan..." : "Simpan Seluruh Pengaturan"}
          </Button>
        </div>
      </form>
    </div>
  );
}
