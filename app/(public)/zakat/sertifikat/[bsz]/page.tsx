import * as React from "react";
import { getZakatCertificateAction } from "@/app/actions/zakat";
import { formatRupiah, formatDateIndo } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShieldCheck, Printer, ArrowLeft, QrCode } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface CertificatePageProps {
  params: Promise<{ bsz: string }>;
}

export default async function ZakatCertificatePage(props: CertificatePageProps) {
  const params = await props.params;
  const res = await getZakatCertificateAction(params.bsz);

  if (!res.success || !res.certificate) {
    notFound();
  }

  const cert = res.certificate;

  return (
    <div className="min-h-screen bg-slate-100/70 py-12 px-4 print:bg-white print:p-0">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Navigation & Print Action */}
        <div className="flex items-center justify-between print:hidden">
          <Button variant="ghost" size="sm" asChild className="text-slate-600 gap-1.5">
            <Link href="/zakat">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Kalkulator Zakat
            </Link>
          </Button>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 font-semibold"
            >
              <Printer className="h-4 w-4" />
              Cetak Sertifikat BSZ (PDF)
            </Button>
          </div>
        </div>

        {/* Certificate Frame */}
        <Card className="p-8 sm:p-12 bg-white border-2 border-emerald-600/30 shadow-2xl relative overflow-hidden rounded-2xl print:border-none print:shadow-none">
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-0 left-0 w-24 h-24 border-t-8 border-l-8 border-emerald-600/20 rounded-tl-2xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-24 h-24 border-b-8 border-r-8 border-emerald-600/20 rounded-br-2xl pointer-events-none" />

          <div className="text-center space-y-4 border-b border-emerald-100 pb-8">
            <div className="inline-flex items-center gap-2 text-emerald-800 font-extrabold text-sm uppercase tracking-widest bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-200/60">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Yayasan DonasiUmat Indonesia
            </div>
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                BUKTI SETOR ZAKAT (BSZ)
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-mono">
                Nomor Registrasi: <span className="font-bold text-emerald-800">{cert.bszNumber}</span>
              </p>
            </div>
          </div>

          {/* Certificate Body */}
          <div className="py-8 space-y-6 text-sm text-slate-700">
            <p className="text-center italic text-xs text-slate-500">
              "Ambillah zakat dari sebagian harta mereka, dengan zakat itu kamu membersihkan dan menyucikan mereka..." (QS. At-Taubah: 103)
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-[11px] text-muted-foreground block">Nama Muzakki:</span>
                <span className="font-bold text-base text-foreground">{cert.muzakkiName}</span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">Jenis Zakat:</span>
                <span className="font-semibold text-foreground uppercase">{cert.zakatType}</span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">Harta Acuan:</span>
                <span className="font-mono font-medium text-foreground">{formatRupiah(cert.grossAmount)}</span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">Tanggal Transaksi:</span>
                <span className="font-medium text-foreground">{formatDateIndo(cert.paidAt)}</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-center space-y-2">
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
                Jumlah Zakat Yang Disetorkan (2,5%)
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold font-heading text-emerald-900 tracking-tight">
                {formatRupiah(cert.zakatDueAmount)}
              </div>
              <Badge className="bg-emerald-600 text-white hover:bg-emerald-600 gap-1 mt-1 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {cert.status}
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-center text-slate-400">
                  <QrCode className="h-12 w-12 text-slate-800" />
                </div>
                <div className="space-y-0.5 text-[11px] text-muted-foreground">
                  <span className="font-bold text-slate-700 block">Validasi Digital Asli</span>
                  <p>Pindai kode QR untuk memverifikasi keabsahan data di server DonasiUmat.</p>
                </div>
              </div>

              <div className="text-right space-y-1">
                <span className="text-[11px] text-muted-foreground block">Lembaga Amil Penyalur:</span>
                <span className="font-bold text-slate-800 block">Yayasan DonasiUmat Indonesia</span>
                <span className="text-[10px] text-slate-500 block">Unit Pengelola Zakat Terdaftar</span>
              </div>
            </div>
          </div>

          {/* Legal Footnote */}
          <div className="pt-6 border-t border-slate-100 text-[10px] text-slate-500 text-center leading-relaxed">
            *Bukti Setor Zakat (BSZ) ini diterbitkan secara elektronik dan sah sesuai regulasi Undang-Undang No. 23 Tahun 2011 tentang Pengelolaan Zakat serta dapat dipergunakan sebagai lampiran pengurang Penghasilan Kena Pajak (PKP) pada pelaporan SPT Tahunan Pajak.
          </div>
        </Card>
      </div>
    </div>
  );
}
