"use client";

import * as React from "react";
import { 
  Calculator, 
  Coins, 
  Briefcase, 
  Award, 
  ShieldCheck, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  Sparkles,
  HeartHandshake,
  QrCode,
  Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { submitZakatPaymentAction } from "@/app/actions/zakat";
import { ZAKAT_CONSTANTS } from "@/lib/zakat-constants";
import { formatRupiah } from "@/lib/utils";
import Link from "next/link";

export default function ZakatCalculatorPage() {
  const [activeTab, setActiveTab] = React.useState<"penghasilan" | "maal" | "emas">("penghasilan");

  // Zakat Penghasilan State
  const [monthlySalary, setMonthlySalary] = React.useState<number>(12000000);
  const [otherIncome, setOtherIncome] = React.useState<number>(1000000);
  const [monthlyExpense, setMonthlyExpense] = React.useState<number>(3000000);

  // Zakat Maal State
  const [savingsAmount, setSavingsAmount] = React.useState<number>(130000000);
  const [investmentsAmount, setInvestmentsAmount] = React.useState<number>(20000000);
  const [debtsAmount, setDebtsAmount] = React.useState<number>(10000000);

  // Zakat Emas State
  const [goldWeightGrams, setGoldWeightGrams] = React.useState<number>(90);

  // Form Muzakki State
  const [muzakkiName, setMuzakkiName] = React.useState<string>("");
  const [muzakkiPhone, setMuzakkiPhone] = React.useState<string>("");
  const [muzakkiEmail, setMuzakkiEmail] = React.useState<string>("");
  const [selectedBank, setSelectedBank] = React.useState<string>("BSI");
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [paymentResult, setPaymentResult] = React.useState<any>(null);

  // Calculation Logic
  // 1. Penghasilan
  const netMonthlyIncome = Math.max(0, monthlySalary + otherIncome - monthlyExpense);
  const isPenghasilanWajib = netMonthlyIncome >= ZAKAT_CONSTANTS.NISAB_PROFIT_MONTHLY;
  const zakatPenghasilanDue = isPenghasilanWajib ? Math.round(netMonthlyIncome * ZAKAT_CONSTANTS.ZAKAT_RATE) : 0;

  // 2. Maal
  const netMaalAssets = Math.max(0, savingsAmount + investmentsAmount - debtsAmount);
  const isMaalWajib = netMaalAssets >= ZAKAT_CONSTANTS.NISAB_MAAL_YEARLY;
  const zakatMaalDue = isMaalWajib ? Math.round(netMaalAssets * ZAKAT_CONSTANTS.ZAKAT_RATE) : 0;

  // 3. Emas
  const goldValue = goldWeightGrams * ZAKAT_CONSTANTS.GOLD_PRICE_PER_GRAM;
  const isEmasWajib = goldWeightGrams >= ZAKAT_CONSTANTS.NISAB_GOLD_GRAMS;
  const zakatEmasDue = isEmasWajib ? Math.round(goldValue * ZAKAT_CONSTANTS.ZAKAT_RATE) : 0;

  // Current Active Calculations
  const currentGross = activeTab === "penghasilan" ? netMonthlyIncome : activeTab === "maal" ? netMaalAssets : goldValue;
  const isCurrentWajib = activeTab === "penghasilan" ? isPenghasilanWajib : activeTab === "maal" ? isMaalWajib : isEmasWajib;
  const currentZakatDue = activeTab === "penghasilan" ? zakatPenghasilanDue : activeTab === "maal" ? zakatMaalDue : zakatEmasDue;
  const currentNisab = activeTab === "penghasilan" ? ZAKAT_CONSTANTS.NISAB_PROFIT_MONTHLY : ZAKAT_CONSTANTS.NISAB_MAAL_YEARLY;

  const handlePayZakat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!muzakkiName || !muzakkiPhone) {
      toast.error("Nama lengkap dan nomor WhatsApp aktif wajib diisi.");
      return;
    }

    if (currentZakatDue <= 0) {
      toast.error("Nominal zakat belum mencapai nisab. Anda disarankan menunaikan infaq/sedekah.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("zakat_type", activeTab);
    formData.append("gross_amount", currentGross.toString());
    formData.append("zakat_due_amount", currentZakatDue.toString());
    formData.append("muzakki_name", muzakkiName);
    formData.append("muzakki_phone", muzakkiPhone);
    formData.append("muzakki_email", muzakkiEmail || "");
    formData.append("bank_destination", selectedBank);

    const res = await submitZakatPaymentAction(formData);
    setIsSubmitting(false);

    if (res.success) {
      setPaymentResult(res);
      toast.success("Instruksi penunaian zakat berhasil diterbitkan!");
    } else {
      toast.error(res.error || "Gagal memproses penunaian zakat.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container max-w-6xl mx-auto px-4 space-y-10">
        
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="outline" className="px-3 py-1 border-emerald-500/30 text-emerald-700 bg-emerald-50 gap-1.5 font-medium">
            <Calculator className="h-3.5 w-3.5 text-emerald-600" />
            Standar Nisab BAZNAS 2026 (Emas Rp 1.400.000/gr)
          </Badge>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Kalkulator Zakat Terpadu & Penyaluran Mustahik
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Hitung kewajiban zakat penghasilan, maal, dan emas Anda dengan akurat. Tunaikan langsung ke kampanye asnaf fakir-miskin terverifikasi dan dapatkan **Bukti Setor Zakat (BSZ)** resmi.
          </p>
        </div>

        {paymentResult ? (
          /* Payment Instruction Modal/Card */
          <Card className="max-w-2xl mx-auto p-6 sm:p-8 bg-white border-emerald-200 shadow-xl space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex h-14 w-14 rounded-full bg-emerald-100 text-emerald-700 items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-foreground">
                Instruksi Penunaian Zakat
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Nomor Registrasi BSZ: <span className="font-mono font-bold text-emerald-700">{paymentResult.bszNumber}</span>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center space-y-1">
              <span className="text-xs text-amber-800 font-medium">Total Transfer Tepat (Termasuk Kode Unik):</span>
              <div className="text-2xl sm:text-3xl font-extrabold font-heading text-amber-900 tracking-tight">
                {formatRupiah(paymentResult.totalTransfer)}
              </div>
              <p className="text-[11px] text-amber-700">
                (Nominal zakat: {formatRupiah(paymentResult.zakatDueAmount)} + Kode Unik: <b>{paymentResult.uniqueCode}</b>)
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Bank Tujuan:</span>
                <span className="font-bold text-foreground">{paymentResult.bankDestination} (Bank Syariah Indonesia)</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Nomor Rekening Khusus Zakat:</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">7189 0123 45</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Atas Nama:</span>
                <span className="font-semibold text-foreground">Yayasan DonasiUmat Indonesia</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button asChild className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11">
                <Link href={`/zakat/sertifikat/${paymentResult.bszNumber}`}>
                  Lihat Sertifikat BSZ Digital
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Link>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setPaymentResult(null)} 
                className="h-11"
              >
                Hitung Zakat Lainnya
              </Button>
            </div>
          </Card>
        ) : (
          /* Main Calculator Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Calculator Tabs */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="p-6 sm:p-8 bg-white shadow-sm border-slate-200">
                <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="space-y-6">
                  <TabsList className="grid grid-cols-3 h-12 bg-slate-100 p-1 rounded-xl">
                    <TabsTrigger value="penghasilan" className="rounded-lg text-xs sm:text-sm font-semibold gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-xs">
                      <Briefcase className="h-4 w-4 text-emerald-600" />
                      Penghasilan
                    </TabsTrigger>
                    <TabsTrigger value="maal" className="rounded-lg text-xs sm:text-sm font-semibold gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-xs">
                      <Coins className="h-4 w-4 text-sky-600" />
                      Zakat Maal
                    </TabsTrigger>
                    <TabsTrigger value="emas" className="rounded-lg text-xs sm:text-sm font-semibold gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-xs">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      Zakat Emas
                    </TabsTrigger>
                  </TabsList>

                  {/* Tab 1: Penghasilan */}
                  <TabsContent value="penghasilan" className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Gaji Pokok / Penghasilan Bulanan (Rp)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="100000"
                        value={monthlySalary}
                        onChange={(e) => setMonthlySalary(Number(e.target.value))}
                        className="h-11 font-mono font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Penghasilan Lainnya / Tunjangan / Bonus (Rp)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="100000"
                        value={otherIncome}
                        onChange={(e) => setOtherIncome(Number(e.target.value))}
                        className="h-11 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Pengeluaran Pokok Bulanan / Cicilan Mendesak (Rp)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="100000"
                        value={monthlyExpense}
                        onChange={(e) => setMonthlyExpense(Number(e.target.value))}
                        className="h-11 font-mono"
                      />
                      <p className="text-[11px] text-muted-foreground mt-1">
                        *Pengeluaran sandang, pangan, papan primer keluarga serta hutang jatuh tempo.
                      </p>
                    </div>
                  </TabsContent>

                  {/* Tab 2: Maal */}
                  <TabsContent value="maal" className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Total Saldo Tabungan / Giro / Deposito (Rp)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="500000"
                        value={savingsAmount}
                        onChange={(e) => setSavingsAmount(Number(e.target.value))}
                        className="h-11 font-mono font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Aset Lancar Lainnya / Saham / Piutang Tertagih (Rp)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="500000"
                        value={investmentsAmount}
                        onChange={(e) => setInvestmentsAmount(Number(e.target.value))}
                        className="h-11 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Hutang Jatuh Tempo Saat Haul (Rp)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="500000"
                        value={debtsAmount}
                        onChange={(e) => setDebtsAmount(Number(e.target.value))}
                        className="h-11 font-mono"
                      />
                      <p className="text-[11px] text-muted-foreground mt-1">
                        *Harta telah mengendap selama 1 tahun hijriyah (Haul) dan melebihi nisab 85 gr emas.
                      </p>
                    </div>
                  </TabsContent>

                  {/* Tab 3: Emas */}
                  <TabsContent value="emas" className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Total Berat Emas / Logam Mulia Tersimpan (Gram)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={goldWeightGrams}
                        onChange={(e) => setGoldWeightGrams(Number(e.target.value))}
                        className="h-11 font-mono font-semibold text-base"
                      />
                      <p className="text-[11px] text-muted-foreground mt-1">
                        *Nisab emas murni adalah 85 gram. Kurs emas acuan: Rp 1.400.000 / gram.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Niat Zakat Box */}
                <div className="mt-8 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                    <HeartHandshake className="h-4 w-4 text-emerald-600" />
                    Lafadz Niat Zakat {activeTab === "penghasilan" ? "Penghasilan / Maal" : activeTab === "maal" ? "Maal" : "Emas"}
                  </div>
                  <p className="font-serif text-right text-base text-slate-800 leading-loose pt-1">
                    نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ مَالِي فَرْضًا لِلَّهِ تَعَالَى
                  </p>
                  <p className="text-[11px] text-emerald-950 italic">
                    "Nawaitu an ukhrija zakaata maali fardhan lillaahi ta'aala."
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Artinya: "Saya berniat mengeluarkan zakat harta saya ini, fardhu karena Allah Ta'ala."
                  </p>
                </div>
              </Card>
            </div>

            {/* Right Column: Result Summary & Payment Form */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="p-6 sm:p-7 bg-white shadow-md border-emerald-100 space-y-6">
                <div>
                  <h3 className="font-heading text-lg font-bold text-foreground">
                    Ringkasan Perhitungan Zakat
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Berdasarkan kaidah fiqih & nisab resmi 85 gram emas.
                  </p>
                </div>

                {/* Status Banner */}
                <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                  isCurrentWajib 
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900" 
                    : "bg-slate-50 border-slate-200 text-slate-700"
                }`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                    isCurrentWajib ? "bg-emerald-200 text-emerald-800" : "bg-slate-200 text-slate-600"
                  }`}>
                    {isCurrentWajib ? <Award className="h-5 w-5" /> : <HelpCircle className="h-5 w-5" />}
                  </div>
                  <div className="text-xs space-y-1">
                    <span className="font-bold block text-sm">
                      {isCurrentWajib ? "Harta Telah Mencapai Nisab (Wajib Zakat)" : "Belum Mencapai Nisab (Tidak Wajib)"}
                    </span>
                    <p className="text-[11px] leading-relaxed">
                      {isCurrentWajib
                        ? `Alhamdulillah, harta Anda telah melebihi batas nisab (${formatRupiah(currentNisab)}). Kewajiban zakat adalah 2,5%.`
                        : `Harta bersih Anda (${formatRupiah(currentGross)}) belum mencapai nisab (${formatRupiah(currentNisab)}). Anda dianjurkan bersedekah sunnah.`
                      }
                    </p>
                  </div>
                </div>

                {/* Numeric Breakdown */}
                <div className="space-y-2.5 pt-1 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Nisab Acuan:</span>
                    <span className="font-mono font-semibold text-foreground">{formatRupiah(currentNisab)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Harta Bersih Kena Zakat:</span>
                    <span className="font-mono font-semibold text-foreground">{formatRupiah(currentGross)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Kadar Zakat:</span>
                    <span className="font-bold text-emerald-700">2.5%</span>
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                    <span className="font-bold text-sm text-foreground">Kewajiban Zakat:</span>
                    <span className="font-heading font-extrabold text-xl text-emerald-700">
                      {formatRupiah(currentZakatDue)}
                    </span>
                  </div>
                </div>

                {/* Payment Form */}
                <form onSubmit={handlePayZakat} className="space-y-4 pt-3 border-t border-slate-100">
                  <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                    Data Muzakki (Pembayar Zakat)
                  </h4>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Nama Lengkap Muzakki *
                    </label>
                    <Input
                      required
                      placeholder="Nama lengkap Anda"
                      value={muzakkiName}
                      onChange={(e) => setMuzakkiName(e.target.value)}
                      className="h-10 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Nomor WhatsApp (untuk Bukti Setor Zakat / BSZ) *
                    </label>
                    <Input
                      required
                      type="tel"
                      placeholder="081234567890"
                      value={muzakkiPhone}
                      onChange={(e) => setMuzakkiPhone(e.target.value)}
                      className="h-10 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Alamat Email (Opsional)
                    </label>
                    <Input
                      type="email"
                      placeholder="nama@email.com"
                      value={muzakkiEmail}
                      onChange={(e) => setMuzakkiEmail(e.target.value)}
                      className="h-10 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Pilihan Bank Transfer Yayasan
                    </label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full h-10 px-3 border rounded-md text-xs bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="BSI">BSI (Bank Syariah Indonesia) - Rekening Khusus Zakat</option>
                      <option value="BCA">BCA - Yayasan DonasiUmat</option>
                      <option value="Mandiri">Bank Mandiri - Yayasan DonasiUmat</option>
                    </select>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting || currentZakatDue <= 0}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 text-sm shadow-md"
                  >
                    {isSubmitting ? "Menerbitkan Tagihan BSZ..." : "Tunaikan Zakat Sekarang"}
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                  <p className="text-[11px] text-center text-muted-foreground flex items-center justify-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    Penyaluran resmi sesuai fatwa MUI kepada 8 golongan Asnaf.
                  </p>
                </form>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
