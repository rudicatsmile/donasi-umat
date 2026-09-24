"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Check,
  UploadCloud,
  FileCheck,
  ShieldCheck,
  Clock,
  Heart,
  AlertCircle,
  HelpCircle,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DUMMY_CAMPAIGNS,
  OFFICIAL_BANK_ACCOUNTS,
  Campaign,
} from "@/lib/dummy-data";
import { formatRupiah } from "@/lib/utils";
import { toast } from "sonner";
import { createDonationAction, uploadPaymentProofAction } from "@/app/actions/donations";

const QUICK_AMOUNTS = [
  10000, 25000, 50000, 100000, 250000, 500000, 1000000
];

export default function DonationFormPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const campaign = DUMMY_CAMPAIGNS.find((c) => c.slug === slug) || DUMMY_CAMPAIGNS[0];

  // Steps: 1: Nominal & Data -> 2: Instruksi Transfer & Upload -> 3: Sukses Terkirim
  const [currentStep, setCurrentStep] = React.useState<1 | 2 | 3>(1);

  // Form states
  const [amount, setAmount] = React.useState<number>(100000);
  const [customAmount, setCustomAmount] = React.useState<string>("100000");
  const [selectedBank, setSelectedBank] = React.useState(OFFICIAL_BANK_ACCOUNTS[0]);
  const [donorName, setDonorName] = React.useState("Dimas Nugraha");
  const [donorPhone, setDonorPhone] = React.useState("+6281234567890");
  const [prayerMessage, setPrayerMessage] = React.useState("");
  const [isAnonymous, setIsAnonymous] = React.useState(false);
  const [isAmountHidden, setIsAmountHidden] = React.useState(false);

  // Server response states
  const [donationId, setDonationId] = React.useState<string>("");
  const [uniqueCode, setUniqueCode] = React.useState<number>(() => Math.floor(100 + Math.random() * 899));
  const [totalTransfer, setTotalTransfer] = React.useState<number>(100000 + uniqueCode);

  // File upload preview
  const [proofFile, setProofFile] = React.useState<File | null>(null);
  const [proofPreview, setProofPreview] = React.useState<string | null>(null);
  const [copiedBank, setCopiedBank] = React.useState(false);
  const [copiedAmount, setCopiedAmount] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSelectQuickAmount = (val: number) => {
    setAmount(val);
    setCustomAmount(val.toString());
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "");
    setCustomAmount(rawVal);
    setAmount(Number(rawVal) || 0);
  };

  const handleCopy = (text: string, type: "bank" | "amount") => {
    navigator.clipboard.writeText(text);
    if (type === "bank") {
      setCopiedBank(true);
      toast.success("Nomor rekening berhasil disalin!");
      setTimeout(() => setCopiedBank(false), 2000);
    } else {
      setCopiedAmount(true);
      toast.success("Nominal transfer tepat berhasil disalin!");
      setTimeout(() => setCopiedAmount(false), 2000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 5MB!");
        return;
      }
      setProofFile(file);
      setProofPreview(URL.createObjectURL(file));
      toast.success("Bukti transfer berhasil dipilih!");
    }
  };

  const handleProceedToStep2 = async () => {
    if (amount < 10000) {
      toast.error("Nominal donasi minimal Rp 10.000");
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("campaign_id", campaign.id);
      formData.append("amount", amount.toString());
      formData.append("bank_destination", selectedBank.bankName);
      formData.append("is_anonymous", isAnonymous ? "true" : "false");
      formData.append("is_amount_hidden", isAmountHidden ? "true" : "false");
      if (prayerMessage) formData.append("prayer_message", prayerMessage);
      if (donorName) formData.append("donor_name", donorName);
      if (donorPhone) formData.append("donor_phone", donorPhone);

      const res = await createDonationAction(formData);
      if (res.success) {
        if (res.donationId) setDonationId(res.donationId);
        if (res.uniqueCode) setUniqueCode(res.uniqueCode);
        if (res.totalTransfer) setTotalTransfer(res.totalTransfer);
        setCurrentStep(2);
        toast.success("Instruksi transfer berhasil dibuat!");
      } else {
        toast.error(res.error || "Gagal membuat instruksi donasi");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitProof = async () => {
    if (!proofFile && !proofPreview) {
      toast.error("Silakan unggah foto bukti transfer terlebih dahulu!");
      return;
    }
    setIsSubmitting(true);
    try {
      const targetId = donationId || `don-${Date.now()}`;
      const targetUrl = proofPreview || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800";
      const res = await uploadPaymentProofAction(targetId, targetUrl);

      if (res.success) {
        setCurrentStep(3);
        toast.success(res.message || "Bukti transfer berhasil diunggah!");
      } else {
        toast.error(res.error || "Gagal mengunggah bukti");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan pengunggahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-8 lg:py-14 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Back Button */}
        <Link
          href={`/kampanye/${campaign.slug}`}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Detail Kampanye
        </Link>

        {/* Stepper Header */}
        <div className="mb-6 text-center space-y-2">
          <Badge variant="outline" className="border-primary/40 text-primary bg-primary/5">
            Metode Transfer Manual Resmi
          </Badge>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
            Formulir Donasi
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
            Untuk: <strong>{campaign.title}</strong>
          </p>
        </div>

        {/* Wizard Steps Indicator */}
        <div className="flex items-center justify-between mb-8 max-w-sm mx-auto text-xs font-semibold">
          <div className={`flex items-center gap-1.5 ${currentStep >= 1 ? "text-primary font-bold" : "text-slate-400"}`}>
            <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${currentStep >= 1 ? "bg-primary text-white" : "bg-slate-200"}`}>
              1
            </span>
            Nominal
          </div>
          <div className={`h-0.5 w-12 ${currentStep >= 2 ? "bg-primary" : "bg-slate-200"}`} />
          <div className={`flex items-center gap-1.5 ${currentStep >= 2 ? "text-primary font-bold" : "text-slate-400"}`}>
            <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${currentStep >= 2 ? "bg-primary text-white" : "bg-slate-200"}`}>
              2
            </span>
            Transfer & Bukti
          </div>
          <div className={`h-0.5 w-12 ${currentStep >= 3 ? "bg-primary" : "bg-slate-200"}`} />
          <div className={`flex items-center gap-1.5 ${currentStep === 3 ? "text-primary font-bold" : "text-slate-400"}`}>
            <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${currentStep === 3 ? "bg-primary text-white" : "bg-slate-200"}`}>
              3
            </span>
            Selesai
          </div>
        </div>

        {/* STEP 1: Nominal & Data Donatur */}
        {currentStep === 1 && (
          <Card className="p-6 space-y-6 shadow-sm">
            {/* Quick nominal buttons */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Pilih Nominal Donasi
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {QUICK_AMOUNTS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleSelectQuickAmount(val)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-heading font-bold transition-all tabular-nums ${
                      amount === val
                        ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary"
                        : "border-border bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {formatRupiah(val)}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom nominal input */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600">
                Atau Masukkan Nominal Lainnya (Min. Rp 10.000)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-sm font-bold text-muted-foreground">Rp</span>
                <Input
                  type="text"
                  value={customAmount ? Number(customAmount).toLocaleString("id-ID") : ""}
                  onChange={handleCustomAmountChange}
                  className="pl-11 font-heading font-extrabold text-base tabular-nums"
                  placeholder="100.000"
                />
              </div>
            </div>

            {/* Bank destination select */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Pilih Rekening Bank Tujuan
              </label>
              <div className="space-y-2">
                {OFFICIAL_BANK_ACCOUNTS.map((bank) => (
                  <label
                    key={bank.bankName}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedBank.bankName === bank.bankName
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="bank"
                        checked={selectedBank.bankName === bank.bankName}
                        onChange={() => setSelectedBank(bank)}
                        className="text-primary focus:ring-primary h-4 w-4"
                      />
                      <div>
                        <p className="font-heading font-bold text-sm text-foreground">{bank.bankName}</p>
                        <p className="text-xs text-muted-foreground">a.n {bank.accountHolder}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {bank.badge}
                    </Badge>
                  </label>
                ))}
              </div>
            </div>

            {/* Prayer & Options */}
            <div className="space-y-4 pt-2 border-t border-border">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>Tulis Doa & Dukungan (Opsional)</span>
                  <span className="text-[11px] font-normal text-slate-400">Maks. 500 karakter</span>
                </label>
                <Textarea
                  value={prayerMessage}
                  onChange={(e) => setPrayerMessage(e.target.value.slice(0, 500))}
                  placeholder="Contoh: Semoga lekas sembuh, diberi kekuatan dan keberkahan selalu untuk keluarga. Aamiin..."
                  className="text-xs sm:text-sm h-24"
                />
              </div>

              <div className="space-y-2.5 pt-1">
                <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded text-primary focus:ring-primary h-4 w-4"
                  />
                  <span>Sembunyikan nama saya (Tampil sebagai <strong>&ldquo;Hamba Allah&rdquo;</strong>)</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAmountHidden}
                    onChange={(e) => setIsAmountHidden(e.target.checked)}
                    className="rounded text-primary focus:ring-primary h-4 w-4"
                  />
                  <span>Sembunyikan nominal donasi pada daftar publik</span>
                </label>
              </div>
            </div>

            <Button
              type="button"
              size="lg"
              disabled={amount < 10000 || isSubmitting}
              onClick={handleProceedToStep2}
              className="w-full font-bold shadow-md shadow-primary/20"
            >
              {isSubmitting ? "Memproses Data..." : "Lanjutkan ke Instruksi Transfer"}
            </Button>
          </Card>
        )}

        {/* STEP 2: Instruksi Transfer & Upload Bukti */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Notice Kode Unik */}
            <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/80 p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                PENTING: Transfer Tepat Hingga 3 Digit Terakhir!
              </div>
              <p className="text-xs text-amber-900/80 leading-relaxed">
                Nomor unik <strong>{uniqueCode}</strong> otomatis dialokasikan ke donasi Anda untuk membedakan transaksi di rekening mutasi bank dan mempercepat verifikasi admin.
              </p>
            </div>

            {/* Total Yang Harus Ditransfer */}
            <Card className="p-6 text-center space-y-4 shadow-sm border-primary/20 bg-white">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Jumlah Yang Harus Ditransfer
              </p>
              <div className="flex items-center justify-center gap-3">
                <span className="font-heading font-black text-3xl sm:text-4xl text-primary tabular-nums tracking-tight">
                  {formatRupiah(totalTransfer)}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(totalTransfer.toString(), "amount")}
                  className="gap-1 text-xs"
                >
                  {copiedAmount ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  Salin
                </Button>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex justify-between max-w-sm mx-auto">
                <span>Nominal Donasi:</span>
                <span className="font-semibold">{formatRupiah(amount)}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex justify-between max-w-sm mx-auto -mt-2">
                <span>Kode Unik Verifikasi:</span>
                <span className="font-bold text-amber-600">+{uniqueCode}</span>
              </div>

              {/* Bank Account Info */}
              <div className="pt-4 border-t border-border space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Transfer ke Rekening Tujuan:
                </p>
                <div className="rounded-xl border border-border p-4 bg-slate-50 flex items-center justify-between">
                  <div className="text-left">
                    <p className="font-heading font-bold text-base text-foreground">
                      {selectedBank.bankName}
                    </p>
                    <p className="font-mono text-lg font-extrabold text-slate-800 tracking-wider">
                      {selectedBank.accountNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">a.n {selectedBank.accountHolder}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(selectedBank.accountNumber, "bank")}
                    className="gap-1 text-xs"
                  >
                    {copiedBank ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    Salin No. Rek
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground pt-1">
                <Clock className="h-3.5 w-3.5 text-amber-600" />
                <span>Batas waktu transfer: <strong>24 jam</strong> dari sekarang</span>
              </div>
            </Card>

            {/* Upload Bukti Transfer Box */}
            <Card className="p-6 space-y-4 shadow-sm">
              <div className="space-y-1">
                <h3 className="font-heading font-bold text-base text-foreground">
                  Unggah Bukti Transfer
                </h3>
                <p className="text-xs text-muted-foreground">
                  Foto struk ATM, screenshot m-banking, atau slip setoran (JPG, PNG, atau PDF maks 5MB).
                </p>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-border hover:border-primary rounded-2xl p-6 text-center transition-colors bg-slate-50/50">
                {proofPreview ? (
                  <div className="space-y-3">
                    <img
                      src={proofPreview}
                      alt="Pratinjau Bukti Transfer"
                      className="mx-auto max-h-56 rounded-xl border border-border object-contain shadow-xs"
                    />
                    <p className="text-xs text-emerald-700 font-semibold flex items-center justify-center gap-1">
                      <FileCheck className="h-4 w-4" />
                      Bukti transfer siap dikirim: {proofFile?.name}
                    </p>
                    <label className="cursor-pointer inline-block text-xs text-primary underline font-medium">
                      Ganti Foto Bukti
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,application/pdf"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                ) : (
                  <label className="cursor-pointer block space-y-3">
                    <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-primary">
                      <UploadCloud className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Klik untuk memilih foto bukti transfer
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Format file JPG, PNG, atau PDF (maks. 5MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,application/pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="w-1/3"
                >
                  Ubah Nominal
                </Button>
                <Button
                  type="button"
                  size="lg"
                  disabled={!proofFile || isSubmitting}
                  onClick={handleSubmitProof}
                  className="w-2/3 font-bold shadow-md shadow-primary/20"
                >
                  {isSubmitting ? "Mengunggah..." : "Kirim Bukti Transfer"}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* STEP 3: Konfirmasi Sukses Terkirim */}
        {currentStep === 3 && (
          <Card className="p-8 text-center space-y-6 shadow-md border-emerald-200 bg-white">
            <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 ring-8 ring-emerald-50">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div className="space-y-2">
              <Badge variant="success" className="text-xs">
                Status: Menunggu Verifikasi Admin
              </Badge>
              <h2 className="font-heading text-2xl font-black text-foreground">
                Jazakallahu Khairan!
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Terima kasih, Sahabat Umat. Bukti transfer Anda sebesar <strong>{formatRupiah(totalTransfer)}</strong> telah kami terima.
              </p>
            </div>

            {/* Transaction summary card */}
            <div className="rounded-xl border border-border bg-slate-50 p-4 text-xs text-left space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kode Transaksi:</span>
                <span className="font-mono font-bold text-foreground">DON-2024-0925</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bank Tujuan:</span>
                <span className="font-semibold text-foreground">{selectedBank.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nama Donatur:</span>
                <span className="font-semibold text-foreground">{isAnonymous ? "Hamba Allah" : donorName}</span>
              </div>
              <div className="flex justify-between border-t border-border/80 pt-2">
                <span className="text-muted-foreground">Status Verifikasi:</span>
                <span className="font-bold text-amber-700">Maksimal 1x24 Jam</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Notifikasi status donasi akan dikirimkan otomatis ke WhatsApp Anda. Anda juga dapat memantau kuitansi di Dasbor Donatur.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2 max-w-md mx-auto">
              <Link href="/dashboard/riwayat-donasi" className="w-full">
                <Button className="w-full font-bold">
                  Lihat Riwayat Donasi
                </Button>
              </Link>
              <Link href="/kampanye" className="w-full">
                <Button variant="outline" className="w-full">
                  Kembali Berdonasi
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
