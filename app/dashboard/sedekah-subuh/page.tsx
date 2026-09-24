"use client";

import * as React from "react";
import { 
  Sunrise, 
  Wallet, 
  Calendar, 
  Coins, 
  CheckCircle2, 
  PlusCircle, 
  ArrowRight, 
  Clock, 
  Settings2,
  Sparkles,
  ShieldCheck,
  Power
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { formatRupiah, formatDateIndo } from "@/lib/utils";
import { 
  getPledgeAction, 
  savePledgeSettingsAction, 
  topupPledgeBalanceAction 
} from "@/app/actions/pledges";

export default function SedekahSubuhDashboardPage() {
  const [loading, setLoading] = React.useState(true);
  const [pledge, setPledge] = React.useState<any>(null);
  const [dailyAmount, setDailyAmount] = React.useState<number>(10000);
  const [preferredCategory, setPreferredCategory] = React.useState<string>("all");
  const [prayerMessage, setPrayerMessage] = React.useState<string>("");
  const [isActive, setIsActive] = React.useState<boolean>(true);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);

  // Topup State
  const [topupDialogOpen, setTopupDialogOpen] = React.useState<boolean>(false);
  const [topupAmount, setTopupAmount] = React.useState<number>(150000);
  const [isTopupLoading, setIsTopupLoading] = React.useState<boolean>(false);

  const fetchPledge = React.useCallback(async () => {
    setLoading(true);
    const res = await getPledgeAction();
    if (res.success && res.pledge) {
      setPledge(res.pledge);
      setDailyAmount(res.pledge.daily_amount || 10000);
      setPreferredCategory(res.pledge.preferred_category || "all");
      setPrayerMessage(res.pledge.prayer_message || "");
      setIsActive(res.pledge.is_active ?? true);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchPledge();
  }, [fetchPledge]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData();
    formData.append("daily_amount", dailyAmount.toString());
    formData.append("preferred_category", preferredCategory);
    formData.append("prayer_message", prayerMessage);
    formData.append("is_active", isActive ? "true" : "false");

    const res = await savePledgeSettingsAction(formData);
    setIsSaving(false);

    if (res.success) {
      toast.success(res.message);
      fetchPledge();
    } else {
      toast.error(res.error || "Gagal menyimpan setelan.");
    }
  };

  const handleTopup = async () => {
    if (topupAmount < 20000) {
      toast.error("Nominal top-up minimal Rp 20.000");
      return;
    }

    setIsTopupLoading(true);
    const res = await topupPledgeBalanceAction(topupAmount);
    setIsTopupLoading(false);

    if (res.success) {
      toast.success(res.message);
      setTopupDialogOpen(false);
      fetchPledge();
    } else {
      toast.error(res.error || "Gagal melakukan top-up.");
    }
  };

  const balance = pledge?.balance || 0;
  const estimatedDays = dailyAmount > 0 ? Math.floor(balance / dailyAmount) : 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Sunrise className="h-5 w-5" />
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground">
              Komitmen Sedekah Subuh Rutin
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Kelola saldo amanah dan preferensi sedekah otomatis Anda setiap waktu fajar.
          </p>
        </div>

        <Dialog open={topupDialogOpen} onOpenChange={setTopupDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 h-10 shadow-sm">
              <PlusCircle className="h-4 w-4" />
              Isi / Tambah Saldo Komitmen
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading text-lg font-bold">
                Isi Saldo Titipan Sedekah Subuh
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-xs text-muted-foreground">
                Pilih paket saldo komitmen untuk penyaluran otomatis fajar Anda:
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: "Paket 10 Hari", amount: 100000 },
                  { label: "Paket 15 Hari", amount: 150000 },
                  { label: "Paket 30 Hari", amount: 300000 },
                  { label: "Paket Berkah 500rb", amount: 500000 },
                ].map((item) => (
                  <button
                    key={item.amount}
                    type="button"
                    onClick={() => setTopupAmount(item.amount)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      topupAmount === item.amount 
                        ? "border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500/20"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span className="block text-[11px] text-muted-foreground">{item.label}</span>
                    <span className="text-sm font-extrabold">{formatRupiah(item.amount)}</span>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Atau Ketik Nominal Bebas (Rp)
                </label>
                <Input
                  type="number"
                  min="20000"
                  step="10000"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(Number(e.target.value))}
                  className="h-10 font-mono font-bold"
                />
              </div>

              <Button
                onClick={handleTopup}
                disabled={isTopupLoading || topupAmount < 20000}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 text-sm shadow-md"
              >
                {isTopupLoading ? "Memproses Alokasi..." : `Top-Up ${formatRupiah(topupAmount)}`}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-white border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Saldo Amanah Tersedia</span>
            <Wallet className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="font-heading font-extrabold text-2xl text-foreground">
            {formatRupiah(balance)}
          </div>
          <span className="text-[11px] text-slate-500 block">
            Cukup untuk ± <b className="text-emerald-700">{estimatedDays} hari</b> ke depan
          </span>
        </Card>

        <Card className="p-5 bg-white border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Target Sedekah Harian</span>
            <Coins className="h-4 w-4 text-amber-500" />
          </div>
          <div className="font-heading font-extrabold text-2xl text-foreground">
            {formatRupiah(dailyAmount)}
          </div>
          <span className="text-[11px] text-slate-500 block">
            Dipotong tiap Subuh (pukul 04:30 WIB)
          </span>
        </Card>

        <Card className="p-5 bg-white border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Total Hari Bersedekah</span>
            <Calendar className="h-4 w-4 text-sky-600" />
          </div>
          <div className="font-heading font-extrabold text-2xl text-foreground">
            {pledge?.total_days_donated || 0} <span className="text-sm font-medium text-slate-500">Hari</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold block">
            Istiqomah Berkelanjutan ✨
          </span>
        </Card>

        <Card className="p-5 bg-white border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Status Penyaluran</span>
            <Power className="h-4 w-4 text-slate-500" />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <span className={`inline-block h-3 w-3 rounded-full ${isActive && balance >= dailyAmount ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
            <span className="font-bold text-sm text-foreground">
              {!isActive ? "Dijeda Sementara" : balance < dailyAmount ? "Saldo Menipis" : "Aktif Tiap Subuh"}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block">
            {isActive && balance >= dailyAmount ? "Siap disalurkan esok fajar" : "Isi saldo agar aktif kembali"}
          </span>
        </Card>
      </div>

      {/* Main Configuration & History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Configuration Form */}
        <div className="lg:col-span-7">
          <Card className="p-6 bg-white border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-heading font-bold text-base text-foreground">
                  Pengaturan Penyaluran Subuh
                </h3>
                <p className="text-xs text-muted-foreground">
                  Sesuaikan nominal, doa fajar, dan preferensi penerima manfaat.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600">Status:</span>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {isActive ? "Aktif" : "Jeda"}
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nominal Sedekah Tiap Subuh (Rp)
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[5000, 10000, 20000, 50000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDailyAmount(amt)}
                      className={`py-2 rounded-lg text-xs font-semibold border ${
                        dailyAmount === amt 
                          ? "bg-emerald-50 border-emerald-600 text-emerald-800" 
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {formatRupiah(amt)}
                    </button>
                  ))}
                </div>
                <Input
                  type="number"
                  min="1000"
                  step="1000"
                  value={dailyAmount}
                  onChange={(e) => setDailyAmount(Number(e.target.value))}
                  className="h-10 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Preferensi Kategori Penyaluran
                </label>
                <select
                  value={preferredCategory}
                  onChange={(e) => setPreferredCategory(e.target.value)}
                  className="w-full h-10 px-3 border rounded-md text-xs bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">Paling Darurat & Kritis (Rekomendasi Sistem)</option>
                  <option value="medis">Bantuan Medis & Pengobatan Pasien</option>
                  <option value="yatim">Santri Yatim & Penghafal Al-Quran</option>
                  <option value="bencana">Tanggap Bencana Alam</option>
                  <option value="dhuafa">Dhuafa & Lansia Sebatang Kara</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Doa / Hajat Khusus Fajar Anda
                </label>
                <textarea
                  rows={3}
                  value={prayerMessage}
                  onChange={(e) => setPrayerMessage(e.target.value)}
                  placeholder="Contoh: Ya Allah, mudahkanlah urusan rezeki dan sembuhkanlah orang tua kami..."
                  className="w-full p-3 border rounded-md text-xs bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  *Doa ini akan otomatis disematkan pada setiap transaksi sedekah subuh Anda.
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSaving}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-10 text-xs"
              >
                {isSaving ? "Menyimpan Perubahan..." : "Simpan Pengaturan Sedekah Subuh"}
              </Button>
            </form>
          </Card>
        </div>

        {/* Right: Timeline / Report Info */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 bg-emerald-950 text-white shadow-md rounded-2xl relative overflow-hidden space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="h-4 w-4" />
              Amanah & Transparansi Fajar
            </div>
            <h4 className="font-heading text-lg font-bold text-emerald-50">
              Notifikasi WhatsApp Otomatis Setiap Jam 04:45 WIB
            </h4>
            <p className="text-xs text-emerald-200 leading-relaxed">
              Begitu dana disalurkan ke pasien darurat, Anda akan menerima pesan WhatsApp berisi kuitansi resmi, foto kampanye yang didukung, dan doa keberkahan pembuka hari.
            </p>
            <div className="p-3 rounded-xl bg-white/10 text-[11px] text-emerald-100 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-300 shrink-0" />
              100% tersalurkan langsung tanpa potongan biaya operasional harian.
            </div>
          </Card>

          {/* Sample History Feed */}
          <Card className="p-5 bg-white border-slate-200 shadow-xs space-y-4">
            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span>Riwayat Penyaluran Terakhir</span>
              <Badge variant="outline" className="text-[10px]">Otomatis</Badge>
            </h4>

            <div className="space-y-3">
              {[
                {
                  date: "Kemarin, 04:32 WIB",
                  campaign: "Bantu Pengobatan Bu Siti, Janda Tunanetra",
                  amount: 10000,
                  status: "Tersalurkan",
                },
                {
                  date: "2 hari lalu, 04:31 WIB",
                  campaign: "Wakaf Al-Quran 500 Santri Yatim Lombok",
                  amount: 10000,
                  status: "Tersalurkan",
                },
                {
                  date: "3 hari lalu, 04:30 WIB",
                  campaign: "Bantuan Operasi Jantung Dek Arka",
                  amount: 10000,
                  status: "Tersalurkan",
                },
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-800 block line-clamp-1">
                      {item.campaign}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.date}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-emerald-700 block">{formatRupiah(item.amount)}</span>
                    <span className="text-[10px] text-emerald-600 font-medium">✓ {item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>

    </div>
  );
}
