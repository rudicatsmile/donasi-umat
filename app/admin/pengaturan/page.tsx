"use client";

import * as React from "react";
import { Settings, Save, Building, MessageSquare, ShieldCheck, Key, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  getPlatformSettingsAction,
  updatePlatformSettingsAction,
} from "@/app/actions/profile-and-category";

export default function AdminSettingsPage() {
  const [bankName, setBankName] = React.useState("BCA");
  const [bankAccountNumber, setBankAccountNumber] = React.useState("1234567890");
  const [bankAccountHolder, setBankAccountHolder] = React.useState("Yayasan DonasiUmat Indonesia");
  const [waVerificationTemplate, setWaVerificationTemplate] = React.useState("");
  const [waUpdateTemplate, setWaUpdateTemplate] = React.useState("");

  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  const loadSettings = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getPlatformSettingsAction();
      if (res.success && res.settings) {
        setBankName(res.settings.bankName);
        setBankAccountNumber(res.settings.bankAccountNumber);
        setBankAccountHolder(res.settings.bankAccountHolder);
        setWaVerificationTemplate(res.settings.waVerificationTemplate);
        setWaUpdateTemplate(res.settings.waUpdateTemplate);
      } else {
        toast.error(res.error || "Gagal memuat pengaturan platform");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal menghubungi database");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await updatePlatformSettingsAction({
        bankName,
        bankAccountNumber,
        bankAccountHolder,
        waVerificationTemplate,
        waUpdateTemplate,
      });

      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.error || "Gagal menyimpan pengaturan platform");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan sistem");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
            Pengaturan Sistem Platform
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Konfigurasi rekening resmi transfer manual dan template pesan WhatsApp Gateway.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadSettings}
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
          <p className="text-xs text-muted-foreground">Memuat konfigurasi dari tabel platform_settings...</p>
        </Card>
      ) : (
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
                  placeholder="Contoh: BCA"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Nomor Rekening</label>
                <Input
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  placeholder="Contoh: 1234567890"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Atas Nama Rekening</label>
                <Input
                  value={bankAccountHolder}
                  onChange={(e) => setBankAccountHolder(e.target.value)}
                  placeholder="Contoh: Yayasan DonasiUmat Indonesia"
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
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Variabel dinamis: <code>{"{{amount}}"}</code>, <code>{"{{campaign_title}}"}</code>, <code>{"{{donor_name}}"}</code>
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Template: Kabar Perkembangan Kampanye (<code>campaign_update_posted</code>)
                </label>
                <Textarea
                  rows={3}
                  value={waUpdateTemplate}
                  onChange={(e) => setWaUpdateTemplate(e.target.value)}
                  className="text-xs font-mono"
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Variabel dinamis: <code>{"{{campaign_title}}"}</code>, <code>{"{{update_title}}"}</code>
                </p>
              </div>
            </div>
          </Card>

          {/* Security Notice */}
          <Card className="p-5 border-emerald-200 bg-emerald-50/50 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1 text-emerald-950">
              <p className="font-bold">Keamanan Konfigurasi Terenkripsi</p>
              <p className="text-emerald-800/90 leading-relaxed">
                Setiap perubahan pada konfigurasi sistem disimpan dalam tabel <code>platform_settings</code> dan dicatat ke dalam audit log kekal untuk kepatuhan tata kelola.
              </p>
            </div>
          </Card>

          <Button type="submit" disabled={isSaving} className="gap-2 font-bold shadow-md">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? "Menyimpan ke Database..." : "Simpan Pengaturan Platform"}
          </Button>
        </form>
      )}
    </div>
  );
}
